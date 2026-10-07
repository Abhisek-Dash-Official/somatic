"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    CalendarDays,
    ChevronRight,
    Clock3,
    FlaskConical,
    Loader2,
    MapPin,
    Search,
    WalletCards,
} from "lucide-react";

type LabBooking = {
    _id: string;
    booking_number: string;
    patient_id: {
        _id: string;
        username?: string;
        email?: string;
        contact_no?: string;
    };
    tests: {
        test_id: string;
        name: string;
        type: "test" | "package";
        price: number;
    }[];
    subtotal: number;
    collection_fee: number;
    discount: number;
    total_amount: number;
    payment_status:
    | "pending"
    | "paid"
    | "failed"
    | "refunded"
    | "partially_refunded";
    payment_method: "online" | "cash_on_collection";
    collection_address: {
        address_line: string;
        city: string;
        state: string;
        pincode: string;
        landmark?: string;
    };
    scheduled_date: string;
    scheduled_slot: string;
    status:
    | "booked"
    | "collection_scheduled"
    | "sample_collected"
    | "processing"
    | "report_ready"
    | "completed"
    | "cancelled";
    created_at: string;
};

const statusLabels: Record<LabBooking["status"], string> = {
    booked: "Booked",
    collection_scheduled: "Collection Scheduled",
    sample_collected: "Sample Collected",
    processing: "Processing",
    report_ready: "Report Ready",
    completed: "Completed",
    cancelled: "Cancelled",
};

const statusClasses: Record<LabBooking["status"], string> = {
    booked: "bg-info/10 text-info border-info/20",
    collection_scheduled: "bg-primary/10 text-primary border-primary/20",
    sample_collected: "bg-warning/10 text-warning border-warning/20",
    processing: "bg-accent text-accent-foreground border-border",
    report_ready: "bg-success/10 text-success border-success/20",
    completed: "bg-success/10 text-success border-success/20",
    cancelled: "bg-danger/10 text-danger border-danger/20",
};

