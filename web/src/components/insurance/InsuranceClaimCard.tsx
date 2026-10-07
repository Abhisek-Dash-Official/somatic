"use client";

import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import InsuranceStatusBadge from "./InsuranceStatusBadge";

interface InsuranceClaimCardProps {
    claim: {
        _id: string;
        claim_number?: string;
        claim_type: string;
        status: string;
        claimed_amount?: number;
        incident_type?: string;
        policy_id?: { policy_number?: string };
    };
}

export default function InsuranceClaimCard({ claim }: InsuranceClaimCardProps) {
    return (
        <article className="rounded-2xl border border-border bg-surface p-5 shadow-sm transition hover:border-primary/30 sm:p-6">
            <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent text-primary">
                        <FileText className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="truncate font-semibold text-foreground">
                            {claim.claim_number || "Insurance Claim"}
                        </h3>
                        <p className="mt-0.5 text-xs capitalize text-muted">{claim.claim_type}</p>
                    </div>
                </div>
                <InsuranceStatusBadge status={claim.status} />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
                <InfoBox label="Claimed Amount" value={`₹${Number(claim.claimed_amount || 0).toLocaleString("en-IN")}`} />
                <InfoBox label="Incident" value={claim.incident_type || "Not specified"} capitalize />
            </div>

            <Link
                href={`/patient/insurance/claims/${claim._id}`}
                className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-border bg-surface-secondary px-4 py-3 text-sm font-semibold text-foreground transition hover:border-primary/30 hover:bg-accent hover:text-primary"
            >
                View Claim
                <ArrowRight className="h-4 w-4" />
            </Link>
        </article>
    );
}

function InfoBox({ label, value, capitalize = false }: { label: string; value: string; capitalize?: boolean }) {
    return (
        <div className="rounded-xl border border-border bg-surface-secondary p-3.5">
            <p className="text-xs text-muted">{label}</p>
            <p className={`mt-1 font-semibold text-foreground ${capitalize ? "capitalize" : ""}`}>{value}</p>
        </div>
    );
}