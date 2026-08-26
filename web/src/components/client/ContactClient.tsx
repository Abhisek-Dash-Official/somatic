"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useUserStore } from "@/store/useUserStore";
import { pageContent } from "@/config/content";
import { Mail, MessageSquare, AlertCircle, Loader2, Send, CheckCircle2 } from "lucide-react";

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
        <div className="container mx-auto px-4 py-20 sm:px-6 max-w-5xl">
            <div className="mb-16 flex flex-col items-center text-center">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    <MessageSquare className="h-8 w-8" />
                </div>
                <h1 className="mb-4 text-4xl font-extrabold text-white sm:text-5xl">Contact & <span className="text-blue-400">Support</span></h1>
                <p className="max-w-2xl text-lg text-slate-400">{pageContent.contact.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                {/* Contact Information Side */}
                <div className="md:col-span-1 space-y-6">
                    <div className="rounded-3xl border border-white/10 bg-[#0f172a]/60 p-8 shadow-xl">
                        <h3 className="mb-6 text-xl font-bold text-white border-b border-white/10 pb-4">Direct Contact</h3>

                        <div className="flex items-start gap-4 mb-6">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                                <Mail className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-white">Email Us</p>
                                <a href={`mailto:${pageContent.contact.email}`} className="text-slate-400 text-sm hover:text-blue-400 transition-colors">{pageContent.contact.email}</a>
                            </div>
                        </div>

                        <div className="rounded-xl bg-blue-500/10 p-4 border border-blue-500/20">
                            <p className="text-xs text-blue-300 leading-relaxed">
                                <strong className="block text-sm text-blue-400 mb-1">Response Time</strong>
                                {pageContent.contact.responseTime}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Feedback Form Side */}
                <div className="md:col-span-2 relative">

                    {/* Guest User Overlay (Strict Block) */}
                    {isFetched && !user && (
                        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-3xl bg-[#0B1120]/80 backdrop-blur-sm border border-white/10 p-8 text-center">
                            <AlertCircle className="h-12 w-12 text-blue-400 mb-4" />
                            <h3 className="text-2xl font-bold text-white mb-2">Login Required</h3>
                            <p className="text-slate-400 mb-6 max-w-md">Our feedback and ticketing system is linked to user accounts to track and resolve issues effectively.</p>
                            <Link href="/login" className="rounded-full bg-blue-600 px-8 py-3 font-semibold text-white transition-all hover:bg-blue-500">
                                Sign In to Continue
                            </Link>
                        </div>
                    )}

                    <div className="rounded-3xl border border-white/10 bg-[#0f172a]/80 p-8 sm:p-10 shadow-2xl backdrop-blur-xl">
                        <h3 className="mb-6 text-2xl font-bold text-white">Submit a Ticket</h3>

                        {success && (
                            <div className="mb-6 flex items-center gap-3 rounded-xl border border-green-500/20 bg-green-500/10 p-4 text-green-400">
                                <CheckCircle2 className="h-6 w-6 shrink-0" />
                                <p>Your feedback has been submitted!</p>
                            </div>
                        )}

                        {error && (
                            <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-400">
                                <AlertCircle className="h-5 w-5 shrink-0" />
                                <p>{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Ticket Type</label>
                                <select
                                    value={formData.ticket_type}
                                    onChange={(e) => setFormData({ ...formData, ticket_type: e.target.value })}
                                    disabled={!user}
                                    className="w-full rounded-xl border border-white/10 bg-black/30 py-3.5 px-4 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer disabled:opacity-50"
                                >
                                    <option value="General Support">General Support</option>
                                    <option value="Bug Report">Bug Report</option>
                                    <option value="Feature Request">Feature Request</option>
                                    <option value="Clinical Data Issue">Clinical Data Issue</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Describe the issue</label>
                                <textarea
                                    required
                                    rows={5}
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    disabled={!user}
                                    placeholder="Please provide as much detail as possible..."
                                    className="w-full resize-none rounded-xl border border-white/10 bg-black/30 py-3.5 px-4 text-white placeholder:text-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 custom-scrollbar"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !user}
                                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-4 font-bold text-white transition-all hover:bg-blue-500 disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Send className="h-5 w-5" /> Submit Ticket</>}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}