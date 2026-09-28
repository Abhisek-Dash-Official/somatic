"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, FileText, Loader2, XCircle } from "lucide-react";
import { toast } from "react-toastify";
import type { IHospital, IInsuranceClaim, IInsurancePolicy, IUser } from "@/types/models";

type DispatcherClaim = IInsuranceClaim & {
    user_id: IUser;
    policy_id: IInsurancePolicy;
    hospital_id?: IHospital;
};

const actionLabels = {
    under_review: "Move to Review",
    documents_required: "Request Documents",
    approve: "Approve Claim",
    partially_approve: "Partially Approve",
    reject: "Reject Claim",
    settle: "Mark as Settled",
};

export default function DispatcherInsuranceClaimDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const [claim, setClaim] = useState<DispatcherClaim | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [approvedAmount, setApprovedAmount] = useState("");
    const [rejectionReason, setRejectionReason] = useState("");
    const [requiredDocuments, setRequiredDocuments] = useState("");
    const [activeAction, setActiveAction] = useState<string | null>(null);

    const loadClaim = async () => {
        try {
            setLoading(true);

            const { id } = await params;
            const res = await fetch(`/api/dispatcher/insurance/claims/${id}`);
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Failed to fetch insurance claim");

            setClaim(data.claim);
            setApprovedAmount(data.claim?.approved_amount ? String(data.claim.approved_amount) : "");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to fetch insurance claim");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadClaim();
    }, [params]);

    const updateClaim = async (action: keyof typeof actionLabels) => {
        if (!claim) return;

        if (action === "reject" && !rejectionReason.trim()) {
            toast.warn("Please provide a rejection reason");
            return;
        }

        if (action === "partially_approve") {
            const amount = Number(approvedAmount);

            if (!Number.isFinite(amount) || amount <= 0) {
                toast.warn("Please enter a valid approved amount");
                return;
            }

            if (amount >= Number(claim.claimed_amount || 0)) {
                toast.warn("For partial approval, approved amount must be less than claimed amount");
                return;
            }
        }

        if (action === "approve") {
            const amount = Number(claim.claimed_amount || 0);

            if (amount <= 0) {
                toast.warn("Claimed amount is invalid");
                return;
            }
        }

        if (action === "documents_required" && !requiredDocuments.trim()) {
            toast.warn("Please specify the required documents");
            return;
        }

        try {
            setSubmitting(true);
            setActiveAction(action);

            const body: Record<string, any> = { action };

            if (action === "reject") {
                body.rejection_reason = rejectionReason.trim();
            }

            if (action === "partially_approve") {
                body.approved_amount = Number(approvedAmount);
            }

            if (action === "approve") {
                body.approved_amount = Number(claim.claimed_amount || 0);
            }

            if (action === "documents_required") {
                body.required_documents = requiredDocuments
                    .split("\n")
                    .map((item) => item.trim())
                    .filter(Boolean);
            }

            const res = await fetch(`/api/dispatcher/insurance/claims/${claim._id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Failed to update insurance claim");

            toast.success(`Claim ${actionLabels[action].toLowerCase()} successfully`);

            setRejectionReason("");
            setRequiredDocuments("");
            setActiveAction(null);

            await loadClaim();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to update insurance claim");
        } finally {
            setSubmitting(false);
            setActiveAction(null);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center bg-[#0b1220]">
                <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
            </div>
        );
    }

    if (!claim) {
        return (
            <div className="min-h-[60vh] bg-[#0b1220] p-4 md:p-6">
                <div className="mx-auto max-w-xl rounded-xl border border-slate-700/60 bg-[#111827] p-8 text-center">
                    <h1 className="text-xl font-bold text-white">Claim Not Found</h1>
                    <Link
                        href="/dispatcher/insurance/claims"
                        className="mt-5 inline-flex rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-purple-500"
                    >
                        Back to Claims
                    </Link>
                </div>
            </div>
        );
    }

    const canReview = ["submitted", "under_review", "documents_required"].includes(claim.status);
    const canSettle = ["approved", "partially_approved"].includes(claim.status);

    return (
        <div className="min-h-screen bg-[#0b1220] p-4 md:p-6">
            <div className="mx-auto max-w-6xl space-y-6">
                <div className="flex items-center gap-3">
                    <Link
                        href="/dispatcher/insurance/claims"
                        className="rounded-lg border border-slate-700/60 bg-[#111827] p-2 text-slate-400 transition hover:border-slate-600 hover:text-white"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Link>

                    <div>
                        <h1 className="text-2xl font-bold text-white">Insurance Claim Review</h1>
                        <p className="mt-1 text-sm text-slate-400">
                            {claim.claim_number || claim._id.toString()}
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                        <section className="rounded-xl border border-slate-700/60 bg-[#111827] p-6">
                            <h2 className="font-semibold text-white">Patient Information</h2>

                            <div className="mt-5 grid gap-4 sm:grid-cols-2">
                                <div>
                                    <p className="text-xs text-slate-500">Name</p>
                                    <p className="mt-1 text-sm text-slate-200">{claim.user_id?.username || "—"}</p>
                                </div>

                                <div>
                                    <p className="text-xs text-slate-500">Email</p>
                                    <p className="mt-1 text-sm text-slate-200">{claim.user_id?.email || "—"}</p>
                                </div>

                                <div>
                                    <p className="text-xs text-slate-500">Contact</p>
                                    <p className="mt-1 text-sm text-slate-200">{claim.user_id?.contact_no || "—"}</p>
                                </div>

                                <div>
                                    <p className="text-xs text-slate-500">Policy</p>
                                    <p className="mt-1 text-sm text-slate-200">
                                        {claim.policy_id?.policy_number || claim.policy_id?._id?.toString() || "—"}
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section className="rounded-xl border border-slate-700/60 bg-[#111827] p-6">
                            <h2 className="font-semibold text-white">Claim Information</h2>

                            <div className="mt-5 grid gap-4 sm:grid-cols-2">
                                <div>
                                    <p className="text-xs text-slate-500">Claim Type</p>
                                    <p className="mt-1 text-sm capitalize text-slate-200">{claim.claim_type}</p>
                                </div>

                                <div>
                                    <p className="text-xs text-slate-500">Incident Type</p>
                                    <p className="mt-1 text-sm capitalize text-slate-200">{claim.incident_type || "—"}</p>
                                </div>

                                <div>
                                    <p className="text-xs text-slate-500">Incident Date</p>
                                    <p className="mt-1 text-sm text-slate-200">
                                        {claim.incident_date ? new Date(claim.incident_date).toLocaleDateString("en-IN") : "—"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-slate-500">Treatment Date</p>
                                    <p className="mt-1 text-sm text-slate-200">
                                        {claim.treatment_date ? new Date(claim.treatment_date).toLocaleDateString("en-IN") : "—"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-slate-500">Admission Date</p>
                                    <p className="mt-1 text-sm text-slate-200">
                                        {claim.admission_date ? new Date(claim.admission_date).toLocaleDateString("en-IN") : "—"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-slate-500">Discharge Date</p>
                                    <p className="mt-1 text-sm text-slate-200">
                                        {claim.discharge_date ? new Date(claim.discharge_date).toLocaleDateString("en-IN") : "—"}
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section className="rounded-xl border border-slate-700/60 bg-[#111827] p-6">
                            <div className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-purple-400" />
                                <h2 className="font-semibold text-white">Submitted Documents</h2>
                            </div>

                            {!claim.documents?.length ? (
                                <p className="mt-4 text-sm text-slate-500">No documents have been submitted.</p>
                            ) : (
                                <div className="mt-4 space-y-2">
                                    {claim.documents.map((document, index) => (
                                        <a
                                            key={`${document.file_url}-${index}`}
                                            href={document.file_url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex items-center justify-between rounded-lg border border-slate-700/60 bg-[#172033] px-4 py-3 transition hover:border-slate-600"
                                        >
                                            <div>
                                                <p className="text-sm font-medium capitalize text-slate-200">
                                                    {document.type.replaceAll("_", " ")}
                                                </p>
                                                <p className="mt-1 text-xs text-slate-500">
                                                    {new Date(document.uploaded_at).toLocaleDateString("en-IN")}
                                                </p>
                                            </div>

                                            <span className="text-xs font-medium text-purple-400">View</span>
                                        </a>
                                    ))}
                                </div>
                            )}

                            {!!claim.required_documents?.length && (
                                <div className="mt-5 rounded-lg border border-orange-500/20 bg-orange-500/5 p-4">
                                    <p className="text-sm font-medium text-orange-300">Required Documents</p>
                                    <ul className="mt-2 space-y-1">
                                        {claim.required_documents.map((document, index) => (
                                            <li key={`${document}-${index}`} className="text-sm text-slate-400">
                                                • {document}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </section>
                    </div>

                    <aside className="h-fit space-y-6 lg:sticky lg:top-6">
                        <section className="rounded-xl border border-slate-700/60 bg-[#111827] p-6">
                            <h2 className="font-semibold text-white">Claim Amount</h2>

                            <div className="mt-5 space-y-4">
                                <div className="flex justify-between gap-4 text-sm">
                                    <span className="text-slate-500">Estimated</span>
                                    <span className="text-slate-200">₹{Number(claim.estimated_amount || 0).toLocaleString("en-IN")}</span>
                                </div>

                                <div className="flex justify-between gap-4 text-sm">
                                    <span className="text-slate-500">Claimed</span>
                                    <span className="font-semibold text-white">₹{Number(claim.claimed_amount || 0).toLocaleString("en-IN")}</span>
                                </div>

                                <div className="flex justify-between gap-4 border-t border-slate-700/60 pt-4 text-sm">
                                    <span className="text-slate-500">Approved</span>
                                    <span className="font-semibold text-emerald-400">₹{Number(claim.approved_amount || 0).toLocaleString("en-IN")}</span>
                                </div>
                            </div>
                        </section>

                        {canReview && (
                            <section className="rounded-xl border border-slate-700/60 bg-[#111827] p-6">
                                <h2 className="font-semibold text-white">Claim Actions</h2>

                                <button
                                    type="button"
                                    disabled={submitting}
                                    onClick={() => updateClaim("under_review")}
                                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm font-medium text-blue-400 transition hover:bg-blue-500/20 disabled:opacity-50"
                                >
                                    {activeAction === "under_review" && <Loader2 className="h-4 w-4 animate-spin" />}
                                    Move to Review
                                </button>

                                <div className="mt-4">
                                    <label className="text-xs text-slate-400">Required Documents</label>
                                    <textarea
                                        value={requiredDocuments}
                                        onChange={(e) => setRequiredDocuments(e.target.value)}
                                        rows={3}
                                        placeholder={"Hospital bill\nDischarge summary"}
                                        className="mt-2 w-full rounded-lg border border-slate-700/60 bg-[#172033] px-3 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-orange-500"
                                    />

                                    <button
                                        type="button"
                                        disabled={submitting}
                                        onClick={() => updateClaim("documents_required")}
                                        className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-orange-500/30 bg-orange-500/10 px-4 py-3 text-sm font-medium text-orange-400 transition hover:bg-orange-500/20 disabled:opacity-50"
                                    >
                                        {activeAction === "documents_required" && <Loader2 className="h-4 w-4 animate-spin" />}
                                        Request Documents
                                    </button>
                                </div>

                                <button
                                    type="button"
                                    disabled={submitting}
                                    onClick={() => updateClaim("approve")}
                                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:opacity-50"
                                >
                                    {activeAction === "approve" ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                                    Approve Claim
                                </button>

                                <div className="mt-4">
                                    <label className="text-xs text-slate-400">Partial Approved Amount</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={approvedAmount}
                                        onChange={(e) => setApprovedAmount(e.target.value)}
                                        placeholder="₹0"
                                        className="mt-2 w-full rounded-lg border border-slate-700/60 bg-[#172033] px-3 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-500"
                                    />

                                    <button
                                        type="button"
                                        disabled={submitting}
                                        onClick={() => updateClaim("partially_approve")}
                                        className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 text-sm font-medium text-cyan-400 transition hover:bg-cyan-500/20 disabled:opacity-50"
                                    >
                                        {activeAction === "partially_approve" && <Loader2 className="h-4 w-4 animate-spin" />}
                                        Partially Approve
                                    </button>
                                </div>

                                <div className="mt-4">
                                    <label className="text-xs text-slate-400">Rejection Reason</label>
                                    <textarea
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        rows={3}
                                        placeholder="Enter reason for rejection..."
                                        className="mt-2 w-full rounded-lg border border-slate-700/60 bg-[#172033] px-3 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-red-500"
                                    />

                                    <button
                                        type="button"
                                        disabled={submitting}
                                        onClick={() => updateClaim("reject")}
                                        className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-400 transition hover:bg-red-500/20 disabled:opacity-50"
                                    >
                                        {activeAction === "reject" ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                                        Reject Claim
                                    </button>
                                </div>
                            </section>
                        )}

                        {canSettle && (
                            <section className="rounded-xl border border-slate-700/60 bg-[#111827] p-6">
                                <h2 className="font-semibold text-white">Settlement</h2>
                                <p className="mt-2 text-sm leading-6 text-slate-500">
                                    Once the approved amount has been processed, mark this claim as settled.
                                </p>

                                <button
                                    type="button"
                                    disabled={submitting}
                                    onClick={() => updateClaim("settle")}
                                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-purple-500 disabled:opacity-50"
                                >
                                    {activeAction === "settle" && <Loader2 className="h-4 w-4 animate-spin" />}
                                    Mark as Settled
                                </button>
                            </section>
                        )}
                    </aside>
                </div>
            </div>
        </div>
    );
}