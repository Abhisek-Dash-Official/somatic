"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
    AlertTriangle,
    Ambulance,
    ArrowLeft,
    ArrowRight,
    CalendarDays,
    CheckCircle2,
    Clock3,
    Loader2,
    Mail,
    MapPin,
    Phone,
    Stethoscope,
    User,
} from "lucide-react";
import type { IConsultation, IDepartment, IUser } from "@/types/models";

type PopulatedPatient = Pick<IUser, "username" | "email" | "contact_no" | "address" | "patient_info"> & {
    _id: string;
};

type PopulatedDoctor = Pick<IUser, "username" | "email" | "contact_no" | "address" | "doctor_info"> & {
    _id: string;
};

type PopulatedDepartment = Pick<IDepartment, "name"> & {
    _id: string;
};

type PopulatedConsultation = Omit<IConsultation, "patient_id" | "assigned_department_id" | "claimed_by_doctor_id"> & {
    _id: string;
    patient_id?: PopulatedPatient;
    assigned_department_id?: PopulatedDepartment;
    claimed_by_doctor_id?: PopulatedDoctor;
};

const statusConfig = {
    pending_review: {
        label: "Pending Review",
        icon: Clock3,
        className: "text-warning bg-warning/10 border-warning/20",
    },
    in_review: {
        label: "In Review",
        icon: Stethoscope,
        className: "text-info bg-info/10 border-info/20",
    },
    completed: {
        label: "Completed",
        icon: CheckCircle2,
        className: "text-success bg-success/10 border-success/20",
    },
};

const ambulanceConfig: Record<string, { label: string; className: string }> = {
    not_needed: {
        label: "Not Needed",
        className: "text-muted bg-surface-secondary border-border",
    },
    pending: {
        label: "Pending",
        className: "text-warning bg-warning/10 border-warning/20",
    },
    contacting_patient: {
        label: "Contacting Patient",
        className: "text-info bg-info/10 border-info/20",
    },
    hospital_selected: {
        label: "Hospital Selected",
        className: "text-primary bg-primary/10 border-primary/20",
    },
    dispatched: {
        label: "Dispatched",
        className: "text-info bg-info/10 border-info/20",
    },
    arrived: {
        label: "Arrived",
        className: "text-success bg-success/10 border-success/20",
    },
    cancelled: {
        label: "Cancelled",
        className: "text-danger bg-danger/10 border-danger/20",
    },
};

