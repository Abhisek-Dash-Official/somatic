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
        <div className="p-6 max-w-7xl mx-auto space-y-6">

            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Medicines Management</h1>
                    <p className="text-sm text-slate-400 mt-0.5">Manage stock inventory, pricing, and prescriptions</p>
                </div>
                <button
                    type="button"
                    onClick={() => openFormModal()}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                >
                    <Plus className="w-4 h-4" /> Add New Medicine
                </button>
            </div>

            {/* Filter Toolbar */}
            <div className="bg-slate-900/60 border border-slate-800/80 p-3.5 rounded-2xl backdrop-blur-xl shadow-xl flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search by name, brand, SKU..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-slate-950/80 border border-slate-800/80 text-slate-200 placeholder:text-slate-500 pl-10 pr-4 py-2 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                </div>

                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="bg-slate-950/80 border border-slate-800/80 text-slate-200 px-3.5 py-2 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-all capitalize"
                >
                    {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat} className="bg-slate-900 text-slate-200 capitalize">
                            {cat === "all" ? "All Categories" : cat.replace("-", " ")}
                        </option>
                    ))}
                </select>

                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="bg-slate-950/80 border border-slate-800/80 text-slate-200 px-3.5 py-2 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-all"
                >
                    <option value="all" className="bg-slate-900 text-slate-200">All Status</option>
                    <option value="active" className="bg-slate-900 text-slate-200">Active</option>
                    <option value="inactive" className="bg-slate-900 text-slate-200">Inactive</option>
                </select>
            </div>

            {/* Table Container */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl shadow-xl backdrop-blur-xl overflow-hidden">
                {loading ? (
                    <div className="p-16 text-center text-slate-400 flex justify-center items-center gap-3">
                        <Loader2 className="w-5 h-5 animate-spin text-blue-500" /> Loading medicines...
                    </div>
                ) : medicines.length === 0 ? (
                    <div className="p-16 text-center text-slate-500 text-sm">No medicine items found.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-300">
                            <thead className="bg-slate-950/60 border-b border-slate-800/80 text-slate-400 font-semibold text-xs uppercase tracking-wider">
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
                            <tbody className="divide-y divide-slate-800/50">
                                {medicines.map((med) => {
                                    const hasImages = med.images && med.images.length > 0;
                                    const firstImg = hasImages ? med.images[0] : null;
                                    const isImgFailed = firstImg ? failedImages[`${med._id}-0`] : true;

                                    return (
                                        <tr key={med._id} className="hover:bg-slate-800/30 transition-colors">
                                            <td className="p-4">
                                                <div
                                                    onClick={() => {
                                                        if (hasImages) {
                                                            setLightboxImages(med.images);
                                                            setLightboxIndex(0);
                                                        }
                                                    }}
                                                    className={`relative w-11 h-11 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center ${hasImages ? "cursor-pointer hover:border-slate-600" : ""
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
                                                                setFailedImages((prev) => ({ ...prev, [`${med._id}-0`]: true }))
                                                            }
                                                        />
                                                    ) : (
                                                        <Pill className="w-5 h-5 text-slate-600" />
                                                    )}
                                                    {hasImages && med.images.length > 1 && (
                                                        <span className="absolute bottom-0 right-0 bg-blue-600 text-white text-[9px] px-1 font-mono rounded-tl">
                                                            +{med.images.length - 1}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="p-4">
                                                <div className="font-semibold text-slate-100">{med.name}</div>
                                                <div className="text-xs text-slate-400 mt-0.5">
                                                    {med.brand} <span className="text-slate-600">|</span> SKU: {med.sku}
                                                </div>
                                            </td>

                                            <td className="p-4 capitalize">
                                                <span className="text-slate-200">{med.category}</span>
                                                <span className="block text-xs text-slate-500 capitalize">{med.dosage_form}</span>
                                            </td>

                                            <td className="p-4">
                                                <div className="font-semibold text-slate-100">₹{med.pricing?.sale_price}</div>
                                                <div className="text-xs text-slate-500 line-through">₹{med.pricing?.mrp}</div>
                                            </td>

                                            <td className="p-4 font-semibold text-slate-200">{med.stock}</td>

                                            <td className="p-4">
                                                {med.requires_prescription ? (
                                                    <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                                        Rx Req.
                                                    </span>
                                                ) : (
                                                    <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700/50">
                                                        OTC
                                                    </span>
                                                )}
                                            </td>

                                            <td className="p-4">
                                                {med.is_active ? (
                                                    <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                                        Inactive
                                                    </span>
                                                )}
                                            </td>

                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => openFormModal(med)}
                                                        className="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition-all"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(med._id)}
                                                        className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
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

                {/* Footer */}
                <div className="p-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 bg-slate-950/40">
                    <span>Page {page} of {totalPages}</span>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            disabled={page <= 1}
                            onClick={() => setPage((p) => p - 1)}
                            className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent text-slate-300 transition-all"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            type="button"
                            disabled={page >= totalPages}
                            onClick={() => setPage((p) => p + 1)}
                            className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent text-slate-300 transition-all"
                        >
                            <ChevronRight className="w-4 h-4" />
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