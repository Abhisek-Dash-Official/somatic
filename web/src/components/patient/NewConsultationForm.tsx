"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { AlertTriangle, FileSymlink, Loader2, Mic, Plus, Scale, UserRound, X } from "lucide-react";

const inputClass = "block w-full rounded-xl border border-border bg-surface-secondary px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-primary/50 focus:ring-4 focus:ring-primary/10";

const langMap: Record<string, string> = {
    english: "en-US", hindi: "hi-IN", bengali: "bn-IN", telugu: "te-IN", marathi: "mr-IN",
    tamil: "ta-IN", urdu: "ur-IN", gujarati: "gu-IN", kannada: "kn-IN", malayalam: "ml-IN",
    odia: "or-IN", punjabi: "pa-IN", assamese: "as-IN", maithili: "mai-IN", spanish: "es-ES",
    french: "fr-FR", german: "de-DE", arabic: "ar-SA", chinese: "zh-CN", japanese: "ja-JP",
    korean: "ko-KR", russian: "ru-RU",
};

type Attachment = { file_url: string; file_type: string };

export default function NewConsultationForm() {
    const [loading, setLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [formData, setFormData] = useState({
        age: "",
        weight_kg: "",
        symptoms_raw_text: "",
        preferred_prescription_language: "English",
        attachments: [] as Attachment[],
    });

    const updateField = (field: keyof typeof formData, value: string) =>
        setFormData((prev) => ({ ...prev, [field]: value }));

    const toggleListening = () => {
        const w = window as typeof window & {
            SpeechRecognition?: new () => any;
            webkitSpeechRecognition?: new () => any;
        };
        const SpeechRecognition = w.SpeechRecognition || w.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            toast.error("Your browser doesn't support Voice-to-Text.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = langMap[formData.preferred_prescription_language.trim().toLowerCase()] || "en-US";
        recognition.interimResults = false;

        recognition.onstart = () => setIsListening(true);
        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setFormData((prev) => ({
                ...prev,
                symptoms_raw_text: prev.symptoms_raw_text ? `${prev.symptoms_raw_text} ${transcript}` : transcript,
            }));
        };
        recognition.onerror = () => {
            toast.error("Error recognizing voice.");
            setIsListening(false);
        };
        recognition.onend = () => setIsListening(false);

        if (isListening) recognition.stop();
        else {
            recognition.start();
            toast.info("Listening...");
        }
    };

    const addAttachment = () =>
        setFormData((prev) => ({
            ...prev,
            attachments: [...prev.attachments, { file_url: "", file_type: "link" }],
        }));

    const updateAttachment = (index: number, url: string) =>
        setFormData((prev) => ({
            ...prev,
            attachments: prev.attachments.map((attachment, i) =>
                i === index ? { ...attachment, file_url: url } : attachment
            ),
        }));

    const removeAttachment = (index: number) =>
        setFormData((prev) => ({
            ...prev,
            attachments: prev.attachments.filter((_, i) => i !== index),
        }));

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const toastId = toast.loading("AI is analyzing your symptoms... Please wait.");

        const cleanData = {
            ...formData,
            attachments: formData.attachments.filter((a) => a.file_url.trim()),
        };

        try {
            const res = await fetch("/api/patient/consultations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(cleanData),
            });

            const data = await res.json();

            toast.update(toastId, {
                render: res.ok ? "Consultation created successfully!" : data.error || "Failed to create consultation.",
                type: res.ok ? "success" : "error",
                isLoading: false,
                autoClose: res.ok ? 3000 : 5000,
            });
        } catch {
            toast.update(toastId, {
                render: "Server timeout or network error.",
                type: "error",
                isLoading: false,
                autoClose: 5000,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-7">
            <div>
                <div className="mb-4">
                    <h2 className="text-base font-semibold text-foreground">Basic Information</h2>
                    <p className="mt-1 text-sm text-muted">These details help improve the preliminary assessment.</p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                            <UserRound className="h-4 w-4 text-primary" />
                            Age
                        </label>
                        <input type="number" required min="0" max="120" className={inputClass} value={formData.age} onChange={(e) => updateField("age", e.target.value)} placeholder="Enter your age" />
                    </div>

                    <div>
                        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                            <Scale className="h-4 w-4 text-primary" />
                            Weight
                        </label>
                        <div className="relative">
                            <input type="number" required min="1" max="300" step="0.1" className={`${inputClass} pr-14`} value={formData.weight_kg} onChange={(e) => updateField("weight_kg", e.target.value)} placeholder="Enter your weight" />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-muted">kg</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="border-t border-border pt-7">
                <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <label className="block text-sm font-semibold text-foreground">Describe Your Symptoms</label>
                        <p className="mt-1 text-xs text-muted">Include when they started, severity, and anything that makes them better or worse.</p>
                    </div>

                    <button type="button" onClick={toggleListening} className={`inline-flex w-fit items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition ${isListening ? "border-danger/20 bg-danger/10 text-danger" : "border-border bg-surface-secondary text-muted hover:border-primary/30 hover:text-foreground"}`}>
                        <Mic className={`h-4 w-4 ${isListening ? "animate-pulse" : ""}`} />
                        {isListening ? "Listening..." : "Dictate"}
                    </button>
                </div>

                <textarea required rows={7} className={`${inputClass} resize-y`} value={formData.symptoms_raw_text} onChange={(e) => updateField("symptoms_raw_text", e.target.value)} placeholder="Example: I have had a headache since yesterday..." />
            </div>

            <div className="border-t border-border pt-7">
                <div className="mb-3">
                    <label className="block text-sm font-semibold text-foreground">Attachment Links</label>
                    <p className="mt-1 text-xs text-muted">Optionally attach links to relevant reports, images, PDFs, or videos.</p>
                </div>

                <div className="space-y-2">
                    {formData.attachments.map((att, i) => (
                        <div key={i} className="flex gap-2">
                            <div className="relative flex-1">
                                <FileSymlink className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                                <input type="url" placeholder="https://..." className={`${inputClass} pl-10`} value={att.file_url} onChange={(e) => updateAttachment(i, e.target.value)} />
                            </div>
                            <button type="button" onClick={() => removeAttachment(i)} aria-label="Remove attachment" className="rounded-xl border border-danger/20 bg-danger/5 px-3 text-danger transition hover:bg-danger/10">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                    ))}
                </div>

                <button type="button" onClick={addAttachment} className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:text-primary-hover">
                    <Plus className="h-4 w-4" />
                    Add attachment link
                </button>
            </div>

            <div className="border-t border-border pt-7">
                <label className="mb-2 block text-sm font-semibold text-foreground">Preferred Prescription Language</label>
                <input type="text" className={inputClass} value={formData.preferred_prescription_language} onChange={(e) => updateField("preferred_prescription_language", e.target.value)} placeholder="English" />
                <p className="mt-2 text-xs text-muted">This language is also used when available for voice input and translated medical guidance.</p>
            </div>

            <div className="border-t border-border pt-7">
                <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50">
                    {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing Consultation...</> : "Submit Consultation"}
                </button>
            </div>
        </form>
    );
}