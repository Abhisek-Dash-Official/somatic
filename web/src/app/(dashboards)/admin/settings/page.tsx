"use client";

import React, { useEffect, useState } from "react";
import {
    AlertTriangle,
    BrainCircuit,
    Loader2,
    Save,
    Settings as SettingsIcon,
    ShieldAlert,
    Terminal,
    UserPlus,
} from "lucide-react";
import { toast } from "react-toastify";

interface SystemSettings {
    maintenance_mode: boolean;
    allow_new_signups: boolean;
    current_model: string;
    system_prompt: string;
}

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState<SystemSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch("/api/admin/settings");
            const json = await res.json();

            if (!res.ok || !json.success) {
                throw new Error(
                    json.message || "Failed to load settings",
                );
            }

            setSettings(json.data);
        } catch (err: any) {
            setError(err.message);
            toast.error("Failed to load settings from server.");
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = (
        field: "maintenance_mode" | "allow_new_signups",
    ) => {
        if (!settings) return;

        setSettings({
            ...settings,
            [field]: !settings[field],
        });
    };

    const handleChange = (
        field: "current_model" | "system_prompt",
        value: string,
    ) => {
        if (!settings) return;

        setSettings({
            ...settings,
            [field]: value,
        });
    };

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSaving(true);

        try {
            const res = await fetch("/api/admin/settings", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(settings),
            });

            const json = await res.json();

            if (!res.ok || !json.success) {
                throw new Error(
                    json.message || "Failed to update settings",
                );
            }

            toast.success("System settings updated successfully!");
            setSettings(json.data);
        } catch (err: any) {
            toast.error(err.message || "An error occurred while saving.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    if (error && !settings) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center text-danger">
                <AlertTriangle className="mr-2 h-6 w-6" />
                {error}
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-5xl space-y-6 p-4 pt-20 text-foreground sm:space-y-8 sm:p-6 sm:pt-24 lg:p-8 lg:pt-8">
            <div className="flex flex-col gap-1">
                <h1 className="flex items-center gap-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    <div className="shrink-0 rounded-xl border border-primary/20 bg-primary/10 p-2.5">
                        <SettingsIcon className="h-6 w-6 text-primary" />
                    </div>
                    System Settings
                </h1>

                <p className="mt-1 text-sm text-muted sm:text-base">
                    Configure global platform behavior and AI engine parameters.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
                <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
                    <h2 className="mb-6 border-b border-border pb-4 text-lg font-bold text-foreground">
                        General Access Control
                    </h2>

                    <div className="space-y-6">
                        <div className="flex flex-col justify-between gap-4 rounded-xl border border-border bg-surface-secondary p-4 sm:flex-row sm:items-center">
                            <div className="flex gap-4">
                                <div className="h-fit shrink-0 rounded-xl border border-danger/20 bg-danger/10 p-2">
                                    <ShieldAlert className="h-5 w-5 text-danger" />
                                </div>

                                <div>
                                    <h3 className="font-semibold text-foreground">
                                        Maintenance Mode
                                    </h3>

                                    <p className="mt-0.5 text-sm text-muted">
                                        Disable access for non-admin users
                                        across the platform.
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    handleToggle("maintenance_mode")
                                }
                                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${settings?.maintenance_mode
                                        ? "bg-danger"
                                        : "bg-muted-foreground/30"
                                    }`}
                            >
                                <span
                                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${settings?.maintenance_mode
                                            ? "translate-x-5"
                                            : "translate-x-0"
                                        }`}
                                />
                            </button>
                        </div>

                        <div className="flex flex-col justify-between gap-4 rounded-xl border border-border bg-surface-secondary p-4 sm:flex-row sm:items-center">
                            <div className="flex gap-4">
                                <div className="h-fit shrink-0 rounded-xl border border-primary/20 bg-primary/10 p-2">
                                    <UserPlus className="h-5 w-5 text-primary" />
                                </div>

                                <div>
                                    <h3 className="font-semibold text-foreground">
                                        Allow New Signups
                                    </h3>

                                    <p className="mt-0.5 text-sm text-muted">
                                        Permit public registration for new
                                        patient accounts.
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    handleToggle("allow_new_signups")
                                }
                                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${settings?.allow_new_signups
                                        ? "bg-primary"
                                        : "bg-muted-foreground/30"
                                    }`}
                            >
                                <span
                                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${settings?.allow_new_signups
                                            ? "translate-x-5"
                                            : "translate-x-0"
                                        }`}
                                />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
                    <h2 className="mb-6 border-b border-border pb-4 text-lg font-bold text-foreground">
                        AI Engine Configuration
                    </h2>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                                <BrainCircuit className="h-4 w-4 text-primary" />
                                Active Model
                            </label>

                            <input
                                type="text"
                                value={settings?.current_model || ""}
                                onChange={(e) =>
                                    handleChange(
                                        "current_model",
                                        e.target.value,
                                    )
                                }
                                placeholder="e.g. openai/gpt-oss-120b"
                                className="w-full rounded-xl border border-border bg-surface-secondary px-4 py-3 text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10 sm:w-1/2"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                                <Terminal className="h-4 w-4 text-primary" />
                                Base System Prompt
                            </label>

                            <textarea
                                rows={6}
                                value={settings?.system_prompt || ""}
                                onChange={(e) =>
                                    handleChange(
                                        "system_prompt",
                                        e.target.value,
                                    )
                                }
                                className="w-full resize-none rounded-xl border border-border bg-surface-secondary px-4 py-3 font-mono text-sm leading-relaxed text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10"
                                placeholder="Enter core system instructions for the AI..."
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-2">
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-8 py-3.5 font-bold text-primary-foreground transition hover:bg-primary-hover disabled:opacity-50 sm:w-auto"
                    >
                        {saving ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <Save className="h-5 w-5" />
                        )}
                        Save All Settings
                    </button>
                </div>
            </form>
        </div>
    );
}