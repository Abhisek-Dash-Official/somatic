"use client";

import { useEffect, useState } from "react";
import {
    X,
    Calendar,
    User,
    Target,
    Activity,
    Copy,
    Check,
    Info,
} from "lucide-react";

interface LogDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    log: any | null;
}

export default function LogDetailsModal({
    isOpen,
    onClose,
    log,
}: LogDetailsModalProps) {
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
        return `${id.substring(0, 2)}••••••••••••${id.substring(
            id.length - 2,
        )}`;
    };

    const getTargetInfo = () => {
        if (!log.details) return null;
        if (log.details.username) return log.details.username;
        if (log.details.email) return log.details.email;
        if (log.details.ticket_type) {
            return `Ticket: ${log.details.ticket_type}`;
        }
        if (log.details.assigned_dept_id) return "Consultation Record";
        return null;
    };

    const targetInfo = getTargetInfo();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-xl">
                <div className="flex items-center justify-between border-b border-border bg-surface-secondary p-5">
                    <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
                        <Activity className="h-5 w-5 text-primary" />
                        System Log Details
                    </h2>

                    <button
                        onClick={onClose}
                        className="rounded-xl p-1.5 text-muted transition hover:bg-accent hover:text-foreground"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="custom-scrollbar flex-1 space-y-6 overflow-y-auto p-5">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="rounded-xl border border-border bg-surface-secondary p-4">
                            <span className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase text-muted">
                                <Activity className="h-3.5 w-3.5" />
                                Action
                            </span>
                            <p className="wrap-break-word text-sm font-medium text-foreground">
                                {log.action_type}
                            </p>
                        </div>

                        <div className="rounded-xl border border-border bg-surface-secondary p-4">
                            <span className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase text-muted">
                                <Calendar className="h-3.5 w-3.5" />
                                Timestamp
                            </span>
                            <p className="text-sm font-medium text-foreground">
                                {logDate.toLocaleString()}
                            </p>
                        </div>

                        <div className="flex flex-col justify-between rounded-xl border border-border bg-surface-secondary p-4">
                            <div>
                                <span className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase text-muted">
                                    <User className="h-3.5 w-3.5" />
                                    Actor
                                </span>

                                <p className="text-sm font-medium capitalize text-foreground">
                                    {log.actor_role} (
                                    {log.actor_id?.username || "System"})
                                </p>
                            </div>

                            {log.actor_id?._id && (
                                <div className="mt-2 flex items-center gap-2">
                                    <p className="rounded-lg bg-background px-2 py-1 font-mono text-xs tracking-widest text-muted">
                                        {maskId(log.actor_id._id)}
                                    </p>

                                    <button
                                        onClick={() =>
                                            handleCopy(log.actor_id._id)
                                        }
                                        className="rounded-lg p-1 text-muted transition hover:bg-accent hover:text-primary"
                                        title="Copy full Actor ID"
                                    >
                                        {copiedId === log.actor_id._id ? (
                                            <Check className="h-3.5 w-3.5 text-success" />
                                        ) : (
                                            <Copy className="h-3.5 w-3.5" />
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col justify-between rounded-xl border border-border bg-surface-secondary p-4">
                            <div>
                                <span className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase text-muted">
                                    <Target className="h-3.5 w-3.5" />
                                    Target ID
                                </span>

                                {targetInfo && (
                                    <p className="mt-0.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
                                        <Info className="h-3.5 w-3.5 text-primary" />
                                        {targetInfo}
                                    </p>
                                )}
                            </div>

                            {log.target_id ? (
                                <div className="mt-2 flex items-center gap-2">
                                    <p className="rounded-lg bg-background px-2 py-1 font-mono text-xs tracking-widest text-muted">
                                        {maskId(log.target_id)}
                                    </p>

                                    <button
                                        onClick={() =>
                                            handleCopy(log.target_id)
                                        }
                                        className="rounded-lg p-1 text-muted transition hover:bg-accent hover:text-primary"
                                        title="Copy full Target ID"
                                    >
                                        {copiedId === log.target_id ? (
                                            <Check className="h-3.5 w-3.5 text-success" />
                                        ) : (
                                            <Copy className="h-3.5 w-3.5" />
                                        )}
                                    </button>
                                </div>
                            ) : (
                                <p className="mt-2 font-mono text-sm text-muted">
                                    N/A
                                </p>
                            )}
                        </div>
                    </div>

                    <div>
                        <span className="mb-2 block text-xs font-semibold uppercase text-muted">
                            Execution Details / Payload
                        </span>

                        {log.details &&
                            Object.keys(log.details).length > 0 ? (
                            <pre className="custom-scrollbar overflow-x-auto rounded-xl border border-border bg-background p-4 font-mono text-xs text-accent-foreground">
                                {JSON.stringify(log.details, null, 2)}
                            </pre>
                        ) : (
                            <div className="rounded-xl border border-border bg-background p-4 text-xs italic text-muted">
                                No additional details recorded for this
                                action.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}