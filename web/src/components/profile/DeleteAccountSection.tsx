"use client";

import { useState } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import { signOut } from "next-auth/react";
import { toast } from "react-toastify";
import ConfirmModal from "@/components/ui/ConfirmModal";

export default function DeleteAccountSection() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleDeleteAccount = async () => {
        setLoading(true);

        try {
            const res = await fetch("/api/users/me", { method: "DELETE" });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Failed to delete account");

            toast.success("Account deleted successfully. Logging out...");
            setIsModalOpen(false);

            setTimeout(() => {
                signOut({ callbackUrl: "/login" });
            }, 1500);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to delete account");
            setIsModalOpen(false);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="rounded-xl border border-danger/20 bg-surface p-5 sm:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-danger/10 text-danger">
                        <AlertTriangle className="h-5 w-5" />
                    </div>

                    <div>
                        <h2 className="text-base font-semibold text-danger">Delete Account</h2>
                        <p className="mt-1 max-w-2xl text-sm leading-6 text-muted">
                            Permanently remove your account and all associated data. This action cannot be undone.
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    disabled={loading}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-danger/40 px-4 py-2.5 text-sm font-medium text-danger transition hover:bg-danger hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
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
        </section>
    );
}