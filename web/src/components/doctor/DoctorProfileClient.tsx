"use client";

import { useEffect, useState } from "react";
import { useUserStore } from "@/store/useUserStore";
import { toast } from "react-toastify";
import {
    User,
    Phone,
    MapPin,
    FileText,
    Award,
    ShieldCheck,
    Lock,
    Loader2,
    CheckCircle,
    BriefcaseMedical,
} from "lucide-react";
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
        if (
            user &&
            (user.role === "doctor" || user.role === "assistant_doctor")
        ) {
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
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        );
    }

    const handleProfileSubmit = async (
        e: React.SubmitEvent<HTMLFormElement>,
    ) => {
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
        } catch (error) {
            toast.error("Network error. Please try again.");
        } finally {
            setLoadingProfile(false);
        }
    };

    const handlePasswordSubmit = async (
        e: React.SubmitEvent<HTMLFormElement>,
    ) => {
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
        } catch (error) {
            toast.error("Network error. Please try again.");
        } finally {
            setLoadingPassword(false);
        }
    };

    const inputClass =
        "w-full bg-surface-secondary border border-border rounded-xl py-3 pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition";

    const passwordInputClass =
        "w-full bg-surface-secondary border border-border rounded-xl py-3 px-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition";

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
            <div className="rounded-xl border border-border bg-surface p-8 flex flex-col md:flex-row items-center gap-6">
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
                    <h1 className="text-3xl font-bold text-foreground mb-2">
                        Dr. {profileData.username || "Profile"}
                    </h1>

                    <p className="text-muted flex items-center justify-center md:justify-start gap-2 capitalize">
                        <ShieldCheck className="h-4 w-4 text-primary" />
                        Verified Medical Professional
                    </p>
                </div>
            </div>

            <div className="bg-surface border border-border rounded-xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6 border-b border-border pb-4">
                    <BriefcaseMedical className="w-6 h-6 text-primary" />
                    <h2 className="text-xl font-bold text-foreground">
                        Professional Details
                    </h2>
                </div>

                <form onSubmit={handleProfileSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-muted">
                                Username
                            </label>

                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
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
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-muted">
                                Contact Number
                            </label>

                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
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
                            </div>
                        </div>

                        <div className="space-y-1 md:col-span-2">
                            <label className="text-sm font-medium text-muted">
                                Clinic / Hospital Address
                            </label>

                            <div className="relative">
                                <MapPin className="absolute left-3 top-4 w-5 h-5 text-muted-foreground" />
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
                                    className={`${inputClass} pl-10 custom-scrollbar`}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-muted">
                                Medical Registration No.
                            </label>

                            <div className="relative">
                                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
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
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-muted">
                                Qualifications
                            </label>

                            <div className="relative">
                                <Award className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
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
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-muted">
                                Experience (Years)
                            </label>

                            <div className="relative">
                                <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
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
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-border">
                        <button
                            type="submit"
                            disabled={loadingProfile}
                            className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-primary-foreground px-6 py-3 rounded-xl font-bold transition disabled:opacity-50"
                        >
                            {loadingProfile ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <CheckCircle className="w-5 h-5" />
                            )}
                            Save Profile
                        </button>
                    </div>
                </form>
            </div>

            <div className="bg-surface border border-border rounded-xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6 border-b border-border pb-4">
                    <Lock className="w-6 h-6 text-danger" />
                    <h2 className="text-xl font-bold text-foreground">
                        Security & Password
                    </h2>
                </div>

                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                            className="flex items-center gap-2 bg-surface-secondary hover:bg-danger/10 hover:text-danger hover:border-danger/20 border border-border text-muted px-6 py-3 rounded-xl font-bold transition disabled:opacity-50"
                        >
                            {loadingPassword ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
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