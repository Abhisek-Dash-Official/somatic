"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    CheckCircle2,
    Clock3,
    CreditCard,
    FileText,
    Loader2,
    User,
    XCircle,
} from "lucide-react";

type Transaction = {
    _id: string;
    user_id:
    | {
        _id: string;
        username?: string;
        email?: string;
        contact_no?: string;
        role?: string;
    }
    | null;
    transaction_type: string;
    reference_id: string;
    amount: number;
    currency?: string;
    status: string;
    payment_gateway?: string;
    gateway_order_id?: string;
    gateway_payment_id?: string;
    paid_at?: string;
    failed_at?: string;
    failure_reason?: string;
    metadata?: Record<string, unknown>;
    created_at?: string;
    updated_at?: string;
};

type Subscription = {
    _id: string;
    plan_id?:
    | {
        _id: string;
        name?: string;
        description?: string;
        price?: number;
        currency?: string;
        duration_days?: number;
        features?: string[];
        token_limit?: number;
    }
    | string;
    plan_name: string;
    status: string;
    price: number;
    currency: string;
    token_limit: number;
    tokens_used: number;
    start_date?: string;
    end_date?: string;
    created_at?: string;
    updated_at?: string;
};

type AiUsage = {
    _id: string;
    feature: string;
    ai_model: string;
    tokens_prompt: number;
    tokens_completion: number;
    tokens_total: number;
    response_time_sec?: number;
    reference_id?: string;
    created_at?: string;
};

type ApiResponse = {
    transaction: Transaction;
    reference: Subscription | null;
    ai_usage: AiUsage[];
};

const formatType = (value: string) =>
    value
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

const formatDate = (date?: string) =>
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

const statusClass: Record<string, string> = {
    created: "bg-surface-secondary text-muted",
    pending: "bg-warning/10 text-warning",
    paid: "bg-success/10 text-success",
    failed: "bg-danger/10 text-danger",
    refunded: "bg-info/10 text-info",
    partially_refunded: "bg-warning/10 text-warning",
    cancelled: "bg-danger/10 text-danger",
};

const subscriptionStatusClass: Record<string, string> = {
    pending: "bg-warning/10 text-warning",
    active: "bg-success/10 text-success",
    expired: "bg-surface-secondary text-muted",
    cancelled: "bg-danger/10 text-danger",
};

const featureClass: Record<string, string> = {
    soma_ai: "bg-primary/10 text-primary",
    consultation_analysis: "bg-info/10 text-info",
    consultation_translation: "bg-accent text-accent-foreground",
};

