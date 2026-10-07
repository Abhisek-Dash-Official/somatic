"use client";

import { useEffect, useState } from "react";
import { Check, Crown, Loader2, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "react-toastify";

declare global {
    interface Window {
        Razorpay: any;
    }
}

type SubscriptionPlan = {
    _id: string;
    name: string;
    description?: string;
    price: number;
    currency: string;
    duration_days: number;
    features: string[];
    supported_features: string[];
    token_limit: number;
};

type Props = {
    hasActiveSubscription: boolean;
    onPurchaseSuccess: () => Promise<void>;
};

const loadRazorpay = () =>
    new Promise<boolean>((resolve) => {
        if (window.Razorpay) {
            resolve(true);
            return;
        }

        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });

const formatTokens = (tokens: number) => {
    if (tokens >= 1000000) return `${tokens / 1000000}M`;
    if (tokens >= 1000) return `${tokens / 1000}K`;
    return tokens.toString();
};

const getDurationLabel = (days: number) => {
    if (days === 1) return "1 day";
    if (days === 30) return "1 month";
    if (days === 90) return "3 months";
    if (days === 365) return "1 year";
    return `${days} days`;
};

export default function SubscriptionPlans({ hasActiveSubscription, onPurchaseSuccess }: Props) {
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [buyingPlan, setBuyingPlan] = useState<string | null>(null);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const res = await fetch("/api/subscription/plans", { cache: "no-store" });
                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.error || "Failed to load subscription plans.");
                }

                setPlans(data.plans || []);
            } catch (error) {
                toast.error(error instanceof Error ? error.message : "Failed to load subscription plans.");
            } finally {
                setLoading(false);
            }
        };

        fetchPlans();
    }, []);

    const handlePurchase = async (plan: SubscriptionPlan) => {
        if (buyingPlan || hasActiveSubscription) return;

        setBuyingPlan(plan._id);

        const toastId = toast.loading("Preparing secure payment...");

        try {
            const loaded = await loadRazorpay();

            if (!loaded) {
                toast.update(toastId, {
                    render: "Unable to load payment gateway. Please try again.",
                    type: "error",
                    isLoading: false,
                    autoClose: 5000,
                });
                return;
            }

            const orderRes = await fetch("/api/subscription/create-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ plan_id: plan._id }),
            });

            const orderData = await orderRes.json();

            if (!orderRes.ok) {
                toast.update(toastId, {
                    render: orderData.error || "Unable to create payment order.",
                    type: "error",
                    isLoading: false,
                    autoClose: 5000,
                });
                return;
            }

            toast.update(toastId, {
                render: "Opening secure payment...",
                type: "info",
                isLoading: true,
            });

            const razorpay = new window.Razorpay({
                key: orderData.key_id,
                amount: orderData.amount,
                currency: orderData.currency,
                name: "SOMATIC",
                description: plan.name,
                order_id: orderData.order_id,
                theme: { color: "#10b981" },
                handler: async (response: {
                    razorpay_payment_id: string;
                    razorpay_order_id: string;
                    razorpay_signature: string;
                }) => {
                    try {
                        toast.update(toastId, {
                            render: "Verifying payment...",
                            type: "info",
                            isLoading: true,
                        });

                        const verifyRes = await fetch("/api/subscription/verify-payment", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(response),
                        });

                        const verifyData = await verifyRes.json();

                        if (!verifyRes.ok) {
                            toast.update(toastId, {
                                render: verifyData.error || "Payment verification failed.",
                                type: "error",
                                isLoading: false,
                                autoClose: 6000,
                            });
                            return;
                        }

                        toast.update(toastId, {
                            render: "Subscription activated successfully!",
                            type: "success",
                            isLoading: false,
                            autoClose: 3000,
                        });

                        await onPurchaseSuccess();
                    } catch {
                        toast.update(toastId, {
                            render: "Payment completed, but verification could not be completed. Please contact support.",
                            type: "error",
                            isLoading: false,
                            autoClose: 7000,
                        });
                    }
                },
                modal: {
                    ondismiss: () => {
                        toast.update(toastId, {
                            render: "Payment cancelled.",
                            type: "info",
                            isLoading: false,
                            autoClose: 3000,
                        });
                    },
                },
            });

            razorpay.on("payment.failed", (response: { error?: { description?: string } }) => {
                toast.update(toastId, {
                    render: response?.error?.description || "Payment failed. Please try again.",
                    type: "error",
                    isLoading: false,
                    autoClose: 5000,
                });
            });

            razorpay.open();
        } catch (error) {
            toast.update(toastId, {
                render: error instanceof Error ? error.message : "Something went wrong. Please try again.",
                type: "error",
                isLoading: false,
                autoClose: 5000,
            });
        } finally {
            setBuyingPlan(null);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-24">
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
            </div>
        );
    }

    if (!plans.length) {
        return (
            <div className="rounded-2xl border border-border bg-surface p-10 text-center shadow-sm">
                <Sparkles className="mx-auto h-8 w-8 text-muted" />
                <h2 className="mt-4 font-semibold text-foreground">No subscription plans available</h2>
                <p className="mt-2 text-sm text-muted">Please check again later.</p>
            </div>
        );
    }

    return (
        <div>
            {hasActiveSubscription && (
                <div className="mx-auto mb-8 max-w-3xl rounded-xl border border-border bg-surface-secondary p-4 text-center text-sm text-muted">
                    You already have an active subscription. You can manage it from the{" "}
                    <span className="font-medium text-foreground">My Subscription</span>{" "}
                    tab.
                </div>
            )}

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                {plans.map((plan) => {
                    const isPopular = plan.duration_days === 30;
                    const isBuying = buyingPlan === plan._id;

                    return (
                        <div
                            key={plan._id}
                            className={`relative flex flex-col rounded-2xl border bg-surface p-6 ${isPopular
                                    ? "border-primary shadow-lg shadow-primary/10"
                                    : "border-border shadow-sm"
                                }`}
                        >
                            {isPopular && (
                                <div className="absolute -top-3 left-5 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                                    Most Popular
                                </div>
                            )}

                            <div>
                                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                                    {plan.duration_days === 365 ? (
                                        <Crown className="h-5 w-5" />
                                    ) : (
                                        <Sparkles className="h-5 w-5" />
                                    )}
                                </div>

                                <h2 className="text-lg font-semibold text-foreground">{plan.name}</h2>

                                <p className="mt-2 min-h-10 text-sm leading-5 text-muted">
                                    {plan.description}
                                </p>
                            </div>

                            <div className="mt-6">
                                <div className="flex items-end gap-1">
                                    <span className="text-3xl font-bold text-foreground">₹{plan.price}</span>
                                    <span className="pb-1 text-sm text-muted">
                                        / {getDurationLabel(plan.duration_days)}
                                    </span>
                                </div>

                                <div className="mt-3 flex items-center gap-2 text-sm text-accent-foreground">
                                    <ShieldCheck className="h-4 w-4" />
                                    {formatTokens(plan.token_limit)} AI tokens
                                </div>
                            </div>

                            <div className="mt-6 flex-1 border-t border-border pt-5">
                                <p className="mb-4 text-sm font-medium text-foreground">Supported Features</p>

                                <div className="flex flex-wrap gap-2">
                                    {(plan.supported_features || []).map((feature) => (
                                        <span
                                            key={feature}
                                            className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                                        >
                                            {feature}
                                        </span>
                                    ))}
                                </div>

                                <p className="mb-4 mt-7 text-sm font-medium text-foreground">Included</p>

                                <ul className="space-y-3">
                                    {plan.features.map((feature) => (
                                        <li key={feature} className="flex gap-2 text-sm text-muted">
                                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <button
                                type="button"
                                disabled={!!buyingPlan || hasActiveSubscription}
                                onClick={() => handlePurchase(plan)}
                                className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isBuying && <Loader2 className="h-4 w-4 animate-spin" />}
                                {hasActiveSubscription
                                    ? "Active Subscription"
                                    : isBuying
                                        ? "Processing..."
                                        : "Get Started"}
                            </button>
                        </div>
                    );
                })}
            </div>

            <div className="mx-auto mt-8 max-w-3xl rounded-xl border border-border bg-surface-secondary p-4 text-center text-xs leading-5 text-muted">
                SOMATIC AI provides AI-assisted healthcare support and does not replace
                professional medical diagnosis or treatment. AI-generated consultation
                information is reviewed by doctors where applicable.
            </div>
        </div>
    );
}