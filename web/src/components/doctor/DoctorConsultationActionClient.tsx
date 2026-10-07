"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
    Ambulance,
    BrainCircuit,
    Building2,
    Loader2,
    Plus,
    RotateCcw,
    Save,
    Stethoscope,
    User,
    Volume2,
    X,
} from "lucide-react";

export default function DoctorConsultationActionClient({ id }: { id: string }) {
    const router = useRouter();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [releasing, setReleasing] = useState(false);

    const [aiDraft, setAiDraft] = useState({
        chief_complaints: "",
        ai_summary_and_advice: "",
        ayurvedic_hints: "",
        is_emergency: false,
    });

    const [medicines, setMedicines] = useState<string[]>([""]);
    const [requireAmbulance, setRequireAmbulance] = useState(false);
    const [instructions, setInstructions] = useState("");
    const [followUp, setFollowUp] = useState("");

    useEffect(() => {
        const initData = async () => {
            try {
                const res = await fetch(`/api/doctor/consultations/${id}`);
                const json = await res.json();

                if (!res.ok) throw new Error("Failed to load");

                setData(json);
                setAiDraft({
                    chief_complaints: json.ai_draft?.chief_complaints?.join(", ") || "",
                    ai_summary_and_advice: json.ai_draft?.ai_summary_and_advice || "",
                    ayurvedic_hints: json.ai_draft?.ayurvedic_hints || "",
                    is_emergency: json.ai_draft?.is_emergency || false,
                });

                if (json.ai_draft?.suggested_medicines?.length > 0) {
                    setMedicines(json.ai_draft.suggested_medicines);
                }

                if (json.ambulance_dispatch?.required) {
                    setRequireAmbulance(true);
                }

                if (json.status === "pending_review") {
                    const claimRes = await fetch(`/api/doctor/consultations/${id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ action: "claim" }),
                    });

                    if (claimRes.ok) {
                        setData((prev: any) => ({ ...prev, status: "in_review" }));
                        toast.success("Case claimed!");
                    }
                }
            } catch {
                toast.error("Error loading case.");
                router.push("/doctor");
            } finally {
                setLoading(false);
            }
        };

        initData();
    }, [id, router]);

    const playAudio = (text: string, lang = "en-US") => {
        if (!("speechSynthesis" in window)) {
            toast.error("Screen reader not supported in this browser.");
            return;
        }

        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        window.speechSynthesis.speak(utterance);
    };

    const handleReleaseCase = async () => {
        setReleasing(true);

        try {
            const res = await fetch(`/api/doctor/consultations/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "release" }),
            });

            if (res.ok) {
                toast.success("Case released back to department queue.");
                router.push("/doctor");
            } else {
                toast.error("Failed to release case.");
            }
        } catch {
            toast.error("Network error.");
        } finally {
            setReleasing(false);
        }
    };

    const submitPrescription = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSubmitting(true);

        const cleanMeds = medicines.filter((medicine) => medicine.trim() !== "");
        const finalDraft = {
            ...aiDraft,
            chief_complaints: aiDraft.chief_complaints
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean),
        };

        try {
            const res = await fetch(`/api/doctor/consultations/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "complete",
                    ai_draft: finalDraft,
                    doctor_final_prescription: {
                        medicines: cleanMeds,
                        instructions,
                        next_follow_up: followUp ? new Date(followUp) : null,
                    },
                    requireAmbulance,
                }),
            });

            if (res.ok) {
                toast.success("Consultation completed successfully!");
                router.push("/doctor");
            } else {
                toast.error("Failed to complete consultation.");
            }
        } catch {
            toast.error("Network error.");
        } finally {
            setSubmitting(false);
        }
    };

    const inputClass =
        "mt-1 w-full rounded-xl border border-border bg-surface-secondary p-3 text-foreground placeholder:text-muted-foreground outline-none transition focus:border-primary/50 focus:ring-4 focus:ring-primary/10";

    if (loading) {
        return (
            <div className="flex justify-center py-32">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background py-8 text-foreground sm:py-10">
            <div className="mx-auto max-w-5xl space-y-6 px-4 sm:px-6">
                {data?.assigned_department_id && (
                    <div className="flex flex-col justify-between gap-4 rounded-2xl border border-info/20 bg-info/10 p-4 sm:flex-row sm:items-center">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-info/10 text-info">
                                <Building2 className="h-5 w-5" />
                            </div>

                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                                    Assigned Specialty
                                </p>
                                <p className="text-lg font-bold text-foreground">
                                    {data.assigned_department_id.name || "Specialty Department"}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            {data.status === "in_review" && (
                                <button
                                    type="button"
                                    onClick={handleReleaseCase}
                                    disabled={releasing}
                                    className="inline-flex items-center gap-2 rounded-xl border border-danger/20 bg-danger/10 px-4 py-2 text-xs font-semibold text-danger transition hover:bg-danger/20 disabled:opacity-50"
                                >
                                    {releasing ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <RotateCcw className="h-4 w-4" />
                                    )}
                                    Release Case Back to Queue
                                </button>
                            )}

                            <span className="rounded-xl border border-info/20 bg-info/10 px-3 py-1.5 text-xs font-medium capitalize text-info">
                                {data.status?.replace("_", " ")}
                            </span>
                        </div>
                    </div>
                )}

                <div className="flex items-start gap-5 rounded-2xl border border-border bg-surface p-5 sm:p-6">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary sm:h-16 sm:w-16">
                        <User className="h-7 w-7 sm:h-8 sm:w-8" />
                    </div>

                    <div className="min-w-0 flex-1">
                        <h2 className="text-xl font-bold text-foreground">
                            Patient Profile{" "}
                            <span className="text-sm font-normal text-muted">
                                ({data?.patient_id?.username || "Unknown"})
                            </span>
                        </h2>

                        <p className="mt-1 text-sm text-muted">
                            Age: {data?.patient_input?.age} | Weight:{" "}
                            {data?.patient_input?.weight_kg} kg | Lang:{" "}
                            {data?.patient_input?.preferred_prescription_language}
                        </p>

                        <p className="mt-1 text-sm text-muted">
                            Contact: {data?.patient_id?.contact_no || "N/A"} | Email:{" "}
                            {data?.patient_id?.email || "N/A"}
                        </p>

                        {data?.patient_id?.patient_info && (
                            <p className="mt-3 rounded-xl border border-danger/20 bg-danger/10 p-3 text-sm text-danger">
                                <strong>Blood Group:</strong>{" "}
                                {data.patient_id.patient_info.blood_grp || "N/A"} |{" "}
                                <strong>Allergies:</strong>{" "}
                                {data.patient_id.patient_info.known_allergies?.join(", ") || "None"}
                            </p>
                        )}

                        <p className="mt-3 rounded-xl border border-border bg-surface-secondary p-3 text-sm text-muted">
                            <strong className="text-foreground">Original Input:</strong>{" "}
                            {data?.patient_input?.symptoms_raw_text}
                        </p>

                        {data?.ai_draft?.translated_symptoms && (
                            <p className="mt-2 rounded-xl border border-info/20 bg-info/10 p-3 text-sm text-info">
                                <strong>English Translation (AI):</strong>{" "}
                                {data.ai_draft.translated_symptoms}
                            </p>
                        )}

                        {data?.patient_input?.attachments?.length > 0 && (
                            <div className="mt-4 rounded-xl border border-primary/20 bg-primary/10 p-3">
                                <strong className="mb-2 block text-sm text-primary">
                                    Patient Provided Links/Reports:
                                </strong>

                                <ul className="space-y-2 text-sm">
                                    {data.patient_input.attachments.map(
                                        (attachment: any, index: number) => (
                                            <li key={index}>
                                                <a
                                                    href={attachment.file_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="break-all text-muted transition hover:text-foreground hover:underline"
                                                >
                                                    View Report {index + 1}
                                                </a>
                                            </li>
                                        ),
                                    )}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>

                <form onSubmit={submitPrescription} className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-5 rounded-2xl border border-primary/20 bg-surface p-5 sm:p-6">
                        <h3 className="flex items-center gap-2 border-b border-border pb-3 text-lg font-bold text-primary">
                            <BrainCircuit className="h-5 w-5" />
                            Modify AI Draft
                        </h3>

                        <div>
                            <label className="text-sm font-medium text-muted">
                                Chief Complaints (Comma separated)
                            </label>

                            <input
                                type="text"
                                value={aiDraft.chief_complaints}
                                onChange={(e) =>
                                    setAiDraft({
                                        ...aiDraft,
                                        chief_complaints: e.target.value,
                                    })
                                }
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-muted">
                                    AI Summary & Advice
                                </label>

                                <button
                                    type="button"
                                    onClick={() => playAudio(aiDraft.ai_summary_and_advice)}
                                    className="inline-flex items-center gap-1 text-xs text-primary transition hover:text-primary-hover"
                                >
                                    <Volume2 className="h-3 w-3" />
                                    Listen
                                </button>
                            </div>

                            <textarea
                                rows={4}
                                value={aiDraft.ai_summary_and_advice}
                                onChange={(e) =>
                                    setAiDraft({
                                        ...aiDraft,
                                        ai_summary_and_advice: e.target.value,
                                    })
                                }
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-muted">Ayurvedic Hints</label>

                            <textarea
                                rows={2}
                                value={aiDraft.ayurvedic_hints}
                                onChange={(e) =>
                                    setAiDraft({
                                        ...aiDraft,
                                        ayurvedic_hints: e.target.value,
                                    })
                                }
                                className={inputClass}
                            />
                        </div>

                        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-danger/20 bg-danger/10 p-3">
                            <input
                                type="checkbox"
                                checked={aiDraft.is_emergency}
                                onChange={(e) =>
                                    setAiDraft({
                                        ...aiDraft,
                                        is_emergency: e.target.checked,
                                    })
                                }
                                className="h-5 w-5 accent-danger"
                            />

                            <span className="font-bold text-danger">Mark as Medical Emergency</span>
                        </label>

                        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-warning/20 bg-warning/10 p-3">
                            <input
                                type="checkbox"
                                checked={requireAmbulance}
                                onChange={(e) => setRequireAmbulance(e.target.checked)}
                                className="h-5 w-5 accent-warning"
                            />

                            <span className="flex items-center gap-2 font-bold text-warning">
                                <Ambulance className="h-5 w-5" />
                                Dispatch Ambulance
                            </span>
                        </label>
                    </div>

                    <div className="flex flex-col rounded-2xl border border-primary/20 bg-surface p-5 sm:p-6">
                        <h3 className="mb-5 flex items-center gap-2 border-b border-border pb-3 text-lg font-bold text-primary">
                            <Stethoscope className="h-5 w-5" />
                            Final Prescription
                        </h3>

                        <div className="flex-1 space-y-5">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-muted">
                                    Prescribed Medicines
                                </label>

                                {medicines.map((medicine, index) => (
                                    <div key={index} className="mb-2 flex gap-2">
                                        <input
                                            type="text"
                                            value={medicine}
                                            onChange={(e) => {
                                                const updated = [...medicines];
                                                updated[index] = e.target.value;
                                                setMedicines(updated);
                                            }}
                                            placeholder="e.g. Paracetamol 500mg 1-0-1"
                                            className="flex-1 rounded-xl border border-border bg-surface-secondary p-3 text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setMedicines(
                                                    medicines.filter((_, itemIndex) => itemIndex !== index),
                                                )
                                            }
                                            className="rounded-xl border border-danger/10 bg-danger/10 p-3 text-danger transition hover:bg-danger/20"
                                        >
                                            <X className="h-5 w-5" />
                                        </button>
                                    </div>
                                ))}

                                <button
                                    type="button"
                                    onClick={() => setMedicines([...medicines, ""])}
                                    className="mt-2 inline-flex items-center gap-1 text-sm text-primary transition hover:text-primary-hover hover:underline"
                                >
                                    <Plus className="h-4 w-4" />
                                    Add Medicine
                                </button>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-muted">
                                    Clinical Instructions / Diet
                                </label>

                                <textarea
                                    rows={3}
                                    value={instructions}
                                    onChange={(e) => setInstructions(e.target.value)}
                                    placeholder="Drink plenty of water..."
                                    className={inputClass}
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-muted">
                                    Next Follow-up Date (Optional)
                                </label>

                                <input
                                    type="date"
                                    value={followUp}
                                    onChange={(e) => setFollowUp(e.target.value)}
                                    className={inputClass}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting || data.status === "completed"}
                            className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 font-bold text-primary-foreground transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {submitting ? (
                                <Loader2 className="h-6 w-6 animate-spin" />
                            ) : (
                                <>
                                    <Save className="h-6 w-6" />
                                    Confirm & Resolve Case
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}