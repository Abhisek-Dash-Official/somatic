"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, CreditCard, Loader2, ShieldCheck } from "lucide-react";
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
}

export default function InsurancePaymentPage({ params }: { params: Promise<{ id: string }> }) {
    const [policy, setPolicy] = useState<Policy | null>(null);
    const [loading, setLoading] = useState(true);
    const [paying, setPaying] = useState(false);
    const [scriptLoaded, setScriptLoaded] = useState(false);

    useEffect(() => {
        const loadPolicy = async () => {
            try {
                const { id } = await params;

                const res = await fetch(`/api/insurance/policies/${id}`);
                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.error || "Failed to fetch insurance policy");
                }

                setPolicy(data.policy);
            } catch (error) {
                toast.error(error instanceof Error ? error.message : "Failed to fetch insurance policy");
            } finally {
                setLoading(false);
            }
        };

        loadPolicy();
    }, [params]);

    useEffect(() => {
        if (typeof window === "undefined" || window.Razorpay) {
            setScriptLoaded(true);
            return;
        }

        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        script.onload = () => setScriptLoaded(true);
        script.onerror = () => {
            toast.error("Failed to load payment gateway");
            setScriptLoaded(false);
        };

        document.body.appendChild(script);

        return () => {
            script.remove();
        };
    }, []);

    const handlePayment = async () => {
        if (!policy) return;

        if (!scriptLoaded || !window.Razorpay) {
            toast.error("Payment gateway is not ready yet");
            return;
        }

        if (policy.status !== "approved" && policy.status !== "payment_pending") {
            toast.error("This policy is not ready for payment");
            return;
        }

        try {
            setPaying(true);

            const orderRes = await fetch(`/api/insurance/policies/${policy._id}/payment`, {
                method: "POST",
            });

            const orderData = await orderRes.json();

            if (!orderRes.ok) {
                throw new Error(orderData.error || "Failed to create payment order");
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
                        const verifyRes = await fetch(`/api/insurance/policies/${policy._id}/payment/verify`, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                            }),
                        });

                        const verifyData = await verifyRes.json();

                        if (!verifyRes.ok) {
                            throw new Error(verifyData.error || "Payment verification failed");
                        }

                        toast.success("Payment successful. Your insurance policy is now active.");

                        window.location.href = `/patient/insurance/policies/${policy._id}`;
                    } catch (error) {
                        toast.error(error instanceof Error ? error.message : "Payment verification failed");
                    } finally {
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
                    color: "#9333ea",
                },
            };

            const razorpay = new window.Razorpay(options);

            razorpay.on("payment.failed", (response: any) => {
                setPaying(false);
                toast.error(response?.error?.description || "Payment failed");
            });

            razorpay.open();
        } catch (error) {
            setPaying(false);
            toast.error(error instanceof Error ? error.message : "Failed to start payment");
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
            </div>
        );
    }

    if (!policy) {
        return (
            <div className="p-6">
                <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-8 text-center text-zinc-400">
                    Insurance policy not found.
                </div>
            </div>
        );
    }

    if (policy.status === "active") {
        return (
            <div className="min-h-[60vh] p-4 md:p-6">
                <div className="mx-auto max-w-xl rounded-xl border border-zinc-800 bg-zinc-950 p-8 text-center">
                    <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400" />
                    <h1 className="mt-4 text-xl font-bold text-white">Policy Already Active</h1>
                    <p className="mt-2 text-sm text-zinc-400">
                        This insurance policy has already been activated successfully.
                    </p>

                    <Link href={`/patient/insurance/policies/${policy._id}`} className="mt-6 inline-flex items-center gap-2 rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-purple-500">
                        View Policy
                    </Link>
                </div>
            </div>
        );
    }

    if (policy.status !== "approved" && policy.status !== "payment_pending") {
        return (
            <div className="min-h-[60vh] p-4 md:p-6">
                <div className="mx-auto max-w-xl rounded-xl border border-zinc-800 bg-zinc-950 p-8 text-center">
                    <ShieldCheck className="mx-auto h-12 w-12 text-zinc-600" />
                    <h1 className="mt-4 text-xl font-bold text-white">Payment Not Available</h1>
                    <p className="mt-2 text-sm text-zinc-400">
                        This insurance policy is not currently ready for payment.
                    </p>

                    <Link href={`/patient/insurance/policies/${policy._id}`} className="mt-6 inline-flex items-center gap-2 rounded-lg border border-zinc-700 px-5 py-2.5 text-sm font-medium text-zinc-200 transition hover:border-zinc-600 hover:bg-zinc-900">
                        View Policy
                    </Link>
                </div>
            </div>
        );
    }

    const premium = Number(policy.plan_id?.premium_amount || 0);

    return (
        <div className="min-h-screen space-y-6 p-4 md:p-6">
            <div className="flex items-center gap-3">
                <Link href={`/patient/insurance/policies/${policy._id}`} className="rounded-lg border border-zinc-800 p-2 text-zinc-400 transition hover:border-zinc-700 hover:text-white">
                    <ArrowLeft className="h-4 w-4" />
                </Link>

                <div>
                    <h1 className="text-2xl font-bold text-white">Insurance Premium Payment</h1>
                    <p className="mt-1 text-sm text-zinc-400">Complete your premium payment to activate the policy.</p>
                </div>
            </div>

            <div className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-3">
                <section className="space-y-6 lg:col-span-2">
                    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">
                        <div className="flex items-start gap-4">
                            <div className="rounded-lg bg-purple-500/10 p-3">
                                <ShieldCheck className="h-6 w-6 text-purple-400" />
                            </div>

                            <div>
                                <h2 className="text-lg font-semibold text-white">{policy.plan_id?.name || "Insurance Plan"}</h2>
                                <p className="mt-1 text-sm text-zinc-500">
                                    Policy ID: {policy._id}
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 grid gap-3 sm:grid-cols-2">
                            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
                                <p className="text-xs text-zinc-500">Coverage Amount</p>
                                <p className="mt-1 text-lg font-semibold text-white">
                                    ₹{Number(policy.plan_id?.coverage_amount || 0).toLocaleString("en-IN")}
                                </p>
                            </div>

                            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
                                <p className="text-xs text-zinc-500">Policy Term</p>
                                <p className="mt-1 text-lg font-semibold text-white">
                                    {policy.plan_id?.policy_term_years || 0} year{policy.plan_id?.policy_term_years !== 1 ? "s" : ""}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">
                        <h2 className="font-semibold text-white">Secure Payment</h2>

                        <div className="mt-4 flex items-start gap-3 rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
                            <CreditCard className="mt-0.5 h-5 w-5 text-purple-400" />
                            <div>
                                <p className="text-sm text-zinc-200">Payment powered by Razorpay</p>
                                <p className="mt-1 text-xs leading-5 text-zinc-500">
                                    You will be redirected to the secure Razorpay checkout window to complete your payment.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <aside className="h-fit rounded-xl border border-zinc-800 bg-zinc-950 p-6 lg:sticky lg:top-6">
                    <h2 className="font-semibold text-white">Payment Summary</h2>

                    <div className="mt-5 space-y-3 text-sm">
                        <div className="flex justify-between gap-4">
                            <span className="text-zinc-500">Plan</span>
                            <span className="text-right text-zinc-200">{policy.plan_id?.name || "Insurance"}</span>
                        </div>

                        <div className="flex justify-between gap-4">
                            <span className="text-zinc-500">Frequency</span>
                            <span className="capitalize text-zinc-200">
                                {policy.plan_id?.premium_frequency?.replaceAll("_", " ") || "—"}
                            </span>
                        </div>

                        <div className="border-t border-zinc-800 pt-4">
                            <div className="flex items-end justify-between gap-4">
                                <span className="text-zinc-400">Premium</span>
                                <span className="text-2xl font-bold text-white">
                                    ₹{premium.toLocaleString("en-IN")}
                                </span>
                            </div>
                        </div>
                    </div>

                    <button
                        type="button"
                        disabled={paying || !scriptLoaded}
                        onClick={handlePayment}
                        className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {paying ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                        {paying ? "Processing..." : !scriptLoaded ? "Loading Payment..." : `Pay ₹${premium.toLocaleString("en-IN")}`}
                    </button>

                    <p className="mt-3 text-center text-xs leading-5 text-zinc-600">
                        Your policy becomes active only after successful payment verification.
                    </p>
                </aside>
            </div>
        </div>
    );
}