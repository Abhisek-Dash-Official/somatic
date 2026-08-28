"use client";

import { useEffect, useState } from "react";
import {
    Logs, AlertTriangle, Loader2, ChevronLeft, ChevronRight, Eye
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
    const [pagination, setPagination] = useState<PaginationData | null>(null);
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
            if (!res.ok) throw new Error("Failed to fetch system logs");
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
        <div className="space-y-6 sm:space-y-8 p-4 pt-20 sm:p-6 sm:pt-24 lg:p-8 lg:pt-8 w-full max-w-7xl mx-auto text-slate-200">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/20 shrink-0">
                            <Logs className="h-6 w-6 text-blue-400" />
                        </div>
                        System Audit Logs
                    </h1>
                    <p className="text-sm sm:text-base text-slate-400 mt-1">
                        Immutable, zero-trust records of all platform activity.
                    </p>
                </div>

                {pagination && (
                    <div className="text-sm text-slate-400 bg-[#131C31] border border-slate-800 px-4 py-2 rounded-lg font-mono w-fit">
                        Total Records: <span className="text-white font-bold">{pagination.total}</span>
                    </div>
                )}
            </div>

            {/* Main Content Area */}
            <div className="bg-[#131C31] border border-slate-800 rounded-2xl shadow-xl flex flex-col overflow-hidden">

                {loading && logs.length === 0 ? (
                    <div className="flex min-h-100 items-center justify-center">
                        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
                    </div>
                ) : error ? (
                    <div className="flex min-h-100 items-center justify-center text-red-400 p-6 text-center">
                        <AlertTriangle className="mr-2 h-6 w-6" /> {error}
                    </div>
                ) : logs.length === 0 ? (
                    <div className="flex min-h-100 items-center justify-center text-slate-500">
                        No system logs found in the database.
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto w-full">
                            <table className="w-full text-left border-collapse min-w-175">
                                <thead>
                                    <tr className="bg-[#0B1120] border-b border-slate-800 text-slate-400 text-xs sm:text-sm uppercase tracking-wider">
                                        <th className="py-4 px-6 font-semibold w-1/4">Timestamp</th>
                                        <th className="py-4 px-6 font-semibold w-1/3">Action Type</th>
                                        <th className="py-4 px-6 font-semibold w-1/4">Actor</th>
                                        <th className="py-4 px-6 font-semibold text-center">Details</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {logs.map((log) => {
                                        const logDate = new Date(log.timestamp);

                                        return (
                                            <tr
                                                key={log._id}
                                                className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors group"
                                            >
                                                <td className="py-4 px-6 text-slate-300 whitespace-nowrap">
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-slate-200">
                                                            {logDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                        </span>
                                                        <span className="text-xs text-slate-500 font-mono">
                                                            {logDate.toLocaleTimeString()}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className="font-semibold text-slate-200">
                                                        {log.action_type.replace(/_/g, " ")}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex flex-col items-start gap-1">
                                                        <span className={`px-2 py-0.5 text-[10px] sm:text-xs rounded-md border capitalize font-medium ${log.actor_role === 'admin' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                                log.actor_role === 'doctor' ? 'bg-teal-500/10 text-teal-400 border-teal-500/20' :
                                                                    'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                                            }`}>
                                                            {log.actor_role}
                                                        </span>
                                                        <span className="text-slate-300 truncate max-w-37.5">
                                                            {log.actor_id?.username || "System"}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 text-center">
                                                    <button
                                                        onClick={() => setSelectedLog(log)}
                                                        className="inline-flex items-center justify-center p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-blue-600 transition-all shadow-sm"
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

                        {/* Pagination Controls */}
                        {pagination && pagination.totalPages > 1 && (
                            <div className="border-t border-slate-800 bg-[#0f172a] p-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <span className="text-sm text-slate-400">
                                    Showing Page <span className="font-bold text-white">{pagination.page}</span> of <span className="font-bold text-white">{pagination.totalPages}</span>
                                </span>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handlePrevPage}
                                        disabled={currentPage === 1 || loading}
                                        className="flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <ChevronLeft className="h-4 w-4" /> Prev
                                    </button>
                                    <button
                                        onClick={handleNextPage}
                                        disabled={currentPage === pagination.totalPages || loading}
                                        className="flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Next <ChevronRight className="h-4 w-4" />
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