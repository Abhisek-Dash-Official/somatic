"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUserStore } from "@/store/useUserStore";
import {
    Building2,
    Users,
    Stethoscope,
    AlertTriangle,
    Activity,
    Clock,
    BrainCircuit,
    Ticket,
    ShieldCheck,
    Loader2,
    List,
    ArrowRight,
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
        resolutionTimes: {
            _id: string;
            name: string;
            avgTimeSec: number;
        }[];
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

                if (!res.ok) {
                    throw new Error("Failed to fetch metrics");
                }

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
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center text-danger">
                <AlertTriangle className="mr-2 h-6 w-6" />
                {error || "Data load failed"}
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-7xl space-y-6 p-4 pt-20 text-foreground sm:space-y-8 sm:p-6 sm:pt-24 lg:p-8 lg:pt-8">
            {/* Header */}
            <div className="flex flex-col items-start gap-6 xl:flex-row xl:items-center">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-primary/30 bg-accent">
                    <img
                        src={`/avatars/avatar-${user?.avatar_id || "admin"}.png`}
                        alt="Admin Avatar"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src =
                                "/avatars/avatar-admin.png";
                        }}
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                        Welcome,{" "}
                        <span className="capitalize text-primary">
                            {user?.username || "Admin"}
                        </span>
                    </h1>

                    <p className="text-sm text-muted sm:text-base">
                        Real-time metrics and clinical workflow analytics.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2 2xl:grid-cols-4">
                {/* Consultations Card */}
                <div className="flex flex-col justify-between rounded-xl border border-border bg-surface p-5">
                    <div className="mb-4 flex items-center gap-3">
                        <div className="shrink-0 rounded-lg border border-primary/20 bg-primary/10 p-2">
                            <Activity className="h-5 w-5 text-primary" />
                        </div>

                        <h2 className="text-sm font-semibold text-foreground sm:text-base">
                            Consultations
                        </h2>
                    </div>

                    <div className="space-y-3 text-xs sm:text-sm">
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-muted">Pending Review</span>
                            <span className="shrink-0 font-mono text-foreground">
                                {data.consultations.pendingReview}
                            </span>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                            <span className="text-muted">Under Review</span>
                            <span className="shrink-0 font-mono text-foreground">
                                {data.consultations.underReview}
                            </span>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                            <span className="text-muted">Resolved</span>
                            <span className="shrink-0 font-mono text-success">
                                {data.consultations.resolved}
                            </span>
                        </div>

                        <div className="flex items-center justify-between gap-2 border-t border-border pt-2">
                            <span className="flex items-center gap-1 text-danger">
                                <AlertTriangle className="h-3 w-3 shrink-0" />
                                SOS Pending
                            </span>

                            <span className="shrink-0 font-mono font-bold text-danger">
                                {data.consultations.unresolvedEmergency}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Users Card */}
                <div className="flex flex-col justify-between rounded-xl border border-border bg-surface p-5">
                    <div className="mb-4 flex items-center gap-3">
                        <div className="shrink-0 rounded-lg border border-primary/20 bg-primary/10 p-2">
                            <Users className="h-5 w-5 text-primary" />
                        </div>

                        <h2 className="text-sm font-semibold text-foreground sm:text-base">
                            Users Network
                        </h2>
                    </div>

                    <div className="space-y-3 text-xs sm:text-sm">
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-muted">Total Patients</span>
                            <span className="shrink-0 font-mono text-foreground">
                                {data.users.patients}
                            </span>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                            <span className="text-muted">Total Doctors</span>
                            <span className="shrink-0 font-mono text-foreground">
                                {data.users.doctors}
                            </span>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                            <span className="text-muted">Active Doctors</span>
                            <span className="shrink-0 font-mono text-primary">
                                {data.users.activeDoctors}
                            </span>
                        </div>

                        <div className="flex items-center justify-between gap-2 border-t border-border pt-2">
                            <span className="flex items-center gap-1 text-muted">
                                <ShieldCheck className="h-3 w-3 shrink-0" />
                                System Admins
                            </span>

                            <span className="shrink-0 font-mono text-foreground">
                                {data.users.admins}
                            </span>
                        </div>
                    </div>
                </div>

                {/* AI Metrics Card */}
                <div className="flex flex-col justify-between rounded-xl border border-border bg-surface p-5">
                    <div className="mb-4 flex items-center gap-3">
                        <div className="shrink-0 rounded-lg border border-info/20 bg-info/10 p-2">
                            <BrainCircuit className="h-5 w-5 text-info" />
                        </div>

                        <h2 className="text-sm font-semibold text-foreground sm:text-base">
                            AI Engine
                        </h2>
                    </div>

                    <div className="space-y-3 text-xs sm:text-sm">
                        <div className="flex items-center justify-between gap-2">
                            <span className="whitespace-normal text-muted">
                                Avg Prompt Tokens
                            </span>

                            <span className="shrink-0 font-mono text-foreground">
                                {Math.round(data.ai.avgPromptTokens).toLocaleString()}
                            </span>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                            <span className="whitespace-normal text-muted">
                                Avg Completion Tokens
                            </span>

                            <span className="shrink-0 font-mono text-foreground">
                                {Math.round(
                                    data.ai.avgCompletionTokens
                                ).toLocaleString()}
                            </span>
                        </div>

                        <div className="flex items-center justify-between gap-2 border-t border-border pt-2">
                            <span className="flex items-center gap-1 text-muted">
                                <Clock className="h-3 w-3 shrink-0" />
                                Response Time
                            </span>

                            <span className="shrink-0 font-mono text-info">
                                {data.ai.avgResponseTime.toFixed(2)}s
                            </span>
                        </div>
                    </div>
                </div>

                {/* Departments & Tickets */}
                <div className="flex flex-col gap-4 sm:gap-6">
                    <div className="flex min-w-0 flex-1 flex-col justify-center rounded-xl border border-border bg-surface p-4 sm:p-5">
                        <div className="flex flex-row items-center justify-between gap-4">
                            <div className="flex min-w-0 items-center gap-3">
                                <div className="shrink-0 rounded-lg border border-primary/20 bg-primary/10 p-2">
                                    <Building2 className="h-4 w-4 text-primary" />
                                </div>

                                <span className="text-sm font-semibold text-foreground">
                                    Departments
                                </span>
                            </div>

                            <div className="flex shrink-0 items-baseline gap-1 text-right">
                                <span className="font-mono text-xl font-bold text-foreground sm:text-2xl">
                                    {data.departments.active}
                                </span>

                                <span className="text-xs text-muted-foreground">
                                    / {data.departments.total} Active
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col justify-center rounded-xl border border-border bg-surface p-4 sm:p-5">
                        <div className="mb-1 flex items-center justify-between gap-2">
                            <div className="flex min-w-0 items-center gap-3">
                                <div className="shrink-0 rounded-lg border border-warning/20 bg-warning/10 p-2">
                                    <Ticket className="h-4 w-4 text-warning" />
                                </div>

                                <span className="text-sm font-semibold text-foreground">
                                    Tickets
                                </span>
                            </div>

                            <span className="shrink-0 font-mono text-xl font-bold text-foreground sm:text-2xl">
                                {data.feedbacks.total}
                            </span>
                        </div>

                        <div className="mt-1 flex justify-between gap-2 text-xs text-muted">
                            <span>
                                Pending:
                                <span className="ml-1 font-mono text-warning">
                                    {data.feedbacks.pending}
                                </span>
                            </span>

                            <span className="text-right">
                                Resolved:
                                <span className="ml-1 font-mono text-success">
                                    {data.feedbacks.resolved}
                                </span>
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-4 flex flex-col gap-6 sm:gap-8 lg:flex-row">
                {/* Department Resolution Times */}
                <div className="flex min-w-0 flex-1 flex-col rounded-xl border border-border bg-surface p-5 sm:p-6">
                    <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-foreground sm:text-lg">
                        <Stethoscope className="h-5 w-5 text-primary" />
                        Department Analytics
                    </h2>

                    {data.departments.resolutionTimes.length === 0 ? (
                        <div className="flex min-h-50 flex-1 items-center justify-center">
                            <p className="w-full rounded-xl border border-dashed border-border py-6 text-center text-sm text-muted-foreground">
                                No completed consultations available.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-left">
                                <thead>
                                    <tr className="border-b border-border text-xs text-muted sm:text-sm">
                                        <th className="whitespace-nowrap pb-3 pl-2 font-medium sm:pl-4">
                                            Department Name
                                        </th>

                                        <th className="whitespace-nowrap pb-3 pr-2 text-right font-medium sm:pr-4">
                                            Avg. Resolution Time
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="text-xs sm:text-sm">
                                    {data.departments.resolutionTimes.map((dept) => {
                                        const minutes = Math.floor(
                                            dept.avgTimeSec / 60
                                        );
                                        const seconds = Math.floor(
                                            dept.avgTimeSec % 60
                                        );

                                        const timeString =
                                            minutes > 0
                                                ? `${minutes}m ${seconds}s`
                                                : `${seconds}s`;

                                        return (
                                            <tr
                                                key={dept._id}
                                                className="border-b border-border transition-colors hover:bg-accent"
                                            >
                                                <td className="py-3 pl-2 capitalize text-foreground sm:py-4 sm:pl-4">
                                                    {dept.name}
                                                </td>

                                                <td className="py-3 pr-2 text-right font-mono text-primary sm:py-4 sm:pr-4">
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
                <div className="flex min-w-0 flex-1 flex-col rounded-xl border border-border bg-surface p-5 sm:p-6">
                    <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-center sm:gap-4">
                        <h2 className="flex items-center gap-2 truncate text-base font-bold text-foreground sm:text-lg">
                            <List className="h-5 w-5 shrink-0 text-primary" />
                            Recent Activity
                        </h2>

                        <Link
                            href="/admin/logs"
                            className="flex w-fit items-center gap-1 text-xs text-primary transition-colors hover:text-primary-hover sm:text-sm"
                        >
                            View All
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>

                    {data.recentLogs.length === 0 ? (
                        <div className="flex min-h-50 flex-1 items-center justify-center">
                            <p className="w-full rounded-xl border border-dashed border-border py-6 text-center text-sm text-muted-foreground">
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
                                        className="flex cursor-pointer flex-col gap-1 rounded-lg border border-border bg-surface-secondary p-3 transition-colors hover:border-primary/30 hover:bg-accent"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <span className="truncate pr-2 text-xs font-semibold text-foreground sm:text-sm">
                                                {log.action_type.replace(/_/g, " ")}
                                            </span>

                                            <span className="shrink-0 whitespace-nowrap font-mono text-[10px] text-muted-foreground sm:text-xs">
                                                {logDate.toLocaleTimeString([], {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2 text-[10px] text-muted sm:text-xs">
                                            <span
                                                className={`shrink-0 rounded-md border px-1.5 py-0.5 capitalize sm:px-2 ${log.actor_role === "admin"
                                                        ? "border-danger/20 bg-danger/10 text-danger"
                                                        : log.actor_role === "doctor"
                                                            ? "border-primary/20 bg-primary/10 text-primary"
                                                            : "border-info/20 bg-info/10 text-info"
                                                    }`}
                                            >
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