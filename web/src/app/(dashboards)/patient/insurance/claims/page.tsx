"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, CalendarDays, ChevronRight, FileText, Plus, ShieldCheck } from "lucide-react";
import { toast } from "react-toastify";
import type { IInsuranceClaim } from "@/types/models";
import InsuranceStatusBadge from "@/components/insurance/InsuranceStatusBadge";

export default function PatientInsuranceClaimsPage() {
    const [claims, setClaims] = useState<IInsuranceClaim[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadClaims = async () => {
            try {
                const response = await fetch("/api/insurance/claims");
                const data = await response.json();

                if (!response.ok) throw new Error(data.error || "Failed to load claims");

                setClaims(data.claims || []);
            } catch (error: any) {
                toast.error(error.message || "Failed to load insurance claims");
            } finally {
                setLoading(false);
            }
        };

        loadClaims();
    }, []);

    const formatDate = (date?: Date | string) => {
        if (!date) return "—";

        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
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
            <main className="min-h-screen bg-background px-4 py-6 text-foreground md:px-6">
                <div className="mx-auto max-w-6xl space-y-6">
                    <div className="h-8 w-48 animate-pulse rounded bg-surface-secondary" />
                    <div className="h-24 animate-pulse rounded-xl border border-border bg-surface" />
                    <div className="h-40 animate-pulse rounded-xl border border-border bg-surface" />
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-background px-4 py-6 text-foreground md:px-6">
            <div className="mx-auto max-w-6xl space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <Link
                            href="/patient/insurance"
                            className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-foreground"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Insurance
                        </Link>

                        <h1 className="text-2xl font-bold text-foreground">My Insurance Claims</h1>
                        <p className="mt-1 text-sm text-muted">
                            Track and manage your submitted insurance claims.
                        </p>
                    </div>

                    <Link
                        href="/patient/insurance/claims/new"
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover"
                    >
                        <Plus className="h-4 w-4" />
                        New Claim
                    </Link>
                </div>

                {claims.length === 0 ? (
                    <section className="rounded-xl border border-border bg-surface p-10 text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                            <ShieldCheck className="h-7 w-7 text-primary" />
                        </div>

                        <h2 className="mt-4 text-lg font-semibold text-foreground">No insurance claims yet</h2>
                        <p className="mx-auto mt-2 max-w-md text-sm text-muted">
                            You have not submitted any insurance claims. Create a claim when you need to request coverage.
                        </p>

                        <Link
                            href="/patient/insurance/claims/new"
                            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover"
                        >
                            <Plus className="h-4 w-4" />
                            Create New Claim
                        </Link>
                    </section>
                ) : (
                    <div className="space-y-4">
                        {claims.map((claim) => {
                            const needsDocuments = claim.status === "documents_required";

                            return (
                                <section
                                    key={claim._id}
                                    className="rounded-xl border border-border bg-surface p-5 transition hover:border-primary/30"
                                >
                                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-3">
                                                <div className="flex items-center gap-2">
                                                    <FileText className="h-5 w-5 text-primary" />

                                                    <h2 className="font-semibold text-foreground">
                                                        {claim.claim_number || "Insurance Claim"}
                                                    </h2>
                                                </div>

                                                <InsuranceStatusBadge status={claim.status} />
                                            </div>

                                            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                                <div>
                                                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                                        Claim Type
                                                    </p>
                                                    <p className="mt-1 text-sm capitalize text-foreground">
                                                        {claim.claim_type}
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                                        Incident
                                                    </p>
                                                    <p className="mt-1 text-sm capitalize text-foreground">
                                                        {claim.incident_type || "—"}
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                                        Claimed Amount
                                                    </p>
                                                    <p className="mt-1 text-sm font-semibold text-foreground">
                                                        {formatAmount(claim.claimed_amount)}
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                                        Submitted
                                                    </p>

                                                    <div className="mt-1 flex items-center gap-1.5 text-sm text-muted">
                                                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                                                        {formatDate(claim.created_at)}
                                                    </div>
                                                </div>
                                            </div>

                                            {needsDocuments && (
                                                <div className="mt-4 flex items-start gap-3 rounded-lg border border-warning/20 bg-warning/10 p-3">
                                                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />

                                                    <div>
                                                        <p className="text-sm font-medium text-warning">
                                                            Additional documents required
                                                        </p>
                                                        <p className="mt-0.5 text-xs text-muted">
                                                            Please submit the documents requested by the insurance dispatcher.
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col">
                                            <Link
                                                href={`/patient/insurance/claims/${claim._id}`}
                                                className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-surface-secondary px-4 py-2.5 text-sm font-medium text-muted transition hover:border-primary/40 hover:bg-accent hover:text-foreground"
                                            >
                                                View Claim
                                                <ChevronRight className="h-4 w-4" />
                                            </Link>
                                        </div>
                                    </div>
                                </section>
                            );
                        })}
                    </div>
                )}
            </div>
        </main>
    );
}