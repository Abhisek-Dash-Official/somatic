"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUserStore } from "@/store/useUserStore";
import {
    Loader2,
    PlusCircle,
    Activity,
    FileText,
    Calendar,
    MessageSquare,
    AlertCircle,
    CheckCircle2,
    Clock,
    Stethoscope,
} from "lucide-react";

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
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const formatDate = (dateString: string) =>
        new Date(dateString).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });

    const StatusBadge = ({ status }: { status: string }) => {
        switch (status) {
            case "pending_review":
                return (
                    <span className="rounded-full border border-warning/20 bg-warning/10 px-3 py-1 text-xs font-semibold text-warning">
                        Pending
                    </span>
                );
            case "in_review":
                return (
                    <span className="rounded-full border border-info/20 bg-info/10 px-3 py-1 text-xs font-semibold text-info">
                        In Review
                    </span>
                );
            case "completed":
                return (
                    <span className="rounded-full border border-success/20 bg-success/10 px-3 py-1 text-xs font-semibold text-success">
                        Completed
                    </span>
                );
            default:
                return (
                    <span className="rounded-full bg-surface-secondary px-3 py-1 text-xs font-semibold text-muted">
                        {status}
                    </span>
                );
        }
    };

    return (
        <div className="mx-auto max-w-6xl space-y-8">
            <div className="flex flex-col items-start justify-between gap-6 rounded-xl border border-border bg-surface p-6 sm:flex-row sm:items-center sm:p-8">
                <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-primary/30 bg-accent">
                        <img
                            src={`/avatars/avatar-${user?.avatar_id || "0"}.png`}
                            alt="Patient Avatar"
                            className="h-full w-full object-cover"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = "/avatars/avatar-1.png";
                            }}
                        />
                    </div>

                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                            Hi, {user?.username}
                        </h1>

                        <p className="mt-1 flex items-center gap-2 text-muted">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success" />
                            </span>
                            Patient Portal
                        </p>
                    </div>
                </div>

                <Link
                    href="/patient/consultations/new"
                    className="group flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3.5 font-bold text-primary-foreground transition hover:bg-primary-hover sm:w-auto"
                >
                    <PlusCircle className="h-5 w-5 transition-transform group-hover:rotate-90" />
                    New Consultation
                </Link>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="flex items-center gap-4 rounded-xl border border-border bg-surface p-6">
                    <div className="rounded-lg bg-primary/10 p-3 text-primary">
                        <FileText className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm text-muted">Total Cases</p>
                        <p className="text-xl font-bold text-foreground">{data?.stats.total || 0}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 rounded-xl border border-border bg-surface p-6">
                    <div className="rounded-lg bg-warning/10 p-3 text-warning">
                        <Clock className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm text-muted">Active Cases</p>
                        <p className="text-xl font-bold text-foreground">{data?.stats.active || 0}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 rounded-xl border border-border bg-surface p-6">
                    <div className="rounded-lg bg-accent p-3 text-accent-foreground">
                        <Calendar className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm text-muted">Next Follow-up</p>
                        <p className="text-base font-bold text-foreground">
                            {data?.nextFollowUp ? formatDate(data.nextFollowUp) : "None"}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4 rounded-xl border border-border bg-surface p-6">
                    <div className="rounded-lg bg-danger/10 p-3 text-danger">
                        <Activity className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm text-muted">Blood Group</p>
                        <p className="text-xl font-bold text-foreground">
                            {user?.patient_info?.blood_grp || "N/A"}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="rounded-xl border border-border bg-surface p-6 sm:p-8 lg:col-span-2">
                    <div className="mb-6 flex items-center justify-between">
                        <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
                            <Stethoscope className="h-5 w-5 text-primary" />
                            Recent Consultations
                        </h2>

                        <Link
                            href="/patient/consultations"
                            className="text-sm font-medium text-primary transition hover:text-primary-hover"
                        >
                            View All
                        </Link>
                    </div>

                    <div className="space-y-4">
                        {data?.consultations && data.consultations.length > 0 ? (
                            data.consultations.map((consult) => (
                                <Link
                                    key={consult._id}
                                    href={`/patient/consultations/${consult._id}`}
                                    className="block rounded-lg border border-border bg-surface-secondary p-5 transition hover:border-primary/40 hover:bg-accent"
                                >
                                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                                        <div>
                                            <p className="mb-1 text-sm text-muted">
                                                {formatDate(consult.created_at)}
                                            </p>
                                            <h3 className="line-clamp-1 font-semibold text-foreground">
                                                {consult.patient_input?.symptoms_raw_text || "No symptoms recorded"}
                                            </h3>
                                        </div>

                                        <StatusBadge status={consult.status} />
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="rounded-lg border border-dashed border-border py-10 text-center">
                                <p className="text-muted">No consultations found.</p>
                                <Link
                                    href="/patient/consultations/new"
                                    className="mt-2 inline-block text-primary hover:underline"
                                >
                                    Start your first case
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                <div className="rounded-xl border border-border bg-surface p-6 sm:p-8">
                    <div className="mb-6 flex items-center justify-between">
                        <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
                            <MessageSquare className="h-5 w-5 text-primary" />
                            Support Tickets
                        </h2>
                    </div>

                    <div className="space-y-4">
                        {data?.feedbacks && data.feedbacks.length > 0 ? (
                            data.feedbacks.map((ticket) => (
                                <div
                                    key={ticket._id}
                                    className="rounded-lg border border-border bg-surface-secondary p-4"
                                >
                                    <div className="mb-2 flex items-start justify-between gap-2">
                                        <span className="text-sm font-semibold text-foreground">
                                            {ticket.ticket_type}
                                        </span>

                                        {ticket.status === "Open" ? (
                                            <AlertCircle className="h-4 w-4 text-warning" />
                                        ) : (
                                            <CheckCircle2 className="h-4 w-4 text-success" />
                                        )}
                                    </div>

                                    <p className="line-clamp-2 text-xs text-muted">
                                        {ticket.message}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <div className="rounded-lg border border-dashed border-border py-8 text-center">
                                <p className="text-xs text-muted">No recent tickets.</p>
                            </div>
                        )}

                        <Link
                            href="/contact"
                            className="mt-4 block text-center text-sm font-medium text-primary transition hover:text-primary-hover"
                        >
                            Create New Ticket
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}