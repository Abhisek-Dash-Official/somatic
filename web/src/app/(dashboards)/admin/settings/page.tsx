"use client";

import React, { useEffect, useState } from "react";
import {
    Settings as SettingsIcon, ShieldAlert, UserPlus,
    BrainCircuit, Terminal, Loader2, Save, AlertTriangle
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
            if (!res.ok || !json.success) throw new Error(json.message || "Failed to load settings");
            setSettings(json.data);
        } catch (err: any) {
            setError(err.message);
            toast.error("Failed to load settings from server.");
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = (field: "maintenance_mode" | "allow_new_signups") => {
        if (!settings) return;
        setSettings({ ...settings, [field]: !settings[field] });
    };

    const handleChange = (field: "current_model" | "system_prompt", value: string) => {
        if (!settings) return;
        setSettings({ ...settings, [field]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const res = await fetch("/api/admin/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settings),
            });

            const json = await res.json();
            if (!res.ok || !json.success) throw new Error(json.message || "Failed to update settings");

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
                <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
            </div>
        );
    }

    if (error && !settings) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center text-red-400">
                <AlertTriangle className="mr-2 h-6 w-6" /> {error}
            </div>
        );
    }

    return (
        <div className="space-y-6 sm:space-y-8 p-4 pt-20 sm:p-6 sm:pt-24 lg:p-8 lg:pt-8 w-full max-w-5xl mx-auto text-slate-200">

            <div className="flex flex-col gap-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                    <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/20 shrink-0">
                        <SettingsIcon className="h-6 w-6 text-blue-400" />
                    </div>
                    System Settings
                </h1>
                <p className="text-sm sm:text-base text-slate-400 mt-1">
                    Configure global platform behavior and AI engine parameters.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">

                <div className="bg-[#131C31] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-lg">
                    <h2 className="text-lg font-bold text-white mb-6 border-b border-slate-800 pb-4">General Access Control</h2>

                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-800 bg-[#0B1120]">
                            <div className="flex gap-4">
                                <div className="p-2 bg-red-500/10 rounded-lg h-fit border border-red-500/20 shrink-0">
                                    <ShieldAlert className="h-5 w-5 text-red-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-200">Maintenance Mode</h3>
                                    <p className="text-sm text-slate-400 mt-0.5">Disable access for non-admin users across the platform.</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleToggle("maintenance_mode")}
                                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${settings?.maintenance_mode ? 'bg-red-500' : 'bg-slate-700'
                                    }`}
                            >
                                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${settings?.maintenance_mode ? 'translate-x-5' : 'translate-x-0'
                                    }`} />
                            </button>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-800 bg-[#0B1120]">
                            <div className="flex gap-4">
                                <div className="p-2 bg-blue-500/10 rounded-lg h-fit border border-blue-500/20 shrink-0">
                                    <UserPlus className="h-5 w-5 text-blue-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-200">Allow New Signups</h3>
                                    <p className="text-sm text-slate-400 mt-0.5">Permit public registration for new patient accounts.</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleToggle("allow_new_signups")}
                                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${settings?.allow_new_signups ? 'bg-blue-500' : 'bg-slate-700'
                                    }`}
                            >
                                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${settings?.allow_new_signups ? 'translate-x-5' : 'translate-x-0'
                                    }`} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-[#131C31] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-lg">
                    <h2 className="text-lg font-bold text-white mb-6 border-b border-slate-800 pb-4">AI Engine Configuration</h2>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                <BrainCircuit className="h-4 w-4 text-purple-400" /> Active Model
                            </label>
                            <input
                                type="text"
                                value={settings?.current_model || ""}
                                onChange={(e) => handleChange("current_model", e.target.value)}
                                placeholder="e.g. gemini-1.5-flash"
                                className="w-full sm:w-1/2 rounded-xl border border-slate-700 bg-[#0B1120] py-3 px-4 text-white focus:border-blue-500 focus:outline-none transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                <Terminal className="h-4 w-4 text-teal-400" /> Base System Prompt
                            </label>
                            <textarea
                                rows={6}
                                value={settings?.system_prompt || ""}
                                onChange={(e) => handleChange("system_prompt", e.target.value)}
                                className="w-full resize-none rounded-xl border border-slate-700 bg-[#0B1120] py-3 px-4 text-teal-300 font-mono text-sm focus:border-blue-500 focus:outline-none transition-all custom-scrollbar leading-relaxed"
                                placeholder="Enter core system instructions for the AI..."
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-2">
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-3.5 font-bold text-white transition-all hover:bg-blue-500 disabled:opacity-50 shadow-[0_0_20px_rgba(37,99,235,0.2)]"
                    >
                        {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                        Save All Settings
                    </button>
                </div>
            </form>
        </div>
    );
}