"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
    Trash2,
    Plus,
    Minus,
    ArrowLeft,
    ShoppingBag,
    ShieldCheck,
    Pill,
    Droplets,
    Truck,
    Receipt,
} from "lucide-react";
import { useCartStore } from "@/store/useCartStore";

const formatINR = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export default function CartPage() {
    const { items, updateItemQuantity, isLoading, fetchCart } = useCartStore();

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    const getItemDetails = (item: any) => {
        if (item.item_type === "Medicine") {
            return {
                name: item.item_id?.name || "Unknown Medicine",
                manufacturer: item.item_id?.manufacturer || "Generic",
                price: item.item_id?.pricing?.price || item.item_id?.pricing?.mrp || 0,
                type: "Medicine",
                isBlood: false,
            };
        }

        if (item.item_type === "BloodBank") {
            const inventoryItem = item.item_id?.inventory?.find(
                (inv: any) => inv.blood_group === item.blood_group
            );

            return {
                name: item.item_id?.name || "Blood Bank",
                manufacturer: `Blood group: ${item.blood_group}`,
                price: inventoryItem?.price_per_unit || 0,
                type: "Blood unit",
                isBlood: true,
            };
        }

        return { name: "Unknown", manufacturer: "", price: 0, type: "Unknown", isBlood: false };
    };

    const subtotal = items.reduce(
        (sum: number, item: any) => sum + getItemDetails(item).price * item.quantity,
        0
    );

    const totalUnits = items.reduce((sum: number, item: any) => sum + item.quantity, 0);

    if (items.length === 0 && isLoading) {
        return (
            <div className="min-h-screen bg-background px-4 py-10 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-6xl space-y-4 animate-pulse">
                    <div className="mb-8 h-10 w-64 rounded-lg bg-surface-secondary" />
                    <div className="h-32 rounded-xl border border-border bg-surface" />
                    <div className="h-32 rounded-xl border border-border bg-surface" />
                </div>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="flex min-h-[80vh] flex-col items-center justify-center bg-background p-6 text-center">
                <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-2xl border border-border bg-accent">
                    <ShoppingBag size={40} className="text-primary" />
                </div>

                <h1 className="mb-3 text-3xl font-bold text-foreground">Your cart is empty</h1>

                <p className="mb-8 max-w-md text-muted">
                    You haven't added any medicines or blood units yet. Browse the shop and add what you need.
                </p>

                <Link
                    href="/shop"
                    className="rounded-lg bg-primary px-8 py-3.5 font-semibold text-primary-foreground transition hover:bg-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                    Browse the shop
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background px-4 py-10 text-foreground sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl">
                <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/shop"
                            aria-label="Back to shop"
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-surface text-muted transition hover:bg-surface-secondary hover:text-foreground sm:h-11 sm:w-11"
                        >
                            <ArrowLeft size={18} />
                        </Link>

                        <h1 className="text-xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                            Shopping cart
                        </h1>
                    </div>

                    <span className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground sm:text-sm">
                        {items.length} {items.length === 1 ? "item" : "items"}
                    </span>
                </div>

                <div className="flex flex-col items-start gap-8 lg:flex-row">
                    <div className="w-full space-y-4 lg:w-2/3">
                        {items.map((item: any) => {
                            const details = getItemDetails(item);
                            const lineTotal = details.price * item.quantity;
                            const Icon = details.isBlood ? Droplets : Pill;
                            const itemId = item.item_id?._id || item.item_id;

                            return (
                                <div
                                    key={`${itemId}-${item.blood_group ?? "na"}`}
                                    className={`rounded-xl border border-border border-l-4 bg-surface p-4 transition hover:border-primary/40 sm:p-5 ${details.isBlood ? "border-l-danger" : "border-l-primary"
                                        }`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                                            <div
                                                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg sm:h-14 sm:w-14 ${details.isBlood
                                                    ? "bg-danger/10 text-danger"
                                                    : "bg-accent text-primary"
                                                    }`}
                                            >
                                                <Icon size={24} />
                                            </div>

                                            <div className="min-w-0">
                                                <span
                                                    className={`mb-1 inline-block rounded px-2 py-0.5 text-xs font-semibold ${details.isBlood
                                                        ? "bg-danger/10 text-danger"
                                                        : "bg-accent text-accent-foreground"
                                                        }`}
                                                >
                                                    {details.type}
                                                </span>

                                                <h2 className="truncate text-base font-bold leading-tight text-foreground sm:text-lg">
                                                    {details.name}
                                                </h2>

                                                <p className="mt-0.5 text-xs text-muted sm:text-sm">
                                                    {details.manufacturer}
                                                </p>

                                                <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                                                    {formatINR(details.price)} each
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => updateItemQuantity(itemId, item.blood_group, "remove")}
                                            className="flex shrink-0 items-center gap-1 rounded-lg border border-border bg-surface-secondary p-1.5 text-xs text-muted-foreground transition hover:border-danger/30 hover:bg-danger/10 hover:text-danger sm:text-sm"
                                            aria-label="Remove item"
                                        >
                                            <Trash2 size={15} />
                                            <span className="hidden sm:inline">Remove</span>
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between border-t border-border pt-3">
                                        <div className="flex items-center rounded-lg border border-border bg-surface-secondary p-1">
                                            <button
                                                onClick={() => updateItemQuantity(itemId, item.blood_group, "decrease")}
                                                aria-label="Decrease quantity"
                                                className="flex h-8 w-8 items-center justify-center rounded-md text-muted transition hover:bg-surface hover:text-foreground active:scale-95"
                                            >
                                                <Minus size={14} />
                                            </button>

                                            <span className="w-8 text-center text-sm font-bold tabular-nums text-foreground sm:w-10">
                                                {item.quantity}
                                            </span>

                                            <button
                                                onClick={() => updateItemQuantity(itemId, item.blood_group, "increase")}
                                                aria-label="Increase quantity"
                                                className="flex h-8 w-8 items-center justify-center rounded-md text-muted transition hover:bg-surface hover:text-foreground active:scale-95"
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>

                                        <span className="text-lg font-extrabold tabular-nums text-foreground sm:text-xl">
                                            {formatINR(lineTotal)}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <aside className="w-full lg:sticky lg:top-24 lg:w-1/3">
                        <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
                            <div className="flex items-center gap-3 border-b border-border bg-surface-secondary px-6 py-4">
                                <Receipt size={20} className="text-primary" />
                                <h3 className="text-lg font-bold text-foreground">Order summary</h3>
                            </div>

                            <div className="p-6">
                                <div className="space-y-3.5 border-b border-dashed border-border pb-5">
                                    <div className="flex justify-between text-sm text-muted sm:text-base">
                                        <span>
                                            Subtotal ({totalUnits} {totalUnits === 1 ? "unit" : "units"})
                                        </span>
                                        <span className="font-semibold tabular-nums text-foreground">
                                            {formatINR(subtotal)}
                                        </span>
                                    </div>

                                    <div className="flex justify-between text-sm text-muted sm:text-base">
                                        <span className="flex items-center gap-2">
                                            <Truck size={16} className="text-muted-foreground" />
                                            Delivery
                                        </span>
                                        <span className="font-semibold text-success">Free</span>
                                    </div>
                                </div>

                                <div className="mb-7 pt-5">
                                    <div className="flex items-end justify-between">
                                        <span className="text-base font-bold text-foreground sm:text-lg">Total</span>
                                        <span className="text-3xl font-extrabold tracking-tight text-foreground tabular-nums sm:text-4xl">
                                            {formatINR(subtotal)}
                                        </span>
                                    </div>

                                    <p className="mt-1.5 text-right text-xs text-muted-foreground">
                                        Inclusive of all taxes
                                    </p>
                                </div>

                                <button className="w-full rounded-lg bg-primary py-3.5 text-base font-bold text-primary-foreground transition hover:bg-primary-hover active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:py-4 sm:text-lg">
                                    Proceed to checkout
                                </button>

                                <div className="mt-5 flex items-center justify-center gap-2 text-xs text-muted sm:text-sm">
                                    <ShieldCheck size={18} className="text-primary" />
                                    Safe and secure payments
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}