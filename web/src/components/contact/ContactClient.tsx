"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useUserStore } from "@/store/useUserStore";
import { pageContent } from "@/config/content";
import {
    Mail,
    MessageSquare,
    AlertCircle,
    Loader2,
    Send,
    CheckCircle2,
    Phone,
} from "lucide-react";

export default function ContactClient() {
    const { user, isFetched } = useUserStore();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        ticket_type: "General Support",
        message: "",
    });

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess(false);

        try {
            const res = await fetch("/api/users/feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Failed to submit feedback");

            setSuccess(true);
            setFormData({ ...formData, message: "" });
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="bg-background text-foreground">
            <div className="mx-auto max-w-5xl px-5 py-14 sm:px-6 sm:py-20 lg:py-24">
                {/* HEADER */}
                <section className="border-b border-border pb-12 sm:pb-16">
                    <div className="flex items-start gap-4">
                        <div className="mt-1 hidden h-9 w-9 items-center justify-center bg-accent text-accent-foreground sm:flex">
                            <MessageSquare className="h-4 w-4" />
                        </div>

                        <div>
                            <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-primary">
                                Support
                            </p>

                            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                                Contact & support.
                            </h1>

                            <p className="mt-5 max-w-2xl text-base leading-7 text-muted sm:text-lg">
                                {pageContent.contact.description}
                            </p>
                        </div>
                    </div>
                </section>

                <section className="grid gap-8 pt-10 sm:pt-14 md:grid-cols-[0.75fr_1.25fr]">
                    {/* CONTACT INFORMATION */}
                    <div>
                        <h2 className="mb-6 text-lg font-bold">Get in touch</h2>

                        <div className="divide-y divide-border border-y border-border">
                            <div className="flex items-start gap-4 py-5">
                                <Mail className="mt-0.5 h-5 w-5 shrink-0 text-primary" />

                                <div>
                                    <p className="text-sm font-semibold">Email us</p>

                                    <a
                                        href={`mailto:${pageContent.contact.email}`}
                                        className="mt-1 block text-sm text-muted transition-colors hover:text-primary"
                                    >
                                        {pageContent.contact.email}
                                    </a>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 py-5">
                                <Phone className="mt-0.5 h-5 w-5 shrink-0 text-primary" />

                                <div>
                                    <p className="text-sm font-semibold">24/7 Helpline</p>

                                    <a
                                        href={`tel:${pageContent.contact.helpline}`}
                                        className="mt-1 block text-sm text-muted transition-colors hover:text-primary"
                                    >
                                        {pageContent.contact.helpline}
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 border-l-2 border-primary bg-surface-secondary px-4 py-4">
                            <p className="text-xs leading-5 text-muted">
                                <strong className="mb-1 block text-sm text-foreground">
                                    Response time
                                </strong>
                                {pageContent.contact.responseTime}
                            </p>
                        </div>

                        {pageContent.contact.emergencyNotice && (
                            <div className="mt-4 border-l-2 border-danger bg-surface-secondary px-4 py-4">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger" />

                                    <p className="text-xs leading-5 text-muted">
                                        {pageContent.contact.emergencyNotice}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* FORM */}
                    <div className="border border-border bg-surface">
                        {isFetched && !user ? (
                            <div className="flex min-h-105 flex-col items-center justify-center p-8 text-center sm:p-12">
                                <div className="mb-5 flex h-10 w-10 items-center justify-center bg-accent text-accent-foreground">
                                    <AlertCircle className="h-5 w-5" />
                                </div>

                                <h2 className="text-2xl font-bold">
                                    Login required
                                </h2>

                                <p className="mt-3 max-w-md text-sm leading-6 text-muted">
                                    Our feedback and ticketing system is linked to user accounts so we can track and resolve issues effectively.
                                </p>

                                <Link
                                    href="/login"
                                    className="mt-7 inline-flex items-center justify-center bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-hover"
                                >
                                    Sign in to continue
                                </Link>
                            </div>
                        ) : (
                            <div className="p-6 sm:p-8 lg:p-10">
                                <div className="mb-8">
                                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
                                        Feedback
                                    </p>

                                    <h2 className="mt-2 text-2xl font-bold">
                                        Submit a ticket
                                    </h2>
                                </div>

                                {success && (
                                    <div className="mb-6 flex items-center gap-3 border-l-2 border-success bg-surface-secondary p-4 text-sm text-muted">
                                        <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
                                        <p>Your feedback has been submitted.</p>
                                    </div>
                                )}

                                {error && (
                                    <div className="mb-6 flex items-center gap-3 border-l-2 border-danger bg-surface-secondary p-4 text-sm text-muted">
                                        <AlertCircle className="h-5 w-5 shrink-0 text-danger" />
                                        <p>{error}</p>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <label className="mb-2 block text-sm font-medium">
                                            Ticket type
                                        </label>

                                        <select
                                            value={formData.ticket_type}
                                            onChange={(e) => setFormData({ ...formData, ticket_type: e.target.value })}
                                            disabled={!user}
                                            className="w-full appearance-none border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-primary disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <option value="General Support">General Support</option>
                                            <option value="Bug Report">Bug Report</option>
                                            <option value="Feature Request">Feature Request</option>
                                            <option value="Clinical Data Issue">Clinical Data Issue</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium">
                                            Describe the issue
                                        </label>

                                        <textarea
                                            required
                                            rows={6}
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            disabled={!user}
                                            placeholder="Please provide as much detail as possible..."
                                            className="w-full resize-none border border-border bg-background px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground transition-colors focus:border-primary disabled:cursor-not-allowed disabled:opacity-50"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading || !user}
                                        className="flex w-full items-center justify-center gap-2 bg-primary py-3.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {loading ? (
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        ) : (
                                            <>
                                                <Send className="h-4 w-4" />
                                                Submit ticket
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </main>
    );
}