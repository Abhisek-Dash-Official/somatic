"use client";
import { useState } from "react";
import { toast } from "react-toastify";
import { Mic, Plus, X } from "lucide-react";

export default function NewConsultationForm() {
    const [loading, setLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);

    const [formData, setFormData] = useState({
        age: "",
        weight_kg: "",
        symptoms_raw_text: "",
        preferred_prescription_language: "English",
        attachments: [] as { file_url: string; file_type: string }[],
    });

    const toggleListening = () => {
        const w = window as any;
        const SpeechRecognition = w.SpeechRecognition || w.webkitSpeechRecognition;
        if (!SpeechRecognition) return toast.error("Your browser doesn't support Voice-to-Text.");
        const recognition = new SpeechRecognition();
        recognition.lang = "en-US";
        recognition.interimResults = false;
        recognition.onstart = () => setIsListening(true);
        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setFormData(prev => ({ ...prev, symptoms_raw_text: prev.symptoms_raw_text ? prev.symptoms_raw_text + " " + transcript : transcript }));
        };
        recognition.onerror = () => { toast.error("Error recognizing voice."); setIsListening(false); };
        recognition.onend = () => setIsListening(false);
        if (isListening) recognition.stop(); else { recognition.start(); toast.info("Listening..."); }
    };

    const addAttachment = () => {
        setFormData(prev => ({ ...prev, attachments: [...prev.attachments, { file_url: "", file_type: "link" }] }));
    };

    const updateAttachment = (index: number, url: string) => {
        const newAtt = [...formData.attachments];
        newAtt[index].file_url = url;
        setFormData(prev => ({ ...prev, attachments: newAtt }));
    };

    const removeAttachment = (index: number) => {
        setFormData(prev => ({ ...prev, attachments: prev.attachments.filter((_, i) => i !== index) }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const toastId = toast.loading("AI is analyzing your symptoms... Please wait.");

        const cleanData = {
            ...formData,
            attachments: formData.attachments.filter(a => a.file_url.trim() !== "")
        };

        try {
            const res = await fetch("/api/patient/consultations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(cleanData),
            });
            const data = await res.json();

            if (res.ok) {
                toast.update(toastId, { render: "Consultation created successfully!", type: "success", isLoading: false, autoClose: 3000 });
            } else {
                toast.update(toastId, { render: data.error || "Failed to create consultation", type: "error", isLoading: false, autoClose: 4000 });
            }
        } catch (error) {
            toast.update(toastId, { render: "Server timeout or network error.", type: "error", isLoading: false, autoClose: 4000 });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Age</label>
                    <input type="number" required min="0" max="120" className="block w-full rounded-md bg-[#0B1120] border border-slate-700 text-slate-200 p-2.5 outline-none focus:border-blue-500" value={formData.age} onChange={e => setFormData({ ...formData, age: e.target.value })} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Weight (kg)</label>
                    <input type="number" required min="1" max="300" step="0.1" className="block w-full rounded-md bg-[#0B1120] border border-slate-700 text-slate-200 p-2.5 outline-none focus:border-blue-500" value={formData.weight_kg} onChange={e => setFormData({ ...formData, weight_kg: e.target.value })} />
                </div>
            </div>

            <div>
                <div className="flex justify-between items-end mb-1">
                    <label className="block text-sm font-medium text-slate-300">Describe Symptoms</label>
                    <button type="button" onClick={toggleListening} className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-md transition ${isListening ? 'bg-red-500/20 text-red-400' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>
                        {isListening ? <><Mic className="w-3 h-3 animate-pulse" /> Listening...</> : <><Mic className="w-3 h-3" /> Dictate</>}
                    </button>
                </div>
                <textarea required rows={4} className="block w-full rounded-md bg-[#0B1120] border border-slate-700 text-slate-200 p-2.5 outline-none focus:border-blue-500" value={formData.symptoms_raw_text} onChange={e => setFormData({ ...formData, symptoms_raw_text: e.target.value })} />
            </div>

            {/* DYNAMIC ATTACHMENTS ARRAY */}
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Attachment Links (Optional)</label>
                {formData.attachments.map((att, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                        <input type="url" placeholder="Paste link of image/pdf/video..." className="flex-1 rounded-md bg-[#0B1120] border border-slate-700 text-slate-200 p-2.5 outline-none focus:border-blue-500" value={att.file_url} onChange={e => updateAttachment(i, e.target.value)} />
                        <button type="button" onClick={() => removeAttachment(i)} className="p-2.5 bg-red-500/10 text-red-400 rounded-md hover:bg-red-500/20"><X className="w-5 h-5" /></button>
                    </div>
                ))}
                <button type="button" onClick={addAttachment} className="text-sm text-blue-400 flex items-center gap-1 hover:underline mt-1">
                    <Plus className="w-4 h-4" /> Add Link
                </button>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Preferred Language</label>
                <input type="text" className="block w-full rounded-md bg-[#0B1120] border border-slate-700 text-slate-200 p-2.5 outline-none focus:border-blue-500" value={formData.preferred_prescription_language} onChange={e => setFormData({ ...formData, preferred_prescription_language: e.target.value })} />
            </div>

            <button type="submit" disabled={loading} className="w-full bg-blue-600/90 text-slate-100 p-3 rounded-md font-semibold hover:bg-blue-500 disabled:opacity-50 transition">
                {loading ? "Submitting..." : "Submit Consultation"}
            </button>
        </form>
    );
}