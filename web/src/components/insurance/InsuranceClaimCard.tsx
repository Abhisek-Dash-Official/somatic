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
        <div className="rounded-2xl border border-slate-800 bg-[#111a2f] p-5">
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                        <FileText size={20} />
                    </div>
                    <div>
                        <h3 className="font-semibold text-white">{claim.claim_number || "Insurance Claim"}</h3>
                        <p className="mt-0.5 text-xs capitalize text-slate-500">{claim.claim_type}</p>
                    </div>
                </div>
                <InsuranceStatusBadge status={claim.status} />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-800 bg-[#0c1426] p-4">
                    <p className="text-xs text-slate-500">Claimed Amount</p>
                    <p className="mt-1 font-semibold text-white">₹{Number(claim.claimed_amount || 0).toLocaleString("en-IN")}</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-[#0c1426] p-4">
                    <p className="text-xs text-slate-500">Incident</p>
                    <p className="mt-1 capitalize font-medium text-white">{claim.incident_type || "Not specified"}</p>
                </div>
            </div>

            <Link href={`/patient/insurance/claims/${claim._id}`} className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-blue-500/40 hover:text-white">
                View Claim <ArrowRight size={17} />
            </Link>
        </div>
    );
}