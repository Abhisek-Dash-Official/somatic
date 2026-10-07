"use client";

import { useEffect, useState } from "react";
import {
    CheckCircle2,
    Clock,
    Loader2,
    Mail,
    MessageSquare,
    Reply,
    ShieldAlert,
    Ticket as TicketIcon,
    User,
} from "lucide-react";
import { toast } from "react-toastify";

interface TicketData {
    _id: string;
    ticket_type: string;
    message: string;
    admin_response?: string;
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
    const [notifyMessages, setNotifyMessages] = useState<Record<string, string>>({});

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            const res = await fetch("/api/admin/tickets");
            const json = await res.json();

            if (!res.ok || !json.success) {
                throw new Error(json.message || "Failed to load tickets");
            }

            setTickets(json.tickets);
        } catch (error: any) {
            toast.error(error.message || "Failed to load tickets");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusToggle = async (
        ticketId: string,
        currentStatus: "Open" | "Resolved",
    ) => {
        const newStatus = currentStatus === "Open" ? "Resolved" : "Open";
        const notifyMessage = notifyMessages[ticketId]?.trim() || "";

        if (newStatus === "Resolved" && !notifyMessage) {
            toast.error("Please write a message before resolving the ticket");
            return;
        }

        setActionId(ticketId);

        try {
            const res = await fetch("/api/admin/tickets", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ticketId,
                    status: newStatus,
                    ...(newStatus === "Resolved" ? { notifyMessage } : {}),
                }),
            });

            const json = await res.json();

            if (!res.ok || !json.success) {
                throw new Error(json.message || "Failed to update ticket");
            }

            setTickets((prev) =>
                prev.map((ticket) =>
                    ticket._id === ticketId
                        ? {
                            ...ticket,
                            status: newStatus,
                            ...(newStatus === "Resolved"
                                ? { admin_response: notifyMessage }
                                : {}),
                        }
                        : ticket,
                ),
            );

            if (newStatus === "Resolved") {
                setNotifyMessages((prev) => {
                    const updated = { ...prev };
                    delete updated[ticketId];
                    return updated;
                });

                toast.success("Ticket resolved successfully");
            } else {
                toast.success("Ticket reopened successfully");
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to update ticket");
        } finally {
            setActionId(null);
        }
    };

    const filteredTickets = tickets.filter(
        (ticket) => filter === "All" || ticket.status === filter,
    );

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-7xl space-y-6 p-4 pt-20 text-foreground sm:space-y-8 sm:p-6 sm:pt-24 lg:p-8 lg:pt-8">
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
                    {["All", "Open", "Resolved"].map((filterName) => (
                        <button
                            key={filterName}
                            onClick={() =>
                                setFilter(filterName as "All" | "Open" | "Resolved")
                            }
                            className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${filter === filterName
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted hover:bg-accent hover:text-foreground"
                                }`}
                        >
                            {filterName}
                        </button>
                    ))}
                </div>
            </div>

            {filteredTickets.length === 0 ? (
                <div className="flex min-h-75 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface p-12 shadow-sm">
                    <ShieldAlert className="mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="text-lg font-medium text-muted">
                        No tickets found.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2">
                    {filteredTickets.map((ticket) => {
                        const isOpen = ticket.status === "Open";
                        const isLoading = actionId === ticket._id;
                        const notifyMessage = notifyMessages[ticket._id] || "";

                        return (
                            <div
                                key={ticket._id}
                                className="flex h-135 min-h-0 flex-col overflow-hidden rounded-2xl border border-border bg-surface p-5 shadow-sm transition-colors hover:border-primary/30"
                            >
                                <div className="mb-4 flex shrink-0 items-center justify-between gap-4">
                                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                                        <span
                                            className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${isOpen
                                                    ? "border-warning/20 bg-warning/10 text-warning"
                                                    : "border-success/20 bg-success/10 text-success"
                                                }`}
                                        >
                                            {ticket.status}
                                        </span>

                                        <span className="max-w-45 truncate rounded-xl border border-border bg-surface-secondary px-2.5 py-1 text-xs font-semibold text-muted">
                                            {ticket.ticket_type}
                                        </span>
                                    </div>

                                    <span className="shrink-0 whitespace-nowrap font-mono text-xs text-muted-foreground">
                                        {new Date(ticket.created_at).toLocaleDateString()}
                                    </span>
                                </div>

                                <div className="flex h-62.5 shrink-0 flex-col overflow-hidden rounded-xl border border-border bg-surface-secondary p-4">
                                    <div className="mb-3 flex shrink-0 items-center gap-2">
                                        <User className="h-4 w-4 shrink-0 text-muted-foreground" />

                                        <span className="truncate text-sm font-semibold text-foreground">
                                            {ticket.reported_by_user_id?.username ||
                                                "Unknown User"}
                                        </span>

                                        <span className="shrink-0 rounded-full border border-border bg-accent px-2 py-0.5 text-xs capitalize text-muted">
                                            {ticket.reported_by_user_id?.role || "N/A"}
                                        </span>
                                    </div>

                                    <div className="mb-3 flex shrink-0 items-center gap-2 border-b border-border pb-3 text-xs text-muted-foreground">
                                        <Mail className="h-3.5 w-3.5 shrink-0" />

                                        <span className="truncate">
                                            {ticket.reported_by_user_id?.email ||
                                                "No email available"}
                                        </span>
                                    </div>

                                    <div className="flex min-h-0 flex-1 items-stretch gap-2">
                                        <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-primary" />

                                        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden pr-2">
                                            <p className="wrap-break-word whitespace-pre-wrap text-sm leading-relaxed text-muted">
                                                {ticket.message}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 flex h-36.25 shrink-0 flex-col border-t border-border pt-4">
                                    {isOpen ? (
                                        <>
                                            <textarea
                                                value={notifyMessage}
                                                onChange={(e) =>
                                                    setNotifyMessages((prev) => ({
                                                        ...prev,
                                                        [ticket._id]: e.target.value,
                                                    }))
                                                }
                                                disabled={isLoading}
                                                placeholder="Write a message to the user before resolving..."
                                                className="h-19 w-full shrink-0 resize-none rounded-xl border border-border bg-surface-secondary px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary disabled:cursor-not-allowed disabled:opacity-50"
                                            />

                                            <button
                                                onClick={() =>
                                                    handleStatusToggle(
                                                        ticket._id,
                                                        ticket.status,
                                                    )
                                                }
                                                disabled={isLoading}
                                                className="mt-3 flex h-11 shrink-0 w-full items-center justify-center gap-2 rounded-xl border border-success/20 bg-success/10 px-4 font-semibold text-success transition-all hover:bg-success/15 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                {isLoading ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <CheckCircle2 className="h-4 w-4" />
                                                )}

                                                {isLoading
                                                    ? "Resolving..."
                                                    : "Mark as Resolved"}
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <div className="h-25 shrink-0 overflow-hidden rounded-xl border border-primary/20 bg-primary/5 px-3 py-2.5">
                                                <div className="mb-1 flex items-center gap-2">
                                                    <Reply className="h-3.5 w-3.5 shrink-0 text-primary" />

                                                    <span className="text-xs font-semibold text-foreground">
                                                        Admin Response
                                                    </span>
                                                </div>

                                                <div
                                                    className="h-11.25 overflow-y-auto overflow-x-hidden pr-2"
                                                    style={{ scrollbarGutter: "stable" }}
                                                >
                                                    <p className="wrap-break-word whitespace-pre-wrap text-xs leading-relaxed text-muted">
                                                        {ticket.admin_response ||
                                                            "No admin response recorded."}
                                                    </p>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() =>
                                                    handleStatusToggle(
                                                        ticket._id,
                                                        ticket.status,
                                                    )
                                                }
                                                disabled={isLoading}
                                                className="mt-3 flex h-11 shrink-0 w-full items-center justify-center gap-2 rounded-xl border border-warning/20 bg-warning/10 px-4 font-semibold text-warning transition-all hover:bg-warning/15 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                {isLoading ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Clock className="h-4 w-4" />
                                                )}

                                                {isLoading
                                                    ? "Reopening..."
                                                    : "Reopen Ticket"}
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}