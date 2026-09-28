"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Plus, Search, Edit, Trash2, ChevronLeft, ChevronRight, Loader2, Building2 } from "lucide-react";
import BloodBankLightbox from "@/components/shop/bloodbanks/BloodBankLightbox";
import BloodBankFormModal from "@/components/shop/bloodbanks/BloodBankFormModal";

const BLOOD_GROUPS = ["all", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function AdminBloodBanksPage() {
    const [bloodBanks, setBloodBanks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [city, setCity] = useState("");
    const [bloodGroup, setBloodGroup] = useState("all");
    const [status, setStatus] = useState("all");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 10;

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingBank, setEditingBank] = useState<any | null>(null);

    const [lightboxImages, setLightboxImages] = useState<string[]>([]);
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

    const fetchBloodBanks = useCallback(async () => {
        setLoading(true);

        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                ...(search && { search }),
                ...(city && { city }),
                ...(bloodGroup !== "all" && { bloodGroup }),
                ...(status !== "all" && { status }),
            });

            const res = await fetch(`/api/admin/shop/bloodbanks?${params.toString()}`);
            const json = await res.json();

            if (json.success) {
                setBloodBanks(json.data);
                setTotalPages(json.pagination.totalPages || 1);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [page, search, city, bloodGroup, status]);

    useEffect(() => {
        fetchBloodBanks();
    }, [fetchBloodBanks]);

    const openFormModal = (bank: any | null = null) => {
        setEditingBank(bank);
        setIsFormOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Deactivate this blood bank?")) return;

        try {
            const res = await fetch(`/api/admin/shop/bloodbanks/${id}`, { method: "DELETE" });
            const json = await res.json();

            if (json.success) fetchBloodBanks();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6">
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        Blood Banks Management
                    </h1>
                    <p className="mt-0.5 text-sm text-muted">
                        Manage regional blood banks and emergency stock levels
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => openFormModal()}
                    className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary-hover active:scale-[0.98]"
                >
                    <Plus className="h-4 w-4" />
                    Add Blood Bank
                </button>
            </div>

            <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-3.5 md:flex-row">
                <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search by name, license..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full rounded-lg border border-border bg-background py-2 pl-10 pr-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary/20"
                    />
                </div>

                <input
                    type="text"
                    placeholder="Filter by city..."
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="rounded-lg border border-border bg-background px-3.5 py-2 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary/20"
                />

                <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="rounded-lg border border-border bg-background px-3.5 py-2 text-sm text-foreground outline-none transition focus:border-primary focus:ring-1 focus:ring-primary/20"
                >
                    {BLOOD_GROUPS.map((bg) => (
                        <option key={bg} value={bg} className="bg-surface text-foreground">
                            {bg === "all" ? "All Blood Groups" : bg}
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
                        Loading blood banks...
                    </div>
                ) : bloodBanks.length === 0 ? (
                    <div className="p-16 text-center text-sm text-muted">
                        No blood banks found.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-muted">
                            <thead className="border-b border-border bg-surface-secondary text-xs font-semibold uppercase tracking-wider text-muted">
                                <tr>
                                    <th className="p-4">Facility</th>
                                    <th className="p-4">License</th>
                                    <th className="p-4">Location</th>
                                    <th className="p-4">Contact</th>
                                    <th className="p-4">Delivery</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-border">
                                {bloodBanks.map((bank) => {
                                    const hasImages = bank.images && bank.images.length > 0;
                                    const firstImg = hasImages ? bank.images[0] : null;
                                    const isImgFailed = firstImg ? failedImages[`${bank._id}-0`] : true;

                                    return (
                                        <tr key={bank._id} className="transition-colors hover:bg-surface-secondary">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        onClick={() => {
                                                            if (hasImages) {
                                                                setLightboxImages(bank.images);
                                                                setLightboxIndex(0);
                                                            }
                                                        }}
                                                        className={`relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-background ${hasImages ? "cursor-pointer hover:border-primary/50" : ""
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
                                                                        [`${bank._id}-0`]: true,
                                                                    }))
                                                                }
                                                            />
                                                        ) : (
                                                            <Building2 className="h-5 w-5 text-muted-foreground" />
                                                        )}
                                                    </div>

                                                    <div>
                                                        <div className="font-semibold text-foreground">
                                                            {bank.name}
                                                        </div>
                                                        {bank.hospital_affiliation && (
                                                            <div className="mt-0.5 text-xs text-muted">
                                                                {bank.hospital_affiliation}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="p-4 font-mono text-xs text-muted">
                                                {bank.license_no}
                                            </td>

                                            <td className="p-4">
                                                <div className="text-foreground">
                                                    {bank.address?.city}, {bank.address?.state}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {bank.address?.pincode}
                                                </div>
                                            </td>

                                            <td className="p-4">
                                                <div className="text-foreground">{bank.contact_no}</div>
                                                {bank.email && (
                                                    <div className="text-xs text-muted-foreground">
                                                        {bank.email}
                                                    </div>
                                                )}
                                            </td>

                                            <td className="p-4">
                                                {bank.is_delivery_available ? (
                                                    <span className="rounded-lg border border-success/20 bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
                                                        Available
                                                    </span>
                                                ) : (
                                                    <span className="rounded-lg border border-border bg-surface-secondary px-2.5 py-1 text-xs font-medium text-muted">
                                                        No
                                                    </span>
                                                )}
                                            </td>

                                            <td className="p-4">
                                                {bank.is_active ? (
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
                                                        onClick={() => openFormModal(bank)}
                                                        className="rounded-lg p-2 text-muted transition hover:bg-accent hover:text-primary"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(bank._id)}
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
                <BloodBankLightbox
                    images={lightboxImages}
                    currentIndex={lightboxIndex}
                    onClose={() => setLightboxIndex(null)}
                    onChangeIndex={setLightboxIndex}
                />
            )}

            {isFormOpen && (
                <BloodBankFormModal
                    editingBank={editingBank}
                    onClose={() => setIsFormOpen(false)}
                    onSuccess={() => {
                        setIsFormOpen(false);
                        fetchBloodBanks();
                    }}
                />
            )}
        </div>
    );
}