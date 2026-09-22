"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { QRCodeCanvas } from "qrcode.react";
import { toast } from "react-toastify";
import { Lock } from "lucide-react";

type AuthType = "none" | "api_key" | "bearer" | "basic";

interface Hospital {
    _id: string;
    name: string;
    qr_identifier: string;
    paperwork_endpoint: string;
    auth_config?: {
        type?: AuthType;
        api_key_header?: string;
    };
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export default function HospitalDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const qrRef = useRef<HTMLDivElement>(null);

    const hospitalId = params.id as string;

    const [hospital, setHospital] = useState<Hospital | null>(
        null,
    );

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editing, setEditing] = useState(false);

    const [name, setName] = useState("");
    const [qrIdentifier, setQrIdentifier] = useState("");
    const [paperworkEndpoint, setPaperworkEndpoint] =
        useState("");
    const [isActive, setIsActive] = useState(true);

    const [authType, setAuthType] =
        useState<AuthType>("none");

    const [apiKey, setApiKey] = useState("");
    const [apiKeyHeader, setApiKeyHeader] =
        useState("X-API-Key");
    const [token, setToken] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const fetchHospital = async () => {
        try {
            setLoading(true);

            const response = await fetch(`/api/admin/hospitals/${hospitalId}`,
                {
                    cache: "no-store",
                },
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to fetch hospital",
                );
            }

            const hospitalData = data.data;

            if (!hospitalData) {
                throw new Error("Hospital data not found");
            }

            setHospital(hospitalData);
            setName(hospitalData.name);
            setQrIdentifier(hospitalData.qr_identifier);
            setPaperworkEndpoint(
                hospitalData.paperwork_endpoint,
            );
            setIsActive(hospitalData.is_active);

            setAuthType(
                hospitalData.auth_config?.type || "none",
            );

            setApiKeyHeader(
                hospitalData.auth_config?.api_key_header ||
                "X-API-Key",
            );
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Failed to fetch hospital",
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (hospitalId) {
            fetchHospital();
        }
    }, [hospitalId]);

    const resetForm = () => {
        if (!hospital) return;

        setName(hospital.name);
        setQrIdentifier(hospital.qr_identifier);
        setPaperworkEndpoint(
            hospital.paperwork_endpoint,
        );
        setIsActive(hospital.is_active);

        setAuthType(
            hospital.auth_config?.type || "none",
        );

        setApiKeyHeader(
            hospital.auth_config?.api_key_header ||
            "X-API-Key",
        );

        setApiKey("");
        setToken("");
        setUsername("");
        setPassword("");
    };

    const handleSave = async () => {
        if (!name.trim()) {
            toast.error("Hospital name is required");
            return;
        }

        if (!qrIdentifier.trim()) {
            toast.error("QR identifier is required");
            return;
        }

        if (!paperworkEndpoint.trim()) {
            toast.error("Paperwork endpoint is required");
            return;
        }

        try {
            setSaving(true);

            const authConfig: Record<string, string> = {
                type: authType,
            };

            if (authType === "api_key") {
                authConfig.api_key_header =
                    apiKeyHeader.trim() || "X-API-Key";

                if (apiKey.trim()) {
                    authConfig.api_key = apiKey.trim();
                }
            }

            if (authType === "bearer") {
                if (token.trim()) {
                    authConfig.token = token.trim();
                }
            }

            if (authType === "basic") {
                if (username.trim()) {
                    authConfig.username = username.trim();
                }

                if (password.trim()) {
                    authConfig.password = password.trim();
                }
            }

            const response = await fetch(
                `/api/admin/hospitals/${hospitalId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name: name.trim(),
                        qr_identifier: qrIdentifier.trim(),
                        paperwork_endpoint:
                            paperworkEndpoint.trim(),
                        is_active: isActive,
                        auth_config: authConfig,
                    }),
                },
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to update hospital",
                );
            }

            toast.success("Hospital updated successfully");

            setEditing(false);

            await fetchHospital();
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Failed to update hospital",
            );
        } finally {
            setSaving(false);
        }
    };

    const handleStatusToggle = async () => {
        if (!hospital) return;

        try {
            setSaving(true);

            const response = await fetch(`/api/admin/hospitals/${hospitalId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        is_active: !hospital.is_active,
                    }),
                },
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to update hospital status",
                );
            }

            toast.success(
                !hospital.is_active
                    ? "Hospital activated successfully"
                    : "Hospital deactivated successfully",
            );

            await fetchHospital();
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Failed to update hospital status",
            );
        } finally {
            setSaving(false);
        }
    };

    const downloadQr = () => {
        const canvas =
            qrRef.current?.querySelector("canvas");

        if (!canvas) {
            toast.error("QR code is not available");
            return;
        }

        const link = document.createElement("a");

        link.download = `${name || "hospital"}-qr.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();

        toast.success("QR code downloaded");
    };

    const printQr = () => {
        const canvas =
            qrRef.current?.querySelector("canvas");

        if (!canvas) {
            toast.error("QR code is not available");
            return;
        }

        const image = canvas.toDataURL("image/png");

        const printWindow = window.open(
            "",
            "_blank",
            "width=600,height=700",
        );

        if (!printWindow) {
            toast.error("Please allow popups to print the QR");
            return;
        }

        printWindow.document.write(`
      <html>
        <head>
          <title>${name || "Hospital"} QR Code</title>
          <style>
            body {
              margin: 0;
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              font-family: Arial, sans-serif;
            }

            .container {
              text-align: center;
              padding: 40px;
            }

            img {
              width: 320px;
              height: 320px;
            }

            h2 {
              margin-bottom: 24px;
            }

            p {
              margin-top: 20px;
              color: #555;
              word-break: break-all;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>${name || "Hospital"}</h2>
            <img src="${image}" />
            <p>${qrIdentifier}</p>
          </div>
        </body>
      </html>
    `);

        printWindow.document.close();

        printWindow.onload = () => {
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        };
    };

    const cardClass =
        "rounded-2xl border border-white/10 bg-[#111827] p-5 shadow-xl shadow-black/20 sm:p-6";
    const fieldViewClass =
        "min-h-11.5 rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-sm font-medium text-white";
    const inputClass =
        "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:bg-white/[0.08] focus:ring-4 focus:ring-blue-500/20";
    const labelClass =
        "mb-2 block text-sm font-semibold text-slate-300";

    if (loading) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center px-4">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-9 w-9 animate-spin rounded-full border-4 border-white/10 border-t-blue-500" />
                    <p className="text-sm text-slate-400">
                        Loading hospital...
                    </p>
                </div>
            </div>
        );
    }

    if (!hospital) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center px-4">
                <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#111827] p-8 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-400">
                        !
                    </div>

                    <h2 className="mt-4 text-xl font-semibold text-white">
                        Hospital not found
                    </h2>

                    <p className="mt-2 text-sm text-slate-400">
                        The hospital you are looking for could not
                        be found.
                    </p>

                    <button
                        onClick={() =>
                            router.push("/admin/hospitals")
                        }
                        className="mt-6 w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
                    >
                        Back to Hospitals
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-350">
                <div className="mb-7">
                    <button
                        onClick={() =>
                            router.push("/admin/hospitals")
                        }
                        className="mb-4 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
                    >
                        <span>←</span>
                        <span>Back to Hospitals</span>
                    </button>

                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-3">
                                <h1 className="truncate text-2xl font-bold tracking-tight text-white sm:text-3xl">
                                    {editing ? "Edit Hospital" : hospital.name}
                                </h1>

                                {!editing && (
                                    <span
                                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${hospital.is_active
                                            ? "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20"
                                            : "bg-slate-500/10 text-slate-400 ring-1 ring-slate-500/20"
                                            }`}
                                    >
                                        <span
                                            className={`h-1.5 w-1.5 rounded-full ${hospital.is_active
                                                ? "bg-emerald-400"
                                                : "bg-slate-500"
                                                }`}
                                        />
                                        {hospital.is_active
                                            ? "Active"
                                            : "Inactive"}
                                    </span>
                                )}
                            </div>

                            <p className="mt-2 text-sm text-slate-400 sm:text-base">
                                Manage hospital integration, API
                                configuration and QR code.
                            </p>
                        </div>

                        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                            {!editing ? (
                                <>
                                    <button
                                        onClick={() => setEditing(true)}
                                        className="w-full rounded-xl border border-white/10 bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 sm:w-auto"
                                    >
                                        Edit Hospital
                                    </button>

                                    <button
                                        onClick={handleStatusToggle}
                                        disabled={saving}
                                        className={`w-full rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto ${hospital.is_active
                                            ? "bg-red-500 hover:bg-red-400"
                                            : "bg-emerald-600 hover:bg-emerald-500"
                                            }`}
                                    >
                                        {hospital.is_active
                                            ? "Deactivate"
                                            : "Activate"}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={() => {
                                            resetForm();
                                            setEditing(false);
                                        }}
                                        className="w-full rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/10 sm:w-auto"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="w-full rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                                    >
                                        {saving
                                            ? "Saving..."
                                            : "Save Changes"}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
                    <div className="min-w-0 space-y-6">
                        <section className={cardClass}>
                            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <h2 className="text-lg font-bold text-white">
                                        Hospital Information
                                    </h2>

                                    <p className="mt-1 text-sm text-slate-400">
                                        Basic information used for the hospital
                                        integration.
                                    </p>
                                </div>

                                {editing && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setIsActive(!isActive)
                                        }
                                        className={`inline-flex w-fit items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold ${isActive
                                            ? "bg-emerald-500/10 text-emerald-400"
                                            : "bg-white/5 text-slate-400"
                                            }`}
                                    >
                                        <span
                                            className={`h-2 w-2 rounded-full ${isActive
                                                ? "bg-emerald-400"
                                                : "bg-slate-500"
                                                }`}
                                        />

                                        {isActive ? "Active" : "Inactive"}
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                <div>
                                    <label className={labelClass}>
                                        Hospital Name
                                    </label>

                                    {editing ? (
                                        <input
                                            value={name}
                                            onChange={(e) =>
                                                setName(e.target.value)
                                            }
                                            type="text"
                                            className={inputClass}
                                        />
                                    ) : (
                                        <div className={fieldViewClass}>
                                            {hospital.name}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className={labelClass}>
                                        QR Identifier
                                    </label>

                                    {editing ? (
                                        <input
                                            value={qrIdentifier}
                                            onChange={(e) =>
                                                setQrIdentifier(
                                                    e.target.value,
                                                )
                                            }
                                            type="text"
                                            className={inputClass}
                                        />
                                    ) : (
                                        <div
                                            className={`${fieldViewClass} font-mono`}
                                        >
                                            {hospital.qr_identifier}
                                        </div>
                                    )}
                                </div>

                                <div className="md:col-span-2">
                                    <label className={labelClass}>
                                        Paperwork API Endpoint
                                    </label>

                                    {editing ? (
                                        <input
                                            value={paperworkEndpoint}
                                            onChange={(e) =>
                                                setPaperworkEndpoint(
                                                    e.target.value,
                                                )
                                            }
                                            type="url"
                                            className={inputClass}
                                        />
                                    ) : (
                                        <div className="break-all rounded-xl border border-white/5 bg-white/5 px-4 py-3 font-mono text-sm text-slate-300">
                                            {hospital.paperwork_endpoint}
                                        </div>
                                    )}

                                    <p className="mt-2 text-xs text-slate-500">
                                        The server uses this endpoint to submit
                                        patient paperwork to the hospital.
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section className={cardClass}>
                            <div className="mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                                        <Lock className="h-5 w-5" />
                                    </div>

                                    <div>
                                        <h2 className="text-lg font-bold text-white">
                                            API Authentication
                                        </h2>

                                        <p className="text-sm text-slate-400">
                                            Authentication used for hospital
                                            API requests.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-5">
                                <div>
                                    <label className={labelClass}>
                                        Authentication Type
                                    </label>

                                    {editing ? (
                                        <select
                                            value={authType}
                                            onChange={(e) =>
                                                setAuthType(
                                                    e.target.value as AuthType,
                                                )
                                            }
                                            className={inputClass}
                                        >
                                            <option
                                                value="none"
                                                className="bg-[#111827]"
                                            >
                                                None
                                            </option>
                                            <option
                                                value="api_key"
                                                className="bg-[#111827]"
                                            >
                                                API Key
                                            </option>
                                            <option
                                                value="bearer"
                                                className="bg-[#111827]"
                                            >
                                                Bearer Token
                                            </option>
                                            <option
                                                value="basic"
                                                className="bg-[#111827]"
                                            >
                                                Basic Authentication
                                            </option>
                                        </select>
                                    ) : (
                                        <div className="flex min-h-11.5 flex-wrap items-center justify-between gap-2 rounded-xl border border-white/5 bg-white/5 px-4 py-3">
                                            <span className="text-sm font-medium capitalize text-white">
                                                {(
                                                    hospital.auth_config?.type ||
                                                    "none"
                                                ).replace("_", " ")}
                                            </span>

                                            <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400">
                                                Configured
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {editing &&
                                    authType === "api_key" && (
                                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                            <div>
                                                <label className={labelClass}>
                                                    API Key
                                                </label>

                                                <input
                                                    type="password"
                                                    value={apiKey}
                                                    onChange={(e) =>
                                                        setApiKey(e.target.value)
                                                    }
                                                    placeholder="Enter new API key"
                                                    className={inputClass}
                                                />

                                                <p className="mt-2 text-xs text-slate-500">
                                                    Leave empty to keep the current
                                                    key.
                                                </p>
                                            </div>

                                            <div>
                                                <label className={labelClass}>
                                                    Header Name
                                                </label>

                                                <input
                                                    type="text"
                                                    value={apiKeyHeader}
                                                    onChange={(e) =>
                                                        setApiKeyHeader(
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="X-API-Key"
                                                    className={inputClass}
                                                />
                                            </div>
                                        </div>
                                    )}

                                {editing &&
                                    authType === "bearer" && (
                                        <div>
                                            <label className={labelClass}>
                                                Bearer Token
                                            </label>

                                            <input
                                                type="password"
                                                value={token}
                                                onChange={(e) =>
                                                    setToken(e.target.value)
                                                }
                                                placeholder="Enter new bearer token"
                                                className={inputClass}
                                            />

                                            <p className="mt-2 text-xs text-slate-500">
                                                Leave empty to keep the current
                                                token.
                                            </p>
                                        </div>
                                    )}

                                {editing &&
                                    authType === "basic" && (
                                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                            <div>
                                                <label className={labelClass}>
                                                    Username
                                                </label>

                                                <input
                                                    type="text"
                                                    value={username}
                                                    onChange={(e) =>
                                                        setUsername(
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Enter username"
                                                    className={inputClass}
                                                />
                                            </div>

                                            <div>
                                                <label className={labelClass}>
                                                    Password
                                                </label>

                                                <input
                                                    type="password"
                                                    value={password}
                                                    onChange={(e) =>
                                                        setPassword(
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Enter new password"
                                                    className={inputClass}
                                                />

                                                <p className="mt-2 text-xs text-slate-500">
                                                    Leave empty to keep the current
                                                    password.
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                {!editing &&
                                    hospital.auth_config?.type ===
                                    "none" && (
                                        <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-slate-300">
                                                ✓
                                            </div>

                                            <div>
                                                <p className="text-sm font-semibold text-slate-200">
                                                    No authentication required
                                                </p>

                                                <p className="mt-0.5 text-xs text-slate-500">
                                                    The hospital API accepts requests
                                                    without additional credentials.
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                {!editing &&
                                    hospital.auth_config?.type !==
                                    "none" && (
                                        <div className="flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-amber-400">
                                                ✓
                                            </div>

                                            <div>
                                                <p className="text-sm font-semibold text-amber-300">
                                                    Credentials configured
                                                </p>

                                                <p className="mt-0.5 text-xs text-amber-400/80">
                                                    Secret credentials are hidden for
                                                    security.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                            </div>
                        </section>

                        <section className={cardClass}>
                            <h2 className="text-lg font-bold text-white">
                                Integration Details
                            </h2>

                            <p className="mt-1 text-sm text-slate-400">
                                Current hospital integration information.
                            </p>

                            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <div className="rounded-xl border border-white/5 bg-white/5 p-4">
                                    <p className="text-xs font-medium text-slate-500">
                                        Integration Status
                                    </p>

                                    <p
                                        className={`mt-1 text-sm font-semibold ${hospital.is_active
                                            ? "text-emerald-400"
                                            : "text-slate-400"
                                            }`}
                                    >
                                        {hospital.is_active
                                            ? "Ready to receive requests"
                                            : "Integration disabled"}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-white/5 bg-white/5 p-4">
                                    <p className="text-xs font-medium text-slate-500">
                                        Created
                                    </p>

                                    <p className="mt-1 text-sm font-semibold text-slate-200">
                                        {new Date(
                                            hospital.created_at,
                                        ).toLocaleDateString()}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-white/5 bg-white/5 p-4 sm:col-span-2">
                                    <p className="text-xs font-medium text-slate-500">
                                        Last Updated
                                    </p>

                                    <p className="mt-1 text-sm font-semibold text-slate-200">
                                        {new Date(
                                            hospital.updated_at,
                                        ).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </section>
                    </div>

                    <aside className="min-w-0">
                        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111827] shadow-2xl shadow-black/30 xl:sticky xl:top-6">
                            <div className="border-b border-white/10 p-5 sm:p-6">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h2 className="text-lg font-bold text-white">
                                            Hospital QR Code
                                        </h2>

                                        <p className="mt-1 text-sm leading-5 text-slate-400">
                                            Patients can scan this QR code to
                                            connect their paperwork with this
                                            hospital.
                                        </p>
                                    </div>

                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                                        QR
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 sm:p-6">
                                <div className="flex justify-center rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-8">
                                    <div
                                        ref={qrRef}
                                        className="rounded-xl bg-white p-3 shadow-sm"
                                    >
                                        <QRCodeCanvas
                                            value={hospital.qr_identifier}
                                            size={240}
                                            level="H"
                                            marginSize={4}
                                        />
                                    </div>
                                </div>

                                <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4">
                                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                        QR Identifier
                                    </p>

                                    <p className="mt-1 break-all font-mono text-sm font-semibold text-slate-200">
                                        {hospital.qr_identifier}
                                    </p>
                                </div>

                                <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                                    <button
                                        onClick={downloadQr}
                                        className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-white/20 hover:bg-white/10"
                                    >
                                        Download
                                    </button>

                                    <button
                                        onClick={printQr}
                                        className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
                                    >
                                        Print QR
                                    </button>
                                </div>
                            </div>

                            <div className="border-t border-white/10 bg-white/3 px-5 py-4 sm:px-6">
                                <div className="flex items-start gap-3">
                                    <div
                                        className={`mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full ${hospital.is_active
                                            ? "bg-emerald-400"
                                            : "bg-slate-500"
                                            }`}
                                    />

                                    <p className="text-xs leading-5 text-slate-400">
                                        {hospital.is_active
                                            ? "This QR code is active and can be used by patients."
                                            : "This hospital is inactive. QR submissions will not be processed."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}