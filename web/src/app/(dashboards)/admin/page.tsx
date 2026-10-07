"use client";

import { useEffect, useMemo, useState } from "react";
import {
    Activity,
    AlertTriangle,
    ArrowUpRight,
    Building2,
    CheckCircle2,
    ChevronRight,
    Clock3,
    CreditCard,
    FlaskConical,
    HeartPulse,
    RefreshCw,
    ShieldCheck,
    Ticket,
    Users,
    WalletCards,
} from "lucide-react";
import { useUserStore } from "@/store/useUserStore";
import LogDetailsModal from "@/components/admin/LogDetailsModal";

type Range = 7 | 30 | 90;

interface DashboardData {
    range: number;
    overview: {
        totalUsers: number;
        totalPatients: number;
        totalDoctors: number;
        activeDoctors: number;
        totalAdmins: number;
        totalDepartments: number;
        activeDepartments: number;
    };
    consultations: {
        pending: number;
        inReview: number;
        completed: number;
        emergency: number;
    };
    labs: {
        booked: number;
        collectionScheduled: number;
        processing: number;
        reportReady: number;
        completed: number;
    };
    feedback: {
        total: number;
        open: number;
        resolved: number;
    };
    subscriptions: {
        active: number;
        expiringSoon: number;
    };
    insurance: {
        totalClaims: number;
        pendingClaims: number;
        approvedClaims: number;
    };
    finance: {
        revenue: number;
        averageTransaction: number;
        transactions: number;
        todayRevenue: number;
    };
    today: {
        users: number;
        consultations: number;
    };
    daily: {
        date: string;
        users: number;
        consultations: number;
        completedConsultations: number;
        labs: number;
        completedLabs: number;
        revenue: number;
        transactions: number;
    }[];
    departments: {
        name: string;
        total: number;
        pending: number;
        inReview: number;
        completed: number;
    }[];
    recentLogs: any[];
}

const numberFormat = new Intl.NumberFormat("en-IN");

function formatNumber(value: number) {
    return numberFormat.format(Math.round(value || 0));
}

function formatCurrency(value: number) {
    return `₹${numberFormat.format(Math.round(value || 0))}`;
}

function formatDate(value: string) {
    return new Date(value).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
    });
}

