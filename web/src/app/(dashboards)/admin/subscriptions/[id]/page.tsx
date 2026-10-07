"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    CheckCircle2,
    Clock3,
    CreditCard,
    Crown,
    Loader2,
    Sparkles,
    User,
} from "lucide-react";

type Subscription = {
    _id: string;
    plan_name: string;
    status: "pending" | "active" | "expired" | "cancelled";
    price: number;
    currency: string;
    token_limit: number;
    tokens_used: number;
    start_date?: string;
    end_date?: string;
    created_at?: string;
    user_id: {
        _id: string;
        username: string;
        email: string;
        contact_no?: string;
        avatar_id?: string;
        role: string;
    };
    plan_id?: {
        _id: string;
        name: string;
        description?: string;
        price: number;
        currency: string;
        duration_days: number;
        features: string[];
        token_limit: number;
    };
};

type Usage = {
    _id: string;
    feature:
    | "soma_ai"
    | "consultation_analysis"
    | "consultation_translation";
    ai_model: string;
    tokens_prompt: number;
    tokens_completion: number;
    tokens_total: number;
    response_time_sec?: number;
    reference_id?: string;
    created_at?: string;
};

type Transaction = {
    _id: string;
    transaction_type: string;
    amount: number;
    currency?: string;
    status: string;
    payment_gateway?: string;
    gateway_order_id?: string;
    gateway_payment_id?: string;
    paid_at?: string;
    created_at?: string;
    failure_reason?: string;
};

const formatAmount = (amount: number, currency = "INR") =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency,
    }).format(amount);

const formatDate = (date?: string) =>
    date
        ? new Date(date).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
        : "—";

const statusClass = (status: string) =>
    status === "active" || status === "paid"
        ? "bg-success/10 text-success"
        : status === "pending"
            ? "bg-warning/10 text-warning"
            : status === "failed" ||
                status === "cancelled" ||
                status === "rejected"
                ? "bg-danger/10 text-danger"
                : "bg-muted/10 text-muted";

const featureLabel = (feature: Usage["feature"]) =>
    feature === "soma_ai"
        ? "SOMA AI"
        : feature === "consultation_analysis"
            ? "Consultation Analysis"
            : "Consultation Translation";

