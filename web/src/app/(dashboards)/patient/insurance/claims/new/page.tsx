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
                const res = await fetch("/api/insurance/policies");
                const data = await res.json();

                if (!res.ok) throw new Error(data.error || "Failed to fetch policies");

                const activePolicies = (data.policies || []).filter((policy: Policy) => policy.status === "active");

                setPolicies(activePolicies);

                if (activePolicies.length) {
                    setPolicyId(activePolicies[0]._id);
                }
            } catch (error) {
                toast.error(error instanceof Error ? error.message : "Failed to fetch policies");
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

        if (!claimType) {
            toast.warn("Please select the claim type");
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

        if (new Date(treatmentDate) < new Date(incidentDate)) {
            toast.warn("Treatment date cannot be before the incident date");
            return;
        }

        if (new Date(admissionDate) < new Date(incidentDate)) {
            toast.warn("Admission date cannot be before the incident date");
            return;
        }

        if (new Date(dischargeDate) < new Date(admissionDate)) {
            toast.warn("Discharge date cannot be before the admission date");
            return;
        }

        try {
            setSubmitting(true);

            const res = await fetch("/api/insurance/claims", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
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

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to submit insurance claim");
            }

            toast.success("Insurance claim submitted successfully");

            window.location.href = `/patient/insurance/claims/${data.claim?._id}`;
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to submit insurance claim");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center bg-[#0b1220]">
                <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
            </div>
        );
    }

    if (!policies.length) {
        return (
            <div className="min-h-[60vh] bg-[#0b1220] p-4 md:p-6">
                <div className="mx-auto max-w-xl rounded-xl border border-slate-700/60 bg-[#111827] p-8 text-center">
                    <ShieldCheck className="mx-auto h-12 w-12 text-slate-600" />
                    <h1 className="mt-4 text-xl font-bold text-white">No Active Insurance Policy</h1>
                    <p className="mt-2 text-sm leading-6 text-slate-400">
                        You need an active insurance policy before submitting a claim.
                    </p>

                    <Link href="/patient/insurance" className="mt-6 inline-flex rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-purple-500">
                        View Insurance
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0b1220] p-4 md:p-6">
            <div className="mx-auto max-w-5xl space-y-6">
                <div className="flex items-center gap-3">
                    <Link href="/patient/insurance" className="rounded-lg border border-slate-700/60 bg-[#111827] p-2 text-slate-400 transition hover:border-slate-600 hover:text-white">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>

                    <div>
                        <h1 className="text-2xl font-bold text-white">File Insurance Claim</h1>
                        <p className="mt-1 text-sm text-slate-400">Submit your medical claim for review.</p>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                        <section className="rounded-xl border border-slate-700/60 bg-[#111827] p-6">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="h-5 w-5 text-purple-400" />
                                <h2 className="font-semibold text-white">Insurance Policy</h2>
                            </div>

                            <select
                                value={policyId}
                                onChange={(e) => setPolicyId(e.target.value)}
                                className="mt-4 w-full rounded-lg border border-slate-700/60 bg-[#172033] px-3 py-3 text-sm text-white outline-none focus:border-purple-500"
                            >
                                {policies.map((policy) => (
                                    <option key={policy._id} value={policy._id}>
                                        {policy.policy_number || policy._id} — {policy.plan_id?.name || "Insurance Plan"}
                                    </option>
                                ))}
                            </select>
                        </section>

                        <section className="rounded-xl border border-slate-700/60 bg-[#111827] p-6">
                            <div className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-purple-400" />
                                <h2 className="font-semibold text-white">Claim Information</h2>
                            </div>

                            <div className="mt-5 grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="text-xs text-slate-400">Claim Type</label>
                                    <select
                                        value={claimType}
                                        required
                                        onChange={(e) => setClaimType(e.target.value as "cashless" | "reimbursement")}
                                        className="mt-2 w-full rounded-lg border border-slate-700/60 bg-[#172033] px-3 py-3 text-sm text-white outline-none focus:border-purple-500"
                                    >
                                        <option value="cashless">Cashless</option>
                                        <option value="reimbursement">Reimbursement</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-xs text-slate-400">Incident Type</label>
                                    <select
                                        value={incidentType}
                                        required
                                        onChange={(e) => setIncidentType(e.target.value)}
                                        className="mt-2 w-full rounded-lg border border-slate-700/60 bg-[#172033] px-3 py-3 text-sm text-white outline-none focus:border-purple-500"
                                    >
                                        <option value="">Select incident</option>
                                        {incidentTypes.map((item) => (
                                            <option key={item.value} value={item.value}>
                                                {item.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-xs text-slate-400">Incident Date</label>
                                    <input
                                        type="date"
                                        value={incidentDate}
                                        required
                                        onChange={(e) => setIncidentDate(e.target.value)}
                                        className="mt-2 w-full rounded-lg border border-slate-700/60 bg-[#172033] px-3 py-3 text-sm text-white outline-none focus:border-purple-500"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs text-slate-400">Treatment Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={treatmentDate}
                                        onChange={(e) => setTreatmentDate(e.target.value)}
                                        className="mt-2 w-full rounded-lg border border-slate-700/60 bg-[#172033] px-3 py-3 text-sm text-white outline-none focus:border-purple-500"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs text-slate-400">Admission Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={admissionDate}
                                        onChange={(e) => setAdmissionDate(e.target.value)}
                                        className="mt-2 w-full rounded-lg border border-slate-700/60 bg-[#172033] px-3 py-3 text-sm text-white outline-none focus:border-purple-500"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs text-slate-400">Discharge Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={dischargeDate}
                                        onChange={(e) => setDischargeDate(e.target.value)}
                                        className="mt-2 w-full rounded-lg border border-slate-700/60 bg-[#172033] px-3 py-3 text-sm text-white outline-none focus:border-purple-500"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs text-slate-400">Estimated Amount</label>
                                    <input
                                        type="number"
                                        min="0"
                                        required
                                        value={estimatedAmount}
                                        onChange={(e) => setEstimatedAmount(e.target.value)}
                                        placeholder="₹0"
                                        className="mt-2 w-full rounded-lg border border-slate-700/60 bg-[#172033] px-3 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-purple-500"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs text-slate-400">Claimed Amount</label>
                                    <input
                                        type="number"
                                        min="1"
                                        required
                                        value={claimedAmount}
                                        onChange={(e) => setClaimedAmount(e.target.value)}
                                        placeholder="₹0"
                                        className="mt-2 w-full rounded-lg border border-slate-700/60 bg-[#172033] px-3 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-purple-500"
                                    />
                                </div>
                            </div>
                        </section>
                    </div>

                    <aside className="h-fit rounded-xl border border-slate-700/60 bg-[#111827] p-6 lg:sticky lg:top-6">
                        <h2 className="font-semibold text-white">Claim Summary</h2>

                        <div className="mt-5 space-y-4 text-sm">
                            <div className="flex justify-between gap-4">
                                <span className="text-slate-500">Type</span>
                                <span className="capitalize text-slate-200">{claimType}</span>
                            </div>

                            <div className="flex justify-between gap-4">
                                <span className="text-slate-500">Incident</span>
                                <span className="capitalize text-slate-200">{incidentType || "Not selected"}</span>
                            </div>

                            <div className="border-t border-slate-700/60 pt-4">
                                <p className="text-xs text-slate-500">Claimed Amount</p>
                                <p className="mt-1 text-2xl font-bold text-white">
                                    ₹{Number(claimedAmount || 0).toLocaleString("en-IN")}
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            disabled={submitting}
                            onClick={handleSubmit}
                            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                            Submit Claim
                        </button>

                        <p className="mt-4 text-center text-xs leading-5 text-slate-500">
                            Your claim will be reviewed by the SOMATIC insurance team.
                        </p>
                    </aside>
                </div>
            </div>
        </div>
    );
}