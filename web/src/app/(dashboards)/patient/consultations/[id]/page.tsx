import { Metadata } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Consultation from "@/models/Consultation";
import Department from "@/models/Department";
import User from "@/models/User";
import { redirect } from "next/navigation";
import { AlertTriangle, Ambulance, Clock3, ExternalLink, FileText, UserRound } from "lucide-react";
import PlayAudioButton from "@/components/patient/PlayAudioButton";
import EHRDownloadButton from "@/components/patient/EHRDownloadButton";

export const metadata: Metadata = {
    title: "Consultation Details | Somatic",
};

export default async function ConsultationDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    Department;
    User;

    const session = await getServerSession(authOptions);
    if (!session) redirect("/login");

    const { id } = await params;
    await dbConnect();

    const consultation = await Consultation.findById(id)
        .populate("assigned_department_id", "name")
        .populate("patient_id", "username")
        .populate("claimed_by_doctor_id", "username")
        .lean();

    if (!consultation) {
        return (
            <main className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-3xl rounded-2xl border border-danger/20 bg-danger/5 p-8 text-center">
                    <AlertTriangle className="mx-auto mb-3 h-10 w-10 text-danger" />
                    <h1 className="text-xl font-bold text-foreground">Consultation not found</h1>
                    <p className="mt-2 text-sm text-muted">The consultation may have been removed or is no longer available.</p>
                </div>
            </main>
        );
    }

    const isCompleted = consultation.status === "completed";
    const isEmergency = consultation.ai_draft?.is_emergency;
    const department = consultation.assigned_department_id as any;
    const doctor = consultation.claimed_by_doctor_id as any;
    const language = consultation.patient_input?.preferred_prescription_language || "English";

    const statusClass = isCompleted
        ? "border-success/30 bg-success/10 text-success"
        : consultation.status === "in_review"
            ? "border-info/30 bg-info/10 text-info"
            : "border-warning/30 bg-warning/10 text-warning";

    return (
        <main className="min-h-screen bg-background px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-5xl">
                <div className="mb-6">
                    <p className="text-xs font-semibold uppercase tracking-wider text-primary">Patient Portal</p>
                    <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                        Consultation Report
                    </h1>
                    {department?.name && (
                        <p className="mt-2 text-sm text-muted">
                            Routed to <span className="font-semibold text-primary">{department.name}</span> Department
                        </p>
                    )}
                </div>

                <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
                    <div className="flex flex-col gap-4 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent text-primary">
                                <FileText className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-foreground">Consultation Status</p>
                                <p className="mt-0.5 text-xs text-muted">Your medical consultation record</p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                            <span className={`inline-flex w-fit rounded-full border px-3 py-1.5 text-xs font-semibold capitalize ${statusClass}`}>
                                {consultation.status.replace("_", " ")}
                            </span>
                            {isCompleted && (
                                <EHRDownloadButton consultation={JSON.parse(JSON.stringify(consultation))} />
                            )}
                        </div>
                    </div>

                    <div className="space-y-6 p-5 sm:p-6 lg:p-8">
                        {isEmergency && (
                            <div className="flex gap-3 rounded-xl border border-danger/20 bg-danger/5 p-4">
                                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-danger" />
                                <div>
                                    <p className="font-semibold text-danger">Medical Emergency Alert</p>
                                    <p className="mt-1 text-sm leading-6 text-muted">
                                        AI detected potential life-threatening symptoms. Please seek immediate emergency medical care.
                                    </p>
                                </div>
                            </div>
                        )}

                        {consultation.ambulance_dispatch?.required && (
                            <div className="flex gap-3 rounded-xl border border-warning/20 bg-warning/5 p-4">
                                <Ambulance className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
                                <div>
                                    <p className="font-semibold text-foreground">Ambulance Requested</p>
                                    <p className="mt-1 text-sm text-muted">
                                        Status:{" "}
                                        <span className="font-semibold capitalize text-warning">
                                            {consultation.ambulance_dispatch.status.replace("_", " ")}
                                        </span>
                                        . A dispatcher will contact you shortly.
                                    </p>
                                </div>
                            </div>
                        )}

                        <section>
                            <SectionHeading icon={<UserRound className="h-4 w-4" />} title="Your Input" />

                            <div className="rounded-xl border border-border bg-surface-secondary p-4 sm:p-5">
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <InfoItem label="Age" value={`${consultation.patient_input?.age ?? "N/A"} years`} />
                                    <InfoItem label="Weight" value={`${consultation.patient_input?.weight_kg ?? "N/A"} kg`} />
                                </div>

                                <div className="mt-5 border-t border-border pt-5">
                                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">Symptoms</p>
                                    <p className="whitespace-pre-wrap text-sm leading-6 text-foreground">
                                        {consultation.patient_input?.symptoms_raw_text || "Not specified"}
                                    </p>
                                </div>

                                {consultation.patient_input?.attachments?.length > 0 && (
                                    <div className="mt-5 border-t border-border pt-5">
                                        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
                                            Attached Files / Reports
                                        </p>
                                        <div className="space-y-2">
                                            {consultation.patient_input.attachments.map((att: any, idx: number) => (
                                                <a
                                                    key={idx}
                                                    href={att.file_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-3 rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-primary transition hover:border-primary/30 hover:bg-accent"
                                                >
                                                    <ExternalLink className="h-4 w-4 shrink-0" />
                                                    <span className="truncate">Attachment Document {idx + 1}</span>
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>

                        {!isCompleted ? (
                            <section className="rounded-2xl border border-border bg-surface-secondary p-6 text-center sm:p-10">
                                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-primary">
                                    <Clock3 className="h-7 w-7 animate-pulse" />
                                </div>
                                <h2 className="mt-4 text-lg font-semibold text-foreground sm:text-xl">
                                    Awaiting Doctor's Review
                                </h2>
                                <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted">
                                    Your case is safely logged. Please wait while the assigned doctor reviews your consultation and prepares your final prescription.
                                </p>
                            </section>
                        ) : (
                            <>
                                <section>
                                    <SectionHeading title="Doctor's Final Prescription" />

                                    <div className="rounded-2xl border border-success/20 bg-success/5 p-5 sm:p-6">
                                        <div>
                                            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-success">Medicines</p>

                                            {consultation.doctor_final_prescription?.medicines?.length ? (
                                                <div className="space-y-2">
                                                    {consultation.doctor_final_prescription.medicines.map((med: string, i: number) => (
                                                        <div key={i} className="flex items-start gap-3 rounded-xl border border-success/10 bg-surface px-3 py-3">
                                                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-success/10 text-xs font-bold text-success">
                                                                {i + 1}
                                                            </span>
                                                            <span className="text-sm font-medium text-foreground">{med}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-muted">No medicines prescribed.</p>
                                            )}
                                        </div>

                                        {consultation.doctor_final_prescription?.instructions && (
                                            <div className="mt-6 border-t border-success/20 pt-6">
                                                <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                                    <p className="text-xs font-semibold uppercase tracking-wider text-success">
                                                        Instructions / Diet
                                                    </p>
                                                    <PlayAudioButton
                                                        text={consultation.doctor_final_prescription.translated_instructions || consultation.doctor_final_prescription.instructions}
                                                        lang={language}
                                                    />
                                                </div>

                                                {consultation.doctor_final_prescription.translated_instructions && (
                                                    <div className="mb-3 rounded-xl border border-success/10 bg-surface p-4 text-sm font-medium leading-6 text-foreground">
                                                        {consultation.doctor_final_prescription.translated_instructions}
                                                    </div>
                                                )}

                                                <div className="rounded-xl bg-surface-secondary p-4 text-sm leading-6 text-muted">
                                                    {consultation.doctor_final_prescription.translated_instructions && (
                                                        <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted">
                                                            English Original
                                                        </span>
                                                    )}
                                                    {consultation.doctor_final_prescription.instructions}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </section>

                                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                                    <InsightCard
                                        title="AI Summary & Advice"
                                        tone="info"
                                        translated={consultation.ai_draft?.translated_ai_summary_and_advice}
                                        original={consultation.ai_draft?.ai_summary_and_advice}
                                        lang={language}
                                    />

                                    <InsightCard
                                        title="Ayurvedic Insights"
                                        tone="primary"
                                        translated={consultation.ai_draft?.translated_ayurvedic_hints}
                                        original={consultation.ai_draft?.ayurvedic_hints || "No specific Ayurvedic correlation found."}
                                        lang={language}
                                        italic
                                    />
                                </div>
                            </>
                        )}

                        <div className="border-t border-border pt-5 text-xs text-muted">
                            Consultation ID: <span className="font-mono text-foreground">{String(consultation._id)}</span>
                            {doctor?.username && (
                                <span className="ml-2">
                                    · Assigned doctor: <span className="text-foreground">Dr. {doctor.username}</span>
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

function SectionHeading({ icon, title }: { icon?: React.ReactNode; title: string }) {
    return (
        <div className="mb-3 flex items-center gap-2">
            {icon && <span className="text-primary">{icon}</span>}
            <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground">{title}</h2>
        </div>
    );
}

function InfoItem({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl border border-border bg-surface p-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">{label}</p>
            <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
        </div>
    );
}

function InsightCard({
    title,
    tone,
    translated,
    original,
    lang,
    italic = false,
}: {
    title: string;
    tone: "info" | "primary";
    translated?: string;
    original: string;
    lang: string;
    italic?: boolean;
}) {
    const isInfo = tone === "info";
    const translatedText = translated?.trim();
    const originalText = original?.trim();

    return (
        <section className={`rounded-2xl border p-5 sm:p-6 ${isInfo ? "border-info/20 bg-info/5" : "border-primary/20 bg-accent"}`}>
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h2 className={`text-sm font-semibold uppercase tracking-wider ${isInfo ? "text-info" : "text-primary"}`}>
                    {title}
                </h2>
                <PlayAudioButton text={translatedText || originalText || ""} lang={lang} />
            </div>

            {translatedText && (
                <div className={`mb-3 rounded-xl border p-4 text-sm font-medium leading-6 text-foreground ${isInfo ? "border-info/10 bg-surface" : "border-primary/10 bg-surface"} ${italic ? "italic" : ""}`}>
                    {translatedText}
                </div>
            )}

            <div className={`text-sm leading-6 ${translatedText ? "rounded-xl bg-surface-secondary p-4 text-muted" : "text-foreground"} ${italic ? "italic" : ""}`}>
                {translatedText && (
                    <span className={`mb-1 block text-xs font-semibold uppercase tracking-wider not-italic ${isInfo ? "text-info" : "text-primary"}`}>
                        English Original
                    </span>
                )}
                <span className="whitespace-pre-wrap">{originalText || "No information available."}</span>
            </div>
        </section>
    );
}