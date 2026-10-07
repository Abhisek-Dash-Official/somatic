"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Package, RefreshCw, Search } from "lucide-react";

type Order = {
    _id: string;
    user_id?: { username?: string; email?: string; contact_no?: string };
    items: { name: string; quantity: number }[];
    total_amount: number;
    payment_method: string;
    payment_status: string;
    order_status: string;
    placed_at: string;
};

const formatINR = (n: number) => `₹${n.toLocaleString("en-IN")}`;

const formatStatus = (status: string) =>
    status.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

const statusStyles: Record<string, string> = {
    placed: "bg-info/10 text-info",
    confirmed: "bg-primary/10 text-primary",
    shipped: "bg-warning/10 text-warning",
    out_for_delivery: "bg-accent text-accent-foreground",
    delivered: "bg-success/10 text-success",
    cancelled: "bg-danger/10 text-danger",
};

export default function DispatcherOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [cursor, setCursor] = useState<string | null>(null);
    const [status, setStatus] = useState("all");
    const [paymentStatus, setPaymentStatus] = useState("all");
    const [search, setSearch] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [error, setError] = useState("");

    const fetchOrders = useCallback(
        async (nextCursor: string | null = null, reset = false) => {
            try {
                if (reset) {
                    setIsLoading(true);
                } else {
                    setIsLoadingMore(true);
                }

                const params = new URLSearchParams({
                    limit: "20",
                    status,
                    payment_status: paymentStatus,
                });

                if (nextCursor) {
                    params.set("cursor", nextCursor);
                }

                const response = await fetch(
                    `/api/dispatcher/orders?${params.toString()}`,
                );
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || "Unable to fetch orders");
                }

                setOrders((current) =>
                    reset ? data.orders : [...current, ...data.orders],
                );
                setCursor(data.next_cursor);
                setHasMore(data.has_more);
                setError("");
            } catch (error: any) {
                setError(error.message || "Unable to fetch orders");
            } finally {
                setIsLoading(false);
                setIsLoadingMore(false);
            }
        },
        [status, paymentStatus],
    );

    useEffect(() => {
        setOrders([]);
        setCursor(null);
        fetchOrders(null, true);
    }, [fetchOrders]);

    const filteredOrders = orders.filter((order) => {
        const query = search.toLowerCase().trim();

        if (!query) {
            return true;
        }

        return (
            order._id.toLowerCase().includes(query) ||
            order.user_id?.username?.toLowerCase().includes(query) ||
            order.user_id?.email?.toLowerCase().includes(query)
        );
    });

    return (
        <main className="min-h-screen bg-background px-4 py-6 text-foreground sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <section className="mb-6 rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="mb-2 text-sm font-medium text-primary">
                                Dispatcher
                            </p>

                            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                                Orders
                            </h1>

                            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                                Manage medicine and blood orders, payments, and
                                delivery status.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => fetchOrders(null, true)}
                            disabled={isLoading}
                            className="inline-flex w-fit items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-surface-secondary disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <RefreshCw
                                size={16}
                                className={isLoading ? "animate-spin" : ""}
                            />
                            Refresh
                        </button>
                    </div>
                </section>

                <section className="mb-6 rounded-2xl border border-border bg-surface p-4 shadow-sm">
                    <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
                        <div className="relative">
                            <Search
                                size={17}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                            />

                            <input
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Search order, customer or email"
                                className="w-full rounded-xl border border-border bg-surface-secondary py-2.5 pl-10 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground transition focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
                            />
                        </div>

                        <select
                            value={status}
                            onChange={(event) =>
                                setStatus(event.target.value)
                            }
                            className="rounded-xl border border-border bg-surface-secondary px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
                        >
                            <option value="all">All order statuses</option>
                            <option value="placed">Placed</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="shipped">Shipped</option>
                            <option value="out_for_delivery">
                                Out for delivery
                            </option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                        </select>

                        <select
                            value={paymentStatus}
                            onChange={(event) =>
                                setPaymentStatus(event.target.value)
                            }
                            className="rounded-xl border border-border bg-surface-secondary px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
                        >
                            <option value="all">All payment statuses</option>
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                            <option value="failed">Failed</option>
                            <option value="refunded">Refunded</option>
                        </select>
                    </div>
                </section>

                {error && (
                    <div className="mb-5 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
                        {error}
                    </div>
                )}

                {isLoading ? (
                    <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map((item) => (
                            <div
                                key={item}
                                className="h-24 animate-pulse rounded-2xl border border-border bg-surface"
                            />
                        ))}
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-2xl border border-border bg-surface p-8 text-center shadow-sm">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-primary">
                            <Package size={28} />
                        </div>

                        <h2 className="mt-4 text-lg font-bold">
                            No orders found
                        </h2>

                        <p className="mt-1 max-w-md text-sm text-muted">
                            There are no orders matching the selected filters.
                        </p>
                    </div>
                ) : (
                    <>
                        <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
                            <div className="hidden grid-cols-[1.2fr_1.3fr_0.8fr_0.8fr_32px] gap-4 border-b border-border bg-surface-secondary px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted md:grid">
                                <span>Order</span>
                                <span>Customer</span>
                                <span>Status</span>
                                <span>Total</span>
                                <span />
                            </div>

                            {filteredOrders.map((order) => (
                                <Link
                                    key={order._id}
                                    href={`/dispatcher/orders/${order._id}`}
                                    className="grid gap-4 border-b border-border p-5 transition last:border-b-0 hover:bg-surface-secondary md:grid-cols-[1.2fr_1.3fr_0.8fr_0.8fr_32px] md:items-center"
                                >
                                    <div>
                                        <p className="font-bold text-foreground">
                                            #
                                            {order._id
                                                .slice(-8)
                                                .toUpperCase()}
                                        </p>

                                        <p className="mt-1 text-xs text-muted">
                                            {new Date(
                                                order.placed_at,
                                            ).toLocaleDateString("en-IN", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </p>
                                    </div>

                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold text-foreground">
                                            {order.user_id?.username ||
                                                "Unknown customer"}
                                        </p>

                                        <p className="truncate text-xs text-muted">
                                            {order.user_id?.email || "No email"}
                                        </p>
                                    </div>

                                    <span
                                        className={`w-fit rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[
                                            order.order_status
                                            ] ||
                                            "bg-surface-secondary text-muted"
                                            }`}
                                    >
                                        {formatStatus(order.order_status)}
                                    </span>

                                    <div>
                                        <p className="font-bold tabular-nums text-foreground">
                                            {formatINR(order.total_amount)}
                                        </p>

                                        <p
                                            className={`mt-1 text-xs font-medium ${order.payment_status === "paid"
                                                    ? "text-success"
                                                    : order.payment_status ===
                                                        "failed"
                                                        ? "text-danger"
                                                        : "text-warning"
                                                }`}
                                        >
                                            {formatStatus(
                                                order.payment_status,
                                            )}
                                        </p>
                                    </div>

                                    <ChevronRight
                                        size={18}
                                        className="hidden text-muted-foreground md:block"
                                    />
                                </Link>
                            ))}
                        </section>

                        {hasMore && (
                            <div className="mt-6 flex justify-center">
                                <button
                                    type="button"
                                    onClick={() => fetchOrders(cursor)}
                                    disabled={isLoadingMore}
                                    className="rounded-xl border border-border bg-surface px-6 py-3 text-sm font-semibold text-foreground transition hover:bg-surface-secondary disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {isLoadingMore
                                        ? "Loading..."
                                        : "Load more orders"}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </main>
    );
}