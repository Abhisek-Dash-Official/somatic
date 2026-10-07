"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    Edit,
    FlaskConical,
    Loader2,
    Package,
    Plus,
    Search,
} from "lucide-react";
import { toast } from "react-toastify";
import type { ILabTestDocument } from "@/models/LabTest";

export default function AdminLabTestsPage() {
    const [labTests, setLabTests] = useState<ILabTestDocument[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [type, setType] = useState("");
    const [status, setStatus] = useState("");
    const [loading, setLoading] = useState(true);

    const fetchLabTests = async () => {
        try {
            setLoading(true);

            const params = new URLSearchParams();

            if (search.trim()) params.set("search", search.trim());
            if (category) params.set("category", category);
            if (type) params.set("type", type);
            if (status) params.set("status", status);

            const response = await fetch(
                `/api/admin/lab-tests?${params.toString()}`
            );
            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message || "Failed to fetch lab tests"
                );
            }

            setLabTests(result.data || []);
            setCategories(result.categories || []);
        } catch (error: any) {
            toast.error(error.message || "Failed to fetch lab tests");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timeout = setTimeout(fetchLabTests, 300);
        return () => clearTimeout(timeout);
    }, [search, category, type, status]);

    return (
        <div className="min-h-full bg-background p-4 text-foreground sm:p-6">
            <div className="mx-auto max-w-7xl">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Lab Tests</h1>
                        <p className="mt-1 text-sm text-muted">
                            Manage laboratory tests and packages.
                        </p>
                    </div>

                    <Link
                        href="/admin/lab-tests/new"
                        className="flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary-hover"
                    >
                        <Plus className="h-4 w-4" />
                        Add Lab Test
                    </Link>
                </div>

                <div className="mb-5 rounded-2xl border border-border bg-surface p-4 shadow-sm">
                    <div className="grid gap-3 md:grid-cols-4">
                        <div className="relative md:col-span-2">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <input
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Search by name, code or category..."
                                className="h-10 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-sm text-foreground outline-none focus:border-primary"
                            />
                        </div>

                        <select
                            value={category}
                            onChange={(event) =>
                                setCategory(event.target.value)
                            }
                            className="h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary"
                        >
                            <option value="">All Categories</option>
                            {categories.map((item) => (
                                <option key={item} value={item}>
                                    {item}
                                </option>
                            ))}
                        </select>

                        <select
                            value={type}
                            onChange={(event) => setType(event.target.value)}
                            className="h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary"
                        >
                            <option value="">All Types</option>
                            <option value="test">Tests</option>
                            <option value="package">Packages</option>
                        </select>

                        <select
                            value={status}
                            onChange={(event) => setStatus(event.target.value)}
                            className="h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary md:col-span-1"
                        >
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
                    <div className="flex items-center justify-between border-b border-border px-4 py-3">
                        <h2 className="text-sm font-semibold">Catalogue</h2>
                        <span className="text-xs text-muted">
                            {labTests.length}{" "}
                            {labTests.length === 1 ? "item" : "items"}
                        </span>
                    </div>

                    {loading ? (
                        <div className="flex min-h-60 items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                    ) : labTests.length === 0 ? (
                        <div className="flex min-h-60 flex-col items-center justify-center px-4 text-center">
                            <FlaskConical className="mb-3 h-8 w-8 text-muted-foreground" />
                            <p className="text-sm font-medium">
                                No lab tests found
                            </p>
                            <p className="mt-1 text-xs text-muted">
                                Try changing your filters or add a new lab
                                test.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-190 text-left">
                                <thead>
                                    <tr className="border-b border-border bg-surface-secondary text-xs text-muted">
                                        <th className="px-4 py-3 font-medium">
                                            Test
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Category
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Type
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Price
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Collection
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Status
                                        </th>
                                        <th className="px-4 py-3 text-right font-medium">
                                            Action
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {labTests.map((labTest) => (
                                        <tr
                                            key={String(labTest._id)}
                                            className="border-b border-border transition last:border-0 hover:bg-surface-secondary"
                                        >
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                                                        {labTest.type ===
                                                            "package" ? (
                                                            <Package className="h-4 w-4" />
                                                        ) : (
                                                            <FlaskConical className="h-4 w-4" />
                                                        )}
                                                    </div>

                                                    <div>
                                                        <Link
                                                            href={`/admin/lab-tests/${labTest._id}`}
                                                            className="text-sm font-medium hover:text-primary"
                                                        >
                                                            {labTest.name}
                                                        </Link>

                                                        {labTest.code && (
                                                            <p className="mt-0.5 text-xs text-muted">
                                                                {labTest.code}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-4 py-4 text-sm text-muted">
                                                {labTest.category}
                                            </td>

                                            <td className="px-4 py-4">
                                                <span className="rounded-full bg-surface-secondary px-2 py-1 text-xs capitalize text-muted">
                                                    {labTest.type}
                                                </span>
                                            </td>

                                            <td className="px-4 py-4 text-sm font-medium">
                                                ₹
                                                {labTest.price.toLocaleString(
                                                    "en-IN"
                                                )}
                                            </td>

                                            <td className="px-4 py-4 text-sm text-muted">
                                                {labTest.home_collection
                                                    ? "Home"
                                                    : "Centre"}
                                            </td>

                                            <td className="px-4 py-4">
                                                <span
                                                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${labTest.is_active
                                                            ? "bg-success/10 text-success"
                                                            : "bg-surface-secondary text-muted"
                                                        }`}
                                                >
                                                    {labTest.is_active
                                                        ? "Active"
                                                        : "Inactive"}
                                                </span>
                                            </td>

                                            <td className="px-4 py-4 text-right">
                                                <Link
                                                    href={`/admin/lab-tests/${labTest._id}`}
                                                    className="inline-flex h-9 items-center gap-2 rounded-xl border border-border px-3 text-xs font-medium transition hover:border-primary hover:text-primary"
                                                >
                                                    <Edit className="h-3.5 w-3.5" />
                                                    Edit
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}