"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useUserStore } from "@/store/useUserStore";
import { toast } from "react-toastify";
import {
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Weight,
    ShieldCheck,
    Loader2,
    Save,
    AlertTriangle,
    Lock,
    Stethoscope,
    HeartPulse,
    Plus,
    X,
    Shield,
} from "lucide-react";
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
    const [somaticPolicy, setSomaticPolicy] = useState<SomaticPolicy | null>(null);
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
                        ? new Date(profile.date_of_birth).toISOString().split("T")[0]
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
                    policy_holder_name: profile.insurance?.policy_holder_name || "",
                });
            }
        } catch (error) {
            console.error("Profile fetch error:", error);
            toast.error(error instanceof Error ? error.message : "Failed to fetch profile data");
        } finally {
            setPolicyLoading(false);
        }
    };

    useEffect(() => {
        if (!user) return;
        fetchProfileData();
    }, [user]);

    const updateField = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleInsuranceTypeChange = (type: string) => {
        if (type === "somatic") {
            if (!somaticPolicy) {
                toast.error("No SOMATIC insurance policy is linked to your account. Please purchase or activate a SOMATIC insurance plan first.");
                return;
            }

            setInsurance({
                type: "somatic",
                provider_name: "",
                policy_number: "",
                policy_holder_name: "",
            });

            return;
        }

        if (type === "external") {
            setInsurance((prev) => ({ ...prev, type: "external" }));
            return;
        }

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

        if (!allergies.some((item) => item.toLowerCase() === value.toLowerCase())) {
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

        if (!diseases.some((item) => item.toLowerCase() === value.toLowerCase())) {
            setDiseases((prev) => [...prev, value]);
        }

        setDiseaseInput("");
    };

    const removeDisease = (index: number) => {
        setDiseases((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setSaving(true);

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
                            policy_holder_name: insurance.policy_holder_name,
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

            toast.success(data.message || "Profile updated successfully.");

            setFormData((prev) => ({
                ...prev,
                currentPassword: "",
                newPassword: "",
            }));

            await fetchUser(true);
            await fetchProfileData();
        } catch (error) {
            console.error("Profile update error:", error);
            toast.error(error instanceof Error ? error.message : "Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    if (isLoading && !user) {
        return (
            <div className="flex min-h-100 items-center justify-center">
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="rounded-xl border border-border bg-surface p-8 text-center">
                <AlertTriangle className="mx-auto mb-3 h-8 w-8 text-warning" />
                <p className="text-muted">Unable to load profile.</p>
            </div>
        );
    }

    const roleLabel = roleLabels[user.role] || user.role;

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="rounded-xl border border-border bg-surface p-6">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                    <AvatarSelector
                        currentAvatarId={formData.avatar_id}
                        onSelect={(id) => setFormData((prev) => ({ ...prev, avatar_id: id }))}
                        isAdmin={user.role === "admin"}
                    />

                    <div>
                        <h1 className="text-2xl font-semibold text-foreground">
                            Profile
                        </h1>

                        <p className="mt-1 text-sm text-muted">
                            Manage your personal information and account settings.
                        </p>

                        <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            {roleLabel}
                        </div>
                    </div>
                </div>
            </div>

            <section className="rounded-xl border border-border bg-surface p-6">
                <div className="mb-6">
                    <div className="flex items-center gap-2">
                        <User className="h-5 w-5 text-primary" />
                        <h2 className="text-lg font-semibold text-foreground">
                            General Information
                        </h2>
                    </div>

                    <p className="mt-1 text-sm text-muted">
                        Your basic personal and contact information.
                    </p>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-foreground">
                            Username
                        </label>

                        <div className="relative">
                            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                            <input
                                type="text"
                                value={formData.username}
                                onChange={(e) => updateField("username", e.target.value)}
                                className="w-full rounded-lg border border-border bg-surface-secondary py-3 pl-10 pr-4 text-sm text-foreground outline-none transition focus:border-primary"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-foreground">
                            Email
                        </label>

                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                            <input
                                type="email"
                                value={user.email}
                                disabled
                                className="w-full cursor-not-allowed rounded-lg border border-border bg-surface-secondary py-3 pl-10 pr-4 text-sm text-muted outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-foreground">
                            Contact Number
                        </label>

                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                            <input
                                type="tel"
                                value={formData.contact_no}
                                onChange={(e) => updateField("contact_no", e.target.value)}
                                placeholder="10 digit mobile number"
                                className="w-full rounded-lg border border-border bg-surface-secondary py-3 pl-10 pr-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-foreground">
                            Date of Birth
                        </label>

                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                            <input
                                type="date"
                                value={formData.date_of_birth}
                                onChange={(e) => updateField("date_of_birth", e.target.value)}
                                className="w-full rounded-lg border border-border bg-surface-secondary py-3 pl-10 pr-4 text-sm text-foreground outline-none transition focus:border-primary"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-foreground">
                            Weight (kg)
                        </label>

                        <div className="relative">
                            <Weight className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                            <input
                                type="number"
                                min="1"
                                step="0.1"
                                value={formData.weight_kg}
                                onChange={(e) => updateField("weight_kg", e.target.value)}
                                placeholder="e.g. 65"
                                className="w-full rounded-lg border border-border bg-surface-secondary py-3 pl-10 pr-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary"
                            />
                        </div>
                    </div>

                    <InfoItem label="Member Since" value={formatDate(user.created_at)} />

                    <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-medium text-foreground">
                            Address
                        </label>

                        <div className="relative">
                            <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />

                            <textarea
                                value={formData.address}
                                onChange={(e) => updateField("address", e.target.value)}
                                rows={3}
                                placeholder="Enter your address"
                                className="w-full resize-none rounded-lg border border-border bg-surface-secondary py-3 pl-10 pr-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {(user.role === "doctor" || user.role === "assistant_doctor") &&
                user.doctor_info && (
                    <section className="rounded-xl border border-border bg-surface p-6">
                        <div className="mb-6">
                            <div className="flex items-center gap-2">
                                <Stethoscope className="h-5 w-5 text-primary" />
                                <h2 className="text-lg font-semibold text-foreground">
                                    Professional Information
                                </h2>
                            </div>

                            <p className="mt-1 text-sm text-muted">
                                Your professional information is managed by the system.
                            </p>
                        </div>

                        <div className="grid gap-5 md:grid-cols-2">
                            <InfoItem label="Registration Number" value={user.doctor_info.reg_no} />
                            <InfoItem label="Qualification" value={user.doctor_info.qualification} />
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
                                        ? String(user.doctor_info.department_id)
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

            {user.role === "patient" && (
                <section className="rounded-xl border border-border bg-surface p-6">
                    <div className="mb-6">
                        <div className="flex items-center gap-2">
                            <HeartPulse className="h-5 w-5 text-primary" />
                            <h2 className="text-lg font-semibold text-foreground">
                                Medical Profile
                            </h2>
                        </div>

                        <p className="mt-1 text-sm text-muted">
                            Keep your medical information updated for safer emergency assistance.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-foreground">
                                Blood Group
                            </label>

                            <select
                                value={bloodGrp}
                                onChange={(e) => setBloodGrp(e.target.value)}
                                className="w-full rounded-lg border border-border bg-surface-secondary px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary"
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
                            onAdd={addAllergy}
                            onRemove={removeAllergy}
                            placeholder="e.g. Penicillin"
                        />

                        <TagInput
                            label="Chronic Diseases"
                            items={diseases}
                            input={diseaseInput}
                            setInput={setDiseaseInput}
                            onAdd={addDisease}
                            onRemove={removeDisease}
                            placeholder="e.g. Diabetes"
                        />
                    </div>
                </section>
            )}

            <section className="rounded-xl border border-border bg-surface p-6">
                <div className="mb-6">
                    <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        <h2 className="text-lg font-semibold text-foreground">
                            Insurance
                        </h2>
                    </div>

                    <p className="mt-1 text-sm text-muted">
                        Manage your insurance information for emergency paperwork and assistance.
                    </p>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">
                        Insurance Type
                    </label>

                    <select
                        value={insurance.type}
                        onChange={(e) => handleInsuranceTypeChange(e.target.value)}
                        className="w-full rounded-lg border border-border bg-surface-secondary px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary"
                    >
                        <option value="">No Insurance</option>
                        <option value="external">External Insurance</option>
                        <option value="somatic" disabled={policyLoading || !somaticPolicy}>
                            SOMATIC Insurance
                            {!somaticPolicy ? " (No Active Policy)" : ""}
                        </option>
                    </select>
                </div>

                {insurance.type === "external" && (
                    <div className="mt-5 space-y-5">
                        <div className="grid gap-5 md:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-foreground">
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
                                    className="w-full rounded-lg border border-border bg-surface-secondary px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-foreground">
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
                                    className="w-full rounded-lg border border-border bg-surface-secondary px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="mb-2 block text-sm font-medium text-foreground">
                                    Policy Holder Name
                                </label>

                                <input
                                    type="text"
                                    value={insurance.policy_holder_name}
                                    onChange={(e) =>
                                        setInsurance((prev) => ({
                                            ...prev,
                                            policy_holder_name: e.target.value,
                                        }))
                                    }
                                    placeholder="Enter policy holder name"
                                    className="w-full rounded-lg border border-border bg-surface-secondary px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary"
                                />
                            </div>
                        </div>

                        <div className="rounded-lg border border-warning/20 bg-warning/10 p-4">
                            <div className="flex gap-3">
                                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />

                                <p className="text-xs leading-5 text-warning">
                                    External insurance information is provided by you and is not verified by SOMATIC. Please make sure the information is accurate.
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface-secondary p-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm font-medium text-foreground">
                                    Want SOMATIC Insurance?
                                </p>

                                <p className="mt-1 text-xs text-muted">
                                    View available SOMATIC insurance plans.
                                </p>
                            </div>

                            <Link
                                href="/insurance"
                                className="inline-flex shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition hover:bg-primary/10"
                            >
                                View SOMATIC Plans
                            </Link>
                        </div>
                    </div>
                )}

                {insurance.type === "somatic" && (
                    <div className="mt-5">
                        {somaticPolicy ? (
                            <div className="rounded-lg border border-success/20 bg-success/5 p-5">
                                <div className="mb-5 flex items-start justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <ShieldCheck className="h-5 w-5 text-success" />

                                            <h3 className="font-medium text-foreground">
                                                SOMATIC Insurance
                                            </h3>
                                        </div>

                                        <p className="mt-1 text-xs text-muted">
                                            Your verified SOMATIC insurance policy.
                                        </p>
                                    </div>

                                    <span
                                        className={`rounded-full px-3 py-1 text-xs font-medium ${somaticPolicy.status === "active"
                                                ? "bg-success/10 text-success"
                                                : "bg-warning/10 text-warning"
                                            }`}
                                    >
                                        {formatStatus(somaticPolicy.status)}
                                    </span>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <InfoItem label="Plan" value={somaticPolicy.plan_id?.name} />
                                    <InfoItem label="Policy Number" value={somaticPolicy.policy_number} />
                                    <InfoItem
                                        label="Coverage"
                                        value={
                                            somaticPolicy.plan_id?.coverage_amount !== undefined
                                                ? `₹${somaticPolicy.plan_id.coverage_amount.toLocaleString("en-IN")}`
                                                : undefined
                                        }
                                    />
                                    <InfoItem
                                        label="Premium"
                                        value={
                                            somaticPolicy.plan_id?.premium_amount !== undefined
                                                ? `₹${somaticPolicy.plan_id.premium_amount.toLocaleString("en-IN")} / ${formatFrequency(somaticPolicy.plan_id.premium_frequency)}`
                                                : undefined
                                        }
                                    />
                                    <InfoItem label="Valid From" value={formatDate(somaticPolicy.start_date)} />
                                    <InfoItem label="Valid Until" value={formatDate(somaticPolicy.expiry_date)} />
                                </div>

                                {somaticPolicy.plan_id?.features &&
                                    somaticPolicy.plan_id.features.length > 0 && (
                                        <div className="mt-5 border-t border-border pt-5">
                                            <p className="mb-3 text-sm font-medium text-foreground">
                                                Plan Features
                                            </p>

                                            <div className="flex flex-wrap gap-2">
                                                {somaticPolicy.plan_id.features.map((feature, index) => (
                                                    <span
                                                        key={index}
                                                        className="rounded-full border border-border bg-surface-secondary px-3 py-1.5 text-xs text-muted"
                                                    >
                                                        {feature}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                <div className="mt-5 flex items-center gap-2 rounded-lg bg-success/10 px-3 py-2.5 text-xs text-success">
                                    <ShieldCheck className="h-4 w-4 shrink-0" />
                                    This policy is linked to your SOMATIC account and its details cannot be edited from your profile.
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-lg border border-warning/20 bg-warning/10 p-4">
                                <div className="flex gap-3">
                                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />

                                    <div>
                                        <p className="text-sm font-medium text-warning">
                                            No SOMATIC policy found
                                        </p>

                                        <p className="mt-1 text-xs leading-5 text-warning/70">
                                            Please purchase or activate a SOMATIC insurance plan first.
                                        </p>

                                        <Link
                                            href="/insurance"
                                            className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-warning transition hover:text-warning/80"
                                        >
                                            View Insurance Plans →
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {!insurance.type && (
                    <div className="mt-5 flex flex-col gap-4 rounded-lg border border-border bg-surface-secondary p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm font-medium text-foreground">
                                No insurance selected
                            </p>

                            <p className="mt-1 text-xs text-muted">
                                Add external insurance details or get a SOMATIC insurance plan.
                            </p>
                        </div>

                        <Link
                            href="/insurance"
                            className="inline-flex shrink-0 items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary-hover"
                        >
                            Get SOMATIC Insurance
                        </Link>
                    </div>
                )}
            </section>

            <section className="rounded-xl border border-border bg-surface p-6">
                <div className="mb-6">
                    <div className="flex items-center gap-2">
                        <Lock className="h-5 w-5 text-primary" />

                        <h2 className="text-lg font-semibold text-foreground">
                            Security
                        </h2>
                    </div>

                    <p className="mt-1 text-sm text-muted">
                        Change your account password.
                    </p>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-foreground">
                            Current Password
                        </label>

                        <input
                            type="password"
                            value={formData.currentPassword}
                            onChange={(e) => updateField("currentPassword", e.target.value)}
                            placeholder="Enter current password"
                            className="w-full rounded-lg border border-border bg-surface-secondary px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-foreground">
                            New Password
                        </label>

                        <input
                            type="password"
                            value={formData.newPassword}
                            onChange={(e) => updateField("newPassword", e.target.value)}
                            placeholder="Enter new password"
                            className="w-full rounded-lg border border-border bg-surface-secondary px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary"
                        />
                    </div>
                </div>

                <p className="mt-3 text-xs text-muted-foreground">
                    Leave both fields empty if you do not want to change your password.
                </p>
            </section>

            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {saving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Save className="h-4 w-4" />
                    )}

                    {saving ? "Saving..." : "Save Changes"}
                </button>
            </div>

            <DeleteAccountSection />
        </form>
    );
}

function InfoItem({ label, value }: { label: string; value?: string }) {
    return (
        <div className="rounded-lg border border-border bg-surface-secondary p-4">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-1 text-sm font-medium text-foreground">
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
    onAdd: () => void;
    onRemove: (index: number) => void;
    placeholder: string;
}) {
    return (
        <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
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
                    className="w-full rounded-lg border border-border bg-surface-secondary px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary"
                />

                {input.trim() && (
                    <button
                        type="button"
                        onClick={onAdd}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-primary transition hover:bg-accent hover:text-primary-hover"
                    >
                        <Plus className="h-5 w-5" />
                    </button>
                )}
            </div>

            {items.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                    {items.map((item, index) => (
                        <span
                            key={`${item}-${index}`}
                            className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface-secondary px-3 py-2 text-sm text-muted"
                        >
                            {item}

                            <button
                                type="button"
                                onClick={() => onRemove(index)}
                                className="text-muted-foreground transition hover:text-danger"
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