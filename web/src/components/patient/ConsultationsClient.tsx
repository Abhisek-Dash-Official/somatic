"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Clock, CheckCircle, FileText, AlertTriangle, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

interface Consultation {
    _id: string;
    status: string;
    created_at: string;
    is_emergency: boolean;
    chief_complaints: string[];
}

interface Props {
    consultations: Consultation[];
    pagination: { total: number; page: number; limit: number; totalPages: number };
    activeTab: "completed" | "pending";
    counts: { completed: number; pending: number };
}

export default function ConsultationsClient({ consultations, pagination, activeTab, counts }: Props) {
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

    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });

    return (
        <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
            <section className="flex flex-col justify-between gap-5 rounded-2xl border border-border bg-surface p-5 shadow-sm sm:flex-row sm:items-center sm:p-7">
                <div className="flex min-w-0 items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent text-primary">
                        <StethoscopeIcon />
                    </div>

                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-primary">Patient Care</p>
                        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                            My Consultations
                        </h1>
                        <p className="mt-1 text-sm text-muted">
                            Review your AI drafts and doctor prescriptions.
                        </p>
                    </div>
                </div>

                <Link
                    href="/patient/consultations/new"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover sm:w-auto"
                >
                    <Plus className="h-4 w-4" />
                    New Consultation
                </Link>
            </section>

            <section className="rounded-2xl border border-border bg-surface shadow-sm">
                <div className="flex overflow-x-auto border-b border-border px-3 sm:px-5">
                    <TabButton
                        active={activeTab === "completed"}
                        icon={CheckCircle}
                        label={`Completed (${counts.completed})`}
                        onClick={() => handleTabChange("completed")}
                    />
                    <TabButton
                        active={activeTab === "pending"}
                        icon={Clock}
                        label={`Pending / In Review (${counts.pending})`}
                        onClick={() => handleTabChange("pending")}
                    />
                </div>

                <div className="p-4 sm:p-6">
                    {consultations.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-5 py-14 text-center">
                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-muted">
                                <FileText className="h-7 w-7" />
                            </div>

                            <h3 className="text-lg font-semibold text-foreground">
                                No {activeTab} consultations
                            </h3>

                            <p className="mt-1 text-sm text-muted">
                                You do not have any {activeTab} records at the moment.
                            </p>

                            {activeTab === "pending" && (
                                <Link
                                    href="/patient/consultations/new"
                                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover"
                                >
                                    <Plus className="h-4 w-4" />
                                    Start Consultation
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {consultations.map((consultation) => (
                                <Link
                                    key={consultation._id}
                                    href={`/patient/consultations/${consultation._id}`}
                                    className="group block"
                                >
                                    <article className={`relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border bg-surface p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md ${consultation.is_emergency ? "border-danger/30" : "border-border"}`}>
                                        {consultation.is_emergency && (
                                            <div className="absolute inset-y-0 left-0 w-1 bg-danger" />
                                        )}

                                        <div>
                                            <div className="flex items-start justify-between gap-3">
                                                <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${getStatusClass(consultation.status)}`}>
                                                    {consultation.status.replaceAll("_", " ")}
                                                </span>

                                                <span className="text-xs text-muted">
                                                    {formatDate(consultation.created_at)}
                                                </span>
                                            </div>

                                            <h3 className="mt-5 flex items-start gap-2 text-sm font-semibold leading-6 text-foreground transition group-hover:text-primary">
                                                {consultation.is_emergency && (
                                                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
                                                )}
                                                <span className="line-clamp-2">
                                                    {consultation.chief_complaints?.join(", ") || "General Symptoms"}
                                                </span>
                                            </h3>
                                        </div>

                                        <div className="mt-6 flex items-center justify-between border-t border-border pt-4 text-sm">
                                            <span className={consultation.status === "completed" ? "font-medium text-success" : "font-medium text-primary"}>
                                                {consultation.status === "completed" ? "View Prescription" : "View Details"}
                                            </span>

                                            <ArrowRight className="h-4 w-4 text-muted transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                                        </div>
                                    </article>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {pagination.totalPages > 1 && (
                <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-border bg-surface p-4 shadow-sm sm:flex-row">
                    <button
                        type="button"
                        disabled={pagination.page <= 1}
                        onClick={() => handlePageChange(pagination.page - 1)}
                        className="inline-flex w-full items-center justify-center gap-1 rounded-xl border border-border bg-surface-secondary px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-30 sm:w-auto"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                    </button>

                    <span className="text-sm text-muted">
                        Page <strong className="text-foreground">{pagination.page}</strong> of{" "}
                        <strong className="text-foreground">{pagination.totalPages}</strong>
                    </span>

                    <button
                        type="button"
                        disabled={pagination.page >= pagination.totalPages}
                        onClick={() => handlePageChange(pagination.page + 1)}
                        className="inline-flex w-full items-center justify-center gap-1 rounded-xl border border-border bg-surface-secondary px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-30 sm:w-auto"
                    >
                        Next
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            )}
        </div>
    );
}

function TabButton({ active, icon: Icon, label, onClick }: { active: boolean; icon: any; label: string; onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`relative flex shrink-0 items-center gap-2 px-3 py-4 text-sm font-medium transition sm:px-4 ${active ? "text-primary" : "text-muted hover:text-foreground"}`}
        >
            <Icon className="h-4 w-4" />
            {label}
            {active && <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-primary" />}
        </button>
    );
}

function getStatusClass(status: string) {
    if (status === "completed") return "border-success/20 bg-success/10 text-success";
    if (status === "in_review") return "border-info/20 bg-info/10 text-info";
    return "border-warning/20 bg-warning/10 text-warning";
}

function StethoscopeIcon() {
    return <FileText className="h-5 w-5" />;
}