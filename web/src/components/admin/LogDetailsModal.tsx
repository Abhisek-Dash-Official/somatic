"use client";

import { useEffect, useState } from "react";
import { X, Calendar, User, Target, Activity, Copy, Check, Info } from "lucide-react";

interface LogDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    log: any | null;
}

export default function LogDetailsModal({ isOpen, onClose, log }: LogDetailsModalProps) {
    const [copiedId, setCopiedId] = useState<string | null>(null);

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [onClose]);

    if (!isOpen || !log) return null;

    const logDate = new Date(log.timestamp);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(text);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const maskId = (id: string) => {
        if (!id || id.length < 6) return id;
        return `${id.substring(0, 2)}••••••••••••${id.substring(id.length - 2)}`;
    };

    const getTargetInfo = () => {
        if (!log.details) return null;
        if (log.details.username) return log.details.username;
        if (log.details.email) return log.details.email;
        if (log.details.ticket_type) return `Ticket: ${log.details.ticket_type}`;
        if (log.details.assigned_dept_id) return "Consultation Record";
        return null;
    };

    const targetInfo = getTargetInfo();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-2xl bg-[#0B1120] border border-slate-700/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">

                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-800 p-5 bg-[#131C31]">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <Activity className="h-5 w-5 text-teal-400" />
                        System Log Details
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-5 overflow-y-auto custom-scrollbar flex-1 space-y-6">

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4">
                            <span className="text-xs text-slate-500 uppercase font-semibold flex items-center gap-1.5 mb-1">
                                <Activity className="h-3.5 w-3.5" /> Action
                            </span>
                            <p className="text-sm font-medium text-slate-200 wrap-break-word">{log.action_type}</p>
                        </div>

                        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4">
                            <span className="text-xs text-slate-500 uppercase font-semibold flex items-center gap-1.5 mb-1">
                                <Calendar className="h-3.5 w-3.5" /> Timestamp
                            </span>
                            <p className="text-sm font-medium text-slate-200">
                                {logDate.toLocaleString()}
                            </p>
                        </div>

                        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 flex flex-col justify-between">
                            <div>
                                <span className="text-xs text-slate-500 uppercase font-semibold flex items-center gap-1.5 mb-1">
                                    <User className="h-3.5 w-3.5" /> Actor
                                </span>
                                <p className="text-sm font-medium text-slate-200 capitalize">
                                    {log.actor_role} ({log.actor_id?.username || "System"})
                                </p>
                            </div>
                            {log.actor_id?._id && (
                                <div className="flex items-center gap-2 mt-2">
                                    <p className="text-xs text-slate-500 font-mono tracking-widest bg-black/20 px-2 py-1 rounded">
                                        {maskId(log.actor_id._id)}
                                    </p>
                                    <button
                                        onClick={() => handleCopy(log.actor_id._id)}
                                        className="text-slate-400 hover:text-blue-400 transition-colors"
                                        title="Copy full Actor ID"
                                    >
                                        {copiedId === log.actor_id._id ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 flex flex-col justify-between">
                            <div>
                                <span className="text-xs text-slate-500 uppercase font-semibold flex items-center gap-1.5 mb-1">
                                    <Target className="h-3.5 w-3.5" /> Target ID
                                </span>

                                {targetInfo && (
                                    <p className="text-sm font-medium text-slate-200 flex items-center gap-1.5 mt-0.5">
                                        <Info className="h-3.5 w-3.5 text-blue-400" /> {targetInfo}
                                    </p>
                                )}
                            </div>

                            {log.target_id ? (
                                <div className="flex items-center gap-2 mt-2">
                                    <p className="text-xs text-slate-500 font-mono tracking-widest bg-black/20 px-2 py-1 rounded">
                                        {maskId(log.target_id)}
                                    </p>
                                    <button
                                        onClick={() => handleCopy(log.target_id)}
                                        className="text-slate-400 hover:text-blue-400 transition-colors"
                                        title="Copy full Target ID"
                                    >
                                        {copiedId === log.target_id ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                                    </button>
                                </div>
                            ) : (
                                <p className="text-sm font-mono text-slate-400 mt-2">N/A</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <span className="text-xs text-slate-500 uppercase font-semibold mb-2 block">
                            Execution Details / Payload
                        </span>
                        {log.details && Object.keys(log.details).length > 0 ? (
                            <pre className="bg-[#0f172a] border border-slate-700/60 p-4 rounded-xl overflow-x-auto text-xs font-mono text-teal-300 custom-scrollbar">
                                {JSON.stringify(log.details, null, 2)}
                            </pre>
                        ) : (
                            <div className="bg-[#0f172a] border border-slate-700/60 p-4 rounded-xl text-xs text-slate-500 italic">
                                No additional details recorded for this action.
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}