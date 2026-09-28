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
        policy_id?: {
            policy_number?: string;
        };
    };
}

export default function InsuranceClaimCard({ claim }: InsuranceClaimCardProps) {
    return (
        <div className="rounded-xl border border-border bg-surface p-5">
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <FileText size={20} />
                    </div>

                    <div>
                        <h3 className="font-semibold text-foreground">
                            {claim.claim_number || "Insurance Claim"}
                        </h3>
                        <p className="mt-0.5 text-xs capitalize text-muted-foreground">
                            {claim.claim_type}
                        </p>
                    </div>
                </div>

                <InsuranceStatusBadge status={claim.status} />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-border bg-surface-secondary p-4">
                    <p className="text-xs text-muted-foreground">Claimed Amount</p>
                    <p className="mt-1 font-semibold text-foreground">
                        ₹{Number(claim.claimed_amount || 0).toLocaleString("en-IN")}
                    </p>
                </div>

                <div className="rounded-lg border border-border bg-surface-secondary p-4">
                    <p className="text-xs text-muted-foreground">Incident</p>
                    <p className="mt-1 capitalize font-medium text-foreground">
                        {claim.incident_type || "Not specified"}
                    </p>
                </div>
            </div>

            <Link
                href={`/patient/insurance/claims/${claim._id}`}
                className="mt-5 flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-3 text-sm font-medium text-muted transition hover:border-primary/40 hover:bg-accent hover:text-foreground"
            >
                View Claim <ArrowRight size={17} />
            </Link>
        </div>
    );
}