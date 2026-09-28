"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CalendarDays, CreditCard, FileText, Loader2, ShieldCheck, Users } from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "react-toastify";
import InsuranceStatusBadge from "@/components/insurance/InsuranceStatusBadge";

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

const formatDate = (date?: string) => {
    if (!date) return "Not available";

    return new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
};

const relationshipLabel = (relationship?: string) => {
    if (!relationship) return "Member";
    return relationship.charAt(0).toUpperCase() + relationship.slice(1);
};

export default function InsurancePolicyDetailsPage() {
    const params = useParams();
    const [policy, setPolicy] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);

    useEffect(() => {
        const loadPolicy = async () => {
            try {
                const response = await fetch(`/api/insurance/policies/${params.id}`);
                const data = await parseResponse(response);

                if (!response.ok) {
                    throw new Error(data?.error || "Failed to load insurance policy");
                }

                setPolicy(data.policy);
            } catch (error: any) {
                console.error("Insurance policy details error:", error);
                toast.error(error?.message || "Failed to load insurance policy");
            } finally {
                setLoading(false);
            }
        };

        if (params.id) {
            loadPolicy();
        }
    }, [params.id]);

    const handleCancelPolicy = async () => {
        try {
            setCancelling(true);

            const response = await fetch(`/api/insurance/policies/${policy._id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ action: "cancel" }),
            });

            const data = await parseResponse(response);

            if (!response.ok) {
                throw new Error(data?.error || "Failed to cancel policy");
            }

            setPolicy(data.policy);
            setShowCancelConfirm(false);
            toast.success("Insurance policy cancelled successfully");
        } catch (error: any) {
            toast.error(error?.message || "Failed to cancel insurance policy");
        } finally {
            setCancelling(false);
        }
    };

    if (loading) {
        return (
            <main className="flex min-h-[70vh] items-center justify-center">
                <Loader2 className="animate-spin text-blue-400" size={32} />
            </main>
        );
    }

    if (!policy) {
        return (
            <main className="mx-auto flex min-h-[70vh] w-full max-w-3xl items-center justify-center px-4">
                <div className="w-full rounded-2xl border border-slate-800 bg-[#111a2f] p-8 text-center">
                    <ShieldCheck className="mx-auto text-slate-600" size={40} />
                    <h1 className="mt-4 text-xl font-semibold text-white">Policy not found</h1>
                    <p className="mt-2 text-sm text-slate-500">
                        We could not find this insurance policy.
                    </p>
                    <Link
                        href="/patient/insurance"
                        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-500"
                    >
                        <ArrowLeft size={17} />
                        Back to Insurance
                    </Link>
                </div>
            </main>
        );
    }

    const plan = policy.plan_id;
    const isPaymentPending = policy.status === "approved" || policy.status === "payment_pending";
    const isActive = policy.status === "active";

    return (
        <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
            <Link
                href="/patient/insurance"
                className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
            >
                <ArrowLeft size={17} />
                Back to Insurance
            </Link>

            <section className="mt-6 overflow-hidden rounded-3xl border border-slate-800 bg-[#111a2f]">
                <div className="border-b border-slate-800 bg-linear-to-br from-blue-500/10 via-transparent to-transparent p-6 sm:p-8">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex items-start gap-4">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
                                <ShieldCheck size={28} />
                            </div>

                            <div>
                                <p className="text-sm font-medium text-blue-400">SOMATIC Insurance Policy</p>
                                <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
                                    {plan?.name || "Insurance Policy"}
                                </h1>
                                <p className="mt-2 text-sm text-slate-500">
                                    {policy.policy_number || "Policy number will be generated after activation"}
                                </p>
                            </div>
                        </div>

                        <InsuranceStatusBadge status={policy.status} />
                    </div>
                </div>

                <div className="grid gap-4 p-6 sm:grid-cols-3 sm:p-8">
                    <div className="rounded-2xl border border-slate-800 bg-[#0c1426] p-5">
                        <p className="text-xs text-slate-500">Coverage Amount</p>
                        <p className="mt-2 text-xl font-bold text-white">
                            ₹{Number(plan?.coverage_amount || 0).toLocaleString("en-IN")}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-800 bg-[#0c1426] p-5">
                        <p className="text-xs text-slate-500">Premium</p>
                        <p className="mt-2 text-xl font-bold text-white">
                            ₹{Number(plan?.premium_amount || 0).toLocaleString("en-IN")}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-800 bg-[#0c1426] p-5">
                        <p className="text-xs text-slate-500">Policy Term</p>
                        <p className="mt-2 text-xl font-bold text-white">
                            {plan?.policy_term_years || 0}{" "}
                            {Number(plan?.policy_term_years) === 1 ? "Year" : "Years"}
                        </p>
                    </div>
                </div>

                <div className="border-t border-slate-800 p-6 sm:p-8">
                    <h2 className="text-lg font-semibold text-white">Policy Timeline</h2>

                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                        <div className="flex items-start gap-3 rounded-xl border border-slate-800 bg-[#0c1426] p-4">
                            <CalendarDays className="mt-0.5 shrink-0 text-blue-400" size={19} />
                            <div>
                                <p className="text-xs text-slate-500">Start Date</p>
                                <p className="mt-1 text-sm font-medium text-white">
                                    {formatDate(policy.start_date)}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 rounded-xl border border-slate-800 bg-[#0c1426] p-4">
                            <CalendarDays className="mt-0.5 shrink-0 text-blue-400" size={19} />
                            <div>
                                <p className="text-xs text-slate-500">Expiry Date</p>
                                <p className="mt-1 text-sm font-medium text-white">
                                    {formatDate(policy.expiry_date)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-800 p-6 sm:p-8">
                    <div className="flex items-center gap-3">
                        <Users className="text-blue-400" size={21} />
                        <div>
                            <h2 className="font-semibold text-white">Insured Members</h2>
                            <p className="mt-1 text-xs text-slate-500">
                                Members covered under this proposal.
                            </p>
                        </div>
                    </div>

                    <div className="mt-5 space-y-3">
                        {policy.insured_members?.length > 0 ? (
                            policy.insured_members.map((member: any, index: number) => (
                                <div
                                    key={`${member.name}-${index}`}
                                    className="flex flex-col gap-2 rounded-xl border border-slate-800 bg-[#0c1426] p-4 sm:flex-row sm:items-center sm:justify-between"
                                >
                                    <div>
                                        <p className="text-sm font-medium text-white">{member.name}</p>
                                        <p className="mt-1 text-xs text-slate-500">
                                            {relationshipLabel(member.relationship)}
                                        </p>
                                    </div>

                                    {member.date_of_birth && (
                                        <p className="text-xs text-slate-500">
                                            DOB: {formatDate(member.date_of_birth)}
                                        </p>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-slate-500">No insured members found.</p>
                        )}
                    </div>
                </div>

                {policy.documents?.length > 0 && (
                    <div className="border-t border-slate-800 p-6 sm:p-8">
                        <div className="flex items-center gap-3">
                            <FileText className="text-blue-400" size={21} />
                            <div>
                                <h2 className="font-semibold text-white">Documents</h2>
                                <p className="mt-1 text-xs text-slate-500">
                                    Documents attached to this policy.
                                </p>
                            </div>
                        </div>

                        <div className="mt-5 space-y-3">
                            {policy.documents.map((document: any, index: number) => (
                                <a
                                    key={`${document.file_url}-${index}`}
                                    href={document.file_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center justify-between gap-4 rounded-xl border border-slate-800 bg-[#0c1426] p-4 transition hover:border-blue-500/40"
                                >
                                    <div className="flex min-w-0 items-center gap-3">
                                        <FileText className="shrink-0 text-slate-400" size={18} />
                                        <span className="truncate text-sm text-slate-300">
                                            {document.type?.replaceAll("_", " ") || "Document"}
                                        </span>
                                    </div>

                                    <span className="shrink-0 text-xs font-medium text-blue-400">
                                        View
                                    </span>
                                </a>
                            ))}
                        </div>
                    </div>
                )}

                {policy.status === "rejected" && policy.rejection_reason && (
                    <div className="border-t border-slate-800 p-6 sm:p-8">
                        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
                            <p className="text-sm font-semibold text-red-400">Application Rejected</p>
                            <p className="mt-2 text-sm leading-6 text-slate-400">
                                {policy.rejection_reason}
                            </p>
                        </div>
                    </div>
                )}

                {isPaymentPending && (
                    <div className="border-t border-slate-800 bg-[#0c1426] p-6 sm:p-8">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="font-semibold text-white">
                                    {policy.status === "approved"
                                        ? "Your proposal has been approved"
                                        : "Complete your premium payment"}
                                </p>
                                <p className="mt-1 text-sm text-slate-500">
                                    Pay the premium to activate your insurance policy.
                                </p>
                            </div>

                            <Link
                                href={`/patient/insurance/policies/${policy._id}/payment`}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-blue-500"
                            >
                                <CreditCard size={18} />
                                Pay Premium
                            </Link>
                        </div>
                    </div>
                )}

                {isActive && (
                    <div className="border-t border-slate-800 bg-[#0c1426] p-6 sm:p-8">
                        <div className="flex flex-col gap-5">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <p className="font-semibold text-emerald-400">Policy is active</p>
                                    <p className="mt-1 text-sm text-slate-500">
                                        You can submit an insurance claim for eligible medical expenses.
                                    </p>
                                </div>

                                <Link
                                    href="/patient/insurance/claims/new"
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-blue-500"
                                >
                                    <FileText size={18} />
                                    Create Claim
                                </Link>
                            </div>

                            {!showCancelConfirm ? (
                                <div className="border-t border-slate-800 pt-5">
                                    <button
                                        type="button"
                                        onClick={() => setShowCancelConfirm(true)}
                                        className="text-sm font-medium text-red-400 transition hover:text-red-300"
                                    >
                                        Cancel Policy
                                    </button>
                                </div>
                            ) : (
                                <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
                                    <p className="text-sm font-semibold text-red-400">
                                        Cancel this insurance policy?
                                    </p>

                                    <p className="mt-2 text-sm leading-6 text-slate-400">
                                        This will cancel your active insurance policy. Once cancelled, the
                                        policy will no longer remain active for future coverage.
                                    </p>

                                    <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                                        <button
                                            type="button"
                                            onClick={handleCancelPolicy}
                                            disabled={cancelling}
                                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            {cancelling && <Loader2 className="animate-spin" size={17} />}
                                            {cancelling ? "Cancelling..." : "Yes, Cancel Policy"}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setShowCancelConfirm(false)}
                                            disabled={cancelling}
                                            className="rounded-xl border border-slate-700 bg-slate-900 px-5 py-2.5 text-sm font-medium text-slate-300 transition hover:border-slate-600 hover:text-white disabled:opacity-60"
                                        >
                                            Keep Policy
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {!isPaymentPending && !isActive && policy.status === "pending" && (
                    <div className="border-t border-slate-800 bg-[#0c1426] p-6 sm:p-8">
                        <div className="rounded-xl border border-amber-500/10 bg-amber-500/5 p-4">
                            <p className="text-sm font-medium text-amber-400">Proposal under review</p>
                            <p className="mt-1 text-sm leading-6 text-slate-500">
                                Your insurance proposal has been submitted and is waiting for dispatcher approval.
                            </p>
                        </div>
                    </div>
                )}
            </section>
        </main>
    );
}