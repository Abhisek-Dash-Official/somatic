"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import { Loader2, ChevronLeft, ChevronRight, AlertTriangle, Download } from "lucide-react";
import { exportConsultationsToCSV } from "@/lib/exportUtils";

export default function DoctorConsultationsListClient() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        fetchConsultations(page);
    }, [page]);

    const fetchConsultations = async (p: number) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/doctor/consultations?page=${p}&limit=10`);
            const json = await res.json();
            if (res.ok) {
                setData(json.consultations);
                setTotalPages(json.pagination.totalPages);
            } else {
                toast.error("Failed to load history.");
            }
        } catch (e) {
            toast.error("Network error.");
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadCSV = async () => {
        setDownloading(true);
        const toastId = toast.loading("Generating comprehensive CSV report with audit logs...");

        try {
            const res = await fetch(`/api/doctor/consultations/export`);
            const json = await res.json();

            if (res.ok) {
                const cases = json.consultations;
                if (!cases || cases.length === 0) {
                    toast.update(toastId, { render: "No data found to export.", type: "info", isLoading: false, autoClose: 3000 });
                    return;
                }

                exportConsultationsToCSV(cases, "Doctor_Consultations_Report");

                toast.update(toastId, { render: "Report downloaded successfully!", type: "success", isLoading: false, autoClose: 3000 });
            } else {
                toast.update(toastId, { render: "Failed to fetch export data.", type: "error", isLoading: false, autoClose: 3000 });
            }
        } catch (e) {
            toast.update(toastId, { render: "Network error during export.", type: "error", isLoading: false, autoClose: 3000 });
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0B1120] text-slate-300 py-10">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">All Consultations</h1>
                        <p className="text-slate-400">Your complete case history, prioritized by emergency and unresolved status.</p>
                    </div>

                    <button
                        onClick={handleDownloadCSV}
                        disabled={downloading}
                        className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 px-4 py-2.5 rounded-lg font-medium transition disabled:opacity-50"
                    >
                        {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                        Export Comprehensive CSV
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
                ) : (
                    <div className="bg-[#131C31] rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
                        <div className="divide-y divide-slate-800">
                            {data.length === 0 ? (
                                <div className="p-10 text-center text-slate-500">No cases found.</div>
                            ) : (
                                data.map(item => (
                                    <Link href={`/doctor/consultations/${item._id}`} key={item._id} className="block p-6 hover:bg-slate-800/50 transition">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <div className="flex items-center flex-wrap gap-3 mb-2">
                                                    {item.ai_draft?.is_emergency && (
                                                        <span className="flex items-center gap-1 bg-red-500/10 text-red-400 text-xs px-2 py-1 rounded border border-red-500/20 font-bold uppercase tracking-wider">
                                                            <AlertTriangle className="w-3 h-3" /> SOS
                                                        </span>
                                                    )}

                                                    <span className={`px-2 py-1 text-xs font-semibold rounded border ${item.status === 'completed' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                                                        {item.status.replace("_", " ").toUpperCase()}
                                                    </span>

                                                    <span className="text-slate-500 text-xs font-medium bg-slate-800 px-2 py-1 rounded">
                                                        Age: {item.patient_input?.age}
                                                    </span>
                                                    <span className="text-slate-500 text-xs">{new Date(item.created_at).toLocaleDateString()}</span>
                                                </div>
                                                <h3 className="text-slate-200 font-semibold">{item.ai_draft?.chief_complaints?.join(", ") || "No complaints listed"}</h3>
                                            </div>
                                            <span className="text-slate-500 group-hover:text-white transition">&rarr;</span>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>

                        {/* PAGINATION */}
                        <div className="p-4 border-t border-slate-800 flex justify-between items-center bg-[#0d1425]">
                            <button disabled={page === 1} onClick={() => setPage(page - 1)} className="flex items-center gap-1 px-4 py-2 bg-slate-800 text-sm rounded-lg hover:bg-slate-700 disabled:opacity-30">
                                <ChevronLeft className="w-4 h-4" /> Prev
                            </button>
                            <span className="text-sm text-slate-400">Page {page} of {totalPages || 1}</span>
                            <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="flex items-center gap-1 px-4 py-2 bg-slate-800 text-sm rounded-lg hover:bg-slate-700 disabled:opacity-30">
                                Next <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}