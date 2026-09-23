"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Ambulance, ChevronRight, Clock3, MapPin, Phone, Search, UserRound } from "lucide-react";

type AmbulanceRequest = {
    _id: string;
    status?: string;
    ai_draft?: {
        is_emergency?: boolean;
        chief_complaints?: string[];
    };
    patient_info?: {
        _id: string;
        username?: string;
        email?: string;
        contact_no?: string;
        address?: string;
        patient_info?: {
            blood_grp?: string;
        };
    };
    department_info?: {
        _id: string;
        name?: string;
    };
    doctor_info?: {
        _id: string;
        username?: string;
        contact_no?: string;
    };
    ambulance_dispatch?: {
        required?: boolean;
        status?: string;
        patient_location?: {
            address?: string;
        };
        receiving_hospital?: {
            name?: string;
            address?: string;
        };
        requested_at?: string;
    };
    created_at?: string;
};

const statusLabels: Record<string, string> = {
    pending: "Pending",
    contacting_patient: "Contacting Patient",
    hospital_selected: "Hospital Selected",
    dispatched: "Dispatched",
    arrived: "Arrived",
    cancelled: "Cancelled",
};

const statusStyles: Record<string, string> = {
    pending: "border-amber-500/20 bg-amber-500/10 text-amber-300",
    contacting_patient: "border-blue-500/20 bg-blue-500/10 text-blue-300",
    hospital_selected: "border-violet-500/20 bg-violet-500/10 text-violet-300",
    dispatched: "border-cyan-500/20 bg-cyan-500/10 text-cyan-300",
    arrived: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
    cancelled: "border-red-500/20 bg-red-500/10 text-red-300",
};

