"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUserStore } from "@/store/useUserStore";
import {
    Building2, Users, Stethoscope, AlertTriangle,
    Activity, Clock, BrainCircuit,
    Ticket, ShieldCheck, Loader2, List, ArrowRight
} from "lucide-react";
import LogDetailsModal from "@/components/admin/LogDetailsModal";

interface RecentLog {
    _id: string;
    timestamp: string;
    action_type: string;
    actor_role: string;
    actor_id?: { _id: string; username: string };
    details?: any;
    target_id?: string;
}

interface DashboardData {
    departments: {
        total: number;
        active: number;
        resolutionTimes: { _id: string; name: string; avgTimeSec: number }[];
    };
    users: {
        patients: number;
        admins: number;
        doctors: number;
        activeDoctors: number;
    };
    consultations: {
        pendingReview: number;
        underReview: number;
        resolved: number;
        unresolvedEmergency: number;
    };
    feedbacks: {
        total: number;
        pending: number;
        resolved: number;
    };
    ai: {
        avgPromptTokens: number;
        avgCompletionTokens: number;
        avgResponseTime: number;
    };
    recentLogs: RecentLog[];
}

export default function AdminDashboardPage() {
    const { user } = useUserStore();
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [selectedLog, setSelectedLog] = useState<RecentLog | null>(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const res = await fetch("/api/admin/dashboard");
                if (!res.ok) throw new Error("Failed to fetch metrics");
                const json = await res.json();
                setData(json);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center text-red-400">
                <AlertTriangle className="mr-2 h-6 w-6" /> {error || "Data load failed"}
            </div>
        );
    }

    return (
        <div className="space-y-6 sm:space-y-8 p-4 pt-20 sm:p-6 sm:pt-24 lg:p-8 lg:pt-8 w-full max-w-7xl mx-auto text-slate-200">

            {/* Header */}
            <div className="flex flex-col xl:flex-row items-start xl:items-center gap-6">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10 border border-blue-500/30 overflow-hidden shadow-inner">
                    <img
                        src={`/avatars/avatar-${user?.avatar_id || "admin"}.png`}
                        alt="Admin Avatar"
                        className="h-full w-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = "/avatars/avatar-admin.png"; }}
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                        Welcome, <span className="text-blue-400 capitalize">{user?.username || "Admin"}</span>
                    </h1>
                    <p className="text-sm sm:text-base text-slate-400">Real-time metrics and clinical workflow analytics.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-4 gap-4 sm:gap-6">

                {/* Consultations Card */}
                <div className="bg-[#131C31] border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20 shrink-0">
                            <Activity className="h-5 w-5 text-blue-400" />
                        </div>
                        <h2 className="font-semibold text-slate-100 text-sm sm:text-base">Consultations</h2>
                    </div>
                    <div className="space-y-3 text-xs sm:text-sm">
                        <div className="flex justify-between items-center gap-2">
                            <span className="text-slate-400">Pending Review</span>
                            <span className="font-mono text-white shrink-0">{data.consultations.pendingReview}</span>
                        </div>
                        <div className="flex justify-between items-center gap-2">
                            <span className="text-slate-400">Under Review</span>
                            <span className="font-mono text-white shrink-0">{data.consultations.underReview}</span>
                        </div>
                        <div className="flex justify-between items-center gap-2">
                            <span className="text-slate-400">Resolved</span>
                            <span className="font-mono text-green-400 shrink-0">{data.consultations.resolved}</span>
                        </div>
                        <div className="flex justify-between items-center gap-2 pt-2 border-t border-slate-800">
                            <span className="text-red-400 flex items-center gap-1"><AlertTriangle className="h-3 w-3 shrink-0" /> SOS Pending</span>
                            <span className="font-mono text-red-400 font-bold shrink-0">{data.consultations.unresolvedEmergency}</span>
                        </div>
                    </div>
                </div>

                {/* Users Card */}
                <div className="bg-[#131C31] border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-teal-500/10 rounded-lg border border-teal-500/20 shrink-0">
                            <Users className="h-5 w-5 text-teal-400" />
                        </div>
                        <h2 className="font-semibold text-slate-100 text-sm sm:text-base">Users Network</h2>
                    </div>
                    <div className="space-y-3 text-xs sm:text-sm">
                        <div className="flex justify-between items-center gap-2">
                            <span className="text-slate-400">Total Patients</span>
                            <span className="font-mono text-white shrink-0">{data.users.patients}</span>
                        </div>
                        <div className="flex justify-between items-center gap-2">
                            <span className="text-slate-400">Total Doctors</span>
                            <span className="font-mono text-white shrink-0">{data.users.doctors}</span>
                        </div>
                        <div className="flex justify-between items-center gap-2">
                            <span className="text-slate-400">Active Doctors</span>
                            <span className="font-mono text-teal-400 shrink-0">{data.users.activeDoctors}</span>
                        </div>
                        <div className="flex justify-between items-center gap-2 pt-2 border-t border-slate-800">
                            <span className="text-slate-400 flex items-center gap-1"><ShieldCheck className="h-3 w-3 shrink-0" /> System Admins</span>
                            <span className="font-mono text-white shrink-0">{data.users.admins}</span>
                        </div>
                    </div>
                </div>

                {/* AI Metrics Card */}
                <div className="bg-[#131C31] border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20 shrink-0">
                            <BrainCircuit className="h-5 w-5 text-purple-400" />
                        </div>
                        <h2 className="font-semibold text-slate-100 text-sm sm:text-base">AI Engine</h2>
                    </div>
                    <div className="space-y-3 text-xs sm:text-sm">
                        <div className="flex justify-between items-center gap-2">
                            <span className="text-slate-400 whitespace-normal">Avg Prompt Tokens</span>
                            <span className="font-mono text-white shrink-0">{Math.round(data.ai.avgPromptTokens).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center gap-2">
                            <span className="text-slate-400 whitespace-normal">Avg Completion Tokens</span>
                            <span className="font-mono text-white shrink-0">{Math.round(data.ai.avgCompletionTokens).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center gap-2 pt-2 border-t border-slate-800">
                            <span className="text-slate-400 flex items-center gap-1"><Clock className="h-3 w-3 shrink-0" /> Response Time</span>
                            <span className="font-mono text-purple-400 shrink-0">{data.ai.avgResponseTime.toFixed(2)}s</span>
                        </div>
                    </div>
                </div>

                {/* Departments & Tickets  */}
                <div className="flex flex-col gap-4 sm:gap-6">
                    <div className="bg-[#131C31] border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg flex-1 flex flex-col justify-center min-w-0">
                        <div className="flex flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20 shrink-0">
                                    <Building2 className="h-4 w-4 text-emerald-400" />
                                </div>
                                <span className="font-semibold text-slate-100 text-sm">Departments</span>
                            </div>
                            <div className="text-right shrink-0 flex items-baseline gap-1">
                                <span className="text-xl sm:text-2xl font-bold font-mono text-white">{data.departments.active}</span>
                                <span className="text-xs text-slate-500">/ {data.departments.total} Active</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#131C31] border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg flex-1 flex flex-col justify-center min-w-0">
                        <div className="flex items-center justify-between mb-1 gap-2">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="p-2 bg-orange-500/10 rounded-lg border border-orange-500/20 shrink-0">
                                    <Ticket className="h-4 w-4 text-orange-400" />
                                </div>
                                <span className="font-semibold text-slate-100 text-sm">Tickets</span>
                            </div>
                            <span className="text-xl sm:text-2xl font-bold font-mono text-white shrink-0">{data.feedbacks.total}</span>
                        </div>
                        <div className="flex justify-between text-xs mt-1 text-slate-400 gap-2">
                            <span>Pending: <span className="text-orange-400 font-mono ml-1">{data.feedbacks.pending}</span></span>
                            <span className="text-right">Resolved: <span className="text-green-400 font-mono ml-1">{data.feedbacks.resolved}</span></span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 mt-4 sm:mt-8">

                {/* Department Resolution Times Table */}
                <div className="bg-[#131C31] border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-lg flex-1 min-w-0 flex flex-col">
                    <h2 className="text-base sm:text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Stethoscope className="h-5 w-5 text-blue-400" />
                        Department Analytics
                    </h2>

                    {data.departments.resolutionTimes.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center min-h-50">
                            <p className="text-slate-500 text-sm text-center py-6 w-full border border-dashed border-slate-700 rounded-xl">
                                No completed consultations available.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-800 text-slate-400 text-xs sm:text-sm">
                                        <th className="pb-3 font-medium pl-2 sm:pl-4 whitespace-nowrap">Department Name</th>
                                        <th className="pb-3 font-medium text-right pr-2 sm:pr-4 whitespace-nowrap">Avg. Resolution Time</th>
                                    </tr>
                                </thead>
                                <tbody className="text-xs sm:text-sm">
                                    {data.departments.resolutionTimes.map((dept) => {
                                        const minutes = Math.floor(dept.avgTimeSec / 60);
                                        const seconds = Math.floor(dept.avgTimeSec % 60);
                                        const timeString = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

                                        return (
                                            <tr key={dept._id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                                                <td className="py-3 sm:py-4 pl-2 sm:pl-4 text-slate-200 capitalize">{dept.name}</td>
                                                <td className="py-3 sm:py-4 pr-2 sm:pr-4 text-right font-mono text-blue-400">
                                                    {timeString}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Recent System Logs */}
                <div className="bg-[#131C31] border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-lg flex-1 min-w-0 flex flex-col">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2 sm:gap-4">
                        <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 truncate">
                            <List className="h-5 w-5 text-teal-400 shrink-0" />
                            Recent Activity
                        </h2>
                        <Link
                            href="/admin/logs"
                            className="text-xs sm:text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors w-fit"
                        >
                            View All <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>

                    {data.recentLogs.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center min-h-50">
                            <p className="text-slate-500 text-sm text-center py-6 w-full border border-dashed border-slate-700 rounded-xl">
                                No system logs found.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {data.recentLogs.map((log) => {
                                const logDate = new Date(log.timestamp);

                                return (
                                    <div
                                        key={log._id}
                                        onClick={() => setSelectedLog(log)}
                                        className="flex flex-col gap-1 border border-slate-800/50 bg-slate-800/20 p-3 rounded-lg hover:bg-slate-700/30 cursor-pointer transition-colors"
                                    >
                                        <div className="flex justify-between items-start gap-2">
                                            <span className="text-xs sm:text-sm font-semibold text-slate-200 truncate pr-2">
                                                {log.action_type.replace(/_/g, " ")}
                                            </span>
                                            <span className="text-[10px] sm:text-xs text-slate-500 font-mono whitespace-nowrap shrink-0">
                                                {logDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] sm:text-xs text-slate-400">
                                            <span className={`px-1.5 sm:px-2 py-0.5 rounded-md border capitalize shrink-0 ${log.actor_role === 'admin' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                log.actor_role === 'doctor' ? 'bg-teal-500/10 text-teal-400 border-teal-500/20' :
                                                    'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                                }`}>
                                                {log.actor_role}
                                            </span>
                                            <span className="truncate">
                                                {log.actor_id?.username || "System"}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            <LogDetailsModal
                isOpen={!!selectedLog}
                onClose={() => setSelectedLog(null)}
                log={selectedLog}
            />
        </div>
    );
}