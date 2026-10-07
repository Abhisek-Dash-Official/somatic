"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import {
    AlertTriangle,
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    Download,
    Loader2,
    RotateCcw,
    Search,
    SlidersHorizontal,
    X,
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
    }, [page, search, status, emergency, ageMin, ageMax, dateRange, sort]);

    useEffect(() => {
        const intervalId = setInterval(() => {
            fetchConsultations(page, true);
        }, 15000);

        return () => clearInterval(intervalId);
    }, [page, search, status, emergency, ageMin, ageMax, dateRange, sort]);

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

            const res = await fetch(`/api/doctor/consultations?${params.toString()}`, {
                cache: "no-store",
            });

            const json = await res.json();

            if (res.ok) {
                setData(json.consultations || []);
                setTotalPages(json.pagination?.totalPages || 1);
                setTotal(json.pagination?.total || 0);
            } else if (!silent) {
                toast.error(json.error || "Failed to load history.");
            }
        } catch {
            if (!silent) toast.error("Network error.");
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
                { cache: "no-store" },
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

                exportConsultationsToCSV(cases, "Doctor_Consultations_Report");

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

    const inputClass =
        "w-full rounded-xl border border-border bg-surface-secondary px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition focus:border-primary/50 focus:ring-4 focus:ring-primary/10";

    return (
        <div className="min-h-screen bg-background py-8 text-foreground sm:py-10">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
                <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                            All Consultations
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                            Your complete case history, prioritized by emergency and unresolved status.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setShowExportModal(true)}
                        disabled={downloading}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-surface-secondary px-4 py-2.5 text-sm font-medium text-muted transition hover:bg-accent hover:text-foreground disabled:opacity-50"
                    >
                        {downloading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Download className="h-4 w-4" />
                        )}
                        Export CSV
                    </button>
                </div>

                <div className="mb-6 overflow-hidden rounded-2xl border border-border bg-surface">
                    <div className="flex flex-col gap-3 p-4 lg:flex-row">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                placeholder="Search complaints or symptoms..."
                                className={`${inputClass} pl-10 pr-4`}
                            />
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowFilters(!showFilters)}
                            className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition ${showFilters || hasFilters
                                    ? "border-primary/30 bg-accent text-primary"
                                    : "border-border bg-surface-secondary text-muted hover:bg-accent hover:text-foreground"
                                }`}
                        >
                            <SlidersHorizontal className="h-4 w-4" />
                            Filters
                            {hasFilters && <span className="h-2 w-2 rounded-full bg-primary" />}
                        </button>

                        {hasFilters && (
                            <button
                                type="button"
                                onClick={resetFilters}
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm text-muted transition hover:bg-accent hover:text-foreground"
                            >
                                <RotateCcw className="h-4 w-4" />
                                Reset
                            </button>
                        )}
                    </div>

                    {showFilters && (
                        <div className="border-t border-border p-4">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                <FilterSelect
                                    label="Status"
                                    value={status}
                                    onChange={(value) => updateFilter(setStatus, value)}
                                    options={[
                                        ["all", "All Statuses"],
                                        ["pending_review", "Pending Review"],
                                        ["in_review", "In Review"],
                                    ]}
                                    inputClass={inputClass}
                                />

                                <FilterSelect
                                    label="Emergency"
                                    value={emergency}
                                    onChange={(value) => updateFilter(setEmergency, value)}
                                    options={[
                                        ["all", "All Cases"],
                                        ["emergency", "Emergency Only"],
                                        ["normal", "Non-Emergency"],
                                    ]}
                                    inputClass={inputClass}
                                />

                                <FilterSelect
                                    label="Date"
                                    value={dateRange}
                                    onChange={(value) => updateFilter(setDateRange, value)}
                                    options={[
                                        ["all", "All Time"],
                                        ["today", "Today"],
                                        ["7days", "Last 7 Days"],
                                        ["30days", "Last 30 Days"],
                                    ]}
                                    inputClass={inputClass}
                                />

                                <FilterSelect
                                    label="Sort By"
                                    value={sort}
                                    onChange={(value) => updateFilter(setSort, value)}
                                    options={[
                                        ["priority", "Emergency + Newest"],
                                        ["newest", "Newest First"],
                                        ["oldest", "Oldest First"],
                                    ]}
                                    inputClass={inputClass}
                                />

                                <FilterInput
                                    label="Minimum Age"
                                    value={ageMin}
                                    onChange={(value) => updateFilter(setAgeMin, value)}
                                    placeholder="e.g. 18"
                                    inputClass={inputClass}
                                />

                                <FilterInput
                                    label="Maximum Age"
                                    value={ageMax}
                                    onChange={(value) => updateFilter(setAgeMax, value)}
                                    placeholder="e.g. 60"
                                    inputClass={inputClass}
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="mb-3 flex items-center justify-between px-1">
                    <p className="text-sm text-muted">
                        {total} {total === 1 ? "case" : "cases"} found
                    </p>

                    {hasFilters && <p className="text-xs font-medium text-primary">Filters applied</p>}
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-2xl border border-border bg-surface">
                        <div className="divide-y divide-border">
                            {data.length === 0 ? (
                                <div className="p-12 text-center">
                                    <Search className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                                    <p className="font-medium text-muted">No cases found</p>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Try changing or clearing your filters.
                                    </p>
                                </div>
                            ) : (
                                data.map((item) => (
                                    <Link
                                        href={`/doctor/consultations/${item._id}`}
                                        key={item._id}
                                        className="block p-5 transition hover:bg-surface-secondary/70 sm:p-6"
                                    >
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="min-w-0">
                                                <div className="mb-2 flex flex-wrap items-center gap-2 sm:gap-3">
                                                    {item.ai_draft?.is_emergency && (
                                                        <span className="inline-flex items-center gap-1 rounded-lg border border-danger/20 bg-danger/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-danger">
                                                            <AlertTriangle className="h-3 w-3" />
                                                            SOS
                                                        </span>
                                                    )}

                                                    <span
                                                        className={`rounded-lg border px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${item.status === "in_review"
                                                                ? "border-info/20 bg-info/10 text-info"
                                                                : "border-primary/20 bg-primary/10 text-primary"
                                                            }`}
                                                    >
                                                        {item.status?.replace("_", " ").toUpperCase()}
                                                    </span>

                                                    <span className="rounded-lg bg-surface-secondary px-2 py-1 text-xs font-medium text-muted">
                                                        Age: {item.patient_input?.age ?? "N/A"}
                                                    </span>

                                                    <span className="inline-flex items-center gap-1 text-xs text-muted">
                                                        <CalendarDays className="h-3 w-3" />
                                                        {new Date(item.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>

                                                <h3 className="truncate font-semibold text-foreground">
                                                    {item.ai_draft?.chief_complaints?.join(", ") ||
                                                        "No complaints listed"}
                                                </h3>

                                                {item.patient_input?.symptoms_raw_text && (
                                                    <p className="mt-1 max-w-2xl truncate text-sm text-muted">
                                                        {item.patient_input.symptoms_raw_text}
                                                    </p>
                                                )}
                                            </div>

                                            <span className="shrink-0 text-xl text-muted transition group-hover:text-primary">
                                                →
                                            </span>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>

                        <div className="flex items-center justify-between border-t border-border bg-surface-secondary p-4">
                            <button
                                type="button"
                                disabled={page === 1}
                                onClick={() => setPage(page - 1)}
                                className="inline-flex items-center gap-1 rounded-xl border border-border bg-surface px-4 py-2 text-sm text-muted transition hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Prev
                            </button>

                            <span className="text-sm text-muted">
                                Page {page} of {totalPages || 1}
                            </span>

                            <button
                                type="button"
                                disabled={page >= totalPages}
                                onClick={() => setPage(page + 1)}
                                className="inline-flex items-center gap-1 rounded-xl border border-border bg-surface px-4 py-2 text-sm text-muted transition hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
                            >
                                Next
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {showExportModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-xl">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-foreground">Export Options</h2>

                            <button
                                type="button"
                                onClick={() => setShowExportModal(false)}
                                className="rounded-lg p-1 text-muted transition hover:bg-accent hover:text-foreground"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <p className="mb-4 text-sm text-muted">
                            Export records using your currently applied filters.
                        </p>

                        <select
                            value={exportLimit}
                            onChange={(e) => setExportLimit(e.target.value)}
                            className={`${inputClass} mb-6`}
                        >
                            <option value="50">Last 50 matching cases</option>
                            <option value="100">Last 100 matching cases</option>
                            <option value="500">Last 500 matching cases</option>
                            <option value="all">All matching cases</option>
                        </select>

                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setShowExportModal(false)}
                                className="rounded-xl px-4 py-2 text-sm text-muted transition hover:bg-accent hover:text-foreground"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleDownloadCSV}
                                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary-hover"
                            >
                                <Download className="h-4 w-4" />
                                Download
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function FilterSelect({
    label,
    value,
    onChange,
    options,
    inputClass,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: [string, string][];
    inputClass: string;
}) {
    return (
        <div>
            <label className="mb-2 block text-xs font-medium text-muted">{label}</label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={inputClass}
            >
                {options.map(([optionValue, optionLabel]) => (
                    <option key={optionValue} value={optionValue}>
                        {optionLabel}
                    </option>
                ))}
            </select>
        </div>
    );
}

function FilterInput({
    label,
    value,
    onChange,
    placeholder,
    inputClass,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    inputClass: string;
}) {
    return (
        <div>
            <label className="mb-2 block text-xs font-medium text-muted">{label}</label>
            <input
                type="number"
                min="0"
                max="120"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className={inputClass}
            />
        </div>
    );
}