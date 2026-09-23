"use client";

import React, { useEffect, useState } from "react";
import { useUserStore } from "@/store/useUserStore";
import { Radio, Mail, Phone, MapPin, Calendar, ShieldCheck, Loader2, Save, AlertTriangle, CheckCircle2, Activity, User, Lock, ShieldAlert } from "lucide-react";
import AvatarSelector from "@/components/profile/AvatarSelector";
import DeleteAccountSection from "@/components/profile/DeleteAccountSection";

interface DispatcherProfile {
    _id: string;
    username: string;
    email: string;
    role: string;
    contact_no?: string;
    address?: string;
    avatar_id?: string;
    created_at: string;
}

export default function DispatcherProfilePage() {
    const { fetchUser } = useUserStore();

    const [profile, setProfile] = useState<DispatcherProfile | null>(null);
    const [stats, setStats] = useState<{ totalActions: number } | null>(null);

    const [loading, setLoading] = useState(true);

    const [savingProfile, setSavingProfile] = useState(false);
    const [profileError, setProfileError] = useState("");
    const [profileSuccess, setProfileSuccess] = useState("");

    const [profileData, setProfileData] = useState({
        username: "",
        contact_no: "",
        address: "",
        avatar_id: "",
    });

    const [savingPassword, setSavingPassword] = useState(false);
    const [pwdError, setPwdError] = useState("");
    const [pwdSuccess, setPwdSuccess] = useState("");

    const [pwdData, setPwdData] = useState({
        new_password: "",
        confirm_password: "",
    });

    useEffect(() => {
        fetchProfileData();
    }, []);

    const fetchProfileData = async () => {
        try {
            const res = await fetch("/api/dispatcher/profile");

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to load profile data");
            }

            const data = await res.json();

            setProfile(data.profile);
            setStats(data.stats);

            setProfileData({
                username: data.profile.username || "",
                contact_no: data.profile.contact_no || "",
                address: data.profile.address || "",
                avatar_id: data.profile.avatar_id || "1",
            });
        } catch (err: any) {
            setProfileError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        setSavingProfile(true);
        setProfileError("");
        setProfileSuccess("");

        try {
            const res = await fetch("/api/dispatcher/profile", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(profileData),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(
                    data.error || "Failed to update profile"
                );
            }

            setProfile(data.profile);

            setProfileSuccess(
                "Profile settings updated successfully!"
            );

            await fetchUser(true);

            setTimeout(() => {
                setProfileSuccess("");
            }, 3000);
        } catch (err: any) {
            setProfileError(err.message);
        } finally {
            setSavingProfile(false);
        }
    };

    const handleUpdatePassword = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        setSavingPassword(true);
        setPwdError("");
        setPwdSuccess("");

        if (pwdData.new_password !== pwdData.confirm_password) {
            setPwdError("Passwords do not match.");
            setSavingPassword(false);
            return;
        }

        if (pwdData.new_password.length < 6) {
            setPwdError(
                "Password must be at least 6 characters long."
            );
            setSavingPassword(false);
            return;
        }

        try {
            const res = await fetch("/api/dispatcher/profile", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    password: pwdData.new_password,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(
                    data.error || "Failed to update password"
                );
            }

            setPwdSuccess(
                "Security credentials updated securely."
            );

            setPwdData({
                new_password: "",
                confirm_password: "",
            });

            setTimeout(() => {
                setPwdSuccess("");
            }, 3000);
        } catch (err: any) {
            setPwdError(err.message);
        } finally {
            setSavingPassword(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-cyan-500" />
            </div>
        );
    }

    const joinedDate = profile?.created_at
        ? new Date(profile.created_at).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
        })
        : "N/A";

    return (
        <div className="w-full max-w-6xl mx-auto space-y-6 p-4 pt-20 text-slate-200 sm:space-y-8 sm:p-6 sm:pt-24 lg:p-8 lg:pt-8">
            <div className="flex flex-col gap-1">
                <h1 className="flex items-center gap-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                    <div className="shrink-0 rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-2.5">
                        <Radio className="h-6 w-6 text-cyan-400" />
                    </div>
                    Dispatcher Profile
                </h1>

                <p className="mt-1 text-sm text-slate-400 sm:text-base">
                    Manage your personal information, credentials, and
                    dispatcher account activity.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-3">
                <div className="space-y-6 md:col-span-1">
                    <div className="flex flex-col items-center rounded-2xl border border-slate-800 bg-[#131C31] p-6 text-center shadow-lg">
                        <div className="mb-4">
                            <AvatarSelector
                                currentAvatarId={profileData.avatar_id}
                                onSelect={(id) =>
                                    setProfileData((prev) => ({
                                        ...prev,
                                        avatar_id: id,
                                    }))
                                }
                            />
                        </div>

                        <h2 className="mb-1 text-xl font-bold capitalize text-white">
                            {profile?.username}
                        </h2>

                        <div className="mb-6 flex items-center gap-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-400">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            {profile?.role}
                        </div>

                        <div className="w-full space-y-4 border-t border-slate-800 pt-6 text-left">
                            <div className="flex flex-col gap-1 text-sm">
                                <span className="flex items-center gap-2 font-medium text-slate-500">
                                    <Mail className="h-4 w-4" />
                                    Email Address
                                </span>

                                <span className="break-all pl-6 text-slate-200">
                                    {profile?.email}
                                </span>
                            </div>

                            <div className="flex flex-col gap-1 text-sm">
                                <span className="flex items-center gap-2 font-medium text-slate-500">
                                    <Calendar className="h-4 w-4" />
                                    Member Since
                                </span>

                                <span className="pl-6 text-slate-200">
                                    {joinedDate}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-800 bg-[#131C31] p-6 shadow-lg">
                        <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-300">
                            <Activity className="h-4 w-4 text-cyan-400" />
                            My Activity
                        </h3>

                        <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-[#0B1120] p-4">
                            <span className="text-sm font-medium text-slate-400">
                                System Actions
                            </span>

                            <span className="font-mono text-xl font-bold text-cyan-400">
                                {stats?.totalActions ?? 0}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="space-y-6 md:col-span-2">
                    <div className="rounded-2xl border border-slate-800 bg-[#131C31] p-6 shadow-lg sm:p-8">
                        <h2 className="mb-6 text-lg font-bold text-white">
                            Profile Settings
                        </h2>

                        {profileSuccess && (
                            <div className="mb-6 flex items-center gap-3 rounded-xl border border-green-500/20 bg-green-500/10 p-4 text-sm text-green-400">
                                <CheckCircle2 className="h-5 w-5 shrink-0" />
                                <p>{profileSuccess}</p>
                            </div>
                        )}

                        {profileError && (
                            <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
                                <AlertTriangle className="h-5 w-5 shrink-0" />
                                <p>{profileError}</p>
                            </div>
                        )}

                        <form
                            onSubmit={handleUpdateProfile}
                            className="space-y-5"
                        >
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                                    <User className="h-4 w-4 text-slate-500" />
                                    Username
                                </label>

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
                                    className="w-full rounded-xl border border-slate-700 bg-[#0B1120] px-4 py-3 text-white placeholder:text-slate-600 transition-all focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                                    <Phone className="h-4 w-4 text-slate-500" />
                                    Contact Number
                                </label>

                                <input
                                    type="text"
                                    maxLength={10}
                                    value={profileData.contact_no}
                                    onChange={(e) =>
                                        setProfileData({
                                            ...profileData,
                                            contact_no: e.target.value.replace(
                                                /\D/g,
                                                ""
                                            ),
                                        })
                                    }
                                    className="w-full rounded-xl border border-slate-700 bg-[#0B1120] px-4 py-3 text-white placeholder:text-slate-600 transition-all focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                                    <MapPin className="h-4 w-4 text-slate-500" />
                                    Address
                                </label>

                                <textarea
                                    rows={3}
                                    value={profileData.address}
                                    onChange={(e) =>
                                        setProfileData({
                                            ...profileData,
                                            address: e.target.value,
                                        })
                                    }
                                    className="w-full resize-none rounded-xl border border-slate-700 bg-[#0B1120] px-4 py-3 text-white placeholder:text-slate-600 transition-all focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                                />
                            </div>

                            <div className="pt-2 text-right">
                                <button
                                    type="submit"
                                    disabled={savingProfile}
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-600 px-6 py-2.5 font-semibold text-white transition-all hover:bg-cyan-500 disabled:opacity-50 sm:w-auto"
                                >
                                    {savingProfile ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Save className="h-4 w-4" />
                                    )}
                                    Update Profile
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="rounded-2xl border border-red-500/20 bg-[#131C31] p-6 shadow-lg sm:p-8">
                        <h2 className="mb-6 flex items-center gap-2 text-lg font-bold text-white">
                            <ShieldAlert className="h-5 w-5 text-red-400" />
                            Security
                        </h2>

                        {pwdSuccess && (
                            <div className="mb-6 flex items-center gap-3 rounded-xl border border-green-500/20 bg-green-500/10 p-4 text-sm text-green-400">
                                <CheckCircle2 className="h-5 w-5 shrink-0" />
                                <p>{pwdSuccess}</p>
                            </div>
                        )}

                        {pwdError && (
                            <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
                                <AlertTriangle className="h-5 w-5 shrink-0" />
                                <p>{pwdError}</p>
                            </div>
                        )}

                        <form
                            onSubmit={handleUpdatePassword}
                            className="space-y-5"
                        >
                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                                        <Lock className="h-4 w-4 text-slate-500" />
                                        New Password
                                    </label>

                                    <input
                                        type="password"
                                        required
                                        value={pwdData.new_password}
                                        onChange={(e) =>
                                            setPwdData({
                                                ...pwdData,
                                                new_password:
                                                    e.target.value,
                                            })
                                        }
                                        className="w-full rounded-xl border border-slate-700 bg-[#0B1120] px-4 py-3 text-white transition-all focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                                        <Lock className="h-4 w-4 text-slate-500" />
                                        Confirm Password
                                    </label>

                                    <input
                                        type="password"
                                        required
                                        value={pwdData.confirm_password}
                                        onChange={(e) =>
                                            setPwdData({
                                                ...pwdData,
                                                confirm_password:
                                                    e.target.value,
                                            })
                                        }
                                        className="w-full rounded-xl border border-slate-700 bg-[#0B1120] px-4 py-3 text-white transition-all focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                                    />
                                </div>
                            </div>

                            <div className="pt-2 text-right">
                                <button
                                    type="submit"
                                    disabled={savingPassword}
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-600/50 bg-red-600/20 px-6 py-2.5 font-semibold text-red-400 transition-all hover:bg-red-600 hover:text-white disabled:opacity-50 sm:w-auto"
                                >
                                    {savingPassword ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Lock className="h-4 w-4" />
                                    )}
                                    Change Password
                                </button>
                            </div>
                        </form>
                    </div>

                    <DeleteAccountSection />
                </div>
            </div>
        </div>
    );
}