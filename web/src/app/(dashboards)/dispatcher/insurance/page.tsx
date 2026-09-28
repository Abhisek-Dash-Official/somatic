"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Eye, Loader2, Search, ShieldCheck, UserRound, FileText } from "lucide-react";
import { toast } from "react-toastify";

const statuses = [
    { value: "", label: "All Statuses" },
    { value: "pending", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "payment_pending", label: "Payment Pending" },
    { value: "active", label: "Active" },
    { value: "rejected", label: "Rejected" },
];

const statusStyles: Record<string, string> = {
    pending: "border-amber-500/20 bg-amber-500/10 text-amber-400",
    approved: "border-blue-500/20 bg-blue-500/10 text-blue-400",
    payment_pending: "border-orange-500/20 bg-orange-500/10 text-orange-400",
    active: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
    rejected: "border-red-500/20 bg-red-500/10 text-red-400",
    expired: "border-slate-500/20 bg-slate-500/10 text-slate-400",
    cancelled: "border-red-500/20 bg-red-500/10 text-red-400",
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
                throw new Error(data?.error || "Failed to fetch insurance proposals");
            }

            setPolicies(Array.isArray(data.policies) ? data.policies : []);
        } catch (error: any) {
            console.error("Dispatcher insurance list error:", error);
            toast.error(error?.message || "Failed to load insurance proposals");
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
        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <section className="rounded-3xl border border-slate-800 bg-[#111a2f] p-6 sm:p-8">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
                                <ShieldCheck size={25} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-blue-400">Dispatcher</p>
                                <h1 className="text-2xl font-bold text-white sm:text-3xl">
                                    Insurance Proposals
                                </h1>
                            </div>
                        </div>

                        <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-400">
                            Review insurance proposals submitted by patients and approve or reject them.
                        </p>
                    </div>

                    <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                        <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-[#0c1426] px-3 py-2 text-xs text-slate-500">
                            <span className="h-2 w-2 rounded-full bg-emerald-400" />
                            Dispatcher Review
                        </div>

                        <Link
                            href="/dispatcher/insurance/claims"
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-purple-500/40 bg-purple-500/10 px-4 py-2 text-sm font-medium text-purple-300 transition hover:border-purple-400 hover:bg-purple-500/20 hover:text-purple-200"
                        >
                            <FileText size={15} />
                            View Claims
                        </Link>
                    </div>
                </div>
            </section>

            <section className="mt-6 rounded-2xl border border-slate-800 bg-[#111a2f] p-4">
                <div className="flex flex-col gap-3 lg:flex-row">
                    <div className="relative flex-1">
                        <Search
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                            size={18}
                        />
                        <input
                            type="text"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search by patient, email or policy number..."
                            className="w-full rounded-xl border border-slate-700 bg-[#0c1426] py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500"
                        />
                    </div>

                    <select
                        value={status}
                        onChange={(event) => setStatus(event.target.value)}
                        className="rounded-xl border border-slate-700 bg-[#0c1426] px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
                    >
                        {statuses.map((item) => (
                            <option key={item.value} value={item.value}>
                                {item.label}
                            </option>
                        ))}
                    </select>
                </div>
            </section>

            <section className="mt-6">
                {loading ? (
                    <div className="flex min-h-80 items-center justify-center rounded-2xl border border-slate-800 bg-[#111a2f]">
                        <Loader2 className="animate-spin text-blue-400" size={30} />
                    </div>
                ) : policies.length === 0 ? (
                    <div className="rounded-2xl border border-slate-800 bg-[#111a2f] p-12 text-center">
                        <ShieldCheck className="mx-auto text-slate-600" size={40} />
                        <h2 className="mt-4 text-lg font-semibold text-white">
                            No insurance proposals found
                        </h2>
                        <p className="mt-2 text-sm text-slate-500">
                            There are no proposals matching the selected filters.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#111a2f]">
                        <div className="hidden overflow-x-auto md:block">
                            <table className="w-full">
                                <thead className="border-b border-slate-800 bg-[#0c1426]">
                                    <tr>
                                        <th className="px-5 py-4 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                                            Patient
                                        </th>
                                        <th className="px-5 py-4 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                                            Plan
                                        </th>
                                        <th className="px-5 py-4 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                                            Coverage
                                        </th>
                                        <th className="px-5 py-4 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                                            Status
                                        </th>
                                        <th className="px-5 py-4 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                                            Submitted
                                        </th>
                                        <th className="px-5 py-4 text-right text-xs font-medium uppercase tracking-wide text-slate-500">
                                            Action
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-800">
                                    {policies.map((policy) => (
                                        <tr key={policy._id} className="transition hover:bg-white/2">
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                                                        <UserRound size={17} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-white">
                                                            {policy.user_id?.username || "Unknown Patient"}
                                                        </p>
                                                        <p className="mt-0.5 text-xs text-slate-500">
                                                            {policy.user_id?.email || "No email"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-5 py-4">
                                                <p className="text-sm font-medium text-white">
                                                    {policy.plan_id?.name || "Unknown Plan"}
                                                </p>
                                                <p className="mt-1 text-xs text-slate-500">
                                                    {policy.policy_number || "Proposal"}
                                                </p>
                                            </td>

                                            <td className="px-5 py-4">
                                                <p className="text-sm font-medium text-white">
                                                    ₹{Number(policy.plan_id?.coverage_amount || 0).toLocaleString("en-IN")}
                                                </p>
                                                <p className="mt-1 text-xs text-slate-500">
                                                    Premium ₹{Number(policy.plan_id?.premium_amount || 0).toLocaleString("en-IN")}
                                                </p>
                                            </td>

                                            <td className="px-5 py-4">
                                                <span
                                                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${statusStyles[policy.status] || "border-slate-700 bg-slate-500/10 text-slate-400"}`}
                                                >
                                                    {statusLabel(policy.status)}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4 text-sm text-slate-400">
                                                {formatDate(policy.created_at)}
                                            </td>

                                            <td className="px-5 py-4 text-right">
                                                <Link
                                                    href={`/dispatcher/insurance/${policy._id}`}
                                                    className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-blue-500/40 hover:text-white"
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

                        <div className="divide-y divide-slate-800 md:hidden">
                            {policies.map((policy) => (
                                <div key={policy._id} className="p-5">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                                                <UserRound size={18} />
                                            </div>

                                            <div>
                                                <p className="text-sm font-semibold text-white">
                                                    {policy.user_id?.username || "Unknown Patient"}
                                                </p>
                                                <p className="mt-1 text-xs text-slate-500">
                                                    {policy.user_id?.email || "No email"}
                                                </p>
                                            </div>
                                        </div>

                                        <span
                                            className={`rounded-full border px-2.5 py-1 text-xs font-medium ${statusStyles[policy.status] || "border-slate-700 bg-slate-500/10 text-slate-400"}`}
                                        >
                                            {statusLabel(policy.status)}
                                        </span>
                                    </div>

                                    <div className="mt-5 grid grid-cols-2 gap-3">
                                        <div className="rounded-xl border border-slate-800 bg-[#0c1426] p-3">
                                            <p className="text-xs text-slate-500">Plan</p>
                                            <p className="mt-1 truncate text-sm font-medium text-white">
                                                {policy.plan_id?.name || "Unknown Plan"}
                                            </p>
                                        </div>

                                        <div className="rounded-xl border border-slate-800 bg-[#0c1426] p-3">
                                            <p className="text-xs text-slate-500">Coverage</p>
                                            <p className="mt-1 text-sm font-medium text-white">
                                                ₹{Number(policy.plan_id?.coverage_amount || 0).toLocaleString("en-IN")}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex items-center justify-between">
                                        <p className="text-xs text-slate-500">
                                            Submitted {formatDate(policy.created_at)}
                                        </p>

                                        <Link
                                            href={`/dispatcher/insurance/${policy._id}`}
                                            className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-xs font-medium text-slate-300 hover:border-blue-500/40 hover:text-white"
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