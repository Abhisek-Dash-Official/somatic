"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Clock, CheckCircle, FileText, AlertTriangle, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

export default function ConsultationsClient({
    consultations,
    pagination,
    activeTab,
    counts
}: {
    consultations: any[],
    pagination: { total: number; page: number; limit: number; totalPages: number },
    activeTab: "completed" | "pending",
    counts: { completed: number; pending: number }
}) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleTabChange = (tab: "completed" | "pending") => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("tab", tab);
        params.set("page", "1");
        router.push(`?${params.toString()}`);
    };

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", newPage.toString());
        router.push(`?${params.toString()}`);
    };

    return (
        <div className="max-w-5xl mx-auto p-6 mt-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-100">My Consultations</h1>
                    <p className="text-slate-400 mt-1">Review your AI drafts and doctor prescriptions.</p>
                </div>
                <Link href="/patient/consultations/new" className="flex items-center gap-2 bg-blue-600/90 hover:bg-blue-500 text-slate-100 px-5 py-2.5 rounded-lg font-medium transition shadow-lg shadow-blue-900/20">
                    <Plus className="w-5 h-5" /> New Consultation
                </Link>
            </div>

            {/* TABS */}
            <div className="flex gap-4 border-b border-slate-700/50 mb-6">
                <button
                    onClick={() => handleTabChange("completed")}
                    className={`pb-3 px-2 font-medium transition-colors border-b-2 flex items-center gap-2 ${activeTab === "completed" ? "border-blue-500 text-blue-400" : "border-transparent text-slate-400 hover:text-slate-300"}`}
                >
                    <CheckCircle className="w-4 h-4" /> Completed ({counts.completed})
                </button>
                <button
                    onClick={() => handleTabChange("pending")}
                    className={`pb-3 px-2 font-medium transition-colors border-b-2 flex items-center gap-2 ${activeTab === "pending" ? "border-blue-500 text-blue-400" : "border-transparent text-slate-400 hover:text-slate-300"}`}
                >
                    <Clock className="w-4 h-4" /> Pending / In Review ({counts.pending})
                </button>
            </div>

            {/* LIST */}
            {consultations.length === 0 ? (
                <div className="bg-[#131C31] rounded-xl border border-slate-800 p-12 text-center shadow-lg flex flex-col items-center">
                    <FileText className="w-12 h-12 text-slate-600 mb-4" />
                    <h3 className="text-lg font-medium text-slate-200 mb-2">No {activeTab} consultations</h3>
                    <p className="text-slate-400">You do not have any {activeTab} records at the moment.</p>
                </div>
            ) : (
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {consultations.map((consultation: any) => (
                        <Link
                            key={consultation._id}
                            href={`/patient/consultations/${consultation._id}`}
                            className="block group"
                        >
                            <div className="bg-[#131C31] p-5 rounded-xl border border-slate-700/50 shadow-md relative overflow-hidden h-full flex flex-col justify-between hover:border-slate-500 transition-all">
                                {consultation.is_emergency && <div className="absolute top-0 left-0 w-1 h-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.6)]"></div>}

                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border capitalize ${consultation.status === "completed" ? "bg-green-500/10 text-green-400 border-green-500/20" :
                                                consultation.status === "in_review" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                                                    "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                                            }`}>
                                            {consultation.status.replace("_", " ")}
                                        </span>
                                        <span className="text-xs text-slate-500">
                                            {new Date(consultation.created_at).toISOString().split('T')[0].split('-').reverse().join('/')}
                                        </span>
                                    </div>
                                    <h3 className="font-semibold mb-2 line-clamp-1 flex items-center gap-2 text-slate-200 group-hover:text-blue-400 transition-colors">
                                        {consultation.is_emergency && <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />}
                                        {consultation.chief_complaints?.join(", ") || "General Symptoms"}
                                    </h3>
                                </div>

                                <div className="mt-4 pt-4 border-t border-slate-700/50 flex justify-between items-center text-sm">
                                    <span className={consultation.status === "completed" ? "text-green-400" : "text-blue-400"}>
                                        {consultation.status === "completed" ? "View Prescription" : "View Details"}
                                    </span>
                                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 group-hover:text-blue-400 transition-all" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {/* PAGINATION CONTROLS */}
            {pagination.totalPages > 1 && (
                <div className="mt-8 p-4 bg-[#131C31] rounded-xl border border-slate-800 flex justify-between items-center">
                    <button
                        disabled={pagination.page <= 1}
                        onClick={() => handlePageChange(pagination.page - 1)}
                        className="flex items-center gap-1 px-4 py-2 bg-slate-800 text-sm font-medium rounded-lg hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition"
                    >
                        <ChevronLeft className="w-4 h-4" /> Previous
                    </button>

                    <span className="text-sm text-slate-400">
                        Page <strong className="text-white">{pagination.page}</strong> of <strong className="text-white">{pagination.totalPages}</strong>
                    </span>

                    <button
                        disabled={pagination.page >= pagination.totalPages}
                        onClick={() => handlePageChange(pagination.page + 1)}
                        className="flex items-center gap-1 px-4 py-2 bg-slate-800 text-sm font-medium rounded-lg hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition"
                    >
                        Next <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
}