"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Eye, FileText, Loader2, Search, ShieldCheck, UserRound } from "lucide-react";
import { toast } from "react-toastify";

const statuses = [
    { value: "", label: "All Statuses" },
    { value: "pending", label: "Pending Review" },
    { value: "approved", label: "Approved" },
    { value: "payment_pending", label: "Payment Pending" },
    { value: "active", label: "Active" },
    { value: "revival_pending", label: "Revival Requested" },
    { value: "lapsed", label: "Lapsed" },
    { value: "rejected", label: "Rejected" },
    { value: "expired", label: "Expired" },
    { value: "cancelled", label: "Cancelled" },
];

const statusStyles: Record<string, string> = {
    pending: "border-warning/20 bg-warning/10 text-warning",
    approved: "border-primary/20 bg-primary/10 text-primary",
    payment_pending: "border-warning/20 bg-warning/10 text-warning",
    active: "border-success/20 bg-success/10 text-success",
    revival_pending: "border-warning/20 bg-warning/10 text-warning",
    lapsed: "border-danger/20 bg-danger/10 text-danger",
    rejected: "border-danger/20 bg-danger/10 text-danger",
    expired: "border-border bg-surface-secondary text-muted",
    cancelled: "border-danger/20 bg-danger/10 text-danger",
};

const statusLabel = (status: string) =>
    status.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());

const formatDate = (date?: string) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

