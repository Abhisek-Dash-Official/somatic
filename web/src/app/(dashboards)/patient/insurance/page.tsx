"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, FileText, Loader2, Plus, ShieldCheck } from "lucide-react";
import { toast } from "react-toastify";
import InsurancePlanCard from "@/components/insurance/InsurancePlanCard";
import InsurancePolicyCard from "@/components/insurance/InsurancePolicyCard";
import InsuranceClaimCard from "@/components/insurance/InsuranceClaimCard";

const parseResponse = async (response: Response, endpoint: string) => {
    const text = await response.text();

    if (!text.trim()) throw new Error(`${endpoint} returned an empty response (${response.status})`);

    let data: any;
    try {
        data = JSON.parse(text);
    } catch {
        throw new Error(`${endpoint} returned an invalid response (${response.status})`);
    }

    if (!response.ok) throw new Error(data?.error || data?.message || `${endpoint} request failed (${response.status})`);
    return data;
};

export default function InsurancePage() {
    const [plans, setPlans] = useState<any[]>([]);
    const [policies, setPolicies] = useState<any[]>([]);
    const [claims, setClaims] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadInsurance = async () => {
            try {
                const endpoints = ["/api/insurance/plans", "/api/insurance/policies", "/api/insurance/claims"];
                const responses = await Promise.all(endpoints.map((endpoint) => fetch(endpoint)));
                const [plansData, policiesData, claimsData] = await Promise.all(
                    responses.map((response, index) => parseResponse(response, endpoints[index])),
                );

                setPlans(Array.isArray(plansData.plans) ? plansData.plans : []);
                setPolicies(Array.isArray(policiesData.policies) ? policiesData.policies : []);
                setClaims(Array.isArray(claimsData.claims) ? claimsData.claims : []);
            } catch (error: any) {
                console.error("Insurance page error:", error);
                toast.error(error?.message || "Failed to load insurance information");
            } finally {
                setLoading(false);
            }
        };

        loadInsurance();
    }, []);

    if (loading) {
        return (
            <main className="flex min-h-[70vh] items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-background px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <section className="overflow-hidden rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-7">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                        <div className="max-w-3xl">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-primary">
                                <ShieldCheck className="h-6 w-6" />
                            </div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                                SOMATIC Insurance
                            </p>
                            <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                                Protect your health and family
                            </h1>
                            <p className="mt-3 text-sm leading-6 text-muted sm:text-base">
                                Choose coverage, manage your policy, and track insurance claims from one place.
                            </p>
                        </div>

                        <Link
                            href="/patient/insurance/claims/new"
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover sm:w-auto"
                        >
                            <Plus className="h-4 w-4" />
                            New Claim
                        </Link>
                    </div>
                </section>

                {policies.length > 0 && (
                    <section className="mt-8">
                        <SectionHeading title="My Insurance" description="View and manage your active and previous policies." />
                        <div className="grid gap-5 lg:grid-cols-2">
                            {policies.map((policy) => (
                                <InsurancePolicyCard key={policy._id} policy={policy} />
                            ))}
                        </div>
                    </section>
                )}

                <section id="available-plans" className="mt-10 scroll-mt-24">
                    <SectionHeading title="Available Plans" description="Choose coverage based on your healthcare and financial requirements." />

                    {plans.length === 0 ? (
                        <EmptyState icon={<ShieldCheck className="h-7 w-7" />} message="No insurance plans are currently available." />
                    ) : (
                        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                            {plans.map((plan) => (
                                <InsurancePlanCard key={plan._id} plan={plan} />
                            ))}
                        </div>
                    )}
                </section>

                <section className="mt-10 pb-8">
                    <div className="mb-5 flex items-end justify-between gap-4">
                        <SectionHeading title="My Claims" description="Track the status of your submitted insurance claims." />
                        <Link href="/patient/insurance/claims" className="mb-1 inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary transition hover:text-primary-hover">
                            View all <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>

                    {claims.length === 0 ? (
                        <EmptyState icon={<FileText className="h-7 w-7" />} message="You have not submitted any insurance claims yet." />
                    ) : (
                        <div className="grid gap-5 lg:grid-cols-2">
                            {claims.slice(0, 4).map((claim) => (
                                <InsuranceClaimCard key={claim._id} claim={claim} />
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}

function SectionHeading({ title, description }: { title: string; description: string }) {
    return (
        <div className="mb-5">
            <h2 className="text-xl font-bold text-foreground">{title}</h2>
            <p className="mt-1 text-sm text-muted">{description}</p>
        </div>
    );
}

function EmptyState({ icon, message }: { icon: React.ReactNode; message: string }) {
    return (
        <div className="rounded-2xl border border-border bg-surface px-6 py-12 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-primary">
                {icon}
            </div>
            <p className="mt-4 text-sm text-muted">{message}</p>
        </div>
    );
}