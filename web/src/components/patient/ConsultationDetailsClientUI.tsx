"use client";

import { useState } from "react";
import { Clock, User, AlertTriangle, ExternalLink, Languages, Loader2 } from "lucide-react";

export default function ConsultationClientUI({ consultation }: { consultation: any }) {
    const [targetLang, setTargetLang] = useState("en");
    const [isTranslating, setIsTranslating] = useState(false);

    const [translatedTexts, setTranslatedTexts] = useState({
        instructions: consultation.doctor_final_prescription?.instructions || "",
        ai_summary: consultation.ai_draft?.ai_summary_and_advice || "",
        ayurvedic: consultation.ai_draft?.ayurvedic_hints || ""
    });

    const isCompleted = consultation.status === "completed";
    const isEmergency = consultation.ai_draft?.is_emergency;

    const handleTranslate = async (lang: string) => {
        setTargetLang(lang);
        if (lang === "en") {
            setTranslatedTexts({
                instructions: consultation.doctor_final_prescription?.instructions || "",
                ai_summary: consultation.ai_draft?.ai_summary_and_advice || "",
                ayurvedic: consultation.ai_draft?.ayurvedic_hints || ""
            });
            return;
        }

        if (!("translation" in window)) {
            alert("Your browser does not support the local Translation API. Please use Chrome with experimental web AI flags enabled.");
            setTargetLang("en");
            return;
        }

        setIsTranslating(true);
        try {
            const w = window as any;
            const canTranslate = await w.translation.canTranslate({
                sourceLanguage: "en",
                targetLanguage: lang,
            });

            if (canTranslate === "no") {
                alert(`Offline translation to ${lang} is not supported or the language pack is missing.`);
                setTargetLang("en");
                return;
            }

            const translator = await w.translation.createTranslator({
                sourceLanguage: "en",
                targetLanguage: lang,
            });

            const newInstructions = consultation.doctor_final_prescription?.instructions
                ? await translator.translate(consultation.doctor_final_prescription.instructions)
                : "";

            const newAiSummary = consultation.ai_draft?.ai_summary_and_advice
                ? await translator.translate(consultation.ai_draft.ai_summary_and_advice)
                : "";

            const newAyurvedic = consultation.ai_draft?.ayurvedic_hints
                ? await translator.translate(consultation.ai_draft.ayurvedic_hints)
                : "";

            setTranslatedTexts({
                instructions: newInstructions,
                ai_summary: newAiSummary,
                ayurvedic: newAyurvedic
            });

        } catch (error) {
            console.error("Translation error:", error);
            alert("Failed to translate locally.");
            setTargetLang("en");
        } finally {
            setIsTranslating(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 mt-10">
            <div className="bg-[#131C31] shadow-xl rounded-xl border border-slate-800/60 p-6 mb-6">

                {/* Header & Local Translation Selector */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-slate-700/50 pb-4 mb-5 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-100">Consultation Report</h1>
                        {consultation.assigned_department_id && (
                            <p className="text-blue-400 text-sm mt-1 font-medium">
                                Routed to: {consultation.assigned_department_id.name} Department
                            </p>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-[#0B1120] p-1.5 rounded-lg border border-slate-700">
                            <Languages className="w-4 h-4 text-slate-400 ml-1" />
                            <select
                                value={targetLang}
                                onChange={(e) => handleTranslate(e.target.value)}
                                disabled={isTranslating}
                                className="bg-transparent text-sm text-slate-200 outline-none cursor-pointer disabled:opacity-50"
                            >
                                <option value="en">English (Original)</option>
                                <option value="hi">Hindi</option>
                                <option value="es">Spanish</option>
                                <option value="fr">French</option>
                            </select>
                            {isTranslating && <Loader2 className="w-4 h-4 text-blue-400 animate-spin mr-1" />}
                        </div>

                        <span className={`px-3 py-1 rounded-full text-sm font-semibold border capitalize ${isCompleted ? "bg-green-500/10 text-green-400 border-green-500/20" :
                            consultation.status === "in_review" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                                "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                            }`}>
                            {consultation.status.replace("_", " ")}
                        </span>
                    </div>
                </div>

                {isEmergency && (
                    <div className="bg-red-900/20 border border-red-500/30 text-red-400 p-4 rounded-lg mb-6 shadow-sm">
                        <p className="font-bold mb-1 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" /> Medical Emergency Alert
                        </p>
                        <p className="text-sm opacity-90 ml-7">AI detected potential life-threatening symptoms. Please seek immediate emergency medical care!</p>
                    </div>
                )}

                {/* Patient Input (Always Visible) */}
                <div className="bg-[#0B1120] p-4 rounded-lg border border-slate-700/30 mb-6">
                    <h2 className="text-sm uppercase tracking-wider font-semibold text-slate-400 mb-3 flex items-center gap-2"><User className="w-4 h-4" /> Your Input</h2>
                    <ul className="text-slate-300 space-y-2 text-sm">
                        <li><strong className="text-slate-200">Age:</strong> {consultation.patient_input?.age} | <strong className="text-slate-200">Weight:</strong> {consultation.patient_input?.weight_kg} kg</li>
                        <li className="pt-2"><strong className="text-slate-200 block mb-1">Symptoms:</strong> <span className="opacity-90">{consultation.patient_input?.symptoms_raw_text}</span></li>

                        {consultation.patient_input?.attachments && consultation.patient_input.attachments.length > 0 && (
                            <li className="pt-4 border-t border-slate-700/50 mt-4">
                                <strong className="text-slate-200 block mb-2">Attached Files / Reports:</strong>
                                <ul className="space-y-2 pl-2 border-l-2 border-slate-700">
                                    {consultation.patient_input.attachments.map((att: any, idx: number) => (
                                        <li key={idx}>
                                            <a href={att.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 hover:underline break-all">
                                                <ExternalLink className="w-4 h-4 shrink-0" /> Attachment Document {idx + 1}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </li>
                        )}
                    </ul>
                </div>

                {/* CONDITIONAL RENDERING */}
                {!isCompleted ? (
                    <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-10 text-center flex flex-col items-center">
                        <Clock className="w-12 h-12 text-blue-500/70 mb-4 animate-pulse" />
                        <h3 className="text-xl font-semibold text-slate-200 mb-2">Awaiting Doctor's Review</h3>
                        <p className="text-slate-400 text-sm max-w-md">Your case is safely logged. Please wait until the assigned doctor completes their review and uploads your final prescription.</p>
                    </div>
                ) : (
                    <>
                        {/* DOCTOR FINAL PRESCRIPTION */}
                        <div className="bg-green-900/10 border border-green-800/30 p-5 rounded-lg mb-6">
                            <h2 className="text-sm uppercase tracking-wider font-semibold text-green-400 mb-4">Doctor's Final Prescription</h2>

                            <div className="space-y-4">
                                <div>
                                    <strong className="text-slate-300 block mb-1 text-sm">Medicines:</strong>
                                    <ul className="list-disc pl-5 text-slate-200 text-sm space-y-1">
                                        {consultation.doctor_final_prescription?.medicines?.map((med: string, i: number) => (
                                            <li key={i}>{med}</li>
                                        ))}
                                    </ul>
                                </div>

                                {translatedTexts.instructions && (
                                    <div>
                                        <strong className="text-slate-300 block mb-1 text-sm">Instructions / Diet:</strong>
                                        <p className="text-slate-200 text-sm">{translatedTexts.instructions}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* AI & AYURVEDIC DETAILS */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-slate-700/50">
                            <div className="bg-blue-900/10 border border-blue-800/30 p-4 rounded-lg">
                                <h2 className="text-sm uppercase tracking-wider font-semibold text-blue-400 mb-3">AI Summary & Advice</h2>
                                <p className="text-blue-200/80 text-sm whitespace-pre-wrap leading-relaxed">{translatedTexts.ai_summary}</p>
                            </div>

                            <div className="bg-emerald-900/10 border border-emerald-800/30 p-4 rounded-lg">
                                <h2 className="text-sm uppercase tracking-wider font-semibold text-emerald-400 mb-3">Ayurvedic Insights</h2>
                                <div className="text-emerald-200/80 text-sm italic leading-relaxed">
                                    {translatedTexts.ayurvedic || "No specific Ayurvedic correlation found."}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}