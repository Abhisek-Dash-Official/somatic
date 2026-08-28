"use client";

import React, { useState } from "react";
import { X, Loader2, UserPlus } from "lucide-react";
import { toast } from "react-toastify";
import AvatarSelector from "@/components/profile/AvatarSelector";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function CreateUserModal({ isOpen, onClose, onSuccess }: Props) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        role: "patient",
        contact_no: "",
        address: "",
        avatar_id: "1",
        blood_grp: "",
        qualification: "",
        reg_no: "",
        experience: 0,
    });

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const payload: any = {
            username: formData.username,
            email: formData.email,
            password: formData.password,
            role: formData.role,
            contact_no: formData.contact_no,
            address: formData.address,
            avatar_id: formData.avatar_id,
        };

        if (formData.role === "patient") {
            payload.patient_info = { blood_grp: formData.blood_grp };
        } else if (formData.role === "doctor") {
            payload.doctor_info = {
                qualification: formData.qualification,
                reg_no: formData.reg_no,
                experience: Number(formData.experience),
            };
        }

        try {
            const res = await fetch("/api/admin/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const json = await res.json();
            if (!res.ok || !json.success) throw new Error(json.message || "Failed to create user");

            toast.success("User created successfully!");
            onSuccess();
            onClose();
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="w-full max-w-xl bg-[#0B1120] border border-slate-700 rounded-2xl shadow-2xl p-6 my-8 max-h-[90vh] flex flex-col">

                <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4 shrink-0">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <UserPlus className="h-5 w-5 text-blue-400" /> Create New User
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto custom-scrollbar flex-1 pr-1">
                    <div className="flex justify-center mb-4">
                        <AvatarSelector
                            currentAvatarId={formData.avatar_id}
                            onSelect={(id) => setFormData({ ...formData, avatar_id: id })}
                            isAdmin={false}
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-300">Username</label>
                            <input
                                type="text"
                                required
                                value={formData.username}
                                onChange={e => setFormData({ ...formData, username: e.target.value })}
                                className="w-full bg-[#131C31] border border-slate-700 rounded-xl py-2.5 px-3 text-white text-sm focus:border-blue-500 outline-none"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-300">Email Address</label>
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                className="w-full bg-[#131C31] border border-slate-700 rounded-xl py-2.5 px-3 text-white text-sm focus:border-blue-500 outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-300">Password</label>
                            <input
                                type="password"
                                required
                                minLength={6}
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                className="w-full bg-[#131C31] border border-slate-700 rounded-xl py-2.5 px-3 text-white text-sm focus:border-blue-500 outline-none"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-300">Role</label>
                            <select
                                value={formData.role}
                                onChange={e => setFormData({ ...formData, role: e.target.value })}
                                className="w-full bg-[#131C31] border border-slate-700 rounded-xl py-2.5 px-3 text-white text-sm focus:border-blue-500 outline-none"
                            >
                                <option value="patient">Patient</option>
                                <option value="doctor">Doctor</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-300">Contact No (10 digits)</label>
                            <input
                                type="text"
                                pattern="^[0-9]{10}$"
                                value={formData.contact_no}
                                onChange={e => setFormData({ ...formData, contact_no: e.target.value })}
                                className="w-full bg-[#131C31] border border-slate-700 rounded-xl py-2.5 px-3 text-white text-sm focus:border-blue-500 outline-none"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-300">Address</label>
                            <input
                                type="text"
                                value={formData.address}
                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                                className="w-full bg-[#131C31] border border-slate-700 rounded-xl py-2.5 px-3 text-white text-sm focus:border-blue-500 outline-none"
                            />
                        </div>
                    </div>

                    {formData.role === "patient" && (
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-300">Blood Group</label>
                            <select
                                value={formData.blood_grp}
                                onChange={e => setFormData({ ...formData, blood_grp: e.target.value })}
                                className="w-full bg-[#131C31] border border-slate-700 rounded-xl py-2.5 px-3 text-white text-sm focus:border-blue-500 outline-none"
                            >
                                <option value="">Select Group</option>
                                <option value="A+">A+</option><option value="A-">A-</option>
                                <option value="B+">B+</option><option value="B-">B-</option>
                                <option value="O+">O+</option><option value="O-">O-</option>
                                <option value="AB+">AB+</option><option value="AB-">AB-</option>
                            </select>
                        </div>
                    )}

                    {formData.role === "doctor" && (
                        <div className="space-y-4 pt-2 border-t border-slate-800">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-300">Medical Reg No</label>
                                    <input
                                        type="text"
                                        value={formData.reg_no}
                                        onChange={e => setFormData({ ...formData, reg_no: e.target.value })}
                                        className="w-full bg-[#131C31] border border-slate-700 rounded-xl py-2.5 px-3 text-white text-sm focus:border-blue-500 outline-none"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-300">Experience (Years)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.experience}
                                        onChange={e => setFormData({ ...formData, experience: Number(e.target.value) })}
                                        className="w-full bg-[#131C31] border border-slate-700 rounded-xl py-2.5 px-3 text-white text-sm focus:border-blue-500 outline-none"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-300">Qualifications</label>
                                <input
                                    type="text"
                                    value={formData.qualification}
                                    onChange={e => setFormData({ ...formData, qualification: e.target.value })}
                                    placeholder="e.g. MBBS, MD"
                                    className="w-full bg-[#131C31] border border-slate-700 rounded-xl py-2.5 px-3 text-white text-sm focus:border-blue-500 outline-none"
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-800 shrink-0">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-sm font-semibold transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-xl text-sm font-bold transition disabled:opacity-50"
                        >
                            {loading && <Loader2 className="h-4 w-4 animate-spin" />} Create User
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}