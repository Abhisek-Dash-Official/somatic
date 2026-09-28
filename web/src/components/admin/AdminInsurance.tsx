"use client";

import { useCallback, useEffect, useState } from "react";
import {
    ArrowLeft,
    ArrowRight,
    Ban,
    Check,
    ChevronDown,
    ChevronUp,
    Edit,
    FileText,
    Loader2,
    Plus,
    Search,
    ShieldCheck,
    X,
} from "lucide-react";
import { toast } from "react-toastify";

type Tab = "policies" | "claims" | "plans";

type Policy = {
    _id: string;
    policy_number?: string;
    insured_members?: { name: string; relationship: string; date_of_birth?: string }[];
    start_date?: string;
    expiry_date?: string;
    status: string;
    documents?: { type?: string; file_url: string; uploaded_at?: string }[];
    rejection_reason?: string;
    created_at?: string;
    user_id?: { _id: string; username: string; email: string; contact_no?: string };
    plan_id?: {
        _id: string;
        name: string;
        coverage_amount: number;
        premium_amount: number;
        premium_frequency: string;
        policy_term_years: number;
    };
    approved_by?: { username: string; email: string };
    rejected_by?: { username: string; email: string };
};

type Claim = {
    _id: string;
    claim_number?: string;
    claim_type: string;
    incident_type?: string;
    incident_date?: string;
    treatment_date?: string;
    admission_date?: string;
    discharge_date?: string;
    estimated_amount?: number;
    claimed_amount?: number;
    approved_amount?: number;
    status: string;
    rejection_reason?: string;
    required_documents?: string[];
    documents?: { type: string; file_url: string; uploaded_at?: string }[];
    created_at?: string;
    user_id?: { _id: string; username: string; email: string; contact_no?: string };
    policy_id?: {
        _id: string;
        policy_number?: string;
        status: string;
        start_date?: string;
        expiry_date?: string;
        plan_id?: {
            _id: string;
            name: string;
            coverage_amount: number;
            premium_amount: number;
            premium_frequency: string;
            policy_term_years: number;
        };
    };
};

type Plan = {
    _id: string;
    name: string;
    description?: string;
    coverage_amount: number;
    premium_amount: number;
    premium_frequency: string;
    policy_term_years: number;
    features?: string[];
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
};

const policyStatuses = ["all", "pending", "approved", "payment_pending", "active", "rejected", "expired", "cancelled"];
const claimStatuses = ["all", "draft", "submitted", "under_review", "documents_required", "approved", "partially_approved", "rejected", "settled"];
const planStatuses = ["all", "active", "inactive"];

const formatDate = (value?: string) => value ? new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const formatAmount = (value?: number) => typeof value === "number" ? `₹${value.toLocaleString("en-IN")}` : "—";

const formatStatus = (status: string) => status.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());

