"use client";

import { useEffect, useState } from "react";
import { CreditCard, Loader2, Package, Sparkles } from "lucide-react";
import SubscriptionPlans from "./SubscriptionPlans";
import CurrentSubscription from "./CurrentSubscription";

type Tab = "plans" | "current";

type Subscription = {
    _id: string;
    plan_name: string;
    status: "pending" | "active" | "expired" | "cancelled";
    price: number;
    currency: string;
    token_limit: number;
    tokens_used: number;
    features: string[];
    supported_features: string[];
    start_date?: string;
    end_date?: string;
};

export default function SubscriptionPage() {
    const [activeTab, setActiveTab] = useState<Tab>("plans");
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchSubscription = async () => {
        try {
            const res = await fetch("/api/subscription/current", {
                cache: "no-store",
            });

            const data = await res.json();

            if (res.ok) {
                setSubscription(data.subscription);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubscription();
    }, []);

    return (
        <main className="min-h-screen bg-background px-4 py-10 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl">
                <div className="mx-auto max-w-2xl text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                        <Sparkles className="h-6 w-6" />
                    </div>

                    <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                        SOMATIC Subscription
                    </h1>

                    <p className="mt-3 text-muted">
                        Manage your subscription and get access to SOMATIC's AI-powered
                        healthcare features.
                    </p>
                </div>

                <div className="mx-auto mt-8 flex w-fit items-center gap-1 rounded-lg border border-border bg-surface p-1">
                    <button
                        type="button"
                        onClick={() => setActiveTab("plans")}
                        className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition ${activeTab === "plans"
                            ? "bg-primary text-primary-foreground"
                            : "text-muted hover:bg-surface-secondary hover:text-foreground"
                            }`}
                    >
                        <Package className="h-4 w-4" />
                        Plans
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab("current")}
                        className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition ${activeTab === "current"
                            ? "bg-primary text-primary-foreground"
                            : "text-muted hover:bg-surface-secondary hover:text-foreground"
                            }`}
                    >
                        <CreditCard className="h-4 w-4" />
                        My Subscription
                    </button>
                </div>

                <div className="mt-10">
                    {activeTab === "plans" ? (
                        <SubscriptionPlans
                            hasActiveSubscription={!!subscription}
                            onPurchaseSuccess={async () => {
                                await fetchSubscription();
                                setActiveTab("current");
                            }}
                        />
                    ) : loading ? (
                        <div className="flex justify-center py-24">
                            <Loader2 className="h-7 w-7 animate-spin text-primary" />
                        </div>
                    ) : (
                        <CurrentSubscription
                            subscription={subscription}
                            onViewPlans={() => setActiveTab("plans")}
                        />
                    )}
                </div>
            </div>
        </main>
    );
}