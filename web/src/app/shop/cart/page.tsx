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

const pageStyle = {
    backgroundColor: "#edf3f5",
    backgroundImage:
        "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48'%3E%3Cpath d='M24 19v10M19 24h10' stroke='%230f766e' stroke-opacity='0.09' stroke-width='2' stroke-linecap='round' fill='none'/%3E%3C/svg%3E\")",
};

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
        } else if (item.item_type === "BloodBank") {
            const inventoryItem = item.item_id?.inventory?.find(
                (inv: any) => inv.blood_group === item.blood_group
            );
            return {
                name: `${item.item_id?.name || "Blood Bank"}`,
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
            <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8" style={pageStyle}>
                <div className="max-w-6xl mx-auto space-y-4 animate-pulse">
                    <div className="h-10 w-64 rounded-lg bg-slate-300/60 mb-8" />
                    <div className="h-32 rounded-xl bg-white border border-slate-200" />
                    <div className="h-32 rounded-xl bg-white border border-slate-200" />
                </div>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center" style={pageStyle}>
                <div className="w-24 h-24 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center mb-6">
                    <ShoppingBag size={40} className="text-teal-700" />
                </div>
                <h1 className="text-3xl font-bold text-slate-900 mb-3">Your cart is empty</h1>
                <p className="text-slate-600 mb-8 max-w-md">
                    You haven't added any medicines or blood units yet. Browse the shop and add what you need.
                </p>
                <Link
                    href="/shop"
                    className="bg-blue-600 text-white px-8 py-3.5 rounded-lg font-semibold hover:bg-blue-700 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                    Browse the shop
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8" style={pageStyle}>
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Link
                        href="/shop"
                        aria-label="Back to shop"
                        className="w-11 h-11 flex items-center justify-center rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    >
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Shopping cart</h1>
                    <span className="bg-teal-700 text-white text-sm font-semibold px-3 py-1 rounded-md">
                        {items.length} {items.length === 1 ? "item" : "items"}
                    </span>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    <div className="w-full lg:w-2/3 space-y-3">
                        {items.map((item: any) => {
                            const details = getItemDetails(item);
                            const lineTotal = details.price * item.quantity;
                            const Icon = details.isBlood ? Droplets : Pill;
                            const itemId = item.item_id?._id || item.item_id;

                            return (
                                <div
                                    key={`${itemId}-${item.blood_group ?? "na"}`}
                                    className={`bg-white rounded-xl border border-slate-200 border-l-4 ${details.isBlood ? "border-l-red-500" : "border-l-teal-600"
                                        } p-5 flex flex-col sm:flex-row sm:items-center gap-5`}
                                >
                                    <div
                                        className={`w-14 h-14 shrink-0 rounded-lg flex items-center justify-center ${details.isBlood ? "bg-red-50 text-red-600" : "bg-teal-50 text-teal-700"
                                            }`}
                                    >
                                        <Icon size={26} />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <span
                                            className={`inline-block text-xs font-semibold px-2 py-0.5 rounded mb-1.5 ${details.isBlood ? "bg-red-100 text-red-700" : "bg-teal-100 text-teal-800"
                                                }`}
                                        >
                                            {details.type}
                                        </span>
                                        <h2 className="text-lg font-bold text-slate-900 leading-tight truncate">
                                            {details.name}
                                        </h2>
                                        <p className="text-sm text-slate-600 mt-0.5">{details.manufacturer}</p>
                                        <p className="text-sm text-slate-500 mt-2">{formatINR(details.price)} each</p>
                                    </div>

                                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-4 w-full sm:w-auto">
                                        <div className="flex items-center rounded-lg bg-slate-100 border border-slate-300 p-1">
                                            <button
                                                onClick={() => updateItemQuantity(itemId, item.blood_group, "decrease")}
                                                aria-label="Decrease quantity"
                                                className="w-9 h-9 flex items-center justify-center text-slate-700 hover:bg-white rounded-md transition active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                                            >
                                                <Minus size={16} />
                                            </button>
                                            <span className="w-10 text-center font-bold text-slate-900 tabular-nums">
                                                {item.quantity}
                                            </span>
                                            <button
                                                onClick={() => updateItemQuantity(itemId, item.blood_group, "increase")}
                                                aria-label="Increase quantity"
                                                className="w-9 h-9 flex items-center justify-center text-slate-700 hover:bg-white rounded-md transition active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                                            >
                                                <Plus size={16} />
                                            </button>
                                        </div>

                                        <div className="flex sm:flex-col items-center sm:items-end gap-4 sm:gap-2">
                                            <span className="text-xl font-extrabold text-slate-900 tabular-nums">
                                                {formatINR(lineTotal)}
                                            </span>
                                            <button
                                                onClick={() => updateItemQuantity(itemId, item.blood_group, "remove")}
                                                className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-red-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded"
                                            >
                                                <Trash2 size={16} />
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <aside className="w-full lg:w-1/3 lg:sticky lg:top-24">
                        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                            <div className="bg-[#0b1120] text-white px-6 py-4 flex items-center gap-3">
                                <Receipt size={20} className="text-teal-300" />
                                <h3 className="text-lg font-bold">Order summary</h3>
                            </div>

                            <div className="p-6">
                                <div className="space-y-3.5 pb-5 border-b border-dashed border-slate-300">
                                    <div className="flex justify-between text-slate-600">
                                        <span>
                                            Subtotal ({totalUnits} {totalUnits === 1 ? "unit" : "units"})
                                        </span>
                                        <span className="font-semibold text-slate-900 tabular-nums">
                                            {formatINR(subtotal)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-slate-600">
                                        <span className="flex items-center gap-2">
                                            <Truck size={16} className="text-slate-500" />
                                            Delivery
                                        </span>
                                        <span className="text-teal-700 font-semibold">Free</span>
                                    </div>
                                </div>

                                <div className="pt-5 mb-7">
                                    <div className="flex justify-between items-end">
                                        <span className="text-slate-900 font-bold">Total</span>
                                        <span className="text-4xl font-extrabold text-slate-900 tabular-nums tracking-tight">
                                            {formatINR(subtotal)}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1.5 text-right">Inclusive of all taxes</p>
                                </div>

                                <button className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-blue-700 active:scale-[0.98] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                                    Proceed to checkout
                                </button>

                                <div className="mt-5 flex items-center justify-center gap-2 text-sm text-slate-600">
                                    <ShieldCheck size={18} className="text-teal-700" />
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