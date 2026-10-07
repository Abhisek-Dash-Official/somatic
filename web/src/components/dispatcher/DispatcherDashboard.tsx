"use client";

import Link from "next/link";
import { useEffect, useState, type ComponentType } from "react";
import {
    Activity,
    Ambulance,
    ArrowRight,
    Building2,
    CheckCircle2,
    Clock3,
    FlaskConical,
    Loader2,
    MapPin,
    Phone,
    RefreshCw,
    ShieldCheck,
    ShoppingBag,
    Truck,
    User,
    XCircle,
} from "lucide-react";
import { useUserStore } from "@/store/useUserStore";

interface DashboardData {
    stats: {
        ambulance: {
            pending: number;
            contacting_patient: number;
            hospital_selected: number;
            dispatched: number;
            arrived: number;
            cancelled: number;
            active: number;
        };
        consultations: {
            pending: number;
            in_review: number;
            active: number;
        };
        labs: {
            booked: number;
            collection_scheduled: number;
            processing: number;
            report_ready: number;
            active: number;
        };
        orders: {
            placed: number;
            processing: number;
            shipped: number;
            active: number;
        };
        insurance: {
            submitted: number;
            under_review: number;
            active: number;
        };
    };
    recentRequests: any[];
}

const statusConfig: Record<
    string,
    { label: string; icon: ComponentType<{ className?: string }>; className: string }
> = {
    pending: {
        label: "Pending",
        icon: Clock3,
        className: "border-warning/20 bg-warning/10 text-warning",
    },
    contacting_patient: {
        label: "Contacting Patient",
        icon: Phone,
        className: "border-info/20 bg-info/10 text-info",
    },
    hospital_selected: {
        label: "Hospital Selected",
        icon: Building2,
        className: "border-primary/20 bg-primary/10 text-primary",
    },
    dispatched: {
        label: "Dispatched",
        icon: Truck,
        className: "border-info/20 bg-info/10 text-info",
    },
    arrived: {
        label: "Arrived",
        icon: CheckCircle2,
        className: "border-success/20 bg-success/10 text-success",
    },
    cancelled: {
        label: "Cancelled",
        icon: XCircle,
        className: "border-danger/20 bg-danger/10 text-danger",
    },
};