export default function AdminTransactionDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const [transactionId, setTransactionId] = useState("");
    const [data, setData] = useState<ApiResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        params.then(({ id }) => setTransactionId(id));
    }, [params]);

    useEffect(() => {
        if (!transactionId) return;

        const fetchTransaction = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await fetch(
                    `/api/admin/transactions/${transactionId}`,
                    { cache: "no-store" },
                );

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.error || "Failed to fetch transaction");
                }

                setData(result);
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to fetch transaction",
                );
            } finally {
                setLoading(false);
            }
        };

        fetchTransaction();
    }, [transactionId]);

    const totalAiTokens = useMemo(
        () =>
            data?.ai_usage.reduce(
                (total, usage) => total + usage.tokens_total,
                0,
            ) || 0,
        [data],
    );

    const featureUsage = useMemo(() => {
        const usage: Record<string, number> = {};

        data?.ai_usage.forEach((item) => {
            usage[item.feature] = (usage[item.feature] || 0) + item.tokens_total;
        });

        return usage;
    }, [data]);

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-background">
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
            </main>
        );
    }

    if (error || !data) {
        return (
            <main className="min-h-screen bg-background px-4 py-6 text-foreground sm:px-6 lg:px-8">
                <div className="mx-auto max-w-5xl">
                    <Link
                        href="/admin/transactions"
                        className="mb-6 inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-foreground"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Transactions
                    </Link>

                    <div className="rounded-2xl border border-danger/30 bg-danger/10 p-6 text-sm text-danger">
                        {error || "Transaction not found"}
                    </div>
                </div>
            </main>
        );
    }

    const { transaction, reference: subscription, ai_usage } = data;

    return (
        <main className="min-h-screen bg-background px-4 py-5 text-foreground sm:px-6 sm:py-6 lg:px-8">
            <div className="mx-auto max-w-6xl">
                <Link
                    href="/admin/transactions"
                    className="mb-5 inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-foreground"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Transactions
                </Link>

                <header className="mb-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex min-w-0 items-start gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <CreditCard className="h-5 w-5" />
                            </div>

                            <div className="min-w-0">
                                <p className="text-sm font-medium text-primary">Finance</p>

                                <h1 className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">
                                    Transaction Details
                                </h1>

                                <p className="mt-1 break-all font-mono text-xs text-muted">
                                    {transaction._id}
                                </p>
                            </div>
                        </div>

                        <span
                            className={`inline-flex w-fit shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ${statusClass[transaction.status] ||
                                "bg-surface-secondary text-muted"
                                }`}
                        >
                            {formatType(transaction.status)}
                        </span>
                    </div>
                </header>

                <div className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.8fr)]">
                    <div className="space-y-5">
                        <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
                            <div className="border-b border-border px-4 py-4 sm:px-5">
                                <h2 className="font-semibold text-foreground">
                                    Payment Details
                                </h2>
                            </div>

                            <div className="grid gap-px bg-border sm:grid-cols-2">
                                <DetailItem label="Transaction ID" value={transaction._id} mono />

                                <DetailItem
                                    label="Transaction Type"
                                    value={formatType(transaction.transaction_type)}
                                />

                                <DetailItem
                                    label="Amount"
                                    value={formatAmount(
                                        transaction.amount,
                                        transaction.currency,
                                    )}
                                    strong
                                />

                                <DetailItem
                                    label="Currency"
                                    value={transaction.currency || "INR"}
                                />

                                <DetailItem
                                    label="Payment Gateway"
                                    value={
                                        transaction.payment_gateway
                                            ? transaction.payment_gateway.toUpperCase()
                                            : "—"
                                    }
                                />

                                <DetailItem
                                    label="Created At"
                                    value={formatDate(transaction.created_at)}
                                />

                                <DetailItem
                                    label="Paid At"
                                    value={formatDate(transaction.paid_at)}
                                />

                                <DetailItem
                                    label="Updated At"
                                    value={formatDate(transaction.updated_at)}
                                />
                            </div>
                        </section>

                        <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
                            <div className="border-b border-border px-4 py-4 sm:px-5">
                                <h2 className="font-semibold text-foreground">
                                    Gateway Details
                                </h2>
                            </div>

                            <div className="grid gap-px bg-border sm:grid-cols-2">
                                <DetailItem
                                    label="Gateway Order ID"
                                    value={transaction.gateway_order_id || "—"}
                                    mono
                                />

                                <DetailItem
                                    label="Gateway Payment ID"
                                    value={transaction.gateway_payment_id || "—"}
                                    mono
                                />

                                <DetailItem
                                    label="Failed At"
                                    value={formatDate(transaction.failed_at)}
                                />

                                <DetailItem
                                    label="Failure Reason"
                                    value={transaction.failure_reason || "—"}
                                />
                            </div>
                        </section>

                        <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
                            <div className="border-b border-border px-4 py-4 sm:px-5">
                                <h2 className="font-semibold text-foreground">
                                    Reference
                                </h2>
                            </div>

                            <div className="space-y-4 p-4 sm:p-5">
                                <DetailItem
                                    label="Reference ID"
                                    value={transaction.reference_id}
                                    mono
                                />

                                {subscription && (
                                    <div className="grid gap-px overflow-hidden rounded-xl bg-border sm:grid-cols-2">
                                        <DetailItem
                                            label="Plan"
                                            value={subscription.plan_name}
                                        />

                                        <DetailItem
                                            label="Subscription Status"
                                            value={
                                                <span
                                                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${subscriptionStatusClass[
                                                        subscription.status
                                                        ] ||
                                                        "bg-surface-secondary text-muted"
                                                        }`}
                                                >
                                                    {formatType(subscription.status)}
                                                </span>
                                            }
                                        />

                                        <DetailItem
                                            label="Subscription Price"
                                            value={formatAmount(
                                                subscription.price,
                                                subscription.currency,
                                            )}
                                            strong
                                        />

                                        <DetailItem
                                            label="Token Limit"
                                            value={subscription.token_limit.toLocaleString("en-IN")}
                                        />

                                        <DetailItem
                                            label="Tokens Used"
                                            value={subscription.tokens_used.toLocaleString("en-IN")}
                                        />

                                        <DetailItem
                                            label="Remaining Tokens"
                                            value={Math.max(
                                                0,
                                                subscription.token_limit -
                                                subscription.tokens_used,
                                            ).toLocaleString("en-IN")}
                                            strong
                                        />

                                        <DetailItem
                                            label="Start Date"
                                            value={formatDate(subscription.start_date)}
                                        />

                                        <DetailItem
                                            label="End Date"
                                            value={formatDate(subscription.end_date)}
                                        />
                                    </div>
                                )}
                            </div>
                        </section>

                        {subscription && (
                            <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
                                <div className="flex flex-col gap-1 border-b border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                                    <div>
                                        <h2 className="font-semibold text-foreground">
                                            AI Usage
                                        </h2>

                                        <p className="mt-0.5 text-xs text-muted">
                                            AI activity recorded against this subscription.
                                        </p>
                                    </div>

                                    <div className="text-sm font-semibold text-primary">
                                        {totalAiTokens.toLocaleString("en-IN")} tokens
                                    </div>
                                </div>

                                {ai_usage.length === 0 ? (
                                    <div className="flex min-h-32 items-center justify-center px-5 text-sm text-muted">
                                        No AI usage recorded yet.
                                    </div>
                                ) : (
                                    <>
                                        <div className="grid gap-px bg-border sm:grid-cols-3">
                                            {Object.entries(featureUsage).map(
                                                ([feature, tokens]) => (
                                                    <div
                                                        key={feature}
                                                        className="bg-surface p-4"
                                                    >
                                                        <p className="text-xs text-muted">
                                                            {formatType(feature)}
                                                        </p>

                                                        <p className="mt-1 text-lg font-semibold text-foreground">
                                                            {tokens.toLocaleString("en-IN")}
                                                        </p>

                                                        <p className="text-xs text-muted">
                                                            tokens
                                                        </p>
                                                    </div>
                                                ),
                                            )}
                                        </div>

                                        <div className="overflow-x-auto">
                                            <table className="min-w-212.5 w-full text-left text-sm">
                                                <thead className="border-b border-border bg-surface-secondary/60 text-xs uppercase tracking-wide text-muted">
                                                    <tr>
                                                        <th className="px-5 py-3 font-medium">Feature</th>
                                                        <th className="px-5 py-3 font-medium">Model</th>
                                                        <th className="px-5 py-3 font-medium">Prompt</th>
                                                        <th className="px-5 py-3 font-medium">Completion</th>
                                                        <th className="px-5 py-3 font-medium">Total</th>
                                                        <th className="px-5 py-3 font-medium">Response</th>
                                                        <th className="px-5 py-3 font-medium">Created</th>
                                                    </tr>
                                                </thead>

                                                <tbody className="divide-y divide-border">
                                                    {ai_usage.map((usage) => (
                                                        <tr
                                                            key={usage._id}
                                                            className="hover:bg-surface-secondary/40"
                                                        >
                                                            <td className="px-5 py-4">
                                                                <span
                                                                    className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${featureClass[
                                                                        usage.feature
                                                                        ] ||
                                                                        "bg-surface-secondary text-muted"
                                                                        }`}
                                                                >
                                                                    {formatType(usage.feature)}
                                                                </span>
                                                            </td>

                                                            <td className="max-w-48 truncate px-5 py-4 font-mono text-xs text-muted">
                                                                {usage.ai_model}
                                                            </td>

                                                            <td className="px-5 py-4 text-muted">
                                                                {usage.tokens_prompt.toLocaleString("en-IN")}
                                                            </td>

                                                            <td className="px-5 py-4 text-muted">
                                                                {usage.tokens_completion.toLocaleString("en-IN")}
                                                            </td>

                                                            <td className="px-5 py-4 font-semibold text-foreground">
                                                                {usage.tokens_total.toLocaleString("en-IN")}
                                                            </td>

                                                            <td className="px-5 py-4 text-muted">
                                                                {usage.response_time_sec != null
                                                                    ? `${usage.response_time_sec}s`
                                                                    : "—"}
                                                            </td>

                                                            <td className="whitespace-nowrap px-5 py-4 text-muted">
                                                                {formatDate(usage.created_at)}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </>
                                )}
                            </section>
                        )}
                    </div>

                    <aside className="space-y-5">
                        <section className="rounded-2xl border border-border bg-surface shadow-sm">
                            <div className="border-b border-border px-4 py-4 sm:px-5">
                                <h2 className="font-semibold text-foreground">
                                    Customer
                                </h2>
                            </div>

                            <div className="space-y-4 p-4 sm:p-5">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                        <User className="h-5 w-5" />
                                    </div>

                                    <div className="min-w-0">
                                        <p className="truncate font-semibold text-foreground">
                                            {transaction.user_id?.username || "Unknown"}
                                        </p>

                                        <p className="truncate text-xs text-muted">
                                            {transaction.user_id?.role
                                                ? formatType(transaction.user_id.role)
                                                : "—"}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <InfoRow
                                        label="Email"
                                        value={transaction.user_id?.email || "—"}
                                    />

                                    <InfoRow
                                        label="Contact"
                                        value={transaction.user_id?.contact_no || "—"}
                                    />
                                </div>
                            </div>
                        </section>

                        <section className="rounded-2xl border border-border bg-surface shadow-sm">
                            <div className="border-b border-border px-4 py-4 sm:px-5">
                                <h2 className="font-semibold text-foreground">
                                    Transaction Status
                                </h2>
                            </div>

                            <div className="space-y-4 p-4 sm:p-5">
                                <StatusItem
                                    icon={
                                        transaction.status === "paid"
                                            ? CheckCircle2
                                            : transaction.status === "failed"
                                                ? XCircle
                                                : Clock3
                                    }
                                    title={formatType(transaction.status)}
                                    description={formatDate(
                                        transaction.updated_at || transaction.created_at,
                                    )}
                                />

                                <StatusItem
                                    icon={FileText}
                                    title="Created"
                                    description={formatDate(transaction.created_at)}
                                />

                                {transaction.paid_at && (
                                    <StatusItem
                                        icon={CheckCircle2}
                                        title="Payment Completed"
                                        description={formatDate(transaction.paid_at)}
                                    />
                                )}

                                {transaction.failed_at && (
                                    <StatusItem
                                        icon={XCircle}
                                        title="Payment Failed"
                                        description={formatDate(transaction.failed_at)}
                                    />
                                )}
                            </div>
                        </section>

                        {subscription?.plan_id &&
                            typeof subscription.plan_id !== "string" && (
                                <section className="rounded-2xl border border-border bg-surface shadow-sm">
                                    <div className="border-b border-border px-4 py-4 sm:px-5">
                                        <h2 className="font-semibold text-foreground">
                                            Plan
                                        </h2>
                                    </div>

                                    <div className="space-y-4 p-4 sm:p-5">
                                        <div>
                                            <p className="font-semibold text-foreground">
                                                {subscription.plan_id.name ||
                                                    subscription.plan_name}
                                            </p>

                                            {subscription.plan_id.description && (
                                                <p className="mt-1 text-sm text-muted">
                                                    {subscription.plan_id.description}
                                                </p>
                                            )}
                                        </div>

                                        {subscription.plan_id.features &&
                                            subscription.plan_id.features.length > 0 && (
                                                <ul className="space-y-2">
                                                    {subscription.plan_id.features.map(
                                                        (feature) => (
                                                            <li
                                                                key={feature}
                                                                className="flex items-start gap-2 text-sm text-muted"
                                                            >
                                                                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                                                                <span>{feature}</span>
                                                            </li>
                                                        ),
                                                    )}
                                                </ul>
                                            )}
                                    </div>
                                </section>
                            )}
                    </aside>
                </div>
            </div>
        </main>
    );
}

function DetailItem({
    label,
    value,
    mono = false,
    strong = false,
}: {
    label: string;
    value: React.ReactNode;
    mono?: boolean;
    strong?: boolean;
}) {
    return (
        <div className="bg-surface p-4">
            <p className="text-xs font-medium text-muted">{label}</p>

            <div
                className={`mt-1 wrap-break-word text-sm ${strong
                        ? "font-semibold text-foreground"
                        : "text-foreground"
                    } ${mono ? "font-mono text-xs" : ""}`}
            >
                {value}
            </div>
        </div>
    );
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-xs text-muted">{label}</p>
            <p className="mt-0.5 break-all text-sm text-foreground">{value}</p>
        </div>
    );
}

function StatusItem({
    icon: Icon,
    title,
    description,
}: {
    icon: typeof CheckCircle2;
    title: string;
    description: string;
}) {
    return (
        <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-surface-secondary text-primary">
                <Icon className="h-4 w-4" />
            </div>

            <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">{title}</p>
                <p className="mt-0.5 text-xs text-muted">{description}</p>
            </div>
        </div>
    );
}