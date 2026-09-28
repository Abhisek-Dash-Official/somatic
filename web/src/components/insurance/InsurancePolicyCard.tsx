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

export default function InsurancePolicyCard({ policy }: InsurancePolicyCardProps) {
    return (
        <div className="rounded-2xl border border-slate-800 bg-[#111a2f] p-5">
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                        <ShieldCheck size={20} />
                    </div>
                    <div>
                        <h3 className="font-semibold text-white">{policy.plan_id?.name || "Insurance Policy"}</h3>
                        <p className="mt-0.5 text-xs text-slate-500">{policy.policy_number || "Policy number will be generated after activation"}</p>
                    </div>
                </div>
                <InsuranceStatusBadge status={policy.status} />
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-800 bg-[#0c1426] p-4">
                    <p className="text-xs text-slate-500">Coverage</p>
                    <p className="mt-1 font-semibold text-white">₹{Number(policy.plan_id?.coverage_amount || 0).toLocaleString("en-IN")}</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-[#0c1426] p-4">
                    <p className="flex items-center gap-1 text-xs text-slate-500"><CalendarDays size={13} /> Validity</p>
                    <p className="mt-1 text-sm font-medium text-white">{formatDate(policy.start_date)} — {formatDate(policy.expiry_date)}</p>
                </div>
            </div>

            <Link href={`/patient/insurance/policies/${policy._id}`} className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-blue-500/40 hover:text-white">
                View Policy <ArrowRight size={17} />
            </Link>
        </div>
    );
}