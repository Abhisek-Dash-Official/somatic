"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
    Award,
    BriefcaseMedical,
    CheckCircle,
    FileText,
    Loader2,
    Lock,
    MapPin,
    Phone,
    ShieldCheck,
    User,
} from "lucide-react";
import { useUserStore } from "@/store/useUserStore";
import AvatarSelector from "@/components/profile/AvatarSelector";
import DeleteAccountSection from "@/components/profile/DeleteAccountSection";

export default function DoctorProfileClient() {
    const { user, isFetched, fetchUser } = useUserStore();
    const [loadingProfile, setLoadingProfile] = useState(false);
    const [loadingPassword, setLoadingPassword] = useState(false);

    const [profileData, setProfileData] = useState({
        username: "",
        contact_no: "",
        address: "",
        reg_no: "",
        qualification: "",
        experience: 0,
        avatar_id: "1",
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    useEffect(() => {
        if (user && (user.role === "doctor" || user.role === "assistant_doctor")) {
            setProfileData({
                username: user.username || "",
                contact_no: user.contact_no || "",
                address: user.address || "",
                reg_no: user.doctor_info?.reg_no || "",
                qualification: user.doctor_info?.qualification || "",
                experience: user.doctor_info?.experience || 0,
                avatar_id: user.avatar_id || "1",
            });
        }
    }, [user]);

    if (!isFetched) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoadingProfile(true);

        const payload = {
            username: profileData.username,
            contact_no: profileData.contact_no,
            address: profileData.address,
            avatar_id: profileData.avatar_id,
            doctor_info: {
                reg_no: profileData.reg_no,
                qualification: profileData.qualification,
                experience: Number(profileData.experience),
            },
        };

        try {
            const res = await fetch("/api/users/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                toast.success("Profile updated successfully!");
                fetchUser(true);
            } else {
                const data = await res.json();
                toast.error(data.error || "Failed to update profile");
            }
        } catch {
            toast.error("Network error. Please try again.");
        } finally {
            setLoadingProfile(false);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error("New passwords do not match!");
            return;
        }

        setLoadingPassword(true);

        try {
            const res = await fetch("/api/users/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword,
                }),
            });

            if (res.ok) {
                toast.success("Password changed successfully!");
                setPasswordData({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                });
            } else {
                const data = await res.json();
                toast.error(data.error || "Failed to change password");
            }
        } catch {
            toast.error("Network error. Please try again.");
        } finally {
            setLoadingPassword(false);
        }
    };

    const inputClass =
        "w-full rounded-xl border border-border bg-surface-secondary py-3 pl-10 pr-4 text-foreground placeholder:text-muted-foreground outline-none transition focus:border-primary/50 focus:ring-4 focus:ring-primary/10";

    const passwordInputClass =
        "w-full rounded-xl border border-border bg-surface-secondary px-4 py-3 text-foreground placeholder:text-muted-foreground outline-none transition focus:border-primary/50 focus:ring-4 focus:ring-primary/10";

    return (
        <div className="mx-auto max-w-4xl space-y-6">
            <div className="flex flex-col items-center gap-6 rounded-2xl border border-border bg-surface p-6 sm:p-8 md:flex-row">
                <div className="shrink-0">
                    <AvatarSelector
                        currentAvatarId={profileData.avatar_id}
                        onSelect={(id) =>
                            setProfileData({
                                ...profileData,
                                avatar_id: id,
                            })
                        }
                        isAdmin={false}
                    />
                </div>

                <div className="text-center md:text-left">
                    <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">
                        Dr. {profileData.username || "Profile"}
                    </h1>

                    <p className="mt-2 flex items-center justify-center gap-2 text-sm capitalize text-muted md:justify-start">
                        <ShieldCheck className="h-4 w-4 text-primary" />
                        Verified Medical Professional
                    </p>
                </div>
            </div>

            <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
                <div className="mb-6 flex items-center gap-3 border-b border-border pb-4">
                    <BriefcaseMedical className="h-6 w-6 text-primary" />
                    <h2 className="text-xl font-semibold text-foreground">Professional Details</h2>
                </div>

                <form onSubmit={handleProfileSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <ProfileField label="Username" icon={<User className="h-5 w-5" />}>
                            <input
                                type="text"
                                required
                                value={profileData.username}
                                onChange={(e) =>
                                    setProfileData({
                                        ...profileData,
                                        username: e.target.value,
                                    })
                                }
                                className={inputClass}
                            />
                        </ProfileField>

                        <ProfileField label="Contact Number" icon={<Phone className="h-5 w-5" />}>
                            <input
                                type="text"
                                required
                                value={profileData.contact_no}
                                onChange={(e) =>
                                    setProfileData({
                                        ...profileData,
                                        contact_no: e.target.value,
                                    })
                                }
                                className={inputClass}
                            />
                        </ProfileField>

                        <ProfileField
                            label="Clinic / Hospital Address"
                            icon={<MapPin className="h-5 w-5" />}
                            className="md:col-span-2"
                            iconClass="top-4 -translate-y-0"
                        >
                            <textarea
                                rows={2}
                                required
                                value={profileData.address}
                                onChange={(e) =>
                                    setProfileData({
                                        ...profileData,
                                        address: e.target.value,
                                    })
                                }
                                className={`${inputClass} resize-none`}
                            />
                        </ProfileField>

                        <ProfileField
                            label="Medical Registration No."
                            icon={<FileText className="h-5 w-5" />}
                        >
                            <input
                                type="text"
                                required
                                value={profileData.reg_no}
                                onChange={(e) =>
                                    setProfileData({
                                        ...profileData,
                                        reg_no: e.target.value,
                                    })
                                }
                                className={inputClass}
                            />
                        </ProfileField>

                        <ProfileField
                            label="Qualifications"
                            icon={<Award className="h-5 w-5" />}
                        >
                            <input
                                type="text"
                                required
                                value={profileData.qualification}
                                onChange={(e) =>
                                    setProfileData({
                                        ...profileData,
                                        qualification: e.target.value,
                                    })
                                }
                                className={inputClass}
                                placeholder="e.g. MBBS, MD (Medicine)"
                            />
                        </ProfileField>

                        <ProfileField
                            label="Experience (Years)"
                            icon={<ShieldCheck className="h-5 w-5" />}
                        >
                            <input
                                type="number"
                                min="0"
                                required
                                value={profileData.experience}
                                onChange={(e) =>
                                    setProfileData({
                                        ...profileData,
                                        experience: Number(e.target.value),
                                    })
                                }
                                className={inputClass}
                            />
                        </ProfileField>
                    </div>

                    <div className="flex justify-end border-t border-border pt-4">
                        <button
                            type="submit"
                            disabled={loadingProfile}
                            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition hover:bg-primary-hover disabled:opacity-50"
                        >
                            {loadingProfile ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <CheckCircle className="h-5 w-5" />
                            )}
                            Save Profile
                        </button>
                    </div>
                </form>
            </div>

            <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
                <div className="mb-6 flex items-center gap-3 border-b border-border pb-4">
                    <Lock className="h-6 w-6 text-danger" />
                    <h2 className="text-xl font-semibold text-foreground">
                        Security & Password
                    </h2>
                </div>

                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="space-y-1 md:col-span-2">
                            <label className="text-sm font-medium text-muted">
                                Current Password
                            </label>

                            <input
                                type="password"
                                required
                                value={passwordData.currentPassword}
                                onChange={(e) =>
                                    setPasswordData({
                                        ...passwordData,
                                        currentPassword: e.target.value,
                                    })
                                }
                                className={passwordInputClass}
                                placeholder="••••••••"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-muted">
                                New Password
                            </label>

                            <input
                                type="password"
                                required
                                minLength={6}
                                value={passwordData.newPassword}
                                onChange={(e) =>
                                    setPasswordData({
                                        ...passwordData,
                                        newPassword: e.target.value,
                                    })
                                }
                                className={passwordInputClass}
                                placeholder="••••••••"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-muted">
                                Confirm New Password
                            </label>

                            <input
                                type="password"
                                required
                                minLength={6}
                                value={passwordData.confirmPassword}
                                onChange={(e) =>
                                    setPasswordData({
                                        ...passwordData,
                                        confirmPassword: e.target.value,
                                    })
                                }
                                className={passwordInputClass}
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={loadingPassword}
                            className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface-secondary px-6 py-3 font-semibold text-muted transition hover:border-danger/20 hover:bg-danger/10 hover:text-danger disabled:opacity-50"
                        >
                            {loadingPassword ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                "Update Password"
                            )}
                        </button>
                    </div>
                </form>
            </div>

            <DeleteAccountSection />
        </div>
    );
}

function ProfileField({
    label,
    icon,
    children,
    className = "",
    iconClass = "",
}: {
    label: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    className?: string;
    iconClass?: string;
}) {
    return (
        <div className={`space-y-1 ${className}`}>
            <label className="text-sm font-medium text-muted">{label}</label>

            <div className="relative">
                <span
                    className={`absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground ${iconClass}`}
                >
                    {icon}
                </span>
                {children}
            </div>
        </div>
    );
}