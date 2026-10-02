"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, FlaskConical, Home, Clock3, ChevronLeft, ChevronRight } from "lucide-react";
import type { ILabTestDocument } from "@/models/LabTest";

const LIMIT = 12;

export default function LabTestsPage() {
    const [tests, setTests] = useState<ILabTestDocument[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [type, setType] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchTests();
        }, 300);

        return () => clearTimeout(timer);
    }, [search, category, type, page]);

    async function fetchTests() {
        try {
            setLoading(true);
            setError("");

            const params = new URLSearchParams({
                page: String(page),
                limit: String(LIMIT),
            });

            if (search) params.set("search", search);
            if (category) params.set("category", category);
            if (type) params.set("type", type);

            const response = await fetch(`/api/lab-tests?${params.toString()}`, { cache: "no-store" });
            const result = await response.json();

            if (!response.ok || !result.success) throw new Error(result.error || "Failed to load lab tests.");

            setTests(result.data);
            setTotalPages(result.pagination.total_pages);

            const foundCategories = result.data.map((item: ILabTestDocument) => item.category).filter(Boolean);
            setCategories((current) => [...new Set([...current, ...foundCategories])]);
        } catch (error) {
            setError(error instanceof Error ? error.message : "Failed to load lab tests.");
        } finally {
            setLoading(false);
        }
    }

    function updateFilter(value: string, setter: (value: string) => void) {
        setter(value);
        setPage(1);
    }

    return (
        <main className="min-h-screen bg-background text-foreground">
            <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
                <div className="border-b border-border pb-7">
                    <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                        <div>
                            <p className="mb-2 text-sm font-medium text-primary">Laboratory Services</p>
                            <h1 className="text-3xl font-semibold tracking-tight">Lab Tests</h1>
                            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                                Book diagnostic tests and packages with convenient home sample collection.
                            </p>
                        </div>

                        <Link href="/lab-tests/bookings" className="w-fit border border-border px-4 py-2.5 text-sm font-medium hover:border-primary hover:text-primary">
                            My Bookings
                        </Link>
                    </div>

                    <div className="mt-7 grid gap-3 md:grid-cols-[1fr_180px_150px]">
                        <div className="flex items-center border border-border bg-surface px-3">
                            <Search className="mr-3 h-4 w-4 text-muted-foreground" />
                            <input value={search} onChange={(e) => updateFilter(e.target.value, setSearch)} placeholder="Search tests, packages or codes" className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
                        </div>

                        <select value={category} onChange={(e) => updateFilter(e.target.value, setCategory)} className="h-11 border border-border bg-surface px-3 text-sm outline-none">
                            <option value="">All categories</option>
                            {categories.map((item) => <option key={item} value={item}>{item}</option>)}
                        </select>

                        <select value={type} onChange={(e) => updateFilter(e.target.value, setType)} className="h-11 border border-border bg-surface px-3 text-sm outline-none">
                            <option value="">All types</option>
                            <option value="test">Tests</option>
                            <option value="package">Packages</option>
                        </select>
                    </div>
                </div>

                {error && <div className="mt-6 border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">{error}</div>}

                {loading ? (
                    <div className="py-16 text-center text-sm text-muted">Loading lab tests...</div>
                ) : tests.length === 0 ? (
                    <div className="py-16 text-center">
                        <FlaskConical className="mx-auto h-8 w-8 text-muted-foreground" />
                        <p className="mt-4 text-sm text-muted">No lab tests found.</p>
                    </div>
                ) : (
                    <div className="mt-6">
                        {tests.map((test) => (
                            <Link key={String(test._id)} href={`/lab-tests/${test._id}`} className="group grid gap-5 border-b border-border py-6 md:grid-cols-[1fr_170px_180px] md:items-center">
                                <div>
                                    <div className="flex items-center gap-2 text-xs text-primary">
                                        <span>{test.category}</span>
                                        <span className="text-muted-foreground">·</span>
                                        <span>{test.type === "package" ? "Package" : "Test"}</span>
                                    </div>
                                    <h2 className="mt-2 text-base font-semibold group-hover:text-primary">{test.name}</h2>
                                    {test.description && <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted">{test.description}</p>}
                                </div>

                                <div className="flex flex-wrap gap-4 text-xs text-muted">
                                    {test.home_collection && <span className="flex items-center gap-1.5"><Home className="h-3.5 w-3.5" />Home collection</span>}
                                    {test.report_time && <span className="flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5" />{test.report_time}</span>}
                                </div>

                                <div className="md:text-right">
                                    <p className="text-lg font-semibold">₹{test.price.toLocaleString("en-IN")}</p>
                                    <p className="mt-1 text-xs text-muted-foreground">View details →</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {totalPages > 1 && (
                    <div className="mt-7 flex items-center justify-between border-t border-border pt-5">
                        <button disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="flex items-center gap-2 text-sm text-muted disabled:cursor-not-allowed disabled:opacity-40">
                            <ChevronLeft className="h-4 w-4" />Previous
                        </button>
                        <span className="text-sm text-muted">Page {page} of {totalPages}</span>
                        <button disabled={page >= totalPages} onClick={() => setPage((value) => value + 1)} className="flex items-center gap-2 text-sm text-muted disabled:cursor-not-allowed disabled:opacity-40">
                            Next<ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                )}
            </div>
        </main>
    );
}