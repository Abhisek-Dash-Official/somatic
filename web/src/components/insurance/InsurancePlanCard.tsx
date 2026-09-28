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
        <div className="flex h-full flex-col rounded-2xl border border-slate-800 bg-[#111a2f] p-6 transition hover:border-blue-500/40">
            <div className="flex items-start justify-between gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                    <ShieldCheck size={22} />
                </div>
                <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
                    Active
                </span>
            </div>

            <h2 className="mt-5 text-xl font-semibold text-white">{plan.name}</h2>
            <p className="mt-2 min-h-10 text-sm leading-6 text-slate-400">{plan.description || "Health insurance coverage by SOMATIC."}</p>

            <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-800 bg-[#0c1426] p-4">
                    <p className="text-xs text-slate-500">Coverage</p>
                    <p className="mt-1 text-lg font-semibold text-white">₹{plan.coverage_amount.toLocaleString("en-IN")}</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-[#0c1426] p-4">
                    <p className="text-xs text-slate-500">Premium</p>
                    <p className="mt-1 text-lg font-semibold text-white">₹{plan.premium_amount.toLocaleString("en-IN")}</p>
                    <p className="text-xs text-slate-500">per {frequencyLabels[plan.premium_frequency] || plan.premium_frequency}</p>
                </div>
            </div>

            {plan.features && plan.features.length > 0 && (
                <div className="mt-6 space-y-3">
                    {plan.features.slice(0, 4).map((feature, index) => (
                        <div key={`${feature}-${index}`} className="flex items-start gap-2 text-sm text-slate-300">
                            <Check className="mt-0.5 shrink-0 text-emerald-400" size={16} />
                            <span>{feature}</span>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-auto pt-6">
                <Link href={`/patient/insurance/plans/${plan._id}`} className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-500">
                    View Plan <ArrowRight size={17} />
                </Link>
            </div>
        </div>
    );
}