"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronRight, Package, ShoppingBag } from "lucide-react";

type Order = {
    _id: string;
    items: { name: string; quantity: number; unit_price: number }[];
    total_amount: number;
    payment_method: string;
    payment_status: string;
    order_status: string;
    placed_at: string;
};

const formatINR = (n: number) => `₹${n.toLocaleString("en-IN")}`;

const statusStyles: Record<string, string> = {
    placed: "bg-info/10 text-info",
    confirmed: "bg-primary/10 text-primary",
    shipped: "bg-warning/10 text-warning",
    out_for_delivery: "bg-accent text-accent-foreground",
    delivered: "bg-success/10 text-success",
    cancelled: "bg-danger/10 text-danger",
};

const formatStatus = (status: string) => status.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await fetch("/api/shop/orders");
                const data = await response.json();

                if (!response.ok) throw new Error(data.error || "Unable to fetch orders");

                setOrders(data.orders || []);
            } catch (error: any) {
                setError(error.message || "Unable to fetch orders");
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrders();
    }, []);

    if (isLoading) {
        return (
            <main className="min-h-screen bg-background px-4 py-10 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-5xl animate-pulse space-y-4">
                    <div className="h-8 w-48 rounded-lg bg-surface-secondary" />
                    <div className="h-28 rounded-xl border border-border bg-surface" />
                    <div className="h-28 rounded-xl border border-border bg-surface" />
                    <div className="h-28 rounded-xl border border-border bg-surface" />
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-background px-4 py-10 text-foreground sm:px-6 lg:px-8">
            <div className="mx-auto max-w-5xl">
                <div className="mb-8 flex items-center gap-3">
                    <Link href="/shop" className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface text-muted transition hover:bg-surface-secondary hover:text-foreground" aria-label="Back to shop">
                        <ArrowLeft size={18} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">My orders</h1>
                        <p className="mt-1 text-sm text-muted">View your medicine and blood orders.</p>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
                        {error}
                    </div>
                )}

                {!error && orders.length === 0 ? (
                    <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-xl border border-border bg-surface p-8 text-center">
                        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-accent">
                            <Package size={36} className="text-primary" />
                        </div>
                        <h2 className="mt-5 text-xl font-bold text-foreground">No orders yet</h2>
                        <p className="mt-2 max-w-md text-sm text-muted">Your completed and active shop orders will appear here.</p>
                        <Link href="/shop" className="mt-6 flex items-center gap-2 rounded-lg bg-primary px-5 py-3 font-semibold text-primary-foreground transition hover:bg-primary-hover">
                            <ShoppingBag size={18} />
                            Browse shop
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <Link key={order._id} href={`/shop/orders/${order._id}`} className="block rounded-xl border border-border bg-surface p-5 transition hover:border-primary/40 hover:bg-surface-secondary sm:p-6">
                                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="text-sm font-bold text-foreground">Order #{order._id.slice(-8).toUpperCase()}</span>
                                            <span className={`rounded-md px-2.5 py-1 text-xs font-semibold ${statusStyles[order.order_status] || "bg-surface-secondary text-muted"}`}>
                                                {formatStatus(order.order_status)}
                                            </span>
                                        </div>

                                        <p className="mt-2 text-sm text-muted">
                                            {new Date(order.placed_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                        </p>

                                        <p className="mt-3 text-sm text-muted">
                                            {order.items.length} {order.items.length === 1 ? "item" : "items"} · {order.payment_method}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between gap-6 sm:justify-end">
                                        <div className="text-right">
                                            <p className="text-xs text-muted">Total</p>
                                            <p className="mt-1 text-xl font-extrabold tabular-nums text-foreground">{formatINR(order.total_amount)}</p>
                                        </div>
                                        <ChevronRight size={20} className="text-muted-foreground" />
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