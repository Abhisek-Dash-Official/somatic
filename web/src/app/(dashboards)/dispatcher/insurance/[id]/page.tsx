"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
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
    pending: "border-warning/20 bg-warning/10 text-warning",
    approved: "border-primary/20 bg-primary/10 text-primary",
    payment_pending: "border-warning/20 bg-warning/10 text-warning",
    active: "border-success/20 bg-success/10 text-success",
    revival_pending: "border-warning/20 bg-warning/10 text-warning",
    lapsed: "border-danger/20 bg-danger/10 text-danger",
    rejected: "border-danger/20 bg-danger/10 text-danger",
    expired: "border-border bg-surface-secondary text-muted",
    cancelled: "border-danger/20 bg-danger/10 text-danger",
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
    const [showRevivalReject, setShowRevivalReject] = useState(false);
    const [showRevivalApprove, setShowRevivalApprove] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");
    const [revivalRejectionReason, setRevivalRejectionReason] = useState("");

    const fetchPolicy = async () => {
        try {
            setLoading(true);

            const response = await fetch(`/api/dispatcher/insurance/${params.id}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.error || "Failed to fetch insurance policy");
            }

            setPolicy(data.policy);
        } catch (error: any) {
            console.error("Dispatcher insurance detail error:", error);
            toast.error(error?.message || "Failed to load insurance policy");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (params.id) fetchPolicy();
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
                throw new Error(data?.error || "Failed to update insurance policy");
            }

            toast.success(data?.message || "Insurance policy updated successfully");

            setPolicy((current: any) => ({
                ...current,
                ...data.policy,
            }));

            setShowReject(false);
            setShowApproveConfirm(false);
            setRejectionReason("");
        } catch (error: any) {
            console.error("Dispatcher insurance action error:", error);
            toast.error(error?.message || "Failed to update insurance policy");
        } finally {
            setActionLoading(false);
        }
    };

    const updateRevival = async (action: "approve" | "reject") => {
        if (action === "reject" && !revivalRejectionReason.trim()) {
            toast.warn("Please provide a rejection reason");
            return;
        }

        setActionLoading(true);

        try {
            const response = await fetch(`/api/dispatcher/insurance/${params.id}/revival`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action,
                    rejection_reason: action === "reject" ? revivalRejectionReason.trim() : undefined,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.error || "Failed to update revival request");
            }

            toast.success(data?.message || "Revival request updated successfully");

            setPolicy((current: any) => ({
                ...current,
                status: data.status,
                revival_approved_at: data.revival_approved_at,
            }));

            setShowRevivalReject(false);
            setShowRevivalApprove(false);
            setRevivalRejectionReason("");
        } catch (error: any) {
            console.error("Dispatcher insurance revival action error:", error);
            toast.error(error?.message || "Failed to update revival request");
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <main className="flex min-h-[70vh] items-center justify-center bg-background">
                <Loader2 className="animate-spin text-primary" size={32} />
            </main>
        );
    }

    if (!policy) {
        return (
            <main className="mx-auto flex min-h-[70vh] w-full max-w-3xl items-center justify-center bg-background px-4">
                <div className="w-full rounded-2xl border border-border bg-surface p-8 text-center shadow-sm">
                    <ShieldCheck className="mx-auto text-muted-foreground" size={40} />

                    <h1 className="mt-4 text-xl font-semibold text-foreground">
                        Policy not found
                    </h1>

                    <p className="mt-2 text-sm text-muted">
                        This insurance policy could not be found.
                    </p>

                    <Link
                        href="/dispatcher/insurance"
                        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary-hover"
                    >
                        <ArrowLeft size={17} />
                        Back to Insurance
                    </Link>
                </div>
            </main>
        );
    }

    const patient = policy.user_id;
    const plan = policy.plan_id;
    const isPending = policy.status === "pending";
    const isRevivalPending = policy.status === "revival_pending";

    return (
        <main className="mx-auto w-full max-w-6xl px-4 py-6 text-foreground sm:px-6 lg:px-8">
            <Link
                href="/dispatcher/insurance"
                className="inline-flex items-center gap-2 text-sm text-muted transition hover:text-foreground"
            >
                <ArrowLeft size={17} />
                Back to Insurance
            </Link>

            <section className="mt-6 overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
                <div className="border-b border-border bg-primary/5 p-6 sm:p-8">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex items-start gap-4">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <ShieldCheck size={28} />
                            </div>

                            <div>
                                <p className="text-sm font-medium text-primary">
                                    {isRevivalPending
                                        ? "Insurance Revival Review"
                                        : "Insurance Proposal Review"}
                                </p>

                                <h1 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">
                                    {plan?.name || "Insurance Policy"}
                                </h1>

                                <p className="mt-2 text-sm text-muted">
                                    Submitted on {formatDate(policy.created_at)}
                                </p>
                            </div>
                        </div>

                        <span
                            className={`w-fit rounded-full border px-3 py-1.5 text-xs font-medium ${statusStyles[policy.status] || "border-border bg-surface-secondary text-muted"}`}
                        >
                            {statusLabel(policy.status)}
                        </span>
                    </div>
                </div>

                {isRevivalPending && (
                    <div className="border-b border-warning/20 bg-warning/10 p-5 sm:p-6">
                        <div className="flex items-start gap-3">
                            <ShieldCheck className="mt-0.5 shrink-0 text-warning" size={20} />

                            <div>
                                <p className="text-sm font-semibold text-warning">
                                    Policy Revival Requested
                                </p>

                                <p className="mt-1 text-sm leading-6 text-muted">
                                    The patient has requested revival of this lapsed policy. Review the policy and approve or reject the revival request.
                                </p>

                                {policy.revival_requested_at && (
                                    <p className="mt-2 text-xs text-muted">
                                        Requested on {formatDate(policy.revival_requested_at)}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid gap-4 p-6 sm:grid-cols-3 sm:p-8">
                    <div className="rounded-xl border border-border bg-surface-secondary p-5">
                        <p className="text-xs text-muted">Coverage Amount</p>

                        <p className="mt-2 text-2xl font-bold text-foreground">
                            ₹{Number(plan?.coverage_amount || 0).toLocaleString("en-IN")}
                        </p>
                    </div>

                    <div className="rounded-xl border border-border bg-surface-secondary p-5">
                        <p className="text-xs text-muted">Premium</p>

                        <p className="mt-2 text-2xl font-bold text-foreground">
                            ₹{Number(plan?.premium_amount || 0).toLocaleString("en-IN")}
                        </p>

                        <p className="mt-1 text-xs capitalize text-muted">
                            {plan?.premium_frequency?.replaceAll("_", " ")}
                        </p>
                    </div>

                    <div className="rounded-xl border border-border bg-surface-secondary p-5">
                        <p className="text-xs text-muted">Policy Term</p>

                        <p className="mt-2 text-2xl font-bold text-foreground">
                            {plan?.policy_term_years}{" "}
                            {Number(plan?.policy_term_years) === 1 ? "Year" : "Years"}
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 border-t border-border p-6 lg:grid-cols-2 lg:p-8">
                    <div>
                        <div className="flex items-center gap-3">
                            <UserRound className="text-primary" size={21} />

                            <div>
                                <h2 className="font-semibold text-foreground">
                                    Patient Information
                                </h2>

                                <p className="mt-1 text-xs text-muted">
                                    Applicant details
                                </p>
                            </div>
                        </div>

                        <div className="mt-5 space-y-3">
                            <div className="rounded-xl border border-border bg-surface-secondary p-4">
                                <p className="text-xs text-muted">Name</p>

                                <p className="mt-1 text-sm font-medium text-foreground">
                                    {patient?.username || "Not available"}
                                </p>
                            </div>

                            <div className="flex items-center gap-3 rounded-xl border border-border bg-surface-secondary p-4">
                                <Mail className="text-muted-foreground" size={17} />

                                <div className="min-w-0">
                                    <p className="text-xs text-muted">Email</p>

                                    <p className="mt-1 break-words text-sm text-foreground">
                                        {patient?.email || "Not available"}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 rounded-xl border border-border bg-surface-secondary p-4">
                                <Phone className="text-muted-foreground" size={17} />

                                <div>
                                    <p className="text-xs text-muted">Contact</p>

                                    <p className="mt-1 text-sm text-foreground">
                                        {patient?.contact_no || "Not available"}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 rounded-xl border border-border bg-surface-secondary p-4">
                                <MapPin className="mt-0.5 shrink-0 text-muted-foreground" size={17} />

                                <div className="min-w-0">
                                    <p className="text-xs text-muted">Address</p>

                                    <p className="mt-1 break-words text-sm leading-6 text-foreground">
                                        {patient?.address || "Not available"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center gap-3">
                            <UserRound className="text-primary" size={21} />

                            <div>
                                <h2 className="font-semibold text-foreground">
                                    Insured Members
                                </h2>

                                <p className="mt-1 text-xs text-muted">
                                    Members included in the policy
                                </p>
                            </div>
                        </div>

                        <div className="mt-5 space-y-3">
                            {policy.insured_members?.length > 0 ? (
                                policy.insured_members.map((member: any, index: number) => (
                                    <div
                                        key={`${member.name}-${index}`}
                                        className="rounded-xl border border-border bg-surface-secondary p-4"
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <p className="text-sm font-medium text-foreground">
                                                    {member.name}
                                                </p>

                                                <p className="mt-1 text-xs capitalize text-muted">
                                                    {member.relationship || "Member"}
                                                </p>
                                            </div>

                                            {member.date_of_birth && (
                                                <p className="text-xs text-muted">
                                                    {formatDate(member.date_of_birth)}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted">
                                    No insured members found.
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 border-t border-border p-6 sm:grid-cols-3 sm:p-8">
                    <div className="rounded-xl border border-border bg-surface-secondary p-4">
                        <p className="text-xs text-muted">Policy Start</p>
                        <p className="mt-1 text-sm font-medium text-foreground">
                            {formatDate(policy.start_date)}
                        </p>
                    </div>

                    <div className="rounded-xl border border-border bg-surface-secondary p-4">
                        <p className="text-xs text-muted">Expiry</p>
                        <p className="mt-1 text-sm font-medium text-foreground">
                            {formatDate(policy.expiry_date)}
                        </p>
                    </div>

                    <div className="rounded-xl border border-border bg-surface-secondary p-4">
                        <p className="text-xs text-muted">Next Payment Due</p>
                        <p className="mt-1 text-sm font-medium text-foreground">
                            {formatDate(policy.next_payment_due_at)}
                        </p>
                    </div>
                </div>

                {policy.lapsed_at && (
                    <div className="border-t border-border p-6 sm:p-8">
                        <div className="rounded-xl border border-danger/20 bg-danger/10 p-4">
                            <p className="text-sm font-semibold text-danger">
                                Policy Lapsed
                            </p>

                            <p className="mt-1 text-sm text-muted">
                                This policy lapsed on {formatDate(policy.lapsed_at)}.
                            </p>
                        </div>
                    </div>
                )}

                {plan?.description && (
                    <div className="border-t border-border p-6 sm:p-8">
                        <h2 className="font-semibold text-foreground">
                            Plan Description
                        </h2>

                        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">
                            {plan.description}
                        </p>

                        {plan.features?.length > 0 && (
                            <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                {plan.features.map((feature: string, index: number) => (
                                    <div
                                        key={`${feature}-${index}`}
                                        className="rounded-xl border border-border bg-surface-secondary p-4 text-sm text-foreground"
                                    >
                                        {feature}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {policy.documents?.length > 0 && (
                    <div className="border-t border-border p-6 sm:p-8">
                        <div className="flex items-center gap-3">
                            <FileText className="text-primary" size={21} />

                            <div>
                                <h2 className="font-semibold text-foreground">
                                    Supporting Documents
                                </h2>

                                <p className="mt-1 text-xs text-muted">
                                    Documents submitted with this policy
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
                                    className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface-secondary p-4 transition hover:bg-accent"
                                >
                                    <div className="flex min-w-0 items-center gap-3">
                                        <FileText
                                            className="shrink-0 text-muted-foreground"
                                            size={18}
                                        />

                                        <span className="truncate text-sm capitalize text-foreground">
                                            {document.type?.replaceAll("_", " ") || "Document"}
                                        </span>
                                    </div>

                                    <span className="shrink-0 text-xs font-medium text-primary">
                                        View
                                    </span>
                                </a>
                            ))}
                        </div>
                    </div>
                )}

                {policy.status === "rejected" && policy.rejection_reason && (
                    <div className="border-t border-border p-6 sm:p-8">
                        <div className="rounded-xl border border-danger/20 bg-danger/10 p-5">
                            <p className="text-sm font-semibold text-danger">
                                Rejection Reason
                            </p>

                            <p className="mt-2 text-sm leading-6 text-muted">
                                {policy.rejection_reason}
                            </p>
                        </div>
                    </div>
                )}

                {isPending && (
                    <div className="border-t border-border bg-surface-secondary p-6 sm:p-8">
                        {!showReject && !showApproveConfirm && (
                            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={() => setShowReject(true)}
                                    disabled={actionLoading}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-danger/30 px-6 py-3 text-sm font-medium text-danger transition hover:bg-danger/10 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <XCircle size={18} />
                                    Reject Proposal
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setShowApproveConfirm(true)}
                                    disabled={actionLoading}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <CheckCircle2 size={18} />
                                    Approve Proposal
                                </button>
                            </div>
                        )}

                        {showApproveConfirm && (
                            <div className="rounded-2xl border border-success/20 bg-success/10 p-5">
                                <h3 className="font-semibold text-foreground">
                                    Approve Insurance Proposal?
                                </h3>

                                <p className="mt-2 text-sm leading-6 text-muted">
                                    This will approve the proposal and allow the patient to proceed with premium payment.
                                </p>

                                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setShowApproveConfirm(false)}
                                        disabled={actionLoading}
                                        className="rounded-xl border border-border px-5 py-3 text-sm font-medium text-muted transition hover:bg-accent hover:text-foreground"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => updatePolicy("approve")}
                                        disabled={actionLoading}
                                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {actionLoading && (
                                            <Loader2 className="animate-spin" size={18} />
                                        )}
                                        Confirm Approval
                                    </button>
                                </div>
                            </div>
                        )}

                        {showReject && (
                            <div className="rounded-2xl border border-danger/20 bg-danger/10 p-5">
                                <h3 className="font-semibold text-foreground">
                                    Reject Insurance Proposal
                                </h3>

                                <p className="mt-1 text-sm text-muted">
                                    Provide a reason that will be visible to the patient.
                                </p>

                                <textarea
                                    value={rejectionReason}
                                    onChange={(event) => setRejectionReason(event.target.value)}
                                    placeholder="Enter rejection reason..."
                                    rows={4}
                                    className="mt-4 w-full resize-none rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-danger focus:ring-4 focus:ring-danger/10"
                                />

                                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-end">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowReject(false);
                                            setRejectionReason("");
                                        }}
                                        disabled={actionLoading}
                                        className="rounded-xl border border-border px-5 py-3 text-sm font-medium text-muted transition hover:bg-accent hover:text-foreground"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => updatePolicy("reject")}
                                        disabled={actionLoading}
                                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-danger px-5 py-3 text-sm font-medium text-white transition hover:bg-danger/90 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {actionLoading && (
                                            <Loader2 className="animate-spin" size={18} />
                                        )}
                                        Confirm Rejection
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {isRevivalPending && (
                    <div className="border-t border-border bg-surface-secondary p-6 sm:p-8">
                        {!showRevivalApprove && !showRevivalReject && (
                            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={() => setShowRevivalReject(true)}
                                    disabled={actionLoading}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-danger/30 px-6 py-3 text-sm font-medium text-danger transition hover:bg-danger/10 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <XCircle size={18} />
                                    Reject Revival
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setShowRevivalApprove(true)}
                                    disabled={actionLoading}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <CheckCircle2 size={18} />
                                    Approve Revival
                                </button>
                            </div>
                        )}

                        {showRevivalApprove && (
                            <div className="rounded-2xl border border-success/20 bg-success/10 p-5">
                                <h3 className="font-semibold text-foreground">
                                    Approve Policy Revival?
                                </h3>

                                <p className="mt-2 text-sm leading-6 text-muted">
                                    The policy will move to payment pending. The patient must pay one regular premium to reactivate the policy.
                                </p>

                                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setShowRevivalApprove(false)}
                                        disabled={actionLoading}
                                        className="rounded-xl border border-border px-5 py-3 text-sm font-medium text-muted transition hover:bg-accent hover:text-foreground"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => updateRevival("approve")}
                                        disabled={actionLoading}
                                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {actionLoading && (
                                            <Loader2 className="animate-spin" size={18} />
                                        )}
                                        Confirm Revival Approval
                                    </button>
                                </div>
                            </div>
                        )}

                        {showRevivalReject && (
                            <div className="rounded-2xl border border-danger/20 bg-danger/10 p-5">
                                <h3 className="font-semibold text-foreground">
                                    Reject Policy Revival
                                </h3>

                                <p className="mt-1 text-sm text-muted">
                                    The policy will remain lapsed.
                                </p>

                                <textarea
                                    value={revivalRejectionReason}
                                    onChange={(event) => setRevivalRejectionReason(event.target.value)}
                                    placeholder="Enter revival rejection reason..."
                                    rows={4}
                                    className="mt-4 w-full resize-none rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-danger focus:ring-4 focus:ring-danger/10"
                                />

                                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-end">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowRevivalReject(false);
                                            setRevivalRejectionReason("");
                                        }}
                                        disabled={actionLoading}
                                        className="rounded-xl border border-border px-5 py-3 text-sm font-medium text-muted transition hover:bg-accent hover:text-foreground"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => updateRevival("reject")}
                                        disabled={actionLoading}
                                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-danger px-5 py-3 text-sm font-medium text-white transition hover:bg-danger/90 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {actionLoading && (
                                            <Loader2 className="animate-spin" size={18} />
                                        )}
                                        Confirm Revival Rejection
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {policy.status === "payment_pending" && policy.revival_approved_at && (
                    <div className="border-t border-border p-6 sm:p-8">
                        <div className="rounded-xl border border-warning/20 bg-warning/10 p-4">
                            <p className="text-sm font-semibold text-warning">
                                Revival Approved — Awaiting Payment
                            </p>

                            <p className="mt-1 text-sm text-muted">
                                The patient must complete the revival premium payment before the policy becomes active again.
                            </p>
                        </div>
                    </div>
                )}
            </section>
        </main>
    );
}