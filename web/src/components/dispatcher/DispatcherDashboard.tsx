"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
    Ambulance,
    ArrowRight,
    Building2,
    CheckCircle2,
    Clock3,
    Loader2,
    MapPin,
    Phone,
    Truck,
    User,
    XCircle,
} from "lucide-react";
import { useUserStore } from "@/store/useUserStore";

interface DashboardData {
    stats: {
        pending: number;
        contacting_patient: number;
        hospital_selected: number;
        dispatched: number;
        arrived: number;
        cancelled: number;
        active: number;
    };
    recentRequests: any[];
}

const statusConfig: Record<
    string,
    {
        label: string;
        icon: any;
        className: string;
    }
> = {
    pending: {
        label: "Pending",
        icon: Clock3,
        className:
            "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
    },
    contacting_patient: {
        label: "Contacting Patient",
        icon: Phone,
        className: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    },
    hospital_selected: {
        label: "Hospital Selected",
        icon: Building2,
        className:
            "text-purple-400 bg-purple-500/10 border-purple-500/20",
    },
    dispatched: {
        label: "Dispatched",
        icon: Truck,
        className:
            "text-orange-400 bg-orange-500/10 border-orange-500/20",
    },
    arrived: {
        label: "Arrived",
        icon: CheckCircle2,
        className:
            "text-green-400 bg-green-500/10 border-green-500/20",
    },
    cancelled: {
        label: "Cancelled",
        icon: XCircle,
        className: "text-red-400 bg-red-500/10 border-red-500/20",
    },
};

