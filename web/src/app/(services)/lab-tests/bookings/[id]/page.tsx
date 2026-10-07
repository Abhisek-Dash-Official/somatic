"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, CalendarDays, Check, Clock3, FlaskConical, Home, Loader2, MapPin, X } from "lucide-react";
import type { ILabBookingDocument } from "@/models/LabBooking";
import { toast } from "react-toastify";
import LabEHRDownloadButton from "@/components/lab-tests/LabEHRDownloadButton";

declare global {
    interface Window {
        Razorpay: any;
    }
}

const timeline = [
    { key: "booked", label: "Booking placed" },
    { key: "collection_scheduled", label: "Collection scheduled" },
    { key: "sample_collected", label: "Sample collected" },
    { key: "processing", label: "Processing" },
    { key: "report_ready", label: "Report ready" },
    { key: "completed", label: "Completed" },
];

export default function LabBookingDetailsPage() {
    const params = useParams();
    const id = String(params.id);

    const [booking, setBooking] = useState<ILabBookingDocument | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState("");
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);

    useEffect(() => {
        fetchBooking();
    }, [id]);

    async function fetchBooking() {
        try {
            const response = await fetch(`/api/lab-bookings/${id}`, { cache: "no-store" });
            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.error || "Booking not found.");
            }

            setBooking(result.data);
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to load booking.";
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    }

    async function payOnline() {
        if (!booking) return;

        try {
            setActionLoading(true);
            setError("");

            const response = await fetch(`/api/lab-bookings/${booking._id}/payment/order`, {
                method: "POST",
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.error || "Failed to start payment.");
            }

            if (!window.Razorpay) {
                throw new Error("Payment gateway is still loading. Please try again.");
            }

            const razorpay = new window.Razorpay({
                key: result.data.key_id,
                amount: result.data.amount,
                currency: result.data.currency,
                name: "SOMATIC",
                description: `Lab booking ${booking.booking_number}`,
                order_id: result.data.order_id,
                theme: { color: "#08a9b5" },
                handler: async (payment: {
                    razorpay_order_id: string;
                    razorpay_payment_id: string;
                    razorpay_signature: string;
                }) => {
                    try {
                        const verifyResponse = await fetch(`/api/lab-bookings/${booking._id}/payment/verify`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(payment),
                        });

                        const verifyResult = await verifyResponse.json();

                        if (!verifyResponse.ok || !verifyResult.success) {
                            throw new Error(verifyResult.error || "Payment verification failed.");
                        }

                        toast.success("Payment successful.");
                        await fetchBooking();
                    } catch (error) {
                        const message = error instanceof Error ? error.message : "Payment verification failed.";
                        setError(message);
                        toast.error(message);
                    } finally {
                        setActionLoading(false);
                    }
                },
                modal: {
                    ondismiss: () => setActionLoading(false),
                },
            });

            razorpay.open();
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to start payment.";
            setError(message);
            toast.error(message);
            setActionLoading(false);
        }
    }

    async function cancelBooking() {
        if (!booking) return;

        try {
            setActionLoading(true);
            setError("");

            const response = await fetch(`/api/lab-bookings/${booking._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "cancelled" }),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.error || "Failed to cancel booking.");
            }

            setBooking(result.data);
            setShowCancelConfirm(false);
            toast.success("Booking cancelled successfully.");
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to cancel booking.";
            setError(message);
            toast.error(message);
        } finally {
            setActionLoading(false);
        }
    }

    if (loading) {
        return (
            <main className="min-h-screen bg-background px-5 py-16 text-center text-sm text-muted">
                Loading booking...
            </main>
        );
    }

    if (error && !booking) {
        return (
            <main className="min-h-screen bg-background px-5 py-16 text-center text-sm text-danger">
                {error}
            </main>
        );
    }

    if (!booking) return null;

    const currentIndex = timeline.findIndex((item) => item.key === booking.status);

    return (
        <>
            <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />

            <main className="min-h-screen bg-background text-foreground">
                <div className="mx-auto max-w-6xl px-5 py-8 lg:px-8">
                    <Link
                        href="/lab-tests/bookings"
                        className="inline-flex items-center gap-2 rounded-xl px-2 py-1 text-sm text-muted transition-colors hover:bg-surface-secondary hover:text-primary"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        My bookings
                    </Link>

                    <div className="mt-8 flex flex-col gap-5 border-b border-border pb-6 md:flex-row md:items-end md:justify-between">
                        <div>
                            <p className="text-xs font-medium text-primary">{booking.booking_number}</p>
                            <h1 className="mt-2 text-2xl font-semibold">Lab booking</h1>
                            <p className="mt-2 text-sm text-muted">
                                {booking.tests.length} {booking.tests.length === 1 ? "test" : "tests"}
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {booking.results?.length > 0 && <LabEHRDownloadButton booking={booking} />}

                            {booking.payment_method === "online" &&
                                booking.payment_status !== "paid" &&
                                booking.status !== "cancelled" && (
                                    <button
                                        disabled={actionLoading}
                                        onClick={payOnline}
                                        className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-50"
                                    >
                                        {actionLoading ? "Processing..." : "Pay now"}
                                    </button>
                                )}

                            {["booked", "collection_scheduled"].includes(booking.status) &&
                                booking.payment_status !== "paid" && (
                                    <button
                                        disabled={actionLoading}
                                        onClick={() => setShowCancelConfirm(true)}
                                        className="rounded-xl border border-danger/40 px-4 py-2.5 text-sm text-danger transition-colors hover:bg-danger/10 disabled:opacity-50"
                                    >
                                        Cancel booking
                                    </button>
                                )}
                        </div>
                    </div>

                    {error && (
                        <div className="mt-5 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
                            {error}
                        </div>
                    )}

                    <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_320px]">
                        <div>
                            <section>
                                <h2 className="text-base font-semibold">Booking progress</h2>

                                <div className="mt-5 border-l border-border pl-6">
                                    {timeline.map((item, index) => {
                                        const active = index <= currentIndex && booking.status !== "cancelled";
                                        const current = item.key === booking.status;

                                        return (
                                            <div key={item.key} className="relative pb-7 last:pb-0">
                                                <span
                                                    className={`absolute -left-7.75 top-0 flex h-5 w-5 items-center justify-center rounded-full border ${active
                                                            ? "border-primary bg-primary text-primary-foreground"
                                                            : "border-border bg-background text-transparent"
                                                        }`}
                                                >
                                                    {active && <Check className="h-3 w-3" />}
                                                </span>

                                                <p
                                                    className={`text-sm ${current
                                                            ? "font-semibold text-primary"
                                                            : active
                                                                ? "text-foreground"
                                                                : "text-muted-foreground"
                                                        }`}
                                                >
                                                    {item.label}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>

                            {booking.status === "cancelled" && (
                                <section className="mt-8 rounded-2xl border border-danger/30 bg-danger/10 p-5">
                                    <div className="flex items-start gap-3">
                                        <X className="h-5 w-5 text-danger" />
                                        <div>
                                            <h2 className="text-sm font-semibold text-danger">Booking cancelled</h2>
                                            {booking.cancellation_reason && (
                                                <p className="mt-1 text-sm text-muted">{booking.cancellation_reason}</p>
                                            )}
                                        </div>
                                    </div>
                                </section>
                            )}

                            <section className="mt-10">
                                <h2 className="text-base font-semibold">Tests</h2>

                                <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-surface">
                                    {booking.tests.map((test) => (
                                        <div
                                            key={String(test.test_id)}
                                            className="flex items-center justify-between border-b border-border px-5 py-4 last:border-0"
                                        >
                                            <div>
                                                <p className="text-sm font-medium">{test.name}</p>
                                                <p className="mt-1 flex items-center gap-1.5 text-xs text-muted">
                                                    <FlaskConical className="h-3.5 w-3.5" />
                                                    {test.type}
                                                </p>
                                            </div>
                                            <p className="text-sm">₹{test.price.toLocaleString("en-IN")}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {booking.results?.length > 0 && (
                                <section className="mt-10">
                                    <div className="flex items-center justify-between gap-4">
                                        <h2 className="text-base font-semibold">Results</h2>
                                        <LabEHRDownloadButton booking={booking} />
                                    </div>

                                    {booking.results.map((result) => (
                                        <div
                                            key={String(result.test_id)}
                                            className="mt-5 overflow-hidden rounded-2xl border border-border bg-surface"
                                        >
                                            <div className="border-b border-border px-4 py-4">
                                                <h3 className="text-sm font-semibold">{result.test_name}</h3>
                                            </div>

                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left text-sm">
                                                    <thead>
                                                        <tr className="border-b border-border text-xs text-muted">
                                                            <th className="px-4 py-3 font-medium">Parameter</th>
                                                            <th className="px-4 py-3 font-medium">Value</th>
                                                            <th className="px-4 py-3 font-medium">Unit</th>
                                                            <th className="px-4 py-3 font-medium">Reference</th>
                                                            <th className="px-4 py-3 font-medium">Status</th>
                                                        </tr>
                                                    </thead>

                                                    <tbody>
                                                        {result.parameters.map((parameter, index) => (
                                                            <tr
                                                                key={`${parameter.name}-${index}`}
                                                                className="border-b border-border last:border-0"
                                                            >
                                                                <td className="px-4 py-3">{parameter.name}</td>
                                                                <td className="px-4 py-3">{parameter.value}</td>
                                                                <td className="px-4 py-3 text-muted">{parameter.unit}</td>
                                                                <td className="px-4 py-3 text-muted">{parameter.reference_range}</td>
                                                                <td
                                                                    className={`px-4 py-3 capitalize ${parameter.status === "normal"
                                                                            ? "text-success"
                                                                            : parameter.status === "critical"
                                                                                ? "text-danger"
                                                                                : "text-warning"
                                                                        }`}
                                                                >
                                                                    {parameter.status}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    ))}
                                </section>
                            )}
                        </div>

                        <aside className="h-fit space-y-5">
                            <section className="rounded-2xl border border-border bg-surface p-5">
                                <h2 className="text-sm font-semibold">Collection details</h2>

                                <div className="mt-4 space-y-4 text-sm">
                                    <div className="flex gap-3">
                                        <CalendarDays className="h-4 w-4 shrink-0 text-primary" />
                                        <div>
                                            <p>{new Date(booking.scheduled_date).toLocaleDateString("en-IN")}</p>
                                            <p className="mt-1 text-xs text-muted">{booking.scheduled_slot}</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <MapPin className="h-4 w-4 shrink-0 text-primary" />
                                        <div className="text-muted">
                                            <p className="text-foreground">{booking.collection_address.address_line}</p>
                                            <p>{booking.collection_address.city}, {booking.collection_address.state}</p>
                                            <p>{booking.collection_address.pincode}</p>
                                            {booking.collection_address.landmark && <p>{booking.collection_address.landmark}</p>}
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <Home className="h-4 w-4 shrink-0 text-primary" />
                                        <p className="text-muted">Home sample collection</p>
                                    </div>
                                </div>
                            </section>

                            <section className="rounded-2xl border border-border bg-surface p-5">
                                <h2 className="text-sm font-semibold">Payment</h2>

                                <div className="mt-4 space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted">Method</span>
                                        <span>{booking.payment_method === "online" ? "Online" : "Cash on collection"}</span>
                                    </div>

                                    <div className="flex justify-between">
                                        <span className="text-muted">Status</span>
                                        <span className={booking.payment_status === "paid" ? "text-success" : "text-warning"}>
                                            {booking.payment_status === "paid" ? "Paid" : "Pending"}
                                        </span>
                                    </div>

                                    <div className="flex justify-between border-t border-border pt-3 text-base font-semibold">
                                        <span>Total</span>
                                        <span>₹{booking.total_amount.toLocaleString("en-IN")}</span>
                                    </div>
                                </div>

                                {booking.payment_method === "cash_on_collection" && booking.payment_status !== "paid" && (
                                    <p className="mt-4 border-t border-border pt-4 text-xs leading-5 text-muted">
                                        Please keep the amount ready. Payment will be collected when the sample is collected at your home.
                                    </p>
                                )}

                                {booking.payment_method === "online" && booking.payment_status !== "paid" && (
                                    <button
                                        disabled={actionLoading}
                                        onClick={payOnline}
                                        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-50"
                                    >
                                        {actionLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                                        Pay ₹{booking.total_amount.toLocaleString("en-IN")}
                                    </button>
                                )}
                            </section>

                            {booking.status === "processing" && (
                                <div className="rounded-2xl border border-border bg-surface p-5">
                                    <div className="flex gap-3">
                                        <Clock3 className="h-5 w-5 text-primary" />
                                        <div>
                                            <p className="text-sm font-medium">Report processing</p>
                                            <p className="mt-1 text-xs leading-5 text-muted">
                                                Your sample is being processed. The report will appear here once ready.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </aside>
                    </div>
                </div>
            </main>

            {showCancelConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-5">
                    <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h2 className="text-lg font-semibold">Cancel booking?</h2>
                                <p className="mt-2 text-sm leading-6 text-muted">
                                    Are you sure you want to cancel this lab booking? This action cannot be undone.
                                </p>
                            </div>

                            <button
                                onClick={() => setShowCancelConfirm(false)}
                                disabled={actionLoading}
                                className="rounded-lg p-1 text-muted transition-colors hover:bg-surface-secondary hover:text-foreground"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => setShowCancelConfirm(false)}
                                disabled={actionLoading}
                                className="rounded-xl border border-border px-4 py-2.5 text-sm text-muted transition-colors hover:bg-surface-secondary hover:text-foreground disabled:opacity-50"
                            >
                                Keep booking
                            </button>

                            <button
                                onClick={cancelBooking}
                                disabled={actionLoading}
                                className="flex items-center gap-2 rounded-xl bg-danger px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                            >
                                {actionLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                                Cancel booking
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}