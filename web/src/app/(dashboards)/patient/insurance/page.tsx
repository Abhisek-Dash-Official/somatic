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

    if (!text.trim()) {
        throw new Error(`${endpoint} returned an empty response (${response.status})`);
    }

    let data: any;

    try {
        data = JSON.parse(text);
    } catch {
        throw new Error(`${endpoint} returned an invalid response (${response.status})`);
    }

    if (!response.ok) {
        throw new Error(data?.error || data?.message || `${endpoint} request failed (${response.status})`);
    }

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
                const endpoints = [
                    "/api/insurance/plans",
                    "/api/insurance/policies",
                    "/api/insurance/claims",
                ];

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
            <main className="flex min-h-[70vh] items-center justify-center">
                <Loader2 className="animate-spin text-blue-400" size={32} />
            </main>
        );
    }

    return (
        <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <section className="rounded-3xl border border-slate-800 bg-[#111a2f] p-6 sm:p-8">
                <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
                                <ShieldCheck size={25} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-blue-400">SOMATIC Insurance</p>
                                <h1 className="text-2xl font-bold text-white sm:text-3xl">Protect your health and family</h1>
                            </div>
                        </div>

                        <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-400">
                            Choose an insurance plan, submit your proposal, and manage your policy and claims from one place.
                        </p>
                    </div>

                    <Link
                        href="/patient/insurance/claims/new"
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-5 py-3 text-sm font-medium text-slate-200 transition hover:border-blue-500/40 hover:text-white"
                    >
                        <Plus size={18} />
                        New Claim
                    </Link>
                </div>
            </section>

            {policies.length > 0 && (
                <section className="mt-8">
                    <div className="mb-4">
                        <h2 className="text-xl font-semibold text-white">My Insurance</h2>
                        <p className="mt-1 text-sm text-slate-500">View and manage your insurance policies.</p>
                    </div>

                    <div className="grid gap-5 lg:grid-cols-2">
                        {policies.map((policy) => (
                            <InsurancePolicyCard key={policy._id} policy={policy} />
                        ))}
                    </div>
                </section>
            )}

            <section id="available-plans" className="mt-10 scroll-mt-24">
                <div className="mb-5">
                    <h2 className="text-xl font-semibold text-white">Available Plans</h2>
                    <p className="mt-1 text-sm text-slate-500">Choose a plan based on your coverage requirements.</p>
                </div>

                {plans.length === 0 ? (
                    <div className="rounded-2xl border border-slate-800 bg-[#111a2f] p-10 text-center">
                        <ShieldCheck className="mx-auto text-slate-600" size={35} />
                        <p className="mt-3 text-sm text-slate-400">No insurance plans are currently available.</p>
                    </div>
                ) : (
                    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {plans.map((plan) => (
                            <InsurancePlanCard key={plan._id} plan={plan} />
                        ))}
                    </div>
                )}
            </section>

            <section className="mt-10">
                <div className="mb-5 flex items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-semibold text-white">My Claims</h2>
                        <p className="mt-1 text-sm text-slate-500">Track your submitted insurance claims.</p>
                    </div>

                    <Link
                        href="/patient/insurance/claims"
                        className="inline-flex items-center gap-1 text-sm font-medium text-blue-400 hover:text-blue-300"
                    >
                        View all <ArrowRight size={16} />
                    </Link>
                </div>

                {claims.length === 0 ? (
                    <div className="rounded-2xl border border-slate-800 bg-[#111a2f] p-8 text-center">
                        <FileText className="mx-auto text-slate-600" size={30} />
                        <p className="mt-3 text-sm text-slate-400">You have not submitted any insurance claims yet.</p>
                    </div>
                ) : (
                    <div className="grid gap-5 lg:grid-cols-2">
                        {claims.slice(0, 4).map((claim) => (
                            <InsuranceClaimCard key={claim._id} claim={claim} />
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}