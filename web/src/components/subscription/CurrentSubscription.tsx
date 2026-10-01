"use client";

import { AlertTriangle, CalendarDays, Check, Clock3, Coins, ShieldCheck, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";

type Subscription = {
    _id: string;
    plan_name: string;
    status: "pending" | "active" | "expired" | "cancelled";
    price: number;
    currency: string;
    token_limit: number;
    tokens_used: number;
    features: string[];
    supported_features: string[];
    start_date?: string;
    end_date?: string;
};

type Props = {
    subscription: Subscription | null;
    onViewPlans: () => void;
};

const formatDate = (date?: string) =>
    date
        ? new Date(date).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        })
        : "-";

const formatTokens = (value: number) =>
    new Intl.NumberFormat("en-IN").format(value);

export default function CurrentSubscription({ subscription, onViewPlans }: Props) {
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [cancelling, setCancelling] = useState(false);

    if (!subscription) {
        return (
            <div className="mx-auto max-w-xl border border-border bg-surface p-8 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                    <Sparkles className="h-6 w-6" />
                </div>

                <h2 className="mt-5 text-xl font-semibold text-foreground">
                    No active subscription
                </h2>

                <p className="mt-2 text-sm leading-6 text-muted">
                    Choose a SOMATIC plan to unlock premium AI healthcare features.
                </p>

                <button
                    type="button"
                    onClick={onViewPlans}
                    className="mt-6 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover"
                >
                    View Plans
                </button>
            </div>
        );
    }

    const remainingTokens = Math.max(
        subscription.token_limit - subscription.tokens_used,
        0,
    );

    const usagePercentage =
        subscription.token_limit > 0
            ? Math.min(
                (subscription.tokens_used / subscription.token_limit) * 100,
                100,
            )
            : 0;

    const handleCancel = async () => {
        setCancelling(true);

        try {
            const res = await fetch("/api/subscription/current", {
                method: "DELETE",
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                throw new Error(
                    data.error || "Failed to cancel subscription.",
                );
            }

            toast.success(
                data.message || "Subscription cancelled successfully.",
            );

            setShowCancelConfirm(false);

            window.location.reload();
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Failed to cancel subscription.",
            );
        } finally {
            setCancelling(false);
        }
    };

    return (
        <div className="mx-auto max-w-4xl">
            <div className="border border-border bg-surface">
                <div className="border-b border-border p-6 sm:p-8">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <div className="flex items-center gap-2 text-sm font-medium text-primary">
                                <ShieldCheck className="h-4 w-4" />
                                Active Subscription
                            </div>

                            <h2 className="mt-2 text-2xl font-bold text-foreground">
                                {subscription.plan_name}
                            </h2>

                            <p className="mt-1 text-sm text-muted">
                                Your SOMATIC subscription is currently active.
                            </p>
                        </div>

                        <span className="inline-flex w-fit items-center rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
                            Active
                        </span>
                    </div>
                </div>

                <div className="grid gap-px bg-border sm:grid-cols-3">
                    <div className="bg-surface p-6">
                        <CalendarDays className="h-5 w-5 text-primary" />
                        <p className="mt-3 text-xs text-muted">Started</p>
                        <p className="mt-1 font-semibold text-foreground">
                            {formatDate(subscription.start_date)}
                        </p>
                    </div>

                    <div className="bg-surface p-6">
                        <Clock3 className="h-5 w-5 text-primary" />
                        <p className="mt-3 text-xs text-muted">Valid Until</p>
                        <p className="mt-1 font-semibold text-foreground">
                            {formatDate(subscription.end_date)}
                        </p>
                    </div>

                    <div className="bg-surface p-6">
                        <Coins className="h-5 w-5 text-primary" />
                        <p className="mt-3 text-xs text-muted">Plan Price</p>
                        <p className="mt-1 font-semibold text-foreground">
                            {subscription.currency} {subscription.price}
                        </p>
                    </div>
                </div>

                <div className="border-b border-border p-6 sm:p-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold text-foreground">
                                AI Token Usage
                            </h3>

                            <p className="mt-1 text-sm text-muted">
                                {formatTokens(subscription.tokens_used)} used of{" "}
                                {formatTokens(subscription.token_limit)}
                            </p>
                        </div>

                        <span className="text-sm font-semibold text-primary">
                            {formatTokens(remainingTokens)} remaining
                        </span>
                    </div>

                    <div className="mt-5 h-2 overflow-hidden rounded-full bg-surface-secondary">
                        <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{ width: `${usagePercentage}%` }}
                        />
                    </div>
                </div>

                <div className="p-6 sm:p-8">
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />

                        <h3 className="font-semibold text-foreground">
                            Supported Features
                        </h3>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                        {(subscription.supported_features || []).map((feature) => (
                            <span
                                key={feature}
                                className="rounded-lg bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                            >
                                {feature}
                            </span>
                        ))}
                    </div>

                    <div className="mt-8 flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />

                        <h3 className="font-semibold text-foreground">
                            Plan Features
                        </h3>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        {(subscription.features || []).map((feature) => (
                            <div
                                key={feature}
                                className="flex items-center gap-3 border border-border bg-surface-secondary p-3"
                            >
                                <Check className="h-4 w-4 shrink-0 text-primary" />

                                <span className="text-sm text-foreground">
                                    {feature}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="border-t border-border p-6 sm:p-8">
                <button
                    type="button"
                    onClick={() => setShowCancelConfirm(true)}
                    className="text-sm font-medium text-danger transition hover:underline"
                >
                    Cancel Subscription
                </button>
            </div>

            {showCancelConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <div className="w-full max-w-md border border-border bg-surface p-6 shadow-2xl">
                        <div className="flex items-start gap-4">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-danger/10 text-danger">
                                <AlertTriangle className="h-5 w-5" />
                            </div>

                            <div className="min-w-0">
                                <h3 className="text-lg font-semibold text-foreground">
                                    Cancel subscription?
                                </h3>

                                <p className="mt-2 text-sm leading-6 text-muted">
                                    Your current {subscription.plan_name} subscription
                                    will be cancelled immediately. You will lose access
                                    to its premium features and remaining subscription
                                    tokens.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setShowCancelConfirm(false)}
                                disabled={cancelling}
                                className="ml-auto text-muted transition hover:text-foreground"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={() => setShowCancelConfirm(false)}
                                disabled={cancelling}
                                className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-surface-secondary disabled:opacity-50"
                            >
                                Keep Subscription
                            </button>

                            <button
                                type="button"
                                onClick={handleCancel}
                                disabled={cancelling}
                                className="rounded-lg bg-danger px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {cancelling
                                    ? "Cancelling..."
                                    : "Cancel Subscription"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}