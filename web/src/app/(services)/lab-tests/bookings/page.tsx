"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarDays, ChevronRight, FlaskConical, Home, MapPin } from "lucide-react";
import type { ILabBookingDocument } from "@/models/LabBooking";

const statuses = [
    { value: "", label: "All" },
    { value: "booked", label: "Booked" },
    { value: "collection_scheduled", label: "Scheduled" },
    { value: "sample_collected", label: "Collected" },
    { value: "processing", label: "Processing" },
    { value: "report_ready", label: "Report ready" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
];

export default function LabBookingsPage() {
    const [bookings, setBookings] = useState<ILabBookingDocument[]>([]);
    const [status, setStatus] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchBookings() {
            try {
                setLoading(true);

                const params = new URLSearchParams({ limit: "20" });
                if (status) params.set("status", status);

                const response = await fetch(`/api/lab-bookings?${params.toString()}`, { cache: "no-store" });
                const result = await response.json();

                if (!response.ok || !result.success) throw new Error(result.error || "Failed to load bookings.");

                setBookings(result.data);
            } catch (error) {
                setError(error instanceof Error ? error.message : "Failed to load bookings.");
            } finally {
                setLoading(false);
            }
        }

        fetchBookings();
    }, [status]);

    return (
        <main className="min-h-screen bg-background text-foreground">
            <div className="mx-auto max-w-6xl px-5 py-8 lg:px-8">
                <div className="border-b border-border pb-6">
                    <p className="text-sm font-medium text-primary">Laboratory Services</p>
                    <h1 className="mt-2 text-2xl font-semibold">My lab bookings</h1>
                    <p className="mt-2 text-sm text-muted">Track your sample collection and reports.</p>
                </div>

                <div className="mt-5 flex gap-1 overflow-x-auto border-b border-border">
                    {statuses.map((item) => (
                        <button
                            key={item.value}
                            onClick={() => setStatus(item.value)}
                            className={`shrink-0 border-b-2 px-4 py-3 text-sm transition-colors ${status === item.value
                                    ? "border-primary text-primary"
                                    : "border-transparent text-muted hover:text-foreground"
                                }`}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>

                {error && (
                    <div className="mt-5 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="py-16 text-center text-sm text-muted">Loading bookings...</div>
                ) : bookings.length === 0 ? (
                    <div className="mt-5 rounded-2xl border border-border bg-surface p-12 text-center">
                        <FlaskConical className="mx-auto h-8 w-8 text-muted-foreground" />
                        <p className="mt-4 text-sm text-muted">No lab bookings found.</p>
                        <Link
                            href="/lab-tests"
                            className="mt-4 inline-flex rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
                        >
                            Browse lab tests
                        </Link>
                    </div>
                ) : (
                    <div className="mt-5 space-y-3">
                        {bookings.map((booking) => (
                            <Link
                                key={String(booking._id)}
                                href={`/lab-tests/bookings/${booking._id}`}
                                className="group block rounded-2xl border border-border bg-surface p-5 transition-colors hover:bg-surface-secondary/50"
                            >
                                <div className="grid gap-5 md:grid-cols-[1fr_220px_160px] md:items-center">
                                    <div>
                                        <p className="text-xs font-medium text-primary">{booking.booking_number}</p>
                                        <h2 className="mt-2 text-base font-semibold">
                                            {booking.tests.length} {booking.tests.length === 1 ? "test" : "tests"}
                                        </h2>
                                        <p className="mt-1 text-sm text-muted">
                                            {booking.tests.map((test) => test.name).join(", ")}
                                        </p>
                                    </div>

                                    <div className="space-y-2 text-xs text-muted">
                                        <p className="flex items-center gap-2">
                                            <CalendarDays className="h-4 w-4 text-primary" />
                                            {new Date(booking.scheduled_date).toLocaleDateString("en-IN")}
                                        </p>
                                        <p className="flex items-center gap-2">
                                            <Home className="h-4 w-4 text-primary" />
                                            {booking.scheduled_slot}
                                        </p>
                                        <p className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-primary" />
                                            {booking.collection_address.city}
                                        </p>
                                    </div>

                                    <div className="md:text-right">
                                        <p className="text-base font-semibold">₹{booking.total_amount.toLocaleString("en-IN")}</p>
                                        <p className={`mt-1 text-xs ${booking.payment_status === "paid" ? "text-success" : "text-warning"}`}>
                                            {booking.payment_status === "paid" ? "Paid" : "Payment pending"}
                                        </p>
                                        <p className="mt-2 text-xs text-muted transition-colors group-hover:text-primary">
                                            {booking.status.replaceAll("_", " ")}{" "}
                                            <ChevronRight className="inline h-3.5 w-3.5" />
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}