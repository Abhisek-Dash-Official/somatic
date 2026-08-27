"use client";

import { useEffect, useState } from "react";
import { useUserStore } from "@/store/useUserStore";
import { toast } from "react-toastify";
import Link from "next/link";
import { Activity, Users, CheckCircle, AlertTriangle, Loader2, Power, Building2 } from "lucide-react";

interface DashboardData {
    stats: { total: number; pending: number; completed: number };
    activeCases: any[];
    isAcceptingCases: boolean;
    departmentName?: string;
}

export default function DoctorDashboardClient() {
    const { user, isFetched, fetchUser } = useUserStore();
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [toggling, setToggling] = useState(false);

    useEffect(() => {
        if (!isFetched) {
            fetchUser();
        }
    }, [isFetched, fetchUser]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const res = await fetch("/api/doctor/dashboard");
                if (res.ok) {
                    const json = await res.json();
                    setData(json);
                } else {
                    toast.error("Failed to load dashboard data");
                }
            } catch (err) {
                toast.error("Network error");
            } finally {
                setLoading(false);
            }
        };

        if (user && user.role === "doctor") {
            fetchDashboardData();
        }
    }, [user]);

    const toggleAvailability = async () => {
        if (!data) return;
        setToggling(true);
        const newStatus = !data.isAcceptingCases;

        try {
            const res = await fetch("/api/users/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ doctor_info: { is_accepting_cases: newStatus } }),
            });

            if (res.ok) {
                setData({ ...data, isAcceptingCases: newStatus });
                toast.success(newStatus ? "You are now accepting new cases." : "You are on break.");
            } else {
                throw new Error("Update failed");
            }
        } catch (err) {
            toast.error("Could not update availability.");
        } finally {
            setToggling(false);
        }
    };

    if (!isFetched || loading) {
        return <div className="flex justify-center items-center py-32"><Loader2 className="w-12 h-12 animate-spin text-blue-500" /></div>;
    }

    if (user?.role !== "doctor") {
        return <div className="text-center py-20 text-red-400 font-bold text-xl">Access Denied. Doctor privileges required.</div>;
    }

    if (!data || !data.stats) {
        return (
            <div className="text-center py-20">
                <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <p className="text-slate-300 font-medium text-lg">Failed to load dashboard data.</p>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in zoom-in duration-500">
            {/* Header with Department Badge */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Welcome, Dr. {user.username}</h1>
                    <div className="flex items-center gap-2 mt-1 text-slate-400">
                        <Building2 className="w-4 h-4 text-blue-400" />
                        <span className="text-sm font-medium text-blue-300">
                            Department: {data.departmentName || "Assigned Medical Department"}
                        </span>
                    </div>
                </div>

                <button
                    onClick={toggleAvailability}
                    disabled={toggling}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all border ${data.isAcceptingCases
                        ? "bg-green-500/10 text-green-400 border-green-500/30 hover:bg-green-500/20"
                        : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700"
                        }`}
                >
                    {toggling ? <Loader2 className="w-5 h-5 animate-spin" /> : <Power className="w-5 h-5" />}
                    {data.isAcceptingCases ? "Accepting Cases" : "Currently On Break"}
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-[#131C31] p-6 rounded-2xl border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.05)]">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-400 text-sm font-medium mb-1">Department Queue</p>
                            <h3 className="text-3xl font-bold text-white">{data.stats.pending || 0}</h3>
                        </div>
                        <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400"><Activity className="w-6 h-6" /></div>
                    </div>
                </div>

                <div className="bg-[#131C31] p-6 rounded-2xl border border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.05)]">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-400 text-sm font-medium mb-1">My Completed Cases</p>
                            <h3 className="text-3xl font-bold text-white">{data.stats.completed || 0}</h3>
                        </div>
                        <div className="p-3 bg-green-500/10 rounded-lg text-green-400"><CheckCircle className="w-6 h-6" /></div>
                    </div>
                </div>

                <div className="bg-[#131C31] p-6 rounded-2xl border border-slate-700">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-400 text-sm font-medium mb-1">Total Handled</p>
                            <h3 className="text-3xl font-bold text-white">{data.stats.total || 0}</h3>
                        </div>
                        <div className="p-3 bg-slate-800 rounded-lg text-slate-400"><Users className="w-6 h-6" /></div>
                    </div>
                </div>
            </div>

            {/* Active Consultations */}
            <div className="bg-[#131C31] rounded-2xl border border-slate-800/80 shadow-xl overflow-hidden">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-[#0d1425]">
                    <h2 className="text-xl font-bold text-white">Action Required Queue</h2>
                    <span className="bg-blue-500/20 text-blue-400 text-xs px-3 py-1 rounded-full font-semibold border border-blue-500/30">
                        {data.activeCases?.length || 0} Pending
                    </span>
                </div>

                <div className="divide-y divide-slate-800">
                    {!data.activeCases || data.activeCases.length === 0 ? (
                        <div className="p-10 text-center text-slate-500">
                            <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>Your queue is empty. Great job!</p>
                        </div>
                    ) : (
                        data.activeCases.map((caseItem) => {
                            const isUnclaimed = caseItem.status === "pending_review";

                            return (
                                <div key={caseItem._id} className="p-6 hover:bg-[#1a2642] transition-colors flex flex-col md:flex-row justify-between items-start md:items-center gap-4 group">
                                    <div>
                                        <div className="flex flex-wrap items-center gap-3 mb-2">
                                            {caseItem.ai_draft?.is_emergency && (
                                                <span className="flex items-center gap-1 bg-red-500/10 text-red-400 text-xs px-2 py-1 rounded border border-red-500/20 font-bold uppercase tracking-wider">
                                                    <AlertTriangle className="w-3 h-3" /> SOS
                                                </span>
                                            )}

                                            <span className={`px-2 py-1 text-xs font-semibold rounded border ${isUnclaimed
                                                ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                                : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                                }`}>
                                                {caseItem.status.replace("_", " ").toUpperCase()}
                                            </span>

                                            <span className="text-slate-500 text-xs font-medium bg-slate-800 px-2 py-1 rounded">
                                                Age: {caseItem.patient_input?.age}
                                            </span>
                                            <span className="text-slate-500 text-xs">
                                                {new Date(caseItem.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <h3 className="text-slate-200 font-semibold group-hover:text-blue-400 transition-colors mt-1">
                                            {caseItem.ai_draft?.chief_complaints?.join(", ") || "Awaiting symptoms..."}
                                        </h3>
                                    </div>

                                    <Link
                                        href={`/doctor/consultations/${caseItem._id}`}
                                        className={`shrink-0 border px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm ${isUnclaimed
                                            ? "bg-blue-600/90 text-white border-blue-500 hover:bg-blue-500 shadow-blue-900/20"
                                            : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white"
                                            }`}
                                    >
                                        {isUnclaimed ? "Claim & Review" : "Continue Review"}
                                    </Link>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}