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

const formatDate = (date?: string) => {
    if (!date) return "Not available";

    return new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

export default function InsurancePolicyCard({
    policy,
}: InsurancePolicyCardProps) {
    return (
        <div className="rounded-xl border border-border bg-surface p-5">
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <ShieldCheck size={20} />
                    </div>

                    <div>
                        <h3 className="font-semibold text-foreground">
                            {policy.plan_id?.name || "Insurance Policy"}
                        </h3>

                        <p className="mt-0.5 text-xs text-muted-foreground">
                            {policy.policy_number ||
                                "Policy number will be generated after activation"}
                        </p>
                    </div>
                </div>

                <InsuranceStatusBadge status={policy.status} />
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-border bg-surface-secondary p-4">
                    <p className="text-xs text-muted-foreground">Coverage</p>
                    <p className="mt-1 font-semibold text-foreground">
                        ₹
                        {Number(
                            policy.plan_id?.coverage_amount || 0
                        ).toLocaleString("en-IN")}
                    </p>
                </div>

                <div className="rounded-lg border border-border bg-surface-secondary p-4">
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <CalendarDays size={13} /> Validity
                    </p>

                    <p className="mt-1 text-sm font-medium text-foreground">
                        {formatDate(policy.start_date)} —{" "}
                        {formatDate(policy.expiry_date)}
                    </p>
                </div>
            </div>

            <Link
                href={`/patient/insurance/policies/${policy._id}`}
                className="mt-5 flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-3 text-sm font-medium text-muted transition hover:border-primary/40 hover:bg-accent hover:text-foreground"
            >
                View Policy <ArrowRight size={17} />
            </Link>
        </div>
    );
}