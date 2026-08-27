"use client";

import { useEffect, useState } from "react";
import { useUserStore } from "@/store/useUserStore";
import { toast } from "react-toastify";
import {
    User, Phone, MapPin, FileText, Award, ShieldCheck,
    Lock, Loader2, CheckCircle, BriefcaseMedical
} from "lucide-react";

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
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    useEffect(() => {
        if (user && user.role === "doctor") {
            setProfileData({
                username: user.username || "",
                contact_no: user.contact_no || "",
                address: user.address || "",
                reg_no: user.doctor_info?.reg_no || "",
                qualification: user.doctor_info?.qualification || "",
                experience: user.doctor_info?.experience || 0,
            });
        }
    }, [user]);

    if (!isFetched) {
        return <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-blue-500" /></div>;
    }

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoadingProfile(true);

        const payload = {
            username: profileData.username,
            contact_no: profileData.contact_no,
            address: profileData.address,
            doctor_info: {
                reg_no: profileData.reg_no,
                qualification: profileData.qualification,
                experience: Number(profileData.experience),
            }
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

    const handlePasswordSubmit = async (e: React.FormEvent) => {
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
                    newPassword: passwordData.newPassword
                }),
            });

            if (res.ok) {
                toast.success("Password changed successfully!");
                setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
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

    return (
        <div className="space-y-8 animate-in fade-in duration-500">

            {/* DETAILS SECTION */}
            <div className="bg-[#131C31] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
                <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
                    <BriefcaseMedical className="w-6 h-6 text-blue-400" />
                    <h2 className="text-xl font-bold text-white">Professional Details</h2>
                </div>

                <form onSubmit={handleProfileSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-400">Username</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input type="text" required value={profileData.username} onChange={e => setProfileData({ ...profileData, username: e.target.value })} className="w-full bg-[#0B1120] border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:border-blue-500 outline-none transition" />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-400">Contact Number</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input type="text" required value={profileData.contact_no} onChange={e => setProfileData({ ...profileData, contact_no: e.target.value })} className="w-full bg-[#0B1120] border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:border-blue-500 outline-none transition" />
                            </div>
                        </div>

                        <div className="space-y-1 md:col-span-2">
                            <label className="text-sm font-medium text-slate-400">Clinic / Hospital Address</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-4 w-5 h-5 text-slate-500" />
                                <textarea rows={2} required value={profileData.address} onChange={e => setProfileData({ ...profileData, address: e.target.value })} className="w-full bg-[#0B1120] border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:border-blue-500 outline-none transition custom-scrollbar" />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-400">Medical Registration No.</label>
                            <div className="relative">
                                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input type="text" required value={profileData.reg_no} onChange={e => setProfileData({ ...profileData, reg_no: e.target.value })} className="w-full bg-[#0B1120] border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:border-blue-500 outline-none transition" />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-400">Qualifications</label>
                            <div className="relative">
                                <Award className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input
                                    type="text"
                                    required
                                    value={profileData.qualification}
                                    onChange={e => setProfileData({ ...profileData, qualification: e.target.value })}
                                    className="w-full bg-[#0B1120] border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:border-blue-500 outline-none transition"
                                    placeholder="e.g. MBBS, MD (Medicine)"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-400">Experience (Years)</label>
                            <div className="relative">
                                <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input type="number" min="0" required value={profileData.experience} onChange={e => setProfileData({ ...profileData, experience: Number(e.target.value) })} className="w-full bg-[#0B1120] border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:border-blue-500 outline-none transition" />
                            </div>
                        </div>

                    </div>

                    <div className="flex justify-end pt-4 border-t border-slate-800">
                        <button type="submit" disabled={loadingProfile} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold transition disabled:opacity-50">
                            {loadingProfile ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                            Save Profile
                        </button>
                    </div>
                </form>
            </div>

            {/* SECURITY / PASSWORD SECTION */}
            <div className="bg-[#131C31] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
                <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
                    <Lock className="w-6 h-6 text-red-400" />
                    <h2 className="text-xl font-bold text-white">Security & Password</h2>
                </div>

                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1 md:col-span-2">
                            <label className="text-sm font-medium text-slate-400">Current Password</label>
                            <input type="password" required value={passwordData.currentPassword} onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })} className="w-full bg-[#0B1120] border border-slate-700 rounded-xl py-3 px-4 text-white focus:border-red-500 outline-none transition" placeholder="••••••••" />
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-400">New Password</label>
                            <input type="password" required minLength={6} value={passwordData.newPassword} onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })} className="w-full bg-[#0B1120] border border-slate-700 rounded-xl py-3 px-4 text-white focus:border-red-500 outline-none transition" placeholder="••••••••" />
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-400">Confirm New Password</label>
                            <input type="password" required minLength={6} value={passwordData.confirmPassword} onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} className="w-full bg-[#0B1120] border border-slate-700 rounded-xl py-3 px-4 text-white focus:border-red-500 outline-none transition" placeholder="••••••••" />
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button type="submit" disabled={loadingPassword} className="flex items-center gap-2 bg-slate-800 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 border border-transparent text-slate-300 px-6 py-3 rounded-xl font-bold transition disabled:opacity-50">
                            {loadingPassword ? <Loader2 className="w-5 h-5 animate-spin" /> : "Update Password"}
                        </button>
                    </div>
                </form>
            </div>

        </div>
    );
}