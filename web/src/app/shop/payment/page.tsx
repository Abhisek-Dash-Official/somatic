"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Script from "next/script";

import { ArrowLeft, CheckCircle2, Loader2, MapPin, ShieldCheck, ShoppingBag, Truck } from "lucide-react";

import { useCartStore } from "@/store/useCartStore";

declare global {
    interface Window {
        Razorpay: any;
    }
}

const formatINR = (amount: number) => `₹${amount.toLocaleString("en-IN")}`;

type Address = {
    street: string;
    city: string;
    state: string;
    pincode: string;
};

export default function PaymentPage() {
    const { items, total_amount, isLoading, fetchCart } = useCartStore();

    const [address, setAddress] = useState<Address>({
        street: "",
        city: "",
        state: "",
        pincode: "",
    });

    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    const calculatedTotal = useMemo(() => {
        return items.reduce((total, item: any) => {
            if (item.item_type === "Medicine") {
                const price = item.item_id?.pricing?.price ?? item.item_id?.pricing?.mrp ?? 0;

                return total + price * item.quantity;
            }

            if (item.item_type === "BloodBank") {
                const bloodItem = item.item_id?.inventory?.find((inventory: any) => inventory.blood_group === item.blood_group);

                return (total + (bloodItem?.price_per_unit ?? 0) * item.quantity);
            }

            return total;
        }, 0);
    }, [items]);

    const displayTotal = calculatedTotal || total_amount || 0;

    const updateAddress = (
        field: keyof Address,
        value: string,
    ) => {
        setAddress((current) => ({
            ...current,
            [field]: value,
        }));
    };

    const handlePayment = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        setError("");

        if (!items.length) {
            setError("Your cart is empty.");
            return;
        }

        if (
            !address.street.trim() ||
            !address.city.trim() ||
            !address.state.trim() ||
            !address.pincode.trim()
        ) {
            setError("Please complete your delivery address.");
            return;
        }

        if (!/^\d{6}$/.test(address.pincode.trim())) {
            setError("Please enter a valid 6-digit pincode.");
            return;
        }

        if (!window.Razorpay) {
            setError("Payment system is still loading. Please try again.",);
            return;
        }

        setIsProcessing(true);

        try {
            const createResponse = await fetch("/api/shop/payment/create-order",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },

                    body: JSON.stringify({
                        shipping_address: address,
                    }),
                },
            );

            const createData = await createResponse.json();

            if (!createResponse.ok) {
                setError(createData.error || "Unable to create payment order.");
            }

            const { order_id, razorpay_order_id, amount, currency, key_id } = createData;

            const options = {
                key: key_id,
                amount,
                currency,
                name: "SOMATIC",
                description: "Healthcare Shop Order",
                order_id: razorpay_order_id,
                theme: {
                    color: "#10b981",
                },

                handler: async function (response: any) {
                    try {
                        const verifyResponse = await fetch("/api/shop/payment/verify",
                            {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                },

                                body: JSON.stringify({
                                    order_id,
                                    razorpay_order_id: response.razorpay_order_id,
                                    razorpay_payment_id: response.razorpay_payment_id,
                                    razorpay_signature: response.razorpay_signature,
                                }),
                            },
                        );

                        const verifyData = await verifyResponse.json();

                        if (!verifyResponse.ok) {
                            throw new Error(
                                verifyData.error ||
                                "Payment verification failed.",
                            );
                        }

                        window.location.href = `/shop/order/success?order_id=${order_id}`;
                    } catch (verificationError: any) {
                        setError(
                            verificationError.message ||
                            "Payment verification failed.",
                        );

                        setIsProcessing(false);
                    }
                },

                modal: { ondismiss: function () { setIsProcessing(false); } },
                prefill: { name: "", email: "", contact: "" },
                notes: { somatic_order_id: order_id, },
            };

            const razorpay = new window.Razorpay(options);

            razorpay.on(
                "payment.failed",
                function (response: any) {
                    console.error(
                        "Razorpay payment failed:",
                        response,
                    );

                    setError(response?.error?.description || "Payment failed. Please try again.");
                    setIsProcessing(false);
                },
            );

            razorpay.open();
        } catch (paymentError: any) {
            console.error("Payment initialization error:", paymentError,);

            setError(paymentError.message || "Unable to start payment.");
            setIsProcessing(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex min-h-[80vh] items-center justify-center bg-background">
                <Loader2
                    className="animate-spin text-primary"
                    size={32}
                />
            </div>
        );
    }

    if (!items.length) {
        return (
            <div className="flex min-h-[80vh] flex-col items-center justify-center bg-background px-6 text-center">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-border bg-accent">
                    <ShoppingBag
                        size={34}
                        className="text-primary"
                    />
                </div>

                <h1 className="text-2xl font-bold text-foreground">
                    Your cart is empty
                </h1>

                <p className="mt-2 max-w-md text-muted">
                    Add medicines or blood units to your cart
                    before continuing to payment.
                </p>

                <Link
                    href="/shop"
                    className="mt-6 rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground transition hover:bg-primary-hover"
                >
                    Back to shop
                </Link>
            </div>
        );
    }

    return (
        <>
            <Script
                src="https://checkout.razorpay.com/v1/checkout.js"
                strategy="afterInteractive"
            />

            <main className="min-h-screen bg-background px-4 py-8 text-foreground sm:px-6 lg:px-8">
                <div className="mx-auto max-w-6xl">
                    <div className="mb-8 flex items-center gap-3">
                        <Link
                            href="/shop/cart"
                            aria-label="Back to cart"
                            className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface text-muted transition hover:bg-surface-secondary hover:text-foreground"
                        >
                            <ArrowLeft size={18} />
                        </Link>

                        <div>
                            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                                Checkout
                            </h1>

                            <p className="mt-1 text-sm text-muted">
                                Complete your delivery details and payment.
                            </p>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-6 flex items-start gap-3 rounded-lg border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
                            <span>{error}</span>
                        </div>
                    )}

                    <form
                        onSubmit={handlePayment}
                        className="grid gap-8 lg:grid-cols-[1fr_380px]"
                    >
                        <section className="space-y-6">
                            <div className="rounded-xl border border-border bg-surface">
                                <div className="flex items-center gap-3 border-b border-border bg-surface-secondary px-5 py-4">
                                    <MapPin
                                        size={20}
                                        className="text-primary"
                                    />

                                    <div>
                                        <h2 className="font-bold text-foreground">
                                            Delivery address
                                        </h2>

                                        <p className="text-xs text-muted">
                                            Where should we deliver your order?
                                        </p>
                                    </div>
                                </div>

                                <div className="grid gap-4 p-5 sm:grid-cols-2">
                                    <div className="sm:col-span-2">
                                        <label className="mb-1.5 block text-sm font-semibold text-foreground">
                                            Street address
                                        </label>

                                        <input
                                            type="text"
                                            value={address.street}
                                            onChange={(event) =>
                                                updateAddress(
                                                    "street",
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="House no., street, area"
                                            className="w-full rounded-lg border border-border bg-background px-3.5 py-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-1.5 block text-sm font-semibold text-foreground">
                                            City
                                        </label>

                                        <input
                                            type="text"
                                            value={address.city}
                                            onChange={(event) =>
                                                updateAddress(
                                                    "city",
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="City"
                                            className="w-full rounded-lg border border-border bg-background px-3.5 py-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-1.5 block text-sm font-semibold text-foreground">
                                            State
                                        </label>

                                        <input
                                            type="text"
                                            value={address.state}
                                            onChange={(event) => updateAddress("state", event.target.value,)}
                                            placeholder="State"
                                            className="w-full rounded-lg border border-border bg-background px-3.5 py-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-1.5 block text-sm font-semibold text-foreground">
                                            Pincode
                                        </label>

                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={6}
                                            value={address.pincode}
                                            onChange={(event) =>
                                                updateAddress("pincode", event.target.value.replace(/\D/g, "",),)}
                                            placeholder="6-digit pincode"
                                            className="w-full rounded-lg border border-border bg-background px-3.5 py-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-xl border border-border bg-surface">
                                <div className="flex items-center gap-3 border-b border-border bg-surface-secondary px-5 py-4">
                                    <ShieldCheck
                                        size={20}
                                        className="text-primary"
                                    />

                                    <div>
                                        <h2 className="font-bold text-foreground">
                                            Payment method
                                        </h2>

                                        <p className="text-xs text-muted">
                                            Secure payment powered by Razorpay
                                        </p>
                                    </div>
                                </div>

                                <div className="p-5">
                                    <div className="flex items-start gap-3 rounded-lg border border-primary/30 bg-accent p-4">
                                        <CheckCircle2
                                            size={20}
                                            className="mt-0.5 shrink-0 text-primary"
                                        />

                                        <div>
                                            <p className="font-semibold text-foreground">
                                                Online payment
                                            </p>

                                            <p className="mt-1 text-sm text-muted">
                                                Pay securely using UPI, cards,
                                                net banking and supported payment
                                                methods.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 rounded-lg border border-border bg-surface p-4 text-sm text-muted">
                                <Truck
                                    size={18}
                                    className="mt-0.5 shrink-0 text-primary"
                                />

                                <p>
                                    Your order will be processed after
                                    successful payment verification.
                                </p>
                            </div>
                        </section>

                        <aside className="h-fit lg:sticky lg:top-24">
                            <div className="overflow-hidden rounded-xl border border-border bg-surface">
                                <div className="border-b border-border bg-surface-secondary px-5 py-4">
                                    <h2 className="font-bold text-foreground">
                                        Order summary
                                    </h2>
                                </div>

                                <div className="max-h-90 space-y-4 overflow-y-auto p-5">
                                    {items.map((item: any) => {
                                        const isMedicine =
                                            item.item_type === "Medicine";

                                        let name = "Unknown item";
                                        let price = 0;

                                        if (isMedicine) {
                                            name =
                                                item.item_id?.name ||
                                                "Unknown medicine";

                                            price =
                                                item.item_id?.pricing?.price ??
                                                item.item_id?.pricing?.mrp ??
                                                0;
                                        } else {
                                            name =
                                                item.item_id?.name ||
                                                "Blood bank";

                                            const bloodItem =
                                                item.item_id?.inventory?.find(
                                                    (inventory: any) =>
                                                        inventory.blood_group ===
                                                        item.blood_group,
                                                );

                                            price =
                                                bloodItem?.price_per_unit ?? 0;
                                        }

                                        return (
                                            <div
                                                key={`${item.item_id?._id || item.item_id}-${item.blood_group || "default"}`}
                                                className="flex items-start justify-between gap-4"
                                            >
                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-semibold text-foreground">
                                                        {name}
                                                    </p>

                                                    {item.blood_group && (
                                                        <p className="mt-0.5 text-xs text-muted">
                                                            Blood group:{" "}
                                                            {item.blood_group}
                                                        </p>
                                                    )}

                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                        ₹
                                                        {price.toLocaleString(
                                                            "en-IN",
                                                        )}{" "}
                                                        × {item.quantity}
                                                    </p>
                                                </div>

                                                <span className="shrink-0 text-sm font-bold text-foreground">
                                                    {formatINR(
                                                        price * item.quantity,
                                                    )}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="border-t border-border p-5">
                                    <div className="mb-2 flex justify-between text-sm text-muted">
                                        <span>Subtotal</span>

                                        <span className="font-semibold text-foreground">
                                            {formatINR(displayTotal)}
                                        </span>
                                    </div>

                                    <div className="mb-4 flex justify-between text-sm text-muted">
                                        <span>Delivery</span>

                                        <span className="font-semibold text-success">
                                            Free
                                        </span>
                                    </div>

                                    <div className="flex items-end justify-between border-t border-dashed border-border pt-4">
                                        <span className="font-bold text-foreground">
                                            Total
                                        </span>

                                        <span className="text-2xl font-extrabold text-foreground">
                                            {formatINR(displayTotal)}
                                        </span>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isProcessing}
                                        className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3.5 font-bold text-primary-foreground transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {isProcessing ? (
                                            <>
                                                <Loader2
                                                    size={18}
                                                    className="animate-spin"
                                                />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <ShieldCheck size={18} />
                                                Pay {formatINR(displayTotal)}
                                            </>
                                        )}
                                    </button>

                                    <p className="mt-3 text-center text-xs text-muted-foreground">
                                        Secure checkout powered by Razorpay
                                    </p>
                                </div>
                            </div>
                        </aside>
                    </form>
                </div>
            </main>
        </>
    );
}