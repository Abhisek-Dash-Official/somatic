"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FileText, Loader2, Search, ShieldCheck } from "lucide-react";
import { toast } from "react-toastify";
import type { IInsuranceClaim, IInsurancePolicy, IUser } from "@/types/models";

const statusOptions = [
    { value: "", label: "All Statuses" },
    { value: "submitted", label: "Submitted" },
    { value: "under_review", label: "Under Review" },
    { value: "documents_required", label: "Documents Required" },
    { value: "approved", label: "Approved" },
    { value: "partially_approved", label: "Partially Approved" },
    { value: "rejected", label: "Rejected" },
    { value: "settled", label: "Settled" },
];

const statusStyles: Record<string, string> = {
    submitted: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    under_review: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    documents_required: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    approved: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    partially_approved: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    rejected: "bg-red-500/10 text-red-400 border-red-500/20",
    settled: "bg-purple-500/10 text-purple-400 border-purple-500/20",
};

type DispatcherClaim = IInsuranceClaim & {
    user_id: IUser;
    policy_id: IInsurancePolicy & {
        policy_number?: string;
        status: IInsurancePolicy["status"];
    };
};

export default function DispatcherInsuranceClaimsPage() {
    const [claims, setClaims] = useState<DispatcherClaim[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");

    const fetchClaims = async () => {
        try {
            setLoading(true);

            const params = new URLSearchParams();

            if (status) params.set("status", status);
            if (search.trim()) params.set("search", search.trim());

            const res = await fetch(`/api/dispatcher/insurance/claims?${params.toString()}`);
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Failed to fetch insurance claims");

            setClaims(data.claims || []);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to fetch insurance claims");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchClaims();
        }, 300);

        return () => clearTimeout(timer);
    }, [status, search]);

    const formatStatus = (value: string) => value.replaceAll("_", " ");

    return (
        <div className="min-h-screen bg-[#0b1220] p-4 md:p-6">
            <div className="mx-auto max-w-7xl space-y-6">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="h-6 w-6 text-purple-400" />
                            <h1 className="text-2xl font-bold text-white">Insurance Claims</h1>
                        </div>
                        <p className="mt-1 text-sm text-slate-400">Review and process patient insurance claims.</p>
                    </div>

                    <Link
                        href="/dispatcher/insurance"
                        className="inline-flex w-fit items-center rounded-lg border border-slate-700/60 bg-[#111827] px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-slate-600 hover:bg-[#172033] hover:text-white"
                    >
                        Insurance Proposals
                    </Link>
                </div>

                <div className="rounded-xl border border-slate-700/60 bg-[#111827] p-4">
                    <div className="grid gap-3 md:grid-cols-[1fr_220px]">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search claim number, patient name or email..."
                                className="w-full rounded-lg border border-slate-700/60 bg-[#172033] py-2.5 pl-10 pr-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-purple-500"
                            />
                        </div>

                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="rounded-lg border border-slate-700/60 bg-[#172033] px-3 py-2.5 text-sm text-white outline-none focus:border-purple-500"
                        >
                            {statusOptions.map((item) => (
                                <option key={item.value} value={item.value}>{item.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="flex min-h-75 items-center justify-center rounded-xl border border-slate-700/60 bg-[#111827]">
                        <Loader2 className="h-7 w-7 animate-spin text-purple-400" />
                    </div>
                ) : !claims.length ? (
                    <div className="rounded-xl border border-slate-700/60 bg-[#111827] p-12 text-center">
                        <FileText className="mx-auto h-12 w-12 text-slate-600" />
                        <h2 className="mt-4 text-lg font-semibold text-white">No claims found</h2>
                        <p className="mt-1 text-sm text-slate-500">There are no insurance claims matching the selected filters.</p>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-xl border border-slate-700/60 bg-[#111827]">
                        <div className="hidden overflow-x-auto md:block">
                            <table className="w-full text-left">
                                <thead className="border-b border-slate-700/60 bg-[#101827]">
                                    <tr>
                                        <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider text-slate-500">Claim</th>
                                        <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider text-slate-500">Patient</th>
                                        <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider text-slate-500">Type</th>
                                        <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider text-slate-500">Amount</th>
                                        <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider text-slate-500">Status</th>
                                        <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider text-slate-500"></th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-700/50">
                                    {claims.map((claim) => (
                                        <tr key={claim._id.toString()} className="transition hover:bg-[#172033]/50">
                                            <td className="px-5 py-4">
                                                <p className="text-sm font-medium text-white">{claim.claim_number || claim._id.toString()}</p>
                                                <p className="mt-1 text-xs capitalize text-slate-500">{claim.incident_type || "—"}</p>
                                            </td>

                                            <td className="px-5 py-4">
                                                <p className="text-sm text-slate-200">{claim.user_id?.username || "Unknown"}</p>
                                                <p className="mt-1 text-xs text-slate-500">{claim.user_id?.email || "—"}</p>
                                            </td>

                                            <td className="px-5 py-4 text-sm capitalize text-slate-300">
                                                {claim.claim_type}
                                            </td>

                                            <td className="px-5 py-4">
                                                <p className="text-sm font-medium text-white">
                                                    ₹{Number(claim.claimed_amount || 0).toLocaleString("en-IN")}
                                                </p>
                                                <p className="mt-1 text-xs text-slate-500">
                                                    Approved: ₹{Number(claim.approved_amount || 0).toLocaleString("en-IN")}
                                                </p>
                                            </td>

                                            <td className="px-5 py-4">
                                                <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${statusStyles[claim.status] || "border-slate-700 text-slate-400"}`}>
                                                    {formatStatus(claim.status)}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4 text-right">
                                                <Link
                                                    href={`/dispatcher/insurance/claims/${claim._id}`}
                                                    className="text-sm font-medium text-purple-400 transition hover:text-purple-300"
                                                >
                                                    Review
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="divide-y divide-slate-700/50 md:hidden">
                            {claims.map((claim) => (
                                <Link
                                    key={claim._id.toString()}
                                    href={`/dispatcher/insurance/claims/${claim._id}`}
                                    className="block p-4 transition hover:bg-[#172033]/50"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-medium text-white">{claim.claim_number || claim._id.toString()}</p>
                                            <p className="mt-1 text-xs text-slate-500">{claim.user_id?.username || "Unknown"}</p>
                                        </div>

                                        <span className={`rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${statusStyles[claim.status] || "border-slate-700 text-slate-400"}`}>
                                            {formatStatus(claim.status)}
                                        </span>
                                    </div>

                                    <div className="mt-4 flex items-center justify-between text-sm">
                                        <span className="capitalize text-slate-400">{claim.claim_type}</span>
                                        <span className="font-semibold text-white">₹{Number(claim.claimed_amount || 0).toLocaleString("en-IN")}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}