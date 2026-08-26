"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, MessageSquare, AlertCircle, CheckCircle2, PlusCircle, Clock } from "lucide-react";

interface Ticket {
    _id: string;
    ticket_type: string;
    message: string;
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
            <div className="flex h-[60vh] w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    const formatDate = (dateString: string) =>
        new Date(dateString).toLocaleDateString("en-US", {
            month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit"
        });

    return (
        <div className="animate-in fade-in zoom-in duration-500 max-w-5xl mx-auto space-y-6">

            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-3xl border border-white/10 bg-[#0f172a]/80 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
                        <MessageSquare className="h-8 w-8 text-blue-400" /> My Support Tickets
                    </h1>
                    <p className="mt-2 text-slate-400">Track the status of your feedback and support requests.</p>
                </div>
                <Link
                    href="/contact"
                    className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition-all hover:bg-blue-500 shrink-0"
                >
                    <PlusCircle className="h-5 w-5" /> New Ticket
                </Link>
            </div>

            {error && (
                <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-400">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <p>{error}</p>
                </div>
            )}

            {/* Tickets List */}
            <div className="rounded-3xl border border-white/10 bg-[#0f172a]/60 p-6 sm:p-8 shadow-xl">
                {tickets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/5 text-slate-500">
                            <MessageSquare className="h-8 w-8" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">No tickets found</h3>
                        <p className="text-slate-400 max-w-md">You haven't submitted any support tickets or feedback yet.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {tickets.map((ticket) => (
                            <div
                                key={ticket._id}
                                className="group flex flex-col sm:flex-row gap-4 sm:gap-6 rounded-2xl border border-white/10 bg-black/30 p-5 sm:p-6 transition-all hover:bg-white/5 hover:border-blue-500/30"
                            >
                                {/* Status Icon */}
                                <div className="shrink-0 pt-1">
                                    {ticket.status === "Open" ? (
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                                            <Clock className="h-5 w-5" />
                                        </div>
                                    ) : (
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10 text-green-400 border border-green-500/20">
                                            <CheckCircle2 className="h-5 w-5" />
                                        </div>
                                    )}
                                </div>

                                {/* Ticket Details */}
                                <div className="flex-1 space-y-2">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <h3 className="text-lg font-bold text-white">
                                            {ticket.ticket_type}
                                        </h3>
                                        <span className={`rounded-full px-3 py-1 text-xs font-semibold border ${ticket.status === "Open"
                                            ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                                            : "bg-green-500/10 text-green-400 border-green-500/20"
                                            }`}>
                                            {ticket.status}
                                        </span>
                                    </div>

                                    <p className="text-slate-300 leading-relaxed text-sm break-all whitespace-pre-wrap">
                                        {ticket.message}
                                    </p>

                                    <div className="pt-2 text-xs text-slate-500 font-medium">
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