"use client";

import { useEffect, useState } from "react";
import { useUserStore } from "@/store/useUserStore";
import { toast } from "react-toastify";
import Link from "next/link";
import {
    Activity,
    Users,
    CheckCircle,
    AlertTriangle,
    Loader2,
    Power,
    Building2,
} from "lucide-react";

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

        if (
            user &&
            (user.role === "doctor" || user.role === "assistant_doctor")
        ) {
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
                body: JSON.stringify({
                    doctor_info: { is_accepting_cases: newStatus },
                }),
            });

            if (res.ok) {
                setData({ ...data, isAcceptingCases: newStatus });
                toast.success(
                    newStatus
                        ? "You are now accepting new cases."
                        : "You are on break.",
                );
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
        return (
            <div className="flex justify-center items-center py-32">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
        );
    }

    if (user?.role !== "doctor" && user?.role !== "assistant_doctor") {
        return (
            <div className="text-center py-20 text-danger font-bold text-xl">
                Access Denied. Doctor privileges required.
            </div>
        );
    }

    if (!data || !data.stats) {
        return (
            <div className="text-center py-20 px-4">
                <AlertTriangle className="w-12 h-12 text-warning mx-auto mb-4" />
                <p className="text-muted font-medium text-lg">
                    Failed to load dashboard data.
                </p>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in duration-500 space-y-6 sm:space-y-8 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-surface p-5 sm:p-8 rounded-xl border border-border">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full xl:w-auto">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 overflow-hidden">
                        <img
                            src={`/avatars/avatar-${user?.avatar_id || "0"}.png`}
                            alt="Doctor Avatar"
                            className="h-full w-full object-cover"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                    "/avatars/avatar-1.png";
                            }}
                        />
                    </div>

                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                            Welcome, Dr. {user.username}
                        </h1>

                        <div className="flex items-center gap-2 mt-1 text-muted">
                            <Building2 className="w-4 h-4 text-primary shrink-0" />
                            <span className="text-sm font-medium text-primary truncate">
                                Department:{" "}
                                {data.departmentName ||
                                    "Assigned Medical Department"}
                            </span>
                        </div>
                    </div>
                </div>

                <button
                    onClick={toggleAvailability}
                    disabled={toggling}
                    className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all border w-full xl:w-auto ${data.isAcceptingCases
                            ? "bg-success/10 text-success border-success/20 hover:bg-success/20"
                            : "bg-surface-secondary text-muted border-border hover:bg-accent hover:text-foreground"
                        }`}
                >
                    {toggling ? (
                        <Loader2 className="w-5 h-5 animate-spin shrink-0" />
                    ) : (
                        <Power className="w-5 h-5 shrink-0" />
                    )}
                    {data.isAcceptingCases
                        ? "Accepting Cases"
                        : "Currently On Break"}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                <div className="bg-surface p-5 sm:p-6 rounded-xl border border-primary/20">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-muted text-xs sm:text-sm font-medium mb-1 truncate">
                                Department Queue
                            </p>
                            <h3 className="text-2xl sm:text-3xl font-bold text-foreground">
                                {data.stats.pending || 0}
                            </h3>
                        </div>

                        <div className="p-3 bg-primary/10 rounded-lg text-primary shrink-0">
                            <Activity className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                    </div>
                </div>

                <div className="bg-surface p-5 sm:p-6 rounded-xl border border-success/20">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-muted text-xs sm:text-sm font-medium mb-1 truncate">
                                Completed Cases
                            </p>
                            <h3 className="text-2xl sm:text-3xl font-bold text-foreground">
                                {data.stats.completed || 0}
                            </h3>
                        </div>

                        <div className="p-3 bg-success/10 rounded-lg text-success shrink-0">
                            <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                    </div>
                </div>

                <div className="bg-surface p-5 sm:p-6 rounded-xl border border-border md:col-span-2 xl:col-span-1">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-muted text-xs sm:text-sm font-medium mb-1 truncate">
                                Total Handled
                            </p>
                            <h3 className="text-2xl sm:text-3xl font-bold text-foreground">
                                {data.stats.total || 0}
                            </h3>
                        </div>

                        <div className="p-3 bg-surface-secondary rounded-lg text-muted shrink-0">
                            <Users className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-surface rounded-xl border border-border overflow-hidden">
                <div className="p-5 sm:p-6 border-b border-border flex flex-wrap justify-between items-center gap-3 bg-surface-secondary">
                    <h2 className="text-lg sm:text-xl font-bold text-foreground">
                        Action Required Queue
                    </h2>

                    <span className="bg-primary/10 text-primary text-xs px-3 py-1.5 rounded-full font-semibold border border-primary/20 whitespace-nowrap">
                        {data.activeCases?.length || 0} Pending
                    </span>
                </div>

                <div className="divide-y divide-border">
                    {!data.activeCases || data.activeCases.length === 0 ? (
                        <div className="p-8 sm:p-10 text-center text-muted-foreground">
                            <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 opacity-20" />
                            <p className="text-sm sm:text-base">
                                Your queue is empty. Great job!
                            </p>
                        </div>
                    ) : (
                        data.activeCases.map((caseItem) => {
                            const isUnclaimed =
                                caseItem.status === "pending_review";

                            return (
                                <div
                                    key={caseItem._id}
                                    className="p-5 sm:p-6 hover:bg-surface-secondary/70 transition-colors flex flex-col xl:flex-row justify-between items-start xl:items-center gap-5 group"
                                >
                                    <div className="w-full xl:w-auto">
                                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                                            {caseItem.ai_draft?.is_emergency && (
                                                <span className="flex items-center gap-1 bg-danger/10 text-danger text-[10px] sm:text-xs px-2 py-1 rounded border border-danger/20 font-bold uppercase tracking-wider shrink-0">
                                                    <AlertTriangle className="w-3 h-3" />
                                                    SOS
                                                </span>
                                            )}

                                            <span
                                                className={`px-2 py-1 text-[10px] sm:text-xs font-semibold rounded border shrink-0 ${isUnclaimed
                                                        ? "bg-warning/10 text-warning border-warning/20"
                                                        : "bg-info/10 text-info border-info/20"
                                                    }`}
                                            >
                                                {caseItem.status
                                                    .replace("_", " ")
                                                    .toUpperCase()}
                                            </span>

                                            <span className="text-muted-foreground text-[10px] sm:text-xs font-medium bg-surface-secondary px-2 py-1 rounded shrink-0">
                                                Age: {caseItem.patient_input?.age}
                                            </span>

                                            <span className="text-muted-foreground text-[10px] sm:text-xs shrink-0 whitespace-nowrap">
                                                {new Date(
                                                    caseItem.created_at,
                                                ).toLocaleDateString()}
                                            </span>
                                        </div>

                                        <h3 className="text-sm sm:text-base text-foreground font-semibold group-hover:text-primary transition-colors line-clamp-2">
                                            {caseItem.ai_draft?.chief_complaints?.join(
                                                ", ",
                                            ) || "Awaiting symptoms..."}
                                        </h3>
                                    </div>

                                    <Link
                                        href={`/doctor/consultations/${caseItem._id}`}
                                        className={`w-full xl:w-auto text-center shrink-0 border px-5 py-3 xl:py-2.5 rounded-xl font-semibold text-sm transition-all ${isUnclaimed
                                                ? "bg-primary text-primary-foreground border-primary hover:bg-primary-hover"
                                                : "bg-surface-secondary text-muted border-border hover:bg-accent hover:text-foreground"
                                            }`}
                                    >
                                        {isUnclaimed
                                            ? "Claim & Review"
                                            : "Continue Review"}
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