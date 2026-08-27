"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUserStore } from "@/store/useUserStore";
import { Loader2, PlusCircle, Activity, FileText, Calendar, MessageSquare, AlertCircle, CheckCircle2, Clock, Stethoscope } from "lucide-react";

interface DashboardData {
    consultations: any[];
    feedbacks: any[];
    stats: { total: number; active: number };
    nextFollowUp: string | null;
}

export default function PatientDashboard() {
    const { user, isLoading: userLoading, isFetched } = useUserStore();
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const res = await fetch("/api/patient/dashboard");
                if (res.ok) {
                    const json = await res.json();
                    setData(json);
                }
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        if (isFetched && user) {
            fetchDashboardData();
        }
    }, [isFetched, user]);

    if (userLoading || !isFetched || loading) {
        return (
            <div className="flex h-[60vh] w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

    const StatusBadge = ({ status }: { status: string }) => {
        switch (status) {
            case "pending_review": return <span className="rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-semibold text-yellow-500 border border-yellow-500/20">Pending</span>;
            case "in_review": return <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400 border border-blue-500/20">In Review</span>;
            case "completed": return <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-400 border border-green-500/20">Completed</span>;
            default: return <span className="rounded-full bg-slate-500/10 px-3 py-1 text-xs font-semibold text-slate-400">{status}</span>;
        }
    };

    return (
        <div className="animate-in fade-in zoom-in duration-500 space-y-8 max-w-6xl mx-auto">

            {/* Header & Quick Action */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 rounded-3xl border border-white/10 bg-[#0f172a]/80 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-500/20 text-2xl font-bold text-blue-400 border border-blue-500/20 uppercase">
                        {user?.username?.charAt(0) || "U"}
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Hi, {user?.username}</h1>
                        <p className="mt-1 text-slate-400 flex items-center gap-2">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                            </span>
                            Patient Portal
                        </p>
                    </div>
                </div>

                {/* Main CTA */}
                <Link
                    href="/patient/consultations/new"
                    className="group flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 font-bold text-white shadow-lg transition-all hover:bg-blue-500 hover:shadow-blue-500/25"
                >
                    <PlusCircle className="h-5 w-5 transition-transform group-hover:rotate-90" />
                    New Consultation
                </Link>
            </div>

            {/* Stats & Vitals Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div className="rounded-2xl border border-white/10 bg-[#0f172a]/60 p-6 flex items-center gap-4">
                    <div className="rounded-xl bg-blue-500/10 p-3 text-blue-400"><FileText className="h-6 w-6" /></div>
                    <div><p className="text-sm text-slate-400">Total Cases</p><p className="text-xl font-bold text-white">{data?.stats.total || 0}</p></div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-[#0f172a]/60 p-6 flex items-center gap-4">
                    <div className="rounded-xl bg-yellow-500/10 p-3 text-yellow-500"><Clock className="h-6 w-6" /></div>
                    <div><p className="text-sm text-slate-400">Active Cases</p><p className="text-xl font-bold text-white">{data?.stats.active || 0}</p></div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-[#0f172a]/60 p-6 flex items-center gap-4">
                    <div className="rounded-xl bg-teal-500/10 p-3 text-teal-400"><Calendar className="h-6 w-6" /></div>
                    <div><p className="text-sm text-slate-400">Next Follow-up</p><p className="text-base font-bold text-white">{data?.nextFollowUp ? formatDate(data.nextFollowUp) : "None"}</p></div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-[#0f172a]/60 p-6 flex items-center gap-4">
                    <div className="rounded-xl bg-red-500/10 p-3 text-red-400"><Activity className="h-6 w-6" /></div>
                    <div><p className="text-sm text-slate-400">Blood Group</p><p className="text-xl font-bold text-white">{user?.patient_info?.blood_grp || "N/A"}</p></div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Recent Consultations */}
                <div className="lg:col-span-2 rounded-3xl border border-white/10 bg-[#0f172a]/60 p-6 sm:p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Stethoscope className="h-5 w-5 text-blue-400" /> Recent Consultations
                        </h2>
                        <Link href="/patient/consultations" className="text-sm font-medium text-blue-400 hover:text-blue-300">View All</Link>
                    </div>

                    <div className="space-y-4">
                        {data?.consultations && data.consultations.length > 0 ? (
                            data.consultations.map((consult) => (
                                <Link key={consult._id} href={`/patient/consultations/${consult._id}`} className="block rounded-2xl border border-white/5 bg-black/20 p-5 transition-all hover:bg-white/5 hover:border-blue-500/30">
                                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                                        <div>
                                            <p className="text-sm text-slate-400 mb-1">{formatDate(consult.created_at)}</p>
                                            <h3 className="font-semibold text-white line-clamp-1">{consult.patient_input?.symptoms_raw_text || "No symptoms recorded"}</h3>
                                        </div>
                                        <StatusBadge status={consult.status} />
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="text-center py-10 rounded-2xl border border-dashed border-white/10">
                                <p className="text-slate-400">No consultations found.</p>
                                <Link href="/patient/consultations/new" className="mt-2 inline-block text-blue-400 hover:underline">Start your first case</Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Tickets/Feedback */}
                <div className="rounded-3xl border border-white/10 bg-[#0f172a]/60 p-6 sm:p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <MessageSquare className="h-5 w-5 text-blue-400" /> Support Tickets
                        </h2>
                    </div>

                    <div className="space-y-4">
                        {data?.feedbacks && data.feedbacks.length > 0 ? (
                            data.feedbacks.map((ticket) => (
                                <div key={ticket._id} className="rounded-2xl border border-white/5 bg-black/20 p-4">
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <span className="text-sm font-semibold text-white">{ticket.ticket_type}</span>
                                        {ticket.status === "Open" ? (
                                            <AlertCircle className="h-4 w-4 text-yellow-500" />
                                        ) : (
                                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-400 line-clamp-2">{ticket.message}</p>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 rounded-2xl border border-dashed border-white/10">
                                <p className="text-xs text-slate-400">No recent tickets.</p>
                            </div>
                        )}
                        <Link href="/contact" className="block text-center text-sm font-medium text-blue-400 hover:text-blue-300 mt-4">Create New Ticket</Link>
                    </div>
                </div>

            </div>
        </div>
    );
}