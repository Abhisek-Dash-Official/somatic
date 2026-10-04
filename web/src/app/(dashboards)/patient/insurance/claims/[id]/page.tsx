"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AlertCircle, ArrowLeft, CalendarDays, ChevronRight, ExternalLink, FileText, ShieldCheck } from "lucide-react";
import { toast } from "react-toastify";
import type { IInsuranceClaim } from "@/types/models";
import InsuranceStatusBadge from "@/components/insurance/InsuranceStatusBadge";

const documentLabels: Record<string, string> = {
    claim_form: "Claim Form",
    hospital_bill: "Hospital Bill",
    discharge_summary: "Discharge Summary",
    prescription: "Prescription",
    lab_report: "Lab Report",
    medical_record: "Medical Record",
    id_proof: "ID Proof",
    other: "Other",
};

export default function PatientInsuranceClaimDetailPage() {
    const params = useParams();
    const claimId = params.id as string;

    const [claim, setClaim] = useState<IInsuranceClaim | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadClaim = async () => {
            try {
                const response = await fetch(`/api/insurance/claims/${claimId}`);
                const data = await response.json();

                if (!response.ok) throw new Error(data.error || "Failed to load claim");

                setClaim(data.claim as IInsuranceClaim);
            } catch (error) {
                toast.error(error instanceof Error ? error.message : "Failed to load claim");
            } finally {
                setLoading(false);
            }
        };

        loadClaim();
    }, [claimId]);

    const formatDate = (date?: Date | string) => {
        if (!date) return "—";
        return new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    };

    const formatDateTime = (date?: Date | string) => {
        if (!date) return "—";
        return new Date(date).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
    };

    const formatAmount = (amount?: number) => {
        if (amount === undefined || amount === null) return "—";
        return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
    };

    if (loading) {
        return (
            <main className="min-h-screen bg-background px-4 py-6 md:px-6">
                <div className="mx-auto max-w-6xl space-y-6">
                    <div className="h-5 w-32 animate-pulse rounded bg-surface-secondary" />
                    <div className="h-32 animate-pulse rounded-xl border border-border bg-surface" />
                    <div className="h-64 animate-pulse rounded-xl border border-border bg-surface" />
                </div>
            </main>
        );
    }

    if (!claim) {
        return (
            <main className="min-h-screen bg-background px-4 py-6 md:px-6">
                <div className="mx-auto max-w-6xl">
                    <div className="rounded-xl border border-border bg-surface p-10 text-center">
                        <AlertCircle className="mx-auto h-10 w-10 text-danger" />
                        <h1 className="mt-4 text-lg font-semibold text-foreground">Claim not found</h1>
                        <p className="mt-2 text-sm text-muted">The requested insurance claim could not be found.</p>
                        <Link href="/patient/insurance/claims" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Claims
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    const documents = claim.documents || [];
    const requiredDocuments = claim.required_documents || [];
    const needsDocuments = claim.status === "documents_required";

    return (
        <main className="min-h-screen bg-background px-4 py-6 text-foreground md:px-6">
            <div className="mx-auto max-w-6xl space-y-6">
                <Link href="/patient/insurance/claims" className="inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-foreground">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Claims
                </Link>

                <section className="rounded-xl border border-border bg-surface p-5 md:p-6">
                    <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                        <div>
                            <div className="flex flex-wrap items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                                    <ShieldCheck className="h-6 w-6 text-primary" />
                                </div>

                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Insurance Claim</p>
                                    <h1 className="text-xl font-bold text-foreground">{claim.claim_number || "Claim"}</h1>
                                </div>
                            </div>

                            <div className="mt-4 flex flex-wrap items-center gap-3">
                                <InsuranceStatusBadge status={claim.status} />

                                <span className="rounded-lg border border-border bg-surface-secondary px-3 py-1.5 text-xs font-medium capitalize text-muted">
                                    {claim.claim_type}
                                </span>

                                {claim.incident_type && (
                                    <span className="rounded-lg border border-border bg-surface-secondary px-3 py-1.5 text-xs font-medium capitalize text-muted">
                                        {claim.incident_type}
                                    </span>
                                )}
                            </div>
                        </div>

                        <Link href={`/patient/insurance/claims/${claimId}/documents`} className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-surface-secondary px-4 py-2.5 text-sm font-medium text-muted transition hover:border-primary/40 hover:bg-accent hover:text-foreground">
                            <FileText className="h-4 w-4" />
                            Documents
                            <ChevronRight className="h-4 w-4" />
                        </Link>
                    </div>
                </section>

                {needsDocuments && (
                    <section className="rounded-xl border border-warning/20 bg-warning/10 p-5">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />

                            <div className="flex-1">
                                <h2 className="font-semibold text-warning">Additional documents required</h2>
                                <p className="mt-1 text-sm text-muted">
                                    The insurance dispatcher has requested additional documents for this claim.
                                </p>

                                {requiredDocuments.length > 0 && (
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {requiredDocuments.map((type) => (
                                            <span key={type} className="rounded-lg border border-warning/20 bg-warning/10 px-3 py-1.5 text-xs font-medium text-warning">
                                                {documentLabels[type] || type}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                <Link href={`/patient/insurance/claims/${claimId}/documents`} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-warning px-4 py-2.5 text-sm font-semibold text-black transition hover:opacity-90">
                                    Submit Documents
                                    <ChevronRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                    </section>
                )}

                <section className="rounded-xl border border-border bg-surface p-5 md:p-6">
                    <div className="mb-5">
                        <h2 className="text-lg font-semibold text-foreground">Claim Information</h2>
                        <p className="mt-1 text-sm text-muted">Complete information about your insurance claim.</p>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Claim Number</p>
                            <p className="mt-1 text-sm font-medium text-foreground">{claim.claim_number || "—"}</p>
                        </div>

                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Claim Type</p>
                            <p className="mt-1 text-sm capitalize text-foreground">{claim.claim_type}</p>
                        </div>

                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Incident Type</p>
                            <p className="mt-1 text-sm capitalize text-foreground">{claim.incident_type || "—"}</p>
                        </div>

                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Created</p>
                            <p className="mt-1 text-sm text-foreground">{formatDateTime(claim.created_at)}</p>
                        </div>
                    </div>
                </section>

                <section className="rounded-xl border border-border bg-surface p-5 md:p-6">
                    <div className="mb-5">
                        <h2 className="text-lg font-semibold text-foreground">Treatment & Incident Details</h2>
                        <p className="mt-1 text-sm text-muted">Dates associated with this claim.</p>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {([
                            ["Incident Date", claim.incident_date],
                            ["Treatment Date", claim.treatment_date],
                            ["Admission Date", claim.admission_date],
                            ["Discharge Date", claim.discharge_date],
                        ] as Array<[string, Date | string | undefined]>).map(([label, date]) => (
                            <div key={label} className="flex items-start gap-3">
                                <CalendarDays className="mt-0.5 h-5 w-5 text-primary" />
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
                                    <p className="mt-1 text-sm text-foreground">{formatDate(date)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="rounded-xl border border-border bg-surface p-5 md:p-6">
                    <div className="mb-5">
                        <h2 className="text-lg font-semibold text-foreground">Financial Details</h2>
                        <p className="mt-1 text-sm text-muted">Claimed and approved amounts.</p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                        <div className="rounded-lg border border-border bg-surface-secondary p-4">
                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Estimated Amount</p>
                            <p className="mt-2 text-xl font-bold text-foreground">{formatAmount(claim.estimated_amount)}</p>
                        </div>

                        <div className="rounded-lg border border-border bg-surface-secondary p-4">
                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Claimed Amount</p>
                            <p className="mt-2 text-xl font-bold text-primary">{formatAmount(claim.claimed_amount)}</p>
                        </div>

                        <div className="rounded-lg border border-border bg-surface-secondary p-4">
                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Approved Amount</p>
                            <p className="mt-2 text-xl font-bold text-success">{formatAmount(claim.approved_amount)}</p>
                        </div>
                    </div>
                </section>

                {claim.rejection_reason && (
                    <section className="rounded-xl border border-danger/20 bg-danger/10 p-5">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-danger" />
                            <div>
                                <h2 className="font-semibold text-danger">Rejection Reason</h2>
                                <p className="mt-1 text-sm leading-6 text-muted">{claim.rejection_reason}</p>
                            </div>
                        </div>
                    </section>
                )}

                <section className="rounded-xl border border-border bg-surface p-5 md:p-6">
                    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-foreground">Submitted Documents</h2>
                            <p className="mt-1 text-sm text-muted">Documents attached to this claim.</p>
                        </div>

                        <Link href={`/patient/insurance/claims/${claimId}/documents`} className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-surface-secondary px-3 py-2 text-sm font-medium text-muted transition hover:border-primary/40 hover:bg-accent hover:text-foreground">
                            Manage Documents
                            <ChevronRight className="h-4 w-4" />
                        </Link>
                    </div>

                    {documents.length > 0 ? (
                        <div className="grid gap-3 sm:grid-cols-2">
                            {documents.map((document: any, index: number) => (
                                <div key={`${document.type}-${index}`} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface-secondary p-4">
                                    <div className="flex min-w-0 items-center gap-3">
                                        <div className="rounded-lg bg-primary/10 p-2">
                                            <FileText className="h-5 w-5 text-primary" />
                                        </div>

                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-medium text-foreground">{documentLabels[document.type] || document.type}</p>
                                            <p className="text-xs text-muted">Uploaded {formatDate(document.uploaded_at)}</p>
                                        </div>
                                    </div>

                                    <a href={document.file_url} target="_blank" rel="noopener noreferrer" className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted transition hover:border-primary/40 hover:text-primary">
                                        <ExternalLink className="h-3.5 w-3.5" />
                                        View
                                    </a>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-lg border border-dashed border-border px-5 py-8 text-center">
                            <FileText className="mx-auto h-8 w-8 text-muted-foreground" />
                            <p className="mt-3 text-sm font-medium text-muted">No documents submitted</p>
                        </div>
                    )}
                </section>

                <div className="pb-4">
                    <Link href="/patient/insurance/claims" className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface-secondary px-4 py-2.5 text-sm font-medium text-muted transition hover:border-primary/40 hover:bg-accent hover:text-foreground">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Claims
                    </Link>
                </div>
            </div>
        </main>
    );
}