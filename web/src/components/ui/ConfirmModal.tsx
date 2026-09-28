"use client";

import { AlertTriangle, Loader2 } from "lucide-react";

interface Props {
    isOpen: boolean;
    title: string;
    message: string;
    loading?: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export default function ConfirmModal({ isOpen, title, message, loading, onClose, onConfirm }: Props) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-black/60 p-4 backdrop-blur-sm fade-in duration-200">
            <div className="w-full max-w-md space-y-4 rounded-2xl border border-border bg-surface p-6 shadow-2xl">
                <div className="flex items-center gap-3">
                    <div className="shrink-0 rounded-xl border border-danger/20 bg-danger/10 p-3 text-danger">
                        <AlertTriangle className="h-6 w-6" />
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-foreground">{title}</h3>
                        <p className="mt-0.5 text-sm text-muted">{message}</p>
                    </div>
                </div>

                <div className="flex justify-end gap-3 border-t border-border pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="rounded-xl px-4 py-2.5 text-sm font-semibold text-muted transition-colors hover:bg-surface-secondary hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={loading}
                        className="flex items-center gap-2 rounded-xl bg-danger px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-danger/90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
}