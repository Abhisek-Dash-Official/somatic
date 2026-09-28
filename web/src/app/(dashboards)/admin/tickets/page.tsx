"use client";

import { useEffect, useState } from "react";
import {
    Ticket as TicketIcon, Clock, CheckCircle2,
    Loader2, User, Mail, ShieldAlert, MessageSquare
} from "lucide-react";
import { toast } from "react-toastify";

interface TicketData {
    _id: string;
    ticket_type: string;
    message: string;
    status: "Open" | "Resolved";
    created_at: string;
    reported_by_user_id: {
        _id: string;
        username: string;
        email: string;
        role: string;
    } | null;
}

export default function AdminTicketsPage() {
    const [tickets, setTickets] = useState<TicketData[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionId, setActionId] = useState<string | null>(null);
    const [filter, setFilter] = useState<"All" | "Open" | "Resolved">("All");

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            const res = await fetch("/api/admin/tickets");
            const json = await res.json();
            if (!res.ok || !json.success) throw new Error(json.message || "Failed to load tickets");
            setTickets(json.tickets);
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusToggle = async (ticketId: string, currentStatus: string) => {
        setActionId(ticketId);
        const newStatus = currentStatus === "Open" ? "Resolved" : "Open";

        try {
            const res = await fetch("/api/admin/tickets", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ticketId, status: newStatus }),
            });

            const json = await res.json();
            if (!res.ok || !json.success) throw new Error(json.message || "Failed to update ticket");

            toast.success(`Ticket marked as ${newStatus}`);
            setTickets((prev) =>
                prev.map((t) => t._id === ticketId ? { ...t, status: newStatus } : t)
            );
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setActionId(null);
        }
    };

    const filteredTickets = tickets.filter(t => filter === "All" || t.status === filter);

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl mx-auto space-y-6 p-4 pt-20 text-foreground sm:space-y-8 sm:p-6 sm:pt-24 lg:p-8 lg:pt-8">
            <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
                <div className="flex flex-col gap-1">
                    <h1 className="flex items-center gap-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                        <div className="shrink-0 rounded-xl border border-primary/20 bg-primary/10 p-2.5">
                            <TicketIcon className="h-6 w-6 text-primary" />
                        </div>
                        Support Tickets
                    </h1>

                    <p className="mt-1 text-sm text-muted sm:text-base">
                        Manage and resolve feedback submitted by users.
                    </p>
                </div>

                <div className="flex shrink-0 rounded-xl border border-border bg-surface p-1">
                    {["All", "Open", "Resolved"].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f as any)}
                            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${filter === f
                                ? "bg-primary text-primary-foreground"
                                : "text-muted hover:bg-accent hover:text-foreground"
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {filteredTickets.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface p-12">
                        <ShieldAlert className="mb-4 h-12 w-12 text-muted-foreground" />
                        <p className="text-lg font-medium text-muted">No tickets found.</p>
                    </div>
                ) : (
                    filteredTickets.map((ticket) => {
                        const isOpen = ticket.status === "Open";

                        return (
                            <div
                                key={ticket._id}
                                className="flex flex-col justify-between rounded-xl border border-border bg-surface p-6 transition-colors hover:border-primary/30"
                            >
                                <div>
                                    <div className="mb-4 flex items-start justify-between gap-4">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span
                                                className={`rounded-md border px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${isOpen
                                                    ? "border-warning/20 bg-warning/10 text-warning"
                                                    : "border-success/20 bg-success/10 text-success"
                                                    }`}
                                            >
                                                {ticket.status}
                                            </span>

                                            <span className="rounded-md bg-surface-secondary px-2.5 py-1 text-xs font-semibold text-muted">
                                                {ticket.ticket_type}
                                            </span>
                                        </div>

                                        <span className="whitespace-nowrap font-mono text-xs text-muted-foreground">
                                            {new Date(ticket.created_at).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <div className="mb-4 rounded-lg border border-border bg-surface-secondary p-4">
                                        <div className="mb-3 flex items-center gap-2 text-sm">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-semibold text-foreground">
                                                {ticket.reported_by_user_id?.username || "Unknown User"}
                                            </span>

                                            <span className="rounded bg-accent px-2 py-0.5 text-xs text-muted capitalize">
                                                {ticket.reported_by_user_id?.role || "N/A"}
                                            </span>
                                        </div>

                                        <div className="mb-4 flex items-center gap-2 border-b border-border pb-3 text-xs text-muted-foreground">
                                            <Mail className="h-3.5 w-3.5" />
                                            {ticket.reported_by_user_id?.email || "No email available"}
                                        </div>

                                        <div className="flex items-start gap-2">
                                            <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                            <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted">
                                                {ticket.message}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-border pt-2">
                                    <button
                                        onClick={() => handleStatusToggle(ticket._id, ticket.status)}
                                        disabled={actionId === ticket._id}
                                        className={`flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-2.5 font-semibold transition-all disabled:opacity-50 ${isOpen
                                            ? "border-success/20 bg-success/10 text-success hover:bg-success/15"
                                            : "border-warning/20 bg-warning/10 text-warning hover:bg-warning/15"
                                            }`}
                                    >
                                        {actionId === ticket._id ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : isOpen ? (
                                            <><CheckCircle2 className="h-4 w-4" /> Mark as Resolved</>
                                        ) : (
                                            <><Clock className="h-4 w-4" /> Reopen Ticket</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}