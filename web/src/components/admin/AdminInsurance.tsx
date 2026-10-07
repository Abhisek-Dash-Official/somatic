"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import {
    ArrowLeft,
    ArrowRight,
    Ban,
    Check,
    Edit,
    FileText,
    Loader2,
    Plus,
    Search,
    ShieldCheck,
    X,
} from "lucide-react";
import { toast } from "react-toastify";
import type { IInsuranceClaim, IInsurancePlan, IInsurancePolicy } from "@/types/models";

type Tab = "policies" | "claims" | "plans";

type UserSummary = {
    _id: string;
    username: string;
    email: string;
    contact_no?: string;
};

type PlanSummary = {
    _id: string;
    name: string;
    description?: string;
    coverage_amount: number;
    premium_amount: number;
    premium_frequency: string;
    policy_term_years: number;
    features?: string[];
};

type Policy = Omit<IInsurancePolicy, "user_id" | "plan_id" | "approved_by" | "rejected_by"> & {
    user_id?: UserSummary;
    plan_id?: PlanSummary;
    approved_by?: { username: string; email: string };
    rejected_by?: { username: string; email: string };
};

type Claim = Omit<IInsuranceClaim, "user_id" | "policy_id"> & {
    user_id?: UserSummary;
    policy_id?: {
        _id: string;
        policy_number?: string;
        status: string;
        start_date?: string | Date;
        expiry_date?: string | Date;
        plan_id?: PlanSummary;
    };
};

type Plan = IInsurancePlan;

const policyStatuses = ["all", "pending", "approved", "payment_pending", "active", "revival_pending", "lapsed", "rejected", "expired", "cancelled"];

const claimStatuses = ["all", "draft", "submitted", "under_review", "documents_required", "approved", "partially_approved", "rejected", "settled"];

const planStatuses = ["all", "active", "inactive"];

const emptyPlan = {
    name: "",
    description: "",
    coverage_amount: "",
    premium_amount: "",
    premium_frequency: "yearly",
    policy_term_years: "1",
    features: "",
    is_active: true,
};

