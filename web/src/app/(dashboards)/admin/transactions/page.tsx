"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
    ArrowUpRight,
    ChevronDown,
    CreditCard,
    Loader2,
    Search,
    X,
} from "lucide-react";
import Link from "next/link";
import { ITransaction, IUser } from "@/types/models";

type PopulatedTransaction = Omit<ITransaction, "user_id"> & {
    _id: string;
    user_id: Pick<IUser, "username" | "email" | "contact_no">;
};

type TransactionType = ITransaction["transaction_type"];
type TransactionStatus = ITransaction["status"];

type ApiResponse = {
    transactions: PopulatedTransaction[];
    next_cursor: string | null;
    has_more: boolean;
};

const transactionTypes: { value: TransactionType; label: string }[] = [
    { value: "insurance_premium", label: "Insurance Premium" },
    { value: "shop_order", label: "Shop Order" },
    { value: "lab_booking", label: "Lab Booking" },
    { value: "subscription", label: "Subscription" },
];

const statuses: { value: TransactionStatus; label: string }[] = [
    { value: "created", label: "Created" },
    { value: "pending", label: "Pending" },
    { value: "paid", label: "Paid" },
    { value: "failed", label: "Failed" },
    { value: "refunded", label: "Refunded" },
    { value: "partially_refunded", label: "Partially Refunded" },
    { value: "cancelled", label: "Cancelled" },
];

const statusClass: Record<TransactionStatus, string> = {
    created: "bg-surface-secondary text-muted",
    pending: "bg-warning/10 text-warning",
    paid: "bg-success/10 text-success",
    failed: "bg-danger/10 text-danger",
    refunded: "bg-info/10 text-info",
    partially_refunded: "bg-warning/10 text-warning",
    cancelled: "bg-danger/10 text-danger",
};

const formatType = (type: string) =>
    type
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

const formatDate = (date?: Date | string) =>
    date
        ? new Date(date).toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short",
        })
        : "—";

const formatAmount = (amount: number, currency = "INR") =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
    }).format(amount);

