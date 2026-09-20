"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingCart, ChevronRight, X, Plus, Minus, Trash2 } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";

export default function FloatingCart() {
    const { items, total_amount, fetchCart, updateItemQuantity, isLoading } = useCartStore();
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    const getItemDetails = (item: any) => {
        if (item.item_type === "Medicine") {
            return {
                name: item.item_id?.name || "Unknown Medicine",
                price: item.item_id?.pricing?.price || item.item_id?.pricing?.mrp || 0,
                type: "Medicine",
            };
        } else if (item.item_type === "BloodBank") {
            const inventoryItem = item.item_id?.inventory?.find(
                (inv: any) => inv.blood_group === item.blood_group
            );
            return {
                name: `${item.item_id?.name} (${item.blood_group})`,
                price: inventoryItem?.price_per_unit || 0,
                type: "Blood Unit",
            };
        }
        return { name: "Unknown", price: 0, type: "Unknown" };
    };

    if (totalItems === 0) return null;

    return (
        <>
            <div
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-[90%] max-w-sm bg-gray-900 text-white rounded-full shadow-2xl p-3 flex items-center justify-between z-40 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:bg-black border border-gray-700 backdrop-blur-md"
            >
                <div className="flex items-center gap-4 pl-2">
                    <div className="relative">
                        <ShoppingCart size={24} className="text-white" />
                        <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-gray-900">
                            {totalItems}
                        </span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold">View Cart</span>
                        <span className="text-xs text-gray-300">₹{total_amount}</span>
                    </div>
                </div>
                <div className="bg-blue-600 p-2 rounded-full text-white">
                    <ChevronRight size={20} />
                </div>
            </div>

            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm transition-opacity"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <div
                className={`fixed top-0 right-0 h-full w-full sm:w-100 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                {/* Header */}
                <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <ShoppingCart size={24} className="text-blue-600" /> My Cart
                    </h2>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors text-gray-600"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Items List */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    {items.map((item, index) => {
                        const details = getItemDetails(item);
                        return (
                            <div key={index} className="flex gap-4 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                                <div className="flex-1 flex flex-col justify-between">
                                    <div>
                                        <h3 className="font-semibold text-gray-800 text-sm line-clamp-2">{details.name}</h3>
                                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md mt-1 inline-block">
                                            {details.type}
                                        </span>
                                    </div>
                                    <div className="text-blue-600 font-bold text-sm mt-2">
                                        ₹{details.price} <span className="text-xs text-gray-400 font-normal">/ unit</span>
                                    </div>
                                </div>

                                {/* + / - Controls */}
                                <div className="flex flex-col items-end justify-between">
                                    <button
                                        onClick={() => updateItemQuantity(item.item_id._id, item.blood_group, "remove")}
                                        className="text-red-400 hover:text-red-600 p-1"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                    <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-full px-2 py-1">
                                        <button
                                            onClick={() => updateItemQuantity(item.item_id._id, item.blood_group, "decrease")}
                                            disabled={isLoading}
                                            className="text-gray-500 hover:text-black disabled:opacity-50"
                                        >
                                            <Minus size={14} />
                                        </button>
                                        <span className="text-sm font-semibold w-4 text-center">{item.quantity}</span>
                                        <button
                                            onClick={() => updateItemQuantity(item.item_id._id, item.blood_group, "increase")}
                                            disabled={isLoading}
                                            className="text-gray-500 hover:text-black disabled:opacity-50"
                                        >
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-gray-100 bg-white">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-500">Subtotal</span>
                        <span className="text-xl font-bold text-gray-800">₹{total_amount}</span>
                    </div>
                    <Link
                        href="/shop/cart"
                        onClick={() => setIsOpen(false)}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex justify-center items-center gap-2 transition-colors shadow-lg shadow-blue-200"
                    >
                        Checkout <ChevronRight size={20} />
                    </Link>
                </div>
            </div>
        </>
    );
}