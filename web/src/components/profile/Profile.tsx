"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useUserStore } from "@/store/useUserStore";
import { User, Mail, Phone, MapPin, Calendar, Weight, ShieldCheck, Loader2, Save, AlertTriangle, CheckCircle2, Lock, Stethoscope, HeartPulse, Plus, X, Shield } from "lucide-react";
import AvatarSelector from "@/components/profile/AvatarSelector";
import DeleteAccountSection from "@/components/profile/DeleteAccountSection";

const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

const roleLabels: Record<string, string> = {
    admin: "Administrator",
    dispatcher: "Dispatcher",
    doctor: "Doctor",
    assistant_doctor: "Assistant Doctor",
    patient: "Patient",
};

interface SomaticPolicy {
    policy_number: string;
    start_date: string;
    expiry_date: string;
    status: "pending" | "active" | "expired" | "cancelled";
    plan_id?: {
        name?: string;
        description?: string;
        coverage_amount?: number;
        premium_amount?: number;
        premium_frequency?: string;
        features?: string[];
    };
}

export default function Profile() {
    const { user, fetchUser, isLoading } = useUserStore();

    const [saving, setSaving] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    const [somaticPolicy, setSomaticPolicy] =
        useState<SomaticPolicy | null>(null);
    const [policyLoading, setPolicyLoading] = useState(false);

    const [formData, setFormData] = useState({
        username: "",
        contact_no: "",
        address: "",
        date_of_birth: "",
        weight_kg: "",
        avatar_id: "1",
        currentPassword: "",
        newPassword: "",
    });

    const [bloodGrp, setBloodGrp] = useState("");
    const [allergies, setAllergies] = useState<string[]>([]);
    const [diseases, setDiseases] = useState<string[]>([]);
    const [allergyInput, setAllergyInput] = useState("");
    const [diseaseInput, setDiseaseInput] = useState("");

    const [insurance, setInsurance] = useState({
        type: "",
        provider_name: "",
        policy_number: "",
        policy_holder_name: "",
    });

    const fetchProfileData = async () => {
        try {
            setPolicyLoading(true);

            const res = await fetch("/api/users/profile");
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to fetch profile data");
            }

            const profile = data.profile;

            setSomaticPolicy(data.somatic_policy || null);

            if (profile) {
                setFormData((prev) => ({
                    ...prev,
                    username: profile.username || "",
                    contact_no: profile.contact_no || "",
                    address: profile.address || "",
                    date_of_birth: profile.date_of_birth
                        ? new Date(profile.date_of_birth)
                            .toISOString()
                            .split("T")[0]
                        : "",
                    weight_kg: profile.weight_kg?.toString() || "",
                    avatar_id: profile.avatar_id || "1",
                }));

                setBloodGrp(profile.patient_info?.blood_grp || "");
                setAllergies(profile.patient_info?.known_allergies || []);
                setDiseases(profile.patient_info?.chronic_diseases || []);

                setInsurance({
                    type: profile.insurance?.type || "",
                    provider_name: profile.insurance?.provider_name || "",
                    policy_number: profile.insurance?.policy_number || "",
                    policy_holder_name:
                        profile.insurance?.policy_holder_name || "",
                });
            }
        } catch (error) {
            console.error("Profile fetch error:", error);
            setErrorMsg(
                error instanceof Error
                    ? error.message
                    : "Failed to fetch profile data",
            );
        } finally {
            setPolicyLoading(false);
        }
    };

    useEffect(() => {
        if (!user) return;

        fetchProfileData();
    }, [user]);

    const updateField = (field: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleInsuranceTypeChange = (type: string) => {
        if (type === "somatic") {
            if (!somaticPolicy) {
                setErrorMsg(
                    "No SOMATIC insurance policy is linked to your account. Please purchase or activate a SOMATIC insurance plan first.",
                );
                return;
            }

            setErrorMsg("");

            setInsurance({
                type: "somatic",
                provider_name: "",
                policy_number: "",
                policy_holder_name: "",
            });

            return;
        }

        if (type === "external") {
            setErrorMsg("");

            setInsurance((prev) => ({
                ...prev,
                type: "external",
            }));

            return;
        }

        setErrorMsg("");

        setInsurance({
            type: "",
            provider_name: "",
            policy_number: "",
            policy_holder_name: "",
        });
    };

    const addAllergy = () => {
        const value = allergyInput.trim();

        if (!value) return;

        if (
            !allergies.some(
                (item) => item.toLowerCase() === value.toLowerCase(),
            )
        ) {
            setAllergies((prev) => [...prev, value]);
        }

        setAllergyInput("");
    };

    const removeAllergy = (index: number) => {
        setAllergies((prev) => prev.filter((_, i) => i !== index));
    };

    const addDisease = () => {
        const value = diseaseInput.trim();

        if (!value) return;

        if (
            !diseases.some(
                (item) => item.toLowerCase() === value.toLowerCase(),
            )
        ) {
            setDiseases((prev) => [...prev, value]);
        }

        setDiseaseInput("");
    };

    const removeDisease = (index: number) => {
        setDiseases((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (
        e: React.FormEvent<HTMLFormElement>,
    ) => {
        e.preventDefault();

        setSaving(true);
        setSuccessMsg("");
        setErrorMsg("");

        try {
            const payload: Record<string, unknown> = {
                username: formData.username,
                contact_no: formData.contact_no,
                address: formData.address,
                date_of_birth: formData.date_of_birth || null,
                weight_kg: formData.weight_kg || null,
                avatar_id: formData.avatar_id,
            };

            if (user?.role === "patient") {
                payload.patient_info = {
                    blood_grp: bloodGrp || undefined,
                    known_allergies: allergies,
                    chronic_diseases: diseases,
                };
            }

            payload.insurance = insurance.type
                ? {
                    type: insurance.type,
                    ...(insurance.type === "external"
                        ? {
                            provider_name: insurance.provider_name,
                            policy_number: insurance.policy_number,
                            policy_holder_name:
                                insurance.policy_holder_name,
                        }
                        : {}),
                }
                : null;

            if (formData.newPassword) {
                payload.currentPassword = formData.currentPassword;
                payload.newPassword = formData.newPassword;
            }

            const res = await fetch("/api/users/profile", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to update profile");
            }

            setSuccessMsg(
                data.message || "Profile updated successfully.",
            );

            setFormData((prev) => ({
                ...prev,
                currentPassword: "",
                newPassword: "",
            }));

            await fetchUser(true);
            await fetchProfileData();
        } catch (error) {
            console.error("Profile update error:", error);

            setErrorMsg(
                error instanceof Error
                    ? error.message
                    : "Failed to update profile",
            );
        } finally {
            setSaving(false);
        }
    };

    if (isLoading && !user) {
        return (
            <div className="flex min-h-100 items-center justify-center">
                <Loader2 className="h-7 w-7 animate-spin text-purple-400" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="rounded-2xl border border-white/10 bg-[#0f172a] p-8 text-center">
                <AlertTriangle className="mx-auto mb-3 h-8 w-8 text-amber-400" />
                <p className="text-gray-300">Unable to load profile.</p>
            </div>
        );
    }

    const roleLabel = roleLabels[user.role] || user.role;

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Header */}
            <div className="rounded-2xl border border-white/10 bg-[#0f172a] p-6">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                    <AvatarSelector
                        currentAvatarId={formData.avatar_id}
                        onSelect={(id) =>
                            setFormData((prev) => ({
                                ...prev,
                                avatar_id: id,
                            }))
                        }
                        isAdmin={user.role === "admin"}
                    />

                    <div>
                        <h1 className="text-2xl font-semibold text-white">
                            Profile
                        </h1>

                        <p className="mt-1 text-sm text-gray-400">
                            Manage your personal information and account
                            settings.
                        </p>

                        <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-purple-400/20 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-300">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            {roleLabel}
                        </div>
                    </div>
                </div>
            </div>

            {/* Messages */}
            {successMsg && (
                <div className="flex items-center gap-3 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                    <CheckCircle2 className="h-5 w-5 shrink-0" />
                    {successMsg}
                </div>
            )}

            {errorMsg && (
                <div className="flex items-center gap-3 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    <AlertTriangle className="h-5 w-5 shrink-0" />
                    {errorMsg}
                </div>
            )}

            {/* General Information */}
            <section className="rounded-2xl border border-white/10 bg-[#0f172a] p-6">
                <div className="mb-6">
                    <div className="flex items-center gap-2">
                        <User className="h-5 w-5 text-purple-400" />
                        <h2 className="text-lg font-semibold text-white">
                            General Information
                        </h2>
                    </div>

                    <p className="mt-1 text-sm text-gray-400">
                        Your basic personal and contact information.
                    </p>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-300">
                            Username
                        </label>

                        <div className="relative">
                            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />

                            <input
                                type="text"
                                value={formData.username}
                                onChange={(e) =>
                                    updateField(
                                        "username",
                                        e.target.value,
                                    )
                                }
                                className="w-full rounded-xl border border-white/10 bg-white/3 py-3 pl-10 pr-4 text-sm text-white outline-none transition focus:border-purple-500/50"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-300">
                            Email
                        </label>

                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />

                            <input
                                type="email"
                                value={user.email}
                                disabled
                                className="w-full cursor-not-allowed rounded-xl border border-white/10 bg-white/2 py-3 pl-10 pr-4 text-sm text-gray-500 outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-300">
                            Contact Number
                        </label>

                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />

                            <input
                                type="tel"
                                value={formData.contact_no}
                                onChange={(e) =>
                                    updateField(
                                        "contact_no",
                                        e.target.value,
                                    )
                                }
                                placeholder="10 digit mobile number"
                                className="w-full rounded-xl border border-white/10 bg-white/3 py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-purple-500/50"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-300">
                            Date of Birth
                        </label>

                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />

                            <input
                                type="date"
                                value={formData.date_of_birth}
                                onChange={(e) =>
                                    updateField(
                                        "date_of_birth",
                                        e.target.value,
                                    )
                                }
                                className="w-full rounded-xl border border-white/10 bg-white/3 py-3 pl-10 pr-4 text-sm text-white outline-none transition focus:border-purple-500/50"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-300">
                            Weight (kg)
                        </label>

                        <div className="relative">
                            <Weight className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />

                            <input
                                type="number"
                                min="1"
                                step="0.1"
                                value={formData.weight_kg}
                                onChange={(e) =>
                                    updateField(
                                        "weight_kg",
                                        e.target.value,
                                    )
                                }
                                placeholder="e.g. 65"
                                className="w-full rounded-xl border border-white/10 bg-white/3 py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-purple-500/50"
                            />
                        </div>
                    </div>

                    <InfoItem
                        label="Member Since"
                        value={formatDate(user.created_at)}
                    />

                    <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-medium text-gray-300">
                            Address
                        </label>

                        <div className="relative">
                            <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-gray-500" />

                            <textarea
                                value={formData.address}
                                onChange={(e) =>
                                    updateField(
                                        "address",
                                        e.target.value,
                                    )
                                }
                                rows={3}
                                placeholder="Enter your address"
                                className="w-full resize-none rounded-xl border border-white/10 bg-white/3 py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-purple-500/50"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Doctor Information */}
            {(user.role === "doctor" ||
                user.role === "assistant_doctor") &&
                user.doctor_info && (
                    <section className="rounded-2xl border border-white/10 bg-[#0f172a] p-6">
                        <div className="mb-6">
                            <div className="flex items-center gap-2">
                                <Stethoscope className="h-5 w-5 text-purple-400" />
                                <h2 className="text-lg font-semibold text-white">
                                    Professional Information
                                </h2>
                            </div>

                            <p className="mt-1 text-sm text-gray-400">
                                Your professional information is managed by
                                the system.
                            </p>
                        </div>

                        <div className="grid gap-5 md:grid-cols-2">
                            <InfoItem
                                label="Registration Number"
                                value={user.doctor_info.reg_no}
                            />

                            <InfoItem
                                label="Qualification"
                                value={user.doctor_info.qualification}
                            />

                            <InfoItem
                                label="Experience"
                                value={
                                    user.doctor_info.experience !== undefined
                                        ? `${user.doctor_info.experience} years`
                                        : undefined
                                }
                            />

                            <InfoItem
                                label="Department"
                                value={
                                    user.doctor_info.department_id
                                        ? String(
                                            user.doctor_info.department_id,
                                        )
                                        : undefined
                                }
                            />

                            <InfoItem
                                label="Case Acceptance"
                                value={
                                    user.doctor_info.is_accepting_cases
                                        ? "Accepting Cases"
                                        : "Not Accepting Cases"
                                }
                            />
                        </div>
                    </section>
                )}

            {/* Medical Profile */}
            {user.role === "patient" && (
                <section className="rounded-2xl border border-white/10 bg-[#0f172a] p-6">
                    <div className="mb-6">
                        <div className="flex items-center gap-2">
                            <HeartPulse className="h-5 w-5 text-purple-400" />
                            <h2 className="text-lg font-semibold text-white">
                                Medical Profile
                            </h2>
                        </div>

                        <p className="mt-1 text-sm text-gray-400">
                            Keep your medical information updated for safer
                            emergency assistance.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-300">
                                Blood Group
                            </label>

                            <select
                                value={bloodGrp}
                                onChange={(e) =>
                                    setBloodGrp(e.target.value)
                                }
                                className="w-full rounded-xl border border-white/10 bg-white/3 px-4 py-3 text-sm text-white outline-none transition focus:border-purple-500/50"
                            >
                                <option value="">Select blood group</option>

                                {bloodGroups.map((group) => (
                                    <option key={group} value={group}>
                                        {group}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <TagInput
                            label="Known Allergies"
                            items={allergies}
                            input={allergyInput}
                            setInput={setAllergyInput}
                            setItems={setAllergies}
                            onAdd={addAllergy}
                            onRemove={removeAllergy}
                            placeholder="e.g. Penicillin"
                        />

                        <TagInput
                            label="Chronic Diseases"
                            items={diseases}
                            input={diseaseInput}
                            setInput={setDiseaseInput}
                            setItems={setDiseases}
                            onAdd={addDisease}
                            onRemove={removeDisease}
                            placeholder="e.g. Diabetes"
                        />
                    </div>
                </section>
            )}

            {/* Insurance */}
            <section className="rounded-2xl border border-white/10 bg-[#0f172a] p-6">
                <div className="mb-6">
                    <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-purple-400" />
                        <h2 className="text-lg font-semibold text-white">
                            Insurance
                        </h2>
                    </div>

                    <p className="mt-1 text-sm text-gray-400">
                        Manage your insurance information for emergency
                        paperwork and assistance.
                    </p>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-300">
                        Insurance Type
                    </label>

                    <select
                        value={insurance.type}
                        onChange={(e) =>
                            handleInsuranceTypeChange(e.target.value)
                        }
                        className="w-full rounded-xl border border-white/10 bg-white/3 px-4 py-3 text-sm text-white outline-none transition focus:border-purple-500/50"
                    >
                        <option value="">No Insurance</option>

                        <option value="external">
                            External Insurance
                        </option>

                        <option
                            value="somatic"
                            disabled={
                                policyLoading || !somaticPolicy
                            }
                        >
                            SOMATIC Insurance
                            {!somaticPolicy ? " (No Active Policy)" : ""}
                        </option>
                    </select>
                </div>

                {/* External Insurance */}
                {insurance.type === "external" && (
                    <div className="mt-5 space-y-5">
                        <div className="grid gap-5 md:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-300">
                                    Insurance Provider
                                </label>

                                <input
                                    type="text"
                                    value={insurance.provider_name}
                                    onChange={(e) =>
                                        setInsurance((prev) => ({
                                            ...prev,
                                            provider_name: e.target.value,
                                        }))
                                    }
                                    placeholder="e.g. Star Health"
                                    className="w-full rounded-xl border border-white/10 bg-white/3 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-purple-500/50"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-300">
                                    Policy Number
                                </label>

                                <input
                                    type="text"
                                    value={insurance.policy_number}
                                    onChange={(e) =>
                                        setInsurance((prev) => ({
                                            ...prev,
                                            policy_number: e.target.value,
                                        }))
                                    }
                                    placeholder="Enter policy number"
                                    className="w-full rounded-xl border border-white/10 bg-white/3 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-purple-500/50"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="mb-2 block text-sm font-medium text-gray-300">
                                    Policy Holder Name
                                </label>

                                <input
                                    type="text"
                                    value={insurance.policy_holder_name}
                                    onChange={(e) =>
                                        setInsurance((prev) => ({
                                            ...prev,
                                            policy_holder_name:
                                                e.target.value,
                                        }))
                                    }
                                    placeholder="Enter policy holder name"
                                    className="w-full rounded-xl border border-white/10 bg-white/3 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-purple-500/50"
                                />
                            </div>
                        </div>

                        <div className="rounded-xl border border-amber-400/20 bg-amber-500/10 p-4">
                            <div className="flex gap-3">
                                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />

                                <p className="text-xs leading-5 text-amber-200">
                                    External insurance information is provided
                                    by you and is not verified by SOMATIC.
                                    Please make sure the information is
                                    accurate.
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/3 p-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm font-medium text-white">
                                    Want SOMATIC Insurance?
                                </p>

                                <p className="mt-1 text-xs text-gray-400">
                                    View available SOMATIC insurance plans.
                                </p>
                            </div>

                            <Link
                                href="/insurance"
                                className="inline-flex shrink-0 items-center justify-center rounded-lg border border-purple-400/20 bg-purple-500/10 px-4 py-2 text-sm font-medium text-purple-300 transition hover:bg-purple-500/20"
                            >
                                View SOMATIC Plans
                            </Link>
                        </div>
                    </div>
                )}

                {/* SOMATIC Insurance */}
                {insurance.type === "somatic" && (
                    <div className="mt-5">
                        {somaticPolicy ? (
                            <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/6 p-5">
                                <div className="mb-5 flex items-start justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <ShieldCheck className="h-5 w-5 text-emerald-400" />

                                            <h3 className="font-medium text-white">
                                                SOMATIC Insurance
                                            </h3>
                                        </div>

                                        <p className="mt-1 text-xs text-gray-400">
                                            Your verified SOMATIC insurance
                                            policy.
                                        </p>
                                    </div>

                                    <span
                                        className={`rounded-full px-3 py-1 text-xs font-medium ${somaticPolicy.status === "active"
                                            ? "bg-emerald-500/10 text-emerald-300"
                                            : "bg-amber-500/10 text-amber-300"
                                            }`}
                                    >
                                        {formatStatus(
                                            somaticPolicy.status,
                                        )}
                                    </span>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <InfoItem
                                        label="Plan"
                                        value={
                                            somaticPolicy.plan_id?.name
                                        }
                                    />

                                    <InfoItem
                                        label="Policy Number"
                                        value={
                                            somaticPolicy.policy_number
                                        }
                                    />

                                    <InfoItem
                                        label="Coverage"
                                        value={
                                            somaticPolicy.plan_id
                                                ?.coverage_amount !==
                                                undefined
                                                ? `₹${somaticPolicy.plan_id.coverage_amount.toLocaleString(
                                                    "en-IN",
                                                )}`
                                                : undefined
                                        }
                                    />

                                    <InfoItem
                                        label="Premium"
                                        value={
                                            somaticPolicy.plan_id
                                                ?.premium_amount !==
                                                undefined
                                                ? `₹${somaticPolicy.plan_id.premium_amount.toLocaleString(
                                                    "en-IN",
                                                )} / ${formatFrequency(
                                                    somaticPolicy.plan_id
                                                        .premium_frequency,
                                                )}`
                                                : undefined
                                        }
                                    />

                                    <InfoItem
                                        label="Valid From"
                                        value={formatDate(
                                            somaticPolicy.start_date,
                                        )}
                                    />

                                    <InfoItem
                                        label="Valid Until"
                                        value={formatDate(
                                            somaticPolicy.expiry_date,
                                        )}
                                    />
                                </div>

                                {somaticPolicy.plan_id?.features &&
                                    somaticPolicy.plan_id.features.length >
                                    0 && (
                                        <div className="mt-5 border-t border-white/10 pt-5">
                                            <p className="mb-3 text-sm font-medium text-gray-300">
                                                Plan Features
                                            </p>

                                            <div className="flex flex-wrap gap-2">
                                                {somaticPolicy.plan_id.features.map(
                                                    (feature, index) => (
                                                        <span
                                                            key={index}
                                                            className="rounded-full border border-white/10 bg-white/3 px-3 py-1.5 text-xs text-gray-300"
                                                        >
                                                            {feature}
                                                        </span>
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                    )}

                                <div className="mt-5 flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-2.5 text-xs text-emerald-300">
                                    <ShieldCheck className="h-4 w-4 shrink-0" />
                                    This policy is linked to your SOMATIC
                                    account and its details cannot be edited
                                    from your profile.
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-xl border border-amber-400/20 bg-amber-500/10 p-4">
                                <div className="flex gap-3">
                                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />

                                    <div>
                                        <p className="text-sm font-medium text-amber-200">
                                            No SOMATIC policy found
                                        </p>

                                        <p className="mt-1 text-xs leading-5 text-amber-200/70">
                                            Please purchase or activate a
                                            SOMATIC insurance plan first.
                                        </p>

                                        <Link
                                            href="/insurance"
                                            className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-amber-300 hover:text-amber-200"
                                        >
                                            View Insurance Plans →
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* No Insurance */}
                {!insurance.type && (
                    <div className="mt-5 flex flex-col gap-4 rounded-xl border border-white/10 bg-white/3 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm font-medium text-white">
                                No insurance selected
                            </p>

                            <p className="mt-1 text-xs text-gray-400">
                                Add external insurance details or get a
                                SOMATIC insurance plan.
                            </p>
                        </div>

                        <Link
                            href="/insurance"
                            className="inline-flex shrink-0 items-center justify-center rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-purple-500"
                        >
                            Get SOMATIC Insurance
                        </Link>
                    </div>
                )}
            </section>

            {/* Security */}
            <section className="rounded-2xl border border-white/10 bg-[#0f172a] p-6">
                <div className="mb-6">
                    <div className="flex items-center gap-2">
                        <Lock className="h-5 w-5 text-purple-400" />

                        <h2 className="text-lg font-semibold text-white">
                            Security
                        </h2>
                    </div>

                    <p className="mt-1 text-sm text-gray-400">
                        Change your account password.
                    </p>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-300">
                            Current Password
                        </label>

                        <input
                            type="password"
                            value={formData.currentPassword}
                            onChange={(e) =>
                                updateField(
                                    "currentPassword",
                                    e.target.value,
                                )
                            }
                            placeholder="Enter current password"
                            className="w-full rounded-xl border border-white/10 bg-white/3 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-purple-500/50"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-300">
                            New Password
                        </label>

                        <input
                            type="password"
                            value={formData.newPassword}
                            onChange={(e) =>
                                updateField(
                                    "newPassword",
                                    e.target.value,
                                )
                            }
                            placeholder="Enter new password"
                            className="w-full rounded-xl border border-white/10 bg-white/3 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-purple-500/50"
                        />
                    </div>
                </div>

                <p className="mt-3 text-xs text-gray-500">
                    Leave both fields empty if you do not want to change your
                    password.
                </p>
            </section>

            {/* Save */}
            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {saving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Save className="h-4 w-4" />
                    )}

                    {saving ? "Saving..." : "Save Changes"}
                </button>
            </div>

            {/* Delete Account */}
            <DeleteAccountSection />
        </form>
    );
}

function InfoItem({
    label,
    value,
}: {
    label: string;
    value?: string;
}) {
    return (
        <div className="rounded-xl border border-white/10 bg-white/2 p-4">
            <p className="text-xs text-gray-500">{label}</p>

            <p className="mt-1 text-sm font-medium text-gray-200">
                {value || "Not provided"}
            </p>
        </div>
    );
}

function TagInput({
    label,
    items,
    input,
    setInput,
    onAdd,
    onRemove,
    placeholder,
}: {
    label: string;
    items: string[];
    input: string;
    setInput: React.Dispatch<React.SetStateAction<string>>;
    setItems: React.Dispatch<React.SetStateAction<string[]>>;
    onAdd: () => void;
    onRemove: (index: number) => void;
    placeholder: string;
}) {
    return (
        <div>
            <label className="mb-2 block text-lg font-medium text-gray-300">
                {label}
            </label>

            <div className="relative">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            onAdd();
                        }
                    }}
                    placeholder={placeholder}
                    className="w-full rounded-xl border border-white/10 bg-white/3 px-4 py-4 text-base text-white outline-none transition placeholder:text-gray-500 focus:border-purple-500/50"
                />

                {input.trim() && (
                    <button
                        type="button"
                        onClick={onAdd}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-purple-400 transition hover:bg-purple-500/10 hover:text-purple-300"
                    >
                        <Plus className="h-5 w-5" />
                    </button>
                )}
            </div>

            {items.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-3">
                    {items.map((item, index) => (
                        <span
                            key={`${item}-${index}`}
                            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/3 px-4 py-2 text-sm text-gray-300"
                        >
                            {item}

                            <button
                                type="button"
                                onClick={() => onRemove(index)}
                                className="text-gray-500 transition hover:text-red-400"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}

function formatDate(date?: string | Date) {
    if (!date) return undefined;

    const parsedDate = new Date(date);

    if (isNaN(parsedDate.getTime())) return undefined;

    return parsedDate.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function formatStatus(status: string) {
    return status
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatFrequency(frequency?: string) {
    if (!frequency) return "period";

    return frequency.replace("_", "-");
}