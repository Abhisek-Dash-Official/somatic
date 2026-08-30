"use client";

import React, { useState, useEffect } from "react";
import { useUserStore } from "@/store/useUserStore";
import {
    Loader2, Save, User as UserIcon, Lock, ShieldCheck,
    AlertCircle, Activity, Plus, X
} from "lucide-react";
import AvatarSelector from "@/components/profile/AvatarSelector";
import DeleteAccountSection from "@/components/profile/DeleteAccountSection";

export default function ProfilePage() {
    const { user, fetchUser, isLoading, isFetched } = useUserStore();

    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    const [formData, setFormData] = useState({
        username: "",
        contact_no: "",
        address: "",
        currentPassword: "",
        newPassword: "",
        blood_grp: "",
        avatar_id: "1",
    });

    const [allergies, setAllergies] = useState<string[]>([]);
    const [allergyInput, setAllergyInput] = useState("");

    const [diseases, setDiseases] = useState<string[]>([]);
    const [diseaseInput, setDiseaseInput] = useState("");

    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username || "",
                contact_no: user.contact_no || "",
                address: user.address || "",
                currentPassword: "",
                newPassword: "",
                blood_grp: user.patient_info?.blood_grp || "",
                avatar_id: user.avatar_id || "1",
            });
            setAllergies(user.patient_info?.known_allergies || []);
            setDiseases(user.patient_info?.chronic_diseases || []);
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAddAllergy = () => {
        if (allergyInput.trim() && !allergies.includes(allergyInput.trim())) {
            setAllergies([...allergies, allergyInput.trim()]);
            setAllergyInput("");
        }
    };

    const handleAddDisease = () => {
        if (diseaseInput.trim() && !diseases.includes(diseaseInput.trim())) {
            setDiseases([...diseases, diseaseInput.trim()]);
            setDiseaseInput("");
        }
    };

    const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg("");
        setSuccessMsg("");

        const payload = {
            username: formData.username,
            contact_no: formData.contact_no,
            address: formData.address,
            currentPassword: formData.currentPassword,
            newPassword: formData.newPassword,
            avatar_id: formData.avatar_id,
            patient_info: {
                blood_grp: formData.blood_grp,
                known_allergies: allergies,
                chronic_diseases: diseases,
            }
        };

        try {
            const res = await fetch("/api/users/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to update profile");

            setSuccessMsg("Profile updated successfully!");
            setFormData(prev => ({ ...prev, currentPassword: "", newPassword: "" }));

            await fetchUser(true);
            setTimeout(() => setSuccessMsg(""), 3000);
        } catch (err: any) {
            setErrorMsg(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (isLoading || !isFetched) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="animate-in fade-in zoom-in duration-500 max-w-4xl mx-auto space-y-6 pb-12">

            {/* Header */}
            <div className="rounded-3xl border border-white/10 bg-[#0f172a]/80 p-8 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row items-center gap-6">

                {/* Global Avatar Selector */}
                <div className="shrink-0">
                    <AvatarSelector
                        currentAvatarId={formData.avatar_id}
                        onSelect={(id) => setFormData({ ...formData, avatar_id: id })}
                        isAdmin={false}
                    />
                </div>

                <div className="text-center md:text-left">
                    <h1 className="text-3xl font-bold text-white mb-2">{formData.username || "My Profile"}</h1>
                    <p className="text-slate-400 flex items-center justify-center md:justify-start gap-2 capitalize">
                        <ShieldCheck className="h-4 w-4 text-green-400" />
                        Verified Patient Account
                    </p>
                </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#0f172a]/60 p-8 shadow-xl">
                {successMsg && (
                    <div className="mb-6 flex items-center gap-3 rounded-xl border border-green-500/20 bg-green-500/10 p-4 text-green-400">
                        <ShieldCheck className="h-6 w-6 shrink-0" />
                        <p>{successMsg}</p>
                    </div>
                )}
                {errorMsg && (
                    <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-400">
                        <AlertCircle className="h-5 w-5 shrink-0" />
                        <p>{errorMsg}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-10">

                    {/* Base Info */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                            <UserIcon className="h-5 w-5 text-blue-400" />
                            <h2 className="text-xl font-semibold text-white">General Information</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Email Address (Read-only)</label>
                                <input type="email" value={user?.email || ""} disabled className="w-full rounded-xl border border-white/5 bg-white/5 py-3.5 px-4 text-slate-500 cursor-not-allowed" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Username</label>
                                <input type="text" name="username" value={formData.username} onChange={handleChange} required className="w-full rounded-xl border border-white/10 bg-black/30 py-3.5 px-4 text-white placeholder:text-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Contact Number</label>
                                <input type="text" name="contact_no" value={formData.contact_no} onChange={handleChange} placeholder="10-digit number" className="w-full rounded-xl border border-white/10 bg-black/30 py-3.5 px-4 text-white placeholder:text-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Address</label>
                                <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="City, State" className="w-full rounded-xl border border-white/10 bg-black/30 py-3.5 px-4 text-white placeholder:text-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                            </div>
                        </div>
                    </div>

                    {/* Medical Info */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                            <Activity className="h-5 w-5 text-blue-400" />
                            <h2 className="text-xl font-semibold text-white">Medical Profile</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-medium text-slate-300">Blood Group</label>
                                <select name="blood_grp" value={formData.blood_grp} onChange={handleChange} className="w-full rounded-xl border border-white/10 bg-black/30 py-3.5 px-4 text-white focus:border-blue-500 focus:outline-none appearance-none md:w-1/2">
                                    <option value="">Select Group</option>
                                    <option value="A+">A+</option><option value="A-">A-</option>
                                    <option value="B+">B+</option><option value="B-">B-</option>
                                    <option value="O+">O+</option><option value="O-">O-</option>
                                    <option value="AB+">AB+</option><option value="AB-">AB-</option>
                                </select>
                            </div>

                            {/* Allergies */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-slate-300">Known Allergies</label>
                                <div className="flex gap-2 flex-wrap">
                                    <input
                                        type="text"
                                        value={allergyInput}
                                        onChange={(e) => setAllergyInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAllergy())}
                                        placeholder="e.g. Peanuts"
                                        className="flex-1 rounded-xl border border-white/10 bg-black/30 py-2.5 px-4 text-white placeholder:text-slate-600 focus:border-blue-500 focus:outline-none"
                                    />
                                    <button type="button" onClick={handleAddAllergy} className="flex items-center gap-1 rounded-xl bg-blue-600/20 px-4 py-2 font-semibold text-blue-400 hover:bg-blue-600/40 transition-colors border border-blue-500/20">
                                        <Plus className="h-4 w-4" /> Add
                                    </button>
                                </div>
                                {allergies.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {allergies.map((item, idx) => (
                                            <span key={idx} className="flex items-center gap-1 rounded-lg bg-white/10 px-3 py-1 text-sm text-white border border-white/10">
                                                {item}
                                                <button type="button" onClick={() => setAllergies(allergies.filter((_, i) => i !== idx))} className="ml-1 text-slate-400 hover:text-red-400">
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Chronic Diseases */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-slate-300">Chronic Diseases</label>
                                <div className="flex gap-2 flex-wrap">
                                    <input
                                        type="text"
                                        value={diseaseInput}
                                        onChange={(e) => setDiseaseInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddDisease())}
                                        placeholder="e.g. Diabetes"
                                        className="flex-1 rounded-xl border border-white/10 bg-black/30 py-2.5 px-4 text-white placeholder:text-slate-600 focus:border-blue-500 focus:outline-none"
                                    />
                                    <button type="button" onClick={handleAddDisease} className="flex items-center gap-1 rounded-xl bg-blue-600/20 px-4 py-2 font-semibold text-blue-400 hover:bg-blue-600/40 transition-colors border border-blue-500/20">
                                        <Plus className="h-4 w-4" /> Add
                                    </button>
                                </div>
                                {diseases.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {diseases.map((item, idx) => (
                                            <span key={idx} className="flex items-center gap-1 rounded-lg bg-white/10 px-3 py-1 text-sm text-white border border-white/10">
                                                {item}
                                                <button type="button" onClick={() => setDiseases(diseases.filter((_, i) => i !== idx))} className="ml-1 text-slate-400 hover:text-red-400">
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Security */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                            <Lock className="h-5 w-5 text-blue-400" />
                            <h2 className="text-xl font-semibold text-white">Security & Password</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Current Password</label>
                                <input type="password" name="currentPassword" value={formData.currentPassword} onChange={handleChange} placeholder="Enter current password to change" className="w-full rounded-xl border border-white/10 bg-black/30 py-3.5 px-4 text-white placeholder:text-slate-600 focus:border-blue-500 focus:outline-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">New Password</label>
                                <input type="password" name="newPassword" value={formData.newPassword} onChange={handleChange} placeholder="Leave blank to keep same" className="w-full rounded-xl border border-white/10 bg-black/30 py-3.5 px-4 text-white placeholder:text-slate-600 focus:border-blue-500 focus:outline-none" />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button type="submit" disabled={loading} className="flex w-full md:w-auto items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-3.5 font-bold text-white transition-all hover:bg-blue-500 disabled:opacity-50">
                            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Save className="h-5 w-5" /> Save Profile</>}
                        </button>
                    </div>
                </form>
            </div>

            <DeleteAccountSection />
        </div>
    );
}