"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
    AlertCircle,
    ArrowLeft,
    CalendarDays,
    ChevronRight,
    ExternalLink,
    FileText,
    ShieldCheck,
} from "lucide-react";
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
            } catch (error: any) {
                toast.error(error.message || "Failed to load claim");
            } finally {
                setLoading(false);
            }
        };

        loadClaim();
    }, [claimId]);

    const formatDate = (date?: Date | string) => {
        if (!date) return "—";

        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const formatDateTime = (date?: Date | string) => {
        if (!date) return "—";

        return new Date(date).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatAmount = (amount?: number) => {
        if (amount === undefined || amount === null) return "—";

        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(amount);
    };

    if (loading) {
        return (
            <main className="min-h-screen bg-[#080f1d] px-4 py-6 md:px-6">
                <div className="mx-auto max-w-6xl space-y-6">
                    <div className="h-5 w-32 animate-pulse rounded bg-slate-800" />
                    <div className="h-32 animate-pulse rounded-2xl border border-slate-800 bg-[#0d1627]" />
                    <div className="h-64 animate-pulse rounded-2xl border border-slate-800 bg-[#0d1627]" />
                </div>
            </main>
        );
    }

    if (!claim) {
        return (
            <main className="min-h-screen bg-[#080f1d] px-4 py-6 md:px-6">
                <div className="mx-auto max-w-6xl">
                    <div className="rounded-2xl border border-slate-800 bg-[#0d1627] p-10 text-center">
                        <AlertCircle className="mx-auto h-10 w-10 text-red-400" />
                        <h1 className="mt-4 text-lg font-semibold text-white">Claim not found</h1>
                        <p className="mt-2 text-sm text-slate-500">The requested insurance claim could not be found.</p>
                        <Link href="/patient/insurance/claims" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-700">
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
        <main className="min-h-screen bg-[#080f1d] px-4 py-6 md:px-6">
            <div className="mx-auto max-w-6xl space-y-6">
                <Link href="/patient/insurance/claims" className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-white">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Claims
                </Link>

                <section className="rounded-2xl border border-slate-800 bg-[#0d1627] p-5 shadow-xl shadow-black/10 md:p-6">
                    <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                        <div>
                            <div className="flex flex-wrap items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/10">
                                    <ShieldCheck className="h-6 w-6 text-purple-400" />
                                </div>

                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Insurance Claim</p>
                                    <h1 className="text-xl font-bold text-white">
                                        {claim.claim_number || "Claim"}
                                    </h1>
                                </div>
                            </div>

                            <div className="mt-4 flex flex-wrap items-center gap-3">
                                <InsuranceStatusBadge status={claim.status} />
                                <span className="rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-1.5 text-xs font-medium capitalize text-slate-400">
                                    {claim.claim_type}
                                </span>
                                {claim.incident_type && (
                                    <span className="rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-1.5 text-xs font-medium capitalize text-slate-400">
                                        {claim.incident_type}
                                    </span>
                                )}
                            </div>
                        </div>

                        <Link href={`/patient/insurance/claims/${claimId}/documents`} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-900/60 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-purple-500/50 hover:bg-purple-500/10 hover:text-purple-300">
                            <FileText className="h-4 w-4" />
                            View Documents
                            <ChevronRight className="h-4 w-4" />
                        </Link>
                    </div>
                </section>

                {needsDocuments && (
                    <section className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
                            <div className="flex-1">
                                <h2 className="font-semibold text-amber-300">Additional documents required</h2>
                                <p className="mt-1 text-sm text-amber-400/70">
                                    The insurance dispatcher has requested additional documents for this claim.
                                </p>

                                {requiredDocuments.length > 0 && (
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {requiredDocuments.map((type) => (
                                            <span key={type} className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-300">
                                                {documentLabels[type] || type}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                <Link href={`/patient/insurance/claims/${claimId}/documents`} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-amber-400">
                                    Submit Documents
                                    <ChevronRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                    </section>
                )}

                <section className="rounded-2xl border border-slate-800 bg-[#0d1627] p-5 shadow-xl shadow-black/10 md:p-6">
                    <div className="mb-5">
                        <h2 className="text-lg font-semibold text-white">Claim Information</h2>
                        <p className="mt-1 text-sm text-slate-500">Complete information about your insurance claim.</p>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-600">Claim Number</p>
                            <p className="mt-1 text-sm font-medium text-slate-200">{claim.claim_number || "—"}</p>
                        </div>

                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-600">Claim Type</p>
                            <p className="mt-1 text-sm capitalize text-slate-300">{claim.claim_type}</p>
                        </div>

                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-600">Incident Type</p>
                            <p className="mt-1 text-sm capitalize text-slate-300">{claim.incident_type || "—"}</p>
                        </div>

                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-600">Created</p>
                            <p className="mt-1 text-sm text-slate-300">{formatDateTime(claim.created_at)}</p>
                        </div>
                    </div>
                </section>

                <section className="rounded-2xl border border-slate-800 bg-[#0d1627] p-5 shadow-xl shadow-black/10 md:p-6">
                    <div className="mb-5">
                        <h2 className="text-lg font-semibold text-white">Treatment & Incident Details</h2>
                        <p className="mt-1 text-sm text-slate-500">Dates associated with this claim.</p>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="flex items-start gap-3">
                            <CalendarDays className="mt-0.5 h-5 w-5 text-purple-400" />
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-slate-600">Incident Date</p>
                                <p className="mt-1 text-sm text-slate-300">{formatDate(claim.incident_date)}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <CalendarDays className="mt-0.5 h-5 w-5 text-purple-400" />
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-slate-600">Treatment Date</p>
                                <p className="mt-1 text-sm text-slate-300">{formatDate(claim.treatment_date)}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <CalendarDays className="mt-0.5 h-5 w-5 text-purple-400" />
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-slate-600">Admission Date</p>
                                <p className="mt-1 text-sm text-slate-300">{formatDate(claim.admission_date)}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <CalendarDays className="mt-0.5 h-5 w-5 text-purple-400" />
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-slate-600">Discharge Date</p>
                                <p className="mt-1 text-sm text-slate-300">{formatDate(claim.discharge_date)}</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="rounded-2xl border border-slate-800 bg-[#0d1627] p-5 shadow-xl shadow-black/10 md:p-6">
                    <div className="mb-5">
                        <h2 className="text-lg font-semibold text-white">Financial Details</h2>
                        <p className="mt-1 text-sm text-slate-500">Claimed and approved amounts.</p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                        <div className="rounded-xl border border-slate-800 bg-[#101b2e] p-4">
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-600">Estimated Amount</p>
                            <p className="mt-2 text-xl font-bold text-slate-200">{formatAmount(claim.estimated_amount)}</p>
                        </div>

                        <div className="rounded-xl border border-slate-800 bg-[#101b2e] p-4">
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-600">Claimed Amount</p>
                            <p className="mt-2 text-xl font-bold text-purple-400">{formatAmount(claim.claimed_amount)}</p>
                        </div>

                        <div className="rounded-xl border border-slate-800 bg-[#101b2e] p-4">
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-600">Approved Amount</p>
                            <p className="mt-2 text-xl font-bold text-emerald-400">{formatAmount(claim.approved_amount)}</p>
                        </div>
                    </div>
                </section>

                {claim.rejection_reason && (
                    <section className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
                            <div>
                                <h2 className="font-semibold text-red-300">Rejection Reason</h2>
                                <p className="mt-1 text-sm leading-6 text-red-300/70">{claim.rejection_reason}</p>
                            </div>
                        </div>
                    </section>
                )}

                <section className="rounded-2xl border border-slate-800 bg-[#0d1627] p-5 shadow-xl shadow-black/10 md:p-6">
                    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-white">Submitted Documents</h2>
                            <p className="mt-1 text-sm text-slate-500">Documents attached to this claim.</p>
                        </div>

                        <Link href={`/patient/insurance/claims/${claimId}/documents`} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm font-medium text-slate-300 transition hover:border-purple-500/50 hover:bg-purple-500/10 hover:text-purple-300">
                            Manage Documents
                            <ChevronRight className="h-4 w-4" />
                        </Link>
                    </div>

                    {documents.length > 0 ? (
                        <div className="grid gap-3 sm:grid-cols-2">
                            {documents.map((document: any, index: number) => (
                                <div key={`${document.type}-${index}`} className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-[#101b2e] p-4">
                                    <div className="flex min-w-0 items-center gap-3">
                                        <div className="rounded-lg bg-purple-500/10 p-2">
                                            <FileText className="h-5 w-5 text-purple-400" />
                                        </div>

                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-medium text-slate-200">
                                                {documentLabels[document.type] || document.type}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                Uploaded {formatDate(document.uploaded_at)}
                                            </p>
                                        </div>
                                    </div>

                                    <a href={document.file_url} target="_blank" rel="noopener noreferrer" className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-purple-500/50 hover:text-purple-300">
                                        <ExternalLink className="h-3.5 w-3.5" />
                                        View
                                    </a>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-xl border border-dashed border-slate-700 px-5 py-8 text-center">
                            <FileText className="mx-auto h-8 w-8 text-slate-600" />
                            <p className="mt-3 text-sm font-medium text-slate-400">No documents submitted</p>
                        </div>
                    )}
                </section>

                <div className="flex justify-start pb-4">
                    <Link href="/patient/insurance/claims" className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/60 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-purple-500/50 hover:bg-purple-500/10 hover:text-purple-300">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Claims
                    </Link>
                </div>
            </div>
        </main>
    );
}