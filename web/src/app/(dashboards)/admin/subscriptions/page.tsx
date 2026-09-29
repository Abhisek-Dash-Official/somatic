"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, ChevronLeft, ChevronRight, Crown, Edit3, Loader2, Plus, Search, Users, X } from "lucide-react";
import { toast } from "react-toastify";

type Plan = {
    _id: string;
    name: string;
    description?: string;
    price: number;
    currency: string;
    duration_days: number;
    features: string[];
    token_limit: number;
    is_active: boolean;
    subscriber_count: number;
};

type Subscriber = {
    _id: string;
    plan_name: string;
    status: "pending" | "active" | "expired" | "cancelled";
    price: number;
    currency: string;
    token_limit: number;
    tokens_used: number;
    start_date?: string;
    end_date?: string;
    created_at?: string;
    user_id: { _id: string; username: string; email: string; contact_no?: string };
    plan_id?: { _id: string; name: string; price: number; currency: string; duration_days: number };
};

type FormState = {
    name: string;
    description: string;
    price: string;
    currency: string;
    duration_days: string;
    token_limit: string;
    features: string;
    is_active: boolean;
};

const emptyForm: FormState = {
    name: "",
    description: "",
    price: "",
    currency: "INR",
    duration_days: "30",
    token_limit: "100000",
    features: "",
    is_active: true,
};

const formatAmount = (amount: number, currency = "INR") =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(amount);

const formatDate = (date?: string) =>
    date
        ? new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        })
        : "—";

const statusClass = (status: Subscriber["status"]) =>
    status === "active"
        ? "bg-success/10 text-success"
        : status === "pending"
            ? "bg-warning/10 text-warning"
            : status === "expired"
                ? "bg-muted/10 text-muted"
                : "bg-danger/10 text-danger";

