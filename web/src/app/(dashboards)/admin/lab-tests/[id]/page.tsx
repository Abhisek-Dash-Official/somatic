"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, FlaskConical, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import type { ILabTestDocument } from "@/models/LabTest";

type Parameter = {
    name: string;
    unit: string;
    reference_range: string;
};

export default function AdminLabTestEditPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const [id, setId] = useState("");
    const [labTest, setLabTest] = useState<ILabTestDocument | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        name: "",
        code: "",
        description: "",
        category: "",
        type: "test",
        price: "",
        home_collection: true,
        sample_type: "",
        preparation: "",
        report_time: "",
        is_active: true,
    });

    const [parameters, setParameters] = useState<Parameter[]>([]);

    useEffect(() => {
        params.then(({ id: routeId }) => setId(routeId));
    }, [params]);

    useEffect(() => {
        if (!id) return;

        const fetchLabTest = async () => {
            try {
                setLoading(true);

                const response = await fetch(`/api/admin/lab-tests/${id}`);
                const result = await response.json();

                if (!response.ok || !result.success) {
                    throw new Error(result.message || "Failed to fetch lab test");
                }

                const data = result.data as ILabTestDocument;

                setLabTest(data);

                setForm({
                    name: data.name || "",
                    code: data.code || "",
                    description: data.description || "",
                    category: data.category || "",
                    type: data.type || "test",
                    price: String(data.price ?? ""),
                    home_collection: data.home_collection ?? true,
                    sample_type: data.sample_type || "",
                    preparation: data.preparation || "",
                    report_time: data.report_time || "",
                    is_active: data.is_active ?? true,
                });

                setParameters(
                    (data.parameters || []).map((parameter) => ({
                        name: parameter.name || "",
                        unit: parameter.unit || "",
                        reference_range: parameter.reference_range || "",
                    })),
                );
            } catch (error: any) {
                toast.error(error.message || "Failed to fetch lab test");
            } finally {
                setLoading(false);
            }
        };

        fetchLabTest();
    }, [id]);

    const updateParameter = (
        index: number,
        field: keyof Parameter,
        value: string,
    ) => {
        setParameters((current) =>
            current.map((parameter, parameterIndex) =>
                parameterIndex === index
                    ? { ...parameter, [field]: value }
                    : parameter,
            ),
        );
    };

    const addParameter = () => {
        setParameters((current) => [
            ...current,
            {
                name: "",
                unit: "",
                reference_range: "",
            },
        ]);
    };

    const removeParameter = (index: number) => {
        setParameters((current) =>
            current.filter((_, parameterIndex) => parameterIndex !== index),
        );
    };

    const handleSave = async () => {
        if (!form.name.trim()) {
            toast.error("Lab test name is required");
            return;
        }

        if (!form.category.trim()) {
            toast.error("Category is required");
            return;
        }

        if (!form.price || Number(form.price) < 0) {
            toast.error("Enter a valid price");
            return;
        }

        if (parameters.some((parameter) => !parameter.name.trim())) {
            toast.error("Every parameter must have a name");
            return;
        }

        try {
            setSaving(true);

            const response = await fetch(`/api/admin/lab-tests/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: form.name.trim(),
                    code: form.code.trim(),
                    description: form.description.trim(),
                    category: form.category.trim(),
                    type: form.type,
                    price: Number(form.price),
                    home_collection: form.home_collection,
                    sample_type: form.sample_type.trim(),
                    preparation: form.preparation.trim(),
                    report_time: form.report_time.trim(),
                    parameters,
                    is_active: form.is_active,
                }),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "Failed to update lab test");
            }

            setLabTest(result.data);
            toast.success("Lab test updated successfully");
        } catch (error: any) {
            toast.error(error.message || "Failed to update lab test");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-full items-center justify-center bg-background">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
        );
    }

    if (!labTest) {
        return (
            <div className="flex min-h-full flex-col items-center justify-center bg-background px-4 text-center">
                <FlaskConical className="mb-3 h-8 w-8 text-muted-foreground" />
                <h1 className="text-lg font-semibold">Lab test not found</h1>
                <Link
                    href="/admin/lab-tests"
                    className="mt-4 text-sm text-primary hover:text-primary-hover"
                >
                    Back to Lab Tests
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-full bg-background p-4 text-foreground sm:p-6">
            <div className="mx-auto max-w-5xl">
                <div className="mb-6 flex items-center justify-between gap-4">
                    <div>
                        <Link
                            href="/admin/lab-tests"
                            className="mb-3 inline-flex items-center gap-2 text-sm text-muted hover:text-primary"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Lab Tests
                        </Link>

                        <h1 className="text-2xl font-semibold">Edit Lab Test</h1>
                        <p className="mt-1 text-sm text-muted">
                            Update catalogue information and default parameters.
                        </p>
                    </div>

                    <div
                        className={`px-3 py-2 text-xs font-medium ${form.is_active
                            ? "bg-accent text-accent-foreground"
                            : "bg-surface-secondary text-muted"
                            }`}
                    >
                        {form.is_active ? "Active" : "Inactive"}
                    </div>
                </div>

                <div className="space-y-5">
                    <section className="border border-border bg-surface p-5">
                        <h2 className="mb-4 text-sm font-semibold">Basic Information</h2>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="mb-1.5 block text-xs text-muted">
                                    Name *
                                </label>
                                <input
                                    value={form.name}
                                    onChange={(event) =>
                                        setForm({ ...form, name: event.target.value })
                                    }
                                    className="h-10 w-full border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                                    placeholder="Complete Blood Count"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs text-muted">
                                    Code
                                </label>
                                <input
                                    value={form.code}
                                    onChange={(event) =>
                                        setForm({ ...form, code: event.target.value })
                                    }
                                    className="h-10 w-full border border-border bg-background px-3 text-sm uppercase outline-none focus:border-primary"
                                    placeholder="CBC001"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs text-muted">
                                    Category *
                                </label>
                                <input
                                    value={form.category}
                                    onChange={(event) =>
                                        setForm({ ...form, category: event.target.value })
                                    }
                                    className="h-10 w-full border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                                    placeholder="Hematology"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs text-muted">
                                    Type *
                                </label>
                                <select
                                    value={form.type}
                                    onChange={(event) =>
                                        setForm({ ...form, type: event.target.value })
                                    }
                                    className="h-10 w-full border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                                >
                                    <option value="test">Test</option>
                                    <option value="package">Package</option>
                                </select>
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs text-muted">
                                    Price *
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={form.price}
                                    onChange={(event) =>
                                        setForm({ ...form, price: event.target.value })
                                    }
                                    className="h-10 w-full border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                                    placeholder="500"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs text-muted">
                                    Report Time
                                </label>
                                <input
                                    value={form.report_time}
                                    onChange={(event) =>
                                        setForm({ ...form, report_time: event.target.value })
                                    }
                                    className="h-10 w-full border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                                    placeholder="24 hours"
                                />
                            </div>
                        </div>

                        <div className="mt-4">
                            <label className="mb-1.5 block text-xs text-muted">
                                Description
                            </label>
                            <textarea
                                value={form.description}
                                onChange={(event) =>
                                    setForm({ ...form, description: event.target.value })
                                }
                                rows={4}
                                className="w-full resize-none border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                                placeholder="Describe this laboratory test..."
                            />
                        </div>
                    </section>

                    <section className="border border-border bg-surface p-5">
                        <h2 className="mb-4 text-sm font-semibold">Collection Details</h2>

                        <label className="flex cursor-pointer items-center gap-3 text-sm">
                            <input
                                type="checkbox"
                                checked={form.home_collection}
                                onChange={(event) =>
                                    setForm({
                                        ...form,
                                        home_collection: event.target.checked,
                                    })
                                }
                                className="h-4 w-4 accent-primary"
                            />
                            Home collection available
                        </label>

                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="mb-1.5 block text-xs text-muted">
                                    Sample Type
                                </label>
                                <input
                                    value={form.sample_type}
                                    onChange={(event) =>
                                        setForm({ ...form, sample_type: event.target.value })
                                    }
                                    className="h-10 w-full border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                                    placeholder="Blood"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs text-muted">
                                    Preparation
                                </label>
                                <input
                                    value={form.preparation}
                                    onChange={(event) =>
                                        setForm({ ...form, preparation: event.target.value })
                                    }
                                    className="h-10 w-full border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                                    placeholder="8-10 hours fasting"
                                />
                            </div>
                        </div>
                    </section>

                    <section className="border border-border bg-surface p-5">
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <div>
                                <h2 className="text-sm font-semibold">Default Parameters</h2>
                                <p className="mt-1 text-xs text-muted">
                                    These are catalogue defaults. Actual patient results are
                                    entered separately by the dispatcher.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={addParameter}
                                className="flex h-9 items-center gap-2 border border-border px-3 text-xs font-medium hover:border-primary hover:text-primary"
                            >
                                <Plus className="h-3.5 w-3.5" />
                                Add Parameter
                            </button>
                        </div>

                        {parameters.length === 0 ? (
                            <div className="border border-dashed border-border px-4 py-8 text-center">
                                <p className="text-sm text-muted">
                                    No default parameters added.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {parameters.map((parameter, index) => (
                                    <div
                                        key={index}
                                        className="grid gap-3 border border-border bg-background p-3 md:grid-cols-[1.2fr_0.7fr_1.2fr_auto]"
                                    >
                                        <input
                                            value={parameter.name}
                                            onChange={(event) =>
                                                updateParameter(index, "name", event.target.value)
                                            }
                                            className="h-9 border border-border bg-surface px-3 text-sm outline-none focus:border-primary"
                                            placeholder="Parameter name"
                                        />

                                        <input
                                            value={parameter.unit}
                                            onChange={(event) =>
                                                updateParameter(index, "unit", event.target.value)
                                            }
                                            className="h-9 border border-border bg-surface px-3 text-sm outline-none focus:border-primary"
                                            placeholder="Unit"
                                        />

                                        <input
                                            value={parameter.reference_range}
                                            onChange={(event) =>
                                                updateParameter(
                                                    index,
                                                    "reference_range",
                                                    event.target.value,
                                                )
                                            }
                                            className="h-9 border border-border bg-surface px-3 text-sm outline-none focus:border-primary"
                                            placeholder="Reference range"
                                        />

                                        <button
                                            type="button"
                                            onClick={() => removeParameter(index)}
                                            className="flex h-9 items-center justify-center border border-border px-3 text-muted hover:border-danger hover:text-danger"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    <section className="border border-border bg-surface p-5">
                        <h2 className="mb-4 text-sm font-semibold">Availability</h2>

                        <label className="flex cursor-pointer items-center gap-3 text-sm">
                            <input
                                type="checkbox"
                                checked={form.is_active}
                                onChange={(event) =>
                                    setForm({
                                        ...form,
                                        is_active: event.target.checked,
                                    })
                                }
                                className="h-4 w-4 accent-primary"
                            />
                            Make this lab test available for new bookings
                        </label>
                    </section>

                    <div className="flex justify-end gap-3 pb-6">
                        <Link
                            href="/admin/lab-tests"
                            className="flex h-10 items-center border border-border px-4 text-sm font-medium hover:border-primary hover:text-primary"
                        >
                            Cancel
                        </Link>

                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={saving}
                            className="flex h-10 items-center gap-2 bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {saving ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Save className="h-4 w-4" />
                            )}
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}