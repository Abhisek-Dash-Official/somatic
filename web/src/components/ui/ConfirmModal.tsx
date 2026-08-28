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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-[#0B1120] border border-slate-700 rounded-2xl shadow-2xl p-6 space-y-4">

                <div className="flex items-center gap-3">
                    <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20 text-red-400 shrink-0">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">{title}</h3>
                        <p className="text-sm text-slate-400 mt-0.5">{message}</p>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white text-sm font-semibold transition"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={loading}
                        className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition disabled:opacity-50 shadow-[0_0_15px_rgba(220,38,38,0.2)]"
                    >
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        Confirm
                    </button>
                </div>

            </div>
        </div>
    );
}