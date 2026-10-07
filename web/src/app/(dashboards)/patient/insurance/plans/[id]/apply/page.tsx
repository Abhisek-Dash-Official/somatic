"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    FileText,
    Loader2,
    ShieldCheck,
    UserRound,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";

import { useUserStore } from "@/store/useUserStore";
import InsuranceMemberForm, { InsuranceMember } from "@/components/insurance/InsuranceMemberForm";
import InsuranceDocumentUpload, { InsuranceDocument } from "@/components/insurance/InsuranceDocumentUpload";

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

export default function InsurancePlanApplyPage() {
    const params = useParams();
    const router = useRouter();

    const { user, fetchUser } = useUserStore();

    const [plan, setPlan] = useState<any>(null);
    const [members, setMembers] = useState<InsuranceMember[]>([
        {
            name: "",
            relationship: "self",
            date_of_birth: "",
        },
    ]);
    const [documents, setDocuments] = useState<InsuranceDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    useEffect(() => {
        const loadPlan = async () => {
            try {
                const response = await fetch("/api/insurance/plans");
                const data = await parseResponse(response);

                if (!response.ok) {
                    throw new Error(
                        data?.error || "Failed to load insurance plan"
                    );
                }

                const foundPlan = (data.plans || []).find(
                    (item: any) =>
                        item._id?.toString() === params.id?.toString()
                );

                if (!foundPlan) {
                    throw new Error("Insurance plan not found");
                }

                setPlan(foundPlan);
            } catch (error: any) {
                console.error(
                    "Insurance apply plan error:",
                    error
                );

                toast.error(
                    error?.message || "Failed to load insurance plan"
                );
            } finally {
                setLoading(false);
            }
        };

        if (params.id) {
            loadPlan();
        }
    }, [params.id]);

    useEffect(() => {
        if (!user) return;

        setMembers((current) => {
            const first = current[0] || {
                name: "",
                relationship: "self",
                date_of_birth: "",
            };

            return [
                {
                    ...first,
                    name: first.name || user.username || "",
                    relationship: "self",
                    date_of_birth:
                        first.date_of_birth ||
                        (user.date_of_birth
                            ? new Date(user.date_of_birth)
                                .toISOString()
                                .split("T")[0]
                            : ""),
                },
                ...current.slice(1),
            ];
        });
    }, [user]);

    const submitApplication = async (event: FormEvent) => {
        event.preventDefault();

        if (!plan) return;

        const validMembers = members
            .map((member) => ({
                name: member.name.trim(),
                relationship: member.relationship,
                date_of_birth:
                    member.date_of_birth || undefined,
            }))
            .filter(
                (member) =>
                    member.name && member.relationship
            );

        if (validMembers.length === 0) {
            toast.error(
                "Please add at least one insured member"
            );
            return;
        }

        if (!validMembers[0].name) {
            toast.error(
                "Primary insured member name is required"
            );
            return;
        }

        const validDocuments = documents
            .map((document) => ({
                type: document.type,
                file_url: document.file_url.trim(),
            }))
            .filter((document) => document.file_url);

        setSubmitting(true);

        try {
            const response = await fetch(
                "/api/insurance/policies",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        plan_id: plan._id,
                        insured_members: validMembers,
                        documents: validDocuments,
                    }),
                }
            );

            const data = await parseResponse(response);

            if (!response.ok) {
                throw new Error(
                    data?.error ||
                    "Failed to submit insurance proposal"
                );
            }

            toast.success(
                "Insurance proposal submitted successfully"
            );

            router.push(
                `/patient/insurance/policies/${data.policy?._id || data._id
                }`
            );
        } catch (error: any) {
            console.error(
                "Insurance proposal error:",
                error
            );

            toast.error(
                error?.message ||
                "Failed to submit insurance proposal"
            );
        } finally {
            setSubmitting(false);
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

    if (!plan) {
        return (
            <main className="flex min-h-[70vh] items-center justify-center bg-background px-4">
                <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-8 text-center shadow-sm">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-primary">
                        <ShieldCheck size={28} />
                    </div>

                    <h1 className="mt-5 text-xl font-semibold text-foreground">
                        Insurance plan not found
                    </h1>

                    <Link
                        href="/patient/insurance#available-plans"
                        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary-hover"
                    >
                        <ArrowLeft size={17} />
                        Back to Plans
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-background px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-5xl">
                <Link
                    href={`/patient/insurance/plans/${plan._id}`}
                    className="inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-foreground"
                >
                    <ArrowLeft size={17} />
                    Back to Plan
                </Link>

                <form
                    onSubmit={submitApplication}
                    className="mt-6 space-y-6"
                >
                    <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-7">
                        <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent text-primary">
                                <ShieldCheck size={24} />
                            </div>

                            <div>
                                <p className="text-sm font-medium text-primary">
                                    Insurance Application
                                </p>

                                <h1 className="mt-1 text-2xl font-bold text-foreground">
                                    Apply for {plan.name}
                                </h1>

                                <p className="mt-2 text-sm leading-6 text-muted">
                                    Provide the insured member details and
                                    supporting documents for review.
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 grid gap-4 sm:grid-cols-3">
                            <div className="rounded-2xl border border-border bg-surface-secondary p-4">
                                <p className="text-xs text-muted">
                                    Coverage
                                </p>

                                <p className="mt-1 font-semibold text-foreground">
                                    ₹
                                    {Number(
                                        plan.coverage_amount || 0
                                    ).toLocaleString("en-IN")}
                                </p>
                            </div>

                            <div className="rounded-2xl border border-border bg-surface-secondary p-4">
                                <p className="text-xs text-muted">
                                    Premium
                                </p>

                                <p className="mt-1 font-semibold text-foreground">
                                    ₹
                                    {Number(
                                        plan.premium_amount || 0
                                    ).toLocaleString("en-IN")}
                                </p>
                            </div>

                            <div className="rounded-2xl border border-border bg-surface-secondary p-4">
                                <p className="text-xs text-muted">
                                    Policy Term
                                </p>

                                <p className="mt-1 font-semibold text-foreground">
                                    {plan.policy_term_years}{" "}
                                    {plan.policy_term_years === 1
                                        ? "Year"
                                        : "Years"}
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-7">
                        <div className="mb-6 flex items-center gap-3">
                            <UserRound
                                className="text-primary"
                                size={21}
                            />

                            <div>
                                <h2 className="font-semibold text-foreground">
                                    Insured Members
                                </h2>

                                <p className="mt-1 text-xs text-muted">
                                    Add yourself and any family members to
                                    the policy.
                                </p>
                            </div>
                        </div>

                        <InsuranceMemberForm
                            members={members}
                            onChange={setMembers}
                        />
                    </section>

                    <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-7">
                        <div className="mb-6 flex items-center gap-3">
                            <FileText
                                className="text-primary"
                                size={21}
                            />

                            <div>
                                <h2 className="font-semibold text-foreground">
                                    Supporting Documents
                                </h2>

                                <p className="mt-1 text-xs text-muted">
                                    Add document URLs if supporting documents
                                    are available.
                                </p>
                            </div>
                        </div>

                        <InsuranceDocumentUpload
                            documents={documents}
                            onChange={setDocuments}
                        />
                    </section>

                    <section className="rounded-2xl border border-warning/20 bg-warning/5 p-5">
                        <p className="text-sm leading-6 text-muted">
                            Your application will first be reviewed by
                            SOMATIC. Payment is required only after the
                            proposal is approved.
                        </p>
                    </section>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 text-sm font-medium text-primary-foreground transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {submitting ? (
                            <Loader2
                                className="animate-spin"
                                size={19}
                            />
                        ) : (
                            <ShieldCheck size={19} />
                        )}

                        {submitting
                            ? "Submitting Application..."
                            : "Submit Insurance Application"}
                    </button>
                </form>
            </div>
        </main>
    );
}