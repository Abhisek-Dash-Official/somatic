"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import {
    Loader2,
    ChevronLeft,
    ChevronRight,
    AlertTriangle,
    Download,
    X,
    Search,
    SlidersHorizontal,
    RotateCcw,
    CalendarDays,
} from "lucide-react";
import { exportConsultationsToCSV } from "@/lib/exportUtils";

export default function DoctorConsultationsListClient() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [downloading, setDownloading] = useState(false);

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("all");
    const [emergency, setEmergency] = useState("all");
    const [ageMin, setAgeMin] = useState("");
    const [ageMax, setAgeMax] = useState("");
    const [dateRange, setDateRange] = useState("all");
    const [sort, setSort] = useState("priority");

    const [showFilters, setShowFilters] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const [exportLimit, setExportLimit] = useState("50");

    const hasFilters =
        search ||
        status !== "all" ||
        emergency !== "all" ||
        ageMin ||
        ageMax ||
        dateRange !== "all" ||
        sort !== "priority";

    useEffect(() => {
        fetchConsultations(page);
    }, [
        page,
        search,
        status,
        emergency,
        ageMin,
        ageMax,
        dateRange,
        sort,
    ]);

    useEffect(() => {
        const intervalId = setInterval(() => {
            fetchConsultations(page, true);
        }, 15000);

        return () => clearInterval(intervalId);
    }, [
        page,
        search,
        status,
        emergency,
        ageMin,
        ageMax,
        dateRange,
        sort,
    ]);

    const buildQueryParams = (includePagination = true) => {
        const params = new URLSearchParams();

        if (includePagination) {
            params.set("page", page.toString());
            params.set("limit", "10");
        }

        if (search.trim()) params.set("search", search.trim());
        if (status !== "all") params.set("status", status);
        if (emergency !== "all") params.set("emergency", emergency);
        if (ageMin) params.set("ageMin", ageMin);
        if (ageMax) params.set("ageMax", ageMax);
        if (dateRange !== "all") params.set("dateRange", dateRange);
        if (sort !== "priority") params.set("sort", sort);

        return params;
    };

    const fetchConsultations = async (p: number, silent = false) => {
        if (!silent) setLoading(true);

        try {
            const params = buildQueryParams();
            params.set("page", p.toString());

            const res = await fetch(
                `/api/doctor/consultations?${params.toString()}`,
                {
                    cache: "no-store",
                },
            );

            const json = await res.json();

            if (res.ok) {
                setData(json.consultations || []);
                setTotalPages(json.pagination?.totalPages || 1);
                setTotal(json.pagination?.total || 0);
            } else {
                if (!silent) {
                    toast.error(json.error || "Failed to load history.");
                }
            }
        } catch {
            if (!silent) {
                toast.error("Network error.");
            }
        } finally {
            if (!silent) setLoading(false);
        }
    };

    const resetFilters = () => {
        setSearch("");
        setStatus("all");
        setEmergency("all");
        setAgeMin("");
        setAgeMax("");
        setDateRange("all");
        setSort("priority");
        setPage(1);
    };

    const updateFilter = (
        setter: React.Dispatch<React.SetStateAction<string>>,
        value: string,
    ) => {
        setter(value);
        setPage(1);
    };

    const handleSearchChange = (value: string) => {
        setSearch(value);
        setPage(1);
    };

    const handleDownloadCSV = async () => {
        setShowExportModal(false);
        setDownloading(true);

        const toastId = toast.loading(
            `Fetching ${exportLimit === "all" ? "all" : `last ${exportLimit}`} matching records...`,
        );

        try {
            const params = buildQueryParams(false);
            params.set("limit", exportLimit);

            const res = await fetch(
                `/api/doctor/consultations/export?${params.toString()}`,
                {
                    cache: "no-store",
                },
            );

            const json = await res.json();

            if (res.ok) {
                const cases = json.consultations;

                if (!cases || cases.length === 0) {
                    toast.update(toastId, {
                        render: "No data found to export.",
                        type: "info",
                        isLoading: false,
                        autoClose: 3000,
                    });
                    return;
                }

                exportConsultationsToCSV(
                    cases,
                    "Doctor_Consultations_Report",
                );

                toast.update(toastId, {
                    render: "Report downloaded successfully!",
                    type: "success",
                    isLoading: false,
                    autoClose: 3000,
                });
            } else {
                toast.update(toastId, {
                    render: json.error || "Failed to fetch export data.",
                    type: "error",
                    isLoading: false,
                    autoClose: 3000,
                });
            }
        } catch {
            toast.update(toastId, {
                render: "Network error during export.",
                type: "error",
                isLoading: false,
                autoClose: 3000,
            });
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0B1120] text-slate-300 py-10">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">
                            All Consultations
                        </h1>
                        <p className="text-slate-400">
                            Your complete case history, prioritized by emergency and unresolved status.
                        </p>
                    </div>

                    <button
                        onClick={() => setShowExportModal(true)}
                        disabled={downloading}
                        className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 px-4 py-2.5 rounded-lg font-medium transition disabled:opacity-50"
                    >
                        {downloading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Download className="w-4 h-4" />
                        )}
                        Export CSV
                    </button>
                </div>

                <div className="bg-[#131C31] border border-slate-800 rounded-2xl shadow-xl mb-6">
                    <div className="p-4 flex flex-col lg:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) =>
                                    handleSearchChange(e.target.value)
                                }
                                placeholder="Search complaints or symptoms..."
                                className="w-full bg-[#0B1120] border border-slate-700 text-white rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                            />
                        </div>

                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition ${showFilters || hasFilters
                                    ? "bg-blue-500/10 border-blue-500/40 text-blue-400"
                                    : "bg-[#0B1120] border-slate-700 text-slate-300 hover:bg-slate-800"
                                }`}
                        >
                            <SlidersHorizontal className="w-4 h-4" />
                            Filters
                            {hasFilters && (
                                <span className="w-2 h-2 rounded-full bg-blue-500" />
                            )}
                        </button>

                        {hasFilters && (
                            <button
                                onClick={resetFilters}
                                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 text-sm transition"
                            >
                                <RotateCcw className="w-4 h-4" />
                                Reset
                            </button>
                        )}
                    </div>

                    {showFilters && (
                        <div className="border-t border-slate-800 p-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-2">
                                        Status
                                    </label>
                                    <select
                                        value={status}
                                        onChange={(e) =>
                                            updateFilter(
                                                setStatus,
                                                e.target.value,
                                            )
                                        }
                                        className="w-full bg-[#0B1120] border border-slate-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                                    >
                                        <option value="all">All Statuses</option>
                                        <option value="pending_review">
                                            Pending Review
                                        </option>
                                        <option value="in_review">
                                            In Review
                                        </option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-2">
                                        Emergency
                                    </label>
                                    <select
                                        value={emergency}
                                        onChange={(e) =>
                                            updateFilter(
                                                setEmergency,
                                                e.target.value,
                                            )
                                        }
                                        className="w-full bg-[#0B1120] border border-slate-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                                    >
                                        <option value="all">
                                            All Cases
                                        </option>
                                        <option value="emergency">
                                            Emergency Only
                                        </option>
                                        <option value="normal">
                                            Non-Emergency
                                        </option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-2">
                                        Date
                                    </label>
                                    <select
                                        value={dateRange}
                                        onChange={(e) =>
                                            updateFilter(
                                                setDateRange,
                                                e.target.value,
                                            )
                                        }
                                        className="w-full bg-[#0B1120] border border-slate-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                                    >
                                        <option value="all">All Time</option>
                                        <option value="today">Today</option>
                                        <option value="7days">
                                            Last 7 Days
                                        </option>
                                        <option value="30days">
                                            Last 30 Days
                                        </option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-2">
                                        Sort By
                                    </label>
                                    <select
                                        value={sort}
                                        onChange={(e) =>
                                            updateFilter(
                                                setSort,
                                                e.target.value,
                                            )
                                        }
                                        className="w-full bg-[#0B1120] border border-slate-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                                    >
                                        <option value="priority">
                                            Emergency + Newest
                                        </option>
                                        <option value="newest">
                                            Newest First
                                        </option>
                                        <option value="oldest">
                                            Oldest First
                                        </option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-2">
                                        Minimum Age
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="120"
                                        value={ageMin}
                                        onChange={(e) =>
                                            updateFilter(
                                                setAgeMin,
                                                e.target.value,
                                            )
                                        }
                                        placeholder="e.g. 18"
                                        className="w-full bg-[#0B1120] border border-slate-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-2">
                                        Maximum Age
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="120"
                                        value={ageMax}
                                        onChange={(e) =>
                                            updateFilter(
                                                setAgeMax,
                                                e.target.value,
                                            )
                                        }
                                        placeholder="e.g. 60"
                                        className="w-full bg-[#0B1120] border border-slate-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between mb-3 px-1">
                    <p className="text-sm text-slate-500">
                        {total} {total === 1 ? "case" : "cases"} found
                    </p>

                    {hasFilters && (
                        <p className="text-xs text-blue-400">
                            Filters applied
                        </p>
                    )}
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    </div>
                ) : (
                    <div className="bg-[#131C31] rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
                        <div className="divide-y divide-slate-800">
                            {data.length === 0 ? (
                                <div className="p-12 text-center">
                                    <Search className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                                    <p className="text-slate-400 font-medium">
                                        No cases found
                                    </p>
                                    <p className="text-slate-600 text-sm mt-1">
                                        Try changing or clearing your filters.
                                    </p>
                                </div>
                            ) : (
                                data.map((item) => (
                                    <Link
                                        href={`/doctor/consultations/${item._id}`}
                                        key={item._id}
                                        className="block p-6 hover:bg-slate-800/50 transition"
                                    >
                                        <div className="flex justify-between items-center gap-4">
                                            <div className="min-w-0">
                                                <div className="flex items-center flex-wrap gap-3 mb-2">
                                                    {item.ai_draft
                                                        ?.is_emergency && (
                                                            <span className="flex items-center gap-1 bg-red-500/10 text-red-400 text-xs px-2 py-1 rounded border border-red-500/20 font-bold uppercase tracking-wider">
                                                                <AlertTriangle className="w-3 h-3" />
                                                                SOS
                                                            </span>
                                                        )}

                                                    <span
                                                        className={`px-2 py-1 text-xs font-semibold rounded border ${item.status ===
                                                                "in_review"
                                                                ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                                                                : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                                            }`}
                                                    >
                                                        {item.status
                                                            ?.replace(
                                                                "_",
                                                                " ",
                                                            )
                                                            .toUpperCase()}
                                                    </span>

                                                    <span className="text-slate-500 text-xs font-medium bg-slate-800 px-2 py-1 rounded">
                                                        Age:{" "}
                                                        {item.patient_input
                                                            ?.age ?? "N/A"}
                                                    </span>

                                                    <span className="flex items-center gap-1 text-slate-500 text-xs">
                                                        <CalendarDays className="w-3 h-3" />
                                                        {new Date(
                                                            item.created_at,
                                                        ).toLocaleDateString()}
                                                    </span>
                                                </div>

                                                <h3 className="text-slate-200 font-semibold truncate">
                                                    {item.ai_draft?.chief_complaints?.join(
                                                        ", ",
                                                    ) ||
                                                        "No complaints listed"}
                                                </h3>

                                                {item.patient_input
                                                    ?.symptoms_raw_text && (
                                                        <p className="text-slate-500 text-sm mt-1 truncate max-w-2xl">
                                                            {
                                                                item.patient_input
                                                                    .symptoms_raw_text
                                                            }
                                                        </p>
                                                    )}
                                            </div>

                                            <span className="text-slate-500 hover:text-white transition shrink-0 text-xl">
                                                →
                                            </span>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>

                        <div className="p-4 border-t border-slate-800 flex justify-between items-center bg-[#0d1425]">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage(page - 1)}
                                className="flex items-center gap-1 px-4 py-2 bg-slate-800 text-sm rounded-lg hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Prev
                            </button>

                            <span className="text-sm text-slate-400">
                                Page {page} of {totalPages || 1}
                            </span>

                            <button
                                disabled={page >= totalPages}
                                onClick={() => setPage(page + 1)}
                                className="flex items-center gap-1 px-4 py-2 bg-slate-800 text-sm rounded-lg hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                Next
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {showExportModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md bg-[#0B1120] border border-slate-700/60 rounded-xl shadow-2xl p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-white">
                                Export Options
                            </h2>

                            <button
                                onClick={() =>
                                    setShowExportModal(false)
                                }
                                className="text-slate-400 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <p className="text-sm text-slate-400 mb-4">
                            Export records using your currently applied filters.
                        </p>

                        <select
                            value={exportLimit}
                            onChange={(e) =>
                                setExportLimit(e.target.value)
                            }
                            className="w-full bg-[#131C31] text-white border border-slate-700 rounded-lg p-2.5 mb-6 focus:outline-none focus:border-blue-500"
                        >
                            <option value="50">
                                Last 50 matching cases
                            </option>
                            <option value="100">
                                Last 100 matching cases
                            </option>
                            <option value="500">
                                Last 500 matching cases
                            </option>
                            <option value="all">
                                All matching cases
                            </option>
                        </select>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() =>
                                    setShowExportModal(false)
                                }
                                className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-800 transition"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleDownloadCSV}
                                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition flex items-center gap-2"
                            >
                                <Download className="w-4 h-4" />
                                Download
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}