export default function DispatcherInsurancePage() {
    const [policies, setPolicies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("pending");

    const fetchPolicies = async () => {
        try {
            setLoading(true);

            const params = new URLSearchParams();

            if (status) params.set("status", status);
            if (search.trim()) params.set("search", search.trim());

            const response = await fetch(`/api/dispatcher/insurance?${params.toString()}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.error || "Failed to fetch insurance policies");
            }

            setPolicies(Array.isArray(data.policies) ? data.policies : []);
        } catch (error: any) {
            console.error("Dispatcher insurance list error:", error);
            toast.error(error?.message || "Failed to load insurance policies");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPolicies();
    }, [status]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchPolicies();
        }, 400);

        return () => clearTimeout(timer);
    }, [search]);

    return (
        <main className="mx-auto w-full max-w-7xl px-4 py-6 text-foreground sm:px-6 lg:px-8">
            <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <ShieldCheck size={25} />
                            </div>

                            <div>
                                <p className="text-sm font-medium text-primary">Dispatcher</p>
                                <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                                    Insurance Policies
                                </h1>
                            </div>
                        </div>

                        <p className="mt-4 max-w-2xl text-sm leading-6 text-muted">
                            Review insurance proposals, active policies and policy revival requests.
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <div className="flex items-center gap-2 rounded-xl border border-border bg-surface-secondary px-3 py-2 text-xs text-muted">
                            <span className="h-2 w-2 rounded-full bg-success" />
                            Dispatcher Review
                        </div>

                        <Link
                            href="/dispatcher/insurance/claims"
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-4 py-2.5 text-sm font-medium text-primary transition hover:bg-primary/15"
                        >
                            <FileText size={15} />
                            View Claims
                        </Link>
                    </div>
                </div>
            </section>

            <section className="mt-6 rounded-2xl border border-border bg-surface p-4 shadow-sm">
                <div className="flex flex-col gap-3 lg:flex-row">
                    <div className="relative flex-1">
                        <Search
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                            size={18}
                        />

                        <input
                            type="text"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search by patient, email or policy number..."
                            className="w-full rounded-xl border border-border bg-surface-secondary py-3 pl-10 pr-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
                        />
                    </div>

                    <select
                        value={status}
                        onChange={(event) => setStatus(event.target.value)}
                        className="rounded-xl border border-border bg-surface-secondary px-4 py-3 text-sm text-foreground outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
                    >
                        {statuses.map((item) => (
                            <option key={item.value} value={item.value} className="bg-surface text-foreground">
                                {item.label}
                            </option>
                        ))}
                    </select>
                </div>
            </section>

            <section className="mt-6">
                {loading ? (
                    <div className="flex min-h-80 items-center justify-center rounded-2xl border border-border bg-surface shadow-sm">
                        <Loader2 className="animate-spin text-primary" size={30} />
                    </div>
                ) : policies.length === 0 ? (
                    <div className="rounded-2xl border border-border bg-surface p-12 text-center shadow-sm">
                        <ShieldCheck className="mx-auto text-muted-foreground" size={40} />

                        <h2 className="mt-4 text-lg font-semibold text-foreground">
                            No insurance policies found
                        </h2>

                        <p className="mt-2 text-sm text-muted">
                            There are no policies matching the selected filters.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
                        <div className="hidden overflow-x-auto md:block">
                            <table className="w-full">
                                <thead className="border-b border-border bg-surface-secondary">
                                    <tr>
                                        <th className="px-5 py-4 text-left text-xs font-medium uppercase tracking-wide text-muted">
                                            Patient
                                        </th>
                                        <th className="px-5 py-4 text-left text-xs font-medium uppercase tracking-wide text-muted">
                                            Plan
                                        </th>
                                        <th className="px-5 py-4 text-left text-xs font-medium uppercase tracking-wide text-muted">
                                            Coverage
                                        </th>
                                        <th className="px-5 py-4 text-left text-xs font-medium uppercase tracking-wide text-muted">
                                            Status
                                        </th>
                                        <th className="px-5 py-4 text-left text-xs font-medium uppercase tracking-wide text-muted">
                                            Submitted
                                        </th>
                                        <th className="px-5 py-4 text-right text-xs font-medium uppercase tracking-wide text-muted">
                                            Action
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-border">
                                    {policies.map((policy) => (
                                        <tr key={policy._id} className="transition hover:bg-surface-secondary">
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                                        <UserRound size={17} />
                                                    </div>

                                                    <div>
                                                        <p className="text-sm font-medium text-foreground">
                                                            {policy.user_id?.username || "Unknown Patient"}
                                                        </p>

                                                        <p className="mt-0.5 text-xs text-muted">
                                                            {policy.user_id?.email || "No email"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-5 py-4">
                                                <p className="text-sm font-medium text-foreground">
                                                    {policy.plan_id?.name || "Unknown Plan"}
                                                </p>

                                                <p className="mt-1 text-xs text-muted">
                                                    {policy.policy_number || "Proposal"}
                                                </p>
                                            </td>

                                            <td className="px-5 py-4">
                                                <p className="text-sm font-medium text-foreground">
                                                    ₹{Number(policy.plan_id?.coverage_amount || 0).toLocaleString("en-IN")}
                                                </p>

                                                <p className="mt-1 text-xs text-muted">
                                                    Premium ₹{Number(policy.plan_id?.premium_amount || 0).toLocaleString("en-IN")}
                                                </p>
                                            </td>

                                            <td className="px-5 py-4">
                                                <span
                                                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${statusStyles[policy.status] || "border-border bg-surface-secondary text-muted"}`}
                                                >
                                                    {statusLabel(policy.status)}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4 text-sm text-muted">
                                                {formatDate(policy.created_at)}
                                            </td>

                                            <td className="px-5 py-4 text-right">
                                                <Link
                                                    href={`/dispatcher/insurance/${policy._id}`}
                                                    className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-xs font-medium text-muted transition hover:bg-accent hover:text-foreground"
                                                >
                                                    <Eye size={15} />
                                                    Review
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="divide-y divide-border md:hidden">
                            {policies.map((policy) => (
                                <div key={policy._id} className="p-5">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                                <UserRound size={18} />
                                            </div>

                                            <div>
                                                <p className="text-sm font-semibold text-foreground">
                                                    {policy.user_id?.username || "Unknown Patient"}
                                                </p>

                                                <p className="mt-1 text-xs text-muted">
                                                    {policy.user_id?.email || "No email"}
                                                </p>
                                            </div>
                                        </div>

                                        <span
                                            className={`rounded-full border px-2.5 py-1 text-xs font-medium ${statusStyles[policy.status] || "border-border bg-surface-secondary text-muted"}`}
                                        >
                                            {statusLabel(policy.status)}
                                        </span>
                                    </div>

                                    <div className="mt-5 grid grid-cols-2 gap-3">
                                        <div className="rounded-xl border border-border bg-surface-secondary p-3">
                                            <p className="text-xs text-muted">Plan</p>

                                            <p className="mt-1 truncate text-sm font-medium text-foreground">
                                                {policy.plan_id?.name || "Unknown Plan"}
                                            </p>
                                        </div>

                                        <div className="rounded-xl border border-border bg-surface-secondary p-3">
                                            <p className="text-xs text-muted">Coverage</p>

                                            <p className="mt-1 text-sm font-medium text-foreground">
                                                ₹{Number(policy.plan_id?.coverage_amount || 0).toLocaleString("en-IN")}
                                            </p>
                                        </div>
                                    </div>

                                    {policy.status === "revival_pending" && (
                                        <div className="mt-4 rounded-xl border border-warning/20 bg-warning/10 p-3">
                                            <p className="text-xs font-medium text-warning">
                                                Revival request awaiting review
                                            </p>
                                        </div>
                                    )}

                                    <div className="mt-4 flex items-center justify-between">
                                        <p className="text-xs text-muted">
                                            Submitted {formatDate(policy.created_at)}
                                        </p>

                                        <Link
                                            href={`/dispatcher/insurance/${policy._id}`}
                                            className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-xs font-medium text-muted transition hover:bg-accent hover:text-foreground"
                                        >
                                            <Eye size={15} />
                                            Review
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </section>
        </main>
    );
}