export default function DispatcherDashboard() {
    const { user, fetchUser } = useUserStore();
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchDashboard = async (manual = false) => {
        try {
            if (manual) setRefreshing(true);

            const res = await fetch("/api/dispatcher/dashboard", {
                cache: "no-store",
            });

            if (!res.ok) throw new Error("Failed to fetch dashboard");

            const json = await res.json();
            setData(json);
        } catch (error) {
            console.error("Dispatcher dashboard error:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchUser();
        fetchDashboard();

        const interval = setInterval(() => fetchDashboard(), 15000);

        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const stats = data?.stats;

    return (
        <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
            <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                <header className="flex flex-col justify-between gap-4 border-b border-border pb-6 sm:flex-row sm:items-end">
                    <div>
                        <p className="text-xs font-medium uppercase tracking-wider text-muted">
                            Dispatcher Control Center
                        </p>
                        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
                            Welcome,{" "}
                            <span className="text-primary">
                                {user?.username || "Dispatcher"}
                            </span>
                        </h1>
                        <p className="mt-2 text-sm text-muted">
                            Monitor emergency coordination and service operations.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => fetchDashboard(true)}
                        disabled={refreshing}
                        title="Refresh dashboard"
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-muted transition hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <RefreshCw
                            className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                        />
                    </button>
                </header>

                <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <StatCard
                        title="Active Ambulances"
                        value={stats?.ambulance.active || 0}
                        icon={Ambulance}
                        iconClass="border-warning/20 bg-warning/10 text-warning"
                    />
                    <StatCard
                        title="Clinical Queue"
                        value={stats?.consultations.active || 0}
                        icon={User}
                        iconClass="border-primary/20 bg-primary/10 text-primary"
                    />
                    <StatCard
                        title="Lab Pipeline"
                        value={stats?.labs.active || 0}
                        icon={FlaskConical}
                        iconClass="border-info/20 bg-info/10 text-info"
                    />
                    <StatCard
                        title="Active Orders"
                        value={stats?.orders.active || 0}
                        icon={ShoppingBag}
                        iconClass="border-primary/20 bg-primary/10 text-primary"
                    />
                </section>

                <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <section className="rounded-2xl border border-border bg-surface shadow-sm">
                        <SectionHeader
                            title="Ambulance Coordination"
                            description="Current emergency transport pipeline"
                            icon={Ambulance}
                            iconClass="text-warning"
                        />

                        <div className="divide-y divide-border">
                            <StatusRow
                                label="Pending"
                                value={stats?.ambulance.pending || 0}
                                color="text-warning"
                            />
                            <StatusRow
                                label="Contacting Patient"
                                value={stats?.ambulance.contacting_patient || 0}
                                color="text-info"
                            />
                            <StatusRow
                                label="Hospital Selected"
                                value={stats?.ambulance.hospital_selected || 0}
                                color="text-primary"
                            />
                            <StatusRow
                                label="Dispatched"
                                value={stats?.ambulance.dispatched || 0}
                                color="text-info"
                            />
                            <StatusRow
                                label="Arrived"
                                value={stats?.ambulance.arrived || 0}
                                color="text-success"
                            />
                        </div>

                        <div className="border-t border-border p-4">
                            <Link
                                href="/dispatcher/ambulances"
                                className="flex items-center justify-between rounded-xl border border-border bg-surface-secondary px-4 py-3 text-sm font-medium text-foreground transition hover:border-primary/40 hover:bg-accent hover:text-primary"
                            >
                                <span>Open ambulance operations</span>
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </section>

                    <section className="rounded-2xl border border-border bg-surface shadow-sm">
                        <SectionHeader
                            title="Service Operations"
                            description="Queues requiring dispatcher attention"
                            icon={ActivityIcon}
                            iconClass="text-primary"
                        />

                        <div className="divide-y divide-border">
                            <OperationRow
                                icon={User}
                                label="Consultations"
                                value={stats?.consultations.active || 0}
                                detail={`${stats?.consultations.pending || 0} pending review · ${stats?.consultations.in_review || 0} in review`}
                                href="/dispatcher/consultations"
                            />
                            <OperationRow
                                icon={FlaskConical}
                                label="Lab Tests"
                                value={stats?.labs.active || 0}
                                detail={`${stats?.labs.collection_scheduled || 0} collection scheduled · ${stats?.labs.report_ready || 0} reports ready`}
                                href="/dispatcher/lab-tests"
                            />
                            <OperationRow
                                icon={ShoppingBag}
                                label="Orders"
                                value={stats?.orders.active || 0}
                                detail={`${stats?.orders.placed || 0} placed · ${stats?.orders.processing || 0} processing`}
                                href="/dispatcher/orders"
                            />
                            <OperationRow
                                icon={ShieldCheck}
                                label="Insurance Claims"
                                value={stats?.insurance.active || 0}
                                detail={`${stats?.insurance.submitted || 0} submitted · ${stats?.insurance.under_review || 0} under review`}
                                href="/dispatcher/insurance/claims"
                            />
                        </div>
                    </section>
                </section>

                <section className="rounded-2xl border border-border bg-surface shadow-sm">
                    <div className="border-b border-border p-5">
                        <h2 className="font-semibold text-foreground">Quick Actions</h2>
                        <p className="mt-1 text-xs text-muted">
                            Access dispatcher operations directly.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 divide-y divide-border sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
                        <QuickAction
                            href="/dispatcher/ambulances"
                            icon={Ambulance}
                            title="Ambulance Requests"
                            description="Coordinate emergency transport"
                            iconClass="border-warning/20 bg-warning/10 text-warning"
                        />
                        <QuickAction
                            href="/dispatcher/consultations"
                            icon={User}
                            title="Consultations"
                            description="Monitor doctor case activity"
                            iconClass="border-primary/20 bg-primary/10 text-primary"
                        />
                        <QuickAction
                            href="/dispatcher/lab-tests"
                            icon={FlaskConical}
                            title="Lab Tests"
                            description="Manage collection operations"
                            iconClass="border-info/20 bg-info/10 text-info"
                        />
                        <QuickAction
                            href="/dispatcher/orders"
                            icon={ShoppingBag}
                            title="Orders"
                            description="Manage medicine and blood orders"
                            iconClass="border-primary/20 bg-primary/10 text-primary"
                        />
                    </div>

                    <div className="grid grid-cols-1 border-t border-border sm:grid-cols-2">
                        <QuickAction
                            href="/dispatcher/insurance"
                            icon={ShieldCheck}
                            title="Insurance Proposals"
                            description="Manage insurance proposals"
                            iconClass="border-success/20 bg-success/10 text-success"
                        />
                        <QuickAction
                            href="/dispatcher/insurance/claims"
                            icon={ShieldCheck}
                            title="Insurance Claims"
                            description="Review and process claims"
                            iconClass="border-success/20 bg-success/10 text-success"
                        />
                    </div>
                </section>

                <section className="rounded-2xl border border-border bg-surface shadow-sm">
                    <div className="flex flex-col justify-between gap-3 border-b border-border p-5 sm:flex-row sm:items-center">
                        <div>
                            <h2 className="font-semibold text-foreground">
                                Recent Ambulance Requests
                            </h2>
                            <p className="mt-1 text-xs text-muted">
                                Latest emergency coordination activity
                            </p>
                        </div>

                        <Link
                            href="/dispatcher/ambulances"
                            className="flex items-center gap-1 text-sm text-primary transition hover:text-primary-hover"
                        >
                            View All
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>

                    <div className="divide-y divide-border">
                        {data?.recentRequests?.length ? (
                            data.recentRequests.map((request) => (
                                <RequestRow key={request._id} request={request} />
                            ))
                        ) : (
                            <div className="px-5 py-12 text-center">
                                <Ambulance className="mx-auto mb-3 h-9 w-9 text-muted" />
                                <p className="text-sm text-muted">
                                    No ambulance requests found.
                                </p>
                            </div>
                        )}
                    </div>
                </section>

                <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <MiniMetric
                        label="Arrived"
                        value={stats?.ambulance.arrived || 0}
                        icon={CheckCircle2}
                        className="text-success"
                    />
                    <MiniMetric
                        label="Cancelled"
                        value={stats?.ambulance.cancelled || 0}
                        icon={XCircle}
                        className="text-danger"
                    />
                    <MiniMetric
                        label="Lab Reports Ready"
                        value={stats?.labs.report_ready || 0}
                        icon={FlaskConical}
                        className="text-info"
                    />
                    <MiniMetric
                        label="Claims Review"
                        value={stats?.insurance.under_review || 0}
                        icon={ShieldCheck}
                        className="text-warning"
                    />
                </section>
            </div>
        </div>
    );
}

function StatCard({
    title,
    value,
    icon: Icon,
    iconClass,
}: {
    title: string;
    value: number;
    icon: ComponentType<{ className?: string }>;
    iconClass: string;
}) {
    return (
        <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-5">
            <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl border ${iconClass}`}>
                <Icon className="h-4 w-4" />
            </div>
            <p className="text-xs text-muted sm:text-sm">{title}</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">{value}</p>
        </div>
    );
}

function SectionHeader({
    title,
    description,
    icon: Icon,
    iconClass,
}: {
    title: string;
    description: string;
    icon: ComponentType<{ className?: string }>;
    iconClass: string;
}) {
    return (
        <div className="flex items-start justify-between border-b border-border p-5">
            <div>
                <h2 className="font-semibold text-foreground">{title}</h2>
                <p className="mt-1 text-xs text-muted">{description}</p>
            </div>
            <Icon className={`h-5 w-5 ${iconClass}`} />
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
        <div className="flex items-center justify-between px-5 py-3.5">
            <span className="text-sm text-muted">{label}</span>
            <span className={`text-sm font-semibold ${color}`}>{value}</span>
        </div>
    );
}

function OperationRow({
    icon: Icon,
    label,
    value,
    detail,
    href,
}: {
    icon: ComponentType<{ className?: string }>;
    label: string;
    value: number;
    detail: string;
    href: string;
}) {
    return (
        <Link
            href={href}
            className="flex items-center gap-3 px-5 py-4 transition hover:bg-surface-secondary"
        >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-accent text-primary">
                <Icon className="h-4 w-4" />
            </div>

            <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">{label}</p>
                <p className="mt-1 truncate text-xs text-muted">{detail}</p>
            </div>

            <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">{value}</span>
                <ArrowRight className="h-4 w-4 text-muted" />
            </div>
        </Link>
    );
}

function QuickAction({
    href,
    icon: Icon,
    title,
    description,
    iconClass,
}: {
    href: string;
    icon: ComponentType<{ className?: string }>;
    title: string;
    description: string;
    iconClass: string;
}) {
    return (
        <Link
            href={href}
            className="group flex items-center gap-3 p-4 transition hover:bg-surface-secondary sm:p-5"
        >
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${iconClass}`}>
                <Icon className="h-5 w-5" />
            </div>

            <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">{title}</p>
                <p className="mt-1 truncate text-xs text-muted">{description}</p>
            </div>

            <ArrowRight className="h-4 w-4 shrink-0 text-muted transition group-hover:translate-x-1 group-hover:text-primary" />
        </Link>
    );
}

function MiniMetric({
    label,
    value,
    icon: Icon,
    className,
}: {
    label: string;
    value: number;
    icon: ComponentType<{ className?: string }>;
    className: string;
}) {
    return (
        <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
            <Icon className={`h-4 w-4 ${className}`} />
            <p className="mt-3 text-xs text-muted">{label}</p>
            <p className="mt-1 text-xl font-semibold text-foreground">{value}</p>
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
        <div className="p-4 transition hover:bg-surface-secondary sm:p-5">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-foreground sm:text-base">
                            {patientName}
                        </span>

                        <span className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] ${config.className}`}>
                            <StatusIcon className="h-3 w-3" />
                            {config.label}
                        </span>
                    </div>

                    <div className="mt-2 flex flex-col gap-2 text-xs text-muted sm:flex-row sm:flex-wrap sm:gap-x-5">
                        <span className="flex items-center gap-1">
                            <Building2 className="h-3.5 w-3.5" />
                            {department}
                        </span>

                        <span className="flex items-center gap-1">
                            <User className="h-3.5 w-3.5" />
                            Doctor: {doctor}
                        </span>

                        {request.ambulance_dispatch?.patient_location?.address && (
                            <span className="flex items-start gap-1">
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
                    className="flex shrink-0 items-center justify-center gap-2 rounded-xl border border-border bg-surface-secondary px-4 py-2.5 text-sm text-muted transition hover:border-primary/40 hover:text-foreground"
                >
                    Open
                    <ArrowRight className="h-4 w-4" />
                </Link>
            </div>
        </div>
    );
}

function ActivityIcon({ className }: { className?: string }) {
    return <RefreshCw className={className} />;
}