"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
    Ambulance,
    ChevronRight,
    Clock3,
    MapPin,
    Phone,
    Search,
    UserRound,
} from "lucide-react";

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
    pending: "border-warning/20 bg-warning/10 text-warning",
    contacting_patient: "border-info/20 bg-info/10 text-info",
    hospital_selected: "border-primary/20 bg-primary/10 text-primary",
    dispatched: "border-info/20 bg-info/10 text-info",
    arrived: "border-success/20 bg-success/10 text-success",
    cancelled: "border-danger/20 bg-danger/10 text-danger",
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

            if (search.trim()) {
                params.set("search", search.trim());
            }

            const res = await fetch(
                `/api/dispatcher/ambulances?${params.toString()}`,
            );

            if (!res.ok) {
                throw new Error("Failed to fetch ambulance requests");
            }

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
        <main className="min-h-screen bg-background px-4 py-6 text-foreground sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-danger/20 bg-danger/10">
                            <Ambulance className="h-6 w-6 text-danger" />
                        </div>

                        <div>
                            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                                Ambulance Requests
                            </h1>
                            <p className="mt-1 text-sm text-muted">
                                Manage emergency ambulance coordination.
                            </p>
                        </div>
                    </div>

                    <div className="rounded-xl border border-border bg-surface px-4 py-2.5 text-xs text-muted">
                        Auto refresh · 15s
                    </div>
                </div>

                <div className="mb-5 rounded-2xl border border-border bg-surface p-3 shadow-sm">
                    <div className="flex flex-col gap-3 lg:flex-row">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <input
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setPage(1);
                                }}
                                placeholder="Search patient, contact, location or hospital..."
                                className="h-12 w-full rounded-xl border border-border bg-surface-secondary pl-11 pr-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10"
                            />
                        </div>

                        <select
                            value={status}
                            onChange={(e) => {
                                setStatus(e.target.value);
                                setPage(1);
                            }}
                            className="h-12 rounded-xl border border-border bg-surface-secondary px-4 text-sm text-foreground outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 lg:w-56"
                        >
                            <option value="active">Active</option>
                            <option value="pending">Pending</option>
                            <option value="contacting_patient">
                                Contacting Patient
                            </option>
                            <option value="hospital_selected">
                                Hospital Selected
                            </option>
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
                            <div
                                key={item}
                                className="h-40 animate-pulse rounded-2xl border border-border bg-surface"
                            />
                        ))}
                    </div>
                ) : requests.length === 0 ? (
                    <div className="rounded-2xl border border-border bg-surface px-6 py-20 text-center shadow-sm">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-secondary">
                            <Ambulance className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h2 className="text-lg font-semibold text-foreground">
                            No ambulance requests
                        </h2>
                        <p className="mt-1 text-sm text-muted">
                            There are no requests matching your current filters.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {requests.map((request) => {
                            const ambulanceStatus =
                                request.ambulance_dispatch?.status || "pending";
                            const patient = request.patient_info;

                            return (
                                <Link
                                    key={request._id}
                                    href={`/dispatcher/ambulances/${request._id}`}
                                    className="group rounded-2xl border border-border bg-surface p-5 shadow-sm transition hover:border-primary/40 hover:bg-surface-secondary"
                                >
                                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                                        <div className="min-w-0 flex-1">
                                            <div className="mb-3 flex flex-wrap items-center gap-2">
                                                <span
                                                    className={`rounded-full border px-3 py-1 text-xs font-medium ${statusStyles[ambulanceStatus] ||
                                                        "border-border bg-surface-secondary text-muted"
                                                        }`}
                                                >
                                                    {statusLabels[ambulanceStatus] ||
                                                        ambulanceStatus}
                                                </span>

                                                {request.ai_draft?.is_emergency && (
                                                    <span className="rounded-full border border-danger/20 bg-danger/10 px-3 py-1 text-xs font-medium text-danger">
                                                        Emergency
                                                    </span>
                                                )}

                                                {request.department_info?.name && (
                                                    <span className="rounded-full border border-border bg-surface-secondary px-3 py-1 text-xs text-muted">
                                                        {request.department_info.name}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                                <div>
                                                    <p className="mb-1 text-xs text-muted-foreground">
                                                        Patient
                                                    </p>
                                                    <div className="flex items-center gap-2">
                                                        <UserRound className="h-4 w-4 text-primary" />
                                                        <p className="truncate text-sm font-semibold text-foreground">
                                                            {patient?.username ||
                                                                "Unknown Patient"}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div>
                                                    <p className="mb-1 text-xs text-muted-foreground">
                                                        Contact
                                                    </p>
                                                    <div className="flex items-center gap-2">
                                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                                        <p className="text-sm text-muted">
                                                            {patient?.contact_no ||
                                                                "Not available"}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div>
                                                    <p className="mb-1 text-xs text-muted-foreground">
                                                        Location
                                                    </p>
                                                    <div className="flex items-center gap-2">
                                                        <MapPin className="h-4 w-4 text-danger" />
                                                        <p className="truncate text-sm text-muted">
                                                            {request.ambulance_dispatch
                                                                ?.patient_location?.address ||
                                                                "Location not added"}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div>
                                                    <p className="mb-1 text-xs text-muted-foreground">
                                                        Requested
                                                    </p>
                                                    <div className="flex items-center gap-2">
                                                        <Clock3 className="h-4 w-4 text-muted-foreground" />
                                                        <p className="text-sm text-muted">
                                                            {formatTime(
                                                                request.ambulance_dispatch
                                                                    ?.requested_at ||
                                                                request.created_at,
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {request.ambulance_dispatch
                                                ?.receiving_hospital?.name && (
                                                    <div className="mt-4 border-t border-border pt-4">
                                                        <p className="text-xs text-muted-foreground">
                                                            Receiving Hospital
                                                        </p>
                                                        <p className="mt-1 text-sm font-medium text-foreground">
                                                            {
                                                                request.ambulance_dispatch
                                                                    .receiving_hospital.name
                                                            }
                                                        </p>
                                                    </div>
                                                )}
                                        </div>

                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-surface-secondary transition group-hover:border-primary/40 group-hover:bg-primary/10">
                                            <ChevronRight className="h-5 w-5 text-muted group-hover:text-primary" />
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
                            type="button"
                            disabled={page === 1}
                            onClick={() => setPage((value) => value - 1)}
                            className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-muted transition hover:border-primary/30 hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Previous
                        </button>

                        <span className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-muted">
                            {page} / {totalPages}
                        </span>

                        <button
                            type="button"
                            disabled={page === totalPages}
                            onClick={() => setPage((value) => value + 1)}
                            className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-muted transition hover:border-primary/30 hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </main>
    );
}