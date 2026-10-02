"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    Activity, ArrowRight, Droplet, HeartPulse, Loader2, Lock, Mail,
    MapPin, Phone, Plus, ShieldCheck, User, X
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
            const next = [...allergies];
            next[index] = value;
            setAllergies(next);
        } else {
            const next = [...diseases];
            next[index] = value;
            setDiseases(next);
        }
    };

    const removeArrayField = (type: "allergy" | "disease", index: number) => {
        if (type === "allergy") setAllergies(allergies.filter((_, i) => i !== index));
        else setDiseases(diseases.filter((_, i) => i !== index));
    };

    const addArrayField = (type: "allergy" | "disease") => {
        if (type === "allergy") setAllergies([...allergies, ""]);
        else setDiseases([...diseases, ""]);
    };

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const cleanAllergies = allergies.filter((a) => a.trim() !== "");
        const cleanDiseases = diseases.filter((d) => d.trim() !== "");

        const payload = {
            ...formData,
            patient_info: {
                blood_grp: formData.blood_grp,
                known_allergies: cleanAllergies,
                chronic_diseases: cleanDiseases,
            },
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
        <main className="min-h-[calc(100vh-4rem)] bg-background px-4 py-10 text-foreground sm:px-6 lg:py-14">
            <div className="mx-auto w-full max-w-5xl border border-border bg-surface">
                <div className="border-b border-border bg-surface-secondary px-6 py-8 sm:px-10">
                    <div className="flex items-start justify-between gap-6">
                        <div className="flex gap-4">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-primary/30 bg-accent text-primary">
                                <HeartPulse className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-primary">SOMATIC</p>
                                <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                                    Your health journey starts here.
                                </h1>
                                <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
                                    From first aid and doctor consultations to lab tests, reports and medicines, SOMATIC brings your healthcare together.
                                </p>
                            </div>
                        </div>

                        <div className="hidden items-center gap-2 text-xs text-muted sm:flex">
                            <ShieldCheck className="h-4 w-4 text-primary" />
                            Your Health. Our Priority.
                        </div>
                    </div>
                </div>

                <div className="p-6 sm:p-10">
                    {error && (
                        <div className="mb-8 flex items-start gap-3 border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
                            <X className="mt-0.5 h-4 w-4 shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-10">
                        <section>
                            <div className="mb-6 flex items-center gap-3 border-b border-border pb-3">
                                <ShieldCheck className="h-5 w-5 text-primary" />
                                <div>
                                    <h2 className="text-base font-semibold text-foreground">Account</h2>
                                    <p className="text-xs text-muted">Your sign-in details</p>
                                </div>
                            </div>

                            <div className="grid gap-5 md:grid-cols-2">
                                <div>
                                    <label htmlFor="username" className="mb-2 block text-sm font-medium text-foreground">
                                        Username
                                    </label>
                                    <div className="relative">
                                        <User className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted-foreground" />
                                        <input
                                            id="username"
                                            type="text"
                                            name="username"
                                            required
                                            value={formData.username}
                                            onChange={handleChange}
                                            className="w-full border border-border bg-background py-3.5 pl-11 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                                            placeholder="Choose a username"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="email" className="mb-2 block text-sm font-medium text-foreground">
                                        Email address
                                    </label>
                                    <div className="relative">
                                        <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted-foreground" />
                                        <input
                                            id="email"
                                            type="email"
                                            name="email"
                                            required
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full border border-border bg-background py-3.5 pl-11 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                                            placeholder="you@example.com"
                                        />
                                    </div>
                                </div>

                                <div className="md:col-span-2">
                                    <label htmlFor="password" className="mb-2 block text-sm font-medium text-foreground">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted-foreground" />
                                        <input
                                            id="password"
                                            type="password"
                                            name="password"
                                            required
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="w-full border border-border bg-background py-3.5 pl-11 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                                            placeholder="Create a secure password"
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section>
                            <div className="mb-6 flex items-center gap-3 border-b border-border pb-3">
                                <User className="h-5 w-5 text-primary" />
                                <div>
                                    <h2 className="text-base font-semibold text-foreground">Personal details</h2>
                                    <p className="text-xs text-muted">Basic information for your healthcare profile</p>
                                </div>
                            </div>

                            <div className="grid gap-5 md:grid-cols-2">
                                <div>
                                    <label htmlFor="contact_no" className="mb-2 block text-sm font-medium text-foreground">
                                        Phone number
                                    </label>
                                    <div className="relative">
                                        <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted-foreground" />
                                        <input
                                            id="contact_no"
                                            type="tel"
                                            name="contact_no"
                                            required
                                            value={formData.contact_no}
                                            onChange={handleChange}
                                            className="w-full border border-border bg-background py-3.5 pl-11 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                                            placeholder="Your phone number"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="blood_grp" className="mb-2 block text-sm font-medium text-foreground">
                                        Blood group
                                    </label>
                                    <div className="relative">
                                        <Droplet className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted-foreground" />
                                        <select
                                            id="blood_grp"
                                            name="blood_grp"
                                            value={formData.blood_grp}
                                            onChange={handleChange}
                                            className="w-full appearance-none border border-border bg-background py-3.5 pl-11 pr-4 text-sm text-foreground outline-none transition-colors focus:border-primary"
                                        >
                                            <option value="">Select blood group</option>
                                            {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                                                <option key={bg} value={bg}>{bg}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="md:col-span-2">
                                    <label htmlFor="address" className="mb-2 block text-sm font-medium text-foreground">
                                        Address
                                    </label>
                                    <div className="relative">
                                        <MapPin className="pointer-events-none absolute left-3.5 top-4 h-4.5 w-4.5 text-muted-foreground" />
                                        <input
                                            id="address"
                                            type="text"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            className="w-full border border-border bg-background py-3.5 pl-11 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                                            placeholder="Your full address"
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section>
                            <div className="mb-6 flex items-center gap-3 border-b border-border pb-3">
                                <Activity className="h-5 w-5 text-primary" />
                                <div>
                                    <h2 className="text-base font-semibold text-foreground">Medical information</h2>
                                    <p className="text-xs text-muted">Optional information that can help with future care</p>
                                </div>
                            </div>

                            <div className="grid gap-8 md:grid-cols-2">
                                <div>
                                    <label className="mb-3 block text-sm font-medium text-foreground">
                                        Known allergies
                                    </label>

                                    <div className="space-y-3">
                                        {allergies.map((allergy, index) => (
                                            <div key={`allergy-${index}`} className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={allergy}
                                                    onChange={(e) => updateArrayField("allergy", index, e.target.value)}
                                                    className="min-w-0 flex-1 border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                                                    placeholder="e.g. Peanuts"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeArrayField("allergy", index)}
                                                    className="flex h-11 w-11 shrink-0 items-center justify-center border border-border text-muted transition-colors hover:border-danger/40 hover:bg-danger/10 hover:text-danger"
                                                    aria-label="Remove allergy"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => addArrayField("allergy")}
                                        className="mt-3 flex w-full items-center justify-center gap-2 border border-dashed border-border py-3 text-sm text-muted transition-colors hover:border-primary hover:bg-accent hover:text-primary"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Add allergy
                                    </button>
                                </div>

                                <div>
                                    <label className="mb-3 block text-sm font-medium text-foreground">
                                        Chronic diseases
                                    </label>

                                    <div className="space-y-3">
                                        {diseases.map((disease, index) => (
                                            <div key={`disease-${index}`} className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={disease}
                                                    onChange={(e) => updateArrayField("disease", index, e.target.value)}
                                                    className="min-w-0 flex-1 border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                                                    placeholder="e.g. Asthma"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeArrayField("disease", index)}
                                                    className="flex h-11 w-11 shrink-0 items-center justify-center border border-border text-muted transition-colors hover:border-danger/40 hover:bg-danger/10 hover:text-danger"
                                                    aria-label="Remove disease"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => addArrayField("disease")}
                                        className="mt-3 flex w-full items-center justify-center gap-2 border border-dashed border-border py-3 text-sm text-muted transition-colors hover:border-primary hover:bg-accent hover:text-primary"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Add disease
                                    </button>
                                </div>
                            </div>
                        </section>

                        <div className="border-t border-border pt-8">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex w-full items-center justify-center gap-2 bg-primary py-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <>
                                        Create Account
                                        <ArrowRight className="h-4 w-4" />
                                    </>
                                )}
                            </button>

                            <p className="mt-5 text-center text-sm text-muted">
                                Already have an account?{" "}
                                <Link href="/login" className="font-medium text-primary transition-colors hover:text-primary-hover">
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    );
}