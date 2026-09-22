"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    Building2,
    KeyRound,
    Link2,
    LockKeyhole,
    Plus,
} from "lucide-react";
import Link from "next/link";
import { toast } from "react-toastify";

type AuthType =
    | "none"
    | "api_key"
    | "bearer"
    | "basic";

export default function NewHospitalPage() {
    const router = useRouter();

    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        name: "",
        qr_identifier: "",
        paperwork_endpoint: "",
        auth_type: "none" as AuthType,
        api_key: "",
        api_key_header: "X-API-Key",
        token: "",
        username: "",
        password: "",
        is_active: true,
    });

    const handleSubmit = async (
        e: FormEvent<HTMLFormElement>,
    ) => {
        e.preventDefault();

        if (
            !form.name.trim() ||
            !form.qr_identifier.trim() ||
            !form.paperwork_endpoint.trim()
        ) {
            toast.error("Please fill all required fields.");
            return;
        }

        if (
            !/^https?:\/\//i.test(
                form.paperwork_endpoint.trim(),
            )
        ) {
            toast.error(
                "Paperwork endpoint must be a valid URL.",
            );
            return;
        }

        const auth_config: Record<string, string> = {
            type: form.auth_type,
        };

        if (form.auth_type === "api_key") {
            if (!form.api_key.trim()) {
                toast.error("API key is required.");
                return;
            }

            auth_config.api_key = form.api_key;
            auth_config.api_key_header =
                form.api_key_header.trim() || "X-API-Key";
        }

        if (form.auth_type === "bearer") {
            if (!form.token.trim()) {
                toast.error("Bearer token is required.");
                return;
            }

            auth_config.token = form.token;
        }

        if (form.auth_type === "basic") {
            if (
                !form.username.trim() ||
                !form.password
            ) {
                toast.error(
                    "Username and password are required.",
                );
                return;
            }

            auth_config.username = form.username;
            auth_config.password = form.password;
        }

        try {
            setLoading(true);

            const response = await fetch(
                "/api/admin/hospitals",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name: form.name.trim(),
                        qr_identifier:
                            form.qr_identifier.trim(),
                        paperwork_endpoint:
                            form.paperwork_endpoint.trim(),
                        auth_config,
                        is_active: form.is_active,
                    }),
                },
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.message ||
                    "Failed to create hospital.",
                );
            }

            toast.success(
                "Hospital created successfully.",
            );

            router.push("/admin/hospitals");
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Failed to create hospital.",
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-4xl space-y-6">
            <div className="flex items-center gap-3">
                <Link
                    href="/admin/hospitals"
                    className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-slate-400 transition hover:bg-white/10 hover:text-white"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Link>

                <div>
                    <h1 className="flex items-center gap-2 text-2xl font-bold text-white sm:text-3xl">
                        <Building2 className="h-7 w-7 text-blue-400" />
                        Add Hospital
                    </h1>

                    <p className="mt-1 text-sm text-slate-400">
                        Configure hospital paperwork integration
                    </p>
                </div>
            </div>

            <form
                onSubmit={handleSubmit}
                className="space-y-6"
            >
                <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 sm:p-6">
                    <div className="mb-5">
                        <h2 className="text-lg font-semibold text-white">
                            Hospital Information
                        </h2>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <label className="mb-2 block text-sm font-medium text-slate-300">
                                Hospital Name
                            </label>

                            <input
                                value={form.name}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        name: e.target.value,
                                    })
                                }
                                placeholder="Enter hospital name"
                                className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-300">
                                QR Identifier
                            </label>

                            <input
                                value={form.qr_identifier}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        qr_identifier:
                                            e.target.value,
                                    })
                                }
                                placeholder="Hospital QR identifier"
                                className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 font-mono text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
                            />

                            <p className="mt-2 text-xs text-slate-500">
                                This exact value will be encoded in the
                                hospital QR.
                            </p>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-300">
                                Status
                            </label>

                            <button
                                type="button"
                                onClick={() =>
                                    setForm({
                                        ...form,
                                        is_active: !form.is_active,
                                    })
                                }
                                className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm transition ${form.is_active
                                        ? "border-green-500/20 bg-green-500/10 text-green-400"
                                        : "border-white/10 bg-slate-950 text-slate-400"
                                    }`}
                            >
                                <span>
                                    {form.is_active
                                        ? "Active"
                                        : "Inactive"}
                                </span>

                                <span
                                    className={`h-2.5 w-2.5 rounded-full ${form.is_active
                                            ? "bg-green-400"
                                            : "bg-slate-600"
                                        }`}
                                />
                            </button>
                        </div>

                        <div className="sm:col-span-2">
                            <label className="mb-2 block text-sm font-medium text-slate-300">
                                Paperwork API Endpoint
                            </label>

                            <div className="relative">
                                <Link2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

                                <input
                                    value={form.paperwork_endpoint}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            paperwork_endpoint:
                                                e.target.value,
                                        })
                                    }
                                    placeholder="https://hospital.com/api/paperwork"
                                    className="w-full rounded-xl border border-white/10 bg-slate-950 py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 sm:p-6">
                    <div className="mb-5">
                        <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
                            <KeyRound className="h-5 w-5 text-blue-400" />
                            API Authentication
                        </h2>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <label className="mb-2 block text-sm font-medium text-slate-300">
                                Authentication Type
                            </label>

                            <select
                                value={form.auth_type}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        auth_type:
                                            e.target.value as AuthType,
                                    })
                                }
                                className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
                            >
                                <option value="none">
                                    No Authentication
                                </option>
                                <option value="api_key">
                                    API Key
                                </option>
                                <option value="bearer">
                                    Bearer Token
                                </option>
                                <option value="basic">
                                    Basic Authentication
                                </option>
                            </select>
                        </div>

                        {form.auth_type === "api_key" && (
                            <>
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-300">
                                        API Key
                                    </label>

                                    <input
                                        type="password"
                                        value={form.api_key}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                api_key: e.target.value,
                                            })
                                        }
                                        placeholder="Enter API key"
                                        className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-300">
                                        API Key Header
                                    </label>

                                    <input
                                        value={form.api_key_header}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                api_key_header:
                                                    e.target.value,
                                            })
                                        }
                                        placeholder="X-API-Key"
                                        className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
                                    />
                                </div>
                            </>
                        )}

                        {form.auth_type === "bearer" && (
                            <div className="sm:col-span-2">
                                <label className="mb-2 block text-sm font-medium text-slate-300">
                                    Bearer Token
                                </label>

                                <input
                                    type="password"
                                    value={form.token}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            token: e.target.value,
                                        })
                                    }
                                    placeholder="Enter bearer token"
                                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
                                />
                            </div>
                        )}

                        {form.auth_type === "basic" && (
                            <>
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-300">
                                        Username
                                    </label>

                                    <input
                                        value={form.username}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                username:
                                                    e.target.value,
                                            })
                                        }
                                        placeholder="Username"
                                        className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-300">
                                        Password
                                    </label>

                                    <input
                                        type="password"
                                        value={form.password}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                password:
                                                    e.target.value,
                                            })
                                        }
                                        placeholder="Password"
                                        className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
                                    />
                                </div>
                            </>
                        )}
                    </div>

                    <div className="mt-5 flex items-start gap-3 rounded-xl border border-blue-500/10 bg-blue-500/5 p-4">
                        <LockKeyhole className="mt-0.5 h-5 w-5 shrink-0 text-blue-400" />

                        <p className="text-xs leading-5 text-slate-400">
                            Authentication credentials are stored on the
                            server and are never exposed to patients.
                        </p>
                    </div>
                </div>

                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <Link
                        href="/admin/hospitals"
                        className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/10"
                    >
                        Cancel
                    </Link>

                    <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <Plus className="h-4 w-4" />
                        {loading
                            ? "Creating..."
                            : "Create Hospital"}
                    </button>
                </div>
            </form>
        </div>
    );
}