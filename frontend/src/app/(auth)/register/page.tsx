"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    Mail, Lock, User, Loader2, Phone, Droplet,
    MapPin, Plus, X, HeartPulse, ShieldCheck, Activity
} from "lucide-react";

export default function RegisterPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        contact_no: "",
        address: "",
        blood_grp: "",
    });

    const [allergies, setAllergies] = useState<string[]>([]);
    const [diseases, setDiseases] = useState<string[]>([]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const updateArrayField = (type: "allergy" | "disease", index: number, value: string) => {
        if (type === "allergy") {
            const newAllergies = [...allergies];
            newAllergies[index] = value;
            setAllergies(newAllergies);
        } else {
            const newDiseases = [...diseases];
            newDiseases[index] = value;
            setDiseases(newDiseases);
        }
    };

    const removeArrayField = (type: "allergy" | "disease", index: number) => {
        if (type === "allergy") {
            setAllergies(allergies.filter((_, i) => i !== index));
        } else {
            setDiseases(diseases.filter((_, i) => i !== index));
        }
    };

    const addArrayField = (type: "allergy" | "disease") => {
        if (type === "allergy") setAllergies([...allergies, ""]);
        else setDiseases([...diseases, ""]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const cleanAllergies = allergies.filter(a => a.trim() !== "");
        const cleanDiseases = diseases.filter(d => d.trim() !== "");

        const payload = {
            ...formData,
            patient_info: {
                blood_grp: formData.blood_grp,
                known_allergies: cleanAllergies,
                chronic_diseases: cleanDiseases,
            }
        };

        try {
            const res = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Failed to register");

            router.push("/login?registered=true");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mx-auto w-full max-w-2xl animate-in fade-in zoom-in duration-500 py-12 px-4 sm:px-6">
            <div className="mb-10 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-500/30 bg-blue-500/10 text-blue-400 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
                    <HeartPulse className="h-8 w-8" />
                </div>
                <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                    Join <span className="text-blue-400">Somatic</span>
                </h1>
                <p className="mt-3 text-base text-slate-400">
                    Create your comprehensive patient profile to get started.
                </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#0f172a]/80 p-6 shadow-2xl backdrop-blur-xl sm:p-10">
                {error && (
                    <div className="mb-8 flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
                        <X className="h-5 w-5 shrink-0" />
                        <p>{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-10">

                    <div className="space-y-6">
                        <div className="flex items-center gap-2 border-b border-white/10 pb-3 text-lg font-semibold text-white">
                            <ShieldCheck className="h-5 w-5 text-blue-400" />
                            Account Credentials
                        </div>

                        <div className="space-y-6">
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-blue-400" />
                                <input type="text" name="username" required value={formData.username} onChange={handleChange} className="w-full rounded-xl border border-white/10 bg-black/30 py-3.5 pl-12 pr-4 text-white placeholder:text-slate-500 focus:border-blue-500 focus:bg-black/50 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all" placeholder="Choose a username" />
                            </div>

                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-blue-400" />
                                <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full rounded-xl border border-white/10 bg-black/30 py-3.5 pl-12 pr-4 text-white placeholder:text-slate-500 focus:border-blue-500 focus:bg-black/50 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all" placeholder="Email address" />
                            </div>

                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-blue-400" />
                                <input type="password" name="password" required value={formData.password} onChange={handleChange} className="w-full rounded-xl border border-white/10 bg-black/30 py-3.5 pl-12 pr-4 text-white placeholder:text-slate-500 focus:border-blue-500 focus:bg-black/50 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all" placeholder="Create a secure password" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center gap-2 border-b border-white/10 pb-3 text-lg font-semibold text-white">
                            <User className="h-5 w-5 text-blue-400" />
                            Personal Details
                        </div>

                        <div className="space-y-6">
                            <div className="relative group">
                                <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-blue-400" />
                                <input type="tel" name="contact_no" required value={formData.contact_no} onChange={handleChange} className="w-full rounded-xl border border-white/10 bg-black/30 py-3.5 pl-12 pr-4 text-white placeholder:text-slate-500 focus:border-blue-500 focus:bg-black/50 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all" placeholder="Phone Number" />
                            </div>

                            <div className="relative group">
                                <Droplet className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-blue-400" />
                                <select name="blood_grp" value={formData.blood_grp} onChange={handleChange} className="w-full rounded-xl border border-white/10 bg-black/30 py-3.5 pl-12 pr-4 text-white placeholder:text-slate-500 focus:border-blue-500 focus:bg-black/50 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all appearance-none cursor-pointer">
                                    <option value="" className="bg-slate-900 text-slate-400">Select Blood Group</option>
                                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                                        <option key={bg} value={bg} className="bg-slate-900 text-white">{bg}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="relative group">
                                <MapPin className="absolute left-4 top-4 h-5 w-5 text-slate-500 transition-colors group-focus-within:text-blue-400" />
                                <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full rounded-xl border border-white/10 bg-black/30 py-3.5 pl-12 pr-4 text-white placeholder:text-slate-500 focus:border-blue-500 focus:bg-black/50 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all" placeholder="Full Address" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center gap-2 border-b border-white/10 pb-3 text-lg font-semibold text-white">
                            <Activity className="h-5 w-5 text-blue-400" />
                            Medical History
                        </div>

                        <div className="space-y-8">

                            <div className="space-y-4">
                                <label className="text-sm font-medium text-slate-300">Known Allergies</label>
                                {allergies.map((allergy, index) => (
                                    <div key={`allergy-${index}`} className="flex items-center gap-3 animate-in slide-in-from-left-2">
                                        <input type="text" value={allergy} onChange={(e) => updateArrayField("allergy", index, e.target.value)} className="w-full rounded-xl border border-white/10 bg-black/30 py-3 px-4 text-white placeholder:text-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="e.g., Peanuts, Dust" autoFocus />
                                        <button type="button" onClick={() => removeArrayField("allergy", index)} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 transition-colors hover:bg-red-500/20 hover:text-red-300">
                                            <X className="h-5 w-5" />
                                        </button>
                                    </div>
                                ))}
                                <button type="button" onClick={() => addArrayField("allergy")} className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-white/10 py-3.5 text-sm font-medium text-slate-400 transition-all hover:border-blue-500/50 hover:bg-blue-500/10 hover:text-blue-400">
                                    <Plus className="h-4 w-4" /> Add Allergy
                                </button>
                            </div>

                            <div className="space-y-4">
                                <label className="text-sm font-medium text-slate-300">Chronic Diseases</label>
                                {diseases.map((disease, index) => (
                                    <div key={`disease-${index}`} className="flex items-center gap-3 animate-in slide-in-from-left-2">
                                        <input type="text" value={disease} onChange={(e) => updateArrayField("disease", index, e.target.value)} className="w-full rounded-xl border border-white/10 bg-black/30 py-3 px-4 text-white placeholder:text-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="e.g., Asthma, Diabetes" autoFocus />
                                        <button type="button" onClick={() => removeArrayField("disease", index)} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 transition-colors hover:bg-red-500/20 hover:text-red-300">
                                            <X className="h-5 w-5" />
                                        </button>
                                    </div>
                                ))}
                                <button type="button" onClick={() => addArrayField("disease")} className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-white/10 py-3.5 text-sm font-medium text-slate-400 transition-all hover:border-blue-500/50 hover:bg-blue-500/10 hover:text-blue-400">
                                    <Plus className="h-4 w-4" /> Add Disease
                                </button>
                            </div>

                        </div>
                    </div>

                    <div className="pt-6">
                        <button type="submit" disabled={loading} className="group relative flex w-full items-center justify-center overflow-hidden rounded-xl bg-blue-600 py-4 text-lg font-bold text-white transition-all hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#0f172a] disabled:opacity-70">
                            <span className="relative z-10 flex items-center gap-2">
                                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : "Complete Registration"}
                            </span>
                            <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-in-out group-hover:translate-x-full" />
                        </button>
                    </div>
                </form>

                <p className="mt-8 text-center text-slate-400">
                    Already have an account?{" "}
                    <Link href="/login" className="font-semibold text-blue-400 underline-offset-4 transition-colors hover:text-blue-300 hover:underline">
                        Sign in here
                    </Link>
                </p>
            </div>
        </div>
    );
}