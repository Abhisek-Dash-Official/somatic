"use client";

import { useState } from "react";
import {
    Clock,
    User,
    AlertTriangle,
    ExternalLink,
    Languages,
    Loader2,
} from "lucide-react";

export default function ConsultationClientUI({
    consultation,
}: {
    consultation: any;
}) {
    const [targetLang, setTargetLang] = useState("en");
    const [isTranslating, setIsTranslating] = useState(false);

    const [translatedTexts, setTranslatedTexts] = useState({
        instructions: consultation.doctor_final_prescription?.instructions || "",
        ai_summary: consultation.ai_draft?.ai_summary_and_advice || "",
        ayurvedic: consultation.ai_draft?.ayurvedic_hints || "",
    });

    const isCompleted = consultation.status === "completed";
    const isEmergency = consultation.ai_draft?.is_emergency;

    const handleTranslate = async (lang: string) => {
        setTargetLang(lang);

        if (lang === "en") {
            setTranslatedTexts({
                instructions: consultation.doctor_final_prescription?.instructions || "",
                ai_summary: consultation.ai_draft?.ai_summary_and_advice || "",
                ayurvedic: consultation.ai_draft?.ayurvedic_hints || "",
            });
            return;
        }

        if (!("translation" in window)) {
            alert(
                "Your browser does not support the local Translation API. Please use Chrome with experimental web AI flags enabled."
            );
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
                alert(
                    `Offline translation to ${lang} is not supported or the language pack is missing.`
                );
                setTargetLang("en");
                return;
            }

            const translator = await w.translation.createTranslator({
                sourceLanguage: "en",
                targetLanguage: lang,
            });

            const newInstructions =
                consultation.doctor_final_prescription?.instructions
                    ? await translator.translate(
                        consultation.doctor_final_prescription.instructions
                    )
                    : "";

            const newAiSummary = consultation.ai_draft?.ai_summary_and_advice
                ? await translator.translate(
                    consultation.ai_draft.ai_summary_and_advice
                )
                : "";

            const newAyurvedic = consultation.ai_draft?.ayurvedic_hints
                ? await translator.translate(
                    consultation.ai_draft.ayurvedic_hints
                )
                : "";

            setTranslatedTexts({
                instructions: newInstructions,
                ai_summary: newAiSummary,
                ayurvedic: newAyurvedic,
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
        <div className="mx-auto mt-10 max-w-4xl p-6">
            <div className="mb-6 rounded-xl border border-border bg-surface p-6 shadow-xl">
                <div className="mb-5 flex flex-col gap-4 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">
                            Consultation Report
                        </h1>

                        {consultation.assigned_department_id && (
                            <p className="mt-1 text-sm font-medium text-primary">
                                Routed to:{" "}
                                {consultation.assigned_department_id.name} Department
                            </p>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2 rounded-lg border border-border bg-background p-1.5">
                            <Languages className="ml-1 h-4 w-4 text-muted" />

                            <select
                                value={targetLang}
                                onChange={(e) => handleTranslate(e.target.value)}
                                disabled={isTranslating}
                                className="cursor-pointer bg-transparent text-sm text-foreground outline-none disabled:opacity-50"
                            >
                                <option value="en">English (Original)</option>
                                <option value="hi">Hindi</option>
                                <option value="es">Spanish</option>
                                <option value="fr">French</option>
                            </select>

                            {isTranslating && (
                                <Loader2 className="mr-1 h-4 w-4 animate-spin text-primary" />
                            )}
                        </div>

                        <span
                            className={`rounded-full border px-3 py-1 text-sm font-semibold capitalize ${isCompleted
                                    ? "border-success/20 bg-success/10 text-success"
                                    : consultation.status === "in_review"
                                        ? "border-info/20 bg-info/10 text-info"
                                        : "border-warning/20 bg-warning/10 text-warning"
                                }`}
                        >
                            {consultation.status.replace("_", " ")}
                        </span>
                    </div>
                </div>

                {isEmergency && (
                    <div className="mb-6 rounded-lg border border-danger/30 bg-danger/10 p-4 text-danger">
                        <p className="mb-1 flex items-center gap-2 font-bold">
                            <AlertTriangle className="h-5 w-5" />
                            Medical Emergency Alert
                        </p>

                        <p className="ml-7 text-sm">
                            AI detected potential life-threatening symptoms. Please seek immediate
                            emergency medical care!
                        </p>
                    </div>
                )}

                <div className="mb-6 rounded-lg border border-border bg-background p-4">
                    <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted">
                        <User className="h-4 w-4" />
                        Your Input
                    </h2>

                    <ul className="space-y-2 text-sm text-foreground">
                        <li>
                            <strong>Age:</strong> {consultation.patient_input?.age} |{" "}
                            <strong>Weight:</strong>{" "}
                            {consultation.patient_input?.weight_kg} kg
                        </li>

                        <li className="pt-2">
                            <strong className="mb-1 block">Symptoms:</strong>
                            <span className="text-muted">
                                {consultation.patient_input?.symptoms_raw_text}
                            </span>
                        </li>

                        {consultation.patient_input?.attachments &&
                            consultation.patient_input.attachments.length > 0 && (
                                <li className="mt-4 border-t border-border pt-4">
                                    <strong className="mb-2 block">
                                        Attached Files / Reports:
                                    </strong>

                                    <ul className="space-y-2 border-l-2 border-border pl-2">
                                        {consultation.patient_input.attachments.map(
                                            (att: any, idx: number) => (
                                                <li key={idx}>
                                                    <a
                                                        href={att.file_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-1.5 break-all text-primary hover:text-primary-hover hover:underline"
                                                    >
                                                        <ExternalLink className="h-4 w-4 shrink-0" />
                                                        Attachment Document {idx + 1}
                                                    </a>
                                                </li>
                                            )
                                        )}
                                    </ul>
                                </li>
                            )}
                    </ul>
                </div>

                {!isCompleted ? (
                    <div className="flex flex-col items-center rounded-lg border border-border bg-surface-secondary p-10 text-center">
                        <Clock className="mb-4 h-12 w-12 animate-pulse text-primary" />

                        <h3 className="mb-2 text-xl font-semibold text-foreground">
                            Awaiting Doctor's Review
                        </h3>

                        <p className="max-w-md text-sm text-muted">
                            Your case is safely logged. Please wait until the assigned doctor
                            completes their review and uploads your final prescription.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="mb-6 rounded-lg border border-success/20 bg-success/10 p-5">
                            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-success">
                                Doctor's Final Prescription
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <strong className="mb-1 block text-sm text-foreground">
                                        Medicines:
                                    </strong>

                                    <ul className="list-disc space-y-1 pl-5 text-sm text-foreground">
                                        {consultation.doctor_final_prescription?.medicines?.map(
                                            (med: string, i: number) => (
                                                <li key={i}>{med}</li>
                                            )
                                        )}
                                    </ul>
                                </div>

                                {translatedTexts.instructions && (
                                    <div>
                                        <strong className="mb-1 block text-sm text-foreground">
                                            Instructions / Diet:
                                        </strong>

                                        <p className="text-sm text-foreground">
                                            {translatedTexts.instructions}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-1 gap-6 border-t border-border pt-6 md:grid-cols-2">
                            <div className="rounded-lg border border-info/20 bg-info/10 p-4">
                                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-info">
                                    AI Summary & Advice
                                </h2>

                                <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                                    {translatedTexts.ai_summary}
                                </p>
                            </div>

                            <div className="rounded-lg border border-primary/20 bg-accent p-4">
                                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">
                                    Ayurvedic Insights
                                </h2>

                                <div className="text-sm italic leading-relaxed text-foreground">
                                    {translatedTexts.ayurvedic ||
                                        "No specific Ayurvedic correlation found."}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}