export default function DispatcherDashboard() {
    const { user, fetchUser } = useUserStore();

    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchDashboard = async () => {
        try {
            const res = await fetch("/api/dispatcher/dashboard");

            if (!res.ok) {
                throw new Error("Failed to fetch dashboard");
            }

            const json = await res.json();
            setData(json);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
        fetchDashboard();

        const interval = setInterval(fetchDashboard, 15000);

        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0B1120] flex items-center justify-center px-4">
                <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 text-blue-400 animate-spin" />
            </div>
        );
    }

    const stats = data?.stats;

    return (
        <div className="min-h-screen bg-[#0B1120] text-slate-300 overflow-x-hidden">
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-5 sm:space-y-8">
                <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-slate-500 mb-1">
                        Dispatcher Control Center
                    </p>

                    <h1 className="text-2xl sm:text-3xl font-bold text-white wrap-break-word">
                        Welcome, {user?.username || "Dispatcher"}
                    </h1>

                    <p className="text-sm sm:text-base text-slate-400 mt-2 max-w-2xl">
                        Monitor emergency coordination and ambulance requests.
                    </p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <StatCard
                        title="Active Requests"
                        value={stats?.active || 0}
                        icon={Ambulance}
                        className="border-orange-500/20"
                        iconClassName="text-orange-400 bg-orange-500/10"
                    />

                    <StatCard
                        title="Pending"
                        value={stats?.pending || 0}
                        icon={Clock3}
                        className="border-yellow-500/20"
                        iconClassName="text-yellow-400 bg-yellow-500/10"
                    />

                    <StatCard
                        title="Contacting Patient"
                        value={stats?.contacting_patient || 0}
                        icon={Phone}
                        className="border-blue-500/20"
                        iconClassName="text-blue-400 bg-blue-500/10"
                    />

                    <StatCard
                        title="Dispatched"
                        value={stats?.dispatched || 0}
                        icon={Truck}
                        className="border-green-500/20"
                        iconClassName="text-green-400 bg-green-500/10"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    <div className="bg-[#131C31] border border-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-5 sm:mb-6">
                            <div className="min-w-0">
                                <h2 className="text-base sm:text-lg font-bold text-white">
                                    Ambulance Status
                                </h2>

                                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                                    Current coordination pipeline
                                </p>
                            </div>

                            <Ambulance className="w-5 h-5 sm:w-6 sm:h-6 text-orange-400 shrink-0" />
                        </div>

                        <div className="space-y-2.5 sm:space-y-3">
                            <StatusRow
                                label="Pending"
                                value={stats?.pending || 0}
                                color="text-yellow-400"
                            />

                            <StatusRow
                                label="Contacting Patient"
                                value={stats?.contacting_patient || 0}
                                color="text-blue-400"
                            />

                            <StatusRow
                                label="Hospital Selected"
                                value={stats?.hospital_selected || 0}
                                color="text-purple-400"
                            />

                            <StatusRow
                                label="Dispatched"
                                value={stats?.dispatched || 0}
                                color="text-orange-400"
                            />

                            <StatusRow
                                label="Arrived"
                                value={stats?.arrived || 0}
                                color="text-green-400"
                            />

                            <StatusRow
                                label="Cancelled"
                                value={stats?.cancelled || 0}
                                color="text-red-400"
                            />
                        </div>
                    </div>

                    <div className="bg-[#131C31] border border-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 min-w-0">
                        <h2 className="text-base sm:text-lg font-bold text-white">
                            Quick Actions
                        </h2>

                        <p className="text-xs sm:text-sm text-slate-500 mt-1 mb-5 sm:mb-6">
                            Access dispatcher operations directly.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <Link
                                href="/dispatcher/ambulances"
                                className="group border border-orange-500/20 bg-orange-500/5 hover:bg-orange-500/10 rounded-xl p-4 sm:p-5 transition min-w-0"
                            >
                                <Ambulance className="w-6 h-6 sm:w-7 sm:h-7 text-orange-400 mb-3 sm:mb-4" />

                                <div className="flex items-center justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="text-sm sm:text-base text-white font-semibold wrap-break-word">
                                            Ambulance Requests
                                        </p>

                                        <p className="text-xs text-slate-500 mt-1 wrap-break-word">
                                            Coordinate emergency transport
                                        </p>
                                    </div>

                                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition shrink-0" />
                                </div>
                            </Link>

                            <Link
                                href="/dispatcher/consultations"
                                className="group border border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 rounded-xl p-4 sm:p-5 transition min-w-0"
                            >
                                <User className="w-6 h-6 sm:w-7 sm:h-7 text-blue-400 mb-3 sm:mb-4" />

                                <div className="flex items-center justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="text-sm sm:text-base text-white font-semibold wrap-break-word">
                                            Consultations
                                        </p>

                                        <p className="text-xs text-slate-500 mt-1 wrap-break-word">
                                            Monitor doctor case activity
                                        </p>
                                    </div>

                                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition shrink-0" />
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="bg-[#131C31] border border-slate-800 rounded-xl sm:rounded-2xl overflow-hidden min-w-0">
                    <div className="p-4 sm:p-6 border-b border-slate-800">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="min-w-0">
                                <h2 className="text-base sm:text-lg font-bold text-white">
                                    Recent Ambulance Requests
                                </h2>

                                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                                    Latest emergency coordination activity
                                </p>
                            </div>

                            <Link
                                href="/dispatcher/ambulances"
                                className="self-start sm:self-auto text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 shrink-0"
                            >
                                View All
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>

                    <div className="divide-y divide-slate-800">
                        {data?.recentRequests?.length ? (
                            data.recentRequests.map((request) => (
                                <RequestRow
                                    key={request._id}
                                    request={request}
                                />
                            ))
                        ) : (
                            <div className="py-12 sm:py-14 px-4 text-center">
                                <Ambulance className="w-9 h-9 sm:w-10 sm:h-10 text-slate-700 mx-auto mb-3" />

                                <p className="text-sm sm:text-base text-slate-400">
                                    No ambulance requests found.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({
    title,
    value,
    icon: Icon,
    className,
    iconClassName,
}: {
    title: string;
    value: number;
    icon: any;
    className: string;
    iconClassName: string;
}) {
    return (
        <div
            className={`bg-[#131C31] border rounded-xl sm:rounded-2xl p-3.5 sm:p-5 min-w-0 ${className}`}
        >
            <div
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4 ${iconClassName}`}
            >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>

            <p className="text-xs sm:text-sm text-slate-500 wrap-break-word">
                {title}
            </p>

            <p className="text-xl sm:text-2xl font-bold text-white mt-1">
                {value}
            </p>
        </div>
    );
}

function StatusRow({
    label,
    value,
    color,
}: {
    label: string;
    value: number;
    color: string;
}) {
    return (
        <div className="flex items-center justify-between gap-3 bg-[#0B1120] border border-slate-800 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3">
            <span className="text-xs sm:text-sm text-slate-400 min-w-0 wrap-break-word">
                {label}
            </span>

            <span className={`text-sm sm:text-base font-bold shrink-0 ${color}`}>
                {value}
            </span>
        </div>
    );
}

function RequestRow({ request }: { request: any }) {
    const status =
        request.ambulance_dispatch?.status || "pending";

    const config = statusConfig[status] || statusConfig.pending;
    const StatusIcon = config.icon;

    const patientName =
        request.patient_id?.username || "Unknown Patient";

    const department =
        request.assigned_department_id?.name || "Unassigned";

    const doctor =
        request.claimed_by_doctor_id?.username || "Not assigned";

    return (
        <div className="p-4 sm:p-5 hover:bg-slate-900/30 transition min-w-0">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <span className="text-sm sm:text-base text-white font-semibold wrap-break-word">
                            {patientName}
                        </span>

                        <span
                            className={`text-[11px] sm:text-xs px-2.5 py-1 rounded-full border flex items-center gap-1 shrink-0 ${config.className}`}
                        >
                            <StatusIcon className="w-3 h-3 shrink-0" />
                            <span>{config.label}</span>
                        </span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-x-5 sm:gap-y-2 mt-2 text-xs text-slate-500 min-w-0">
                        <span className="flex items-start gap-1 min-w-0">
                            <Building2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                            <span className="wrap-break-word">
                                {department}
                            </span>
                        </span>

                        <span className="flex items-start gap-1 min-w-0">
                            <User className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                            <span className="wrap-break-word">
                                Doctor: {doctor}
                            </span>
                        </span>

                        {request.ambulance_dispatch?.patient_location
                            ?.address && (
                                <span className="flex items-start gap-1 min-w-0">
                                    <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />

                                    <span className="wrap-break-word">
                                        {
                                            request.ambulance_dispatch
                                                .patient_location.address
                                        }
                                    </span>
                                </span>
                            )}
                    </div>
                </div>

                <Link
                    href={`/dispatcher/ambulances/${request._id}`}
                    className="w-full lg:w-auto shrink-0 flex items-center justify-center gap-2 px-4 py-2.5 lg:py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm transition"
                >
                    Open
                    <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        </div>
    );
}