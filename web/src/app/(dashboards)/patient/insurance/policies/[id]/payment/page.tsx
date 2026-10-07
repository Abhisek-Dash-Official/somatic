"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
    ArrowLeft,
    CheckCircle2,
    CreditCard,
    Loader2,
    ShieldCheck,
} from "lucide-react";
import { toast } from "react-toastify";

declare global {
    interface Window {
        Razorpay: any;
    }
}

interface Policy {
    _id: string;
    policy_number?: string;
    status: string;
    start_date?: string;
    expiry_date?: string;
    next_payment_due_at?: string;
    last_payment_at?: string;
    premium_payments_completed?: number;
    plan_id?: {
        _id: string;
        name: string;
        coverage_amount: number;
        premium_amount: number;
        premium_frequency: string;
        policy_term_years: number;
    };
}

interface PaymentOrder {
    transaction_id: string;
    razorpay_order_id: string;
    amount: number;
    currency: string;
    key_id: string;
    plan_name: string;
    premium_frequency: string;
}

const formatDate = (date?: string) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const formatFrequency = (frequency?: string) => {
    if (!frequency) return "—";

    return frequency
        .replaceAll("_", " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

export default function InsurancePaymentPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const [policy, setPolicy] = useState<Policy | null>(null);
    const [loading, setLoading] = useState(true);
    const [paying, setPaying] = useState(false);
    const [scriptLoaded, setScriptLoaded] = useState(false);

    useEffect(() => {
        const loadPolicy = async () => {
            try {
                const { id } = await params;

                const response = await fetch(
                    `/api/insurance/policies/${id}`
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.error || "Failed to fetch insurance policy"
                    );
                }

                setPolicy(data.policy);
            } catch (error) {
                toast.error(
                    error instanceof Error
                        ? error.message
                        : "Failed to fetch insurance policy"
                );
            } finally {
                setLoading(false);
            }
        };

        loadPolicy();
    }, [params]);

    useEffect(() => {
        if (typeof window === "undefined") return;

        if (window.Razorpay) {
            setScriptLoaded(true);
            return;
        }

        const existingScript = document.querySelector(
            'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
        );

        if (existingScript) {
            existingScript.addEventListener("load", () =>
                setScriptLoaded(true)
            );
            return;
        }

        const script = document.createElement("script");

        script.src =
            "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;

        script.onload = () => setScriptLoaded(true);

        script.onerror = () => {
            setScriptLoaded(false);
            toast.error("Failed to load payment gateway");
        };

        document.body.appendChild(script);
    }, []);

    const isPaymentDue = (() => {
        if (!policy) return false;

        if (
            policy.status === "approved" ||
            policy.status === "payment_pending"
        ) {
            return true;
        }

        if (
            policy.status === "active" &&
            policy.next_payment_due_at
        ) {
            return new Date(policy.next_payment_due_at) <= new Date();
        }

        return false;
    })();

    const handlePayment = async () => {
        if (!policy) return;

        if (!scriptLoaded || !window.Razorpay) {
            toast.error("Payment gateway is not ready yet");
            return;
        }

        if (!isPaymentDue) {
            toast.error("Your premium payment is not currently due");
            return;
        }

        try {
            setPaying(true);

            const orderResponse = await fetch(
                `/api/insurance/policies/${policy._id}/payment`,
                {
                    method: "POST",
                }
            );

            const orderData = await orderResponse.json();

            if (!orderResponse.ok) {
                throw new Error(
                    orderData.error || "Failed to create payment order"
                );
            }

            const paymentOrder: PaymentOrder = orderData;

            const options = {
                key: paymentOrder.key_id,
                amount: paymentOrder.amount,
                currency: paymentOrder.currency,
                name: "SOMATIC",
                description: `${paymentOrder.plan_name} Insurance Premium`,
                order_id: paymentOrder.razorpay_order_id,

                handler: async (response: {
                    razorpay_order_id: string;
                    razorpay_payment_id: string;
                    razorpay_signature: string;
                }) => {
                    try {
                        const verifyResponse = await fetch(
                            `/api/insurance/policies/${policy._id}/payment/verify`,
                            {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                },
                                body: JSON.stringify({
                                    razorpay_order_id:
                                        response.razorpay_order_id,
                                    razorpay_payment_id:
                                        response.razorpay_payment_id,
                                    razorpay_signature:
                                        response.razorpay_signature,
                                }),
                            }
                        );

                        const verifyData =
                            await verifyResponse.json();

                        if (!verifyResponse.ok) {
                            throw new Error(
                                verifyData.error ||
                                "Payment verification failed"
                            );
                        }

                        toast.success(
                            policy.status === "active"
                                ? "Insurance premium payment successful."
                                : "Insurance policy activated successfully."
                        );

                        window.location.href = `/patient/insurance/policies/${policy._id}`;
                    } catch (error) {
                        toast.error(
                            error instanceof Error
                                ? error.message
                                : "Payment verification failed"
                        );

                        setPaying(false);
                    }
                },

                modal: {
                    ondismiss: () => {
                        setPaying(false);
                        toast.warn("Payment was cancelled");
                    },
                },

                theme: {
                    color: "#08a9b5",
                },
            };

            const razorpay = new window.Razorpay(options);

            razorpay.on("payment.failed", (response: any) => {
                setPaying(false);

                toast.error(
                    response?.error?.description || "Payment failed"
                );
            });

            razorpay.open();
        } catch (error) {
            setPaying(false);

            toast.error(
                error instanceof Error
                    ? error.message
                    : "Failed to start payment"
            );
        }
    };

    if (loading) {
        return (
            <main className="flex min-h-[70vh] items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </main>
        );
    }

    if (!policy) {
        return (
            <main className="flex min-h-[70vh] items-center justify-center bg-background px-4">
                <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-8 text-center shadow-sm">
                    <ShieldCheck className="mx-auto h-12 w-12 text-muted" />

                    <h1 className="mt-4 text-xl font-bold text-foreground">
                        Insurance policy not found
                    </h1>

                    <p className="mt-2 text-sm text-muted">
                        We could not find the requested policy.
                    </p>
                </div>
            </main>
        );
    }

    const premium = Number(
        policy.plan_id?.premium_amount || 0
    );

    const paymentCount = Number(
        policy.premium_payments_completed || 0
    );

    const isRenewal =
        policy.status === "active" && paymentCount > 0;

    if (
        policy.status === "active" &&
        !policy.next_payment_due_at
    ) {
        return (
            <main className="flex min-h-[70vh] items-center justify-center bg-background px-4">
                <div className="w-full max-w-xl rounded-2xl border border-border bg-surface p-8 text-center shadow-sm">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-success/10 text-success">
                        <CheckCircle2 size={28} />
                    </div>

                    <h1 className="mt-5 text-xl font-bold text-foreground">
                        Premium Payments Completed
                    </h1>

                    <p className="mt-2 text-sm leading-6 text-muted">
                        All scheduled premium payments for this policy have
                        been completed.
                    </p>

                    <Link
                        href={`/patient/insurance/policies/${policy._id}`}
                        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary-hover"
                    >
                        View Policy
                    </Link>
                </div>
            </main>
        );
    }

    if (
        policy.status === "active" &&
        policy.next_payment_due_at &&
        !isPaymentDue
    ) {
        return (
            <main className="flex min-h-[70vh] items-center justify-center bg-background px-4">
                <div className="w-full max-w-xl rounded-2xl border border-border bg-surface p-8 text-center shadow-sm">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-success/10 text-success">
                        <CheckCircle2 size={28} />
                    </div>

                    <h1 className="mt-5 text-xl font-bold text-foreground">
                        Premium Payment Not Due Yet
                    </h1>

                    <p className="mt-2 text-sm leading-6 text-muted">
                        Your next premium payment is due on{" "}
                        <span className="font-medium text-foreground">
                            {formatDate(policy.next_payment_due_at)}
                        </span>
                        .
                    </p>

                    <Link
                        href={`/patient/insurance/policies/${policy._id}`}
                        className="mt-6 inline-flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-muted transition hover:border-primary/40 hover:bg-accent hover:text-foreground"
                    >
                        View Policy
                    </Link>
                </div>
            </main>
        );
    }

    if (!isPaymentDue) {
        return (
            <main className="flex min-h-[70vh] items-center justify-center bg-background px-4">
                <div className="w-full max-w-xl rounded-2xl border border-border bg-surface p-8 text-center shadow-sm">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-primary">
                        <ShieldCheck size={28} />
                    </div>

                    <h1 className="mt-5 text-xl font-bold text-foreground">
                        Payment Not Available
                    </h1>

                    <p className="mt-2 text-sm leading-6 text-muted">
                        This insurance policy is not currently ready for
                        payment.
                    </p>

                    <Link
                        href={`/patient/insurance/policies/${policy._id}`}
                        className="mt-6 inline-flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-muted transition hover:border-primary/40 hover:bg-accent hover:text-foreground"
                    >
                        View Policy
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-background px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl">
                <div className="flex items-center gap-3">
                    <Link
                        href={`/patient/insurance/policies/${policy._id}`}
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-muted transition hover:bg-accent hover:text-foreground"
                    >
                        <ArrowLeft size={17} />
                    </Link>

                    <div>
                        <h1 className="text-2xl font-bold text-foreground">
                            {isRenewal
                                ? "Insurance Premium Renewal"
                                : "Insurance Premium Payment"}
                        </h1>

                        <p className="mt-1 text-sm text-muted">
                            {isRenewal
                                ? "Complete your scheduled premium payment to continue your insurance coverage."
                                : "Complete your first premium payment to activate your insurance policy."}
                        </p>
                    </div>
                </div>

                <div className="mx-auto mt-6 grid max-w-5xl gap-6 lg:grid-cols-3">
                    <section className="space-y-6 lg:col-span-2">
                        <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
                            <div className="flex items-start gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent text-primary">
                                    <ShieldCheck size={24} />
                                </div>

                                <div>
                                    <h2 className="text-lg font-semibold text-foreground">
                                        {policy.plan_id?.name ||
                                            "Insurance Plan"}
                                    </h2>

                                    <p className="mt-1 text-sm text-muted">
                                        Policy ID: {policy._id}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 grid gap-3 sm:grid-cols-2">
                                <div className="rounded-2xl border border-border bg-surface-secondary p-4">
                                    <p className="text-xs text-muted">
                                        Coverage Amount
                                    </p>

                                    <p className="mt-1 text-lg font-semibold text-foreground">
                                        ₹
                                        {Number(
                                            policy.plan_id?.coverage_amount ||
                                            0
                                        ).toLocaleString("en-IN")}
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-border bg-surface-secondary p-4">
                                    <p className="text-xs text-muted">
                                        Policy Term
                                    </p>

                                    <p className="mt-1 text-lg font-semibold text-foreground">
                                        {policy.plan_id?.policy_term_years ||
                                            0}{" "}
                                        year
                                        {policy.plan_id?.policy_term_years !==
                                            1
                                            ? "s"
                                            : ""}
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-border bg-surface-secondary p-4">
                                    <p className="text-xs text-muted">
                                        Premium Frequency
                                    </p>

                                    <p className="mt-1 text-lg font-semibold text-foreground">
                                        {formatFrequency(
                                            policy.plan_id
                                                ?.premium_frequency
                                        )}
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-border bg-surface-secondary p-4">
                                    <p className="text-xs text-muted">
                                        Premium Payment
                                    </p>

                                    <p className="mt-1 text-lg font-semibold text-foreground">
                                        ₹{premium.toLocaleString("en-IN")}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {isRenewal &&
                            policy.next_payment_due_at && (
                                <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
                                    <h2 className="font-semibold text-foreground">
                                        Premium Due
                                    </h2>

                                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                        <div className="rounded-2xl border border-border bg-surface-secondary p-4">
                                            <p className="text-xs text-muted">
                                                Previous Payment
                                            </p>

                                            <p className="mt-1 font-semibold text-foreground">
                                                {formatDate(
                                                    policy.last_payment_at
                                                )}
                                            </p>
                                        </div>

                                        <div className="rounded-2xl border border-border bg-surface-secondary p-4">
                                            <p className="text-xs text-muted">
                                                Payment Due
                                            </p>

                                            <p className="mt-1 font-semibold text-foreground">
                                                {formatDate(
                                                    policy.next_payment_due_at
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                        <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
                            <h2 className="font-semibold text-foreground">
                                Secure Payment
                            </h2>

                            <div className="mt-4 flex items-start gap-3 rounded-2xl border border-border bg-surface-secondary p-4">
                                <CreditCard className="mt-0.5 h-5 w-5 text-primary" />

                                <div>
                                    <p className="text-sm text-foreground">
                                        Payment powered by Razorpay
                                    </p>

                                    <p className="mt-1 text-xs leading-5 text-muted">
                                        Complete your premium payment through
                                        the secure Razorpay checkout.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <aside className="h-fit rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6 lg:sticky lg:top-6">
                        <h2 className="font-semibold text-foreground">
                            Payment Summary
                        </h2>

                        <div className="mt-5 space-y-4 text-sm">
                            <div className="flex justify-between gap-4">
                                <span className="text-muted">Plan</span>

                                <span className="text-right text-foreground">
                                    {policy.plan_id?.name || "Insurance"}
                                </span>
                            </div>

                            <div className="flex justify-between gap-4">
                                <span className="text-muted">
                                    Frequency
                                </span>

                                <span className="text-foreground">
                                    {formatFrequency(
                                        policy.plan_id?.premium_frequency
                                    )}
                                </span>
                            </div>

                            <div className="flex justify-between gap-4">
                                <span className="text-muted">Premium</span>

                                <span className="font-medium text-foreground">
                                    ₹{premium.toLocaleString("en-IN")}
                                </span>
                            </div>

                            <div className="border-t border-border pt-4">
                                <div className="flex items-end justify-between gap-4">
                                    <span className="text-muted">
                                        Amount Due
                                    </span>

                                    <span className="text-2xl font-bold text-foreground">
                                        ₹{premium.toLocaleString("en-IN")}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <button
                            type="button"
                            disabled={paying || !scriptLoaded}
                            onClick={handlePayment}
                            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {paying ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <CreditCard className="h-4 w-4" />
                            )}

                            {paying
                                ? "Processing..."
                                : !scriptLoaded
                                    ? "Loading Payment..."
                                    : `Pay ₹${premium.toLocaleString("en-IN")}`}
                        </button>

                        <p className="mt-3 text-center text-xs leading-5 text-muted">
                            Payment is confirmed only after successful
                            Razorpay verification.
                        </p>
                    </aside>
                </div>
            </div>
        </main>
    );
}