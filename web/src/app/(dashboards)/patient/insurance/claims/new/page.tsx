"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, FileText, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "react-toastify";

interface Policy {
    _id: string;
    policy_number?: string;
    status: string;
    plan_id?: {
        name: string;
        coverage_amount: number;
    };
}

const incidentTypes = [
    { value: "accident", label: "Accident" },
    { value: "illness", label: "Illness" },
    { value: "emergency", label: "Emergency" },
    { value: "other", label: "Other" },
];

export default function NewInsuranceClaimPage() {
    const [policies, setPolicies] = useState<Policy[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [policyId, setPolicyId] = useState("");
    const [claimType, setClaimType] = useState<"cashless" | "reimbursement">("cashless");
    const [incidentType, setIncidentType] = useState("");
    const [incidentDate, setIncidentDate] = useState("");
    const [treatmentDate, setTreatmentDate] = useState("");
    const [admissionDate, setAdmissionDate] = useState("");
    const [dischargeDate, setDischargeDate] = useState("");
    const [estimatedAmount, setEstimatedAmount] = useState("");
    const [claimedAmount, setClaimedAmount] = useState("");

    useEffect(() => {
        const loadPolicies = async () => {
            try {
                const response = await fetch("/api/insurance/policies");
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || "Failed to fetch policies");
                }

                const activePolicies = (data.policies || []).filter(
                    (policy: Policy) => policy.status === "active",
                );

                setPolicies(activePolicies);

                if (activePolicies.length > 0) {
                    setPolicyId(activePolicies[0]._id);
                }
            } catch (error) {
                toast.error(
                    error instanceof Error
                        ? error.message
                        : "Failed to fetch policies",
                );
            } finally {
                setLoading(false);
            }
        };

        loadPolicies();
    }, []);

    const handleSubmit = async () => {
        if (!policyId) {
            toast.warn("Please select an active insurance policy");
            return;
        }

        if (!incidentType) {
            toast.warn("Please select the incident type");
            return;
        }

        if (!incidentDate) {
            toast.warn("Please select the incident date");
            return;
        }

        if (!treatmentDate) {
            toast.warn("Please select the treatment date");
            return;
        }

        if (!admissionDate) {
            toast.warn("Please select the admission date");
            return;
        }

        if (!dischargeDate) {
            toast.warn("Please select the discharge date");
            return;
        }

        if (!estimatedAmount || Number(estimatedAmount) <= 0) {
            toast.warn("Please enter a valid estimated amount");
            return;
        }

        if (!claimedAmount || Number(claimedAmount) <= 0) {
            toast.warn("Please enter a valid claimed amount");
            return;
        }

        if (Number(claimedAmount) > Number(estimatedAmount)) {
            toast.warn("Claimed amount cannot be greater than the estimated amount");
            return;
        }

        const incident = new Date(incidentDate);
        const treatment = new Date(treatmentDate);
        const admission = new Date(admissionDate);
        const discharge = new Date(dischargeDate);

        if (treatment < incident) {
            toast.warn("Treatment date cannot be before the incident date");
            return;
        }

        if (admission < incident) {
            toast.warn("Admission date cannot be before the incident date");
            return;
        }

        if (discharge < admission) {
            toast.warn("Discharge date cannot be before the admission date");
            return;
        }

        try {
            setSubmitting(true);

            const response = await fetch("/api/insurance/claims", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    policy_id: policyId,
                    claim_type: claimType,
                    incident_type: incidentType,
                    incident_date: incidentDate,
                    treatment_date: treatmentDate,
                    admission_date: admissionDate,
                    discharge_date: dischargeDate,
                    estimated_amount: Number(estimatedAmount),
                    claimed_amount: Number(claimedAmount),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to submit insurance claim");
            }

            toast.success("Insurance claim submitted successfully");

            if (data.claim?._id) {
                window.location.href = `/patient/insurance/claims/${data.claim._id}`;
            } else {
                window.location.href = "/patient/insurance/claims";
            }
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Failed to submit insurance claim",
            );
        } finally {
            setSubmitting(false);
        }
    };

    const fieldClass =
        "mt-2 w-full rounded-xl border border-border bg-surface-secondary px-3 py-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary/50 focus:ring-4 focus:ring-primary/10";

    if (loading) {
        return (
            <main className="flex min-h-[60vh] items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </main>
        );
    }

    if (!policies.length) {
        return (
            <main className="min-h-[60vh] bg-background px-4 py-6 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-xl rounded-2xl border border-border bg-surface p-8 text-center shadow-sm">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-primary">
                        <ShieldCheck className="h-7 w-7" />
                    </div>

                    <h1 className="mt-4 text-xl font-bold text-foreground">
                        No Active Insurance Policy
                    </h1>

                    <p className="mt-2 text-sm leading-6 text-muted">
                        You need an active insurance policy before submitting a new
                        claim. A lapsed policy must be revived before new claims can
                        be submitted.
                    </p>

                    <Link
                        href="/patient/insurance"
                        className="mt-6 inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover"
                    >
                        View Insurance
                    </Link>
                </div>
            </main>
        );
    }

    const selectedPolicy = policies.find((policy) => policy._id === policyId);

    return (
        <main className="min-h-screen bg-background px-4 py-6 text-foreground sm:px-6 lg:px-8">
            <div className="mx-auto max-w-5xl space-y-6">
                <div>
                    <Link
                        href="/patient/insurance/claims"
                        className="inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-foreground"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Claims
                    </Link>

                    <h1 className="mt-4 text-2xl font-bold text-foreground sm:text-3xl">
                        File Insurance Claim
                    </h1>
                    <p className="mt-1 text-sm text-muted">
                        Submit your medical claim for review.
                    </p>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                        <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-primary">
                                    <ShieldCheck className="h-5 w-5" />
                                </div>

                                <div>
                                    <h2 className="font-semibold text-foreground">
                                        Insurance Policy
                                    </h2>
                                    <p className="text-sm text-muted">
                                        Select the policy for this claim.
                                    </p>
                                </div>
                            </div>

                            <select
                                value={policyId}
                                onChange={(event) => setPolicyId(event.target.value)}
                                className={fieldClass}
                            >
                                {policies.map((policy) => (
                                    <option
                                        key={policy._id}
                                        value={policy._id}
                                        className="bg-surface text-foreground"
                                    >
                                        {policy.policy_number || policy._id} —{" "}
                                        {policy.plan_id?.name || "Insurance Plan"}
                                    </option>
                                ))}
                            </select>

                            {selectedPolicy && (
                                <div className="mt-3 text-xs text-muted">
                                    Coverage:{" "}
                                    <span className="font-medium text-foreground">
                                        ₹
                                        {(
                                            selectedPolicy.plan_id?.coverage_amount || 0
                                        ).toLocaleString("en-IN")}
                                    </span>
                                </div>
                            )}
                        </section>

                        <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-primary">
                                    <FileText className="h-5 w-5" />
                                </div>

                                <div>
                                    <h2 className="font-semibold text-foreground">
                                        Claim Information
                                    </h2>
                                    <p className="text-sm text-muted">
                                        Provide the details related to your treatment.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 grid gap-5 sm:grid-cols-2">
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground">
                                        Claim Type
                                    </label>
                                    <select
                                        value={claimType}
                                        onChange={(event) =>
                                            setClaimType(
                                                event.target.value as
                                                | "cashless"
                                                | "reimbursement",
                                            )
                                        }
                                        className={fieldClass}
                                    >
                                        <option value="cashless" className="bg-surface text-foreground">
                                            Cashless
                                        </option>
                                        <option value="reimbursement" className="bg-surface text-foreground">
                                            Reimbursement
                                        </option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-muted-foreground">
                                        Incident Type
                                    </label>
                                    <select
                                        value={incidentType}
                                        onChange={(event) =>
                                            setIncidentType(event.target.value)
                                        }
                                        className={fieldClass}
                                    >
                                        <option value="" className="bg-surface text-foreground">
                                            Select incident
                                        </option>

                                        {incidentTypes.map((item) => (
                                            <option
                                                key={item.value}
                                                value={item.value}
                                                className="bg-surface text-foreground"
                                            >
                                                {item.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-muted-foreground">
                                        Incident Date
                                    </label>
                                    <input
                                        type="date"
                                        value={incidentDate}
                                        onChange={(event) =>
                                            setIncidentDate(event.target.value)
                                        }
                                        className={fieldClass}
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-muted-foreground">
                                        Treatment Date
                                    </label>
                                    <input
                                        type="date"
                                        value={treatmentDate}
                                        onChange={(event) =>
                                            setTreatmentDate(event.target.value)
                                        }
                                        className={fieldClass}
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-muted-foreground">
                                        Admission Date
                                    </label>
                                    <input
                                        type="date"
                                        value={admissionDate}
                                        onChange={(event) =>
                                            setAdmissionDate(event.target.value)
                                        }
                                        className={fieldClass}
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-muted-foreground">
                                        Discharge Date
                                    </label>
                                    <input
                                        type="date"
                                        value={dischargeDate}
                                        onChange={(event) =>
                                            setDischargeDate(event.target.value)
                                        }
                                        className={fieldClass}
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-muted-foreground">
                                        Estimated Amount
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={estimatedAmount}
                                        onChange={(event) =>
                                            setEstimatedAmount(event.target.value)
                                        }
                                        placeholder="₹0"
                                        className={fieldClass}
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-muted-foreground">
                                        Claimed Amount
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={claimedAmount}
                                        onChange={(event) =>
                                            setClaimedAmount(event.target.value)
                                        }
                                        placeholder="₹0"
                                        className={fieldClass}
                                    />
                                </div>
                            </div>
                        </section>
                    </div>

                    <aside className="h-fit rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6 lg:sticky lg:top-6">
                        <h2 className="font-semibold text-foreground">
                            Claim Summary
                        </h2>

                        <div className="mt-5 space-y-4 text-sm">
                            <div className="flex justify-between gap-4">
                                <span className="text-muted">Type</span>
                                <span className="capitalize text-foreground">
                                    {claimType}
                                </span>
                            </div>

                            <div className="flex justify-between gap-4">
                                <span className="text-muted">Incident</span>
                                <span className="capitalize text-foreground">
                                    {incidentType || "Not selected"}
                                </span>
                            </div>

                            <div className="border-t border-border pt-4">
                                <p className="text-xs text-muted">Claimed Amount</p>
                                <p className="mt-1 text-2xl font-bold text-foreground">
                                    ₹
                                    {Number(claimedAmount || 0).toLocaleString("en-IN")}
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            disabled={submitting}
                            onClick={handleSubmit}
                            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {submitting && (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            )}
                            Submit Claim
                        </button>

                        <p className="mt-4 text-center text-xs leading-5 text-muted">
                            Your claim will be reviewed by the SOMATIC insurance team.
                        </p>
                    </aside>
                </div>
            </div>
        </main>
    );
}