"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import { useUserStore } from "@/store/useUserStore";
import {
    AlertTriangle,
    Bell,
    Calendar,
    HeartPulse,
    Loader2,
    Lock,
    Mail,
    MapPin,
    Phone,
    Plus,
    Save,
    Shield,
    ShieldCheck,
    Stethoscope,
    Ticket,
    User,
    Weight,
    X,
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
    status: "pending" | "approved" | "payment_pending" | "active" | "revival_pending" | "lapsed" | "expired" | "rejected" | "cancelled";
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

            const existingPolicy = somaticPolicies.find((policy) => policy.policy_number === insurance.policy_number);
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

        setInsurance({ type: "", provider_name: "", policy_number: "", policy_holder_name: "" });
    };

    const handleSomaticPolicyChange = (policyNumber: string) => {
        const selectedPolicy = somaticPolicies.find((policy) => policy.policy_number === policyNumber);
        if (!selectedPolicy) return;

        setInsurance((prev) => ({ ...prev, type: "somatic", policy_number: selectedPolicy.policy_number }));
    };

    const addAllergy = () => {
        const value = allergyInput.trim();
        if (!value) return;

        if (!allergies.some((item) => item.toLowerCase() === value.toLowerCase())) {
            setAllergies((prev) => [...prev, value]);
        }

        setAllergyInput("");
    };

    const removeAllergy = (index: number) => setAllergies((prev) => prev.filter((_, i) => i !== index));

    const addDisease = () => {
        const value = diseaseInput.trim();
        if (!value) return;

        if (!diseases.some((item) => item.toLowerCase() === value.toLowerCase())) {
            setDiseases((prev) => [...prev, value]);
        }

        setDiseaseInput("");
    };

    const removeDisease = (index: number) => setDiseases((prev) => prev.filter((_, i) => i !== index));

    const patchProfile = async (payload: Record<string, unknown>) => {
        const res = await fetch("/api/users/profile", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Failed to update profile");
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
            const payload = insurance.type === "somatic"
                ? { insurance: { type: "somatic", policy_number: insurance.policy_number } }
                : insurance.type === "external"
                    ? { insurance: { type: "external", provider_name: insurance.provider_name, policy_number: insurance.policy_number, policy_holder_name: insurance.policy_holder_name } }
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

            setFormData((prev) => ({ ...prev, currentPassword: "", newPassword: "" }));
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
            <div className="flex min-h-[60vh] items-center justify-center">
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center p-4">
                <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-8 text-center shadow-sm">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10 text-warning">
                        <AlertTriangle className="h-6 w-6" />
                    </div>
                    <h2 className="mt-4 text-lg font-semibold text-foreground">Unable to load profile</h2>
                    <p className="mt-2 text-sm text-muted">Please refresh the page and try again.</p>
                </div>
            </div>
        );
    }

    const roleLabel = roleLabels[user.role] || user.role;
    const selectedSomaticPolicy = insurance.type === "somatic"
        ? somaticPolicies.find((policy) => policy.policy_number === insurance.policy_number) || null
        : null;

    return (
        <div className="mx-auto w-full max-w-6xl space-y-5 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
            <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                    <AvatarSelector
                        currentAvatarId={formData.avatar_id}
                        onSelect={(id) => setFormData((prev) => ({ ...prev, avatar_id: id }))}
                        isAdmin={user.role === "admin"}
                    />

                    <div className="min-w-0">
                        <p className="text-xs font-medium uppercase tracking-wider text-primary">Account</p>
                        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">Profile</h1>
                        <p className="mt-1 text-sm text-muted">Manage your personal information, medical details, insurance, and security.</p>

                        <div className="mt-3 flex flex-wrap gap-2">
                            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-accent px-3 py-1.5 text-xs font-medium text-accent-foreground">
                                <ShieldCheck className="h-3.5 w-3.5" />
                                {roleLabel}
                            </span>

                            <Link href="/tickets" className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-secondary px-3 py-1.5 text-xs font-medium text-muted transition hover:border-primary/30 hover:bg-accent hover:text-foreground">
                                <Ticket className="h-3.5 w-3.5 text-primary" />
                                Support Tickets
                            </Link>

                            <Link href="/notifications" className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-secondary px-3 py-1.5 text-xs font-medium text-muted transition hover:border-primary/30 hover:bg-accent hover:text-foreground">
                                <Bell className="h-3.5 w-3.5 text-primary" />
                                Notifications
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <ProfileSection title="General Information" description="Your basic personal and contact information." icon={<User className="h-5 w-5 text-primary" />}>
                <div className="grid gap-5 md:grid-cols-2">
                    <Field label="Username" icon={<User className="h-4 w-4" />}>
                        <input value={formData.username} onChange={(e) => updateField("username", e.target.value)} className={inputClass} />
                    </Field>

                    <Field label="Email" icon={<Mail className="h-4 w-4" />}>
                        <input type="email" value={user.email} disabled className={`${inputClass} cursor-not-allowed text-muted`} />
                    </Field>

                    <Field label="Contact Number" icon={<Phone className="h-4 w-4" />}>
                        <input type="tel" value={formData.contact_no} onChange={(e) => updateField("contact_no", e.target.value)} placeholder="10 digit mobile number" className={inputClass} />
                    </Field>

                    <Field label="Date of Birth" icon={<Calendar className="h-4 w-4" />}>
                        <input type="date" value={formData.date_of_birth} onChange={(e) => updateField("date_of_birth", e.target.value)} className={inputClass} />
                    </Field>

                    <Field label="Weight (kg)" icon={<Weight className="h-4 w-4" />}>
                        <input type="number" min="1" step="0.1" value={formData.weight_kg} onChange={(e) => updateField("weight_kg", e.target.value)} placeholder="e.g. 65" className={inputClass} />
                    </Field>

                    <InfoItem label="Member Since" value={formatDate(user.created_at)} />

                    <div className="md:col-span-2">
                        <Field label="Address" icon={<MapPin className="h-4 w-4" />}>
                            <textarea value={formData.address} onChange={(e) => updateField("address", e.target.value)} rows={3} placeholder="Enter your address" className={`${inputClass} resize-none py-3`} />
                        </Field>
                    </div>
                </div>

                <SectionSaveButton saving={generalSaving} label="Save Changes" onClick={handleGeneralSave} />
            </ProfileSection>

            {(user.role === "doctor" || user.role === "assistant_doctor") && user.doctor_info && (
                <ProfileSection title="Professional Information" description="Your professional information is managed by the system." icon={<Stethoscope className="h-5 w-5 text-primary" />}>
                    <div className="grid gap-4 md:grid-cols-2">
                        <InfoItem label="Registration Number" value={user.doctor_info.reg_no} />
                        <InfoItem label="Qualification" value={user.doctor_info.qualification} />
                        <InfoItem label="Experience" value={user.doctor_info.experience !== undefined ? `${user.doctor_info.experience} years` : undefined} />
                        <InfoItem label="Department" value={user.doctor_info.department_id ? String(user.doctor_info.department_id) : undefined} />
                        <InfoItem label="Case Acceptance" value={user.doctor_info.is_accepting_cases ? "Accepting Cases" : "Not Accepting Cases"} />
                    </div>
                </ProfileSection>
            )}

            {user.role === "patient" && (
                <ProfileSection title="Medical Profile" description="Keep your medical information updated for safer emergency assistance." icon={<HeartPulse className="h-5 w-5 text-primary" />}>
                    <div className="space-y-6">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-foreground">Blood Group</label>
                            <select value={bloodGrp} onChange={(e) => setBloodGrp(e.target.value)} className={inputClass}>
                                <option value="">Select blood group</option>
                                {bloodGroups.map((group) => <option key={group} value={group}>{group}</option>)}
                            </select>
                        </div>

                        <TagInput label="Known Allergies" items={allergies} input={allergyInput} setInput={setAllergyInput} onAdd={addAllergy} onRemove={removeAllergy} placeholder="e.g. Penicillin" />
                        <TagInput label="Chronic Diseases" items={diseases} input={diseaseInput} setInput={setDiseaseInput} onAdd={addDisease} onRemove={removeDisease} placeholder="e.g. Diabetes" />
                    </div>

                    <SectionSaveButton saving={medicalSaving} label="Save Medical Information" onClick={handleMedicalSave} />
                </ProfileSection>
            )}

            <ProfileSection title="Insurance" description="Manage your insurance information for emergency paperwork and assistance." icon={<Shield className="h-5 w-5 text-primary" />}>
                <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">Insurance Type</label>
                    <select value={insurance.type} onChange={(e) => handleInsuranceTypeChange(e.target.value)} disabled={policyLoading || insuranceSaving} className={`${inputClass} disabled:cursor-not-allowed disabled:opacity-60`}>
                        <option value="">No Insurance</option>
                        <option value="external">External Insurance</option>
                        <option value="somatic" disabled={!somaticPolicies.length}>SOMATIC Insurance{!somaticPolicies.length ? " (No Policy)" : ""}</option>
                    </select>
                </div>

                {insurance.type === "external" && (
                    <div className="mt-5 space-y-5">
                        <div className="grid gap-5 md:grid-cols-2">
                            <Field label="Insurance Provider">
                                <input type="text" value={insurance.provider_name} onChange={(e) => setInsurance((prev) => ({ ...prev, type: "external", provider_name: e.target.value }))} placeholder="e.g. Star Health" className={inputClass} />
                            </Field>

                            <Field label="Policy Number">
                                <input type="text" value={insurance.policy_number} onChange={(e) => setInsurance((prev) => ({ ...prev, type: "external", policy_number: e.target.value }))} placeholder="Enter policy number" className={inputClass} />
                            </Field>

                            <div className="md:col-span-2">
                                <Field label="Policy Holder Name">
                                    <input type="text" value={insurance.policy_holder_name} onChange={(e) => setInsurance((prev) => ({ ...prev, type: "external", policy_holder_name: e.target.value }))} placeholder="Enter policy holder name" className={inputClass} />
                                </Field>
                            </div>
                        </div>

                        <Notice type="warning" text="External insurance information is provided by you and is not verified by SOMATIC. Please make sure the information is accurate." />

                        <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface-secondary p-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm font-medium text-foreground">Want SOMATIC Insurance?</p>
                                <p className="mt-1 text-xs text-muted">View available SOMATIC insurance plans.</p>
                            </div>
                            <Link href="/patient/insurance" className="inline-flex justify-center rounded-lg border border-primary/20 bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground transition hover:bg-primary/10">
                                View SOMATIC Plans
                            </Link>
                        </div>
                    </div>
                )}

                {insurance.type === "somatic" && (
                    <div className="mt-5 space-y-5">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-foreground">Select SOMATIC Policy</label>
                            <select value={insurance.policy_number} onChange={(e) => handleSomaticPolicyChange(e.target.value)} disabled={insuranceSaving} className={`${inputClass} disabled:cursor-not-allowed disabled:opacity-60`}>
                                {somaticPolicies.map((policy) => (
                                    <option key={policy._id} value={policy.policy_number}>
                                        {policy.plan_id?.name || "SOMATIC Insurance"} — {policy.policy_number} — {formatStatus(policy.status)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {selectedSomaticPolicy ? (
                            <div className="rounded-xl border border-success/20 bg-success/5 p-5">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="flex gap-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-success/10 text-success">
                                            <ShieldCheck className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-foreground">{selectedSomaticPolicy.plan_id?.name || "SOMATIC Insurance"}</h3>
                                            <p className="mt-1 text-xs text-muted">Selected SOMATIC insurance policy.</p>
                                        </div>
                                    </div>

                                    <span className={`w-fit rounded-full px-3 py-1 text-xs font-medium ${selectedSomaticPolicy.status === "active" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>
                                        {formatStatus(selectedSomaticPolicy.status)}
                                    </span>
                                </div>

                                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                                    <InfoItem label="Policy Number" value={selectedSomaticPolicy.policy_number} />
                                    <InfoItem label="Plan" value={selectedSomaticPolicy.plan_id?.name} />
                                    <InfoItem label="Coverage" value={selectedSomaticPolicy.plan_id?.coverage_amount !== undefined ? `₹${selectedSomaticPolicy.plan_id.coverage_amount.toLocaleString("en-IN")}` : undefined} />
                                    <InfoItem label="Premium" value={selectedSomaticPolicy.plan_id?.premium_amount !== undefined ? `₹${selectedSomaticPolicy.plan_id.premium_amount.toLocaleString("en-IN")} / ${formatFrequency(selectedSomaticPolicy.plan_id.premium_frequency)}` : undefined} />
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

                                <div className="mt-5 flex gap-2 rounded-lg bg-success/10 px-3 py-2.5 text-xs text-success">
                                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
                                    <span>This policy is linked to your SOMATIC account and its details cannot be edited from your profile.</span>
                                </div>
                            </div>
                        ) : (
                            <Notice type="warning" title="No SOMATIC policy selected" text="Select a SOMATIC policy from the list above." />
                        )}
                    </div>
                )}

                {!insurance.type && (
                    <div className="mt-5 flex flex-col gap-4 rounded-xl border border-border bg-surface-secondary p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm font-medium text-foreground">No insurance selected</p>
                            <p className="mt-1 text-xs text-muted">Add external insurance details or get a SOMATIC insurance plan.</p>
                        </div>
                        <Link href="/patient/insurance" className="inline-flex justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary-hover">
                            Get SOMATIC Insurance
                        </Link>
                    </div>
                )}

                <SectionSaveButton saving={insuranceSaving} label="Save Insurance" onClick={handleInsuranceSave} />
            </ProfileSection>

            <ProfileSection title="Security" description="Change your account password and manage notification permissions." icon={<Lock className="h-5 w-5 text-primary" />}>
                <div className="grid gap-5 md:grid-cols-2">
                    <Field label="Current Password">
                        <input type="password" value={formData.currentPassword} onChange={(e) => updateField("currentPassword", e.target.value)} placeholder="Enter current password" className={inputClass} />
                    </Field>

                    <Field label="New Password">
                        <input type="password" value={formData.newPassword} onChange={(e) => updateField("newPassword", e.target.value)} placeholder="Enter new password" className={inputClass} />
                    </Field>
                </div>

                <p className="mt-3 text-xs text-muted">Leave both fields empty if you do not want to change your password.</p>

                <SectionSaveButton saving={passwordSaving} label="Change Password" onClick={handlePasswordSave} />

                <div className="mt-6 flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm font-medium text-foreground">Push Notifications</p>
                        <p className="mt-1 max-w-xl text-xs leading-5 text-muted">
                            Allow SOMATIC to send important healthcare updates, reminders, and alerts.
                        </p>
                    </div>
                    <NotificationPermissionButton />
                </div>
            </ProfileSection>

            <DeleteAccountSection />
        </div>
    );
}

const inputClass = "w-full rounded-lg border border-border bg-surface-secondary px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/10";

function ProfileSection({ title, description, icon, children }: { title: string; description: string; icon: React.ReactNode; children: React.ReactNode }) {
    return (
        <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
            <div className="mb-6 flex items-start gap-3 border-b border-border pb-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent">
                    {icon}
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-foreground">{title}</h2>
                    <p className="mt-1 text-sm text-muted">{description}</p>
                </div>
            </div>
            {children}
        </section>
    );
}

function Field({ label, icon, children }: { label: string; icon?: React.ReactNode; children: React.ReactNode }) {
    return (
        <div>
            <label className="mb-2 block text-sm font-medium text-foreground">{label}</label>
            {icon ? (
                <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</span>
                    <div className="[&>input]:pl-10">{children}</div>
                </div>
            ) : children}
        </div>
    );
}

function SectionSaveButton({ saving, label, onClick }: { saving: boolean; label: string; onClick: () => void }) {
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

function TagInput({ label, items, input, setInput, onAdd, onRemove, placeholder }: {
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
                    className={`${inputClass} pr-12`}
                />

                {input.trim() && (
                    <button type="button" onClick={onAdd} aria-label={`Add ${label.toLowerCase()}`} className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-primary transition hover:bg-accent">
                        <Plus className="h-5 w-5" />
                    </button>
                )}
            </div>

            {items.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                    {items.map((item, index) => (
                        <span key={`${item}-${index}`} className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface-secondary px-3 py-2 text-sm text-muted">
                            {item}
                            <button type="button" onClick={() => onRemove(index)} aria-label={`Remove ${item}`} className="text-muted-foreground transition hover:text-danger">
                                <X className="h-4 w-4" />
                            </button>
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}

function Notice({ type, title, text }: { type: "warning" | "info"; title?: string; text: string }) {
    const warning = type === "warning";

    return (
        <div className={`rounded-xl border p-4 ${warning ? "border-warning/20 bg-warning/10" : "border-primary/20 bg-accent"}`}>
            <div className="flex gap-3">
                <AlertTriangle className={`mt-0.5 h-5 w-5 shrink-0 ${warning ? "text-warning" : "text-primary"}`} />
                <div>
                    {title && <p className={`text-sm font-medium ${warning ? "text-warning" : "text-foreground"}`}>{title}</p>}
                    <p className={`text-xs leading-5 ${title ? "mt-1" : ""} ${warning ? "text-warning/80" : "text-muted"}`}>{text}</p>
                </div>
            </div>
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