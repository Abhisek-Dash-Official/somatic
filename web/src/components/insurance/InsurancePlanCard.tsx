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
        <div className="flex h-full flex-col rounded-xl border border-border bg-surface p-6 transition hover:border-primary/40">
            <div className="flex items-start justify-between gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <ShieldCheck size={22} />
                </div>

                <span className="rounded-full border border-success/20 bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
                    Active
                </span>
            </div>

            <h2 className="mt-5 text-xl font-semibold text-foreground">
                {plan.name}
            </h2>

            <p className="mt-2 min-h-10 text-sm leading-6 text-muted">
                {plan.description || "Health insurance coverage by SOMATIC."}
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-border bg-surface-secondary p-4">
                    <p className="text-xs text-muted-foreground">Coverage</p>
                    <p className="mt-1 text-lg font-semibold text-foreground">
                        ₹{plan.coverage_amount.toLocaleString("en-IN")}
                    </p>
                </div>

                <div className="rounded-lg border border-border bg-surface-secondary p-4">
                    <p className="text-xs text-muted-foreground">Premium</p>
                    <p className="mt-1 text-lg font-semibold text-foreground">
                        ₹{plan.premium_amount.toLocaleString("en-IN")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        per{" "}
                        {frequencyLabels[plan.premium_frequency] ||
                            plan.premium_frequency}
                    </p>
                </div>
            </div>

            {plan.features && plan.features.length > 0 && (
                <div className="mt-6 space-y-3">
                    {plan.features.slice(0, 4).map((feature, index) => (
                        <div
                            key={`${feature}-${index}`}
                            className="flex items-start gap-2 text-sm text-muted"
                        >
                            <Check
                                className="mt-0.5 shrink-0 text-success"
                                size={16}
                            />
                            <span>{feature}</span>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-auto pt-6">
                <Link
                    href={`/patient/insurance/plans/${plan._id}`}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary-hover"
                >
                    View Plan <ArrowRight size={17} />
                </Link>
            </div>
        </div>
    );
}