export default function DispatcherConsultationDetail({ consultationId }: { consultationId: string }) {
    const [consultation, setConsultation] = useState<PopulatedConsultation | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchConsultation = async () => {
            try {
                setLoading(true);
                setError("");

                const res = await fetch(`/api/dispatcher/consultations/${consultationId}`);

                if (!res.ok) {
                    const data = await res.json().catch(() => null);
                    throw new Error(data?.error || "Failed to fetch consultation");
                }

                const data = await res.json();
                setConsultation(data.consultation || null);
            } catch (error) {
                console.error(error);
                setError(error instanceof Error ? error.message : "Failed to load consultation");
            } finally {
                setLoading(false);
            }
        };

        fetchConsultation();
    }, [consultationId]);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !consultation) {
        return (
            <div className="min-h-screen bg-background px-4 py-8 text-foreground">
                <div className="mx-auto max-w-3xl">
                    <Link
                        href="/dispatcher/consultations"
                        className="inline-flex items-center gap-2 text-sm text-muted transition hover:text-foreground"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Consultations
                    </Link>

                    <div className="mt-6 rounded-xl border border-danger/20 bg-surface p-8 text-center">
                        <AlertTriangle className="mx-auto mb-3 h-10 w-10 text-danger" />
                        <h1 className="text-lg font-semibold">Unable to Load Consultation</h1>
                        <p className="mt-2 text-sm text-muted">{error || "Consultation not found."}</p>
                    </div>
                </div>
            </div>
        );
    }

    const status = consultation.status || "pending_review";
    const statusData = statusConfig[status] || statusConfig.pending_review;
    const StatusIcon = statusData.icon;

    const patient = consultation.patient_id;
    const doctor = consultation.claimed_by_doctor_id;
    const department = consultation.assigned_department_id;

    const emergency = consultation.ai_draft?.is_emergency === true;
    const ambulance = consultation.ambulance_dispatch;
    const ambulanceRequired = ambulance?.required === true;
    const ambulanceStatus = ambulance?.status || "not_needed";
    const ambulanceStatusData = ambulanceConfig[ambulanceStatus] || ambulanceConfig.not_needed;

    const symptoms =
        consultation.ai_draft?.translated_symptoms ||
        consultation.patient_input?.symptoms_raw_text ||
        "No symptoms available";

    return (
        <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
            <div className="mx-auto w-full max-w-7xl space-y-5 px-4 py-5 sm:space-y-6 sm:px-6 sm:py-8 lg:px-8">
                <div className="flex items-center justify-between gap-3">
                    <Link
                        href="/dispatcher/consultations"
                        className="inline-flex items-center gap-2 text-sm text-muted transition hover:text-foreground"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Consultations
                    </Link>

                    <span className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs ${statusData.className}`}>
                        <StatusIcon className="h-3.5 w-3.5" />
                        {statusData.label}
                    </span>
                </div>

                <div className={`rounded-xl border bg-surface p-5 sm:p-6 ${emergency ? "border-danger/30" : "border-border"}`}>
                    <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="wrap-break-word text-2xl font-bold sm:text-3xl">
                                    {patient?.username || "Unknown Patient"}
                                </h1>

                                {emergency && (
                                    <span className="flex items-center gap-1.5 rounded-full border border-danger/20 bg-danger/10 px-2.5 py-1.5 text-xs text-danger">
                                        <AlertTriangle className="h-3.5 w-3.5" />
                                        Emergency
                                    </span>
                                )}
                            </div>

                            <p className="mt-2 text-sm text-muted">
                                Consultation ID: {consultation._id}
                            </p>
                        </div>

                        <div className="flex shrink-0 items-center gap-2 text-xs text-muted">
                            <CalendarDays className="h-4 w-4" />
                            {formatDate(consultation.created_at)}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                    <div className="space-y-5 lg:col-span-2">
                        <Section title="Patient Information">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <Info label="Name" value={patient?.username || "Unknown"} icon={User} />
                                <Info label="Age" value={consultation.patient_input?.age !== undefined ? String(consultation.patient_input.age) : "Not provided"} icon={User} />
                                <Info label="Blood Group" value={patient?.patient_info?.blood_grp || "Not provided"} icon={Stethoscope} />
                                <Info label="Language" value={consultation.patient_input?.preferred_prescription_language || "Not provided"} icon={MapPin} />
                                <Info label="Phone" value={patient?.contact_no || "Not provided"} icon={Phone} />
                                <Info label="Email" value={patient?.email || "Not provided"} icon={Mail} />
                            </div>

                            {patient?.address && (
                                <div className="mt-4 border-t border-border pt-4">
                                    <p className="mb-1 text-xs text-muted-foreground">Address</p>
                                    <p className="wrap-break-word text-sm text-muted">{patient.address}</p>
                                </div>
                            )}
                        </Section>

                        <Section title="Patient Case">
                            <div>
                                <p className="mb-2 text-xs text-muted-foreground">Symptoms</p>
                                <p className="wrap-break-word whitespace-pre-wrap text-sm leading-6 text-muted">{symptoms}</p>
                            </div>

                            {consultation.ai_draft?.chief_complaints?.length ? (
                                <div className="mt-5">
                                    <p className="mb-2 text-xs text-muted-foreground">Chief Complaints</p>

                                    <div className="flex flex-wrap gap-2">
                                        {consultation.ai_draft.chief_complaints.map((complaint, index) => (
                                            <span
                                                key={`${complaint}-${index}`}
                                                className="rounded-lg border border-border bg-surface-secondary px-2.5 py-1.5 text-xs text-muted"
                                            >
                                                {complaint}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ) : null}

                            <div className="mt-5 grid grid-cols-1 gap-4 border-t border-border pt-5 sm:grid-cols-2">
                                <Info label="Weight" value={consultation.patient_input?.weight_kg !== undefined ? `${consultation.patient_input.weight_kg} kg` : "Not provided"} />
                                <Info label="Department" value={department?.name || "Unassigned"} icon={Stethoscope} />
                            </div>
                        </Section>

                        <Section title="AI Assessment">
                            <div className={`rounded-lg border p-4 ${emergency ? "border-danger/20 bg-danger/10" : "border-border bg-surface-secondary"}`}>
                                <div className="flex items-center gap-2">
                                    {emergency ? (
                                        <AlertTriangle className="h-4 w-4 text-danger" />
                                    ) : (
                                        <CheckCircle2 className="h-4 w-4 text-success" />
                                    )}
                                    <p className={`text-sm font-medium ${emergency ? "text-danger" : "text-success"}`}>
                                        {emergency ? "Emergency Case Detected" : "No Emergency Flag"}
                                    </p>
                                </div>

                                {consultation.ai_draft?.translated_symptoms && (
                                    <p className="mt-3 wrap-break-word text-sm leading-6 text-muted">
                                        {consultation.ai_draft.translated_symptoms}
                                    </p>
                                )}
                            </div>
                        </Section>

                        <Section title="Doctor Information">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <Info label="Doctor" value={doctor?.username || "Not assigned"} icon={User} />
                                <Info label="Qualification" value={doctor?.doctor_info?.qualification || "Not provided"} icon={Stethoscope} />
                                <Info label="Experience" value={doctor?.doctor_info?.experience !== undefined ? `${doctor.doctor_info.experience} years` : "Not provided"} />
                                <Info label="Phone" value={doctor?.contact_no || "Not provided"} icon={Phone} />
                                <Info label="Email" value={doctor?.email || "Not provided"} icon={Mail} />
                            </div>

                            {doctor?.contact_no && (
                                <a
                                    href={`tel:${doctor.contact_no}`}
                                    className="mt-5 inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/10 px-4 py-2.5 text-sm text-primary transition hover:bg-primary/15"
                                >
                                    <Phone className="h-4 w-4" />
                                    Contact Doctor
                                </a>
                            )}
                        </Section>
                    </div>

                    <div className="space-y-5">
                        <Section title="Ambulance Coordination">
                            <div className={`rounded-lg border p-4 ${ambulanceRequired ? "border-warning/20 bg-warning/10" : "border-border bg-surface-secondary"}`}>
                                <div className="flex items-center gap-2">
                                    <Ambulance className={`h-5 w-5 ${ambulanceRequired ? "text-warning" : "text-muted-foreground"}`} />
                                    <p className="text-sm font-medium">
                                        {ambulanceRequired ? "Ambulance Required" : "No Ambulance Required"}
                                    </p>
                                </div>

                                {ambulanceRequired && (
                                    <div className="mt-4">
                                        <span className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs ${ambulanceStatusData.className}`}>
                                            <Ambulance className="h-3.5 w-3.5" />
                                            {ambulanceStatusData.label}
                                        </span>

                                        <Link
                                            href={`/dispatcher/ambulances/${consultation._id}`}
                                            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-warning/20 bg-warning/10 px-4 py-2.5 text-sm text-warning transition hover:bg-warning/15"
                                        >
                                            Manage Ambulance
                                            <ArrowRight className="h-4 w-4" />
                                        </Link>
                                    </div>
                                )}
                            </div>

                            {ambulance?.patient_location?.address && (
                                <div className="mt-4">
                                    <p className="mb-2 text-xs text-muted-foreground">Patient Location</p>
                                    <div className="flex items-start gap-2">
                                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                                        <p className="wrap-break-word text-sm text-muted">{ambulance.patient_location.address}</p>
                                    </div>
                                </div>
                            )}

                            {ambulance?.receiving_hospital?.name && (
                                <div className="mt-4 border-t border-border pt-4">
                                    <p className="mb-2 text-xs text-muted-foreground">Receiving Hospital</p>
                                    <p className="text-sm font-medium">{ambulance.receiving_hospital.name}</p>
                                    {ambulance.receiving_hospital.address && (
                                        <p className="mt-1 wrap-break-word text-xs text-muted">
                                            {ambulance.receiving_hospital.address}
                                        </p>
                                    )}
                                </div>
                            )}
                        </Section>

                        <Section title="Contact Patient">
                            <div className="space-y-3">
                                {patient?.contact_no && (
                                    <a
                                        href={`tel:${patient.contact_no}`}
                                        className="flex items-center gap-3 rounded-lg border border-border bg-surface-secondary p-3 transition hover:border-primary/30 hover:bg-accent"
                                    >
                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-success/10">
                                            <Phone className="h-4 w-4 text-success" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs text-muted-foreground">Phone</p>
                                            <p className="truncate text-sm text-foreground">{patient.contact_no}</p>
                                        </div>
                                    </a>
                                )}

                                {patient?.email && (
                                    <a
                                        href={`mailto:${patient.email}`}
                                        className="flex items-center gap-3 rounded-lg border border-border bg-surface-secondary p-3 transition hover:border-primary/30 hover:bg-accent"
                                    >
                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-info/10">
                                            <Mail className="h-4 w-4 text-info" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs text-muted-foreground">Email</p>
                                            <p className="truncate text-sm text-foreground">{patient.email}</p>
                                        </div>
                                    </a>
                                )}
                            </div>
                        </Section>

                        <Section title="Timeline">
                            <div className="space-y-4">
                                <TimelineItem label="Consultation Created" date={consultation.created_at} />
                                {ambulance?.requested_at && <TimelineItem label="Ambulance Requested" date={ambulance.requested_at} />}
                                {ambulance?.dispatched_at && <TimelineItem label="Ambulance Dispatched" date={ambulance.dispatched_at} />}
                                {ambulance?.arrived_at && <TimelineItem label="Ambulance Arrived" date={ambulance.arrived_at} />}
                                {consultation.resolved_at && <TimelineItem label="Consultation Resolved" date={consultation.resolved_at} />}
                            </div>
                        </Section>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section className="rounded-xl border border-border bg-surface p-4 sm:p-5">
            <h2 className="mb-4 text-base font-semibold">{title}</h2>
            {children}
        </section>
    );
}

function Info({ label, value, icon: Icon }: { label: string; value: string; icon?: typeof User }) {
    return (
        <div className="min-w-0">
            <p className="mb-1 text-xs text-muted-foreground">{label}</p>
            <div className="flex min-w-0 items-center gap-2">
                {Icon && <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
                <p className="wrap-break-word text-sm text-muted">{value}</p>
            </div>
        </div>
    );
}

function TimelineItem({ label, date }: { label: string; date?: Date | string }) {
    return (
        <div className="flex items-start gap-3">
            <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />

            <div className="min-w-0">
                <p className="text-sm text-muted">{label}</p>
                <p className="mt-1 text-xs text-muted-foreground">{formatDate(date)}</p>
            </div>
        </div>
    );
}

function formatDate(date?: Date | string) {
    if (!date) return "Unknown date";

    return new Date(date).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}