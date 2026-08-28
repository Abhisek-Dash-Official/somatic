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
                <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6 sm:space-y-8 p-4 pt-20 sm:p-6 sm:pt-24 lg:p-8 lg:pt-8 w-full max-w-7xl mx-auto text-slate-200">

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/20 shrink-0">
                            <TicketIcon className="h-6 w-6 text-blue-400" />
                        </div>
                        Support Tickets
                    </h1>
                    <p className="text-sm sm:text-base text-slate-400 mt-1">
                        Manage and resolve feedback submitted by users.
                    </p>
                </div>

                <div className="flex bg-[#131C31] border border-slate-800 p-1 rounded-xl shrink-0">
                    {["All", "Open", "Resolved"].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f as any)}
                            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${filter === f
                                    ? "bg-blue-600 text-white shadow-md"
                                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredTickets.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center p-12 bg-[#131C31] border border-slate-800 rounded-2xl border-dashed">
                        <ShieldAlert className="h-12 w-12 text-slate-600 mb-4" />
                        <p className="text-lg font-medium text-slate-400">No tickets found.</p>
                    </div>
                ) : (
                    filteredTickets.map((ticket) => {
                        const isOpen = ticket.status === "Open";

                        return (
                            <div
                                key={ticket._id}
                                className="bg-[#131C31] border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col justify-between hover:border-slate-700 transition-colors"
                            >
                                <div>
                                    <div className="flex justify-between items-start gap-4 mb-4">
                                        <div className="flex flex-wrap gap-2 items-center">
                                            <span className={`px-2.5 py-1 text-xs font-bold rounded-md border uppercase tracking-wider ${isOpen
                                                    ? "bg-orange-500/10 text-orange-400 border-orange-500/20"
                                                    : "bg-green-500/10 text-green-400 border-green-500/20"
                                                }`}>
                                                {ticket.status}
                                            </span>
                                            <span className="bg-slate-800 text-slate-300 px-2.5 py-1 text-xs font-semibold rounded-md">
                                                {ticket.ticket_type}
                                            </span>
                                        </div>
                                        <span className="text-xs text-slate-500 font-mono whitespace-nowrap">
                                            {new Date(ticket.created_at).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <div className="mb-4 bg-[#0B1120] border border-slate-800/50 rounded-xl p-4">
                                        <div className="flex items-center gap-2 mb-3 text-sm">
                                            <User className="h-4 w-4 text-slate-500" />
                                            <span className="font-semibold text-slate-200">
                                                {ticket.reported_by_user_id?.username || "Unknown User"}
                                            </span>
                                            <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 capitalize">
                                                {ticket.reported_by_user_id?.role || "N/A"}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-slate-500 mb-4 border-b border-slate-800/50 pb-3">
                                            <Mail className="h-3.5 w-3.5" />
                                            {ticket.reported_by_user_id?.email || "No email available"}
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <MessageSquare className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                                            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                                                {ticket.message}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-2 border-t border-slate-800">
                                    <button
                                        onClick={() => handleStatusToggle(ticket._id, ticket.status)}
                                        disabled={actionId === ticket._id}
                                        className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all border disabled:opacity-50 ${isOpen
                                                ? "bg-green-500/10 hover:bg-green-500/20 text-green-400 border-green-500/20 hover:border-green-500/30"
                                                : "bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border-orange-500/20 hover:border-orange-500/30"
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