const formatDate = (value?: string | Date) => {
    if (!value) return "—";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const formatDateTime = (value?: string | Date) => {
    if (!value) return "—";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

const formatAmount = (value?: number) => typeof value === "number" ? `₹${value.toLocaleString("en-IN")}` : "—";

const formatStatus = (status: string) => status.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());

const statusClass = (status: string) => {
    if (["active", "approved", "settled"].includes(status)) return "border-success/20 bg-success/10 text-success";

    if (["pending", "submitted", "under_review", "payment_pending", "revival_pending"].includes(status)) {
        return "border-warning/20 bg-warning/10 text-warning";
    }

    if (["rejected", "cancelled", "lapsed"].includes(status)) return "border-danger/20 bg-danger/10 text-danger";
    if (status === "documents_required") return "border-info/20 bg-info/10 text-info";

    return "border-border bg-muted/10 text-muted";
};

export default function AdminInsurance() {
    const [tab, setTab] = useState<Tab>("policies");

    const [policies, setPolicies] = useState<Policy[]>([]);
    const [claims, setClaims] = useState<Claim[]>([]);
    const [plans, setPlans] = useState<Plan[]>([]);

    const [policyPage, setPolicyPage] = useState(1);
    const [claimPage, setClaimPage] = useState(1);
    const [planPage, setPlanPage] = useState(1);

    const [policyPages, setPolicyPages] = useState(1);
    const [claimPages, setClaimPages] = useState(1);
    const [planPages, setPlanPages] = useState(1);

    const [policySearch, setPolicySearch] = useState("");
    const [claimSearch, setClaimSearch] = useState("");
    const [planSearch, setPlanSearch] = useState("");

    const [policyStatus, setPolicyStatus] = useState("all");
    const [claimStatus, setClaimStatus] = useState("all");
    const [planStatus, setPlanStatus] = useState("all");

    const [loading, setLoading] = useState(false);
    const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
    const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);

    const [policyModalLoading, setPolicyModalLoading] = useState(false);
    const [claimModalLoading, setClaimModalLoading] = useState(false);

    const [cancelPolicy, setCancelPolicy] = useState<Policy | null>(null);
    const [cancelReason, setCancelReason] = useState("");
    const [cancelling, setCancelling] = useState(false);

    const [planModal, setPlanModal] = useState(false);
    const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
    const [savingPlan, setSavingPlan] = useState(false);
    const [planForm, setPlanForm] = useState(emptyPlan);

    const fetchPolicies = useCallback(async () => {
        setLoading(true);

        try {
            const params = new URLSearchParams({ page: String(policyPage), limit: "10", search: policySearch, status: policyStatus });
            const res = await fetch(`/api/admin/insurance/policies?${params}`);
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Failed to fetch policies");

            setPolicies(data.policies || []);
            setPolicyPages(data.pagination?.totalPages || 1);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to fetch policies");
        } finally {
            setLoading(false);
        }
    }, [policyPage, policySearch, policyStatus]);

    const fetchClaims = useCallback(async () => {
        setLoading(true);

        try {
            const params = new URLSearchParams({ page: String(claimPage), limit: "10", search: claimSearch, status: claimStatus });
            const res = await fetch(`/api/admin/insurance/claims?${params}`);
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Failed to fetch claims");

            setClaims(data.claims || []);
            setClaimPages(data.pagination?.totalPages || 1);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to fetch claims");
        } finally {
            setLoading(false);
        }
    }, [claimPage, claimSearch, claimStatus]);

    const fetchPlans = useCallback(async () => {
        setLoading(true);

        try {
            const params = new URLSearchParams({ page: String(planPage), limit: "10", search: planSearch, status: planStatus });
            const res = await fetch(`/api/admin/insurance/plans?${params}`);
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Failed to fetch plans");

            setPlans(data.plans || []);
            setPlanPages(data.pagination?.totalPages || 1);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to fetch plans");
        } finally {
            setLoading(false);
        }
    }, [planPage, planSearch, planStatus]);

    useEffect(() => {
        if (tab === "policies") fetchPolicies();
        if (tab === "claims") fetchClaims();
        if (tab === "plans") fetchPlans();
    }, [tab, fetchPolicies, fetchClaims, fetchPlans]);

    const openPolicy = async (id: string) => {
        setPolicyModalLoading(true);

        try {
            const res = await fetch(`/api/admin/insurance/policies/${id}`);
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Failed to fetch policy");

            setSelectedPolicy(data.policy);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to fetch policy");
        } finally {
            setPolicyModalLoading(false);
        }
    };

    const openClaim = async (id: string) => {
        setClaimModalLoading(true);

        try {
            const res = await fetch(`/api/admin/insurance/claims/${id}`);
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Failed to fetch claim");

            setSelectedClaim(data.claim);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to fetch claim");
        } finally {
            setClaimModalLoading(false);
        }
    };

    const submitCancelPolicy = async () => {
        if (!cancelPolicy) return;

        if (!cancelReason.trim()) {
            toast.warn("Please provide a cancellation reason");
            return;
        }

        setCancelling(true);

        try {
            const res = await fetch(`/api/admin/insurance/policies/${cancelPolicy._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "cancel", reason: cancelReason.trim() }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Failed to cancel policy");

            toast.success("Insurance policy cancelled successfully");
            setCancelPolicy(null);
            setCancelReason("");
            setSelectedPolicy(null);
            fetchPolicies();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to cancel policy");
        } finally {
            setCancelling(false);
        }
    };

    const openCreatePlan = () => {
        setEditingPlan(null);
        setPlanForm(emptyPlan);
        setPlanModal(true);
    };

    const openEditPlan = (plan: Plan) => {
        setEditingPlan(plan);
        setPlanForm({
            name: plan.name,
            description: plan.description || "",
            coverage_amount: String(plan.coverage_amount),
            premium_amount: String(plan.premium_amount),
            premium_frequency: plan.premium_frequency,
            policy_term_years: String(plan.policy_term_years),
            features: (plan.features || []).join("\n"),
            is_active: plan.is_active,
        });
        setPlanModal(true);
    };

    const savePlan = async () => {
        if (!planForm.name.trim()) {
            toast.warn("Plan name is required");
            return;
        }

        if (!planForm.coverage_amount || Number(planForm.coverage_amount) < 0) {
            toast.warn("Enter a valid coverage amount");
            return;
        }

        if (!planForm.premium_amount || Number(planForm.premium_amount) < 0) {
            toast.warn("Enter a valid premium amount");
            return;
        }

        if (!planForm.policy_term_years || Number(planForm.policy_term_years) < 1) {
            toast.warn("Policy term must be at least 1 year");
            return;
        }

        setSavingPlan(true);

        try {
            const payload = {
                name: planForm.name.trim(),
                description: planForm.description.trim(),
                coverage_amount: Number(planForm.coverage_amount),
                premium_amount: Number(planForm.premium_amount),
                premium_frequency: planForm.premium_frequency,
                policy_term_years: Number(planForm.policy_term_years),
                features: planForm.features.split("\n").map((item) => item.trim()).filter(Boolean),
                is_active: planForm.is_active,
            };

            const url = editingPlan ? `/api/admin/insurance/plans/${editingPlan._id}` : "/api/admin/insurance/plans";

            const res = await fetch(url, {
                method: editingPlan ? "PATCH" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Failed to save plan");

            toast.success(editingPlan ? "Insurance plan updated successfully" : "Insurance plan created successfully");

            setPlanModal(false);
            fetchPlans();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to save plan");
        } finally {
            setSavingPlan(false);
        }
    };

    const togglePlan = async (plan: Plan) => {
        try {
            const res = await fetch(`/api/admin/insurance/plans/${plan._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ is_active: !plan.is_active }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Failed to update plan");

            toast.success(plan.is_active ? "Plan deactivated successfully" : "Plan activated successfully");
            fetchPlans();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to update plan");
        }
    };

    return (
        <div className="min-h-screen space-y-6 bg-background p-4 text-foreground sm:p-6 lg:p-8">
            <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
                <h1 className="text-xl font-bold sm:text-2xl">Insurance Management</h1>
                <p className="mt-1 text-sm text-muted">Manage insurance policies, claims and plans.</p>
            </div>

            <div className="flex w-full gap-1 overflow-x-auto rounded-xl border border-border bg-surface p-1 sm:w-fit">
                {[
                    { id: "policies" as Tab, label: "Policies", icon: ShieldCheck },
                    { id: "claims" as Tab, label: "Claims", icon: FileText },
                    { id: "plans" as Tab, label: "Plans", icon: Check },
                ].map(({ id, label, icon: Icon }) => (
                    <button
                        key={id}
                        onClick={() => setTab(id)}
                        className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium transition ${tab === id ? "bg-accent text-foreground" : "text-muted hover:text-foreground"}`}
                    >
                        <Icon className="h-4 w-4" />
                        {label}
                    </button>
                ))}
            </div>

            {tab === "policies" && (
                <section className="space-y-4">
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <SearchBar
                            value={policySearch}
                            onChange={(value) => {
                                setPolicySearch(value);
                                setPolicyPage(1);
                            }}
                            placeholder="Search policy, patient or plan..."
                        />
                        <StatusSelect
                            value={policyStatus}
                            onChange={(value) => {
                                setPolicyStatus(value);
                                setPolicyPage(1);
                            }}
                            statuses={policyStatuses}
                        />
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-225">
                                <thead className="bg-surface-secondary">
                                    <tr className="text-left text-xs uppercase text-muted-foreground">
                                        <th className="px-4 py-3">Policy</th>
                                        <th className="px-4 py-3">Patient</th>
                                        <th className="px-4 py-3">Plan</th>
                                        <th className="px-4 py-3">Premium</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3">Created</th>
                                        <th className="px-4 py-3">Action</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-border">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={7} className="py-16 text-center">
                                                <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
                                            </td>
                                        </tr>
                                    ) : policies.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="py-16 text-center text-sm text-muted">No insurance policies found.</td>
                                        </tr>
                                    ) : (
                                        policies.map((policy) => (
                                            <tr key={policy._id} className="transition hover:bg-surface-secondary">
                                                <td className="px-4 py-4">
                                                    <p className="text-sm font-medium">{policy.policy_number || "Pending"}</p>
                                                    <p className="mt-1 text-xs text-muted">{policy._id}</p>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <p className="text-sm">{policy.user_id?.username || "—"}</p>
                                                    <p className="text-xs text-muted">{policy.user_id?.email || "—"}</p>
                                                </td>
                                                <td className="px-4 py-4 text-sm text-muted">{policy.plan_id?.name || "—"}</td>
                                                <td className="px-4 py-4 text-sm text-muted">{formatAmount(policy.plan_id?.premium_amount)}</td>
                                                <td className="px-4 py-4">
                                                    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs ${statusClass(policy.status)}`}>{formatStatus(policy.status)}</span>
                                                </td>
                                                <td className="px-4 py-4 text-sm text-muted">{formatDate(policy.created_at)}</td>
                                                <td className="px-4 py-4">
                                                    <button onClick={() => openPolicy(policy._id)} className="rounded-xl px-2 py-1 text-sm text-primary transition hover:bg-accent hover:text-primary-hover">View</button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <Pagination page={policyPage} pages={policyPages} setPage={setPolicyPage} />
                </section>
            )}

            {tab === "claims" && (
                <section className="space-y-4">
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <SearchBar
                            value={claimSearch}
                            onChange={(value) => {
                                setClaimSearch(value);
                                setClaimPage(1);
                            }}
                            placeholder="Search claim, patient or policy..."
                        />
                        <StatusSelect
                            value={claimStatus}
                            onChange={(value) => {
                                setClaimStatus(value);
                                setClaimPage(1);
                            }}
                            statuses={claimStatuses}
                        />
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-237.5">
                                <thead className="bg-surface-secondary">
                                    <tr className="text-left text-xs uppercase text-muted-foreground">
                                        <th className="px-4 py-3">Claim</th>
                                        <th className="px-4 py-3">Patient</th>
                                        <th className="px-4 py-3">Policy</th>
                                        <th className="px-4 py-3">Type</th>
                                        <th className="px-4 py-3">Claimed</th>
                                        <th className="px-4 py-3">Approved</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3">Action</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-border">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={8} className="py-16 text-center">
                                                <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
                                            </td>
                                        </tr>
                                    ) : claims.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="py-16 text-center text-sm text-muted">No insurance claims found.</td>
                                        </tr>
                                    ) : (
                                        claims.map((claim) => (
                                            <tr key={claim._id} className="transition hover:bg-surface-secondary">
                                                <td className="px-4 py-4">
                                                    <p className="text-sm font-medium">{claim.claim_number || "—"}</p>
                                                    <p className="mt-1 text-xs text-muted">{formatDate(claim.created_at)}</p>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <p className="text-sm">{claim.user_id?.username || "—"}</p>
                                                    <p className="text-xs text-muted">{claim.user_id?.email || "—"}</p>
                                                </td>
                                                <td className="px-4 py-4 text-sm text-muted">{claim.policy_id?.policy_number || "—"}</td>
                                                <td className="px-4 py-4 text-sm text-muted">{formatStatus(claim.claim_type)}</td>
                                                <td className="px-4 py-4 text-sm text-muted">{formatAmount(claim.claimed_amount)}</td>
                                                <td className="px-4 py-4 text-sm text-muted">{formatAmount(claim.approved_amount)}</td>
                                                <td className="px-4 py-4">
                                                    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs ${statusClass(claim.status)}`}>{formatStatus(claim.status)}</span>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <button onClick={() => openClaim(claim._id)} className="rounded-xl px-2 py-1 text-sm text-primary transition hover:bg-accent hover:text-primary-hover">View</button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <Pagination page={claimPage} pages={claimPages} setPage={setClaimPage} />
                </section>
            )}

            {tab === "plans" && (
                <section className="space-y-4">
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <SearchBar
                            value={planSearch}
                            onChange={(value) => {
                                setPlanSearch(value);
                                setPlanPage(1);
                            }}
                            placeholder="Search insurance plan..."
                        />
                        <StatusSelect
                            value={planStatus}
                            onChange={(value) => {
                                setPlanStatus(value);
                                setPlanPage(1);
                            }}
                            statuses={planStatuses}
                        />
                        <button onClick={openCreatePlan} className="flex items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary-hover">
                            <Plus className="h-4 w-4" />
                            Add Plan
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        {loading ? (
                            <div className="rounded-2xl border border-border bg-surface py-16 text-center lg:col-span-2">
                                <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
                            </div>
                        ) : plans.length === 0 ? (
                            <div className="rounded-2xl border border-border bg-surface py-16 text-center text-sm text-muted lg:col-span-2">No insurance plans found.</div>
                        ) : (
                            plans.map((plan) => (
                                <div key={String(plan._id)} className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-base font-semibold">{plan.name}</h3>
                                                <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] ${plan.is_active ? statusClass("active") : "border-border bg-muted/10 text-muted"}`}>
                                                    {plan.is_active ? "Active" : "Inactive"}
                                                </span>
                                            </div>
                                            <p className="mt-2 text-sm text-muted">{plan.description || "No description provided."}</p>
                                        </div>

                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-accent">
                                            <ShieldCheck className="h-5 w-5 text-primary" />
                                        </div>
                                    </div>

                                    <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                                        <Info label="Coverage" value={formatAmount(plan.coverage_amount)} />
                                        <Info label="Premium" value={formatAmount(plan.premium_amount)} />
                                        <Info label="Frequency" value={formatStatus(plan.premium_frequency)} />
                                        <Info label="Term" value={`${plan.policy_term_years} year${plan.policy_term_years !== 1 ? "s" : ""}`} />
                                    </div>

                                    {plan.features?.length ? (
                                        <div className="mt-5 rounded-xl border border-border bg-surface-secondary p-3">
                                            <p className="mb-2 text-xs font-medium text-muted">Features</p>
                                            <div className="flex flex-wrap gap-2">
                                                {plan.features.map((feature, index) => (
                                                    <span key={`${feature}-${index}`} className="rounded-full border border-border bg-surface px-2.5 py-1 text-xs text-muted">{feature}</span>
                                                ))}
                                            </div>
                                        </div>
                                    ) : null}

                                    <div className="mt-5 flex gap-2 border-t border-border pt-4">
                                        <button onClick={() => openEditPlan(plan)} className="flex items-center gap-2 rounded-xl border border-border bg-surface-secondary px-3 py-2 text-sm text-muted transition hover:bg-accent hover:text-foreground">
                                            <Edit className="h-4 w-4" />
                                            Edit
                                        </button>

                                        <button
                                            onClick={() => togglePlan(plan)}
                                            className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm ${plan.is_active ? "border-danger/20 text-danger hover:bg-danger/10" : "border-success/20 text-success hover:bg-success/10"}`}
                                        >
                                            {plan.is_active ? <Ban className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                                            {plan.is_active ? "Deactivate" : "Activate"}
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <Pagination page={planPage} pages={planPages} setPage={setPlanPage} />
                </section>
            )}

            {selectedPolicy && (
                <Modal title="Policy Details" onClose={() => setSelectedPolicy(null)}>
                    <div className="space-y-5">
                        <div className="flex items-start justify-between gap-4 rounded-xl border border-border bg-surface-secondary p-4">
                            <div>
                                <p className="text-xs text-muted">Policy Number</p>
                                <p className="mt-1 text-lg font-semibold">{selectedPolicy.policy_number || "Pending"}</p>
                            </div>
                            <span className={`rounded-full border px-3 py-1 text-xs ${statusClass(selectedPolicy.status)}`}>{formatStatus(selectedPolicy.status)}</span>
                        </div>

                        <div>
                            <h3 className="mb-3 text-sm font-medium">Policy Information</h3>
                            <InfoGrid>
                                <Info label="Patient" value={selectedPolicy.user_id?.username} />
                                <Info label="Email" value={selectedPolicy.user_id?.email} />
                                <Info label="Contact" value={selectedPolicy.user_id?.contact_no} />
                                <Info label="Plan" value={selectedPolicy.plan_id?.name} />
                                <Info label="Coverage" value={formatAmount(selectedPolicy.plan_id?.coverage_amount)} />
                                <Info label="Premium" value={formatAmount(selectedPolicy.plan_id?.premium_amount)} />
                                <Info label="Frequency" value={selectedPolicy.plan_id?.premium_frequency ? formatStatus(selectedPolicy.plan_id.premium_frequency) : "—"} />
                                <Info label="Policy Term" value={selectedPolicy.plan_id?.policy_term_years ? `${selectedPolicy.plan_id.policy_term_years} year${selectedPolicy.plan_id.policy_term_years !== 1 ? "s" : ""}` : "—"} />
                                <Info label="Start Date" value={formatDate(selectedPolicy.start_date)} />
                                <Info label="Expiry Date" value={formatDate(selectedPolicy.expiry_date)} />
                            </InfoGrid>
                        </div>

                        <div>
                            <h3 className="mb-3 text-sm font-medium">Premium Lifecycle</h3>
                            <InfoGrid>
                                <Info label="Next Payment Due" value={formatDate(selectedPolicy.next_payment_due_at)} />
                                <Info label="Last Payment" value={formatDateTime(selectedPolicy.last_payment_at)} />
                                <Info label="Grace Period Ends" value={formatDate(selectedPolicy.grace_period_ends_at)} />
                                <Info label="Premiums Completed" value={String(selectedPolicy.premium_payments_completed ?? 0)} />
                                <Info label="Lapsed At" value={formatDateTime(selectedPolicy.lapsed_at)} />
                                <Info label="Revival Requested" value={formatDateTime(selectedPolicy.revival_requested_at)} />
                                <Info label="Revival Approved" value={formatDateTime(selectedPolicy.revival_approved_at)} />
                            </InfoGrid>
                        </div>

                        <div>
                            <h3 className="mb-3 text-sm font-medium">Insured Members</h3>
                            <div className="space-y-2">
                                {selectedPolicy.insured_members?.length ? (
                                    selectedPolicy.insured_members.map((member, index) => (
                                        <div key={index} className="rounded-xl border border-border bg-surface-secondary p-3">
                                            <p className="text-sm">{member.name}</p>
                                            <p className="mt-1 text-xs text-muted">{member.relationship}{member.date_of_birth ? ` · ${formatDate(member.date_of_birth)}` : ""}</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="rounded-xl border border-border bg-surface-secondary p-3">
                                        <p className="text-sm text-muted">No insured members found.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {selectedPolicy.documents?.length ? (
                            <div>
                                <h3 className="mb-3 text-sm font-medium">Documents</h3>
                                <div className="space-y-2">
                                    {selectedPolicy.documents.map((document, index) => (
                                        <a
                                            key={index}
                                            href={document.file_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-between rounded-xl border border-border bg-surface-secondary p-3 transition hover:bg-accent"
                                        >
                                            <div>
                                                <p className="text-sm">{document.type ? formatStatus(document.type) : `Document ${index + 1}`}</p>
                                                <p className="mt-1 text-xs text-muted">{formatDate(document.uploaded_at)}</p>
                                            </div>
                                            <ArrowRight className="h-4 w-4 text-muted" />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        ) : null}

                        {selectedPolicy.rejection_reason && (
                            <div className="rounded-xl border border-danger/20 bg-danger/10 p-3">
                                <p className="text-xs text-danger">Reason</p>
                                <p className="mt-1 text-sm text-muted">{selectedPolicy.rejection_reason}</p>
                            </div>
                        )}

                        {!["cancelled", "expired"].includes(selectedPolicy.status) && (
                            <button
                                onClick={() => {
                                    setCancelPolicy(selectedPolicy);
                                    setCancelReason("");
                                }}
                                className="flex w-full items-center justify-center gap-2 rounded-xl border border-danger/20 py-2.5 text-sm text-danger transition hover:bg-danger/10"
                            >
                                <Ban className="h-4 w-4" />
                                Cancel Policy
                            </button>
                        )}
                    </div>
                </Modal>
            )}

            {selectedClaim && (
                <Modal title="Claim Details" onClose={() => setSelectedClaim(null)}>
                    <div className="space-y-5">
                        <div className="flex items-start justify-between gap-4 rounded-xl border border-border bg-surface-secondary p-4">
                            <div>
                                <p className="text-xs text-muted">Claim Number</p>
                                <p className="mt-1 text-lg font-semibold">{selectedClaim.claim_number || "—"}</p>
                            </div>
                            <span className={`rounded-full border px-3 py-1 text-xs ${statusClass(selectedClaim.status)}`}>{formatStatus(selectedClaim.status)}</span>
                        </div>

                        <InfoGrid>
                            <Info label="Patient" value={selectedClaim.user_id?.username} />
                            <Info label="Email" value={selectedClaim.user_id?.email} />
                            <Info label="Policy" value={selectedClaim.policy_id?.policy_number} />
                            <Info label="Plan" value={selectedClaim.policy_id?.plan_id?.name} />
                            <Info label="Claim Type" value={formatStatus(selectedClaim.claim_type)} />
                            <Info label="Incident Type" value={selectedClaim.incident_type ? formatStatus(selectedClaim.incident_type) : "—"} />
                            <Info label="Estimated Amount" value={formatAmount(selectedClaim.estimated_amount)} />
                            <Info label="Claimed Amount" value={formatAmount(selectedClaim.claimed_amount)} />
                            <Info label="Approved Amount" value={formatAmount(selectedClaim.approved_amount)} />
                            <Info label="Incident Date" value={formatDate(selectedClaim.incident_date)} />
                            <Info label="Treatment Date" value={formatDate(selectedClaim.treatment_date)} />
                            <Info label="Admission Date" value={formatDate(selectedClaim.admission_date)} />
                            <Info label="Discharge Date" value={formatDate(selectedClaim.discharge_date)} />
                        </InfoGrid>

                        {selectedClaim.required_documents?.length ? (
                            <div>
                                <h3 className="mb-2 text-sm font-medium">Required Documents</h3>
                                <div className="flex flex-wrap gap-2 rounded-xl border border-border bg-surface-secondary p-3">
                                    {selectedClaim.required_documents.map((document) => (
                                        <span key={document} className="rounded-full border border-info/20 bg-info/10 px-2.5 py-1 text-xs text-info">{document}</span>
                                    ))}
                                </div>
                            </div>
                        ) : null}

                        {selectedClaim.documents?.length ? (
                            <div>
                                <h3 className="mb-2 text-sm font-medium">Submitted Documents</h3>
                                <div className="space-y-2">
                                    {selectedClaim.documents.map((document, index) => (
                                        <a
                                            key={index}
                                            href={document.file_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-between rounded-xl border border-border bg-surface-secondary p-3 transition hover:bg-accent"
                                        >
                                            <div>
                                                <p className="text-sm">{document.type}</p>
                                                <p className="mt-1 text-xs text-muted">{formatDate(document.uploaded_at)}</p>
                                            </div>
                                            <ArrowRight className="h-4 w-4 text-muted" />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        ) : null}

                        {selectedClaim.rejection_reason && (
                            <div className="rounded-xl border border-danger/20 bg-danger/10 p-3">
                                <p className="text-xs text-danger">Rejection Reason</p>
                                <p className="mt-1 text-sm text-muted">{selectedClaim.rejection_reason}</p>
                            </div>
                        )}
                    </div>
                </Modal>
            )}

            {cancelPolicy && (
                <Modal title="Cancel Insurance Policy" onClose={() => !cancelling && setCancelPolicy(null)}>
                    <div className="space-y-5">
                        <div className="rounded-xl border border-danger/20 bg-danger/10 p-4">
                            <p className="text-sm font-medium">Cancel {cancelPolicy.policy_number || "this policy"}?</p>
                            <p className="mt-1 text-xs text-muted">This will change the policy status to cancelled.</p>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm text-muted">Cancellation Reason</label>
                            <textarea
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                rows={4}
                                placeholder="Enter cancellation reason..."
                                className="w-full resize-none rounded-xl border border-border bg-surface-secondary px-3 py-2.5 text-sm outline-none placeholder:text-muted focus:border-primary focus:ring-4 focus:ring-primary/10"
                            />
                        </div>

                        <div className="flex justify-end gap-2">
                            <button
                                disabled={cancelling}
                                onClick={() => setCancelPolicy(null)}
                                className="rounded-xl border border-border bg-surface-secondary px-4 py-2.5 text-sm text-muted transition hover:bg-accent hover:text-foreground disabled:opacity-50"
                            >
                                Keep Policy
                            </button>

                            <button
                                disabled={cancelling}
                                onClick={submitCancelPolicy}
                                className="flex items-center gap-2 rounded-xl bg-danger px-4 py-2.5 text-sm text-white transition hover:bg-danger/90 disabled:opacity-50"
                            >
                                {cancelling && <Loader2 className="h-4 w-4 animate-spin" />}
                                Cancel Policy
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {planModal && (
                <Modal
                    title={editingPlan ? "Edit Insurance Plan" : "Create Insurance Plan"}
                    onClose={() => !savingPlan && setPlanModal(false)}
                >
                    <div className="space-y-4">
                        <Input
                            label="Plan Name"
                            value={planForm.name}
                            onChange={(value) => setPlanForm((form) => ({ ...form, name: value }))}
                            placeholder="e.g. Somatic Care Plus"
                        />

                        <div>
                            <label className="mb-2 block text-sm text-muted">Description</label>
                            <textarea
                                value={planForm.description}
                                onChange={(e) => setPlanForm((form) => ({ ...form, description: e.target.value }))}
                                rows={3}
                                placeholder="Describe the insurance plan..."
                                className="w-full resize-none rounded-xl border border-border bg-surface-secondary px-3 py-2.5 text-sm outline-none placeholder:text-muted focus:border-primary focus:ring-4 focus:ring-primary/10"
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <Input
                                label="Coverage Amount"
                                type="number"
                                value={planForm.coverage_amount}
                                onChange={(value) => setPlanForm((form) => ({ ...form, coverage_amount: value }))}
                                placeholder="500000"
                            />
                            <Input
                                label="Premium Amount"
                                type="number"
                                value={planForm.premium_amount}
                                onChange={(value) => setPlanForm((form) => ({ ...form, premium_amount: value }))}
                                placeholder="12000"
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm text-muted">Premium Frequency</label>
                                <select
                                    value={planForm.premium_frequency}
                                    onChange={(e) => setPlanForm((form) => ({ ...form, premium_frequency: e.target.value }))}
                                    className="w-full rounded-xl border border-border bg-surface-secondary px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                                >
                                    <option value="monthly">Monthly</option>
                                    <option value="quarterly">Quarterly</option>
                                    <option value="half_yearly">Half Yearly</option>
                                    <option value="yearly">Yearly</option>
                                </select>
                            </div>

                            <Input
                                label="Policy Term (Years)"
                                type="number"
                                value={planForm.policy_term_years}
                                onChange={(value) => setPlanForm((form) => ({ ...form, policy_term_years: value }))}
                                placeholder="1"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm text-muted">Features</label>
                            <textarea
                                value={planForm.features}
                                onChange={(e) => setPlanForm((form) => ({ ...form, features: e.target.value }))}
                                rows={5}
                                placeholder="Enter one feature per line"
                                className="w-full resize-none rounded-xl border border-border bg-surface-secondary px-3 py-2.5 text-sm outline-none placeholder:text-muted focus:border-primary focus:ring-4 focus:ring-primary/10"
                            />
                        </div>

                        <div className="rounded-xl border border-border bg-surface-secondary p-3">
                            <label className="flex cursor-pointer items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={planForm.is_active}
                                    onChange={(e) => setPlanForm((form) => ({ ...form, is_active: e.target.checked }))}
                                    className="h-4 w-4 accent-primary"
                                />
                                <span className="text-sm text-muted">Plan is active</span>
                            </label>
                        </div>

                        <div className="flex justify-end gap-2 border-t border-border pt-4">
                            <button
                                disabled={savingPlan}
                                onClick={() => setPlanModal(false)}
                                className="rounded-xl border border-border bg-surface-secondary px-4 py-2.5 text-sm text-muted transition hover:bg-accent hover:text-foreground disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                disabled={savingPlan}
                                onClick={savePlan}
                                className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm text-primary-foreground transition hover:bg-primary-hover disabled:opacity-50"
                            >
                                {savingPlan && <Loader2 className="h-4 w-4 animate-spin" />}
                                {editingPlan ? "Save Changes" : "Create Plan"}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {policyModalLoading || claimModalLoading ? (
                <div className="fixed inset-0 z-60 flex items-center justify-center bg-background/80">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-surface shadow-lg">
                        <Loader2 className="h-7 w-7 animate-spin text-primary" />
                    </div>
                </div>
            ) : null}
        </div>
    );
}

function Pagination({ page, pages, setPage }: { page: number; pages: number; setPage: (page: number) => void }) {
    return (
        <div className="mt-4 flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3">
            <p className="text-xs text-muted">Page {page} of {pages}</p>

            <div className="flex gap-2">
                <button
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface-secondary text-muted transition hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <ArrowLeft className="h-4 w-4" />
                </button>

                <button
                    disabled={page >= pages}
                    onClick={() => setPage(page + 1)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface-secondary text-muted transition hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <ArrowRight className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}

function SearchBar({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) {
    return (
        <div className="relative min-w-55 flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full rounded-xl border border-border bg-surface-secondary py-2.5 pl-10 pr-4 text-sm outline-none placeholder:text-muted focus:border-primary focus:ring-4 focus:ring-primary/10"
            />
        </div>
    );
}

function StatusSelect({ value, onChange, statuses }: { value: string; onChange: (value: string) => void; statuses: string[] }) {
    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="rounded-xl border border-border bg-surface-secondary px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
        >
            {statuses.map((status) => (
                <option key={status} value={status}>{status === "all" ? "All Status" : formatStatus(status)}</option>
            ))}
        </select>
    );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
        >
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-surface shadow-xl">
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-surface px-5 py-4">
                    <h2 className="text-base font-semibold">{title}</h2>

                    <button onClick={onClose} className="rounded-xl p-1.5 text-muted transition hover:bg-accent hover:text-foreground">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-5">{children}</div>
            </div>
        </div>
    );
}

function InfoGrid({ children }: { children: ReactNode }) {
    return <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{children}</div>;
}

function Info({ label, value }: { label: string; value?: ReactNode }) {
    return (
        <div className="rounded-xl border border-border bg-surface-secondary p-3">
            <p className="text-xs text-muted">{label}</p>
            <p className="mt-1 text-sm capitalize">{value || "—"}</p>
        </div>
    );
}

function Input({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: string }) {
    return (
        <div>
            <label className="mb-2 block text-sm text-muted">{label}</label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full rounded-xl border border-border bg-surface-secondary px-3 py-2.5 text-sm outline-none placeholder:text-muted focus:border-primary focus:ring-4 focus:ring-primary/10"
            />
        </div>
    );
}