export default function SubscriptionDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [usage, setUsage] = useState<Usage[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const load = async () => {
            try {
                const { id } = await params;

                const res = await fetch(
                    `/api/admin/subscriptions/${id}?type=subscription`,
                    { cache: "no-store" },
                );

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(
                        data.message || "Failed to fetch subscription",
                    );
                }

                setSubscription(data.subscription);
                setUsage(data.usage || []);
                setTransactions(data.transactions || []);
            } catch (err: any) {
                setError(err.message || "Failed to fetch subscription");
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [params]);

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-background">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </main>
        );
    }

    if (error || !subscription) {
        return (
            <main className="min-h-screen bg-background px-4 py-8 text-foreground">
                <div className="mx-auto max-w-5xl">
                    <Link
                        href="/admin/subscriptions"
                        className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Subscriptions
                    </Link>

                    <div className="mt-6 rounded-2xl border border-danger/30 bg-danger/10 p-6 text-sm text-danger">
                        {error || "Subscription not found"}
                    </div>
                </div>
            </main>
        );
    }

    const usagePercent =
        subscription.token_limit > 0
            ? Math.min(
                (subscription.tokens_used / subscription.token_limit) * 100,
                100,
            )
            : 0;

    return (
        <main className="min-h-screen bg-background px-4 py-6 text-foreground sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl">
                <Link
                    href="/admin/subscriptions"
                    className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Subscriptions
                </Link>

                <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <div className="mb-2 flex items-center gap-2 text-primary">
                            <Crown className="h-5 w-5" />
                            <span className="text-sm font-medium">
                                Subscription Details
                            </span>
                        </div>

                        <h1 className="text-2xl font-semibold">
                            {subscription.plan_name}
                        </h1>

                        <p className="mt-1 text-sm text-muted">
                            Subscription ID: {subscription._id}
                        </p>
                    </div>

                    <span
                        className={`w-fit rounded-full px-3 py-1.5 text-xs font-medium ${statusClass(
                            subscription.status,
                        )}`}
                    >
                        {subscription.status}
                    </span>
                </div>

                <div className="mt-6 grid gap-4 lg:grid-cols-3">
                    <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
                        <div className="flex items-center gap-2 text-muted">
                            <User className="h-4 w-4" />
                            <span className="text-xs font-medium uppercase tracking-wide">
                                Subscriber
                            </span>
                        </div>

                        <h2 className="mt-4 font-semibold">
                            {subscription.user_id.username}
                        </h2>

                        <p className="mt-1 text-sm text-muted">
                            {subscription.user_id.email}
                        </p>

                        {subscription.user_id.contact_no && (
                            <p className="mt-1 text-sm text-muted">
                                {subscription.user_id.contact_no}
                            </p>
                        )}
                    </section>

                    <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
                        <div className="flex items-center gap-2 text-muted">
                            <Crown className="h-4 w-4" />
                            <span className="text-xs font-medium uppercase tracking-wide">
                                Plan
                            </span>
                        </div>

                        <h2 className="mt-4 font-semibold">
                            {subscription.plan_name}
                        </h2>

                        <p className="mt-1 text-2xl font-semibold">
                            {formatAmount(
                                subscription.price,
                                subscription.currency,
                            )}
                        </p>

                        <p className="mt-1 text-sm text-muted">
                            {subscription.plan_id?.duration_days || "—"} days
                        </p>
                    </section>

                    <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
                        <div className="flex items-center gap-2 text-muted">
                            <Sparkles className="h-4 w-4" />
                            <span className="text-xs font-medium uppercase tracking-wide">
                                Token Usage
                            </span>
                        </div>

                        <div className="mt-4 flex items-end justify-between">
                            <p className="text-2xl font-semibold">
                                {subscription.tokens_used.toLocaleString()}
                            </p>

                            <p className="text-sm text-muted">
                                / {subscription.token_limit.toLocaleString()}
                            </p>
                        </div>

                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-secondary">
                            <div
                                className="h-full rounded-full bg-primary transition-all"
                                style={{ width: `${usagePercent}%` }}
                            />
                        </div>

                        <p className="mt-2 text-xs text-muted">
                            {usagePercent.toFixed(1)}% used
                        </p>
                    </section>
                </div>

                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                    <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
                        <div className="flex items-center gap-2">
                            <Clock3 className="h-4 w-4 text-primary" />
                            <h2 className="font-semibold">
                                Subscription Period
                            </h2>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-muted">Started</p>
                                <p className="mt-1 text-sm font-medium">
                                    {formatDate(subscription.start_date)}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-muted">Expires</p>
                                <p className="mt-1 text-sm font-medium">
                                    {formatDate(subscription.end_date)}
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                            <h2 className="font-semibold">Plan Features</h2>
                        </div>

                        <div className="mt-4 space-y-2">
                            {(subscription.plan_id?.features || []).length > 0 ? (
                                subscription.plan_id?.features.map(
                                    (feature, index) => (
                                        <div
                                            key={index}
                                            className="flex gap-2 text-sm text-muted"
                                        >
                                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                            {feature}
                                        </div>
                                    ),
                                )
                            ) : (
                                <p className="text-sm text-muted">
                                    No features configured.
                                </p>
                            )}
                        </div>
                    </section>
                </div>

                <section className="mt-4 overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
                    <div className="border-b border-border px-5 py-4">
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-primary" />
                            <h2 className="font-semibold">AI Usage</h2>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-212.5 w-full text-left">
                            <thead className="border-b border-border bg-surface-secondary">
                                <tr className="text-xs uppercase tracking-wide text-muted">
                                    <th className="px-5 py-3 font-medium">
                                        Feature
                                    </th>
                                    <th className="px-5 py-3 font-medium">
                                        Model
                                    </th>
                                    <th className="px-5 py-3 font-medium">
                                        Prompt
                                    </th>
                                    <th className="px-5 py-3 font-medium">
                                        Completion
                                    </th>
                                    <th className="px-5 py-3 font-medium">
                                        Total
                                    </th>
                                    <th className="px-5 py-3 font-medium">
                                        Time
                                    </th>
                                    <th className="px-5 py-3 font-medium">
                                        Date
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-border">
                                {usage.map((item) => (
                                    <tr
                                        key={item._id}
                                        className="hover:bg-surface-secondary/50"
                                    >
                                        <td className="px-5 py-4 text-sm font-medium">
                                            {featureLabel(item.feature)}
                                        </td>

                                        <td className="px-5 py-4 font-mono text-xs text-muted">
                                            {item.ai_model}
                                        </td>

                                        <td className="px-5 py-4 text-sm">
                                            {item.tokens_prompt.toLocaleString()}
                                        </td>

                                        <td className="px-5 py-4 text-sm">
                                            {item.tokens_completion.toLocaleString()}
                                        </td>

                                        <td className="px-5 py-4 text-sm font-medium">
                                            {item.tokens_total.toLocaleString()}
                                        </td>

                                        <td className="px-5 py-4 text-sm text-muted">
                                            {item.response_time_sec
                                                ? `${item.response_time_sec}s`
                                                : "—"}
                                        </td>

                                        <td className="px-5 py-4 text-sm text-muted">
                                            {formatDate(item.created_at)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {usage.length === 0 && (
                        <div className="p-8 text-center text-sm text-muted">
                            No AI usage recorded for this subscription.
                        </div>
                    )}
                </section>

                <section className="mt-4 overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
                    <div className="border-b border-border px-5 py-4">
                        <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-primary" />
                            <h2 className="font-semibold">
                                Payment Transactions
                            </h2>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-212.5 w-full text-left">
                            <thead className="border-b border-border bg-surface-secondary">
                                <tr className="text-xs uppercase tracking-wide text-muted">
                                    <th className="px-5 py-3 font-medium">
                                        Transaction
                                    </th>
                                    <th className="px-5 py-3 font-medium">
                                        Amount
                                    </th>
                                    <th className="px-5 py-3 font-medium">
                                        Status
                                    </th>
                                    <th className="px-5 py-3 font-medium">
                                        Gateway
                                    </th>
                                    <th className="px-5 py-3 font-medium">
                                        Payment ID
                                    </th>
                                    <th className="px-5 py-3 font-medium">
                                        Date
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-border">
                                {transactions.map((transaction) => (
                                    <tr
                                        key={transaction._id}
                                        className="hover:bg-surface-secondary/50"
                                    >
                                        <td className="px-5 py-4 font-mono text-xs">
                                            {transaction._id}
                                        </td>

                                        <td className="px-5 py-4 text-sm font-medium">
                                            {formatAmount(
                                                transaction.amount,
                                                transaction.currency,
                                            )}
                                        </td>

                                        <td className="px-5 py-4">
                                            <span
                                                className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(
                                                    transaction.status,
                                                )}`}
                                            >
                                                {transaction.status}
                                            </span>
                                        </td>

                                        <td className="px-5 py-4 text-sm text-muted">
                                            {transaction.payment_gateway || "—"}
                                        </td>

                                        <td className="max-w-48 truncate px-5 py-4 font-mono text-xs text-muted">
                                            {transaction.gateway_payment_id ||
                                                "—"}
                                        </td>

                                        <td className="px-5 py-4 text-sm text-muted">
                                            {formatDate(
                                                transaction.paid_at ||
                                                transaction.created_at,
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {transactions.length === 0 && (
                        <div className="p-8 text-center text-sm text-muted">
                            No payment transactions found.
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}