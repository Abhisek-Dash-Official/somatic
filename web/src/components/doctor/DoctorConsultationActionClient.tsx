"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
    Loader2,
    Plus,
    X,
    Stethoscope,
    Save,
    User,
    BrainCircuit,
    Building2,
    RotateCcw,
    Ambulance,
    Volume2,
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
            } catch (e) {
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
            return toast.error("Screen reader not supported in this browser.");
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
        } catch (e) {
            toast.error("Network error.");
        } finally {
            setReleasing(false);
        }
    };

    const submitPrescription = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSubmitting(true);

        const cleanMeds = medicines.filter((m) => m.trim() !== "");
        const finalDraft = {
            ...aiDraft,
            chief_complaints: aiDraft.chief_complaints
                .split(",")
                .map((s) => s.trim())
                .filter((s) => s),
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
        } catch (e) {
            toast.error("Network error.");
        } finally {
            setSubmitting(false);
        }
    };

    const inputClass =
        "w-full mt-1 bg-surface-secondary border border-border rounded-lg p-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition";

    if (loading) {
        return (
            <div className="flex justify-center py-32">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground py-10">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-8">
                {data?.assigned_department_id && (
                    <div className="bg-info/10 border border-info/20 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-info/10 rounded-lg text-info">
                                <Building2 className="w-5 h-5" />
                            </div>

                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                                    Assigned Specialty
                                </p>
                                <p className="text-foreground font-bold text-lg">
                                    {data.assigned_department_id.name || "Specialty Department"}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {data.status === "in_review" && (
                                <button
                                    type="button"
                                    onClick={handleReleaseCase}
                                    disabled={releasing}
                                    className="flex items-center gap-2 px-4 py-2 bg-danger/10 hover:bg-danger/20 border border-danger/20 text-danger text-xs font-semibold rounded-lg transition disabled:opacity-50"
                                >
                                    {releasing ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <RotateCcw className="w-4 h-4" />
                                    )}
                                    Release Case Back to Queue
                                </button>
                            )}

                            <span className="text-xs px-3 py-1 bg-info/10 text-info rounded-full border border-info/20 capitalize font-medium">
                                {data.status?.replace("_", " ")}
                            </span>
                        </div>
                    </div>
                )}

                <div className="bg-surface border border-border p-6 rounded-xl flex gap-6 items-start">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex shrink-0 items-center justify-center text-primary">
                        <User className="w-8 h-8" />
                    </div>

                    <div className="flex-1 min-w-0">
                        <h2 className="text-xl font-bold text-foreground">
                            Patient Profile{" "}
                            <span className="text-sm font-normal text-muted">
                                ({data?.patient_id?.username || "Unknown"})
                            </span>
                        </h2>

                        <p className="text-muted mt-1">
                            Age: {data?.patient_input?.age} | Weight:{" "}
                            {data?.patient_input?.weight_kg} kg | Lang:{" "}
                            {data?.patient_input?.preferred_prescription_language}
                        </p>

                        <p className="text-muted mt-1">
                            Contact: {data?.patient_id?.contact_no || "N/A"} | Email:{" "}
                            {data?.patient_id?.email || "N/A"}
                        </p>

                        {data?.patient_id?.patient_info && (
                            <p className="text-sm text-danger bg-danger/10 p-2 mt-2 rounded border border-danger/20">
                                <strong>Blood Group:</strong>{" "}
                                {data.patient_id.patient_info.blood_grp || "N/A"} |{" "}
                                <strong>Allergies:</strong>{" "}
                                {data.patient_id.patient_info.known_allergies?.join(", ") ||
                                    "None"}
                            </p>
                        )}

                        <p className="text-sm bg-surface-secondary p-3 mt-3 rounded-lg border border-border text-muted">
                            <strong className="text-foreground">Original Input:</strong>{" "}
                            {data?.patient_input?.symptoms_raw_text}
                        </p>

                        {data?.ai_draft?.translated_symptoms && (
                            <p className="text-sm bg-info/10 p-3 mt-2 rounded-lg border border-info/20 text-info">
                                <strong>English Translation (AI):</strong>{" "}
                                {data.ai_draft.translated_symptoms}
                            </p>
                        )}

                        {data?.patient_input?.attachments &&
                            data.patient_input.attachments.length > 0 && (
                                <div className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
                                    <strong className="text-primary block mb-2 text-sm">
                                        Patient Provided Links/Reports:
                                    </strong>

                                    <ul className="space-y-2 text-sm">
                                        {data.patient_input.attachments.map(
                                            (att: any, idx: number) => (
                                                <li key={idx} className="flex items-center gap-2">
                                                    <a
                                                        href={att.file_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-muted hover:text-foreground hover:underline break-all truncate"
                                                    >
                                                        View Report {idx + 1}
                                                    </a>
                                                </li>
                                            ),
                                        )}
                                    </ul>
                                </div>
                            )}
                    </div>
                </div>

                <form onSubmit={submitPrescription} className="grid md:grid-cols-2 gap-8">
                    <div className="bg-surface border border-primary/20 p-6 rounded-xl space-y-5">
                        <h3 className="flex items-center gap-2 text-lg font-bold text-primary border-b border-border pb-3">
                            <BrainCircuit className="w-5 h-5" />
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
                                    onClick={() =>
                                        playAudio(aiDraft.ai_summary_and_advice)
                                    }
                                    className="flex items-center gap-1 text-xs text-primary hover:text-primary-hover transition"
                                >
                                    <Volume2 className="w-3 h-3" />
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
                            <label className="text-sm font-medium text-muted">
                                Ayurvedic Hints
                            </label>

                            <textarea
                                rows={2}
                                value={aiDraft.ayurvedic_hints}
                                onChange={(e) =>
                                    setAiDraft({
                                        ...aiDraft,
                                        ayurvedic_hints: e.target.value,
                                    })
                                }
                                className={`${inputClass} text-accent-foreground focus:border-primary`}
                            />
                        </div>

                        <label className="flex items-center gap-3 bg-danger/10 p-3 rounded-lg border border-danger/20 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={aiDraft.is_emergency}
                                onChange={(e) =>
                                    setAiDraft({
                                        ...aiDraft,
                                        is_emergency: e.target.checked,
                                    })
                                }
                                className="w-5 h-5 rounded border-danger accent-danger"
                            />
                            <span className="text-danger font-bold">
                                Mark as Medical Emergency
                            </span>
                        </label>

                        <label className="flex items-center gap-3 bg-warning/10 p-3 rounded-lg border border-warning/20 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={requireAmbulance}
                                onChange={(e) =>
                                    setRequireAmbulance(e.target.checked)
                                }
                                className="w-5 h-5 rounded border-warning accent-warning"
                            />

                            <span className="text-warning font-bold flex items-center gap-2">
                                <Ambulance className="w-5 h-5" />
                                Dispatch Ambulance
                            </span>
                        </label>
                    </div>

                    <div className="bg-surface border border-primary/20 p-6 rounded-xl flex flex-col">
                        <h3 className="flex items-center gap-2 text-lg font-bold text-primary border-b border-border pb-3 mb-5">
                            <Stethoscope className="w-5 h-5" />
                            Final Prescription
                        </h3>

                        <div className="flex-1 space-y-5">
                            <div>
                                <label className="text-sm font-medium text-muted block mb-2">
                                    Prescribed Medicines
                                </label>

                                {medicines.map((med, i) => (
                                    <div key={i} className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            value={med}
                                            onChange={(e) => {
                                                const m = [...medicines];
                                                m[i] = e.target.value;
                                                setMedicines(m);
                                            }}
                                            placeholder="e.g. Paracetamol 500mg 1-0-1"
                                            className="flex-1 bg-surface-secondary border border-border rounded-lg p-3 text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setMedicines(
                                                    medicines.filter(
                                                        (_, idx) => idx !== i,
                                                    ),
                                                )
                                            }
                                            className="p-3 bg-danger/10 text-danger rounded-lg hover:bg-danger/20 border border-danger/10"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}

                                <button
                                    type="button"
                                    onClick={() => setMedicines([...medicines, ""])}
                                    className="text-sm text-primary flex items-center gap-1 hover:text-primary-hover hover:underline mt-2"
                                >
                                    <Plus className="w-4 h-4" />
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
                            className="mt-8 w-full py-4 bg-primary hover:bg-primary-hover text-primary-foreground font-bold rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                <>
                                    <Save className="w-6 h-6" />
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