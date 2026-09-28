"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Plus, Search, Edit, Trash2, ChevronLeft, ChevronRight, Loader2, Pill } from "lucide-react";
import MedicineLightbox from "@/components/shop/medicines/MedicineLightbox";
import MedicineFormModal from "@/components/shop/medicines/MedicineFormModal";

const CATEGORIES = ["all", "prescription", "otc", "first-aid", "supplements", "personal-care", "devices"];

export default function AdminMedicinesPage() {
    const [medicines, setMedicines] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("all");
    const [status, setStatus] = useState("all");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 10;

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingMedicine, setEditingMedicine] = useState<any | null>(null);

    const [lightboxImages, setLightboxImages] = useState<string[]>([]);
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

    const fetchMedicines = useCallback(async () => {
        setLoading(true);

        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                ...(search && { search }),
                ...(category !== "all" && { category }),
                ...(status !== "all" && { status }),
            });

            const res = await fetch(`/api/admin/shop/medicines?${params.toString()}`);
            const json = await res.json();

            if (json.success) {
                setMedicines(json.data);
                setTotalPages(json.pagination.totalPages || 1);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [page, search, category, status]);

    useEffect(() => {
        fetchMedicines();
    }, [fetchMedicines]);

    const openFormModal = (med: any | null = null) => {
        setEditingMedicine(med);
        setIsFormOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Deactivate this medicine?")) return;

        try {
            const res = await fetch(`/api/admin/shop/medicines/${id}`, { method: "DELETE" });
            const json = await res.json();

            if (json.success) fetchMedicines();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6">
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        Medicines Management
                    </h1>
                    <p className="mt-0.5 text-sm text-muted">
                        Manage stock inventory, pricing, and prescriptions
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => openFormModal()}
                    className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary-hover active:scale-[0.98]"
                >
                    <Plus className="h-4 w-4" />
                    Add New Medicine
                </button>
            </div>

            <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-3.5 md:flex-row">
                <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />

                    <input
                        type="text"
                        placeholder="Search by name, brand, SKU..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full rounded-lg border border-border bg-background py-2 pl-10 pr-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary/20"
                    />
                </div>

                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="rounded-lg border border-border bg-background px-3.5 py-2 text-sm text-foreground outline-none transition focus:border-primary focus:ring-1 focus:ring-primary/20"
                >
                    {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat} className="bg-surface text-foreground">
                            {cat === "all" ? "All Categories" : cat.replace("-", " ")}
                        </option>
                    ))}
                </select>

                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="rounded-lg border border-border bg-background px-3.5 py-2 text-sm text-foreground outline-none transition focus:border-primary focus:ring-1 focus:ring-primary/20"
                >
                    <option value="all" className="bg-surface text-foreground">All Status</option>
                    <option value="active" className="bg-surface text-foreground">Active</option>
                    <option value="inactive" className="bg-surface text-foreground">Inactive</option>
                </select>
            </div>

            <div className="overflow-hidden rounded-xl border border-border bg-surface">
                {loading ? (
                    <div className="flex items-center justify-center gap-3 p-16 text-muted">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        Loading medicines...
                    </div>
                ) : medicines.length === 0 ? (
                    <div className="p-16 text-center text-sm text-muted">
                        No medicine items found.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-muted">
                            <thead className="border-b border-border bg-surface-secondary text-xs font-semibold uppercase tracking-wider text-muted">
                                <tr>
                                    <th className="p-4">Image</th>
                                    <th className="p-4">Medicine Info</th>
                                    <th className="p-4">Category</th>
                                    <th className="p-4">Pricing</th>
                                    <th className="p-4">Stock</th>
                                    <th className="p-4">Rx</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-border">
                                {medicines.map((med) => {
                                    const hasImages = med.images && med.images.length > 0;
                                    const firstImg = hasImages ? med.images[0] : null;
                                    const isImgFailed = firstImg ? failedImages[`${med._id}-0`] : true;

                                    return (
                                        <tr key={med._id} className="transition-colors hover:bg-surface-secondary">
                                            <td className="p-4">
                                                <div
                                                    onClick={() => {
                                                        if (hasImages) {
                                                            setLightboxImages(med.images);
                                                            setLightboxIndex(0);
                                                        }
                                                    }}
                                                    className={`relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-lg border border-border bg-background ${hasImages ? "cursor-pointer hover:border-primary/50" : ""
                                                        }`}
                                                >
                                                    {firstImg && !isImgFailed ? (
                                                        <Image
                                                            src={firstImg}
                                                            alt=""
                                                            fill
                                                            className="object-cover"
                                                            unoptimized
                                                            onError={() =>
                                                                setFailedImages((prev) => ({
                                                                    ...prev,
                                                                    [`${med._id}-0`]: true,
                                                                }))
                                                            }
                                                        />
                                                    ) : (
                                                        <Pill className="h-5 w-5 text-muted-foreground" />
                                                    )}

                                                    {hasImages && med.images.length > 1 && (
                                                        <span className="absolute bottom-0 right-0 rounded-tl bg-primary px-1 font-mono text-[9px] text-primary-foreground">
                                                            +{med.images.length - 1}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="p-4">
                                                <div className="font-semibold text-foreground">
                                                    {med.name}
                                                </div>
                                                <div className="mt-0.5 text-xs text-muted">
                                                    {med.brand} <span className="text-muted-foreground">|</span> SKU: {med.sku}
                                                </div>
                                            </td>

                                            <td className="p-4 capitalize">
                                                <span className="text-foreground">{med.category}</span>
                                                <span className="block text-xs capitalize text-muted-foreground">
                                                    {med.dosage_form}
                                                </span>
                                            </td>

                                            <td className="p-4">
                                                <div className="font-semibold text-foreground">
                                                    ₹{med.pricing?.sale_price}
                                                </div>
                                                <div className="text-xs text-muted-foreground line-through">
                                                    ₹{med.pricing?.mrp}
                                                </div>
                                            </td>

                                            <td className="p-4 font-semibold text-foreground">
                                                {med.stock}
                                            </td>

                                            <td className="p-4">
                                                {med.requires_prescription ? (
                                                    <span className="rounded-lg border border-warning/20 bg-warning/10 px-2.5 py-1 text-xs font-medium text-warning">
                                                        Rx Req.
                                                    </span>
                                                ) : (
                                                    <span className="rounded-lg border border-border bg-surface-secondary px-2.5 py-1 text-xs font-medium text-muted">
                                                        OTC
                                                    </span>
                                                )}
                                            </td>

                                            <td className="p-4">
                                                {med.is_active ? (
                                                    <span className="rounded-lg border border-success/20 bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="rounded-lg border border-danger/20 bg-danger/10 px-2.5 py-1 text-xs font-medium text-danger">
                                                        Inactive
                                                    </span>
                                                )}
                                            </td>

                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => openFormModal(med)}
                                                        className="rounded-lg p-2 text-muted transition hover:bg-accent hover:text-primary"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(med._id)}
                                                        className="rounded-lg p-2 text-muted transition hover:bg-danger/10 hover:text-danger"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="flex items-center justify-between border-t border-border bg-surface-secondary p-4 text-xs text-muted">
                    <span>Page {page} of {totalPages}</span>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            disabled={page <= 1}
                            onClick={() => setPage((p) => p - 1)}
                            className="rounded-lg border border-border bg-surface p-1.5 text-foreground transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>

                        <button
                            type="button"
                            disabled={page >= totalPages}
                            onClick={() => setPage((p) => p + 1)}
                            className="rounded-lg border border-border bg-surface p-1.5 text-foreground transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>

            {lightboxIndex !== null && (
                <MedicineLightbox
                    images={lightboxImages}
                    currentIndex={lightboxIndex}
                    onClose={() => setLightboxIndex(null)}
                    onChangeIndex={setLightboxIndex}
                />
            )}

            {isFormOpen && (
                <MedicineFormModal
                    editingMedicine={editingMedicine}
                    onClose={() => setIsFormOpen(false)}
                    onSuccess={() => {
                        setIsFormOpen(false);
                        fetchMedicines();
                    }}
                />
            )}
        </div>
    );
}