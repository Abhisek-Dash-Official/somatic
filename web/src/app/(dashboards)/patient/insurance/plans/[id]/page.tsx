"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Loader2, ShieldCheck } from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "react-toastify";

const parseResponse = async (response: Response) => {
    const text = await response.text();

    if (!text.trim()) {
        throw new Error(`Request returned an empty response (${response.status})`);
    }

    try {
        return JSON.parse(text);
    } catch {
        throw new Error(`Request returned an invalid response (${response.status})`);
    }
};

const frequencyLabels: Record<string, string> = {
    monthly: "Monthly",
    quarterly: "Quarterly",
    half_yearly: "Half Yearly",
    yearly: "Yearly",
};

export default function InsurancePlanDetailsPage() {
    const params = useParams();
    const [plan, setPlan] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadPlan = async () => {
            try {
                const response = await fetch("/api/insurance/plans");
                const data = await parseResponse(response);

                if (!response.ok) {
                    throw new Error(data?.error || "Failed to load insurance plans");
                }

                const foundPlan = (data.plans || []).find(
                    (item: any) => item._id?.toString() === params.id?.toString(),
                );

                if (!foundPlan) {
                    throw new Error("Insurance plan not found");
                }

                setPlan(foundPlan);
            } catch (error: any) {
                console.error("Insurance plan details error:", error);
                toast.error(error?.message || "Failed to load insurance plan");
            } finally {
                setLoading(false);
            }
        };

        if (params.id) {
            loadPlan();
        }
    }, [params.id]);

    if (loading) {
        return (
            <main className="flex min-h-[70vh] items-center justify-center">
                <Loader2 className="animate-spin text-primary" size={32} />
            </main>
        );
    }

    if (!plan) {
        return (
            <main className="mx-auto flex min-h-[70vh] w-full max-w-3xl items-center justify-center px-4">
                <div className="w-full rounded-xl border border-border bg-surface p-8 text-center">
                    <ShieldCheck className="mx-auto text-muted-foreground" size={40} />
                    <h1 className="mt-4 text-xl font-semibold text-foreground">Insurance plan not found</h1>
                    <p className="mt-2 text-sm text-muted">The selected insurance plan is no longer available.</p>

                    <Link
                        href="/patient/insurance#available-plans"
                        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:bg-primary-hover"
                    >
                        <ArrowLeft size={17} />
                        Back to Plans
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
            <Link
                href="/patient/insurance#available-plans"
                className="inline-flex items-center gap-2 text-sm text-muted transition hover:text-foreground"
            >
                <ArrowLeft size={17} />
                Back to Insurance Plans
            </Link>

            <section className="mt-6 overflow-hidden rounded-xl border border-border bg-surface">
                <div className="border-b border-border bg-surface-secondary p-6 sm:p-8">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex items-start gap-4">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <ShieldCheck size={28} />
                            </div>

                            <div>
                                <p className="text-sm font-medium text-primary">SOMATIC Insurance</p>
                                <h1 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">{plan.name}</h1>
                                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                                    {plan.description || "Health insurance coverage designed to support your medical needs."}
                                </p>
                            </div>
                        </div>

                        {plan.is_active && (
                            <span className="w-fit rounded-full border border-success/20 bg-success/10 px-3 py-1.5 text-xs font-medium text-success">
                                Available
                            </span>
                        )}
                    </div>
                </div>

                <div className="grid gap-4 p-6 sm:grid-cols-3 sm:p-8">
                    <div className="rounded-lg border border-border bg-surface-secondary p-5">
                        <p className="text-xs text-muted-foreground">Coverage Amount</p>
                        <p className="mt-2 text-2xl font-bold text-foreground">
                            ₹{Number(plan.coverage_amount || 0).toLocaleString("en-IN")}
                        </p>
                    </div>

                    <div className="rounded-lg border border-border bg-surface-secondary p-5">
                        <p className="text-xs text-muted-foreground">Premium</p>
                        <p className="mt-2 text-2xl font-bold text-foreground">
                            ₹{Number(plan.premium_amount || 0).toLocaleString("en-IN")}
                        </p>
                        <p className="mt-1 text-xs text-muted">
                            {frequencyLabels[plan.premium_frequency] || plan.premium_frequency}
                        </p>
                    </div>

                    <div className="rounded-lg border border-border bg-surface-secondary p-5">
                        <p className="text-xs text-muted-foreground">Policy Term</p>
                        <p className="mt-2 text-2xl font-bold text-foreground">
                            {plan.policy_term_years} {plan.policy_term_years === 1 ? "Year" : "Years"}
                        </p>
                    </div>
                </div>

                <div className="border-t border-border p-6 sm:p-8">
                    <h2 className="text-lg font-semibold text-foreground">Plan Benefits</h2>

                    {plan.features?.length > 0 ? (
                        <div className="mt-5 grid gap-3 sm:grid-cols-2">
                            {plan.features.map((feature: string, index: number) => (
                                <div
                                    key={`${feature}-${index}`}
                                    className="flex items-start gap-3 rounded-lg border border-border bg-surface-secondary p-4"
                                >
                                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success/10 text-success">
                                        <Check size={13} />
                                    </div>

                                    <span className="text-sm leading-6 text-foreground">{feature}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="mt-4 text-sm text-muted">
                            No additional benefits have been listed for this plan.
                        </p>
                    )}
                </div>

                <div className="flex flex-col gap-3 border-t border-border bg-surface-secondary p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
                    <div>
                        <p className="text-sm font-medium text-foreground">Ready to apply?</p>
                        <p className="mt-1 text-xs text-muted">Submit your insurance proposal for review.</p>
                    </div>

                    {plan.is_active ? (
                        <Link
                            href={`/patient/insurance/plans/${plan._id}/apply`}
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary-hover"
                        >
                            Apply for This Plan
                            <ArrowRight size={18} />
                        </Link>
                    ) : (
                        <span className="rounded-lg border border-border px-6 py-3 text-sm text-muted">
                            Plan Unavailable
                        </span>
                    )}
                </div>
            </section>
        </main>
    );
}