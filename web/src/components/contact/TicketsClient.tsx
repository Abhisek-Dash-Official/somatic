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
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchTickets();
    }, []);

    if (loading) {
        return (
            <div className="flex h-[60vh] w-full items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const formatDate = (dateString: string) =>
        new Date(dateString).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });

    return (
        <div className="mx-auto max-w-5xl space-y-6 bg-background text-foreground">
            <div className="flex flex-col items-start justify-between gap-4 rounded-xl border border-border bg-surface p-6 sm:flex-row sm:items-center sm:p-8">
                <div>
                    <h1 className="flex items-center gap-3 text-2xl font-bold text-foreground sm:text-3xl">
                        <MessageSquare className="h-8 w-8 text-primary" />
                        My Support Tickets
                    </h1>
                    <p className="mt-2 text-muted">
                        Track the status of your feedback and support requests.
                    </p>
                </div>

                <Link
                    href="/contact"
                    className="flex shrink-0 items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground transition hover:bg-primary-hover"
                >
                    <PlusCircle className="h-5 w-5" />
                    New Ticket
                </Link>
            </div>

            {error && (
                <div className="flex items-center gap-3 rounded-lg border border-danger/20 bg-danger/10 p-4 text-danger">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <p>{error}</p>
                </div>
            )}

            <div className="rounded-xl border border-border bg-surface p-6 sm:p-8">
                {tickets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface-secondary text-muted-foreground">
                            <MessageSquare className="h-8 w-8" />
                        </div>
                        <h3 className="mb-2 text-xl font-bold text-foreground">
                            No tickets found
                        </h3>
                        <p className="max-w-md text-muted">
                            You haven't submitted any support tickets or feedback yet.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {tickets.map((ticket) => (
                            <div
                                key={ticket._id}
                                className="group flex flex-col gap-4 rounded-xl border border-border bg-surface-secondary p-5 transition hover:border-primary/30 hover:bg-accent sm:flex-row sm:gap-6 sm:p-6"
                            >
                                <div className="shrink-0 pt-1">
                                    {ticket.status === "Open" ? (
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-warning/20 bg-warning/10 text-warning">
                                            <Clock className="h-5 w-5" />
                                        </div>
                                    ) : (
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-success/20 bg-success/10 text-success">
                                            <CheckCircle2 className="h-5 w-5" />
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 space-y-3">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <h3 className="text-lg font-bold text-foreground">
                                            {ticket.ticket_type}
                                        </h3>

                                        <span
                                            className={`rounded-full border px-3 py-1 text-xs font-semibold ${ticket.status === "Open"
                                                ? "border-warning/20 bg-warning/10 text-warning"
                                                : "border-success/20 bg-success/10 text-success"
                                                }`}
                                        >
                                            {ticket.status}
                                        </span>
                                    </div>

                                    <div>
                                        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            Your Message
                                        </p>
                                        <p className="break-all whitespace-pre-wrap text-sm leading-relaxed text-muted">
                                            {ticket.message}
                                        </p>
                                    </div>

                                    {ticket.admin_response?.trim() && (
                                        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                                            <div className="mb-2 flex items-center gap-2">
                                                <Reply className="h-4 w-4 text-primary" />
                                                <span className="text-sm font-semibold text-foreground">
                                                    Admin Response
                                                </span>
                                            </div>

                                            <p className="break-all whitespace-pre-wrap text-sm leading-relaxed text-muted">
                                                {ticket.admin_response}
                                            </p>
                                        </div>
                                    )}

                                    <div className="pt-1 text-xs font-medium text-muted-foreground">
                                        Submitted on: {formatDate(ticket.created_at)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}