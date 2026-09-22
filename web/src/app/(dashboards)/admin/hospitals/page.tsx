"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    Building2,
    ChevronLeft,
    ChevronRight,
    Edit3,
    Eye,
    Plus,
    Search,
    SlidersHorizontal,
} from "lucide-react";
import { toast } from "react-toastify";

interface Hospital {
    _id: string;
    name: string;
    qr_identifier: string;
    paperwork_endpoint: string;
    auth_config?: {
        type?: "none" | "api_key" | "bearer" | "basic";
    };
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

interface Pagination {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export default function HospitalsPage() {
    const [hospitals, setHospitals] = useState<Hospital[]>([]);
    const [pagination, setPagination] =
        useState<Pagination>({
            total: 0,
            page: 1,
            limit: 10,
            totalPages: 1,
        });

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [sortBy, setSortBy] = useState("created_at");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">(
        "desc",
    );
    const [loading, setLoading] = useState(true);

    const fetchHospitals = async () => {
        try {
            setLoading(true);

            const params = new URLSearchParams();

            params.set("page", pagination.page.toString());
            params.set("limit", pagination.limit.toString());

            if (search.trim()) {
                params.set("search", search.trim());
            }

            if (status) {
                params.set("status", status);
            }

            params.set("sortBy", sortBy);
            params.set("sortOrder", sortOrder);

            const response = await fetch(
                `/api/admin/hospitals?${params.toString()}`,
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.message || "Failed to fetch hospitals",
                );
            }

            setHospitals(data.data || []);
            setPagination(data.pagination);
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Failed to fetch hospitals",
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHospitals();
    }, [
        pagination.page,
        pagination.limit,
        status,
        sortBy,
        sortOrder,
    ]);

    const handleSearch = () => {
        setPagination((prev) => ({
            ...prev,
            page: 1,
        }));

        fetchHospitals();
    };

