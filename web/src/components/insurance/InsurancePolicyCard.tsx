"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays, ShieldCheck } from "lucide-react";
import InsuranceStatusBadge from "./InsuranceStatusBadge";

interface InsurancePolicyCardProps {
    policy: {
        _id: string;
        policy_number?: string;
        status: string;
        start_date?: string;
        expiry_date?: string;
        plan_id?: {
            _id: string;
            name: string;
            coverage_amount: number;
            premium_amount: number;
            premium_frequency: string;
        };
    };
}

const formatDate = (date?: string) =>
    date
        ? new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
        : "Not available";

export default function InsurancePolicyCard({ policy }: InsurancePolicyCardProps) {
    return (
        <article className="rounded-2xl border border-border bg-surface p-5 shadow-sm transition hover:border-primary/30 sm:p-6">
            <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent text-primary">
                        <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="truncate font-semibold text-foreground">
                            {policy.plan_id?.name || "Insurance Policy"}
                        </h3>
                        <p className="mt-0.5 truncate text-xs text-muted">
                            {policy.policy_number || "Policy number will be generated after activation"}
                        </p>
                    </div>
                </div>
                <InsuranceStatusBadge status={policy.status} />
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <InfoBox label="Coverage" value={`₹${Number(policy.plan_id?.coverage_amount || 0).toLocaleString("en-IN")}`} />
                <div className="rounded-xl border border-border bg-surface-secondary p-3.5">
                    <p className="flex items-center gap-1.5 text-xs text-muted">
                        <CalendarDays className="h-3.5 w-3.5" />
                        Validity
                    </p>
                    <p className="mt-1 text-sm font-semibold text-foreground">
                        {formatDate(policy.start_date)} — {formatDate(policy.expiry_date)}
                    </p>
                </div>
            </div>

            <Link
                href={`/patient/insurance/policies/${policy._id}`}
                className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-border bg-surface-secondary px-4 py-3 text-sm font-semibold text-foreground transition hover:border-primary/30 hover:bg-accent hover:text-primary"
            >
                View Policy
                <ArrowRight className="h-4 w-4" />
            </Link>
        </article>
    );
}

function InfoBox({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl border border-border bg-surface-secondary p-3.5">
            <p className="text-xs text-muted">{label}</p>
            <p className="mt-1 font-semibold text-foreground">{value}</p>
        </div>
    );
}