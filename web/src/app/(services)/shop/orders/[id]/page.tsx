"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    CheckCircle2,
    Clock3,
    Package,
    Truck,
    XCircle,
} from "lucide-react";

type Order = {
    _id: string;
    items: {
        item_type: "Medicine" | "BloodBank";
        item_id: string;
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
    updated_at: string;
};

const formatINR = (n: number) => `₹${n.toLocaleString("en-IN")}`;

const steps = [
    { status: "placed", label: "Order placed", icon: Clock3 },
    { status: "confirmed", label: "Confirmed", icon: CheckCircle2 },
    { status: "shipped", label: "Shipped", icon: Package },
    { status: "out_for_delivery", label: "Out for delivery", icon: Truck },
    { status: "delivered", label: "Delivered", icon: CheckCircle2 },
];

const statusIndex = (status: string) =>
    steps.findIndex((step) => step.status === status);

const formatStatus = (status: string) =>
    status.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

export default function OrderDetailsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const { id } = await params;
                const response = await fetch(`/api/shop/orders/${id}`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || "Unable to fetch order");
                }

                setOrder(data.order);
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
                    <div className="h-32 rounded-2xl border border-border bg-surface" />
                    <div className="h-64 rounded-2xl border border-border bg-surface" />
                </div>
            </main>
        );
    }

    if (error || !order) {
        return (
            <main className="flex min-h-[80vh] items-center justify-center bg-background px-6 py-12">
                <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-8 text-center">
                    <XCircle size={44} className="mx-auto text-danger" />

                    <h1 className="mt-5 text-2xl font-bold text-foreground">
                        Order not found
                    </h1>

                    <p className="mt-2 text-sm text-muted">
                        {error || "This order does not exist or you do not have access to it."}
                    </p>

                    <Link
                        href="/shop/orders"
                        className="mt-6 inline-flex rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
                    >
                        View my orders
                    </Link>
                </div>
            </main>
        );
    }

    const currentStep = statusIndex(order.order_status);
    const isCancelled = order.order_status === "cancelled";

    return (
        <main className="min-h-screen bg-background px-4 py-10 text-foreground sm:px-6 lg:px-8">
            <div className="mx-auto max-w-5xl">
                <div className="mb-8 flex flex-wrap items-center gap-3">
                    <Link
                        href="/shop/orders"
                        aria-label="Back to orders"
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-muted transition-colors hover:bg-surface-secondary hover:text-foreground"
                    >
                        <ArrowLeft size={18} />
                    </Link>

                    <div>
                        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            Order details
                        </p>
                        <h1 className="text-xl font-extrabold sm:text-2xl">
                            #{order._id.slice(-8).toUpperCase()}
                        </h1>
                    </div>
                </div>

                <div className="space-y-5">
                    <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <h2 className="text-lg font-bold">Order status</h2>
                                <p className="mt-1 text-sm text-muted">
                                    Placed on{" "}
                                    {new Date(order.placed_at).toLocaleDateString("en-IN", {
                                        day: "numeric",
                                        month: "long",
                                        year: "numeric",
                                    })}
                                </p>
                            </div>

                            <span
                                className={`rounded-full px-3 py-1.5 text-sm font-semibold ${isCancelled
                                        ? "bg-danger/10 text-danger"
                                        : "bg-primary/10 text-primary"
                                    }`}
                            >
                                {formatStatus(order.order_status)}
                            </span>
                        </div>

                        {isCancelled ? (
                            <div className="mt-6 rounded-xl border border-danger/20 bg-danger/10 p-4 text-sm text-danger">
                                This order has been cancelled.
                            </div>
                        ) : (
                            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-5">
                                {steps.map((step, index) => {
                                    const Icon = step.icon;
                                    const completed = currentStep >= index;

                                    return (
                                        <div key={step.status} className="relative text-center">
                                            <div
                                                className={`mx-auto flex h-10 w-10 items-center justify-center rounded-full ${completed
                                                        ? "bg-primary text-primary-foreground"
                                                        : "bg-surface-secondary text-muted-foreground"
                                                    }`}
                                            >
                                                <Icon size={18} />
                                            </div>

                                            <p
                                                className={`mt-2 text-xs font-semibold ${completed
                                                        ? "text-foreground"
                                                        : "text-muted-foreground"
                                                    }`}
                                            >
                                                {step.label}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>

                    <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
                        <h2 className="text-lg font-bold">Items</h2>

                        <div className="mt-5 divide-y divide-border">
                            {order.items.map((item, index) => (
                                <div
                                    key={`${item.item_id}-${index}`}
                                    className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0"
                                >
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className="font-semibold text-foreground">
                                                {item.name}
                                            </h3>

                                            <span className="rounded-full bg-surface-secondary px-2.5 py-0.5 text-xs text-muted">
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
                                            {formatINR(item.unit_price)} × {item.quantity}
                                        </p>
                                    </div>

                                    <p className="shrink-0 font-bold tabular-nums text-foreground">
                                        {formatINR(item.unit_price * item.quantity)}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-5 flex items-center justify-between border-t border-border pt-5">
                            <span className="font-bold">Total</span>
                            <span className="text-2xl font-extrabold tabular-nums">
                                {formatINR(order.total_amount)}
                            </span>
                        </div>
                    </section>

                    <div className="grid gap-5 md:grid-cols-2">
                        <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
                            <h2 className="text-lg font-bold">Delivery address</h2>

                            <div className="mt-4 text-sm leading-6 text-muted">
                                <p>{order.shipping_address.street}</p>
                                <p>
                                    {order.shipping_address.city},{" "}
                                    {order.shipping_address.state}
                                </p>
                                <p>{order.shipping_address.pincode}</p>
                            </div>
                        </section>

                        <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
                            <h2 className="text-lg font-bold">Payment</h2>

                            <div className="mt-4 space-y-3 text-sm">
                                <div className="flex justify-between gap-4">
                                    <span className="text-muted">Method</span>
                                    <span className="font-semibold text-foreground">
                                        {order.payment_method}
                                    </span>
                                </div>

                                <div className="flex justify-between gap-4">
                                    <span className="text-muted">Status</span>
                                    <span
                                        className={`font-semibold ${order.payment_status === "paid"
                                                ? "text-success"
                                                : order.payment_status === "failed"
                                                    ? "text-danger"
                                                    : "text-warning"
                                            }`}
                                    >
                                        {formatStatus(order.payment_status)}
                                    </span>
                                </div>

                                <div className="flex justify-between gap-4">
                                    <span className="text-muted">Amount</span>
                                    <span className="font-bold text-foreground">
                                        {formatINR(order.total_amount)}
                                    </span>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </main>
    );
}