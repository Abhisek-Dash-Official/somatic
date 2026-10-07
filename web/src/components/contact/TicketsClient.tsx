"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, MessageSquare, AlertCircle, CheckCircle2, PlusCircle, Clock, Reply } from "lucide-react";

interface Ticket {
    _id: string;
    ticket_type: string;
    message: string;
    admin_response?: string;
    status: string;
    created_at: string;
}

export default function TicketsClient() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const res = await fetch("/api/users/feedback");
                const data = await res.json();

                if (!res.ok) throw new Error(data.error || "Failed to fetch tickets");
                setTickets(data.feedbacks || []);
            } catch (err: unknown) {
                setError(err instanceof Error ? err.message : "Failed to fetch tickets");
            } finally {
                setLoading(false);
            }
        };

        fetchTickets();
    }, []);

    if (loading) {
        return (
            <div className="flex min-h-[60vh] w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const formatDate = (dateString: string) =>
        new Date(dateString).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });

    return (
        <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
            <section className="flex flex-col justify-between gap-5 rounded-2xl border border-border bg-surface p-5 shadow-sm sm:flex-row sm:items-center sm:p-7">
                <div className="flex min-w-0 items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent text-primary">
                        <MessageSquare className="h-5 w-5" />
                    </div>

                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-primary">Support</p>
                        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                            My Support Tickets
                        </h1>
                        <p className="mt-1 text-sm text-muted">
                            Track the status of your feedback and support requests.
                        </p>
                    </div>
                </div>

                <Link
                    href="/contact"
                    className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover sm:w-auto"
                >
                    <PlusCircle className="h-4 w-4" />
                    New Ticket
                </Link>
            </section>

            {error && (
                <div className="flex items-start gap-3 rounded-2xl border border-danger/20 bg-danger/5 p-4 text-danger">
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                    <div>
                        <p className="text-sm font-semibold">Unable to load tickets</p>
                        <p className="mt-0.5 text-sm">{error}</p>
                    </div>
                </div>
            )}

            <section className="rounded-2xl border border-border bg-surface shadow-sm">
                <div className="border-b border-border px-5 py-4 sm:px-6">
                    <p className="text-sm font-semibold text-foreground">
                        {tickets.length} {tickets.length === 1 ? "Ticket" : "Tickets"}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                        Your support history and responses.
                    </p>
                </div>

                <div className="p-4 sm:p-6">
                    {tickets.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-14 text-center">
                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-muted">
                                <MessageSquare className="h-7 w-7" />
                            </div>

                            <h3 className="text-lg font-semibold text-foreground">
                                No tickets found
                            </h3>

                            <p className="mt-1 max-w-md text-sm text-muted">
                                You haven't submitted any support tickets or feedback yet.
                            </p>

                            <Link
                                href="/contact"
                                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover"
                            >
                                <PlusCircle className="h-4 w-4" />
                                Create a Ticket
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {tickets.map((ticket) => {
                                const isOpen = ticket.status === "Open";

                                return (
                                    <article
                                        key={ticket._id}
                                        className="rounded-2xl border border-border bg-surface-secondary p-4 transition hover:border-primary/30 sm:p-5"
                                    >
                                        <div className="flex flex-col gap-4 sm:flex-row">
                                            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${isOpen ? "border-warning/20 bg-warning/10 text-warning" : "border-success/20 bg-success/10 text-success"}`}>
                                                {isOpen ? <Clock className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                                    <div>
                                                        <h3 className="text-base font-semibold text-foreground sm:text-lg">
                                                            {ticket.ticket_type}
                                                        </h3>
                                                        <p className="mt-1 text-xs text-muted">
                                                            Submitted {formatDate(ticket.created_at)}
                                                        </p>
                                                    </div>

                                                    <span className={`w-fit rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${isOpen ? "border-warning/20 bg-warning/10 text-warning" : "border-success/20 bg-success/10 text-success"}`}>
                                                        {ticket.status}
                                                    </span>
                                                </div>

                                                <div className="mt-5">
                                                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
                                                        Your Message
                                                    </p>
                                                    <p className="whitespace-pre-wrap wrap-break-word text-sm leading-6 text-foreground/80">
                                                        {ticket.message}
                                                    </p>
                                                </div>

                                                {ticket.admin_response?.trim() && (
                                                    <div className="mt-5 rounded-xl border border-primary/20 bg-accent p-4">
                                                        <div className="mb-2 flex items-center gap-2">
                                                            <Reply className="h-4 w-4 text-primary" />
                                                            <span className="text-sm font-semibold text-foreground">
                                                                Admin Response
                                                            </span>
                                                        </div>

                                                        <p className="whitespace-pre-wrap wrap-break-word text-sm leading-6 text-muted">
                                                            {ticket.admin_response}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}