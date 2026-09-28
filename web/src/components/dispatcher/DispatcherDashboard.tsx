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
    ShieldCheck,
    FlaskConical,
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

const statusConfig: Record<string, { label: string; icon: any; className: string }> = {
    pending: {
        label: "Pending",
        icon: Clock3,
        className: "text-warning bg-warning/10 border-warning/20",
    },
    contacting_patient: {
        label: "Contacting Patient",
        icon: Phone,
        className: "text-info bg-info/10 border-info/20",
    },
    hospital_selected: {
        label: "Hospital Selected",
        icon: Building2,
        className: "text-primary bg-primary/10 border-primary/20",
    },
    dispatched: {
        label: "Dispatched",
        icon: Truck,
        className: "text-info bg-info/10 border-info/20",
    },
    arrived: {
        label: "Arrived",
        icon: CheckCircle2,
        className: "text-success bg-success/10 border-success/20",
    },
    cancelled: {
        label: "Cancelled",
        icon: XCircle,
        className: "text-danger bg-danger/10 border-danger/20",
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
            <div className="flex min-h-screen items-center justify-center bg-background px-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary sm:h-10 sm:w-10" />
            </div>
        );
    }

    const stats = data?.stats;

    return (
        <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
            <div className="mx-auto w-full max-w-7xl space-y-5 px-4 py-5 sm:space-y-8 sm:px-6 sm:py-8 lg:px-8">
                <div className="min-w-0">
                    <p className="mb-1 text-xs text-muted-foreground sm:text-sm">
                        Dispatcher Control Center
                    </p>

                    <h1 className="wrap-break-word text-2xl font-bold sm:text-3xl">
                        Welcome, {user?.username || "Dispatcher"}
                    </h1>

                    <p className="mt-2 max-w-2xl text-sm text-muted sm:text-base">
                        Monitor emergency coordination and ambulance requests.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 sm:gap-4">
                    <StatCard
                        title="Active Requests"
                        value={stats?.active || 0}
                        icon={Ambulance}
                        className="border-warning/20"
                        iconClassName="text-warning bg-warning/10"
                    />

                    <StatCard
                        title="Pending"
                        value={stats?.pending || 0}
                        icon={Clock3}
                        className="border-warning/20"
                        iconClassName="text-warning bg-warning/10"
                    />

                    <StatCard
                        title="Contacting Patient"
                        value={stats?.contacting_patient || 0}
                        icon={Phone}
                        className="border-info/20"
                        iconClassName="text-info bg-info/10"
                    />

                    <StatCard
                        title="Dispatched"
                        value={stats?.dispatched || 0}
                        icon={Truck}
                        className="border-success/20"
                        iconClassName="text-success bg-success/10"
                    />
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 sm:gap-6">
                    <div className="min-w-0 rounded-xl border border-border bg-surface p-4 sm:rounded-2xl sm:p-6">
                        <div className="mb-5 flex items-start justify-between gap-3 sm:mb-6">
                            <div className="min-w-0">
                                <h2 className="text-base font-bold sm:text-lg">
                                    Ambulance Status
                                </h2>

                                <p className="mt-1 text-xs text-muted sm:text-sm">
                                    Current coordination pipeline
                                </p>
                            </div>

                            <Ambulance className="h-5 w-5 shrink-0 text-warning sm:h-6 sm:w-6" />
                        </div>

                        <div className="space-y-2.5 sm:space-y-3">
                            <StatusRow label="Pending" value={stats?.pending || 0} color="text-warning" />
                            <StatusRow label="Contacting Patient" value={stats?.contacting_patient || 0} color="text-info" />
                            <StatusRow label="Hospital Selected" value={stats?.hospital_selected || 0} color="text-primary" />
                            <StatusRow label="Dispatched" value={stats?.dispatched || 0} color="text-info" />
                            <StatusRow label="Arrived" value={stats?.arrived || 0} color="text-success" />
                            <StatusRow label="Cancelled" value={stats?.cancelled || 0} color="text-danger" />
                        </div>
                    </div>

                    <div className="min-w-0 rounded-xl border border-border bg-surface p-4 sm:rounded-2xl sm:p-6">
                        <h2 className="text-base font-bold sm:text-lg">Quick Actions</h2>

                        <p className="mb-5 mt-1 text-xs text-muted sm:mb-6 sm:text-sm">
                            Access dispatcher operations directly.
                        </p>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                            <Link
                                href="/dispatcher/ambulances"
                                className="group min-w-0 rounded-lg border border-warning/20 bg-warning/10 p-4 transition hover:bg-warning/15 sm:rounded-xl sm:p-5"
                            >
                                <Ambulance className="mb-3 h-6 w-6 text-warning sm:mb-4 sm:h-7 sm:w-7" />

                                <div className="flex items-center justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="wrap-break-word text-sm font-semibold sm:text-base">
                                            Ambulance Requests
                                        </p>

                                        <p className="mt-1 wrap-break-word text-xs text-muted">
                                            Coordinate emergency transport
                                        </p>
                                    </div>

                                    <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:text-foreground" />
                                </div>
                            </Link>

                            <Link
                                href="/dispatcher/consultations"
                                className="group min-w-0 rounded-lg border border-primary/20 bg-primary/10 p-4 transition hover:bg-primary/15 sm:rounded-xl sm:p-5"
                            >
                                <User className="mb-3 h-6 w-6 text-primary sm:mb-4 sm:h-7 sm:w-7" />

                                <div className="flex items-center justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="wrap-break-word text-sm font-semibold sm:text-base">
                                            Consultations
                                        </p>

                                        <p className="mt-1 wrap-break-word text-xs text-muted">
                                            Monitor doctor case activity
                                        </p>
                                    </div>

                                    <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:text-foreground" />
                                </div>
                            </Link>

                            <div className="min-w-0 rounded-lg border border-success/20 bg-success/10 p-4 transition sm:rounded-xl sm:p-5">
                                <ShieldCheck className="mb-3 h-6 w-6 text-success sm:mb-4 sm:h-7 sm:w-7" />

                                <div className="flex items-center justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="wrap-break-word text-sm font-semibold sm:text-base">
                                            Insurance
                                        </p>

                                        <p className="mt-1 wrap-break-word text-xs text-muted">
                                            Manage proposals and claims
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-4 grid grid-cols-2 gap-2">
                                    <Link
                                        href="/dispatcher/insurance"
                                        className="group inline-flex items-center justify-center gap-1.5 rounded-lg border border-success/20 bg-success/10 px-3 py-2 text-xs font-medium text-success transition hover:bg-success/15"
                                    >
                                        Proposals
                                        <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                                    </Link>

                                    <Link
                                        href="/dispatcher/insurance/claims"
                                        className="group inline-flex items-center justify-center gap-1.5 rounded-lg border border-success/20 bg-success/10 px-3 py-2 text-xs font-medium text-success transition hover:bg-success/15"
                                    >
                                        Claims
                                        <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                                    </Link>
                                </div>
                            </div>

                            <Link
                                href="/dispatcher/labs"
                                className="group min-w-0 rounded-lg border border-info/20 bg-info/10 p-4 transition hover:bg-info/15 sm:rounded-xl sm:p-5"
                            >
                                <FlaskConical className="mb-3 h-6 w-6 text-info sm:mb-4 sm:h-7 sm:w-7" />

                                <div className="flex items-center justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="wrap-break-word text-sm font-semibold sm:text-base">
                                            Lab Tests & Diagnostics
                                        </p>

                                        <p className="mt-1 wrap-break-word text-xs text-muted">
                                            Manage test bookings and diagnostic services
                                        </p>
                                    </div>

                                    <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:text-foreground" />
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="min-w-0 overflow-hidden rounded-xl border border-border bg-surface sm:rounded-2xl">
                    <div className="border-b border-border p-4 sm:p-6">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="min-w-0">
                                <h2 className="text-base font-bold sm:text-lg">
                                    Recent Ambulance Requests
                                </h2>

                                <p className="mt-1 text-xs text-muted sm:text-sm">
                                    Latest emergency coordination activity
                                </p>
                            </div>

                            <Link
                                href="/dispatcher/ambulances"
                                className="flex shrink-0 items-center gap-1 self-start text-sm text-primary transition hover:text-primary-hover sm:self-auto"
                            >
                                View All
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>

                    <div className="divide-y divide-border">
                        {data?.recentRequests?.length ? (
                            data.recentRequests.map((request) => (
                                <RequestRow key={request._id} request={request} />
                            ))
                        ) : (
                            <div className="px-4 py-12 text-center sm:py-14">
                                <Ambulance className="mx-auto mb-3 h-9 w-9 text-muted-foreground sm:h-10 sm:w-10" />

                                <p className="text-sm text-muted sm:text-base">
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
        <div className={`min-w-0 rounded-xl border bg-surface p-3.5 sm:rounded-2xl sm:p-5 ${className}`}>
            <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg sm:mb-4 sm:h-10 sm:w-10 sm:rounded-xl ${iconClassName}`}>
                <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>

            <p className="wrap-break-word text-xs text-muted-foreground sm:text-sm">
                {title}
            </p>

            <p className="mt-1 text-xl font-bold sm:text-2xl">{value}</p>
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
        <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 py-2.5 sm:rounded-xl sm:px-4 sm:py-3">
            <span className="min-w-0 wrap-break-word text-xs text-muted sm:text-sm">
                {label}
            </span>

            <span className={`shrink-0 text-sm font-bold sm:text-base ${color}`}>
                {value}
            </span>
        </div>
    );
}

function RequestRow({ request }: { request: any }) {
    const status = request.ambulance_dispatch?.status || "pending";
    const config = statusConfig[status] || statusConfig.pending;
    const StatusIcon = config.icon;

    const patientName = request.patient_id?.username || "Unknown Patient";
    const department = request.assigned_department_id?.name || "Unassigned";
    const doctor = request.claimed_by_doctor_id?.username || "Not assigned";

    return (
        <div className="min-w-0 p-4 transition hover:bg-surface-secondary sm:p-5">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <span className="wrap-break-word text-sm font-semibold sm:text-base">
                            {patientName}
                        </span>

                        <span className={`flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] sm:text-xs ${config.className}`}>
                            <StatusIcon className="h-3 w-3 shrink-0" />
                            <span>{config.label}</span>
                        </span>
                    </div>

                    <div className="mt-2 flex min-w-0 flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:flex-wrap sm:gap-x-5 sm:gap-y-2">
                        <span className="flex min-w-0 items-start gap-1">
                            <Building2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                            <span className="wrap-break-word">{department}</span>
                        </span>

                        <span className="flex min-w-0 items-start gap-1">
                            <User className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                            <span className="wrap-break-word">Doctor: {doctor}</span>
                        </span>

                        {request.ambulance_dispatch?.patient_location?.address && (
                            <span className="flex min-w-0 items-start gap-1">
                                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                                <span className="wrap-break-word">
                                    {request.ambulance_dispatch.patient_location.address}
                                </span>
                            </span>
                        )}
                    </div>
                </div>

                <Link
                    href={`/dispatcher/ambulances/${request._id}`}
                    className="flex w-full shrink-0 items-center justify-center gap-2 rounded-lg border border-border bg-surface-secondary px-4 py-2.5 text-sm text-muted transition hover:bg-accent hover:text-foreground lg:w-auto lg:py-2"
                >
                    Open
                    <ArrowRight className="h-4 w-4" />
                </Link>
            </div>
        </div>
    );
}