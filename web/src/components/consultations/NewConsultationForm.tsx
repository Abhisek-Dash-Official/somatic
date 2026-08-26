"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export default function NewConsultationForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        age: "",
        weight_kg: "",
        symptoms_raw_text: "",
        preferred_prescription_language: "English",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const toastId = toast.loading("Analyzing your symptoms with AI...");

        try {
            const res = await fetch("/api/patient/consultations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const data = await res.json();

            if (res.ok) {
                toast.update(toastId, { render: "Consultation created successfully!", type: "success", isLoading: false, autoClose: 3000 });

                router.push(`/patient/consultations/${data.id}`);
            } else {
                toast.update(toastId, { render: data.error || "Failed to create consultation", type: "error", isLoading: false, autoClose: 4000 });
            }
        } catch (error) {
            console.error(error);
            toast.update(toastId, { render: "Something went wrong. Please check your connection.", type: "error", isLoading: false, autoClose: 4000 });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Age</label>
                    <input
                        type="number" required min="0" max="120"
                        className="block w-full rounded-md bg-[#0B1120] border border-slate-700 text-slate-200 shadow-sm p-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                        value={formData.age} onChange={e => setFormData({ ...formData, age: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Weight (kg)</label>
                    <input
                        type="number" required min="1" max="300" step="0.1"
                        className="block w-full rounded-md bg-[#0B1120] border border-slate-700 text-slate-200 shadow-sm p-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                        value={formData.weight_kg} onChange={e => setFormData({ ...formData, weight_kg: e.target.value })}
                    />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Describe Symptoms</label>
                <textarea
                    required rows={4}
                    className="block w-full rounded-md bg-[#0B1120] border border-slate-700 text-slate-200 shadow-sm p-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition placeholder:text-slate-600"
                    placeholder="e.g., Severe headache, dry skin, and joint pain..."
                    value={formData.symptoms_raw_text} onChange={e => setFormData({ ...formData, symptoms_raw_text: e.target.value })}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Preferred Language</label>
                <input
                    type="text"
                    placeholder="e.g., English, Hindi, Odia..."
                    className="block w-full rounded-md bg-[#0B1120] border border-slate-700 text-slate-200 shadow-sm p-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition placeholder:text-slate-600"
                    value={formData.preferred_prescription_language}
                    onChange={e => setFormData({ ...formData, preferred_prescription_language: e.target.value })}
                />
            </div>
            <button
                type="submit" disabled={loading}
                className="w-full bg-blue-600/90 text-slate-100 p-3 rounded-md font-semibold hover:bg-blue-500 disabled:opacity-50 transition shadow-lg shadow-blue-900/20"
            >
                {loading ? "Analyzing with AI..." : "Submit Consultation"}
            </button>
        </form>
    );
}