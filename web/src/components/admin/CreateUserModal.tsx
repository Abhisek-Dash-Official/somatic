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

export default function CreateUserModal({
    isOpen,
    onClose,
    onSuccess,
}: Props) {
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

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
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
            payload.patient_info = {
                blood_grp: formData.blood_grp,
            };
        } else if (
            formData.role === "doctor" ||
            formData.role === "assistant_doctor"
        ) {
            payload.doctor_info = {
                qualification: formData.qualification,
                reg_no: formData.reg_no,
                experience: Number(formData.experience),
            };
        }

        try {
            const res = await fetch("/api/admin/users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const json = await res.json();

            if (!res.ok || !json.success) {
                throw new Error(
                    json.message || "Failed to create user",
                );
            }

            toast.success("User created successfully!");
            onSuccess();
            onClose();
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const inputClass =
        "w-full rounded-xl border border-border bg-surface-secondary px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10";

    const labelClass = "text-xs font-medium text-muted";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm">
            <div className="my-8 flex max-h-[90vh] w-full max-w-xl flex-col rounded-2xl border border-border bg-surface p-6 shadow-xl">
                <div className="mb-6 flex shrink-0 items-center justify-between border-b border-border pb-4">
                    <h3 className="flex items-center gap-2 text-lg font-bold text-foreground">
                        <UserPlus className="h-5 w-5 text-primary" />
                        Create New User
                    </h3>

                    <button
                        onClick={onClose}
                        className="rounded-xl p-1.5 text-muted transition hover:bg-accent hover:text-foreground"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="custom-scrollbar flex-1 space-y-4 overflow-y-auto pr-1"
                >
                    <div className="mb-4 flex justify-center rounded-xl border border-border bg-surface-secondary p-4">
                        <AvatarSelector
                            currentAvatarId={formData.avatar_id}
                            onSelect={(id) =>
                                setFormData({
                                    ...formData,
                                    avatar_id: id,
                                })
                            }
                            isAdmin={false}
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-1">
                            <label className={labelClass}>Username</label>
                            <input
                                type="text"
                                required
                                value={formData.username}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        username: e.target.value,
                                    })
                                }
                                className={inputClass}
                            />
                        </div>

                        <div className="space-y-1">
                            <label className={labelClass}>
                                Email Address
                            </label>
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        email: e.target.value,
                                    })
                                }
                                className={inputClass}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-1">
                            <label className={labelClass}>Password</label>
                            <input
                                type="password"
                                required
                                minLength={6}
                                value={formData.password}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        password: e.target.value,
                                    })
                                }
                                className={inputClass}
                            />
                        </div>

                        <div className="space-y-1">
                            <label className={labelClass}>Role</label>
                            <select
                                value={formData.role}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        role: e.target.value,
                                    })
                                }
                                className={inputClass}
                            >
                                <option value="patient">Patient</option>
                                <option value="doctor">Doctor</option>
                                <option value="assistant_doctor">
                                    Assistant Doctor
                                </option>
                                <option value="dispatcher">
                                    Dispatcher
                                </option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-1">
                            <label className={labelClass}>
                                Contact No (10 digits)
                            </label>
                            <input
                                type="text"
                                pattern="^[0-9]{10}$"
                                value={formData.contact_no}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        contact_no: e.target.value,
                                    })
                                }
                                className={inputClass}
                            />
                        </div>

                        <div className="space-y-1">
                            <label className={labelClass}>Address</label>
                            <input
                                type="text"
                                value={formData.address}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        address: e.target.value,
                                    })
                                }
                                className={inputClass}
                            />
                        </div>
                    </div>

                    {formData.role === "patient" && (
                        <div className="rounded-xl border border-border bg-surface-secondary p-4">
                            <label className={`${labelClass} block`}>
                                Blood Group
                            </label>

                            <select
                                value={formData.blood_grp}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        blood_grp: e.target.value,
                                    })
                                }
                                className={`mt-2 ${inputClass}`}
                            >
                                <option value="">Select Group</option>
                                <option value="A+">A+</option>
                                <option value="A-">A-</option>
                                <option value="B+">B+</option>
                                <option value="B-">B-</option>
                                <option value="O+">O+</option>
                                <option value="O-">O-</option>
                                <option value="AB+">AB+</option>
                                <option value="AB-">AB-</option>
                            </select>
                        </div>
                    )}

                    {(formData.role === "doctor" ||
                        formData.role === "assistant_doctor") && (
                            <div className="space-y-4 rounded-xl border border-border bg-surface-secondary p-4">
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div className="space-y-1">
                                        <label className={labelClass}>
                                            Medical Reg No
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.reg_no}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    reg_no: e.target.value,
                                                })
                                            }
                                            className={inputClass}
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className={labelClass}>
                                            Experience (Years)
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={formData.experience}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    experience: Number(
                                                        e.target.value,
                                                    ),
                                                })
                                            }
                                            className={inputClass}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className={labelClass}>
                                        Qualifications
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.qualification}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                qualification: e.target.value,
                                            })
                                        }
                                        placeholder="e.g. MBBS, MD"
                                        className={inputClass}
                                    />
                                </div>
                            </div>
                        )}

                    <div className="flex shrink-0 justify-end gap-3 border-t border-border pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl px-4 py-2 text-sm font-semibold text-muted transition hover:bg-accent hover:text-foreground"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2 text-sm font-bold text-primary-foreground transition hover:bg-primary-hover disabled:opacity-50"
                        >
                            {loading && (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            )}
                            Create User
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}