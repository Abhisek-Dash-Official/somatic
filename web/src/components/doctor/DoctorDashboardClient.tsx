"use client";

import { useEffect, useState } from "react";
import { useUserStore } from "@/store/useUserStore";
import { toast } from "react-toastify";
import Link from "next/link";
import { Activity, AlertTriangle, ArrowRight, Building2, CheckCircle2, Clock3, Loader2, Power, Stethoscope, Users } from "lucide-react";

interface DashboardData {
    stats: {
        total: number;
        pending: number;
        in_review: number;
        completed: number;
        emergency: number;
        department_pending: number;
        department_emergency: number;
    };
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
        if (!isFetched) fetchUser();
    }, [isFetched, fetchUser]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const res = await fetch("/api/doctor/dashboard", { cache: "no-store" });

                if (!res.ok) {
                    toast.error("Failed to load dashboard data");
                    return;
                }

                setData(await res.json());
            } catch {
                toast.error("Network error");
            } finally {
                setLoading(false);
            }
        };

        if (user && (user.role === "doctor" || user.role === "assistant_doctor")) {
            fetchDashboardData();
            const interval = setInterval(fetchDashboardData, 15000);
            return () => clearInterval(interval);
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

            if (!res.ok) throw new Error("Update failed");

            setData({ ...data, isAcceptingCases: newStatus });
            toast.success(newStatus ? "You are now accepting new cases." : "You are on break.");
        } catch {
            toast.error("Could not update availability.");
        } finally {
            setToggling(false);
        }
    };

    if (!isFetched || loading) {
        return (
            <div className="flex items-center justify-center py-32">
                <Loader2 className="h-9 w-9 animate-spin text-primary" />
            </div>
        );
    }

    if (user?.role !== "doctor" && user?.role !== "assistant_doctor") {
        return (
            <div className="border border-danger/20 bg-danger/10 px-5 py-10 text-center text-danger">
                <AlertTriangle className="mx-auto mb-3 h-9 w-9" />
                <p className="font-semibold">Access Denied</p>
                <p className="mt-1 text-sm">Doctor privileges are required.</p>
            </div>
        );
    }

    if (!data?.stats) {
        return (
            <div className="border border-warning/20 bg-warning/10 px-5 py-10 text-center">
                <AlertTriangle className="mx-auto mb-3 h-9 w-9 text-warning" />
                <p className="font-medium text-foreground">Failed to load dashboard data.</p>
            </div>
        );
    }

    const stats = data.stats;

    return (
        <div className="space-y-6">
            <header className="flex flex-col justify-between gap-5 border-b border-border pb-6 lg:flex-row lg:items-center">
                <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden border border-primary/20 bg-primary/10">
                        <img
                            src={`/avatars/avatar-${user?.avatar_id || "0"}.png`}
                            alt="Doctor Avatar"
                            className="h-full w-full object-cover"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = "/avatars/avatar-1.png";
                            }}
                        />
                    </div>

                    <div className="min-w-0">
                        <p className="text-xs font-medium uppercase tracking-wider text-muted">Doctor Control Center</p>
                        <h1 className="mt-1 truncate text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                            Dr. {user?.username}
                        </h1>
                        <div className="mt-1 flex items-center gap-2 text-sm text-muted">
                            <Building2 className="h-4 w-4 shrink-0 text-primary" />
                            <span className="truncate">{data.departmentName || "General"}</span>
                        </div>
                    </div>
                </div>

                <button
                    onClick={toggleAvailability}
                    disabled={toggling}
                    className={`flex items-center justify-center gap-2 border px-5 py-2.5 text-sm font-semibold transition sm:w-auto ${data.isAcceptingCases
                        ? "border-success/30 bg-success/10 text-success hover:bg-success/15"
                        : "border-border bg-surface-secondary text-muted hover:border-primary/30 hover:text-foreground"
                        }`}
                >
                    {toggling ? <Loader2 className="h-4 w-4 animate-spin" /> : <Power className="h-4 w-4" />}
                    {data.isAcceptingCases ? "Accepting Cases" : "Currently On Break"}
                </button>
            </header>

            <section className="grid grid-cols-2 gap-px border border-border bg-border lg:grid-cols-4">
                <MetricCard title="My Cases" value={stats.total} icon={Stethoscope} iconClass="text-primary bg-primary/10" />
                <MetricCard title="Department Queue" value={stats.department_pending} icon={Users} iconClass="text-warning bg-warning/10" />
                <MetricCard title="In Review" value={stats.in_review} icon={Clock3} iconClass="text-info bg-info/10" />
                <MetricCard title="Completed" value={stats.completed} icon={CheckCircle2} iconClass="text-success bg-success/10" />
            </section>

            <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="border border-border bg-surface lg:col-span-2">
                    <div className="flex items-center justify-between border-b border-border p-5">
                        <div>
                            <h2 className="font-semibold text-foreground">Clinical Overview</h2>
                            <p className="mt-1 text-xs text-muted">Current workload and department activity</p>
                        </div>
                        <Activity className="h-5 w-5 text-primary" />
                    </div>

                    <div className="grid grid-cols-2 divide-x divide-y divide-border sm:grid-cols-4 sm:divide-y-0">
                        <OverviewItem label="Pending My Cases" value={stats.pending} />
                        <OverviewItem label="In Review" value={stats.in_review} />
                        <OverviewItem label="Claimed SOS Cases" value={stats.emergency} valueClass="text-danger" />
                        <OverviewItem label="Department SOS" value={stats.department_emergency} valueClass="text-danger" />
                    </div>
                </div>

                <div className="border border-border bg-surface">
                    <div className="border-b border-border p-5">
                        <h2 className="font-semibold text-foreground">Availability</h2>
                        <p className="mt-1 text-xs text-muted">Your current consultation status</p>
                    </div>

                    <div className="p-5">
                        <div className={`flex items-center gap-3 border p-4 ${data.isAcceptingCases ? "border-success/20 bg-success/10" : "border-border bg-surface-secondary"}`}>
                            <div className={`h-2.5 w-2.5 ${data.isAcceptingCases ? "bg-success" : "bg-muted-foreground"}`} />
                            <div>
                                <p className={`text-sm font-semibold ${data.isAcceptingCases ? "text-success" : "text-foreground"}`}>
                                    {data.isAcceptingCases ? "Available for Cases" : "On Break"}
                                </p>
                                <p className="mt-1 text-xs text-muted">
                                    {data.isAcceptingCases ? "New department cases can be assigned to you." : "You are currently not accepting new cases."}
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={toggleAvailability}
                            disabled={toggling}
                            className="mt-4 flex w-full items-center justify-center gap-2 border border-border bg-surface-secondary px-4 py-2.5 text-sm font-medium text-foreground transition hover:border-primary/30 hover:text-primary"
                        >
                            <Power className="h-4 w-4" />
                            Change Availability
                        </button>
                    </div>
                </div>
            </section>

            <section className="border border-border bg-surface">
                <div className="flex flex-col justify-between gap-3 border-b border-border p-5 sm:flex-row sm:items-center">
                    <div>
                        <h2 className="font-semibold text-foreground">Action Required</h2>
                        <p className="mt-1 text-xs text-muted">Cases assigned to you and cases waiting in your department</p>
                    </div>

                    <span className="border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
                        {data.activeCases?.length || 0} Active
                    </span>
                </div>

                <div className="divide-y divide-border">
                    {!data.activeCases?.length ? (
                        <div className="px-5 py-12 text-center">
                            <CheckCircle2 className="mx-auto mb-3 h-9 w-9 text-success/50" />
                            <p className="text-sm font-medium text-foreground">Your queue is clear.</p>
                            <p className="mt-1 text-xs text-muted">There are no active consultations requiring your attention.</p>
                        </div>
                    ) : (
                        data.activeCases.map((caseItem) => {
                            const isUnclaimed = !caseItem.claimed_by_doctor_id && caseItem.status === "pending_review";
                            const isEmergency = caseItem.ai_draft?.is_emergency;

                            return (
                                <div key={caseItem._id} className="flex flex-col gap-4 p-5 transition hover:bg-surface-secondary lg:flex-row lg:items-center lg:justify-between">
                                    <div className="min-w-0 flex-1">
                                        <div className="mb-2 flex flex-wrap items-center gap-2">
                                            {isEmergency && (
                                                <span className="flex items-center gap-1 border border-danger/20 bg-danger/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-danger">
                                                    <AlertTriangle className="h-3 w-3" />
                                                    Emergency
                                                </span>
                                            )}

                                            <span className={`border px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${isUnclaimed
                                                ? "border-warning/20 bg-warning/10 text-warning"
                                                : caseItem.status === "in_review"
                                                    ? "border-info/20 bg-info/10 text-info"
                                                    : "border-primary/20 bg-primary/10 text-primary"
                                                }`}>
                                                {caseItem.status.replaceAll("_", " ")}
                                            </span>

                                            {caseItem.patient_input?.age !== undefined && (
                                                <span className="border border-border bg-surface-secondary px-2 py-1 text-[10px] text-muted">
                                                    Age {caseItem.patient_input.age}
                                                </span>
                                            )}

                                            <span className="text-[10px] text-muted">
                                                {new Date(caseItem.created_at).toLocaleDateString()}
                                            </span>
                                        </div>

                                        <h3 className="line-clamp-2 text-sm font-semibold text-foreground sm:text-base">
                                            {caseItem.ai_draft?.chief_complaints?.join(", ") || "Awaiting patient symptoms"}
                                        </h3>

                                        {caseItem.ai_draft?.chief_complaints?.length > 0 && (
                                            <p className="mt-1 text-xs text-muted">
                                                {caseItem.ai_draft.chief_complaints.length} reported complaint{caseItem.ai_draft.chief_complaints.length > 1 ? "s" : ""}
                                            </p>
                                        )}
                                    </div>

                                    <Link
                                        href={`/doctor/consultations/${caseItem._id}`}
                                        className={`flex w-full shrink-0 items-center justify-center gap-2 border px-5 py-2.5 text-sm font-semibold transition lg:w-auto ${isUnclaimed
                                            ? "border-primary bg-primary text-primary-foreground hover:bg-primary-hover"
                                            : "border-border bg-surface-secondary text-foreground hover:border-primary/30 hover:text-primary"
                                            }`}
                                    >
                                        {isUnclaimed ? "Claim & Review" : "Continue Review"}
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </div>
                            );
                        })
                    )}
                </div>
            </section>
        </div>
    );
}

function MetricCard({ title, value, icon: Icon, iconClass }: { title: string; value: number; icon: any; iconClass: string }) {
    return (
        <div className="bg-surface p-5 sm:p-6">
            <div className={`mb-4 flex h-9 w-9 items-center justify-center border border-border ${iconClass}`}>
                <Icon className="h-4 w-4" />
            </div>
            <p className="text-xs text-muted sm:text-sm">{title}</p>
            <p className="mt-1 text-2xl font-semibold text-foreground sm:text-3xl">{value}</p>
        </div>
    );
}

function OverviewItem({ label, value, valueClass = "text-foreground" }: { label: string; value: number; valueClass?: string }) {
    return (
        <div className="bg-surface px-4 py-5 sm:px-5">
            <p className="text-xs leading-5 text-muted">{label}</p>
            <p className={`mt-2 text-xl font-semibold ${valueClass}`}>{value}</p>
        </div>
    );
}