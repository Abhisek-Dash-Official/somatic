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
            toast.error(error.message || "Failed to delete account");
            setIsModalOpen(false);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mt-6 rounded-xl border border-danger/20 bg-surface p-6 sm:p-8">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h2 className="mb-1 flex items-center gap-2 text-lg font-bold text-danger">
                        <AlertTriangle className="h-5 w-5" />
                        Delete Account
                    </h2>

                    <p className="text-sm text-muted">
                        Permanently remove your account and all associated data. This action cannot be undone.
                    </p>
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex shrink-0 items-center gap-2 rounded-lg border border-danger/50 px-5 py-2.5 text-sm font-semibold text-danger transition hover:bg-danger hover:text-white"
                >
                    <Trash2 className="h-4 w-4" />
                    Delete My Account
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