export default function DispatcherAmbulances() {
    const [requests, setRequests] = useState<AmbulanceRequest[]>([]);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("active");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);

    const fetchRequests = useCallback(async () => {
        try {
            setLoading(true);

            const params = new URLSearchParams({
                page: String(page),
                limit: "10",
                status,
            });

            if (search.trim()) params.set("search", search.trim());

            const res = await fetch(`/api/dispatcher/ambulances?${params.toString()}`);

            if (!res.ok) throw new Error("Failed to fetch ambulance requests");

            const data = await res.json();

            setRequests(data.requests || []);
            setTotalPages(data.pagination?.totalPages || 1);
        } catch (error) {
            console.error(error);
            setRequests([]);
        } finally {
            setLoading(false);
        }
    }, [page, search, status]);

    useEffect(() => {
        const timer = setTimeout(fetchRequests, 300);
        return () => clearTimeout(timer);
    }, [fetchRequests]);

    useEffect(() => {
        const interval = setInterval(fetchRequests, 15000);
        return () => clearInterval(interval);
    }, [fetchRequests]);

    const formatTime = (date?: string) => {
        if (!date) return "Not available";

        return new Date(date).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <main className="min-h-screen bg-[#0b1220] px-4 py-6 text-white sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10">
                            <Ambulance className="h-6 w-6 text-red-400" />
                        </div>

                        <div>
                            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Ambulance Requests</h1>
                            <p className="mt-1 text-sm text-slate-400">Manage emergency ambulance coordination.</p>
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-[#111827] px-4 py-2 text-xs text-slate-400">
                        Auto refresh · 15s
                    </div>
                </div>

                <div className="mb-5 rounded-2xl border border-slate-800 bg-[#111827] p-3 shadow-xl shadow-black/10">
                    <div className="flex flex-col gap-3 lg:flex-row">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                            <input
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setPage(1);
                                }}
                                placeholder="Search patient, contact, location or hospital..."
                                className="h-12 w-full rounded-xl border border-slate-800 bg-[#0b1220] pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500"
                            />
                        </div>

                        <select
                            value={status}
                            onChange={(e) => {
                                setStatus(e.target.value);
                                setPage(1);
                            }}
                            className="h-12 rounded-xl border border-slate-800 bg-[#0b1220] px-4 text-sm text-slate-200 outline-none focus:border-blue-500 lg:w-56"
                        >
                            <option value="active">Active</option>
                            <option value="pending">Pending</option>
                            <option value="contacting_patient">Contacting Patient</option>
                            <option value="hospital_selected">Hospital Selected</option>
                            <option value="dispatched">Dispatched</option>
                            <option value="arrived">Arrived</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="all">All Requests</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="grid gap-4">
                        {[1, 2, 3].map((item) => (
                            <div key={item} className="h-40 animate-pulse rounded-2xl border border-slate-800 bg-[#111827]" />
                        ))}
                    </div>
                ) : requests.length === 0 ? (
                    <div className="rounded-2xl border border-slate-800 bg-[#111827] px-6 py-20 text-center">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800">
                            <Ambulance className="h-6 w-6 text-slate-500" />
                        </div>
                        <h2 className="text-lg font-semibold text-slate-200">No ambulance requests</h2>
                        <p className="mt-1 text-sm text-slate-500">There are no requests matching your current filters.</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {requests.map((request) => {
                            const ambulanceStatus = request.ambulance_dispatch?.status || "pending";
                            const patient = request.patient_info;

                            return (
                                <Link
                                    key={request._id}
                                    href={`/dispatcher/ambulances/${request._id}`}
                                    className="group rounded-2xl border border-slate-800 bg-[#111827] p-5 transition hover:border-blue-500/40 hover:bg-[#131d2e]"
                                >
                                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                                        <div className="min-w-0 flex-1">
                                            <div className="mb-3 flex flex-wrap items-center gap-2">
                                                <span className={`rounded-full border px-3 py-1 text-xs font-medium ${statusStyles[ambulanceStatus] || "border-slate-700 bg-slate-800 text-slate-300"}`}>
                                                    {statusLabels[ambulanceStatus] || ambulanceStatus}
                                                </span>

                                                {request.ai_draft?.is_emergency && (
                                                    <span className="rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-300">
                                                        Emergency
                                                    </span>
                                                )}

                                                {request.department_info?.name && (
                                                    <span className="rounded-full border border-slate-700 bg-slate-800/70 px-3 py-1 text-xs text-slate-400">
                                                        {request.department_info.name}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                                <div>
                                                    <p className="mb-1 text-xs text-slate-500">Patient</p>
                                                    <div className="flex items-center gap-2">
                                                        <UserRound className="h-4 w-4 text-blue-400" />
                                                        <p className="truncate text-sm font-semibold text-slate-100">{patient?.username || "Unknown Patient"}</p>
                                                    </div>
                                                </div>

                                                <div>
                                                    <p className="mb-1 text-xs text-slate-500">Contact</p>
                                                    <div className="flex items-center gap-2">
                                                        <Phone className="h-4 w-4 text-slate-500" />
                                                        <p className="text-sm text-slate-300">{patient?.contact_no || "Not available"}</p>
                                                    </div>
                                                </div>

                                                <div>
                                                    <p className="mb-1 text-xs text-slate-500">Location</p>
                                                    <div className="flex items-center gap-2">
                                                        <MapPin className="h-4 w-4 text-red-400" />
                                                        <p className="truncate text-sm text-slate-300">{request.ambulance_dispatch?.patient_location?.address || "Location not added"}</p>
                                                    </div>
                                                </div>

                                                <div>
                                                    <p className="mb-1 text-xs text-slate-500">Requested</p>
                                                    <div className="flex items-center gap-2">
                                                        <Clock3 className="h-4 w-4 text-slate-500" />
                                                        <p className="text-sm text-slate-300">{formatTime(request.ambulance_dispatch?.requested_at || request.created_at)}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {request.ambulance_dispatch?.receiving_hospital?.name && (
                                                <div className="mt-4 border-t border-slate-800 pt-4">
                                                    <p className="text-xs text-slate-500">Receiving Hospital</p>
                                                    <p className="mt-1 text-sm font-medium text-slate-200">{request.ambulance_dispatch.receiving_hospital.name}</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-slate-800/60 transition group-hover:border-blue-500/40 group-hover:bg-blue-500/10">
                                            <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-blue-400" />
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}

                {totalPages > 1 && (
                    <div className="mt-6 flex items-center justify-center gap-3">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage((value) => value - 1)}
                            className="rounded-xl border border-slate-800 bg-[#111827] px-4 py-2 text-sm text-slate-300 transition hover:border-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Previous
                        </button>

                        <span className="rounded-xl border border-slate-800 bg-[#111827] px-4 py-2 text-sm text-slate-400">
                            {page} / {totalPages}
                        </span>

                        <button
                            disabled={page === totalPages}
                            onClick={() => setPage((value) => value + 1)}
                            className="rounded-xl border border-slate-800 bg-[#111827] px-4 py-2 text-sm text-slate-300 transition hover:border-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </main>
    );
}