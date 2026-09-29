"use client";

import Link from "next/link";
import { CheckCircle2, Package, ShoppingBag } from "lucide-react";

export default function OrderSuccessPage() {
    return (
        <main className="flex min-h-[80vh] items-center justify-center bg-background px-6 py-12">
            <div className="w-full max-w-lg rounded-xl border border-border bg-surface p-8 text-center sm:p-10">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
                    <CheckCircle2
                        size={42}
                        className="text-success"
                    />
                </div>

                <h1 className="mt-6 text-3xl font-extrabold text-foreground">
                    Payment successful
                </h1>

                <p className="mx-auto mt-3 max-w-md text-muted">
                    Your payment has been verified and your order
                    has been confirmed successfully.
                </p>

                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                    <Link
                        href="/shop"
                        className="flex items-center justify-center gap-2 rounded-lg border border-border bg-surface-secondary px-4 py-3 font-semibold text-foreground transition hover:bg-background"
                    >
                        <ShoppingBag size={18} />
                        Continue shopping
                    </Link>

                    <Link
                        href="/shop/orders"
                        className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 font-semibold text-primary-foreground transition hover:bg-primary-hover"
                    >
                        <Package size={18} />
                        View orders
                    </Link>
                </div>
            </div>
        </main>
    );
}