const statusClass = (status: string) => {
    if (["active", "approved", "settled"].includes(status)) return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    if (["pending", "submitted", "under_review", "payment_pending"].includes(status)) return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    if (["rejected", "cancelled"].includes(status)) return "bg-red-500/10 text-red-400 border-red-500/20";
    if (status === "documents_required") return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    return "bg-slate-500/10 text-slate-400 border-slate-500/20";
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

    const Pagination = ({ page, pages, setPage }: { page: number; pages: number; setPage: (page: number) => void }) => (
        <div className="flex items-center justify-between border-t border-slate-800 pt-4 mt-4">
            <p className="text-xs text-slate-500">Page {page} of {pages}</p>
            <div className="flex gap-2">
                <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="p-2 rounded-lg border border-slate-800 text-slate-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed">
                    <ArrowLeft className="w-4 h-4" />
                </button>
                <button disabled={page >= pages} onClick={() => setPage(page + 1)} className="p-2 rounded-lg border border-slate-800 text-slate-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed">
                    <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );

    const SearchBar = ({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) => (
        <div className="relative flex-1 min-w-55">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none focus:border-slate-600" />
        </div>
    );

    const StatusSelect = ({ value, onChange, statuses }: { value: string; onChange: (value: string) => void; statuses: string[] }) => (
        <select value={value} onChange={(e) => onChange(e.target.value)} className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-slate-300 outline-none focus:border-slate-600">
            {statuses.map((status) => <option key={status} value={status}>{status === "all" ? "All Status" : formatStatus(status)}</option>)}
        </select>
    );

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white">Insurance Management</h1>
                <p className="text-sm text-slate-500 mt-1">Manage insurance policies, claims and plans.</p>
            </div>

            <div className="flex gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl w-full sm:w-fit overflow-x-auto">
                {[
                    { id: "policies" as Tab, label: "Policies", icon: ShieldCheck },
                    { id: "claims" as Tab, label: "Claims", icon: FileText },
                    { id: "plans" as Tab, label: "Plans", icon: Check },
                ].map(({ id, label, icon: Icon }) => (
                    <button key={id} onClick={() => setTab(id)} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition ${tab === id ? "bg-slate-800 text-white" : "text-slate-500 hover:text-slate-300"}`}>
                        <Icon className="w-4 h-4" />
                        {label}
                    </button>
                ))}
            </div>

            {tab === "policies" && (
                <section className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <SearchBar value={policySearch} onChange={(value) => { setPolicySearch(value); setPolicyPage(1); }} placeholder="Search policy, patient or plan..." />
                        <StatusSelect value={policyStatus} onChange={(value) => { setPolicyStatus(value); setPolicyPage(1); }} statuses={policyStatuses} />
                    </div>

                    <div className="border border-slate-800 rounded-xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-225">
                                <thead className="bg-slate-900/80">
                                    <tr className="text-left text-xs text-slate-500 uppercase">
                                        <th className="px-4 py-3">Policy</th>
                                        <th className="px-4 py-3">Patient</th>
                                        <th className="px-4 py-3">Plan</th>
                                        <th className="px-4 py-3">Premium</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3">Created</th>
                                        <th className="px-4 py-3">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {loading ? (
                                        <tr><td colSpan={7} className="py-16 text-center"><Loader2 className="w-6 h-6 animate-spin text-slate-500 mx-auto" /></td></tr>
                                    ) : policies.length === 0 ? (
                                        <tr><td colSpan={7} className="py-16 text-center text-sm text-slate-500">No insurance policies found.</td></tr>
                                    ) : policies.map((policy) => (
                                        <tr key={policy._id} className="hover:bg-slate-900/50">
                                            <td className="px-4 py-4">
                                                <p className="text-sm text-white font-medium">{policy.policy_number || "Pending"}</p>
                                                <p className="text-xs text-slate-500 mt-1">{policy._id}</p>
                                            </td>
                                            <td className="px-4 py-4">
                                                <p className="text-sm text-slate-200">{policy.user_id?.username || "—"}</p>
                                                <p className="text-xs text-slate-500">{policy.user_id?.email || "—"}</p>
                                            </td>
                                            <td className="px-4 py-4 text-sm text-slate-300">{policy.plan_id?.name || "—"}</td>
                                            <td className="px-4 py-4 text-sm text-slate-300">{formatAmount(policy.plan_id?.premium_amount)}</td>
                                            <td className="px-4 py-4"><span className={`inline-flex border rounded-full px-2.5 py-1 text-xs ${statusClass(policy.status)}`}>{formatStatus(policy.status)}</span></td>
                                            <td className="px-4 py-4 text-sm text-slate-500">{formatDate(policy.created_at)}</td>
                                            <td className="px-4 py-4">
                                                <button onClick={() => openPolicy(policy._id)} className="text-sm text-blue-400 hover:text-blue-300">View</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <Pagination page={policyPage} pages={policyPages} setPage={setPolicyPage} />
                </section>
            )}

            {tab === "claims" && (
                <section className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <SearchBar value={claimSearch} onChange={(value) => { setClaimSearch(value); setClaimPage(1); }} placeholder="Search claim, patient or policy..." />
                        <StatusSelect value={claimStatus} onChange={(value) => { setClaimStatus(value); setClaimPage(1); }} statuses={claimStatuses} />
                    </div>

                    <div className="border border-slate-800 rounded-xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-237.5">
                                <thead className="bg-slate-900/80">
                                    <tr className="text-left text-xs text-slate-500 uppercase">
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
                                <tbody className="divide-y divide-slate-800">
                                    {loading ? (
                                        <tr><td colSpan={8} className="py-16 text-center"><Loader2 className="w-6 h-6 animate-spin text-slate-500 mx-auto" /></td></tr>
                                    ) : claims.length === 0 ? (
                                        <tr><td colSpan={8} className="py-16 text-center text-sm text-slate-500">No insurance claims found.</td></tr>
                                    ) : claims.map((claim) => (
                                        <tr key={claim._id} className="hover:bg-slate-900/50">
                                            <td className="px-4 py-4">
                                                <p className="text-sm text-white font-medium">{claim.claim_number || "—"}</p>
                                                <p className="text-xs text-slate-500 mt-1">{formatDate(claim.created_at)}</p>
                                            </td>
                                            <td className="px-4 py-4">
                                                <p className="text-sm text-slate-200">{claim.user_id?.username || "—"}</p>
                                                <p className="text-xs text-slate-500">{claim.user_id?.email || "—"}</p>
                                            </td>
                                            <td className="px-4 py-4 text-sm text-slate-300">{claim.policy_id?.policy_number || "—"}</td>
                                            <td className="px-4 py-4 text-sm text-slate-400 capitalize">{claim.claim_type}</td>
                                            <td className="px-4 py-4 text-sm text-slate-300">{formatAmount(claim.claimed_amount)}</td>
                                            <td className="px-4 py-4 text-sm text-slate-300">{formatAmount(claim.approved_amount)}</td>
                                            <td className="px-4 py-4"><span className={`inline-flex border rounded-full px-2.5 py-1 text-xs ${statusClass(claim.status)}`}>{formatStatus(claim.status)}</span></td>
                                            <td className="px-4 py-4"><button onClick={() => openClaim(claim._id)} className="text-sm text-blue-400 hover:text-blue-300">View</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <Pagination page={claimPage} pages={claimPages} setPage={setClaimPage} />
                </section>
            )}

            {tab === "plans" && (
                <section className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <SearchBar value={planSearch} onChange={(value) => { setPlanSearch(value); setPlanPage(1); }} placeholder="Search insurance plan..." />
                        <StatusSelect value={planStatus} onChange={(value) => { setPlanStatus(value); setPlanPage(1); }} statuses={planStatuses} />
                        <button onClick={openCreatePlan} className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2.5 text-sm font-medium whitespace-nowrap">
                            <Plus className="w-4 h-4" />
                            Add Plan
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {loading ? (
                            <div className="lg:col-span-2 py-16 text-center"><Loader2 className="w-6 h-6 animate-spin text-slate-500 mx-auto" /></div>
                        ) : plans.length === 0 ? (
                            <div className="lg:col-span-2 border border-slate-800 rounded-xl py-16 text-center text-sm text-slate-500">No insurance plans found.</div>
                        ) : plans.map((plan) => (
                            <div key={plan._id} className="border border-slate-800 bg-slate-900/40 rounded-xl p-5">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-base font-semibold text-white">{plan.name}</h3>
                                            <span className={`inline-flex border rounded-full px-2 py-0.5 text-[10px] ${plan.is_active ? statusClass("active") : "bg-slate-500/10 text-slate-500 border-slate-700"}`}>
                                                {plan.is_active ? "Active" : "Inactive"}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-500 mt-2">{plan.description || "No description provided."}</p>
                                    </div>
                                    <ShieldCheck className="w-6 h-6 text-blue-400 shrink-0" />
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
                                    <div><p className="text-xs text-slate-500">Coverage</p><p className="text-sm text-white mt-1">{formatAmount(plan.coverage_amount)}</p></div>
                                    <div><p className="text-xs text-slate-500">Premium</p><p className="text-sm text-white mt-1">{formatAmount(plan.premium_amount)}</p></div>
                                    <div><p className="text-xs text-slate-500">Frequency</p><p className="text-sm text-white mt-1 capitalize">{plan.premium_frequency.replace("_", " ")}</p></div>
                                    <div><p className="text-xs text-slate-500">Term</p><p className="text-sm text-white mt-1">{plan.policy_term_years} year{plan.policy_term_years !== 1 ? "s" : ""}</p></div>
                                </div>

                                {plan.features?.length ? (
                                    <div className="mt-5 flex flex-wrap gap-2">
                                        {plan.features.map((feature, index) => <span key={`${feature}-${index}`} className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-400">{feature}</span>)}
                                    </div>
                                ) : null}

                                <div className="flex gap-2 mt-5 pt-4 border-t border-slate-800">
                                    <button onClick={() => openEditPlan(plan)} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-700 text-sm text-slate-300 hover:text-white hover:bg-slate-800">
                                        <Edit className="w-4 h-4" />
                                        Edit
                                    </button>
                                    <button onClick={() => togglePlan(plan)} className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm ${plan.is_active ? "border-red-500/20 text-red-400 hover:bg-red-500/10" : "border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10"}`}>
                                        {plan.is_active ? <Ban className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                                        {plan.is_active ? "Deactivate" : "Activate"}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <Pagination page={planPage} pages={planPages} setPage={setPlanPage} />
                </section>
            )}

            {selectedPolicy && (
                <Modal title="Policy Details" onClose={() => setSelectedPolicy(null)}>
                    <div className="space-y-5">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-xs text-slate-500">Policy Number</p>
                                <p className="text-lg font-semibold text-white mt-1">{selectedPolicy.policy_number || "Pending"}</p>
                            </div>
                            <span className={`border rounded-full px-3 py-1 text-xs ${statusClass(selectedPolicy.status)}`}>{formatStatus(selectedPolicy.status)}</span>
                        </div>

                        <InfoGrid>
                            <Info label="Patient" value={selectedPolicy.user_id?.username} />
                            <Info label="Email" value={selectedPolicy.user_id?.email} />
                            <Info label="Plan" value={selectedPolicy.plan_id?.name} />
                            <Info label="Coverage" value={formatAmount(selectedPolicy.plan_id?.coverage_amount)} />
                            <Info label="Premium" value={formatAmount(selectedPolicy.plan_id?.premium_amount)} />
                            <Info label="Frequency" value={selectedPolicy.plan_id?.premium_frequency?.replace("_", " ")} />
                            <Info label="Start Date" value={formatDate(selectedPolicy.start_date)} />
                            <Info label="Expiry Date" value={formatDate(selectedPolicy.expiry_date)} />
                        </InfoGrid>

                        <div>
                            <p className="text-sm font-medium text-white mb-3">Insured Members</p>
                            <div className="space-y-2">
                                {selectedPolicy.insured_members?.length ? selectedPolicy.insured_members.map((member, index) => (
                                    <div key={index} className="bg-slate-900 rounded-lg p-3">
                                        <p className="text-sm text-white">{member.name}</p>
                                        <p className="text-xs text-slate-500 mt-1">{member.relationship}{member.date_of_birth ? ` · ${formatDate(member.date_of_birth)}` : ""}</p>
                                    </div>
                                )) : <p className="text-sm text-slate-500">No members found.</p>}
                            </div>
                        </div>

                        {selectedPolicy.rejection_reason && (
                            <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3">
                                <p className="text-xs text-red-400">Reason</p>
                                <p className="text-sm text-slate-300 mt-1">{selectedPolicy.rejection_reason}</p>
                            </div>
                        )}

                        {!["cancelled", "expired"].includes(selectedPolicy.status) && (
                            <button onClick={() => { setCancelPolicy(selectedPolicy); setCancelReason(""); }} className="w-full flex items-center justify-center gap-2 border border-red-500/20 text-red-400 hover:bg-red-500/10 rounded-lg py-2.5 text-sm">
                                <Ban className="w-4 h-4" />
                                Stop / Cancel Policy
                            </button>
                        )}
                    </div>
                </Modal>
            )}

            {selectedClaim && (
                <Modal title="Claim Details" onClose={() => setSelectedClaim(null)}>
                    <div className="space-y-5">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-xs text-slate-500">Claim Number</p>
                                <p className="text-lg font-semibold text-white mt-1">{selectedClaim.claim_number || "—"}</p>
                            </div>
                            <span className={`border rounded-full px-3 py-1 text-xs ${statusClass(selectedClaim.status)}`}>{formatStatus(selectedClaim.status)}</span>
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
                        </InfoGrid>

                        {selectedClaim.required_documents?.length ? (
                            <div>
                                <p className="text-sm font-medium text-white mb-2">Required Documents</p>
                                <div className="flex flex-wrap gap-2">
                                    {selectedClaim.required_documents.map((document) => <span key={document} className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full px-2.5 py-1">{document}</span>)}
                                </div>
                            </div>
                        ) : null}

                        {selectedClaim.documents?.length ? (
                            <div>
                                <p className="text-sm font-medium text-white mb-2">Submitted Documents</p>
                                <div className="space-y-2">
                                    {selectedClaim.documents.map((document, index) => (
                                        <a key={index} href={document.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-3 bg-slate-900 rounded-lg p-3 hover:bg-slate-800">
                                            <div>
                                                <p className="text-sm text-white">{document.type}</p>
                                                <p className="text-xs text-slate-500 mt-1">{formatDate(document.uploaded_at)}</p>
                                            </div>
                                            <ArrowRight className="w-4 h-4 text-slate-500" />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        ) : null}

                        {selectedClaim.rejection_reason && (
                            <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3">
                                <p className="text-xs text-red-400">Rejection Reason</p>
                                <p className="text-sm text-slate-300 mt-1">{selectedClaim.rejection_reason}</p>
                            </div>
                        )}
                    </div>
                </Modal>
            )}

            {cancelPolicy && (
                <Modal title="Cancel Insurance Policy" onClose={() => !cancelling && setCancelPolicy(null)}>
                    <div className="space-y-5">
                        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
                            <p className="text-sm text-white font-medium">Cancel {cancelPolicy.policy_number || "this policy"}?</p>
                            <p className="text-xs text-slate-500 mt-1">This will permanently change the policy status to cancelled.</p>
                        </div>

                        <div>
                            <label className="block text-sm text-slate-300 mb-2">Cancellation Reason</label>
                            <textarea value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} rows={4} placeholder="Enter the reason for cancelling this policy..." className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none focus:border-slate-600 resize-none" />
                        </div>

                        <div className="flex justify-end gap-2">
                            <button disabled={cancelling} onClick={() => setCancelPolicy(null)} className="px-4 py-2.5 rounded-lg border border-slate-800 text-sm text-slate-400 hover:text-white disabled:opacity-50">Keep Policy</button>
                            <button disabled={cancelling} onClick={submitCancelPolicy} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm disabled:opacity-50">
                                {cancelling && <Loader2 className="w-4 h-4 animate-spin" />}
                                Cancel Policy
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {planModal && (
                <Modal title={editingPlan ? "Edit Insurance Plan" : "Create Insurance Plan"} onClose={() => !savingPlan && setPlanModal(false)}>
                    <div className="space-y-4">
                        <Input label="Plan Name" value={planForm.name} onChange={(value) => setPlanForm((form) => ({ ...form, name: value }))} placeholder="e.g. Somatic Care Plus" />

                        <div>
                            <label className="block text-sm text-slate-300 mb-2">Description</label>
                            <textarea value={planForm.description} onChange={(e) => setPlanForm((form) => ({ ...form, description: e.target.value }))} rows={3} placeholder="Describe the insurance plan..." className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none focus:border-slate-600 resize-none" />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input label="Coverage Amount" type="number" value={planForm.coverage_amount} onChange={(value) => setPlanForm((form) => ({ ...form, coverage_amount: value }))} placeholder="500000" />
                            <Input label="Premium Amount" type="number" value={planForm.premium_amount} onChange={(value) => setPlanForm((form) => ({ ...form, premium_amount: value }))} placeholder="12000" />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-slate-300 mb-2">Premium Frequency</label>
                                <select value={planForm.premium_frequency} onChange={(e) => setPlanForm((form) => ({ ...form, premium_frequency: e.target.value }))} className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-white outline-none">
                                    <option value="monthly">Monthly</option>
                                    <option value="quarterly">Quarterly</option>
                                    <option value="half_yearly">Half Yearly</option>
                                    <option value="yearly">Yearly</option>
                                </select>
                            </div>
                            <Input label="Policy Term (Years)" type="number" value={planForm.policy_term_years} onChange={(value) => setPlanForm((form) => ({ ...form, policy_term_years: value }))} placeholder="1" />
                        </div>

                        <div>
                            <label className="block text-sm text-slate-300 mb-2">Features</label>
                            <textarea value={planForm.features} onChange={(e) => setPlanForm((form) => ({ ...form, features: e.target.value }))} rows={5} placeholder={"Enter one feature per line"} className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none focus:border-slate-600 resize-none" />
                        </div>

                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" checked={planForm.is_active} onChange={(e) => setPlanForm((form) => ({ ...form, is_active: e.target.checked }))} className="w-4 h-4 accent-blue-600" />
                            <span className="text-sm text-slate-300">Plan is active</span>
                        </label>

                        <div className="flex justify-end gap-2 pt-2">
                            <button disabled={savingPlan} onClick={() => setPlanModal(false)} className="px-4 py-2.5 rounded-lg border border-slate-800 text-sm text-slate-400 hover:text-white disabled:opacity-50">Cancel</button>
                            <button disabled={savingPlan} onClick={savePlan} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm disabled:opacity-50">
                                {savingPlan && <Loader2 className="w-4 h-4 animate-spin" />}
                                {editingPlan ? "Save Changes" : "Create Plan"}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {policyModalLoading || claimModalLoading ? (
                <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50">
                    <Loader2 className="w-7 h-7 animate-spin text-white" />
                </div>
            ) : null}
        </div>
    );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl">
                <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950">
                    <h2 className="text-base font-semibold text-white">{title}</h2>
                    <button onClick={onClose} className="p-1.5 text-slate-500 hover:text-white rounded-lg hover:bg-slate-800">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-5">{children}</div>
            </div>
        </div>
    );
}

function InfoGrid({ children }: { children: React.ReactNode }) {
    return <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{children}</div>;
}

function Info({ label, value }: { label: string; value?: string }) {
    return (
        <div className="bg-slate-900 rounded-lg p-3">
            <p className="text-xs text-slate-500">{label}</p>
            <p className="text-sm text-slate-200 mt-1 capitalize">{value || "—"}</p>
        </div>
    );
}

function Input({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: string }) {
    return (
        <div>
            <label className="block text-sm text-slate-300 mb-2">{label}</label>
            <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none focus:border-slate-600" />
        </div>
    );
}