export default function AdminSubscriptionsPage() {
    const [tab, setTab] = useState<"plans" | "subscribers">("plans");
    const [plans, setPlans] = useState<Plan[]>([]);
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(false);
    const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
    const [form, setForm] = useState<FormState>(emptyForm);
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ total: 0, total_pages: 1 });

    const fetchData = async () => {
        setLoading(true);

        try {
            if (tab === "plans") {
                const res = await fetch("/api/admin/subscriptions?view=plans", {
                    cache: "no-store",
                });

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.message || "Failed to fetch plans");
                }

                setPlans(data.plans || []);
            } else {
                const params = new URLSearchParams({
                    view: "subscribers",
                    page: String(page),
                    limit: "10",
                    ...(search.trim() ? { search: search.trim() } : {}),
                });

                const res = await fetch(`/api/admin/subscriptions?${params}`, {
                    cache: "no-store",
                });

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.message || "Failed to fetch subscribers");
                }

                setSubscribers(data.subscribers || []);
                setPagination({
                    total: data.pagination?.total || 0,
                    total_pages: data.pagination?.total_pages || 1,
                });
            }
        } catch (err: any) {
            toast.error(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [tab, page, search]);

    const openCreate = () => {
        setEditingPlan(null);
        setForm(emptyForm);
        setModal(true);
    };

    const openEdit = (plan: Plan) => {
        setEditingPlan(plan);
        setForm({
            name: plan.name,
            description: plan.description || "",
            price: String(plan.price),
            currency: plan.currency,
            duration_days: String(plan.duration_days),
            token_limit: String(plan.token_limit),
            features: plan.features.join("\n"),
            is_active: plan.is_active,
        });
        setModal(true);
    };

    const savePlan = async () => {
        if (!form.name.trim()) {
            toast.error("Plan name is required");
            return;
        }

        if (!form.price || Number(form.price) < 0) {
            toast.error("Enter a valid price");
            return;
        }

        if (!form.duration_days || Number(form.duration_days) < 1) {
            toast.error("Duration must be at least 1 day");
            return;
        }

        if (!form.token_limit || Number(form.token_limit) < 0) {
            toast.error("Enter a valid token limit");
            return;
        }

        setSaving(true);

        try {
            const payload = {
                name: form.name.trim(),
                description: form.description.trim(),
                price: Number(form.price),
                currency: form.currency.trim().toUpperCase(),
                duration_days: Number(form.duration_days),
                token_limit: Number(form.token_limit),
                features: form.features
                    .split("\n")
                    .map((item) => item.trim())
                    .filter(Boolean),
                is_active: form.is_active,
            };

            const res = await fetch(
                editingPlan
                    ? `/api/admin/subscriptions/${editingPlan._id}`
                    : "/api/admin/subscriptions",
                {
                    method: editingPlan ? "PATCH" : "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                },
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Failed to save plan");
            }

            setModal(false);
            toast.success(
                editingPlan
                    ? "Subscription plan updated successfully"
                    : "Subscription plan created successfully",
            );

            await fetchData();
        } catch (err: any) {
            toast.error(err.message || "Failed to save plan");
        } finally {
            setSaving(false);
        }
    };

    const togglePlan = async (plan: Plan) => {
        try {
            const res = await fetch(`/api/admin/subscriptions/${plan._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ is_active: !plan.is_active }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Failed to update plan");
            }

            toast.success(
                plan.is_active
                    ? `"${plan.name}" has been disabled`
                    : `"${plan.name}" has been enabled`,
            );

            await fetchData();
        } catch (err: any) {
            toast.error(err.message || "Failed to update plan");
        }
    };

    return (
        <main className="min-h-screen bg-background px-4 py-6 text-foreground sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <div className="mb-2 flex items-center gap-2 text-primary">
                            <Crown className="h-5 w-5" />
                            <span className="text-sm font-medium">Subscription Management</span>
                        </div>
                        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                            Subscriptions
                        </h1>
                        <p className="mt-1 text-sm text-muted">
                            Manage subscription plans and view subscribed users.
                        </p>
                    </div>

                    {tab === "plans" && (
                        <button
                            onClick={openCreate}
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary-hover"
                        >
                            <Plus className="h-4 w-4" />
                            Add Plan
                        </button>
                    )}
                </div>

                <div className="mb-6 flex border-b border-border">
                    <button
                        onClick={() => {
                            setTab("plans");
                            setPage(1);
                        }}
                        className={`border-b-2 px-4 py-3 text-sm font-medium ${tab === "plans"
                            ? "border-primary text-primary"
                            : "border-transparent text-muted hover:text-foreground"
                            }`}
                    >
                        Plans
                    </button>

                    <button
                        onClick={() => {
                            setTab("subscribers");
                            setPage(1);
                        }}
                        className={`border-b-2 px-4 py-3 text-sm font-medium ${tab === "subscribers"
                            ? "border-primary text-primary"
                            : "border-transparent text-muted hover:text-foreground"
                            }`}
                    >
                        Subscribers
                    </button>
                </div>

                {tab === "subscribers" && (
                    <div className="mb-5 flex max-w-md items-center gap-2 rounded-lg border border-border bg-surface px-3">
                        <Search className="h-4 w-4 text-muted" />
                        <input
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                            placeholder="Search user, email or plan..."
                            className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-muted"
                        />
                    </div>
                )}

                {loading ? (
                    <div className="flex min-h-60 items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                ) : tab === "plans" ? (
                    plans.length === 0 ? (
                        <div className="rounded-xl border border-border bg-surface p-10 text-center">
                            <Crown className="mx-auto h-8 w-8 text-muted" />
                            <p className="mt-3 font-medium">No subscription plans</p>
                            <p className="mt-1 text-sm text-muted">
                                Create your first subscription plan.
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {plans.map((plan) => (
                                <div
                                    key={plan._id}
                                    className="rounded-xl border border-border bg-surface p-5"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <h2 className="font-semibold">{plan.name}</h2>
                                            <p className="mt-1 text-sm text-muted">
                                                {plan.description || "No description"}
                                            </p>
                                        </div>

                                        <span
                                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${plan.is_active
                                                ? "bg-success/10 text-success"
                                                : "bg-muted/10 text-muted"
                                                }`}
                                        >
                                            {plan.is_active ? "Active" : "Inactive"}
                                        </span>
                                    </div>

                                    <div className="mt-5 flex items-end gap-1">
                                        <span className="text-2xl font-semibold">
                                            {formatAmount(plan.price, plan.currency)}
                                        </span>
                                        <span className="pb-1 text-xs text-muted">
                                            / {plan.duration_days} days
                                        </span>
                                    </div>

                                    <div className="mt-4 grid grid-cols-2 gap-3">
                                        <div className="rounded-lg bg-surface-secondary p-3">
                                            <p className="text-xs text-muted">Token limit</p>
                                            <p className="mt-1 font-medium">
                                                {plan.token_limit.toLocaleString()}
                                            </p>
                                        </div>

                                        <div className="rounded-lg bg-surface-secondary p-3">
                                            <p className="text-xs text-muted">Subscribers</p>
                                            <p className="mt-1 flex items-center gap-1 font-medium">
                                                <Users className="h-3.5 w-3.5" />
                                                {plan.subscriber_count}
                                            </p>
                                        </div>
                                    </div>

                                    {plan.features.length > 0 && (
                                        <div className="mt-4 space-y-2">
                                            {plan.features.map((feature, index) => (
                                                <div
                                                    key={index}
                                                    className="flex gap-2 text-sm text-muted"
                                                >
                                                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                                    <span>{feature}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="mt-5 flex gap-2 border-t border-border pt-4">
                                        <button
                                            onClick={() => openEdit(plan)}
                                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-surface-secondary"
                                        >
                                            <Edit3 className="h-4 w-4" />
                                            Edit
                                        </button>

                                        <button
                                            onClick={() => togglePlan(plan)}
                                            className="rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-surface-secondary"
                                        >
                                            {plan.is_active ? "Disable" : "Enable"}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                ) : (
                    <div className="overflow-hidden rounded-xl border border-border bg-surface">
                        <div className="overflow-x-auto">
                            <table className="min-w-225 w-full text-left">
                                <thead className="border-b border-border bg-surface-secondary">
                                    <tr className="text-xs uppercase tracking-wide text-muted">
                                        <th className="px-5 py-3 font-medium">User</th>
                                        <th className="px-5 py-3 font-medium">Plan</th>
                                        <th className="px-5 py-3 font-medium">Amount</th>
                                        <th className="px-5 py-3 font-medium">Status</th>
                                        <th className="px-5 py-3 font-medium">Period</th>
                                        <th className="px-5 py-3 font-medium"></th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-border">
                                    {subscribers.map((subscription) => (
                                        <tr
                                            key={subscription._id}
                                            className="hover:bg-surface-secondary/50"
                                        >
                                            <td className="px-5 py-4">
                                                <p className="font-medium">
                                                    {subscription.user_id?.username || "Unknown"}
                                                </p>
                                                <p className="mt-0.5 text-xs text-muted">
                                                    {subscription.user_id?.email || "—"}
                                                </p>
                                            </td>

                                            <td className="px-5 py-4">
                                                <p className="font-medium">
                                                    {subscription.plan_name}
                                                </p>
                                                <p className="mt-0.5 text-xs text-muted">
                                                    {subscription.token_limit.toLocaleString()} tokens
                                                </p>
                                            </td>

                                            <td className="px-5 py-4 text-sm">
                                                {formatAmount(
                                                    subscription.price,
                                                    subscription.currency,
                                                )}
                                            </td>

                                            <td className="px-5 py-4">
                                                <span
                                                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(
                                                        subscription.status,
                                                    )}`}
                                                >
                                                    {subscription.status}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4 text-sm text-muted">
                                                {formatDate(subscription.start_date)} —{" "}
                                                {formatDate(subscription.end_date)}
                                            </td>

                                            <td className="px-5 py-4 text-right">
                                                <Link
                                                    href={`/admin/subscriptions/${subscription._id}`}
                                                    className="text-sm font-medium text-primary hover:text-primary-hover"
                                                >
                                                    View
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {subscribers.length === 0 && (
                            <div className="p-10 text-center text-sm text-muted">
                                No subscribers found.
                            </div>
                        )}

                        {pagination.total_pages > 1 && (
                            <div className="flex items-center justify-between border-t border-border px-5 py-3">
                                <p className="text-sm text-muted">
                                    Page {page} of {pagination.total_pages}
                                </p>

                                <div className="flex gap-2">
                                    <button
                                        disabled={page === 1}
                                        onClick={() => setPage((p) => p - 1)}
                                        className="rounded-lg border border-border p-2 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </button>

                                    <button
                                        disabled={page >= pagination.total_pages}
                                        onClick={() => setPage((p) => p + 1)}
                                        className="rounded-lg border border-border p-2 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {modal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <div className="w-full max-w-lg rounded-xl border border-border bg-surface shadow-2xl">
                        <div className="flex items-center justify-between border-b border-border px-5 py-4">
                            <div>
                                <h2 className="font-semibold">
                                    {editingPlan
                                        ? "Edit Subscription Plan"
                                        : "Create Subscription Plan"}
                                </h2>
                                <p className="mt-0.5 text-xs text-muted">
                                    Configure access and token limits.
                                </p>
                            </div>

                            <button
                                onClick={() => setModal(false)}
                                className="rounded-lg p-2 hover:bg-surface-secondary"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="max-h-[75vh] space-y-4 overflow-y-auto p-5">
                            <div>
                                <label className="mb-1.5 block text-sm font-medium">
                                    Name
                                </label>
                                <input
                                    value={form.name}
                                    onChange={(e) =>
                                        setForm({ ...form, name: e.target.value })
                                    }
                                    className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium">
                                    Description
                                </label>
                                <textarea
                                    value={form.description}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            description: e.target.value,
                                        })
                                    }
                                    rows={2}
                                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium">
                                        Price
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={form.price}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                price: e.target.value,
                                            })
                                        }
                                        className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium">
                                        Currency
                                    </label>
                                    <input
                                        value={form.currency}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                currency: e.target.value,
                                            })
                                        }
                                        className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm uppercase outline-none focus:border-primary"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium">
                                        Duration (days)
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={form.duration_days}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                duration_days: e.target.value,
                                            })
                                        }
                                        className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium">
                                        Token limit
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={form.token_limit}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                token_limit: e.target.value,
                                            })
                                        }
                                        className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium">
                                    Features
                                </label>
                                <textarea
                                    value={form.features}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            features: e.target.value,
                                        })
                                    }
                                    rows={5}
                                    placeholder={
                                        "Access to SOMA AI\nCreate AI-assisted medical consultations\nAI-assisted multilingual symptom analysis"
                                    }
                                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                                />
                                <p className="mt-1 text-xs text-muted">
                                    One feature per line.
                                </p>
                            </div>

                            <label className="flex cursor-pointer items-center gap-2 text-sm">
                                <input
                                    type="checkbox"
                                    checked={form.is_active}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            is_active: e.target.checked,
                                        })
                                    }
                                    className="h-4 w-4 accent-primary"
                                />
                                Plan is active
                            </label>
                        </div>

                        <div className="flex justify-end gap-2 border-t border-border px-5 py-4">
                            <button
                                onClick={() => setModal(false)}
                                className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-surface-secondary"
                            >
                                Cancel
                            </button>

                            <button
                                disabled={saving}
                                onClick={savePlan}
                                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
                            >
                                {saving && (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                )}
                                {editingPlan ? "Save Changes" : "Create Plan"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}