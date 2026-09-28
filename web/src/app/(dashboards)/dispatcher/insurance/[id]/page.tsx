"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    CheckCircle2,
    FileText,
    Loader2,
    Mail,
    MapPin,
    Phone,
    ShieldCheck,
    UserRound,
    XCircle,
} from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "react-toastify";

const formatDate = (date?: string) => {
    if (!date) return "Not available";

    return new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
};

const statusStyles: Record<string, string> = {
    pending: "border-amber-500/20 bg-amber-500/10 text-amber-400",
    approved: "border-blue-500/20 bg-blue-500/10 text-blue-400",
    payment_pending: "border-orange-500/20 bg-orange-500/10 text-orange-400",
    active: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
    rejected: "border-red-500/20 bg-red-500/10 text-red-400",
};

const statusLabel = (status: string) =>
    status.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());

export default function DispatcherInsuranceDetailsPage() {
    const params = useParams();

    const [policy, setPolicy] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [showReject, setShowReject] = useState(false);
    const [showApproveConfirm, setShowApproveConfirm] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");

    const fetchPolicy = async () => {
        try {
            setLoading(true);

            const response = await fetch(`/api/dispatcher/insurance/${params.id}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.error || "Failed to fetch insurance proposal");
            }

            setPolicy(data.policy);
        } catch (error: any) {
            console.error("Dispatcher insurance detail error:", error);
            toast.error(error?.message || "Failed to load insurance proposal");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (params.id) {
            fetchPolicy();
        }
    }, [params.id]);

    const updatePolicy = async (action: "approve" | "reject") => {
        if (action === "reject" && !rejectionReason.trim()) {
            toast.warn("Please provide a rejection reason");
            return;
        }

        setActionLoading(true);

        try {
            const response = await fetch(`/api/dispatcher/insurance/${params.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action,
                    rejection_reason: action === "reject" ? rejectionReason.trim() : undefined,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.error || "Failed to update insurance proposal");
            }

            toast.success(data?.message || "Insurance proposal updated successfully");

            setPolicy((current: any) => ({
                ...current,
                ...data.policy,
            }));

            setShowReject(false);
            setShowApproveConfirm(false);
            setRejectionReason("");
        } catch (error: any) {
            console.error("Dispatcher insurance action error:", error);
            toast.error(error?.message || "Failed to update insurance proposal");
        } finally {
            setActionLoading(false);
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
                    <h1 className="mt-4 text-xl font-semibold text-white">Proposal not found</h1>
                    <p className="mt-2 text-sm text-slate-500">
                        This insurance proposal could not be found.
                    </p>
                    <Link
                        href="/dispatcher/insurance"
                        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-500"
                    >
                        <ArrowLeft size={17} />
                        Back to Proposals
                    </Link>
                </div>
            </main>
        );
    }

    const patient = policy.user_id;
    const plan = policy.plan_id;
    const isPending = policy.status === "pending";

    return (
        <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
            <Link
                href="/dispatcher/insurance"
                className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
            >
                <ArrowLeft size={17} />
                Back to Insurance Proposals
            </Link>

            <section className="mt-6 overflow-hidden rounded-3xl border border-slate-800 bg-[#111a2f]">
                <div className="border-b border-slate-800 bg-linear-to-br from-blue-500/10 via-transparent to-transparent p-6 sm:p-8">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex items-start gap-4">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
                                <ShieldCheck size={28} />
                            </div>

                            <div>
                                <p className="text-sm font-medium text-blue-400">
                                    Insurance Proposal Review
                                </p>
                                <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
                                    {plan?.name || "Insurance Proposal"}
                                </h1>
                                <p className="mt-2 text-sm text-slate-500">
                                    Submitted on {formatDate(policy.created_at)}
                                </p>
                            </div>
                        </div>

                        <span
                            className={`w-fit rounded-full border px-3 py-1.5 text-xs font-medium ${statusStyles[policy.status] || "border-slate-700 bg-slate-500/10 text-slate-400"}`}
                        >
                            {statusLabel(policy.status)}
                        </span>
                    </div>
                </div>

                <div className="grid gap-4 p-6 sm:grid-cols-3 sm:p-8">
                    <div className="rounded-2xl border border-slate-800 bg-[#0c1426] p-5">
                        <p className="text-xs text-slate-500">Coverage Amount</p>
                        <p className="mt-2 text-2xl font-bold text-white">
                            ₹{Number(plan?.coverage_amount || 0).toLocaleString("en-IN")}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-800 bg-[#0c1426] p-5">
                        <p className="text-xs text-slate-500">Premium</p>
                        <p className="mt-2 text-2xl font-bold text-white">
                            ₹{Number(plan?.premium_amount || 0).toLocaleString("en-IN")}
                        </p>
                        <p className="mt-1 text-xs capitalize text-slate-500">
                            {plan?.premium_frequency?.replace("_", " ")}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-800 bg-[#0c1426] p-5">
                        <p className="text-xs text-slate-500">Policy Term</p>
                        <p className="mt-2 text-2xl font-bold text-white">
                            {plan?.policy_term_years}{" "}
                            {Number(plan?.policy_term_years) === 1 ? "Year" : "Years"}
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 border-t border-slate-800 p-6 lg:grid-cols-2 lg:p-8">
                    <div>
                        <div className="flex items-center gap-3">
                            <UserRound className="text-blue-400" size={21} />
                            <div>
                                <h2 className="font-semibold text-white">Patient Information</h2>
                                <p className="mt-1 text-xs text-slate-500">Applicant details</p>
                            </div>
                        </div>

                        <div className="mt-5 space-y-3">
                            <div className="rounded-xl border border-slate-800 bg-[#0c1426] p-4">
                                <p className="text-xs text-slate-500">Name</p>
                                <p className="mt-1 text-sm font-medium text-white">
                                    {patient?.username || "Not available"}
                                </p>
                            </div>

                            <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-[#0c1426] p-4">
                                <Mail className="text-slate-500" size={17} />
                                <div>
                                    <p className="text-xs text-slate-500">Email</p>
                                    <p className="mt-1 text-sm text-slate-300">
                                        {patient?.email || "Not available"}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-[#0c1426] p-4">
                                <Phone className="text-slate-500" size={17} />
                                <div>
                                    <p className="text-xs text-slate-500">Contact</p>
                                    <p className="mt-1 text-sm text-slate-300">
                                        {patient?.contact_no || "Not available"}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 rounded-xl border border-slate-800 bg-[#0c1426] p-4">
                                <MapPin className="mt-0.5 text-slate-500" size={17} />
                                <div>
                                    <p className="text-xs text-slate-500">Address</p>
                                    <p className="mt-1 text-sm leading-6 text-slate-300">
                                        {patient?.address || "Not available"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center gap-3">
                            <UserRound className="text-blue-400" size={21} />
                            <div>
                                <h2 className="font-semibold text-white">Insured Members</h2>
                                <p className="mt-1 text-xs text-slate-500">
                                    Members included in the proposal
                                </p>
                            </div>
                        </div>

                        <div className="mt-5 space-y-3">
                            {policy.insured_members?.length > 0 ? (
                                policy.insured_members.map((member: any, index: number) => (
                                    <div
                                        key={`${member.name}-${index}`}
                                        className="rounded-xl border border-slate-800 bg-[#0c1426] p-4"
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <p className="text-sm font-medium text-white">
                                                    {member.name}
                                                </p>
                                                <p className="mt-1 text-xs capitalize text-slate-500">
                                                    {member.relationship || "Member"}
                                                </p>
                                            </div>

                                            {member.date_of_birth && (
                                                <p className="text-xs text-slate-500">
                                                    {formatDate(member.date_of_birth)}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-slate-500">No insured members found.</p>
                            )}
                        </div>
                    </div>
                </div>

                {plan?.description && (
                    <div className="border-t border-slate-800 p-6 sm:p-8">
                        <h2 className="font-semibold text-white">Plan Description</h2>
                        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
                            {plan.description}
                        </p>

                        {plan.features?.length > 0 && (
                            <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                {plan.features.map((feature: string, index: number) => (
                                    <div
                                        key={`${feature}-${index}`}
                                        className="rounded-xl border border-slate-800 bg-[#0c1426] p-4 text-sm text-slate-300"
                                    >
                                        {feature}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {policy.documents?.length > 0 && (
                    <div className="border-t border-slate-800 p-6 sm:p-8">
                        <div className="flex items-center gap-3">
                            <FileText className="text-blue-400" size={21} />
                            <div>
                                <h2 className="font-semibold text-white">Supporting Documents</h2>
                                <p className="mt-1 text-xs text-slate-500">
                                    Documents submitted with this proposal
                                </p>
                            </div>
                        </div>

                        <div className="mt-5 grid gap-3 sm:grid-cols-2">
                            {policy.documents.map((document: any, index: number) => (
                                <a
                                    key={`${document.file_url}-${index}`}
                                    href={document.file_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-[#0c1426] p-4 transition hover:border-blue-500/40"
                                >
                                    <div className="flex min-w-0 items-center gap-3">
                                        <FileText className="shrink-0 text-slate-400" size={18} />
                                        <span className="truncate text-sm capitalize text-slate-300">
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
                            <p className="text-sm font-semibold text-red-400">Rejection Reason</p>
                            <p className="mt-2 text-sm leading-6 text-slate-400">
                                {policy.rejection_reason}
                            </p>
                        </div>
                    </div>
                )}

                {isPending && (
                    <div className="border-t border-slate-800 bg-[#0c1426] p-6 sm:p-8">
                        {!showReject && !showApproveConfirm && (
                            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={() => setShowReject(true)}
                                    disabled={actionLoading}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/30 px-6 py-3 text-sm font-medium text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <XCircle size={18} />
                                    Reject Proposal
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setShowApproveConfirm(true)}
                                    disabled={actionLoading}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <CheckCircle2 size={18} />
                                    Approve Proposal
                                </button>
                            </div>
                        )}

                        {showApproveConfirm && (
                            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
                                <h3 className="font-semibold text-white">Approve Insurance Proposal?</h3>
                                <p className="mt-2 text-sm leading-6 text-slate-400">
                                    This will approve the proposal and allow the patient to proceed with premium payment.
                                </p>

                                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setShowApproveConfirm(false)}
                                        disabled={actionLoading}
                                        className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-medium text-slate-300 transition hover:text-white"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => updatePolicy("approve")}
                                        disabled={actionLoading}
                                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {actionLoading && <Loader2 className="animate-spin" size={18} />}
                                        Confirm Approval
                                    </button>
                                </div>
                            </div>
                        )}

                        {showReject && (
                            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
                                <h3 className="font-semibold text-white">Reject Insurance Proposal</h3>
                                <p className="mt-1 text-sm text-slate-500">
                                    Provide a reason that will be visible to the patient.
                                </p>

                                <textarea
                                    value={rejectionReason}
                                    onChange={(event) => setRejectionReason(event.target.value)}
                                    placeholder="Enter rejection reason..."
                                    rows={4}
                                    className="mt-4 w-full resize-none rounded-xl border border-slate-700 bg-[#0c1426] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-red-500"
                                />

                                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-end">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowReject(false);
                                            setRejectionReason("");
                                        }}
                                        disabled={actionLoading}
                                        className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-medium text-slate-300 transition hover:text-white"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => updatePolicy("reject")}
                                        disabled={actionLoading}
                                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {actionLoading && <Loader2 className="animate-spin" size={18} />}
                                        Confirm Rejection
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </section>
        </main>
    );
}