"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Package, User, XCircle } from "lucide-react";

type Order = {
    _id: string;
    user_id?: { username?: string; email?: string; contact_no?: string };
    items: {
        item_type: string;
        name: string;
        manufacturer?: string;
        blood_group?: string;
        quantity: number;
        unit_price: number;
    }[];
    total_amount: number;
    payment_method: string;
    payment_status: string;
    order_status: string;
    shipping_address: {
        street: string;
        city: string;
        state: string;
        pincode: string;
    };
    placed_at: string;
};

type Transaction = {
    amount: number;
    currency: string;
    status: string;
    payment_gateway: string;
    gateway_order_id?: string;
    gateway_payment_id?: string;
    paid_at?: string;
    failed_at?: string;
    failure_reason?: string;
    created_at: string;
};

const formatINR = (n: number) => `₹${n.toLocaleString("en-IN")}`;

const formatStatus = (status: string) =>
    status.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

export default function AdminOrderDetailsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const [order, setOrder] = useState<Order | null>(null);
    const [transaction, setTransaction] = useState<Transaction | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const { id } = await params;
                const response = await fetch(`/api/admin/orders/${id}`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || "Unable to fetch order");
                }

                setOrder(data.order);
                setTransaction(data.transaction);
            } catch (error: any) {
                setError(error.message || "Unable to fetch order");
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrder();
    }, [params]);

    if (isLoading) {
        return (
            <main className="min-h-screen bg-background px-4 py-10 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-5xl animate-pulse space-y-5">
                    <div className="h-8 w-56 rounded-xl bg-surface-secondary" />
                    <div className="h-40 rounded-2xl border border-border bg-surface" />
                    <div className="h-64 rounded-2xl border border-border bg-surface" />
                </div>
            </main>
        );
    }

    if (error || !order) {
        return (
            <main className="flex min-h-[80vh] items-center justify-center bg-background px-6 py-12">
                <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-8 text-center shadow-sm">
                    <XCircle size={44} className="mx-auto text-danger" />
                    <h1 className="mt-5 text-2xl font-bold text-foreground">
                        Order not found
                    </h1>
                    <p className="mt-2 text-sm text-muted">
                        {error || "The requested order could not be found."}
                    </p>
                    <Link
                        href="/admin/orders"
                        className="mt-6 inline-flex rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground transition hover:bg-primary-hover"
                    >
                        Back to orders
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-background px-4 py-10 text-foreground sm:px-6 lg:px-8">
            <div className="mx-auto max-w-5xl">
                <div className="mb-8 flex items-center gap-3">
                    <Link
                        href="/admin/orders"
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-muted shadow-sm transition hover:bg-surface-secondary hover:text-foreground"
                    >
                        <ArrowLeft size={18} />
                    </Link>

                    <div>
                        <p className="text-xs uppercase tracking-wider text-muted-foreground">
                            Order details
                        </p>
                        <h1 className="text-xl font-extrabold sm:text-2xl">
                            #{order._id.slice(-8).toUpperCase()}
                        </h1>
                    </div>
                </div>

                <div className="space-y-5">
                    <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <h2 className="text-lg font-bold">
                                    Order status
                                </h2>
                                <p className="mt-1 text-sm text-muted">
                                    Placed{" "}
                                    {new Date(
                                        order.placed_at
                                    ).toLocaleString("en-IN")}
                                </p>
                            </div>

                            <span className="rounded-full bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary">
                                {formatStatus(order.order_status)}
                            </span>
                        </div>
                    </section>

                    <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
                        <div className="flex items-center gap-2">
                            <User size={19} className="text-primary" />
                            <h2 className="text-lg font-bold">Customer</h2>
                        </div>

                        <div className="mt-5 grid gap-4 sm:grid-cols-3">
                            <div>
                                <p className="text-xs text-muted">Name</p>
                                <p className="mt-1 font-semibold">
                                    {order.user_id?.username || "Unknown"}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-muted">Email</p>
                                <p className="mt-1 break-all font-semibold">
                                    {order.user_id?.email || "Not available"}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-muted">Phone</p>
                                <p className="mt-1 font-semibold">
                                    {order.user_id?.contact_no ||
                                        "Not available"}
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
                        <div className="flex items-center gap-2">
                            <Package size={19} className="text-primary" />
                            <h2 className="text-lg font-bold">Items</h2>
                        </div>

                        <div className="mt-5 divide-y divide-border">
                            {order.items.map((item, index) => (
                                <div
                                    key={`${item.name}-${index}`}
                                    className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0"
                                >
                                    <div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className="font-semibold">
                                                {item.name}
                                            </h3>

                                            <span className="rounded-full bg-surface-secondary px-2 py-0.5 text-xs text-muted">
                                                {item.item_type}
                                            </span>
                                        </div>

                                        {item.manufacturer && (
                                            <p className="mt-1 text-sm text-muted">
                                                {item.manufacturer}
                                            </p>
                                        )}

                                        {item.blood_group && (
                                            <p className="mt-1 text-sm text-muted">
                                                Blood group: {item.blood_group}
                                            </p>
                                        )}

                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {formatINR(item.unit_price)} ×{" "}
                                            {item.quantity}
                                        </p>
                                    </div>

                                    <p className="font-bold tabular-nums">
                                        {formatINR(
                                            item.unit_price * item.quantity
                                        )}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-5 flex justify-between border-t border-border pt-5">
                            <span className="font-bold">Total</span>
                            <span className="text-2xl font-extrabold tabular-nums">
                                {formatINR(order.total_amount)}
                            </span>
                        </div>
                    </section>

                    <div className="grid gap-5 md:grid-cols-2">
                        <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
                            <h2 className="text-lg font-bold">
                                Shipping address
                            </h2>

                            <div className="mt-4 text-sm leading-6 text-muted">
                                <p>{order.shipping_address.street}</p>
                                <p>
                                    {order.shipping_address.city},{" "}
                                    {order.shipping_address.state}
                                </p>
                                <p>{order.shipping_address.pincode}</p>
                            </div>
                        </section>

                        <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
                            <h2 className="text-lg font-bold">Payment</h2>

                            <div className="mt-4 space-y-3 text-sm">
                                <div className="flex justify-between gap-4">
                                    <span className="text-muted">Method</span>
                                    <span className="font-semibold">
                                        {order.payment_method}
                                    </span>
                                </div>

                                <div className="flex justify-between gap-4">
                                    <span className="text-muted">
                                        Order status
                                    </span>
                                    <span className="font-semibold">
                                        {formatStatus(order.payment_status)}
                                    </span>
                                </div>

                                {transaction && (
                                    <div className="flex justify-between gap-4">
                                        <span className="text-muted">
                                            Transaction
                                        </span>
                                        <span className="font-semibold">
                                            {formatStatus(transaction.status)}
                                        </span>
                                    </div>
                                )}

                                {transaction?.gateway_payment_id && (
                                    <div className="flex justify-between gap-4">
                                        <span className="text-muted">
                                            Payment ID
                                        </span>
                                        <span className="max-w-55 truncate font-mono text-xs">
                                            {transaction.gateway_payment_id}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    {transaction?.failure_reason && (
                        <div className="rounded-xl border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
                            Payment failure: {transaction.failure_reason}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}