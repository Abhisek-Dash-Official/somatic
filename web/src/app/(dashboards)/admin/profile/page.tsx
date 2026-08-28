"use client";

import React, { useEffect, useState } from "react";
import { useUserStore } from "@/store/useUserStore";
import {
    UserShield, Mail, Phone, MapPin, Calendar,
    ShieldCheck, Loader2, Save, AlertTriangle, CheckCircle2, Activity, User, Lock, ShieldAlert
} from "lucide-react";
import AvatarSelector from "@/components/profile/AvatarSelector";

interface AdminProfile {
    _id: string;
    username: string;
    email: string;
    role: string;
    contact_no?: string;
    address?: string;
    avatar_id?: string;
    created_at: string;
}

export default function AdminProfilePage() {
    const { fetchUser } = useUserStore();
    const [profile, setProfile] = useState<AdminProfile | null>(null);
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
            const res = await fetch("/api/admin/profile");
            if (!res.ok) throw new Error("Failed to load profile data");
            const data = await res.json();
            setProfile(data.profile);
            setStats(data.stats);
            setProfileData({
                username: data.profile.username || "",
                contact_no: data.profile.contact_no || "",
                address: data.profile.address || "",
                avatar_id: data.profile.avatar_id || "admin",
            });
        } catch (err: any) {
            setProfileError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setSavingProfile(true);
        setProfileError("");
        setProfileSuccess("");

        try {
            const res = await fetch("/api/admin/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(profileData),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to update profile");

            setProfile(data.profile);
            setProfileSuccess("Profile settings updated successfully!");
            await fetchUser(true);
            setTimeout(() => setProfileSuccess(""), 3000);
        } catch (err: any) {
            setProfileError(err.message);
        } finally {
            setSavingProfile(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
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
            setPwdError("Password must be at least 6 characters long.");
            setSavingPassword(false);
            return;
        }

        try {
            const res = await fetch("/api/admin/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password: pwdData.new_password }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to update password");

            setPwdSuccess("Security credentials updated securely.");
            setPwdData({ new_password: "", confirm_password: "" });
            setTimeout(() => setPwdSuccess(""), 3000);
        } catch (err: any) {
            setPwdError(err.message);
        } finally {
            setSavingPassword(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
            </div>
        );
    }

    const joinedDate = profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'long', year: 'numeric'
    }) : "N/A";

    return (
        <div className="space-y-6 sm:space-y-8 p-4 pt-20 sm:p-6 sm:pt-24 lg:p-8 lg:pt-8 w-full max-w-6xl mx-auto text-slate-200">

            <div className="flex flex-col gap-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                    <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/20 shrink-0">
                        <UserShield className="h-6 w-6 text-blue-400" />
                    </div>
                    Administrator Profile
                </h1>
                <p className="text-sm sm:text-base text-slate-400 mt-1">
                    Manage your personal information, credentials, and view your system activity.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">

                {/* Left Column: Identity Card */}
                <div className="md:col-span-1 space-y-6">
                    <div className="bg-[#131C31] border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col items-center text-center">

                        {/* Avatar Selector */}
                        <div className="mb-4">
                            <AvatarSelector
                                currentAvatarId={profileData.avatar_id}
                                onSelect={(id) => setProfileData(prev => ({ ...prev, avatar_id: id }))}
                                isAdmin={true}
                            />
                        </div>

                        <h2 className="text-xl font-bold text-white capitalize mb-1">{profile?.username}</h2>
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full text-xs font-semibold text-red-400 uppercase tracking-wider mb-6">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            {profile?.role}
                        </div>

                        <div className="w-full space-y-4 text-left border-t border-slate-800 pt-6">
                            <div className="flex flex-col gap-1 text-sm">
                                <span className="text-slate-500 flex items-center gap-2 font-medium">
                                    <Mail className="h-4 w-4" /> Email Address
                                </span>
                                <span className="text-slate-200 pl-6">{profile?.email}</span>
                            </div>
                            <div className="flex flex-col gap-1 text-sm">
                                <span className="text-slate-500 flex items-center gap-2 font-medium">
                                    <Calendar className="h-4 w-4" /> Member Since
                                </span>
                                <span className="text-slate-200 pl-6">{joinedDate}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#131C31] border border-slate-800 rounded-2xl p-6 shadow-lg">
                        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Activity className="h-4 w-4 text-teal-400" /> My Activity
                        </h3>
                        <div className="flex justify-between items-center bg-[#0B1120] border border-slate-800 p-4 rounded-xl">
                            <span className="text-slate-400 text-sm font-medium">System Actions</span>
                            <span className="text-xl font-mono font-bold text-teal-400">{stats?.totalActions}</span>
                        </div>
                    </div>
                </div>

                {/* Right Column: Split Forms */}
                <div className="md:col-span-2 space-y-6">

                    {/* Section 1: Profile Settings */}
                    <div className="bg-[#131C31] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-lg">
                        <h2 className="text-lg font-bold text-white mb-6">Profile Settings</h2>

                        {profileSuccess && (
                            <div className="mb-6 flex items-center gap-3 rounded-xl border border-green-500/20 bg-green-500/10 p-4 text-green-400 text-sm">
                                <CheckCircle2 className="h-5 w-5 shrink-0" />
                                <p>{profileSuccess}</p>
                            </div>
                        )}
                        {profileError && (
                            <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-400 text-sm">
                                <AlertTriangle className="h-5 w-5 shrink-0" />
                                <p>{profileError}</p>
                            </div>
                        )}

                        <form onSubmit={handleUpdateProfile} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                    <User className="h-4 w-4 text-slate-500" /> Username
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={profileData.username}
                                    onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                                    className="w-full rounded-xl border border-slate-700 bg-[#0B1120] py-3 px-4 text-white placeholder:text-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-slate-500" /> Contact Number
                                </label>
                                <input
                                    type="text"
                                    maxLength={10}
                                    value={profileData.contact_no}
                                    onChange={(e) => setProfileData({ ...profileData, contact_no: e.target.value.replace(/\D/g, '') })}
                                    className="w-full rounded-xl border border-slate-700 bg-[#0B1120] py-3 px-4 text-white placeholder:text-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-slate-500" /> Address
                                </label>
                                <textarea
                                    rows={3}
                                    value={profileData.address}
                                    onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                                    className="w-full resize-none rounded-xl border border-slate-700 bg-[#0B1120] py-3 px-4 text-white placeholder:text-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all custom-scrollbar"
                                />
                            </div>

                            <div className="pt-2 text-right">
                                <button
                                    type="submit"
                                    disabled={savingProfile}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 font-semibold text-white transition-all hover:bg-blue-500 disabled:opacity-50 w-full sm:w-auto"
                                >
                                    {savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                    Update Profile
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Section 2: Security Settings */}
                    <div className="bg-[#131C31] border border-red-500/20 rounded-2xl p-6 sm:p-8 shadow-lg">
                        <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                            <ShieldAlert className="h-5 w-5 text-red-400" /> Security
                        </h2>

                        {pwdSuccess && (
                            <div className="mb-6 flex items-center gap-3 rounded-xl border border-green-500/20 bg-green-500/10 p-4 text-green-400 text-sm">
                                <CheckCircle2 className="h-5 w-5 shrink-0" />
                                <p>{pwdSuccess}</p>
                            </div>
                        )}
                        {pwdError && (
                            <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-400 text-sm">
                                <AlertTriangle className="h-5 w-5 shrink-0" />
                                <p>{pwdError}</p>
                            </div>
                        )}

                        <form onSubmit={handleUpdatePassword} className="space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                        <Lock className="h-4 w-4 text-slate-500" /> New Password
                                    </label>
                                    <input
                                        type="password"
                                        required
                                        value={pwdData.new_password}
                                        onChange={(e) => setPwdData({ ...pwdData, new_password: e.target.value })}
                                        className="w-full rounded-xl border border-slate-700 bg-[#0B1120] py-3 px-4 text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                        <Lock className="h-4 w-4 text-slate-500" /> Confirm Password
                                    </label>
                                    <input
                                        type="password"
                                        required
                                        value={pwdData.confirm_password}
                                        onChange={(e) => setPwdData({ ...pwdData, confirm_password: e.target.value })}
                                        className="w-full rounded-xl border border-slate-700 bg-[#0B1120] py-3 px-4 text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="pt-2 text-right">
                                <button
                                    type="submit"
                                    disabled={savingPassword}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600/20 border border-red-600/50 text-red-400 px-6 py-2.5 font-semibold transition-all hover:bg-red-600 hover:text-white disabled:opacity-50 w-full sm:w-auto"
                                >
                                    {savingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                                    Change Password
                                </button>
                            </div>
                        </form>
                    </div>

                </div>
            </div>
        </div>
    );
}