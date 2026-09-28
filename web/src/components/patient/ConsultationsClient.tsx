"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
    Plus,
    Clock,
    CheckCircle,
    FileText,
    AlertTriangle,
    ArrowRight,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

export default function ConsultationsClient({
    consultations,
    pagination,
    activeTab,
    counts,
}: {
    consultations: any[];
    pagination: { total: number; page: number; limit: number; totalPages: number };
    activeTab: "completed" | "pending";
    counts: { completed: number; pending: number };
}) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleTabChange = (tab: "completed" | "pending") => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("tab", tab);
        params.set("page", "1");
        router.push(`?${params.toString()}`);
    };

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", newPage.toString());
        router.push(`?${params.toString()}`);
    };

    return (
        <div className="mx-auto mt-8 max-w-5xl p-6">
            <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">
                        My Consultations
                    </h1>
                    <p className="mt-1 text-muted">
                        Review your AI drafts and doctor prescriptions.
                    </p>
                </div>

                <Link
                    href="/patient/consultations/new"
                    className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-medium text-primary-foreground transition hover:bg-primary-hover"
                >
                    <Plus className="h-5 w-5" />
                    New Consultation
                </Link>
            </div>

            <div className="mb-6 flex gap-4 border-b border-border">
                <button
                    onClick={() => handleTabChange("completed")}
                    className={`flex items-center gap-2 border-b-2 px-2 pb-3 font-medium transition ${activeTab === "completed"
                            ? "border-primary text-primary"
                            : "border-transparent text-muted hover:text-foreground"
                        }`}
                >
                    <CheckCircle className="h-4 w-4" />
                    Completed ({counts.completed})
                </button>

                <button
                    onClick={() => handleTabChange("pending")}
                    className={`flex items-center gap-2 border-b-2 px-2 pb-3 font-medium transition ${activeTab === "pending"
                            ? "border-primary text-primary"
                            : "border-transparent text-muted hover:text-foreground"
                        }`}
                >
                    <Clock className="h-4 w-4" />
                    Pending / In Review ({counts.pending})
                </button>
            </div>

            {consultations.length === 0 ? (
                <div className="flex flex-col items-center rounded-xl border border-border bg-surface p-12 text-center">
                    <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
                    <h3 className="mb-2 text-lg font-medium text-foreground">
                        No {activeTab} consultations
                    </h3>
                    <p className="text-muted">
                        You do not have any {activeTab} records at the moment.
                    </p>
                </div>
            ) : (
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {consultations.map((consultation: any) => (
                        <Link
                            key={consultation._id}
                            href={`/patient/consultations/${consultation._id}`}
                            className="group block"
                        >
                            <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-xl border border-border bg-surface p-5 transition hover:border-primary/40 hover:bg-surface-secondary">
                                {consultation.is_emergency && (
                                    <div className="absolute left-0 top-0 h-full w-1 bg-danger" />
                                )}

                                <div>
                                    <div className="mb-4 flex items-start justify-between gap-3">
                                        <span
                                            className={`rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${consultation.status === "completed"
                                                    ? "border-success/20 bg-success/10 text-success"
                                                    : consultation.status === "in_review"
                                                        ? "border-info/20 bg-info/10 text-info"
                                                        : "border-warning/20 bg-warning/10 text-warning"
                                                }`}
                                        >
                                            {consultation.status.replace("_", " ")}
                                        </span>

                                        <span className="text-xs text-muted-foreground">
                                            {new Date(consultation.created_at)
                                                .toISOString()
                                                .split("T")[0]
                                                .split("-")
                                                .reverse()
                                                .join("/")}
                                        </span>
                                    </div>

                                    <h3 className="mb-2 flex items-center gap-2 line-clamp-1 font-semibold text-foreground transition group-hover:text-primary">
                                        {consultation.is_emergency && (
                                            <AlertTriangle className="h-4 w-4 shrink-0 text-danger" />
                                        )}
                                        {consultation.chief_complaints?.join(", ") ||
                                            "General Symptoms"}
                                    </h3>
                                </div>

                                <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-sm">
                                    <span
                                        className={
                                            consultation.status === "completed"
                                                ? "text-success"
                                                : "text-primary"
                                        }
                                    >
                                        {consultation.status === "completed"
                                            ? "View Prescription"
                                            : "View Details"}
                                    </span>

                                    <ArrowRight className="h-4 w-4 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-primary" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {pagination.totalPages > 1 && (
                <div className="mt-8 flex items-center justify-between rounded-xl border border-border bg-surface p-4">
                    <button
                        disabled={pagination.page <= 1}
                        onClick={() => handlePageChange(pagination.page - 1)}
                        className="flex items-center gap-1 rounded-lg bg-surface-secondary px-4 py-2 text-sm font-medium text-foreground transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-30"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                    </button>

                    <span className="text-sm text-muted">
                        Page{" "}
                        <strong className="text-foreground">{pagination.page}</strong> of{" "}
                        <strong className="text-foreground">{pagination.totalPages}</strong>
                    </span>

                    <button
                        disabled={pagination.page >= pagination.totalPages}
                        onClick={() => handlePageChange(pagination.page + 1)}
                        className="flex items-center gap-1 rounded-lg bg-surface-secondary px-4 py-2 text-sm font-medium text-foreground transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-30"
                    >
                        Next
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            )}
        </div>
    );
}