import { Metadata } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Consultation from "@/models/Consultation";
import Department from "@/models/Department";
import User from "@/models/User";
import { redirect } from "next/navigation";
import {
    Clock,
    User as UserIcon,
    AlertTriangle,
    ExternalLink,
    Ambulance,
} from "lucide-react";
import PlayAudioButton from "@/components/patient/PlayAudioButton";
import EHRDownloadButton from "@/components/patient/EHRDownloadButton";

export const metadata: Metadata = {
    title: "Consultation Details | Somatic",
};

export default async function ConsultationDetailsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    Department;
    User;

    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    const { id } = await params;

    await dbConnect();

    const consultation = await Consultation.findById(id)
        .populate("assigned_department_id", "name")
        .populate("patient_id", "username")
        .populate("claimed_by_doctor_id", "username")
        .lean();

    if (!consultation) {
        return (
            <div className="p-10 text-center font-bold text-danger">
                Consultation not found.
            </div>
        );
    }

    const isCompleted = consultation.status === "completed";
    const isEmergency = consultation.ai_draft?.is_emergency;

    return (
        <div className="mx-auto mt-6 max-w-4xl p-4 sm:mt-10 sm:p-6">
            <div className="mb-6 rounded-xl border border-border bg-surface p-4 sm:p-6">
                <div className="mb-5 flex flex-col items-start justify-between gap-4 border-b border-border pb-4 sm:flex-row sm:items-center">
                    <div className="w-full sm:w-auto">
                        <h1 className="text-xl font-bold text-foreground sm:text-2xl">
                            Consultation Report
                        </h1>

                        {consultation.assigned_department_id && (
                            <p className="mt-1 text-xs font-medium text-primary sm:text-sm">
                                Routed to:{" "}
                                {(consultation.assigned_department_id as any).name} Department
                            </p>
                        )}
                    </div>

                    <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
                        <span
                            className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold capitalize sm:text-sm ${isCompleted
                                    ? "border-success/30 bg-success/10 text-success"
                                    : consultation.status === "in_review"
                                        ? "border-info/30 bg-info/10 text-info"
                                        : "border-warning/30 bg-warning/10 text-warning"
                                }`}
                        >
                            {consultation.status.replace("_", " ")}
                        </span>

                        {isCompleted && (
                            <div className="mt-2 w-full sm:mt-0 sm:w-auto">
                                <EHRDownloadButton
                                    consultation={JSON.parse(JSON.stringify(consultation))}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {isEmergency && (
                    <div className="mb-6 rounded-lg border border-danger/30 bg-danger/10 p-4 text-danger">
                        <p className="mb-1 flex items-center gap-2 font-bold">
                            <AlertTriangle className="h-5 w-5 shrink-0" />
                            Medical Emergency Alert
                        </p>

                        <p className="ml-7 text-xs opacity-90 sm:text-sm">
                            AI detected potential life-threatening symptoms. Please seek
                            immediate emergency medical care!
                        </p>
                    </div>
                )}

                {consultation.ambulance_dispatch?.required && (
                    <div className="mb-6 rounded-lg border border-warning/30 bg-warning/10 p-4 text-warning">
                        <p className="mb-1 flex items-center gap-2 font-bold">
                            <Ambulance className="h-5 w-5 shrink-0" />
                            Ambulance Requested
                        </p>

                        <p className="ml-7 text-xs opacity-90 sm:text-sm">
                            Status:{" "}
                            <span className="font-bold uppercase">
                                {consultation.ambulance_dispatch.status.replace("_", " ")}
                            </span>
                            . A dispatcher will contact you shortly.
                        </p>
                    </div>
                )}

                <div className="mb-6 rounded-lg border border-border bg-background p-4">
                    <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted">
                        <UserIcon className="h-4 w-4" />
                        Your Input
                    </h2>

                    <ul className="space-y-2 text-sm text-foreground">
                        <li>
                            <strong className="text-foreground">Age:</strong>{" "}
                            {consultation.patient_input?.age}{" "}
                            <span className="text-muted">|</span>{" "}
                            <strong className="text-foreground">Weight:</strong>{" "}
                            {consultation.patient_input?.weight_kg} kg
                        </li>

                        <li className="pt-2">
                            <strong className="mb-1 block text-foreground">
                                Symptoms:
                            </strong>

                            <span className="text-muted">
                                {consultation.patient_input?.symptoms_raw_text}
                            </span>
                        </li>

                        {consultation.patient_input?.attachments &&
                            consultation.patient_input.attachments.length > 0 && (
                                <li className="mt-4 border-t border-border pt-4">
                                    <strong className="mb-2 block text-foreground">
                                        Attached Files / Reports:
                                    </strong>

                                    <ul className="space-y-2 overflow-hidden border-l-2 border-border pl-2">
                                        {consultation.patient_input.attachments.map(
                                            (att: any, idx: number) => (
                                                <li key={idx} className="truncate">
                                                    <a
                                                        href={att.file_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-1.5 text-primary hover:text-primary-hover hover:underline"
                                                    >
                                                        <ExternalLink className="h-4 w-4 shrink-0" />
                                                        <span className="truncate">
                                                            Attachment Document {idx + 1}
                                                        </span>
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
                    <div className="flex flex-col items-center rounded-lg border border-border bg-surface-secondary p-6 text-center sm:p-10">
                        <Clock className="mb-4 h-12 w-12 animate-pulse text-primary" />

                        <h3 className="mb-2 text-lg font-semibold text-foreground sm:text-xl">
                            Awaiting Doctor's Review
                        </h3>

                        <p className="max-w-md text-sm text-muted">
                            Your case is safely logged. Please wait until the assigned
                            doctor completes their review and uploads your final
                            prescription.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="mb-6 rounded-lg border border-success/30 bg-success/10 p-4 sm:p-5">
                            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-success">
                                Doctor's Final Prescription
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <strong className="mb-1 block text-sm text-foreground">
                                        Medicines:
                                    </strong>

                                    <ul className="space-y-1 pl-5 text-sm text-foreground">
                                        {consultation.doctor_final_prescription?.medicines?.map(
                                            (med: string, i: number) => (
                                                <li key={i} className="list-disc">
                                                    {med}
                                                </li>
                                            )
                                        )}
                                    </ul>
                                </div>

                                {consultation.doctor_final_prescription?.instructions && (
                                    <div className="mt-4 border-t border-success/20 pt-4">
                                        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                                            <strong className="block text-sm text-foreground">
                                                Instructions / Diet:
                                            </strong>

                                            <PlayAudioButton
                                                text={
                                                    consultation.doctor_final_prescription
                                                        .translated_instructions ||
                                                    consultation.doctor_final_prescription.instructions
                                                }
                                                lang={
                                                    consultation.patient_input
                                                        ?.preferred_prescription_language ||
                                                    "English"
                                                }
                                            />
                                        </div>

                                        {consultation.doctor_final_prescription
                                            .translated_instructions && (
                                                <p className="mb-3 rounded border border-success/20 bg-success/10 p-3 text-sm font-medium text-foreground">
                                                    {
                                                        consultation.doctor_final_prescription
                                                            .translated_instructions
                                                    }
                                                </p>
                                            )}

                                        <div className="rounded bg-background p-3 text-xs text-muted">
                                            <span className="mb-1 block text-muted-foreground">
                                                English Original:
                                            </span>

                                            {consultation.doctor_final_prescription.instructions}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-1 gap-4 border-t border-border pt-6 md:grid-cols-2 sm:gap-6">
                            <div className="rounded-lg border border-info/30 bg-info/10 p-4">
                                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                                    <h2 className="text-sm font-semibold uppercase tracking-wider text-info">
                                        AI Summary & Advice
                                    </h2>

                                    <PlayAudioButton
                                        text={
                                            consultation.ai_draft
                                                ?.translated_ai_summary_and_advice ||
                                            consultation.ai_draft?.ai_summary_and_advice ||
                                            ""
                                        }
                                        lang={
                                            consultation.patient_input
                                                ?.preferred_prescription_language ||
                                            "English"
                                        }
                                    />
                                </div>

                                {consultation.ai_draft?.translated_ai_summary_and_advice && (
                                    <p className="mb-3 rounded border border-info/20 bg-info/10 p-3 text-sm font-medium text-foreground">
                                        {consultation.ai_draft.translated_ai_summary_and_advice}
                                    </p>
                                )}

                                <div
                                    className={`whitespace-pre-wrap text-sm leading-relaxed ${consultation.ai_draft
                                            ?.translated_ai_summary_and_advice
                                            ? "rounded bg-background p-3 text-xs text-muted"
                                            : "text-foreground"
                                        }`}
                                >
                                    {consultation.ai_draft?.translated_ai_summary_and_advice && (
                                        <span className="mb-1 block text-muted-foreground">
                                            English Original:
                                        </span>
                                    )}

                                    {consultation.ai_draft?.ai_summary_and_advice}
                                </div>
                            </div>

                            <div className="rounded-lg border border-primary/30 bg-accent p-4">
                                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                                    <h2 className="text-sm font-semibold uppercase tracking-wider text-primary">
                                        Ayurvedic Insights
                                    </h2>

                                    <PlayAudioButton
                                        text={
                                            consultation.ai_draft?.translated_ayurvedic_hints ||
                                            consultation.ai_draft?.ayurvedic_hints ||
                                            ""
                                        }
                                        lang={
                                            consultation.patient_input
                                                ?.preferred_prescription_language ||
                                            "English"
                                        }
                                    />
                                </div>

                                {consultation.ai_draft?.translated_ayurvedic_hints && (
                                    <div className="mb-3 rounded border border-primary/20 bg-primary/10 p-3 text-sm font-medium italic text-foreground">
                                        {consultation.ai_draft.translated_ayurvedic_hints}
                                    </div>
                                )}

                                <div
                                    className={`text-sm italic leading-relaxed ${consultation.ai_draft?.translated_ayurvedic_hints
                                            ? "rounded bg-background p-3 text-xs text-muted"
                                            : "text-foreground"
                                        }`}
                                >
                                    {consultation.ai_draft?.translated_ayurvedic_hints && (
                                        <span className="mb-1 block not-italic text-muted-foreground">
                                            English Original:
                                        </span>
                                    )}

                                    {consultation.ai_draft?.ayurvedic_hints ||
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