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
            <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
                <section className="mb-12 text-center sm:mb-14">
                    <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted">
                        <MessageSquare className="h-3.5 w-3.5 text-primary" />
                        Support
                    </div>

                    <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
                        Contact & Support
                    </h1>

                    <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
                        {pageContent.contact.description}
                    </p>
                </section>

                <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-8">
                    <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
                        <div className="mb-7">
                            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
                                Get in touch
                            </p>

                            <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground">
                                We&apos;re here to help.
                            </h2>

                            <p className="mt-3 text-sm leading-6 text-muted">
                                Reach out to our support team whenever you need assistance
                                with the Somatic platform.
                            </p>
                        </div>

                        <div className="divide-y divide-border rounded-xl border border-border bg-surface-secondary">
                            <div className="flex items-start gap-4 p-5">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
                                    <Mail className="h-5 w-5" />
                                </div>

                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-foreground">
                                        Email us
                                    </p>

                                    <a
                                        href={`mailto:${pageContent.contact.email}`}
                                        className="mt-1 block break-all text-sm text-muted transition-colors hover:text-primary"
                                    >
                                        {pageContent.contact.email}
                                    </a>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-5">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
                                    <Phone className="h-5 w-5" />
                                </div>

                                <div>
                                    <p className="text-sm font-semibold text-foreground">
                                        24/7 Helpline
                                    </p>

                                    <a
                                        href={`tel:${pageContent.contact.helpline}`}
                                        className="mt-1 block text-sm text-muted transition-colors hover:text-primary"
                                    >
                                        {pageContent.contact.helpline}
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 rounded-xl border border-primary/20 bg-accent p-4">
                            <p className="text-xs leading-5 text-muted">
                                <strong className="mb-1 block text-sm text-foreground">
                                    Response time
                                </strong>
                                {pageContent.contact.responseTime}
                            </p>
                        </div>

                        {pageContent.contact.emergencyNotice && (
                            <div className="mt-4 rounded-xl border border-danger/20 bg-danger/10 p-4">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger" />

                                    <p className="text-xs leading-5 text-muted">
                                        {pageContent.contact.emergencyNotice}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
                        {isFetched && !user ? (
                            <div className="flex min-h-105 flex-col items-center justify-center p-8 text-center sm:p-12">
                                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-primary">
                                    <AlertCircle className="h-6 w-6" />
                                </div>

                                <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
                                    Account required
                                </p>

                                <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground">
                                    Login required
                                </h2>

                                <p className="mt-3 max-w-md text-sm leading-6 text-muted">
                                    Our feedback and ticketing system is linked to user
                                    accounts so we can track and resolve issues effectively.
                                </p>

                                <Link
                                    href="/login"
                                    className="mt-7 inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition hover:bg-primary-hover"
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

                                    <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground">
                                        Submit a ticket
                                    </h2>

                                    <p className="mt-2 text-sm text-muted">
                                        Tell us how we can help and our team will get back to you.
                                    </p>
                                </div>

                                {success && (
                                    <div className="mb-6 flex items-start gap-3 rounded-xl border border-success/20 bg-success/10 p-4 text-sm text-muted">
                                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                                        <div>
                                            <p className="font-semibold text-foreground">
                                                Ticket submitted successfully
                                            </p>
                                            <p className="mt-1">
                                                Our support team will review your request.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {error && (
                                    <div className="mb-6 flex items-start gap-3 rounded-xl border border-danger/20 bg-danger/10 p-4 text-sm text-muted">
                                        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-danger" />
                                        <p>{error}</p>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-foreground">
                                            Ticket type
                                        </label>

                                        <select
                                            value={formData.ticket_type}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    ticket_type: e.target.value,
                                                })
                                            }
                                            disabled={!user}
                                            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <option value="General Support">General Support</option>
                                            <option value="Bug Report">Bug Report</option>
                                            <option value="Feature Request">Feature Request</option>
                                            <option value="Clinical Data Issue">Clinical Data Issue</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-foreground">
                                            Describe the issue
                                        </label>

                                        <textarea
                                            required
                                            rows={7}
                                            value={formData.message}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    message: e.target.value,
                                                })
                                            }
                                            disabled={!user}
                                            placeholder="Please provide as much detail as possible..."
                                            className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm leading-6 text-foreground outline-none transition placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading || !user}
                                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
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