export default function AdminTransactionsPage() {
    const [transactions, setTransactions] = useState<PopulatedTransaction[]>([]);
    const [search, setSearch] = useState("");
    const [type, setType] = useState("");
    const [status, setStatus] = useState("");
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [sort, setSort] = useState("newest");
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState("");

    const requestIdRef = useRef(0);

    const fetchTransactions = useCallback(
        async (cursor?: string, append = false) => {
            const requestId = ++requestIdRef.current;

            try {
                if (append) setLoadingMore(true);
                else setLoading(true);

                setError("");

                const params = new URLSearchParams();

                if (search.trim()) params.set("q", search.trim());
                if (type) params.set("transaction_type", type);
                if (status) params.set("status", status);
                if (from) params.set("from", from);
                if (to) params.set("to", to);
                if (sort) params.set("sort", sort);
                if (cursor) params.set("cursor", cursor);

                params.set("limit", "20");

                const response = await fetch(
                    `/api/admin/transactions?${params.toString()}`,
                    { cache: "no-store" },
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || "Failed to fetch transactions");
                }

                if (requestId !== requestIdRef.current) return;

                const result = data as ApiResponse;

                setTransactions((prev) =>
                    append ? [...prev, ...result.transactions] : result.transactions,
                );
                setNextCursor(result.next_cursor);
                setHasMore(result.has_more);
            } catch (err) {
                if (requestId !== requestIdRef.current) return;

                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to fetch transactions",
                );

                if (!append) {
                    setTransactions([]);
                    setNextCursor(null);
                    setHasMore(false);
                }
            } finally {
                if (requestId === requestIdRef.current) {
                    setLoading(false);
                    setLoadingMore(false);
                }
            }
        },
        [search, type, status, from, to, sort],
    );

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchTransactions();
        }, 300);

        return () => clearTimeout(timer);
    }, [fetchTransactions]);

    const clearFilters = () => {
        setSearch("");
        setType("");
        setStatus("");
        setFrom("");
        setTo("");
        setSort("newest");
    };

    const hasFilters = Boolean(
        search || type || status || from || to || sort !== "newest",
    );

    return (
        <main className="min-h-screen bg-background px-4 py-5 text-foreground sm:px-6 sm:py-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <header className="mb-6">
                    <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <CreditCard className="h-5 w-5" />
                        </div>

                        <div className="min-w-0">
                            <p className="text-sm font-medium text-primary">Finance</p>

                            <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                                Transactions
                            </h1>

                            <p className="mt-1 max-w-2xl text-sm text-muted">
                                View platform payment transactions and their current payment status.
                            </p>
                        </div>
                    </div>
                </header>

                <section className="mb-5 rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-5">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="sm:col-span-2 lg:col-span-2">
                            <label className="mb-1.5 block text-xs font-medium text-muted">
                                Search
                            </label>

                            <div className="relative">
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="User, email, transaction or gateway ID..."
                                    className="h-10 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-muted">
                                Transaction Type
                            </label>

                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary"
                            >
                                <option value="">All Types</option>
                                {transactionTypes.map((item) => (
                                    <option key={item.value} value={item.value}>
                                        {item.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-muted">
                                Status
                            </label>

                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary"
                            >
                                <option value="">All Statuses</option>
                                {statuses.map((item) => (
                                    <option key={item.value} value={item.value}>
                                        {item.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-muted">
                                From Date
                            </label>

                            <input
                                type="date"
                                value={from}
                                max={to || undefined}
                                onChange={(e) => setFrom(e.target.value)}
                                className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary"
                            />
                        </div>

                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-muted">
                                To Date
                            </label>

                            <input
                                type="date"
                                value={to}
                                min={from || undefined}
                                onChange={(e) => setTo(e.target.value)}
                                className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary"
                            />
                        </div>

                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-muted">
                                Sort
                            </label>

                            <select
                                value={sort}
                                onChange={(e) => setSort(e.target.value)}
                                className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary"
                            >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                            </select>
                        </div>

                        {hasFilters && (
                            <div className="flex items-end">
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-medium text-muted transition-colors hover:bg-surface-secondary hover:text-foreground"
                                >
                                    <X className="h-4 w-4" />
                                    Clear Filters
                                </button>
                            </div>
                        )}
                    </div>
                </section>

                {error && (
                    <div className="mb-5 flex items-start gap-3 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
                        <span className="min-w-0">{error}</span>
                    </div>
                )}

                <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
                    <div className="flex flex-col gap-1 border-b border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                        <div>
                            <h2 className="font-semibold text-foreground">All Transactions</h2>

                            <p className="mt-0.5 text-xs text-muted">
                                {transactions.length} transaction
                                {transactions.length !== 1 ? "s" : ""} loaded
                            </p>
                        </div>

                        {loading && (
                            <div className="flex items-center gap-2 text-xs text-muted">
                                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                Loading transactions...
                            </div>
                        )}
                    </div>

                    {loading ? (
                        <div className="flex min-h-64 items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                    ) : transactions.length === 0 ? (
                        <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
                            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-surface-secondary text-muted-foreground">
                                <CreditCard className="h-6 w-6" />
                            </div>

                            <h3 className="font-semibold text-foreground">
                                No transactions found
                            </h3>

                            <p className="mt-1 max-w-sm text-sm text-muted">
                                Try changing your search criteria or filters.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="min-w-275 w-full text-left text-sm">
                                    <thead className="border-b border-border bg-surface-secondary/60 text-xs uppercase tracking-wide text-muted">
                                        <tr>
                                            <th className="whitespace-nowrap px-5 py-3 font-medium">Transaction</th>
                                            <th className="whitespace-nowrap px-5 py-3 font-medium">User</th>
                                            <th className="whitespace-nowrap px-5 py-3 font-medium">Type</th>
                                            <th className="whitespace-nowrap px-5 py-3 font-medium">Amount</th>
                                            <th className="whitespace-nowrap px-5 py-3 font-medium">Status</th>
                                            <th className="whitespace-nowrap px-5 py-3 font-medium">Gateway</th>
                                            <th className="whitespace-nowrap px-5 py-3 font-medium">Created</th>
                                            <th className="whitespace-nowrap px-5 py-3 font-medium">Paid</th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-border">
                                        {transactions.map((transaction) => (
                                            <tr
                                                key={transaction._id}
                                                className="transition-colors hover:bg-surface-secondary/50"
                                            >
                                                <td className="px-5 py-4 align-top">
                                                    <Link
                                                        href={`/admin/transactions/${transaction._id}`}
                                                        className="group inline-flex max-w-52 items-center gap-1.5 font-mono text-xs font-medium text-primary transition-colors hover:text-primary-hover"
                                                    >
                                                        <span className="truncate">{transaction._id}</span>
                                                        <ArrowUpRight className="h-3.5 w-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
                                                    </Link>

                                                    {transaction.gateway_payment_id && (
                                                        <p className="mt-1 max-w-52 truncate text-xs text-muted">
                                                            {transaction.gateway_payment_id}
                                                        </p>
                                                    )}
                                                </td>

                                                <td className="px-5 py-4 align-top">
                                                    <p className="font-medium text-foreground">
                                                        {transaction.user_id?.username || "Unknown"}
                                                    </p>

                                                    <p className="mt-1 max-w-52 truncate text-xs text-muted">
                                                        {transaction.user_id?.email || "—"}
                                                    </p>
                                                </td>

                                                <td className="whitespace-nowrap px-5 py-4 align-top text-muted">
                                                    {formatType(transaction.transaction_type)}
                                                </td>

                                                <td className="whitespace-nowrap px-5 py-4 align-top font-semibold text-foreground">
                                                    {formatAmount(transaction.amount, transaction.currency)}
                                                </td>

                                                <td className="px-5 py-4 align-top">
                                                    <span
                                                        className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${statusClass[transaction.status]}`}
                                                    >
                                                        {formatType(transaction.status)}
                                                    </span>
                                                </td>

                                                <td className="whitespace-nowrap px-5 py-4 align-top text-muted">
                                                    {transaction.payment_gateway
                                                        ? transaction.payment_gateway.toUpperCase()
                                                        : "—"}
                                                </td>

                                                <td className="whitespace-nowrap px-5 py-4 align-top text-muted">
                                                    {formatDate(transaction.created_at)}
                                                </td>

                                                <td className="whitespace-nowrap px-5 py-4 align-top text-muted">
                                                    {formatDate(transaction.paid_at)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {hasMore && nextCursor && (
                                <div className="flex justify-center border-t border-border p-4">
                                    <button
                                        type="button"
                                        disabled={loadingMore}
                                        onClick={() => fetchTransactions(nextCursor, true)}
                                        className="flex w-full max-w-48 items-center justify-center gap-2 rounded-xl border border-border bg-background px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-surface-secondary disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                                    >
                                        {loadingMore ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Loading...
                                            </>
                                        ) : (
                                            <>
                                                Load More
                                                <ChevronDown className="h-4 w-4" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </section>
            </div>
        </main>
    );
}