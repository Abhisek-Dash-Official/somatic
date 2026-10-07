"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    CalendarDays,
    CreditCard,
    FileText,
    Loader2,
    ShieldCheck,
    Users,
} from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "react-toastify";

import InsuranceStatusBadge from "@/components/insurance/InsuranceStatusBadge";

const parseResponse = async (response: Response) => {
    const text = await response.text();

    if (!text.trim()) {
        throw new Error(
            `Request returned an empty response (${response.status})`
        );
    }

    try {
        return JSON.parse(text);
    } catch {
        throw new Error(
            `Request returned an invalid response (${response.status})`
        );
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

const formatFrequency = (frequency?: string) => {
    if (!frequency) return "Not available";

    return frequency
        .replaceAll("_", " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const relationshipLabel = (relationship?: string) => {
    if (!relationship) return "Member";

    return relationship.charAt(0).toUpperCase() + relationship.slice(1);
};

const InfoCard = ({
    icon,
    label,
    value,
    tone = "default",
}: {
    icon: ReactNode;
    label: string;
    value: string;
    tone?: "default" | "warning" | "danger";
}) => {
    const styles = {
        default: "border-border bg-surface-secondary",
        warning: "border-warning/20 bg-warning/5",
        danger: "border-danger/20 bg-danger/5",
    };

    const iconStyles = {
        default: "text-primary",
        warning: "text-warning",
        danger: "text-danger",
    };

    return (
        <div
            className={`flex items-start gap-3 rounded-2xl border p-4 ${styles[tone]}`}
        >
            <div className={iconStyles[tone]}>{icon}</div>

            <div className="min-w-0">
                <p className="text-xs text-muted">{label}</p>
                <p className="mt-1 text-sm font-medium text-foreground">
                    {value}
                </p>
            </div>
        </div>
    );
};

export default function InsurancePolicyDetailsPage() {
    const params = useParams();

    const [policy, setPolicy] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState(false);
    const [reviving, setReviving] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [showRevivalConfirm, setShowRevivalConfirm] = useState(false);

    useEffect(() => {
        const loadPolicy = async () => {
            try {
                const response = await fetch(
                    `/api/insurance/policies/${params.id}`
                );

                const data = await parseResponse(response);

                if (!response.ok) {
                    throw new Error(
                        data?.error || "Failed to load insurance policy"
                    );
                }

                setPolicy(data.policy);
            } catch (error: any) {
                console.error("Insurance policy details error:", error);
                toast.error(
                    error?.message || "Failed to load insurance policy"
                );
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

            const response = await fetch(
                `/api/insurance/policies/${policy._id}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        action: "cancel",
                    }),
                }
            );

            const data = await parseResponse(response);

            if (!response.ok) {
                throw new Error(
                    data?.error || "Failed to cancel policy"
                );
            }

            setPolicy(data.policy);
            setShowCancelConfirm(false);
            toast.success("Insurance policy cancelled successfully");
        } catch (error: any) {
            toast.error(
                error?.message || "Failed to cancel insurance policy"
            );
        } finally {
            setCancelling(false);
        }
    };

    const handleRevivalRequest = async () => {
        try {
            setReviving(true);

            const response = await fetch(
                `/api/insurance/policies/${policy._id}/revival`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            const data = await parseResponse(response);

            if (!response.ok) {
                throw new Error(
                    data?.error || "Failed to request policy revival"
                );
            }

            setPolicy(data.policy);
            setShowRevivalConfirm(false);
            toast.success("Revival request submitted successfully");
        } catch (error: any) {
            toast.error(
                error?.message || "Failed to request policy revival"
            );
        } finally {
            setReviving(false);
        }
    };

    if (loading) {
        return (
            <main className="flex min-h-[70vh] items-center justify-center bg-background">
                <Loader2
                    className="animate-spin text-primary"
                    size={32}
                />
            </main>
        );
    }

    if (!policy) {
        return (
            <main className="flex min-h-[70vh] items-center justify-center bg-background px-4">
                <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-8 text-center shadow-sm">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-primary">
                        <ShieldCheck size={28} />
                    </div>

                    <h1 className="mt-5 text-xl font-semibold text-foreground">
                        Policy not found
                    </h1>

                    <p className="mt-2 text-sm text-muted">
                        We could not find this insurance policy.
                    </p>

                    <Link
                        href="/patient/insurance"
                        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary-hover"
                    >
                        <ArrowLeft size={17} />
                        Back to Insurance
                    </Link>
                </div>
            </main>
        );
    }

    const plan = policy.plan_id;

    const isPaymentPending =
        policy.status === "approved" ||
        policy.status === "payment_pending";

    const isActive = policy.status === "active";
    const isLapsed = policy.status === "lapsed";
    const isRevivalPending = policy.status === "revival_pending";

    const isPremiumDue = Boolean(
        isActive &&
        policy.next_payment_due_at &&
        new Date(policy.next_payment_due_at) <= new Date()
    );

    return (
        <main className="min-h-screen bg-background px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-6xl">
                <Link
                    href="/patient/insurance"
                    className="inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-foreground"
                >
                    <ArrowLeft size={17} />
                    Back to Insurance
                </Link>

                <section className="mt-6 overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
                    <div className="border-b border-border bg-surface-secondary p-5 sm:p-7 lg:p-8">
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                            <div className="flex items-start gap-4">
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-accent text-primary">
                                    <ShieldCheck size={28} />
                                </div>

                                <div>
                                    <p className="text-sm font-medium text-primary">
                                        SOMATIC Insurance Policy
                                    </p>

                                    <h1 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">
                                        {plan?.name || "Insurance Policy"}
                                    </h1>

                                    <p className="mt-2 text-sm text-muted">
                                        {policy.policy_number ||
                                            "Policy number will be generated after activation"}
                                    </p>
                                </div>
                            </div>

                            <InsuranceStatusBadge status={policy.status} />
                        </div>
                    </div>

                    <div className="grid gap-4 p-5 sm:grid-cols-3 sm:p-7 lg:p-8">
                        <div className="rounded-2xl border border-border bg-surface-secondary p-5">
                            <p className="text-xs text-muted">
                                Coverage Amount
                            </p>

                            <p className="mt-2 text-2xl font-bold text-foreground">
                                ₹
                                {Number(
                                    plan?.coverage_amount || 0
                                ).toLocaleString("en-IN")}
                            </p>
                        </div>

                        <div className="rounded-2xl border border-border bg-surface-secondary p-5">
                            <p className="text-xs text-muted">Premium</p>

                            <p className="mt-2 text-2xl font-bold text-foreground">
                                ₹
                                {Number(
                                    plan?.premium_amount || 0
                                ).toLocaleString("en-IN")}
                            </p>

                            <p className="mt-1 text-xs text-muted">
                                {formatFrequency(plan?.premium_frequency)}
                            </p>
                        </div>

                        <div className="rounded-2xl border border-border bg-surface-secondary p-5">
                            <p className="text-xs text-muted">
                                Policy Term
                            </p>

                            <p className="mt-2 text-2xl font-bold text-foreground">
                                {plan?.policy_term_years || 0}{" "}
                                {Number(plan?.policy_term_years) === 1
                                    ? "Year"
                                    : "Years"}
                            </p>
                        </div>
                    </div>

                    <div className="border-t border-border p-5 sm:p-7 lg:p-8">
                        <h2 className="text-lg font-semibold text-foreground">
                            Policy Timeline
                        </h2>

                        <div className="mt-5 grid gap-3 sm:grid-cols-2">
                            <InfoCard
                                icon={<CalendarDays size={19} />}
                                label="Start Date"
                                value={formatDate(policy.start_date)}
                            />

                            <InfoCard
                                icon={<CalendarDays size={19} />}
                                label="Expiry Date"
                                value={formatDate(policy.expiry_date)}
                            />

                            {policy.grace_period_ends_at && (
                                <InfoCard
                                    icon={<CalendarDays size={19} />}
                                    label="Grace Period Ends"
                                    value={formatDate(
                                        policy.grace_period_ends_at
                                    )}
                                    tone="warning"
                                />
                            )}

                            {policy.lapsed_at && (
                                <InfoCard
                                    icon={<CalendarDays size={19} />}
                                    label="Lapsed On"
                                    value={formatDate(policy.lapsed_at)}
                                    tone="danger"
                                />
                            )}
                        </div>
                    </div>

                    <div className="border-t border-border p-5 sm:p-7 lg:p-8">
                        <div className="flex items-center gap-3">
                            <Users
                                className="text-primary"
                                size={21}
                            />

                            <div>
                                <h2 className="font-semibold text-foreground">
                                    Insured Members
                                </h2>

                                <p className="mt-1 text-xs text-muted">
                                    Members covered under this policy.
                                </p>
                            </div>
                        </div>

                        <div className="mt-5 space-y-3">
                            {policy.insured_members?.length > 0 ? (
                                policy.insured_members.map(
                                    (member: any, index: number) => (
                                        <div
                                            key={`${member.name}-${index}`}
                                            className="flex flex-col gap-2 rounded-2xl border border-border bg-surface-secondary p-4 sm:flex-row sm:items-center sm:justify-between"
                                        >
                                            <div>
                                                <p className="text-sm font-medium text-foreground">
                                                    {member.name}
                                                </p>

                                                <p className="mt-1 text-xs text-muted">
                                                    {relationshipLabel(
                                                        member.relationship
                                                    )}
                                                </p>
                                            </div>

                                            {member.date_of_birth && (
                                                <p className="text-xs text-muted">
                                                    DOB:{" "}
                                                    {formatDate(
                                                        member.date_of_birth
                                                    )}
                                                </p>
                                            )}
                                        </div>
                                    )
                                )
                            ) : (
                                <p className="text-sm text-muted">
                                    No insured members found.
                                </p>
                            )}
                        </div>
                    </div>

                    {policy.documents?.length > 0 && (
                        <div className="border-t border-border p-5 sm:p-7 lg:p-8">
                            <div className="flex items-center gap-3">
                                <FileText
                                    className="text-primary"
                                    size={21}
                                />

                                <div>
                                    <h2 className="font-semibold text-foreground">
                                        Documents
                                    </h2>

                                    <p className="mt-1 text-xs text-muted">
                                        Documents attached to this policy.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-5 space-y-3">
                                {policy.documents.map(
                                    (document: any, index: number) => (
                                        <a
                                            key={`${document.file_url}-${index}`}
                                            href={document.file_url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-surface-secondary p-4 transition hover:border-primary/40 hover:bg-accent"
                                        >
                                            <div className="flex min-w-0 items-center gap-3">
                                                <FileText
                                                    className="shrink-0 text-muted"
                                                    size={18}
                                                />

                                                <span className="truncate text-sm text-foreground">
                                                    {document.type?.replaceAll(
                                                        "_",
                                                        " "
                                                    ) || "Document"}
                                                </span>
                                            </div>

                                            <span className="shrink-0 text-xs font-semibold text-primary">
                                                View
                                            </span>
                                        </a>
                                    )
                                )}
                            </div>
                        </div>
                    )}

                    {policy.status === "rejected" &&
                        policy.rejection_reason && (
                            <div className="border-t border-border p-5 sm:p-7 lg:p-8">
                                <div className="rounded-2xl border border-danger/20 bg-danger/5 p-5">
                                    <p className="text-sm font-semibold text-danger">
                                        Application Rejected
                                    </p>

                                    <p className="mt-2 text-sm leading-6 text-muted">
                                        {policy.rejection_reason}
                                    </p>
                                </div>
                            </div>
                        )}

                    {isLapsed && (
                        <div className="border-t border-border bg-surface-secondary p-5 sm:p-7 lg:p-8">
                            {!showRevivalConfirm ? (
                                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <p className="font-semibold text-danger">
                                            Policy has lapsed
                                        </p>

                                        <p className="mt-1 max-w-2xl text-sm leading-6 text-muted">
                                            Your policy is no longer active
                                            because the premium grace period
                                            has ended. You can request revival
                                            for this policy.
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowRevivalConfirm(true)
                                        }
                                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary-hover"
                                    >
                                        <ShieldCheck size={18} />
                                        Request Revival
                                    </button>
                                </div>
                            ) : (
                                <div className="rounded-2xl border border-warning/20 bg-warning/5 p-5">
                                    <p className="text-sm font-semibold text-warning">
                                        Request policy revival?
                                    </p>

                                    <p className="mt-2 text-sm leading-6 text-muted">
                                        Your revival request will be reviewed
                                        by our insurance team. If approved,
                                        you will need to pay one normal{" "}
                                        {formatFrequency(
                                            plan?.premium_frequency
                                        ).toLowerCase()}{" "}
                                        premium to reactivate the policy.
                                    </p>

                                    <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                                        <button
                                            type="button"
                                            onClick={handleRevivalRequest}
                                            disabled={reviving}
                                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            {reviving && (
                                                <Loader2
                                                    className="animate-spin"
                                                    size={17}
                                                />
                                            )}

                                            {reviving
                                                ? "Submitting..."
                                                : "Yes, Request Revival"}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowRevivalConfirm(false)
                                            }
                                            disabled={reviving}
                                            className="rounded-xl border border-border bg-surface px-5 py-2.5 text-sm font-medium text-muted transition hover:bg-accent hover:text-foreground disabled:opacity-60"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {isRevivalPending && (
                        <div className="border-t border-border bg-surface-secondary p-5 sm:p-7 lg:p-8">
                            <div className="rounded-2xl border border-warning/20 bg-warning/5 p-5">
                                <p className="text-sm font-semibold text-warning">
                                    Revival request under review
                                </p>

                                <p className="mt-2 text-sm leading-6 text-muted">
                                    Your request to revive this policy has been
                                    submitted. Our insurance team will review
                                    it. If approved, you will be able to pay
                                    one normal{" "}
                                    {formatFrequency(
                                        plan?.premium_frequency
                                    ).toLowerCase()}{" "}
                                    premium to reactivate your policy.
                                </p>

                                {policy.revival_requested_at && (
                                    <p className="mt-3 text-xs text-muted">
                                        Requested on{" "}
                                        {formatDate(
                                            policy.revival_requested_at
                                        )}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {isPaymentPending && (
                        <div className="border-t border-border bg-surface-secondary p-5 sm:p-7 lg:p-8">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <p className="font-semibold text-foreground">
                                        {policy.status === "approved"
                                            ? "Your proposal has been approved"
                                            : policy.revival_approved_at
                                                ? "Your policy revival has been approved"
                                                : "Complete your premium payment"}
                                    </p>

                                    <p className="mt-1 text-sm text-muted">
                                        {policy.revival_approved_at
                                            ? `Pay one ${formatFrequency(
                                                plan?.premium_frequency
                                            ).toLowerCase()} premium to reactivate your insurance policy.`
                                            : `Pay your ${formatFrequency(
                                                plan?.premium_frequency
                                            ).toLowerCase()} premium to activate your insurance policy.`}
                                    </p>
                                </div>

                                <Link
                                    href={`/patient/insurance/policies/${policy._id}/payment`}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary-hover"
                                >
                                    <CreditCard size={18} />
                                    Pay Premium
                                </Link>
                            </div>
                        </div>
                    )}

                    {isActive && (
                        <div className="border-t border-border bg-surface-secondary p-5 sm:p-7 lg:p-8">
                            <div className="flex flex-col gap-5">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <p className="font-semibold text-success">
                                            Policy is active
                                        </p>

                                        <p className="mt-1 text-sm text-muted">
                                            You can submit an insurance claim
                                            for eligible medical expenses.
                                        </p>
                                    </div>

                                    <Link
                                        href="/patient/insurance/claims/new"
                                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary-hover"
                                    >
                                        <FileText size={18} />
                                        Create Claim
                                    </Link>
                                </div>

                                {policy.next_payment_due_at && (
                                    <div
                                        className={`rounded-2xl border p-4 ${isPremiumDue
                                                ? "border-warning/30 bg-warning/5"
                                                : "border-border bg-surface"
                                            }`}
                                    >
                                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                            <div>
                                                <p className="text-sm font-semibold text-foreground">
                                                    {isPremiumDue
                                                        ? "Premium Payment Due"
                                                        : "Next Premium Payment"}
                                                </p>

                                                <p className="mt-1 text-sm text-muted">
                                                    ₹
                                                    {Number(
                                                        plan?.premium_amount ||
                                                        0
                                                    ).toLocaleString("en-IN")}{" "}
                                                    {formatFrequency(
                                                        plan?.premium_frequency
                                                    ).toLowerCase()}{" "}
                                                    premium
                                                </p>

                                                <p className="mt-1 text-xs text-muted">
                                                    Due on{" "}
                                                    {formatDate(
                                                        policy.next_payment_due_at
                                                    )}
                                                </p>
                                            </div>

                                            {isPremiumDue ? (
                                                <Link
                                                    href={`/patient/insurance/policies/${policy._id}/payment`}
                                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary-hover"
                                                >
                                                    <CreditCard size={17} />
                                                    Pay Premium
                                                </Link>
                                            ) : (
                                                <span className="text-xs font-medium text-muted">
                                                    Payment not due yet
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {!showCancelConfirm ? (
                                    <div className="border-t border-border pt-5">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowCancelConfirm(true)
                                            }
                                            className="text-sm font-medium text-danger transition hover:opacity-80"
                                        >
                                            Cancel Policy
                                        </button>
                                    </div>
                                ) : (
                                    <div className="rounded-2xl border border-danger/20 bg-danger/5 p-5">
                                        <p className="text-sm font-semibold text-danger">
                                            Cancel this insurance policy?
                                        </p>

                                        <p className="mt-2 text-sm leading-6 text-muted">
                                            This will cancel your active
                                            insurance policy. Once cancelled,
                                            the policy will no longer remain
                                            active for future coverage.
                                        </p>

                                        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                                            <button
                                                type="button"
                                                onClick={handleCancelPolicy}
                                                disabled={cancelling}
                                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-danger px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                                            >
                                                {cancelling && (
                                                    <Loader2
                                                        className="animate-spin"
                                                        size={17}
                                                    />
                                                )}

                                                {cancelling
                                                    ? "Cancelling..."
                                                    : "Yes, Cancel Policy"}
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowCancelConfirm(false)
                                                }
                                                disabled={cancelling}
                                                className="rounded-xl border border-border bg-surface px-5 py-2.5 text-sm font-medium text-muted transition hover:bg-accent hover:text-foreground disabled:opacity-60"
                                            >
                                                Keep Policy
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {!isPaymentPending &&
                        !isActive &&
                        !isLapsed &&
                        !isRevivalPending &&
                        policy.status === "pending" && (
                            <div className="border-t border-border bg-surface-secondary p-5 sm:p-7 lg:p-8">
                                <div className="rounded-2xl border border-warning/20 bg-warning/5 p-4">
                                    <p className="text-sm font-medium text-warning">
                                        Proposal under review
                                    </p>

                                    <p className="mt-1 text-sm leading-6 text-muted">
                                        Your insurance proposal has been
                                        submitted and is waiting for dispatcher
                                        approval.
                                    </p>
                                </div>
                            </div>
                        )}
                </section>
            </div>
        </main>
    );
}