"use client";

import { useEffect, useState } from "react";
import {
    AlertTriangle,
    ChevronLeft,
    ChevronRight,
    Eye,
    Loader2,
    Logs,
} from "lucide-react";
import LogDetailsModal from "@/components/admin/LogDetailsModal";

interface LogEntry {
    _id: string;
    timestamp: string;
    action_type: string;
    actor_role: string;
    actor_id?: { _id: string; username: string };
    details?: any;
    target_id?: string;
}

interface PaginationData {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export default function AdminLogsPage() {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [pagination, setPagination] =
        useState<PaginationData | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);

    useEffect(() => {
        fetchLogs(currentPage);
    }, [currentPage]);

    const fetchLogs = async (page: number) => {
        setLoading(true);
        setError("");

        try {
            const res = await fetch(`/api/admin/logs?page=${page}&limit=15`);

            if (!res.ok) {
                throw new Error("Failed to fetch system logs");
            }

            const data = await res.json();

            setLogs(data.logs);
            setPagination(data.pagination);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleNextPage = () => {
        if (pagination && currentPage < pagination.totalPages) {
            setCurrentPage((prev) => prev + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage((prev) => prev - 1);
        }
    };

    return (
        <div className="mx-auto w-full max-w-7xl space-y-6 p-4 pt-20 sm:space-y-8 sm:p-6 sm:pt-24 lg:p-8 lg:pt-8">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div className="flex flex-col gap-1">
                    <h1 className="flex items-center gap-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                        <div className="flex shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-accent p-2.5">
                            <Logs className="h-6 w-6 text-primary" />
                        </div>
                        System Audit Logs
                    </h1>

                    <p className="mt-1 text-sm text-muted sm:text-base">
                        Immutable, zero-trust records of all platform activity.
                    </p>
                </div>

                {pagination && (
                    <div className="w-fit rounded-xl border border-border bg-surface-secondary px-4 py-2 font-mono text-sm text-muted">
                        Total Records:{" "}
                        <span className="font-bold text-foreground">
                            {pagination.total}
                        </span>
                    </div>
                )}
            </div>

            <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
                {loading && logs.length === 0 ? (
                    <div className="flex min-h-100 items-center justify-center">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    </div>
                ) : error ? (
                    <div className="flex min-h-100 items-center justify-center gap-2 p-6 text-center text-danger">
                        <AlertTriangle className="h-6 w-6 shrink-0" />
                        {error}
                    </div>
                ) : logs.length === 0 ? (
                    <div className="flex min-h-100 items-center justify-center text-muted-foreground">
                        No system logs found in the database.
                    </div>
                ) : (
                    <>
                        <div className="w-full overflow-x-auto">
                            <table className="w-full min-w-175 border-collapse text-left">
                                <thead>
                                    <tr className="border-b border-border bg-surface-secondary text-xs uppercase tracking-wider text-muted sm:text-sm">
                                        <th className="w-1/4 px-6 py-4 font-semibold">
                                            Timestamp
                                        </th>
                                        <th className="w-1/3 px-6 py-4 font-semibold">
                                            Action Type
                                        </th>
                                        <th className="w-1/4 px-6 py-4 font-semibold">
                                            Actor
                                        </th>
                                        <th className="px-6 py-4 text-center font-semibold">
                                            Details
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="text-sm">
                                    {logs.map((log) => {
                                        const logDate = new Date(log.timestamp);

                                        return (
                                            <tr
                                                key={log._id}
                                                className="border-b border-border transition-colors last:border-0 hover:bg-surface-secondary"
                                            >
                                                <td className="whitespace-nowrap px-6 py-4 text-muted">
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-foreground">
                                                            {logDate.toLocaleDateString(
                                                                "en-GB",
                                                                {
                                                                    day: "2-digit",
                                                                    month: "short",
                                                                    year: "numeric",
                                                                }
                                                            )}
                                                        </span>

                                                        <span className="font-mono text-xs text-muted-foreground">
                                                            {logDate.toLocaleTimeString()}
                                                        </span>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4">
                                                    <span className="font-semibold text-foreground">
                                                        {log.action_type.replace(
                                                            /_/g,
                                                            " "
                                                        )}
                                                    </span>
                                                </td>

                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col items-start gap-1">
                                                        <span
                                                            className={`rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize sm:text-xs ${log.actor_role ===
                                                                    "admin"
                                                                    ? "border-danger/20 bg-danger/10 text-danger"
                                                                    : log.actor_role ===
                                                                        "doctor"
                                                                        ? "border-primary/20 bg-primary/10 text-primary"
                                                                        : "border-info/20 bg-info/10 text-info"
                                                                }`}
                                                        >
                                                            {log.actor_role}
                                                        </span>

                                                        <span className="max-w-37.5 truncate text-muted">
                                                            {log.actor_id
                                                                ?.username ||
                                                                "System"}
                                                        </span>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4 text-center">
                                                    <button
                                                        onClick={() =>
                                                            setSelectedLog(log)
                                                        }
                                                        className="inline-flex items-center justify-center rounded-xl bg-surface-secondary p-2 text-muted transition hover:bg-accent hover:text-primary"
                                                        title="View Details"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {pagination && pagination.totalPages > 1 && (
                            <div className="flex flex-col items-center justify-between gap-4 border-t border-border bg-surface-secondary p-4 sm:flex-row sm:px-6">
                                <span className="text-sm text-muted">
                                    Showing Page{" "}
                                    <span className="font-bold text-foreground">
                                        {pagination.page}
                                    </span>{" "}
                                    of{" "}
                                    <span className="font-bold text-foreground">
                                        {pagination.totalPages}
                                    </span>
                                </span>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handlePrevPage}
                                        disabled={
                                            currentPage === 1 || loading
                                        }
                                        className="flex items-center gap-1 rounded-xl border border-border bg-surface px-4 py-2 text-sm font-medium text-muted transition-colors hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        Prev
                                    </button>

                                    <button
                                        onClick={handleNextPage}
                                        disabled={
                                            currentPage ===
                                            pagination.totalPages ||
                                            loading
                                        }
                                        className="flex items-center gap-1 rounded-xl border border-border bg-surface px-4 py-2 text-sm font-medium text-muted transition-colors hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Next
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            <LogDetailsModal
                isOpen={!!selectedLog}
                onClose={() => setSelectedLog(null)}
                log={selectedLog}
            />
        </div>
    );
}