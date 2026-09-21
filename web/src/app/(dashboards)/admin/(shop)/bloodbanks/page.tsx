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
        <div className="p-6 max-w-7xl mx-auto space-y-6">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Blood Banks Management</h1>
                    <p className="text-sm text-slate-400 mt-0.5">Manage regional blood banks and emergency stock levels</p>
                </div>
                <button
                    type="button"
                    onClick={() => openFormModal()}
                    className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all shadow-lg shadow-rose-600/20 active:scale-95"
                >
                    <Plus className="w-4 h-4" /> Add Blood Bank
                </button>
            </div>

            {/* Filter Toolbar */}
            <div className="bg-slate-900/60 border border-slate-800/80 p-3.5 rounded-2xl backdrop-blur-xl shadow-xl flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search by name, license..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-slate-950/80 border border-slate-800/80 text-slate-200 placeholder:text-slate-500 pl-10 pr-4 py-2 rounded-xl text-sm focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all"
                    />
                </div>

                <input
                    type="text"
                    placeholder="Filter by city..."
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="bg-slate-950/80 border border-slate-800/80 text-slate-200 px-3.5 py-2 rounded-xl text-sm focus:outline-none focus:border-rose-500 transition-all"
                />

                <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="bg-slate-950/80 border border-slate-800/80 text-slate-200 px-3.5 py-2 rounded-xl text-sm focus:outline-none focus:border-rose-500 transition-all"
                >
                    {BLOOD_GROUPS.map((bg) => (
                        <option key={bg} value={bg} className="bg-slate-900 text-slate-200">
                            {bg === "all" ? "All Blood Groups" : bg}
                        </option>
                    ))}
                </select>

                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="bg-slate-950/80 border border-slate-800/80 text-slate-200 px-3.5 py-2 rounded-xl text-sm focus:outline-none focus:border-rose-500 transition-all"
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
                        <Loader2 className="w-5 h-5 animate-spin text-rose-500" /> Loading blood banks...
                    </div>
                ) : bloodBanks.length === 0 ? (
                    <div className="p-16 text-center text-slate-500 text-sm">No blood banks found.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-300">
                            <thead className="bg-slate-950/60 border-b border-slate-800/80 text-slate-400 font-semibold text-xs uppercase tracking-wider">
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
                            <tbody className="divide-y divide-slate-800/50">
                                {bloodBanks.map((bank) => {
                                    const hasImages = bank.images && bank.images.length > 0;
                                    const firstImg = hasImages ? bank.images[0] : null;
                                    const isImgFailed = firstImg ? failedImages[`${bank._id}-0`] : true;

                                    return (
                                        <tr key={bank._id} className="hover:bg-slate-800/30 transition-colors">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        onClick={() => {
                                                            if (hasImages) {
                                                                setLightboxImages(bank.images);
                                                                setLightboxIndex(0);
                                                            }
                                                        }}
                                                        className={`relative w-10 h-10 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center shrink-0 ${hasImages ? "cursor-pointer hover:border-slate-600" : ""
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
                                                                    setFailedImages((prev) => ({ ...prev, [`${bank._id}-0`]: true }))
                                                                }
                                                            />
                                                        ) : (
                                                            <Building2 className="w-5 h-5 text-slate-600" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-slate-100">{bank.name}</div>
                                                        {bank.hospital_affiliation && (
                                                            <div className="text-xs text-slate-400 mt-0.5">{bank.hospital_affiliation}</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="p-4 text-slate-300 font-mono text-xs">{bank.license_no}</td>

                                            <td className="p-4">
                                                <div className="text-slate-200">{bank.address?.city}, {bank.address?.state}</div>
                                                <div className="text-xs text-slate-500">{bank.address?.pincode}</div>
                                            </td>

                                            <td className="p-4">
                                                <div className="text-slate-200">{bank.contact_no}</div>
                                                {bank.email && <div className="text-xs text-slate-500">{bank.email}</div>}
                                            </td>

                                            <td className="p-4">
                                                {bank.is_delivery_available ? (
                                                    <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                        Available
                                                    </span>
                                                ) : (
                                                    <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700/50">
                                                        No
                                                    </span>
                                                )}
                                            </td>

                                            <td className="p-4">
                                                {bank.is_active ? (
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
                                                        onClick={() => openFormModal(bank)}
                                                        className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-all"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(bank._id)}
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