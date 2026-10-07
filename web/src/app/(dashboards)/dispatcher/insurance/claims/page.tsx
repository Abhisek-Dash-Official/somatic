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
    submitted: "bg-primary/10 text-primary border-primary/20",
    under_review: "bg-warning/10 text-warning border-warning/20",
    documents_required: "bg-warning/10 text-warning border-warning/20",
    approved: "bg-success/10 text-success border-success/20",
    partially_approved: "bg-info/10 text-info border-info/20",
    rejected: "bg-danger/10 text-danger border-danger/20",
    settled: "bg-accent text-accent-foreground border-border",
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

            if (!res.ok) {
                throw new Error(data.error || "Failed to fetch insurance claims");
            }

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
        <main className="min-h-screen bg-background px-4 py-6 text-foreground sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl space-y-6">
                <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <ShieldCheck size={22} />
                            </div>

                            <div>
                                <p className="text-sm font-medium text-primary">Dispatcher</p>
                                <h1 className="text-2xl font-bold text-foreground">
                                    Insurance Claims
                                </h1>
                            </div>
                        </div>

                        <p className="mt-3 text-sm text-muted">
                            Review and process patient insurance claims.
                        </p>
                    </div>

                    <Link
                        href="/dispatcher/insurance"
                        className="inline-flex w-fit items-center rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium text-muted transition hover:bg-accent hover:text-foreground"
                    >
                        Insurance Proposals
                    </Link>
                </section>

                <section className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
                    <div className="grid gap-3 md:grid-cols-[1fr_220px]">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                            <input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search claim number, patient name or email..."
                                className="w-full rounded-xl border border-border bg-surface-secondary py-2.5 pl-10 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
                            />
                        </div>

                        <select
                            value={status}
                            onChange={(event) => setStatus(event.target.value)}
                            className="rounded-xl border border-border bg-surface-secondary px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
                        >
                            {statusOptions.map((item) => (
                                <option key={item.value} value={item.value} className="bg-surface text-foreground">
                                    {item.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </section>

                {loading ? (
                    <div className="flex min-h-75 items-center justify-center rounded-2xl border border-border bg-surface shadow-sm">
                        <Loader2 className="h-7 w-7 animate-spin text-primary" />
                    </div>
                ) : !claims.length ? (
                    <div className="rounded-2xl border border-border bg-surface p-12 text-center shadow-sm">
                        <FileText className="mx-auto h-12 w-12 text-muted-foreground" />

                        <h2 className="mt-4 text-lg font-semibold text-foreground">
                            No claims found
                        </h2>

                        <p className="mt-1 text-sm text-muted">
                            There are no insurance claims matching the selected filters.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
                        <div className="hidden overflow-x-auto md:block">
                            <table className="w-full text-left">
                                <thead className="border-b border-border bg-surface-secondary">
                                    <tr>
                                        <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider text-muted">
                                            Claim
                                        </th>
                                        <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider text-muted">
                                            Patient
                                        </th>
                                        <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider text-muted">
                                            Type
                                        </th>
                                        <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider text-muted">
                                            Amount
                                        </th>
                                        <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider text-muted">
                                            Status
                                        </th>
                                        <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider text-muted" />
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-border">
                                    {claims.map((claim) => (
                                        <tr key={claim._id.toString()} className="transition hover:bg-surface-secondary">
                                            <td className="px-5 py-4">
                                                <p className="text-sm font-medium text-foreground">
                                                    {claim.claim_number || claim._id.toString()}
                                                </p>

                                                <p className="mt-1 text-xs capitalize text-muted">
                                                    {claim.incident_type || "—"}
                                                </p>
                                            </td>

                                            <td className="px-5 py-4">
                                                <p className="text-sm text-foreground">
                                                    {claim.user_id?.username || "Unknown"}
                                                </p>

                                                <p className="mt-1 text-xs text-muted">
                                                    {claim.user_id?.email || "—"}
                                                </p>
                                            </td>

                                            <td className="px-5 py-4 text-sm capitalize text-muted">
                                                {claim.claim_type}
                                            </td>

                                            <td className="px-5 py-4">
                                                <p className="text-sm font-medium text-foreground">
                                                    ₹{Number(claim.claimed_amount || 0).toLocaleString("en-IN")}
                                                </p>

                                                <p className="mt-1 text-xs text-muted">
                                                    Approved: ₹{Number(claim.approved_amount || 0).toLocaleString("en-IN")}
                                                </p>
                                            </td>

                                            <td className="px-5 py-4">
                                                <span
                                                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${statusStyles[claim.status] || "border-border bg-surface-secondary text-muted"}`}
                                                >
                                                    {formatStatus(claim.status)}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4 text-right">
                                                <Link
                                                    href={`/dispatcher/insurance/claims/${claim._id}`}
                                                    className="inline-flex rounded-xl px-3 py-2 text-sm font-medium text-primary transition hover:bg-accent hover:text-primary-hover"
                                                >
                                                    Review
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="divide-y divide-border md:hidden">
                            {claims.map((claim) => (
                                <Link
                                    key={claim._id.toString()}
                                    href={`/dispatcher/insurance/claims/${claim._id}`}
                                    className="block p-4 transition hover:bg-surface-secondary"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-medium text-foreground">
                                                {claim.claim_number || claim._id.toString()}
                                            </p>

                                            <p className="mt-1 text-xs text-muted">
                                                {claim.user_id?.username || "Unknown"}
                                            </p>
                                        </div>

                                        <span
                                            className={`rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${statusStyles[claim.status] || "border-border bg-surface-secondary text-muted"}`}
                                        >
                                            {formatStatus(claim.status)}
                                        </span>
                                    </div>

                                    <div className="mt-4 flex items-center justify-between text-sm">
                                        <span className="capitalize text-muted">{claim.claim_type}</span>

                                        <span className="font-semibold text-foreground">
                                            ₹{Number(claim.claimed_amount || 0).toLocaleString("en-IN")}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}