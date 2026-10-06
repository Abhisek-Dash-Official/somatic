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
    Ticket,
    Bell,
} from "lucide-react";
import NotificationPermissionButton from "@/components/ui/NotificationPermissionButton";
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

interface SomaticPlan {
    name?: string;
    description?: string;
    coverage_amount?: number;
    premium_amount?: number;
    premium_frequency?: string;
    features?: string[];
}

interface SomaticPolicy {
    _id: string;
    policy_number: string;
    start_date?: string;
    expiry_date?: string;
    status:
    | "pending"
    | "approved"
    | "payment_pending"
    | "active"
    | "revival_pending"
    | "lapsed"
    | "expired"
    | "rejected"
    | "cancelled";
    plan_id?: SomaticPlan;
}

interface InsuranceState {
    type: "" | "somatic" | "external";
    provider_name: string;
    policy_number: string;
    policy_holder_name: string;
}

export default function Profile() {
    const { user, fetchUser, isLoading } = useUserStore();

    const [generalSaving, setGeneralSaving] = useState(false);
    const [medicalSaving, setMedicalSaving] = useState(false);
    const [insuranceSaving, setInsuranceSaving] = useState(false);
    const [passwordSaving, setPasswordSaving] = useState(false);
    const [policyLoading, setPolicyLoading] = useState(false);
    const [somaticPolicies, setSomaticPolicies] = useState<SomaticPolicy[]>([]);

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

    const [insurance, setInsurance] = useState<InsuranceState>({
        type: "",
        provider_name: "",
        policy_number: "",
        policy_holder_name: "",
    });

    const fetchProfileData = async () => {
        try {
            setPolicyLoading(true);

            const res = await fetch("/api/users/profile", { cache: "no-store" });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Failed to fetch profile data");

            const profile = data.profile;
            const policies: SomaticPolicy[] = data.somatic_policies || [];

            setSomaticPolicies(policies);

            if (!profile) return;

            setFormData((prev) => ({
                ...prev,
                username: profile.username || "",
                contact_no: profile.contact_no || "",
                address: profile.address || "",
                date_of_birth: profile.date_of_birth ? new Date(profile.date_of_birth).toISOString().split("T")[0] : "",
                weight_kg: profile.weight_kg?.toString() || "",
                avatar_id: profile.avatar_id || "1",
            }));

            setBloodGrp(profile.patient_info?.blood_grp || "");
            setAllergies(profile.patient_info?.known_allergies || []);
            setDiseases(profile.patient_info?.chronic_diseases || []);

            const savedInsurance = profile.insurance;

            if (savedInsurance?.type === "somatic") {
                const savedPolicy = policies.find((policy) => policy.policy_number === savedInsurance.policy_number);

                setInsurance({
                    type: "somatic",
                    provider_name: "",
                    policy_number: savedPolicy?.policy_number || savedInsurance.policy_number || policies[0]?.policy_number || "",
                    policy_holder_name: "",
                });
            } else if (savedInsurance?.type === "external") {
                setInsurance({
                    type: "external",
                    provider_name: savedInsurance.provider_name || "",
                    policy_number: savedInsurance.policy_number || "",
                    policy_holder_name: savedInsurance.policy_holder_name || "",
                });
            } else {
                setInsurance({
                    type: "",
                    provider_name: "",
                    policy_number: "",
                    policy_holder_name: "",
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
            if (!somaticPolicies.length) {
                toast.error("No SOMATIC insurance policy is linked to your account.");
                return;
            }

            const existingPolicy = somaticPolicies.find(
                (policy) => policy.policy_number === insurance.policy_number,
            );

            const selectedPolicy = existingPolicy || somaticPolicies[0];

            setInsurance({
                type: "somatic",
                provider_name: "",
                policy_number: selectedPolicy.policy_number,
                policy_holder_name: "",
            });
            return;
        }

        if (type === "external") {
            setInsurance((prev) => ({
                type: "external",
                provider_name: prev.provider_name,
                policy_number: prev.policy_number,
                policy_holder_name: prev.policy_holder_name,
            }));
            return;
        }

        setInsurance({
            type: "",
            provider_name: "",
            policy_number: "",
            policy_holder_name: "",
        });
    };

    const handleSomaticPolicyChange = (policyNumber: string) => {
        const selectedPolicy = somaticPolicies.find(
            (policy) => policy.policy_number === policyNumber,
        );

        if (!selectedPolicy) return;

        setInsurance((prev) => ({
            ...prev,
            type: "somatic",
            policy_number: selectedPolicy.policy_number,
        }));
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

    const patchProfile = async (payload: Record<string, unknown>) => {
        const res = await fetch("/api/users/profile", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || "Failed to update profile");
        }

        return data;
    };

    const handleGeneralSave = async () => {
        setGeneralSaving(true);

        try {
            const data = await patchProfile({
                username: formData.username,
                contact_no: formData.contact_no,
                address: formData.address,
                date_of_birth: formData.date_of_birth || null,
                weight_kg: formData.weight_kg || null,
                avatar_id: formData.avatar_id,
            });

            toast.success(data.message || "General information saved successfully.");
            await fetchUser(true);
            await fetchProfileData();
        } catch (error) {
            console.error("General profile update error:", error);
            toast.error(error instanceof Error ? error.message : "Failed to save general information.");
        } finally {
            setGeneralSaving(false);
        }
    };

    const handleMedicalSave = async () => {
        setMedicalSaving(true);

        try {
            const data = await patchProfile({
                patient_info: {
                    blood_grp: bloodGrp || undefined,
                    known_allergies: allergies,
                    chronic_diseases: diseases,
                },
            });

            toast.success(data.message || "Medical information saved successfully.");
            await fetchUser(true);
            await fetchProfileData();
        } catch (error) {
            console.error("Medical profile update error:", error);
            toast.error(error instanceof Error ? error.message : "Failed to save medical information.");
        } finally {
            setMedicalSaving(false);
        }
    };

    const handleInsuranceSave = async () => {
        if (insurance.type === "somatic" && !insurance.policy_number) {
            toast.error("Please select a SOMATIC insurance policy.");
            return;
        }

        if (insurance.type === "external") {
            if (!insurance.provider_name.trim()) {
                toast.error("Please enter the insurance provider.");
                return;
            }

            if (!insurance.policy_number.trim()) {
                toast.error("Please enter the policy number.");
                return;
            }

            if (!insurance.policy_holder_name.trim()) {
                toast.error("Please enter the policy holder name.");
                return;
            }
        }

        setInsuranceSaving(true);

        try {
            const payload =
                insurance.type === "somatic"
                    ? {
                        insurance: {
                            type: "somatic",
                            policy_number: insurance.policy_number,
                        },
                    }
                    : insurance.type === "external"
                        ? {
                            insurance: {
                                type: "external",
                                provider_name: insurance.provider_name,
                                policy_number: insurance.policy_number,
                                policy_holder_name: insurance.policy_holder_name,
                            },
                        }
                        : { insurance: null };

            const data = await patchProfile(payload);

            toast.success(data.message || "Insurance information saved successfully.");
            await fetchUser(true);
            await fetchProfileData();
        } catch (error) {
            console.error("Insurance update error:", error);
            toast.error(error instanceof Error ? error.message : "Failed to save insurance information.");
        } finally {
            setInsuranceSaving(false);
        }
    };

    const handlePasswordSave = async () => {
        if (!formData.currentPassword && !formData.newPassword) {
            toast.info("Enter your current and new password to change your password.");
            return;
        }

        if (!formData.currentPassword || !formData.newPassword) {
            toast.error("Both current password and new password are required.");
            return;
        }

        setPasswordSaving(true);

        try {
            const data = await patchProfile({
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword,
            });

            toast.success(data.message || "Password changed successfully.");

            setFormData((prev) => ({
                ...prev,
                currentPassword: "",
                newPassword: "",
            }));

            await fetchUser(true);
        } catch (error) {
            console.error("Password update error:", error);
            toast.error(error instanceof Error ? error.message : "Failed to change password.");
        } finally {
            setPasswordSaving(false);
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

    const selectedSomaticPolicy =
        insurance.type === "somatic"
            ? somaticPolicies.find((policy) => policy.policy_number === insurance.policy_number) || null
            : null;

    return (
        <div className="space-y-6">
            <div className="rounded-xl border border-border bg-surface p-6">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                    <AvatarSelector
                        currentAvatarId={formData.avatar_id}
                        onSelect={(id) => setFormData((prev) => ({ ...prev, avatar_id: id }))}
                        isAdmin={user.role === "admin"}
                    />

                    <div>
                        <h1 className="text-2xl font-semibold text-foreground">Profile</h1>

                        <p className="mt-1 text-sm text-muted">
                            Manage your personal information and account settings.
                        </p>

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
                                <ShieldCheck className="h-3.5 w-3.5" />
                                {roleLabel}
                            </div>

                            <Link
                                href="/tickets"
                                className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-secondary px-3 py-1 text-xs font-medium text-muted transition hover:border-primary/30 hover:bg-accent hover:text-foreground"
                            >
                                <Ticket className="h-3.5 w-3.5 text-primary" />
                                Support Tickets
                            </Link>

                            <Link
                                href="/notifications"
                                className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-secondary px-3 py-1 text-xs font-medium text-muted transition hover:border-primary/30 hover:bg-accent hover:text-foreground"
                            >
                                <Bell className="h-3.5 w-3.5 text-primary" />
                                Notifications
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <section className="rounded-xl border border-border bg-surface p-6">
                <SectionHeader
                    icon={<User className="h-5 w-5 text-primary" />}
                    title="General Information"
                    description="Your basic personal and contact information."
                />

                <div className="grid gap-5 md:grid-cols-2">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-foreground">Username</label>
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
                        <label className="mb-2 block text-sm font-medium text-foreground">Email</label>
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
                        <label className="mb-2 block text-sm font-medium text-foreground">Contact Number</label>
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
                        <label className="mb-2 block text-sm font-medium text-foreground">Date of Birth</label>
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
                        <label className="mb-2 block text-sm font-medium text-foreground">Weight (kg)</label>
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
                        <label className="mb-2 block text-sm font-medium text-foreground">Address</label>
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

                <SectionSaveButton
                    saving={generalSaving}
                    label="Save Changes"
                    onClick={handleGeneralSave}
                />
            </section>

            {(user.role === "doctor" || user.role === "assistant_doctor") && user.doctor_info && (
                <section className="rounded-xl border border-border bg-surface p-6">
                    <SectionHeader
                        icon={<Stethoscope className="h-5 w-5 text-primary" />}
                        title="Professional Information"
                        description="Your professional information is managed by the system."
                    />

                    <div className="grid gap-5 md:grid-cols-2">
                        <InfoItem label="Registration Number" value={user.doctor_info.reg_no} />
                        <InfoItem label="Qualification" value={user.doctor_info.qualification} />
                        <InfoItem
                            label="Experience"
                            value={user.doctor_info.experience !== undefined ? `${user.doctor_info.experience} years` : undefined}
                        />
                        <InfoItem
                            label="Department"
                            value={user.doctor_info.department_id ? String(user.doctor_info.department_id) : undefined}
                        />
                        <InfoItem
                            label="Case Acceptance"
                            value={user.doctor_info.is_accepting_cases ? "Accepting Cases" : "Not Accepting Cases"}
                        />
                    </div>
                </section>
            )}

            {user.role === "patient" && (
                <section className="rounded-xl border border-border bg-surface p-6">
                    <SectionHeader
                        icon={<HeartPulse className="h-5 w-5 text-primary" />}
                        title="Medical Profile"
                        description="Keep your medical information updated for safer emergency assistance."
                    />

                    <div className="space-y-6">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-foreground">Blood Group</label>
                            <select
                                value={bloodGrp}
                                onChange={(e) => setBloodGrp(e.target.value)}
                                className="w-full rounded-lg border border-border bg-surface-secondary px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary"
                            >
                                <option value="">Select blood group</option>
                                {bloodGroups.map((group) => (
                                    <option key={group} value={group}>{group}</option>
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

                    <SectionSaveButton
                        saving={medicalSaving}
                        label="Save Medical Information"
                        onClick={handleMedicalSave}
                    />
                </section>
            )}

            <section className="rounded-xl border border-border bg-surface p-6">
                <SectionHeader
                    icon={<Shield className="h-5 w-5 text-primary" />}
                    title="Insurance"
                    description="Manage your insurance information for emergency paperwork and assistance."
                />

                <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">Insurance Type</label>

                    <select
                        value={insurance.type}
                        onChange={(e) => handleInsuranceTypeChange(e.target.value)}
                        disabled={policyLoading || insuranceSaving}
                        className="w-full rounded-lg border border-border bg-surface-secondary px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <option value="">No Insurance</option>
                        <option value="external">External Insurance</option>
                        <option value="somatic" disabled={!somaticPolicies.length}>
                            SOMATIC Insurance{!somaticPolicies.length ? " (No Policy)" : ""}
                        </option>
                    </select>
                </div>

                {insurance.type === "external" && (
                    <div className="mt-5 space-y-5">
                        <div className="grid gap-5 md:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-foreground">Insurance Provider</label>
                                <input
                                    type="text"
                                    value={insurance.provider_name}
                                    onChange={(e) => setInsurance((prev) => ({ ...prev, type: "external", provider_name: e.target.value }))}
                                    placeholder="e.g. Star Health"
                                    className="w-full rounded-lg border border-border bg-surface-secondary px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-foreground">Policy Number</label>
                                <input
                                    type="text"
                                    value={insurance.policy_number}
                                    onChange={(e) => setInsurance((prev) => ({ ...prev, type: "external", policy_number: e.target.value }))}
                                    placeholder="Enter policy number"
                                    className="w-full rounded-lg border border-border bg-surface-secondary px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="mb-2 block text-sm font-medium text-foreground">Policy Holder Name</label>
                                <input
                                    type="text"
                                    value={insurance.policy_holder_name}
                                    onChange={(e) => setInsurance((prev) => ({ ...prev, type: "external", policy_holder_name: e.target.value }))}
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
                                <p className="text-sm font-medium text-foreground">Want SOMATIC Insurance?</p>
                                <p className="mt-1 text-xs text-muted">View available SOMATIC insurance plans.</p>
                            </div>

                            <Link
                                href="/patient/insurance"
                                className="inline-flex shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition hover:bg-primary/10"
                            >
                                View SOMATIC Plans
                            </Link>
                        </div>
                    </div>
                )}

                {insurance.type === "somatic" && (
                    <div className="mt-5 space-y-5">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-foreground">Select SOMATIC Policy</label>

                            <select
                                value={insurance.policy_number}
                                onChange={(e) => handleSomaticPolicyChange(e.target.value)}
                                disabled={insuranceSaving}
                                className="w-full rounded-lg border border-border bg-surface-secondary px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {somaticPolicies.map((policy) => (
                                    <option key={policy._id} value={policy.policy_number}>
                                        {policy.plan_id?.name || "SOMATIC Insurance"} — {policy.policy_number} — {formatStatus(policy.status)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {selectedSomaticPolicy ? (
                            <div className="rounded-lg border border-success/20 bg-success/5 p-5">
                                <div className="mb-5 flex items-start justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <ShieldCheck className="h-5 w-5 text-success" />
                                            <h3 className="font-medium text-foreground">
                                                {selectedSomaticPolicy.plan_id?.name || "SOMATIC Insurance"}
                                            </h3>
                                        </div>

                                        <p className="mt-1 text-xs text-muted">Selected SOMATIC insurance policy.</p>
                                    </div>

                                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${selectedSomaticPolicy.status === "active" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>
                                        {formatStatus(selectedSomaticPolicy.status)}
                                    </span>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <InfoItem label="Policy Number" value={selectedSomaticPolicy.policy_number} />
                                    <InfoItem label="Plan" value={selectedSomaticPolicy.plan_id?.name} />
                                    <InfoItem
                                        label="Coverage"
                                        value={selectedSomaticPolicy.plan_id?.coverage_amount !== undefined ? `₹${selectedSomaticPolicy.plan_id.coverage_amount.toLocaleString("en-IN")}` : undefined}
                                    />
                                    <InfoItem
                                        label="Premium"
                                        value={
                                            selectedSomaticPolicy.plan_id?.premium_amount !== undefined
                                                ? `₹${selectedSomaticPolicy.plan_id.premium_amount.toLocaleString("en-IN")} / ${formatFrequency(selectedSomaticPolicy.plan_id.premium_frequency)}`
                                                : undefined
                                        }
                                    />
                                    <InfoItem label="Valid From" value={formatDate(selectedSomaticPolicy.start_date)} />
                                    <InfoItem label="Valid Until" value={formatDate(selectedSomaticPolicy.expiry_date)} />
                                </div>

                                {selectedSomaticPolicy.plan_id?.features?.length ? (
                                    <div className="mt-5 border-t border-border pt-5">
                                        <p className="mb-3 text-sm font-medium text-foreground">Plan Features</p>

                                        <div className="flex flex-wrap gap-2">
                                            {selectedSomaticPolicy.plan_id.features.map((feature, index) => (
                                                <span key={`${feature}-${index}`} className="rounded-full border border-border bg-surface-secondary px-3 py-1.5 text-xs text-muted">
                                                    {feature}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ) : null}

                                <div className="mt-5 flex items-center gap-2 rounded-lg bg-success/10 px-3 py-2.5 text-xs text-success">
                                    <ShieldCheck className="h-4 w-4 shrink-0" />
                                    This policy is linked to your SOMATIC account and its details cannot be edited from your profile.
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-lg border border-warning/20 bg-warning/10 p-4">
                                <div className="flex gap-3">
                                    <AlertTriangle className="mt-0.5 h-5 w-5 text-warning" />
                                    <div>
                                        <p className="text-sm font-medium text-warning">No SOMATIC policy selected</p>
                                        <p className="mt-1 text-xs leading-5 text-warning/70">Select a SOMATIC policy from the list above.</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {!insurance.type && (
                    <div className="mt-5 flex flex-col gap-4 rounded-lg border border-border bg-surface-secondary p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm font-medium text-foreground">No insurance selected</p>
                            <p className="mt-1 text-xs text-muted">Add external insurance details or get a SOMATIC insurance plan.</p>
                        </div>

                        <Link
                            href="/patient/insurance"
                            className="inline-flex shrink-0 items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary-hover"
                        >
                            Get SOMATIC Insurance
                        </Link>
                    </div>
                )}

                <SectionSaveButton
                    saving={insuranceSaving}
                    label="Save Insurance"
                    onClick={handleInsuranceSave}
                />
            </section>

            <section className="rounded-xl border border-border bg-surface p-6">
                <SectionHeader
                    icon={<Lock className="h-5 w-5 text-primary" />}
                    title="Security"
                    description="Change your account password."
                />

                <div className="grid gap-5 md:grid-cols-2">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-foreground">Current Password</label>
                        <input
                            type="password"
                            value={formData.currentPassword}
                            onChange={(e) => updateField("currentPassword", e.target.value)}
                            placeholder="Enter current password"
                            className="w-full rounded-lg border border-border bg-surface-secondary px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-foreground">New Password</label>
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

                <SectionSaveButton
                    saving={passwordSaving}
                    label="Change Password"
                    onClick={handlePasswordSave}
                />

                <div className="mt-6 border-t border-border pt-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm font-medium text-foreground">Push Notifications</p>
                            <p className="mt-1 text-xs leading-5 text-muted">
                                Allow SOMATIC to send you important healthcare updates, reminders, and alerts.
                            </p>
                        </div>

                        <NotificationPermissionButton />
                    </div>
                </div>
            </section>

            <DeleteAccountSection />
        </div>
    );
}

function SectionHeader({
    icon,
    title,
    description,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <div className="mb-6">
            <div className="flex items-center gap-2">
                {icon}
                <h2 className="text-lg font-semibold text-foreground">{title}</h2>
            </div>

            <p className="mt-1 text-sm text-muted">{description}</p>
        </div>
    );
}

function SectionSaveButton({
    saving,
    label,
    onClick,
}: {
    saving: boolean;
    label: string;
    onClick: () => void;
}) {
    return (
        <div className="mt-6 flex justify-end border-t border-border pt-5">
            <button
                type="button"
                onClick={onClick}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? "Saving..." : label}
            </button>
        </div>
    );
}

function InfoItem({ label, value }: { label: string; value?: string }) {
    return (
        <div className="rounded-lg border border-border bg-surface-secondary p-4">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-1 text-sm font-medium text-foreground">{value || "Not provided"}</p>
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
            <label className="mb-2 block text-sm font-medium text-foreground">{label}</label>

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
    return status.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatFrequency(frequency?: string) {
    if (!frequency) return "period";
    return frequency.replace("_", "-");
}