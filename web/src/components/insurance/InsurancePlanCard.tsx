"use client";

import Link from "next/link";
import { ArrowRight, Check, ShieldCheck } from "lucide-react";

interface InsurancePlanCardProps {
    plan: {
        _id: string;
        name: string;
        description?: string;
        coverage_amount: number;
        premium_amount: number;
        premium_frequency: string;
        policy_term_years: number;
        features?: string[];
    };
}

const frequencyLabels: Record<string, string> = {
    monthly: "month",
    quarterly: "quarter",
    half_yearly: "6 months",
    yearly: "year",
};

export default function InsurancePlanCard({ plan }: InsurancePlanCardProps) {
    return (
        <article className="flex h-full flex-col rounded-2xl border border-border bg-surface p-5 shadow-sm transition hover:border-primary/30 sm:p-6">
            <div className="flex items-start justify-between gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-primary">
                    <ShieldCheck className="h-5 w-5" />
                </div>
                <span className="rounded-full border border-success/20 bg-success/10 px-2.5 py-1 text-xs font-semibold text-success">
                    Active
                </span>
            </div>

            <h2 className="mt-5 text-xl font-bold text-foreground">{plan.name}</h2>
            <p className="mt-2 min-h-10 text-sm leading-6 text-muted">
                {plan.description || "Health insurance coverage by SOMATIC."}
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
                <InfoBox label="Coverage">
                    ₹{Number(plan.coverage_amount || 0).toLocaleString("en-IN")}
                </InfoBox>
                <InfoBox label="Premium">
                    <span>₹{Number(plan.premium_amount || 0).toLocaleString("en-IN")}</span>
                    <span className="mt-0.5 block text-xs font-normal text-muted">
                        per {frequencyLabels[plan.premium_frequency] || plan.premium_frequency}
                    </span>
                </InfoBox>
            </div>

            {plan.features?.length ? (
                <div className="mt-6 space-y-3">
                    {plan.features.slice(0, 4).map((feature, index) => (
                        <div key={`${feature}-${index}`} className="flex items-start gap-2.5 text-sm text-muted">
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                            <span>{feature}</span>
                        </div>
                    ))}
                </div>
            ) : null}

            <div className="mt-auto pt-6">
                <Link
                    href={`/patient/insurance/plans/${plan._id}`}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover"
                >
                    View Plan
                    <ArrowRight className="h-4 w-4" />
                </Link>
            </div>
        </article>
    );
}

function InfoBox({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="rounded-xl border border-border bg-surface-secondary p-3.5">
            <p className="text-xs text-muted">{label}</p>
            <p className="mt-1 text-lg font-bold text-foreground">{children}</p>
        </div>
    );
}