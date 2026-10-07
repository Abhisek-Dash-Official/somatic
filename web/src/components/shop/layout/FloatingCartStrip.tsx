"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    ChevronRight,
    Minus,
    Plus,
    ShoppingCart,
    Trash2,
    X,
} from "lucide-react";
import { useCartStore } from "@/store/useCartStore";

export default function FloatingCart() {
    const {
        items,
        total_amount,
        fetchCart,
        updateItemQuantity,
        isLoading,
    } = useCartStore();

    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    const getItemDetails = (item: any) => {
        if (item.item_type === "Medicine") {
            return {
                name: item.item_id?.name || "Unknown Medicine",
                price:
                    item.item_id?.pricing?.price ||
                    item.item_id?.pricing?.mrp ||
                    0,
                type: "Medicine",
            };
        }

        if (item.item_type === "BloodBank") {
            const inventoryItem = item.item_id?.inventory?.find(
                (inv: any) => inv.blood_group === item.blood_group,
            );

            return {
                name: `${item.item_id?.name} (${item.blood_group})`,
                price: inventoryItem?.price_per_unit || 0,
                type: "Blood Unit",
            };
        }

        return {
            name: "Unknown",
            price: 0,
            type: "Unknown",
        };
    };

    if (totalItems === 0) return null;

    return (
        <>
            <div
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 left-1/2 z-40 flex w-[90%] max-w-sm -translate-x-1/2 cursor-pointer items-center justify-between rounded-full border border-border bg-surface p-3 text-foreground shadow-xl transition-transform hover:scale-[1.02]"
            >
                <div className="flex items-center gap-4 pl-2">
                    <div className="relative">
                        <ShoppingCart size={24} className="text-primary" />

                        <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full border-2 border-surface bg-primary text-[10px] font-bold text-primary-foreground">
                            {totalItems}
                        </span>
                    </div>

                    <div className="flex flex-col">
                        <span className="text-sm font-semibold">View Cart</span>
                        <span className="text-xs text-muted">₹{total_amount}</span>
                    </div>
                </div>

                <div className="rounded-full bg-primary p-2 text-primary-foreground">
                    <ChevronRight size={20} />
                </div>
            </div>

            {isOpen && (
                <div
                    className="fixed inset-0 z-50 bg-black/50"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <div
                className={`fixed right-0 top-0 z-50 flex h-full w-full flex-col border-l border-border bg-background shadow-2xl transition-transform duration-300 ease-in-out sm:w-100 ${isOpen ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                <div className="flex items-center justify-between border-b border-border bg-surface px-5 py-4">
                    <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
                        <ShoppingCart size={24} className="text-primary" />
                        My Cart
                    </h2>

                    <button
                        onClick={() => setIsOpen(false)}
                        className="rounded-full border border-border bg-surface-secondary p-2 text-muted transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 space-y-4 overflow-y-auto p-5">
                    {items.map((item, index) => {
                        const details = getItemDetails(item);

                        return (
                            <div
                                key={index}
                                className="flex gap-4 rounded-2xl border border-border bg-surface p-4"
                            >
                                <div className="flex flex-1 flex-col justify-between">
                                    <div>
                                        <h3 className="line-clamp-2 text-sm font-semibold text-foreground">
                                            {details.name}
                                        </h3>

                                        <span className="mt-1 inline-block rounded-full bg-accent px-2 py-0.5 text-xs text-accent-foreground">
                                            {details.type}
                                        </span>
                                    </div>

                                    <div className="mt-2 text-sm font-bold text-primary">
                                        ₹{details.price}{" "}
                                        <span className="text-xs font-normal text-muted-foreground">
                                            / unit
                                        </span>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end justify-between">
                                    <button
                                        onClick={() =>
                                            updateItemQuantity(
                                                item.item_id._id,
                                                item.blood_group,
                                                "remove",
                                            )
                                        }
                                        className="rounded-xl p-1 text-danger transition-colors hover:text-danger/80"
                                    >
                                        <Trash2 size={16} />
                                    </button>

                                    <div className="flex items-center gap-3 rounded-full border border-border bg-surface-secondary px-2 py-1">
                                        <button
                                            onClick={() =>
                                                updateItemQuantity(
                                                    item.item_id._id,
                                                    item.blood_group,
                                                    "decrease",
                                                )
                                            }
                                            disabled={isLoading}
                                            className="text-muted transition-colors hover:text-foreground disabled:opacity-50"
                                        >
                                            <Minus size={14} />
                                        </button>

                                        <span className="w-4 text-center text-sm font-semibold text-foreground">
                                            {item.quantity}
                                        </span>

                                        <button
                                            onClick={() =>
                                                updateItemQuantity(
                                                    item.item_id._id,
                                                    item.blood_group,
                                                    "increase",
                                                )
                                            }
                                            disabled={isLoading}
                                            className="text-muted transition-colors hover:text-foreground disabled:opacity-50"
                                        >
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="border-t border-border bg-surface p-5">
                    <div className="mb-4 flex items-center justify-between">
                        <span className="text-muted">Subtotal</span>
                        <span className="text-xl font-bold text-foreground">
                            ₹{total_amount}
                        </span>
                    </div>

                    <Link
                        href="/shop/cart"
                        onClick={() => setIsOpen(false)}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 font-bold text-primary-foreground transition-colors hover:bg-primary-hover"
                    >
                        Checkout
                        <ChevronRight size={20} />
                    </Link>
                </div>
            </div>
        </>
    );
}