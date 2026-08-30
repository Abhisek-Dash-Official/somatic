"use client";

import { useState } from "react";
import { Trash2, AlertTriangle } from "lucide-react";
import { signOut } from "next-auth/react";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { toast } from "react-toastify";

export default function DeleteAccountSection() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleDeleteAccount = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/users/me", {
                method: "DELETE",
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to delete account");
            }

            toast.success("Account deleted successfully. Logging out...");
            setIsModalOpen(false);

            setTimeout(() => {
                signOut({ callbackUrl: "/login" });
            }, 1500);

        } catch (error: any) {
            toast.error(error.message);
            setIsModalOpen(false);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-[#131C31] border border-red-500/20 rounded-2xl p-6 sm:p-8 shadow-lg mt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-lg font-bold text-red-400 flex items-center gap-2 mb-1">
                        <AlertTriangle className="h-5 w-5" /> Delete Account
                    </h2>
                    <p className="text-sm text-slate-400">
                        Permanently remove your account and all associated data. This action cannot be undone.
                    </p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl border border-red-500/50 text-red-400 hover:bg-red-500 hover:text-white transition-all font-semibold text-sm"
                >
                    <Trash2 className="h-4 w-4" /> Delete My Account
                </button>
            </div>

            <ConfirmModal
                isOpen={isModalOpen}
                title="Delete Account"
                message="Are you absolutely sure you want to delete your account? You will lose access to all your data and consultations immediately."
                loading={loading}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleDeleteAccount}
            />
        </div>
    );
}