export default function DispatcherLabTestsPage() {
    const [bookings, setBookings] = useState<LabBooking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("all");
    const [paymentStatus, setPaymentStatus] = useState("all");

    async function fetchBookings() {
        try {
            setLoading(true);
            setError("");

            const params = new URLSearchParams();

            if (status !== "all") {
                params.set("status", status);
            }

            if (paymentStatus !== "all") {
                params.set("payment_status", paymentStatus);
            }

            const response = await fetch(
                `/api/dispatcher/lab-bookings?${params.toString()}`,
                { cache: "no-store" },
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.error || "Failed to fetch lab bookings.",
                );
            }

            setBookings(result.bookings || []);
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to fetch lab bookings.",
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchBookings();
    }, [status, paymentStatus]);

    const filteredBookings = bookings.filter((booking) => {
        const query = search.toLowerCase().trim();

        if (!query) {
            return true;
        }

        return (
            booking.booking_number.toLowerCase().includes(query) ||
            booking.patient_id?.username?.toLowerCase().includes(query) ||
            booking.patient_id?.email?.toLowerCase().includes(query) ||
            booking.patient_id?.contact_no?.toLowerCase().includes(query)
        );
    });

    return (
        <main className="min-h-screen bg-background text-foreground">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <section className="mb-6 rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
                    <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
                        <div>
                            <p className="mb-2 text-sm font-medium text-primary">
                                Dispatcher
                            </p>

                            <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">
                                Lab Bookings
                            </h1>

                            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                                Manage sample collection, processing, reports,
                                and payments.
                            </p>
                        </div>

                        <div className="rounded-xl border border-border bg-surface-secondary px-4 py-3">
                            <p className="text-xs text-muted">
                                Total bookings
                            </p>
                            <p className="mt-1 text-xl font-bold">
                                {bookings.length}
                            </p>
                        </div>
                    </div>
                </section>

                <section className="mb-6 rounded-2xl border border-border bg-surface p-4 shadow-sm">
                    <div className="grid gap-3 md:grid-cols-[1fr_190px_190px]">
                        <div className="relative">
                            <Search
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                                size={17}
                            />

                            <input
                                type="text"
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Search booking, patient, email or contact..."
                                className="h-11 w-full rounded-xl border border-border bg-surface-secondary pl-10 pr-3 text-sm outline-none placeholder:text-muted-foreground transition focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
                            />
                        </div>

                        <select
                            value={status}
                            onChange={(event) =>
                                setStatus(event.target.value)
                            }
                            className="h-11 rounded-xl border border-border bg-surface-secondary px-3 text-sm outline-none transition focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
                        >
                            <option value="all">All statuses</option>
                            <option value="booked">Booked</option>
                            <option value="collection_scheduled">
                                Collection Scheduled
                            </option>
                            <option value="sample_collected">
                                Sample Collected
                            </option>
                            <option value="processing">Processing</option>
                            <option value="report_ready">
                                Report Ready
                            </option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>

                        <select
                            value={paymentStatus}
                            onChange={(event) =>
                                setPaymentStatus(event.target.value)
                            }
                            className="h-11 rounded-xl border border-border bg-surface-secondary px-3 text-sm outline-none transition focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
                        >
                            <option value="all">All payments</option>
                            <option value="pending">Payment Pending</option>
                            <option value="paid">Paid</option>
                            <option value="failed">Failed</option>
                            <option value="refunded">Refunded</option>
                            <option value="partially_refunded">
                                Partially Refunded
                            </option>
                        </select>
                    </div>
                </section>

                {error && (
                    <div className="mb-6 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="flex min-h-64 items-center justify-center rounded-2xl border border-border bg-surface shadow-sm">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                ) : filteredBookings.length === 0 ? (
                    <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-border bg-surface px-5 text-center shadow-sm">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-primary">
                            <FlaskConical className="h-7 w-7" />
                        </div>

                        <h2 className="mt-4 font-semibold">
                            No lab bookings found
                        </h2>

                        <p className="mt-1 text-sm text-muted">
                            Try changing the filters or search query.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredBookings.map((booking) => (
                            <Link
                                key={booking._id}
                                href={`/dispatcher/lab-tests/${booking._id}`}
                                className="block rounded-2xl border border-border bg-surface shadow-sm transition hover:border-primary/40 hover:bg-surface-secondary"
                            >
                                <div className="p-5 sm:p-6">
                                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="font-bold">
                                                    {booking.booking_number}
                                                </span>

                                                <span
                                                    className={`rounded-full border px-2.5 py-1 text-xs font-medium ${statusClasses[booking.status]}`}
                                                >
                                                    {
                                                        statusLabels[
                                                        booking.status
                                                        ]
                                                    }
                                                </span>

                                                <span
                                                    className={`rounded-full border px-2.5 py-1 text-xs font-medium ${booking.payment_status ===
                                                            "paid"
                                                            ? "border-success/20 bg-success/10 text-success"
                                                            : "border-warning/20 bg-warning/10 text-warning"
                                                        }`}
                                                >
                                                    {booking.payment_status ===
                                                        "paid"
                                                        ? "Paid"
                                                        : "Payment Pending"}
                                                </span>
                                            </div>

                                            <p className="mt-3 text-sm font-semibold">
                                                {booking.patient_id?.username ||
                                                    "Unknown patient"}
                                            </p>

                                            <p className="mt-1 text-xs text-muted">
                                                {booking.patient_id?.email ||
                                                    booking.patient_id
                                                        ?.contact_no ||
                                                    "No contact information"}
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:min-w-117.5">
                                            <div>
                                                <div className="flex items-center gap-2 text-xs text-muted">
                                                    <CalendarDays className="h-3.5 w-3.5" />
                                                    Collection
                                                </div>

                                                <p className="mt-1 text-sm font-medium">
                                                    {new Date(
                                                        booking.scheduled_date,
                                                    ).toLocaleDateString(
                                                        "en-IN",
                                                        {
                                                            day: "2-digit",
                                                            month: "short",
                                                            year: "numeric",
                                                        },
                                                    )}
                                                </p>
                                            </div>

                                            <div>
                                                <div className="flex items-center gap-2 text-xs text-muted">
                                                    <Clock3 className="h-3.5 w-3.5" />
                                                    Slot
                                                </div>

                                                <p className="mt-1 text-sm font-medium">
                                                    {booking.scheduled_slot}
                                                </p>
                                            </div>

                                            <div>
                                                <div className="flex items-center gap-2 text-xs text-muted">
                                                    <WalletCards className="h-3.5 w-3.5" />
                                                    Amount
                                                </div>

                                                <p className="mt-1 text-sm font-medium">
                                                    ₹
                                                    {booking.total_amount.toLocaleString(
                                                        "en-IN",
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        <ChevronRight className="hidden h-5 w-5 shrink-0 text-muted lg:block" />
                                    </div>

                                    <div className="mt-5 flex items-start gap-2 border-t border-border pt-4 text-xs text-muted">
                                        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />

                                        <span>
                                            {
                                                booking.collection_address
                                                    .address_line
                                            }
                                            ,{" "}
                                            {
                                                booking.collection_address
                                                    .city
                                            }
                                            ,{" "}
                                            {
                                                booking.collection_address
                                                    .state
                                            }{" "}
                                            -{" "}
                                            {
                                                booking.collection_address
                                                    .pincode
                                            }
                                        </span>
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