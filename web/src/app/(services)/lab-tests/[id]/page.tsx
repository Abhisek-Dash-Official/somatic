"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Clock3, FlaskConical, Home } from "lucide-react";
import type { ILabTestDocument } from "@/models/LabTest";

export default function LabTestDetailsPage() {
    const params = useParams();
    const id = String(params.id);

    const [test, setTest] = useState<ILabTestDocument | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchTest() {
            try {
                const response = await fetch(`/api/lab-tests/${id}`, { cache: "no-store" });
                const result = await response.json();

                if (!response.ok || !result.success) throw new Error(result.error || "Lab test not found.");

                setTest(result.data);
            } catch (error) {
                setError(error instanceof Error ? error.message : "Failed to load lab test.");
            } finally {
                setLoading(false);
            }
        }

        fetchTest();
    }, [id]);

    if (loading) {
        return (
            <main className="min-h-screen bg-background px-5 py-16 text-center text-sm text-muted">
                Loading...
            </main>
        );
    }

    if (error || !test) {
        return (
            <main className="min-h-screen bg-background px-5 py-16 text-center text-sm text-danger">
                {error || "Lab test not found."}
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-background text-foreground">
            <div className="mx-auto max-w-6xl px-5 py-8 lg:px-8">
                <Link
                    href="/lab-tests"
                    className="inline-flex items-center gap-2 rounded-xl px-2 py-1 text-sm text-muted transition-colors hover:bg-surface-secondary hover:text-primary"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to lab tests
                </Link>

                <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_300px]">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
                            <FlaskConical className="h-4 w-4" />
                            {test.category}
                        </div>

                        <h1 className="mt-4 text-3xl font-semibold tracking-tight">{test.name}</h1>

                        {test.description && (
                            <p className="mt-4 max-w-3xl text-sm leading-7 text-muted">
                                {test.description}
                            </p>
                        )}

                        <div className="mt-8 grid gap-4 rounded-2xl border border-border bg-surface p-5 sm:grid-cols-3">
                            <div>
                                <p className="text-xs text-muted-foreground">Sample</p>
                                <p className="mt-1 text-sm">{test.sample_type || "As advised"}</p>
                            </div>

                            <div>
                                <p className="text-xs text-muted-foreground">Report time</p>
                                <p className="mt-1 flex items-center gap-2 text-sm">
                                    <Clock3 className="h-4 w-4 text-primary" />
                                    {test.report_time || "As advised"}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-muted-foreground">Collection</p>
                                <p className="mt-1 flex items-center gap-2 text-sm">
                                    <Home className="h-4 w-4 text-primary" />
                                    {test.home_collection ? "Home collection" : "Centre visit"}
                                </p>
                            </div>
                        </div>

                        {test.preparation && (
                            <section className="mt-8 rounded-2xl border border-border bg-surface p-5">
                                <h2 className="text-lg font-semibold">Preparation</h2>
                                <p className="mt-3 text-sm leading-7 text-muted">{test.preparation}</p>
                            </section>
                        )}

                        {test.parameters?.length > 0 && (
                            <section className="mt-8">
                                <h2 className="text-lg font-semibold">Parameters</h2>

                                <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-surface">
                                    <div className="grid grid-cols-3 border-b border-border bg-surface-secondary px-4 py-3 text-xs font-medium text-muted">
                                        <span>Parameter</span>
                                        <span>Unit</span>
                                        <span className="text-right">Reference range</span>
                                    </div>

                                    {test.parameters.map((parameter, index) => (
                                        <div
                                            key={`${parameter.name}-${index}`}
                                            className="grid grid-cols-3 border-b border-border px-4 py-3 text-sm last:border-0"
                                        >
                                            <span>{parameter.name}</span>
                                            <span className="text-muted">{parameter.unit || "—"}</span>
                                            <span className="text-right text-muted">
                                                {parameter.reference_range || "—"}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    <aside className="h-fit rounded-2xl border border-border bg-surface p-6">
                        <p className="text-xs text-muted-foreground">Test price</p>
                        <p className="mt-2 text-3xl font-semibold">
                            ₹{test.price.toLocaleString("en-IN")}
                        </p>

                        <div className="mt-6 border-t border-border pt-5 text-sm text-muted">
                            <div className="flex justify-between py-2">
                                <span>Test</span>
                                <span>₹{test.price.toLocaleString("en-IN")}</span>
                            </div>

                            <div className="flex justify-between py-2">
                                <span>Home collection</span>
                                <span>{test.home_collection ? "Included" : "—"}</span>
                            </div>
                        </div>

                        <Link
                            href={`/lab-tests/booking?tests=${test._id}`}
                            className="mt-6 block rounded-xl bg-primary px-4 py-3 text-center text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
                        >
                            Book this {test.type === "package" ? "package" : "test"}
                        </Link>
                    </aside>
                </div>
            </div>
        </main>
    );
}