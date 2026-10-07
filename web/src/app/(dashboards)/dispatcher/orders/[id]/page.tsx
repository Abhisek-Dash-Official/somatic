"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    Check,
    CheckCircle2,
    Package,
    User,
    XCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import type { IOrder, ITransaction, IUser } from "@/types/models";

type OrderStatus = IOrder["order_status"];

type PopulatedOrder = Omit<IOrder, "user_id"> & {
    _id: string;
    user_id: Pick<IUser, "username" | "email" | "contact_no">;
};

type OrderTransaction = ITransaction & {
    created_at?: Date | string;
};

const statuses: OrderStatus[] = [
    "placed",
    "confirmed",
    "shipped",
    "out_for_delivery",
    "delivered",
];

const formatINR = (amount: number) => `₹${amount.toLocaleString("en-IN")}`;

const formatStatus = (status: string) =>
    status.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

export default function DispatcherOrderDetailsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const [order, setOrder] = useState<PopulatedOrder | null>(null);
    const [transaction, setTransaction] =
        useState<OrderTransaction | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState("");
    const [updateError, setUpdateError] = useState("");

    const fetchOrder = async () => {
        try {
            const { id } = await params;
            const response = await fetch(`/api/dispatcher/orders/${id}`);
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

    useEffect(() => {
        fetchOrder();
    }, [params]);

    const updateStatus = async (status: OrderStatus) => {
        if (!order || isUpdating) return;

        if (status === "delivered" && order.payment_status !== "paid") {
            toast.error(
                "Payment must be confirmed before marking the order as delivered.",
            );
            return;
        }

        setIsUpdating(true);
        setUpdateError("");

        try {
            const response = await fetch(
                `/api/dispatcher/orders/${order._id}`,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ order_status: status }),
                },
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "Unable to update order status",
                );
            }

            setOrder(data.order || { ...order, order_status: status });

            if (data.transaction) {
                setTransaction(data.transaction);
            }

            toast.success(`Order marked as ${formatStatus(status)}.`);
        } catch (error: any) {
            const message =
                error.message || "Unable to update order status";
            setUpdateError(message);
            toast.error(message);
        } finally {
            setIsUpdating(false);
        }
    };

    const markCODPaid = async () => {
        if (!order || isUpdating) return;

        setIsUpdating(true);
        setUpdateError("");

        try {
            const response = await fetch(
                `/api/dispatcher/orders/${order._id}`,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ payment_status: "paid" }),
                },
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "Unable to mark COD payment as paid",
                );
            }

            setOrder(data.order);
            setTransaction(data.transaction);

            toast.success("COD payment marked as paid.");
        } catch (error: any) {
            const message =
                error.message || "Unable to mark COD payment as paid";

            setUpdateError(message);
            toast.error(message);
        } finally {
            setIsUpdating(false);
        }
    };

    if (isLoading) {
        return (
            <main className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
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
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-danger/10 text-danger">
                        <XCircle size={30} />
                    </div>

                    <h1 className="mt-5 text-2xl font-bold text-foreground">
                        Order not found
                    </h1>

                    <p className="mt-2 text-sm leading-6 text-muted">
                        {error || "The requested order could not be found."}
                    </p>

                    <Link
                        href="/dispatcher/orders"
                        className="mt-6 inline-flex rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground transition hover:bg-primary-hover"
                    >
                        Back to orders
                    </Link>
                </div>
            </main>
        );
    }

    const canDeliver = order.payment_status === "paid";
    const currentIndex = statuses.indexOf(order.order_status);

    const nextStatus =
        currentIndex >= 0 && currentIndex < statuses.length - 1
            ? statuses[currentIndex + 1]
            : null;

    const blockedNextStatus =
        nextStatus === "delivered" && !canDeliver;

    return (
        <main className="min-h-screen bg-background px-4 py-6 text-foreground sm:px-6 lg:px-8">
            <div className="mx-auto max-w-5xl">
                <div className="mb-6">
                    <Link
                        href="/dispatcher/orders"
                        className="inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-foreground"
                    >
                        <ArrowLeft size={17} />
                        Back to orders
                    </Link>
                </div>

                <div className="mb-6 rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                                Order details
                            </p>

                            <h1 className="mt-1 text-2xl font-extrabold tracking-tight">
                                #{order._id.slice(-8).toUpperCase()}
                            </h1>
                        </div>

                        <span
                            className={`w-fit rounded-full px-3 py-1.5 text-sm font-semibold ${order.order_status === "cancelled"
                                    ? "bg-danger/10 text-danger"
                                    : order.order_status === "delivered"
                                        ? "bg-success/10 text-success"
                                        : "bg-primary/10 text-primary"
                                }`}
                        >
                            {formatStatus(order.order_status)}
                        </span>
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
                                        order.placed_at || "",
                                    ).toLocaleString("en-IN")}
                                </p>
                            </div>
                        </div>

                        <div className="mt-7">
                            {order.order_status === "cancelled" ? (
                                <div className="rounded-xl border border-danger/20 bg-danger/10 p-4 text-sm text-danger">
                                    This order has been cancelled.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-5">
                                        {statuses.map((status, index) => {
                                            const completed =
                                                currentIndex >= index;

                                            return (
                                                <div
                                                    key={status}
                                                    className={`flex min-h-16 items-center gap-3 rounded-xl border px-3 py-3 ${completed
                                                            ? "border-primary/30 bg-primary/10"
                                                            : "border-border bg-surface-secondary"
                                                        }`}
                                                >
                                                    <div
                                                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${completed
                                                                ? "bg-primary text-primary-foreground"
                                                                : "bg-surface text-muted"
                                                            }`}
                                                    >
                                                        {completed ? (
                                                            <Check size={15} />
                                                        ) : (
                                                            <span className="text-xs">
                                                                {index + 1}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <span
                                                        className={`text-xs font-semibold ${completed
                                                                ? "text-primary"
                                                                : "text-muted"
                                                            }`}
                                                    >
                                                        {formatStatus(status)}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {nextStatus && (
                                        <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface-secondary p-4 sm:flex-row sm:items-center sm:justify-between">
                                            <div>
                                                <p className="text-sm font-semibold text-foreground">
                                                    Next status
                                                </p>

                                                <p className="mt-1 text-sm text-muted">
                                                    Move this order to{" "}
                                                    <span className="font-semibold text-foreground">
                                                        {formatStatus(
                                                            nextStatus,
                                                        )}
                                                    </span>
                                                </p>

                                                {blockedNextStatus && (
                                                    <p className="mt-2 text-sm font-medium text-warning">
                                                        Payment must be
                                                        confirmed before
                                                        delivery.
                                                    </p>
                                                )}
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    updateStatus(nextStatus)
                                                }
                                                disabled={
                                                    isUpdating ||
                                                    blockedNextStatus
                                                }
                                                className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
                                            >
                                                {isUpdating
                                                    ? "Updating..."
                                                    : blockedNextStatus
                                                        ? "Payment Pending"
                                                        : `Mark as ${formatStatus(
                                                            nextStatus,
                                                        )}`}
                                            </button>
                                        </div>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() =>
                                            updateStatus("cancelled")
                                        }
                                        disabled={isUpdating}
                                        className="rounded-xl border border-danger/30 px-4 py-2.5 text-sm font-semibold text-danger transition hover:bg-danger/10 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        Cancel Order
                                    </button>

                                    {updateError && (
                                        <p className="text-sm text-danger">
                                            {updateError}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </section>

                    <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
                        <div className="flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-primary">
                                <User size={18} />
                            </div>

                            <h2 className="text-lg font-bold">Customer</h2>
                        </div>

                        <div className="mt-5 grid gap-5 sm:grid-cols-3">
                            <div>
                                <p className="text-xs text-muted">Username</p>
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
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-primary">
                                <Package size={18} />
                            </div>

                            <h2 className="text-lg font-bold">Items</h2>
                        </div>

                        <div className="mt-5 divide-y divide-border">
                            {order.items.map((item, index) => (
                                <div
                                    key={`${item.name}-${index}`}
                                    className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0"
                                >
                                    <div className="min-w-0">
                                        <h3 className="font-semibold text-foreground">
                                            {item.name}
                                        </h3>

                                        {"item_type" in item && (
                                            <span className="mt-2 inline-flex rounded-full bg-surface-secondary px-2.5 py-1 text-xs text-muted">
                                                {
                                                    (
                                                        item as {
                                                            item_type?: string;
                                                        }
                                                    ).item_type
                                                }
                                            </span>
                                        )}

                                        {"manufacturer" in item &&
                                            (item as { manufacturer?: string })
                                                .manufacturer && (
                                                <p className="mt-1 text-sm text-muted">
                                                    {
                                                        (
                                                            item as {
                                                                manufacturer?: string;
                                                            }
                                                        ).manufacturer
                                                    }
                                                </p>
                                            )}

                                        {"blood_group" in item &&
                                            (item as { blood_group?: string })
                                                .blood_group && (
                                                <p className="mt-1 text-sm text-muted">
                                                    Blood group:{" "}
                                                    {
                                                        (
                                                            item as {
                                                                blood_group?: string;
                                                            }
                                                        ).blood_group
                                                    }
                                                </p>
                                            )}

                                        {"unit_price" in item && (
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                {formatINR(
                                                    (
                                                        item as {
                                                            unit_price: number;
                                                        }
                                                    ).unit_price,
                                                )}{" "}
                                                × {item.quantity}
                                            </p>
                                        )}
                                    </div>

                                    {"unit_price" in item && (
                                        <p className="shrink-0 font-bold tabular-nums">
                                            {formatINR(
                                                (
                                                    item as {
                                                        unit_price: number;
                                                    }
                                                ).unit_price * item.quantity,
                                            )}
                                        </p>
                                    )}
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
                                        Payment status
                                    </span>

                                    <span
                                        className={`font-semibold ${order.payment_status === "paid"
                                                ? "text-success"
                                                : order.payment_status ===
                                                    "failed"
                                                    ? "text-danger"
                                                    : "text-warning"
                                            }`}
                                    >
                                        {formatStatus(order.payment_status)}
                                    </span>
                                </div>

                                {transaction && (
                                    <div className="flex justify-between gap-4">
                                        <span className="text-muted">
                                            Transaction
                                        </span>

                                        <span className="font-semibold">
                                            {formatStatus(
                                                transaction.status,
                                            )}
                                        </span>
                                    </div>
                                )}

                                {transaction?.gateway_order_id && (
                                    <div className="flex justify-between gap-4">
                                        <span className="text-muted">
                                            Razorpay order
                                        </span>

                                        <span className="max-w-55 truncate font-mono text-xs">
                                            {transaction.gateway_order_id}
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

                                {transaction?.paid_at && (
                                    <div className="flex justify-between gap-4">
                                        <span className="text-muted">
                                            Paid at
                                        </span>

                                        <span className="text-right">
                                            {new Date(
                                                transaction.paid_at,
                                            ).toLocaleString("en-IN")}
                                        </span>
                                    </div>
                                )}

                                {order.payment_method === "COD" &&
                                    order.payment_status !== "paid" && (
                                        <div className="border-t border-border pt-4">
                                            <button
                                                type="button"
                                                onClick={markCODPaid}
                                                disabled={isUpdating}
                                                className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
                                            >
                                                {isUpdating
                                                    ? "Marking payment..."
                                                    : "Mark COD Payment as Paid"}
                                            </button>
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

                    {order.payment_status === "paid" && (
                        <div className="flex items-center gap-3 rounded-xl border border-success/20 bg-success/10 p-4 text-sm text-success">
                            <CheckCircle2 size={18} />
                            <span>
                                Payment has been successfully verified.
                            </span>
                        </div>
                    )}

                    {order.payment_status !== "paid" &&
                        order.order_status !== "cancelled" && (
                            <div className="flex items-center gap-3 rounded-xl border border-warning/20 bg-warning/10 p-4 text-sm text-warning">
                                <XCircle size={18} />
                                <span>
                                    This order cannot be marked as delivered
                                    until the payment is confirmed.
                                </span>
                            </div>
                        )}
                </div>
            </div>
        </main>
    );
}