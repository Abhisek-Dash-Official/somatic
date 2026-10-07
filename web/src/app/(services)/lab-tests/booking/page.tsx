"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, CalendarDays, Check, Home, Loader2, MapPin } from "lucide-react";
import type { ILabTestDocument } from "@/models/LabTest";

declare global {
    interface Window {
        Razorpay: any;
    }
}

type PaymentMethod = "online" | "cash_on_collection";

export default function LabBookingPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const selectedIds = searchParams.get("tests")?.split(",").filter(Boolean) || [];

    const [tests, setTests] = useState<ILabTestDocument[]>([]);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("online");
    const [address, setAddress] = useState({
        address_line: "",
        city: "",
        state: "",
        pincode: "",
        landmark: "",
    });
    const [scheduledDate, setScheduledDate] = useState("");
    const [scheduledSlot, setScheduledSlot] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadTests() {
            try {
                if (!selectedIds.length) {
                    router.replace("/lab-tests");
                    return;
                }

                const results = await Promise.all(
                    selectedIds.map(async (id) => {
                        const response = await fetch(`/api/lab-tests/${id}`, { cache: "no-store" });
                        const result = await response.json();

                        if (!response.ok || !result.success) {
                            throw new Error(result.error || "Failed to load test.");
                        }

                        return result.data as ILabTestDocument;
                    }),
                );

                setTests(results);
            } catch (error) {
                setError(error instanceof Error ? error.message : "Failed to load selected tests.");
            } finally {
                setLoading(false);
            }
        }

        loadTests();
    }, [router, selectedIds.join(",")]);

    const subtotal = tests.reduce((sum, test) => sum + test.price, 0);
    const collectionFee = 0;
    const discount = 0;
    const total = subtotal + collectionFee - discount;

    async function submitBooking() {
        try {
            setSubmitting(true);
            setError("");

            if (
                !address.address_line ||
                !address.city ||
                !address.state ||
                !address.pincode ||
                !scheduledDate ||
                !scheduledSlot
            ) {
                throw new Error("Please complete the collection address, date and time slot.");
            }

            const bookingData = {
                tests: tests.map((test) => ({ test_id: test._id })),
                collection_address: address,
                scheduled_date: scheduledDate,
                scheduled_slot: scheduledSlot,
            };

            if (paymentMethod === "cash_on_collection") {
                const response = await fetch("/api/lab-bookings", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        ...bookingData,
                        payment_method: "cash_on_collection",
                    }),
                });

                const result = await response.json();

                if (!response.ok || !result.success) {
                    throw new Error(result.error || "Failed to create booking.");
                }

                router.push(`/lab-tests/bookings/${result.data.booking._id}`);
                return;
            }

            const orderResponse = await fetch("/api/lab-bookings/payment/order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(bookingData),
            });

            const orderResult = await orderResponse.json();

            if (!orderResponse.ok || !orderResult.success) {
                throw new Error(orderResult.error || "Failed to start payment.");
            }

            if (!window.Razorpay) {
                throw new Error("Payment gateway is still loading. Please try again.");
            }

            const options = {
                key: orderResult.data.key_id,
                amount: orderResult.data.amount,
                currency: orderResult.data.currency,
                name: "SOMATIC",
                description: "Lab test booking",
                order_id: orderResult.data.order_id,
                theme: {
                    color: "#08a9b5",
                },
                handler: async (payment: {
                    razorpay_order_id: string;
                    razorpay_payment_id: string;
                    razorpay_signature: string;
                }) => {
                    try {
                        const verifyResponse = await fetch("/api/lab-bookings/payment/verify", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                ...payment,
                                ...bookingData,
                            }),
                        });

                        const verifyResult = await verifyResponse.json();

                        if (!verifyResponse.ok || !verifyResult.success) {
                            setError(verifyResult.error || "Payment verification failed.");
                            return;
                        }

                        router.push(`/lab-tests/bookings/${verifyResult.data.booking._id}`);
                    } catch (error) {
                        setError(error instanceof Error ? error.message : "Payment verification failed.");
                    } finally {
                        setSubmitting(false);
                    }
                },
                modal: {
                    ondismiss: () => setSubmitting(false),
                },
            };

            const razorpay = new window.Razorpay(options);
            razorpay.open();
        } catch (error) {
            setError(error instanceof Error ? error.message : "Something went wrong.");
            setSubmitting(false);
        }
    }

    if (loading) {
        return (
            <main className="min-h-screen bg-background px-5 py-16 text-center text-sm text-muted">
                Loading booking...
            </main>
        );
    }

    return (
        <>
            <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />

            <main className="min-h-screen bg-background text-foreground">
                <div className="mx-auto max-w-6xl px-5 py-8 lg:px-8">
                    <button
                        onClick={() => router.back()}
                        className="inline-flex items-center gap-2 rounded-xl px-2 py-1 text-sm text-muted transition-colors hover:bg-surface-secondary hover:text-primary"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </button>

                    <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_330px]">
                        <div>
                            <div className="border-b border-border pb-6">
                                <p className="text-sm font-medium text-primary">Lab booking</p>
                                <h1 className="mt-2 text-2xl font-semibold">Schedule home collection</h1>
                                <p className="mt-2 text-sm text-muted">
                                    Enter your collection details and choose how you want to pay.
                                </p>
                            </div>

                            {error && (
                                <div className="mt-5 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
                                    {error}
                                </div>
                            )}

                            <section className="mt-8">
                                <h2 className="text-base font-semibold">Selected tests</h2>

                                <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-surface">
                                    {tests.map((test) => (
                                        <div
                                            key={String(test._id)}
                                            className="flex items-center justify-between border-b border-border px-5 py-4 last:border-0"
                                        >
                                            <div>
                                                <p className="text-sm font-medium">{test.name}</p>
                                                <p className="mt-1 text-xs text-muted">{test.category}</p>
                                            </div>
                                            <p className="text-sm font-medium">₹{test.price.toLocaleString("en-IN")}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section className="mt-8">
                                <h2 className="text-base font-semibold">Collection address</h2>

                                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                    <input
                                        value={address.address_line}
                                        onChange={(e) => setAddress({ ...address, address_line: e.target.value })}
                                        placeholder="Address"
                                        className="h-11 rounded-xl border border-border bg-surface px-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 sm:col-span-2"
                                    />
                                    <input
                                        value={address.city}
                                        onChange={(e) => setAddress({ ...address, city: e.target.value })}
                                        placeholder="City"
                                        className="h-11 rounded-xl border border-border bg-surface px-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    />
                                    <input
                                        value={address.state}
                                        onChange={(e) => setAddress({ ...address, state: e.target.value })}
                                        placeholder="State"
                                        className="h-11 rounded-xl border border-border bg-surface px-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    />
                                    <input
                                        value={address.pincode}
                                        onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                                        placeholder="Pincode"
                                        className="h-11 rounded-xl border border-border bg-surface px-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    />
                                    <input
                                        value={address.landmark}
                                        onChange={(e) => setAddress({ ...address, landmark: e.target.value })}
                                        placeholder="Landmark (optional)"
                                        className="h-11 rounded-xl border border-border bg-surface px-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                            </section>

                            <section className="mt-8">
                                <h2 className="text-base font-semibold">Collection schedule</h2>

                                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                    <label className="rounded-xl border border-border bg-surface p-3">
                                        <span className="mb-2 flex items-center gap-2 text-xs text-muted">
                                            <CalendarDays className="h-4 w-4" />
                                            Date
                                        </span>
                                        <input
                                            type="date"
                                            value={scheduledDate}
                                            min={new Date().toISOString().split("T")[0]}
                                            onChange={(e) => setScheduledDate(e.target.value)}
                                            className="w-full bg-transparent text-sm outline-none"
                                        />
                                    </label>

                                    <label className="rounded-xl border border-border bg-surface p-3">
                                        <span className="mb-2 block text-xs text-muted">Time slot</span>
                                        <select
                                            value={scheduledSlot}
                                            onChange={(e) => setScheduledSlot(e.target.value)}
                                            className="w-full bg-transparent text-sm outline-none"
                                        >
                                            <option value="">Select slot</option>
                                            <option value="08:00 AM - 10:00 AM">08:00 AM - 10:00 AM</option>
                                            <option value="10:00 AM - 12:00 PM">10:00 AM - 12:00 PM</option>
                                            <option value="12:00 PM - 02:00 PM">12:00 PM - 02:00 PM</option>
                                            <option value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM</option>
                                            <option value="04:00 PM - 06:00 PM">04:00 PM - 06:00 PM</option>
                                        </select>
                                    </label>
                                </div>
                            </section>

                            <section className="mt-8">
                                <h2 className="text-base font-semibold">Payment method</h2>

                                <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-surface">
                                    <button
                                        onClick={() => setPaymentMethod("online")}
                                        className={`flex w-full items-start gap-4 border-b border-border px-5 py-5 text-left transition-colors ${paymentMethod === "online"
                                                ? "bg-surface-secondary/50 text-foreground"
                                                : "text-muted hover:bg-surface-secondary/30"
                                            }`}
                                    >
                                        <span
                                            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${paymentMethod === "online"
                                                    ? "border-primary bg-primary text-primary-foreground"
                                                    : "border-border"
                                                }`}
                                        >
                                            {paymentMethod === "online" && <Check className="h-3.5 w-3.5" />}
                                        </span>
                                        <span>
                                            <span className="block text-sm font-medium">Pay online</span>
                                            <span className="mt-1 block text-xs text-muted">Pay securely using Razorpay.</span>
                                        </span>
                                    </button>

                                    <button
                                        onClick={() => setPaymentMethod("cash_on_collection")}
                                        className={`flex w-full items-start gap-4 px-5 py-5 text-left transition-colors ${paymentMethod === "cash_on_collection"
                                                ? "bg-surface-secondary/50 text-foreground"
                                                : "text-muted hover:bg-surface-secondary/30"
                                            }`}
                                    >
                                        <span
                                            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${paymentMethod === "cash_on_collection"
                                                    ? "border-primary bg-primary text-primary-foreground"
                                                    : "border-border"
                                                }`}
                                        >
                                            {paymentMethod === "cash_on_collection" && <Check className="h-3.5 w-3.5" />}
                                        </span>
                                        <span>
                                            <span className="block text-sm font-medium">Cash on home collection</span>
                                            <span className="mt-1 block text-xs text-muted">
                                                Pay the collection representative when the sample is collected.
                                            </span>
                                        </span>
                                    </button>
                                </div>
                            </section>
                        </div>

                        <aside className="h-fit rounded-2xl border border-border bg-surface p-6">
                            <h2 className="font-semibold">Booking summary</h2>

                            <div className="mt-5 border-t border-border pt-4 text-sm">
                                <div className="flex justify-between py-2 text-muted">
                                    <span>Subtotal</span>
                                    <span>₹{subtotal.toLocaleString("en-IN")}</span>
                                </div>

                                <div className="flex justify-between py-2 text-muted">
                                    <span>Home collection</span>
                                    <span>{collectionFee ? `₹${collectionFee}` : "Free"}</span>
                                </div>

                                {discount > 0 && (
                                    <div className="flex justify-between py-2 text-success">
                                        <span>Discount</span>
                                        <span>-₹{discount.toLocaleString("en-IN")}</span>
                                    </div>
                                )}

                                <div className="mt-3 flex justify-between border-t border-border pt-4 text-base font-semibold">
                                    <span>Total</span>
                                    <span>₹{total.toLocaleString("en-IN")}</span>
                                </div>
                            </div>

                            <div className="mt-5 border-t border-border pt-4 text-xs text-muted">
                                <div className="flex gap-2">
                                    <MapPin className="h-4 w-4 shrink-0 text-primary" />
                                    Home sample collection at your selected address.
                                </div>

                                <div className="mt-3 flex gap-2">
                                    <Home className="h-4 w-4 shrink-0 text-primary" />
                                    {paymentMethod === "online"
                                        ? "Payment is completed before booking confirmation."
                                        : "Payment is collected when the sample is collected."}
                                </div>
                            </div>

                            <button
                                disabled={submitting}
                                onClick={submitBooking}
                                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-50"
                            >
                                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                                {paymentMethod === "online" ? "Continue to payment" : "Confirm booking"}
                            </button>
                        </aside>
                    </div>
                </div>
            </main>
        </>
    );
}