function formatAction(value: string) {
    return value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function AdminDashboardPage() {
    const user = useUserStore((state: any) => state.user);
    const [range, setRange] = useState<Range>(30);
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");
    const [selectedLog, setSelectedLog] = useState<any>(null);

    const fetchDashboard = async (refresh = false) => {
        try {
            if (refresh) setRefreshing(true);
            else setLoading(true);

            setError("");

            const response = await fetch(
                `/api/admin/dashboard?range=${range}`,
                { cache: "no-store" },
            );
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Failed to load dashboard");
            }

            setData(result);
        } catch (err: any) {
            setError(err.message || "Failed to load dashboard");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, [range]);

    const chart = useMemo(() => {
        if (!data?.daily?.length) return null;

        const width = 900;
        const height = 280;
        const left = 55;
        const right = 20;
        const top = 25;
        const bottom = 40;
        const chartWidth = width - left - right;
        const chartHeight = height - top - bottom;
        const maxValue = Math.max(
            ...data.daily.map((item) => item.revenue),
            1,
        );

        const points = data.daily.map((item, index) => {
            const x =
                data.daily.length === 1
                    ? left + chartWidth / 2
                    : left + (index / (data.daily.length - 1)) * chartWidth;

            const y =
                top +
                chartHeight -
                (item.revenue / maxValue) * chartHeight;

            return { ...item, x, y };
        });

        return {
            width,
            height,
            left,
            right,
            top,
            bottom,
            chartWidth,
            chartHeight,
            maxValue,
            points,
        };
    }, [data]);

    if (loading) {
        return (
            <main className="min-h-full bg-background p-5 md:p-8">
                <div className="flex min-h-[70vh] items-center justify-center">
                    <RefreshCw className="h-7 w-7 animate-spin text-primary" />
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="min-h-full bg-background p-5 md:p-8">
                <div className="rounded-2xl border border-danger/30 bg-danger/5 px-5 py-4 text-danger">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 shrink-0" />
                        <div>
                            <p className="font-semibold">
                                Unable to load dashboard
                            </p>
                            <p className="mt-1 text-sm text-muted">{error}</p>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    if (!data) return null;

    return (
        <main className="min-h-full bg-background p-5 md:p-8">
            <div className="mx-auto max-w-375 space-y-6">
                <section className="flex flex-col justify-between gap-5 rounded-2xl border border-border bg-surface p-5 shadow-sm md:flex-row md:items-end md:p-6">
                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full border border-primary/30 bg-accent p-0.5">
                            <img
                                src={`/avatars/avatar-${user?.avatar_id || "admin"}.png`}
                                alt=""
                                className="h-full w-full rounded-full object-cover"
                                onError={(event) => {
                                    event.currentTarget.src =
                                        "/avatars/avatar-admin.png";
                                }}
                            />
                        </div>

                        <div>
                            <p className="text-sm text-muted">
                                Administration
                            </p>
                            <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                                Welcome,{" "}
                                <span className="text-primary">
                                    {user?.username || "Admin"}
                                </span>
                            </h1>
                            <p className="mt-1 text-sm text-muted">
                                Real-time platform operations and clinical
                                workflow overview.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="flex rounded-xl border border-border bg-surface p-1">
                            {[7, 30, 90].map((value) => (
                                <button
                                    key={value}
                                    onClick={() => setRange(value as Range)}
                                    className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors ${range === value
                                            ? "bg-accent text-accent-foreground"
                                            : "text-muted hover:bg-surface-secondary hover:text-foreground"
                                        }`}
                                >
                                    {value}D
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => fetchDashboard(true)}
                            disabled={refreshing}
                            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface text-muted transition hover:border-primary/40 hover:text-primary disabled:opacity-50"
                            title="Refresh"
                        >
                            <RefreshCw
                                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""
                                    }`}
                            />
                        </button>
                    </div>
                </section>

                <section className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border bg-border shadow-sm md:grid-cols-2 xl:grid-cols-4">
                    <MetricCard
                        icon={Users}
                        label="Total Users"
                        value={formatNumber(data.overview.totalUsers)}
                        detail={`${formatNumber(data.today.users)} new today`}
                    />
                    <MetricCard
                        icon={HeartPulse}
                        label="Consultations"
                        value={formatNumber(
                            data.consultations.pending +
                            data.consultations.inReview,
                        )}
                        detail={`${formatNumber(
                            data.consultations.completed,
                        )} completed`}
                    />
                    <MetricCard
                        icon={FlaskConical}
                        label="Lab Pipeline"
                        value={formatNumber(
                            data.labs.booked +
                            data.labs.collectionScheduled +
                            data.labs.processing +
                            data.labs.reportReady,
                        )}
                        detail={`${formatNumber(
                            data.labs.reportReady,
                        )} reports ready`}
                    />
                    <MetricCard
                        icon={WalletCards}
                        label="Revenue"
                        value={formatCurrency(data.finance.revenue)}
                        detail={`${formatCurrency(
                            data.finance.todayRevenue,
                        )} today`}
                    />
                </section>

                <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.6fr_1fr]">
                    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
                        <div className="flex items-center justify-between border-b border-border px-5 py-4">
                            <div>
                                <h2 className="font-semibold text-foreground">
                                    Revenue Trend
                                </h2>
                                <p className="mt-1 text-xs text-muted">
                                    Paid transactions · {range} day period
                                </p>
                            </div>
                            <CreditCard className="h-5 w-5 text-primary" />
                        </div>

                        {chart && (
                            <div className="overflow-x-auto p-4 md:p-5">
                                <svg
                                    viewBox={`0 0 ${chart.width} ${chart.height}`}
                                    className="h-70 min-w-175 w-full"
                                >
                                    {[0, 0.25, 0.5, 0.75, 1].map((value) => {
                                        const y =
                                            chart.top +
                                            chart.chartHeight -
                                            value * chart.chartHeight;

                                        return (
                                            <g key={value}>
                                                <line
                                                    x1={chart.left}
                                                    x2={chart.width - chart.right}
                                                    y1={y}
                                                    y2={y}
                                                    stroke="var(--border)"
                                                    strokeWidth="1"
                                                />
                                                <text
                                                    x={chart.left - 10}
                                                    y={y + 4}
                                                    textAnchor="end"
                                                    fontSize="10"
                                                    fill="var(--muted)"
                                                >
                                                    {formatCurrency(
                                                        chart.maxValue * value,
                                                    )}
                                                </text>
                                            </g>
                                        );
                                    })}

                                    <path
                                        d={`${chart.points
                                            .map(
                                                (point, index) =>
                                                    `${index === 0
                                                        ? "M"
                                                        : "L"
                                                    } ${point.x} ${point.y}`,
                                            )
                                            .join(
                                                " ",
                                            )} L ${chart.points.at(-1)?.x ||
                                            chart.left
                                            } ${chart.top + chart.chartHeight
                                            } L ${chart.points[0]?.x || chart.left
                                            } ${chart.top + chart.chartHeight
                                            } Z`}
                                        fill="var(--accent)"
                                        opacity="0.25"
                                    />

                                    <path
                                        d={chart.points
                                            .map(
                                                (point, index) =>
                                                    `${index === 0
                                                        ? "M"
                                                        : "L"
                                                    } ${point.x} ${point.y}`,
                                            )
                                            .join(" ")}
                                        fill="none"
                                        stroke="var(--primary)"
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />

                                    {chart.points.map((point, index) => (
                                        <g key={point.date}>
                                            <circle
                                                cx={point.x}
                                                cy={point.y}
                                                r="3.5"
                                                fill="var(--background)"
                                                stroke="var(--primary)"
                                                strokeWidth="2"
                                            />

                                            {(range === 7 ||
                                                index === 0 ||
                                                index ===
                                                chart.points.length - 1 ||
                                                index %
                                                Math.ceil(
                                                    chart.points.length / 6,
                                                ) ===
                                                0) && (
                                                    <text
                                                        x={point.x}
                                                        y={chart.height - 12}
                                                        textAnchor="middle"
                                                        fontSize="10"
                                                        fill="var(--muted)"
                                                    >
                                                        {formatDate(point.date)}
                                                    </text>
                                                )}
                                        </g>
                                    ))}
                                </svg>
                            </div>
                        )}
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
                        <div className="flex items-center justify-between border-b border-border px-5 py-4">
                            <div>
                                <h2 className="font-semibold text-foreground">
                                    Clinical Queue
                                </h2>
                                <p className="mt-1 text-xs text-muted">
                                    Items requiring attention
                                </p>
                            </div>
                            <Activity className="h-5 w-5 text-primary" />
                        </div>

                        <div className="divide-y divide-border">
                            <QueueRow
                                label="Pending review"
                                value={data.consultations.pending}
                                icon={Clock3}
                            />
                            <QueueRow
                                label="Under review"
                                value={data.consultations.inReview}
                                icon={Activity}
                            />
                            <QueueRow
                                label="Emergency cases"
                                value={data.consultations.emergency}
                                icon={AlertTriangle}
                                danger
                            />
                            <QueueRow
                                label="Lab reports ready"
                                value={data.labs.reportReady}
                                icon={FlaskConical}
                            />
                            <QueueRow
                                label="Open feedback"
                                value={data.feedback.open}
                                icon={Ticket}
                            />
                        </div>
                    </div>
                </section>

                <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
                        <div className="flex items-center justify-between border-b border-border px-5 py-4">
                            <div>
                                <h2 className="font-semibold text-foreground">
                                    Platform Overview
                                </h2>
                                <p className="mt-1 text-xs text-muted">
                                    Current system population
                                </p>
                            </div>
                            <Users className="h-5 w-5 text-primary" />
                        </div>

                        <div className="grid grid-cols-2 divide-x divide-y divide-border">
                            <StatCell
                                label="Patients"
                                value={data.overview.totalPatients}
                            />
                            <StatCell
                                label="Doctors"
                                value={data.overview.totalDoctors}
                            />
                            <StatCell
                                label="Active Doctors"
                                value={data.overview.activeDoctors}
                            />
                            <StatCell
                                label="Admins"
                                value={data.overview.totalAdmins}
                            />
                            <StatCell
                                label="Departments"
                                value={data.overview.totalDepartments}
                            />
                            <StatCell
                                label="Active Departments"
                                value={data.overview.activeDepartments}
                            />
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
                        <div className="flex items-center justify-between border-b border-border px-5 py-4">
                            <div>
                                <h2 className="font-semibold text-foreground">
                                    Service Snapshot
                                </h2>
                                <p className="mt-1 text-xs text-muted">
                                    Subscriptions, insurance and support
                                </p>
                            </div>
                            <ShieldCheck className="h-5 w-5 text-primary" />
                        </div>

                        <div className="divide-y divide-border">
                            <SnapshotRow
                                label="Active subscriptions"
                                value={data.subscriptions.active}
                                secondary={`${data.subscriptions.expiringSoon} expiring in 7 days`}
                            />
                            <SnapshotRow
                                label="Insurance claims"
                                value={data.insurance.totalClaims}
                                secondary={`${data.insurance.pendingClaims} pending`}
                            />
                            <SnapshotRow
                                label="Approved claims"
                                value={data.insurance.approvedClaims}
                                secondary="Current total"
                            />
                            <SnapshotRow
                                label="Support tickets"
                                value={data.feedback.total}
                                secondary={`${data.feedback.open} open · ${data.feedback.resolved} resolved`}
                            />
                        </div>
                    </div>
                </section>

                <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_1fr]">
                    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
                        <div className="flex items-center justify-between border-b border-border px-5 py-4">
                            <div>
                                <h2 className="font-semibold text-foreground">
                                    Department Workload
                                </h2>
                                <p className="mt-1 text-xs text-muted">
                                    Consultation distribution by department
                                </p>
                            </div>
                            <Building2 className="h-5 w-5 text-primary" />
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-border text-[11px] uppercase tracking-wider text-muted">
                                        <th className="px-5 py-3 font-medium">
                                            Department
                                        </th>
                                        <th className="px-5 py-3 text-right font-medium">
                                            Total
                                        </th>
                                        <th className="px-5 py-3 text-right font-medium">
                                            Pending
                                        </th>
                                        <th className="px-5 py-3 text-right font-medium">
                                            Review
                                        </th>
                                        <th className="px-5 py-3 text-right font-medium">
                                            Done
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {data.departments.map((department) => (
                                        <tr
                                            key={department.name}
                                            className="border-b border-border last:border-0"
                                        >
                                            <td className="px-5 py-4 text-sm font-medium text-foreground">
                                                {department.name}
                                            </td>
                                            <td className="px-5 py-4 text-right text-sm text-foreground">
                                                {formatNumber(
                                                    department.total,
                                                )}
                                            </td>
                                            <td className="px-5 py-4 text-right text-sm text-warning">
                                                {formatNumber(
                                                    department.pending,
                                                )}
                                            </td>
                                            <td className="px-5 py-4 text-right text-sm text-info">
                                                {formatNumber(
                                                    department.inReview,
                                                )}
                                            </td>
                                            <td className="px-5 py-4 text-right text-sm text-success">
                                                {formatNumber(
                                                    department.completed,
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
                        <div className="flex items-center justify-between border-b border-border px-5 py-4">
                            <div>
                                <h2 className="font-semibold text-foreground">
                                    Recent Activity
                                </h2>
                                <p className="mt-1 text-xs text-muted">
                                    Latest system actions
                                </p>
                            </div>
                            <ArrowUpRight className="h-5 w-5 text-primary" />
                        </div>

                        <div className="divide-y divide-border">
                            {data.recentLogs.map((log, index) => (
                                <button
                                    key={log._id || index}
                                    onClick={() => setSelectedLog(log)}
                                    className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-surface-secondary"
                                >
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-border bg-surface-secondary text-primary">
                                        <Activity className="h-4 w-4" />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium text-foreground">
                                            {formatAction(log.action_type)}
                                        </p>
                                        <p className="mt-1 truncate text-xs text-muted">
                                            {log.actor_id?.username ||
                                                log.actor_role ||
                                                "System"}{" "}
                                            ·{" "}
                                            {new Date(
                                                log.timestamp,
                                            ).toLocaleString("en-IN")}
                                        </p>
                                    </div>

                                    <ChevronRight className="h-4 w-4 shrink-0 text-muted" />
                                </button>
                            ))}

                            {!data.recentLogs.length && (
                                <div className="px-5 py-10 text-center text-sm text-muted">
                                    No recent activity.
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                <section className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border bg-border shadow-sm md:grid-cols-3">
                    <MiniMetric
                        icon={CreditCard}
                        label="Transactions"
                        value={formatNumber(data.finance.transactions)}
                        detail={`${formatCurrency(
                            data.finance.averageTransaction,
                        )} average`}
                    />
                    <MiniMetric
                        icon={CheckCircle2}
                        label="Completed Consultations"
                        value={formatNumber(
                            data.consultations.completed,
                        )}
                        detail={`${formatNumber(
                            data.today.consultations,
                        )} created today`}
                    />
                    <MiniMetric
                        icon={FlaskConical}
                        label="Completed Labs"
                        value={formatNumber(data.labs.completed)}
                        detail={`${formatNumber(
                            data.labs.collectionScheduled,
                        )} awaiting collection`}
                    />
                </section>
            </div>

            <LogDetailsModal
                isOpen={!!selectedLog}
                log={selectedLog}
                onClose={() => setSelectedLog(null)}
            />
        </main>
    );
}

function MetricCard({
    icon: Icon,
    label,
    value,
    detail,
}: {
    icon: typeof Users;
    label: string;
    value: string;
    detail: string;
}) {
    return (
        <div className="bg-surface px-5 py-5">
            <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-primary/25 bg-accent text-primary">
                    <Icon className="h-4 w-4" />
                </div>
                <span className="text-xs font-medium uppercase tracking-wider text-muted">
                    {label}
                </span>
            </div>

            <p className="mt-5 text-2xl font-semibold text-foreground">
                {value}
            </p>
            <p className="mt-1 text-xs text-muted">{detail}</p>
        </div>
    );
}

function QueueRow({
    label,
    value,
    icon: Icon,
    danger = false,
}: {
    label: string;
    value: number;
    icon: typeof Activity;
    danger?: boolean;
}) {
    return (
        <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
                <Icon
                    className={`h-4 w-4 ${danger ? "text-danger" : "text-primary"
                        }`}
                />
                <span className="text-sm text-muted">{label}</span>
            </div>

            <span
                className={`text-sm font-semibold ${danger ? "text-danger" : "text-foreground"
                    }`}
            >
                {formatNumber(value)}
            </span>
        </div>
    );
}

function StatCell({ label, value }: { label: string; value: number }) {
    return (
        <div className="px-5 py-5">
            <p className="text-xs text-muted">{label}</p>
            <p className="mt-2 text-xl font-semibold text-foreground">
                {formatNumber(value)}
            </p>
        </div>
    );
}

function SnapshotRow({
    label,
    value,
    secondary,
}: {
    label: string;
    value: number;
    secondary: string;
}) {
    return (
        <div className="flex items-center justify-between px-5 py-4">
            <div>
                <p className="text-sm font-medium text-foreground">
                    {label}
                </p>
                <p className="mt-1 text-xs text-muted">{secondary}</p>
            </div>

            <span className="text-lg font-semibold text-foreground">
                {formatNumber(value)}
            </span>
        </div>
    );
}

function MiniMetric({
    icon: Icon,
    label,
    value,
    detail,
}: {
    icon: typeof CreditCard;
    label: string;
    value: string;
    detail: string;
}) {
    return (
        <div className="flex items-center gap-4 bg-surface px-5 py-5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-primary/25 bg-accent text-primary">
                <Icon className="h-4 w-4" />
            </div>

            <div>
                <p className="text-xs uppercase tracking-wider text-muted">
                    {label}
                </p>
                <p className="mt-1 text-lg font-semibold text-foreground">
                    {value}
                </p>
                <p className="text-xs text-muted">{detail}</p>
            </div>
        </div>
    );
}