    const handleSort = (value: string) => {
        if (sortBy === value) {
            setSortOrder((prev) =>
                prev === "asc" ? "desc" : "asc",
            );
        } else {
            setSortBy(value);
            setSortOrder("asc");
        }

        setPagination((prev) => ({
            ...prev,
            page: 1,
        }));
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    return (
        <div className="w-full space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="flex items-center gap-3 text-2xl font-bold text-white sm:text-3xl">
                        <Building2 className="h-7 w-7 text-blue-400" />
                        Hospitals
                    </h1>

                    <p className="mt-1 text-sm text-slate-400">
                        Manage hospital integrations and QR identifiers
                    </p>
                </div>

                <Link
                    href="/admin/hospitals/new"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
                >
                    <Plus className="h-5 w-5" />
                    Add Hospital
                </Link>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                <div className="flex flex-col gap-3 lg:flex-row">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />

                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handleSearch();
                                }
                            }}
                            placeholder="Search hospital or QR identifier..."
                            className="w-full rounded-xl border border-white/10 bg-slate-950 py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500"
                        />
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                        <select
                            value={status}
                            onChange={(e) => {
                                setStatus(e.target.value);
                                setPagination((prev) => ({
                                    ...prev,
                                    page: 1,
                                }));
                            }}
                            className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
                        >
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>

                        <button
                            type="button"
                            onClick={handleSearch}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/10"
                        >
                            <SlidersHorizontal className="h-4 w-4" />
                            Search
                        </button>
                    </div>
                </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60">
                <div className="hidden overflow-x-auto md:block">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/10 text-left">
                                <th
                                    onClick={() => handleSort("name")}
                                    className="cursor-pointer px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-400"
                                >
                                    Hospital
                                </th>

                                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
                                    QR Identifier
                                </th>

                                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
                                    Auth
                                </th>

                                <th
                                    onClick={() => handleSort("created_at")}
                                    className="cursor-pointer px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-400"
                                >
                                    Created
                                </th>

                                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
                                    Status
                                </th>

                                <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-400">
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-5 py-16 text-center text-sm text-slate-500"
                                    >
                                        Loading hospitals...
                                    </td>
                                </tr>
                            ) : hospitals.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-5 py-16 text-center text-sm text-slate-500"
                                    >
                                        No hospitals found
                                    </td>
                                </tr>
                            ) : (
                                hospitals.map((hospital) => (
                                    <tr
                                        key={hospital._id}
                                        className="border-b border-white/5 last:border-0"
                                    >
                                        <td className="px-5 py-4">
                                            <p className="font-semibold text-white">
                                                {hospital.name}
                                            </p>

                                            <p className="mt-1 max-w-xs truncate text-xs text-slate-500">
                                                {hospital.paperwork_endpoint}
                                            </p>
                                        </td>

                                        <td className="px-5 py-4">
                                            <span className="rounded-lg bg-slate-800 px-2.5 py-1 font-mono text-xs text-slate-300">
                                                {hospital.qr_identifier}
                                            </span>
                                        </td>

                                        <td className="px-5 py-4 text-sm capitalize text-slate-300">
                                            {hospital.auth_config?.type || "none"}
                                        </td>

                                        <td className="px-5 py-4 text-sm text-slate-400">
                                            {formatDate(hospital.created_at)}
                                        </td>

                                        <td className="px-5 py-4">
                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-semibold ${hospital.is_active
                                                        ? "bg-green-500/10 text-green-400"
                                                        : "bg-red-500/10 text-red-400"
                                                    }`}
                                            >
                                                {hospital.is_active
                                                    ? "Active"
                                                    : "Inactive"}
                                            </span>
                                        </td>

                                        <td className="px-5 py-4">
                                            <div className="flex justify-end gap-2">
                                                <Link
                                                    href={`/admin/hospitals/${hospital._id}`}
                                                    className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Link>

                                                <Link
                                                    href={`/admin/hospitals/${hospital._id}?edit=true`}
                                                    className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-blue-400"
                                                >
                                                    <Edit3 className="h-4 w-4" />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="divide-y divide-white/5 md:hidden">
                    {loading ? (
                        <div className="px-5 py-16 text-center text-sm text-slate-500">
                            Loading hospitals...
                        </div>
                    ) : hospitals.length === 0 ? (
                        <div className="px-5 py-16 text-center text-sm text-slate-500">
                            No hospitals found
                        </div>
                    ) : (
                        hospitals.map((hospital) => (
                            <div
                                key={hospital._id}
                                className="space-y-4 p-5"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <h3 className="truncate font-semibold text-white">
                                            {hospital.name}
                                        </h3>

                                        <p className="mt-1 truncate text-xs text-slate-500">
                                            {hospital.paperwork_endpoint}
                                        </p>
                                    </div>

                                    <span
                                        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${hospital.is_active
                                                ? "bg-green-500/10 text-green-400"
                                                : "bg-red-500/10 text-red-400"
                                            }`}
                                    >
                                        {hospital.is_active
                                            ? "Active"
                                            : "Inactive"}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <p className="text-xs text-slate-500">
                                            QR Identifier
                                        </p>
                                        <p className="mt-1 truncate font-mono text-slate-300">
                                            {hospital.qr_identifier}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-slate-500">
                                            Authentication
                                        </p>
                                        <p className="mt-1 capitalize text-slate-300">
                                            {hospital.auth_config?.type ||
                                                "none"}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Link
                                        href={`/admin/hospitals/${hospital._id}`}
                                        className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-200"
                                    >
                                        <Eye className="h-4 w-4" />
                                        View
                                    </Link>

                                    <Link
                                        href={`/admin/hospitals/${hospital._id}?edit=true`}
                                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white"
                                    >
                                        <Edit3 className="h-4 w-4" />
                                        Edit
                                    </Link>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="flex flex-col gap-3 border-t border-white/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-slate-500">
                        {pagination.total === 0
                            ? "No hospitals"
                            : `Showing ${(pagination.page - 1) *
                            pagination.limit +
                            1
                            }-${Math.min(
                                pagination.page * pagination.limit,
                                pagination.total,
                            )} of ${pagination.total}`}
                    </p>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            disabled={pagination.page <= 1}
                            onClick={() =>
                                setPagination((prev) => ({
                                    ...prev,
                                    page: prev.page - 1,
                                }))
                            }
                            className="rounded-lg border border-white/10 p-2 text-slate-400 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>

                        <span className="px-2 text-sm text-slate-300">
                            {pagination.page} /{" "}
                            {pagination.totalPages || 1}
                        </span>

                        <button
                            type="button"
                            disabled={
                                pagination.page >=
                                pagination.totalPages
                            }
                            onClick={() =>
                                setPagination((prev) => ({
                                    ...prev,
                                    page: prev.page + 1,
                                }))
                            }
                            className="rounded-lg border border-white/10 p-2 text-slate-400 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}