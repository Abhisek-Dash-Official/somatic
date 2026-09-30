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

        if (!SpeechRecognition) {
            return toast.error("Your browser doesn't support Voice-to-Text.");
        }

        const langMap: Record<string, string> = {
            english: "en-US",
            hindi: "hi-IN",
            bengali: "bn-IN",
            telugu: "te-IN",
            marathi: "mr-IN",
            tamil: "ta-IN",
            urdu: "ur-IN",
            gujarati: "gu-IN",
            kannada: "kn-IN",
            malayalam: "ml-IN",
            odia: "or-IN",
            punjabi: "pa-IN",
            assamese: "as-IN",
            maithili: "mai-IN",
            spanish: "es-ES",
            french: "fr-FR",
            german: "de-DE",
            arabic: "ar-SA",
            chinese: "zh-CN",
            japanese: "ja-JP",
            korean: "ko-KR",
            russian: "ru-RU",
        };

        const typedLang = formData.preferred_prescription_language.trim().toLowerCase();
        const recognition = new SpeechRecognition();

        recognition.lang = langMap[typedLang] || "en-US";
        recognition.interimResults = false;

        recognition.onstart = () => setIsListening(true);

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;

            setFormData((prev) => ({
                ...prev,
                symptoms_raw_text: prev.symptoms_raw_text
                    ? `${prev.symptoms_raw_text} ${transcript}`
                    : transcript,
            }));
        };

        recognition.onerror = () => {
            toast.error("Error recognizing voice.");
            setIsListening(false);
        };

        recognition.onend = () => setIsListening(false);

        if (isListening) {
            recognition.stop();
        } else {
            recognition.start();
            toast.info("Listening...");
        }
    };

    const addAttachment = () => {
        setFormData((prev) => ({
            ...prev,
            attachments: [...prev.attachments, { file_url: "", file_type: "link" }],
        }));
    };

    const updateAttachment = (index: number, url: string) => {
        const newAtt = [...formData.attachments];
        newAtt[index].file_url = url;

        setFormData((prev) => ({
            ...prev,
            attachments: newAtt,
        }));
    };

    const removeAttachment = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            attachments: prev.attachments.filter((_, i) => i !== index),
        }));
    };

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const toastId = toast.loading("AI is analyzing your symptoms... Please wait.");

        const cleanData = {
            ...formData,
            attachments: formData.attachments.filter((a) => a.file_url.trim() !== ""),
        };

        try {
            const res = await fetch("/api/patient/consultations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(cleanData),
            });

            const data = await res.json();

            if (res.ok) {
                toast.update(toastId, {
                    render: "Consultation created successfully!",
                    type: "success",
                    isLoading: false,
                    autoClose: 3000,
                });
            } else {
                toast.update(toastId, {
                    render: data.error || "Failed to create consultation",
                    type: "error",
                    isLoading: false,
                    autoClose: 5000,
                });
            }
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

    const inputClass =
        "block w-full rounded-lg border border-border bg-background px-3 py-2.5 text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary";

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                    <label className="mb-1 block text-sm font-medium text-foreground">
                        Age
                    </label>
                    <input
                        type="number"
                        required
                        min="0"
                        max="120"
                        className={inputClass}
                        value={formData.age}
                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    />
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium text-foreground">
                        Weight (kg)
                    </label>
                    <input
                        type="number"
                        required
                        min="1"
                        max="300"
                        step="0.1"
                        className={inputClass}
                        value={formData.weight_kg}
                        onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })}
                    />
                </div>
            </div>

            <div>
                <div className="mb-1 flex items-end justify-between">
                    <label className="block text-sm font-medium text-foreground">
                        Describe Symptoms
                    </label>

                    <button
                        type="button"
                        onClick={toggleListening}
                        className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold transition ${isListening
                            ? "bg-danger/10 text-danger"
                            : "bg-surface-secondary text-muted hover:text-foreground"
                            }`}
                    >
                        <Mic className={`h-3 w-3 ${isListening ? "animate-pulse" : ""}`} />
                        {isListening ? "Listening..." : "Dictate"}
                    </button>
                </div>

                <textarea
                    required
                    rows={4}
                    className={inputClass}
                    value={formData.symptoms_raw_text}
                    onChange={(e) => setFormData({ ...formData, symptoms_raw_text: e.target.value })}
                />
            </div>

            <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                    Attachment Links (Optional)
                </label>

                {formData.attachments.map((att, i) => (
                    <div key={i} className="mb-2 flex gap-2">
                        <input
                            type="url"
                            placeholder="Paste link of image/pdf/video..."
                            className={`flex-1 ${inputClass}`}
                            value={att.file_url}
                            onChange={(e) => updateAttachment(i, e.target.value)}
                        />

                        <button
                            type="button"
                            onClick={() => removeAttachment(i)}
                            className="rounded-lg bg-danger/10 p-2.5 text-danger transition hover:bg-danger/20"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                ))}

                <button
                    type="button"
                    onClick={addAttachment}
                    className="mt-1 flex items-center gap-1 text-sm text-primary hover:text-primary-hover"
                >
                    <Plus className="h-4 w-4" />
                    Add Link
                </button>
            </div>

            <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                    Preferred Language
                </label>

                <input
                    type="text"
                    className={inputClass}
                    value={formData.preferred_prescription_language}
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            preferred_prescription_language: e.target.value,
                        })
                    }
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-primary p-3 font-semibold text-primary-foreground transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
                {loading ? "Submitting..." : "Submit Consultation"}
            </button>
        </form>
    );
}