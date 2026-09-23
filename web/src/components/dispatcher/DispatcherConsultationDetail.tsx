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
        className: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
    },
    in_review: {
        label: "In Review",
        icon: Stethoscope,
        className: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    },
    completed: {
        label: "Completed",
        icon: CheckCircle2,
        className: "text-green-400 bg-green-500/10 border-green-500/20",
    },
};

const ambulanceConfig: Record<string, { label: string; className: string }> = {
    not_needed: {
        label: "Not Needed",
        className: "text-slate-400 bg-slate-500/10 border-slate-500/20",
    },
    pending: {
        label: "Pending",
        className: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
    },
    contacting_patient: {
        label: "Contacting Patient",
        className: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    },
    hospital_selected: {
        label: "Hospital Selected",
        className: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    },
    dispatched: {
        label: "Dispatched",
        className: "text-orange-400 bg-orange-500/10 border-orange-500/20",
    },
    arrived: {
        label: "Arrived",
        className: "text-green-400 bg-green-500/10 border-green-500/20",
    },
    cancelled: {
        label: "Cancelled",
        className: "text-red-400 bg-red-500/10 border-red-500/20",
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
            <div className="min-h-screen bg-[#0B1120] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
            </div>
        );
    }

    if (error || !consultation) {
        return (
            <div className="min-h-screen bg-[#0B1120] text-slate-300 px-4 py-8">
                <div className="max-w-3xl mx-auto">
                    <Link href="/dispatcher/consultations" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Consultations
                    </Link>

                    <div className="mt-6 bg-[#131C31] border border-red-500/20 rounded-2xl p-8 text-center">
                        <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
                        <h1 className="text-lg font-semibold text-white">Unable to Load Consultation</h1>
                        <p className="text-sm text-slate-500 mt-2">{error || "Consultation not found."}</p>
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

    const symptoms = consultation.ai_draft?.translated_symptoms || consultation.patient_input?.symptoms_raw_text || "No symptoms available";

    return (
        <div className="min-h-screen bg-[#0B1120] text-slate-300 overflow-x-hidden">
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-5 sm:space-y-6">
                <div className="flex items-center justify-between gap-3">
                    <Link href="/dispatcher/consultations" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Consultations
                    </Link>

                    <span className={`text-xs px-3 py-1.5 rounded-full border flex items-center gap-1.5 ${statusData.className}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {statusData.label}
                    </span>
                </div>

                <div className={`bg-[#131C31] border rounded-2xl p-5 sm:p-6 ${emergency ? "border-red-500/30" : "border-slate-800"}`}>
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-2xl sm:text-3xl font-bold text-white wrap-break-word">
                                    {patient?.username || "Unknown Patient"}
                                </h1>

                                {emergency && (
                                    <span className="text-xs px-2.5 py-1.5 rounded-full border border-red-500/20 bg-red-500/10 text-red-400 flex items-center gap-1.5">
                                        <AlertTriangle className="w-3.5 h-3.5" />
                                        Emergency
                                    </span>
                                )}
                            </div>

                            <p className="text-sm text-slate-500 mt-2">
                                Consultation ID: {consultation._id}
                            </p>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-500 shrink-0">
                            <CalendarDays className="w-4 h-4" />
                            {formatDate(consultation.created_at)}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    <div className="lg:col-span-2 space-y-5">
                        <Section title="Patient Information">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Info label="Name" value={patient?.username || "Unknown"} icon={User} />
                                <Info label="Age" value={consultation.patient_input?.age !== undefined ? String(consultation.patient_input.age) : "Not provided"} icon={User} />
                                <Info label="Blood Group" value={patient?.patient_info?.blood_grp || "Not provided"} icon={Stethoscope} />
                                <Info label="Language" value={consultation.patient_input?.preferred_prescription_language || "Not provided"} icon={MapPin} />
                                <Info label="Phone" value={patient?.contact_no || "Not provided"} icon={Phone} />
                                <Info label="Email" value={patient?.email || "Not provided"} icon={Mail} />
                            </div>

                            {patient?.address && (
                                <div className="mt-4 pt-4 border-t border-slate-800">
                                    <p className="text-xs text-slate-500 mb-1">Address</p>
                                    <p className="text-sm text-slate-300 wrap-break-word">{patient.address}</p>
                                </div>
                            )}
                        </Section>

                        <Section title="Patient Case">
                            <div>
                                <p className="text-xs text-slate-500 mb-2">Symptoms</p>
                                <p className="text-sm text-slate-300 leading-6 whitespace-pre-wrap wrap-break-word">{symptoms}</p>
                            </div>

                            {consultation.ai_draft?.chief_complaints?.length ? (
                                <div className="mt-5">
                                    <p className="text-xs text-slate-500 mb-2">Chief Complaints</p>

                                    <div className="flex flex-wrap gap-2">
                                        {consultation.ai_draft.chief_complaints.map((complaint, index) => (
                                            <span key={`${complaint}-${index}`} className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                                                {complaint}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ) : null}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5 pt-5 border-t border-slate-800">
                                <Info label="Weight" value={consultation.patient_input?.weight_kg !== undefined ? `${consultation.patient_input.weight_kg} kg` : "Not provided"} />
                                <Info label="Department" value={department?.name || "Unassigned"} icon={Stethoscope} />
                            </div>
                        </Section>

                        <Section title="AI Assessment">
                            <div className={`rounded-xl border p-4 ${emergency ? "border-red-500/20 bg-red-500/5" : "border-slate-800 bg-slate-900/30"}`}>
                                <div className="flex items-center gap-2">
                                    {emergency ? <AlertTriangle className="w-4 h-4 text-red-400" /> : <CheckCircle2 className="w-4 h-4 text-green-400" />}
                                    <p className={`text-sm font-medium ${emergency ? "text-red-400" : "text-green-400"}`}>
                                        {emergency ? "Emergency Case Detected" : "No Emergency Flag"}
                                    </p>
                                </div>

                                {consultation.ai_draft?.translated_symptoms && (
                                    <p className="text-sm text-slate-400 mt-3 leading-6 wrap-break-word">
                                        {consultation.ai_draft.translated_symptoms}
                                    </p>
                                )}
                            </div>
                        </Section>

                        <Section title="Doctor Information">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Info label="Doctor" value={doctor?.username || "Not assigned"} icon={User} />
                                <Info label="Qualification" value={doctor?.doctor_info?.qualification || "Not provided"} icon={Stethoscope} />
                                <Info label="Experience" value={doctor?.doctor_info?.experience !== undefined ? `${doctor.doctor_info.experience} years` : "Not provided"} />
                                <Info label="Phone" value={doctor?.contact_no || "Not provided"} icon={Phone} />
                                <Info label="Email" value={doctor?.email || "Not provided"} icon={Mail} />
                            </div>

                            {doctor?.contact_no && (
                                <a href={`tel:${doctor.contact_no}`} className="inline-flex items-center gap-2 mt-5 px-4 py-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition text-sm">
                                    <Phone className="w-4 h-4" />
                                    Contact Doctor
                                </a>
                            )}
                        </Section>
                    </div>

                    <div className="space-y-5">
                        <Section title="Ambulance Coordination">
                            <div className={`rounded-xl border p-4 ${ambulanceRequired ? "border-orange-500/20 bg-orange-500/5" : "border-slate-800 bg-slate-900/30"}`}>
                                <div className="flex items-center gap-2">
                                    <Ambulance className={`w-5 h-5 ${ambulanceRequired ? "text-orange-400" : "text-slate-500"}`} />
                                    <p className="text-sm font-medium text-white">
                                        {ambulanceRequired ? "Ambulance Required" : "No Ambulance Required"}
                                    </p>
                                </div>

                                {ambulanceRequired && (
                                    <div className="mt-4">
                                        <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border ${ambulanceStatusData.className}`}>
                                            <Ambulance className="w-3.5 h-3.5" />
                                            {ambulanceStatusData.label}
                                        </span>

                                        <Link href={`/dispatcher/ambulances/${consultation._id}`} className="flex items-center justify-center gap-2 mt-4 w-full px-4 py-2.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 hover:bg-orange-500/20 transition text-sm">
                                            Manage Ambulance
                                            <ArrowRight className="w-4 h-4" />
                                        </Link>
                                    </div>
                                )}
                            </div>

                            {ambulance?.patient_location?.address && (
                                <div className="mt-4">
                                    <p className="text-xs text-slate-500 mb-2">Patient Location</p>
                                    <div className="flex items-start gap-2">
                                        <MapPin className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                                        <p className="text-sm text-slate-300 wrap-break-word">{ambulance.patient_location.address}</p>
                                    </div>
                                </div>
                            )}

                            {ambulance?.receiving_hospital?.name && (
                                <div className="mt-4 pt-4 border-t border-slate-800">
                                    <p className="text-xs text-slate-500 mb-2">Receiving Hospital</p>
                                    <p className="text-sm font-medium text-white">{ambulance.receiving_hospital.name}</p>
                                    {ambulance.receiving_hospital.address && (
                                        <p className="text-xs text-slate-500 mt-1 wrap-break-word">{ambulance.receiving_hospital.address}</p>
                                    )}
                                </div>
                            )}
                        </Section>

                        <Section title="Contact Patient">
                            <div className="space-y-3">
                                {patient?.contact_no && (
                                    <a href={`tel:${patient.contact_no}`} className="flex items-center gap-3 p-3 rounded-lg bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition">
                                        <div className="w-9 h-9 rounded-lg bg-green-500/10 flex items-center justify-center">
                                            <Phone className="w-4 h-4 text-green-400" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs text-slate-500">Phone</p>
                                            <p className="text-sm text-slate-200 truncate">{patient.contact_no}</p>
                                        </div>
                                    </a>
                                )}

                                {patient?.email && (
                                    <a href={`mailto:${patient.email}`} className="flex items-center gap-3 p-3 rounded-lg bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition">
                                        <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                            <Mail className="w-4 h-4 text-blue-400" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs text-slate-500">Email</p>
                                            <p className="text-sm text-slate-200 truncate">{patient.email}</p>
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
        <section className="bg-[#131C31] border border-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-5">
            <h2 className="text-base font-semibold text-white mb-4">{title}</h2>
            {children}
        </section>
    );
}

function Info({ label, value, icon: Icon }: { label: string; value: string; icon?: typeof User }) {
    return (
        <div className="min-w-0">
            <p className="text-xs text-slate-500 mb-1">{label}</p>
            <div className="flex items-center gap-2 min-w-0">
                {Icon && <Icon className="w-3.5 h-3.5 text-slate-500 shrink-0" />}
                <p className="text-sm text-slate-300 wrap-break-word">{value}</p>
            </div>
        </div>
    );
}

function TimelineItem({ label, date }: { label: string; date?: Date | string }) {
    return (
        <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 shrink-0" />

            <div className="min-w-0">
                <p className="text-sm text-slate-300">{label}</p>
                <p className="text-xs text-slate-600 mt-1">{formatDate(date)}</p>
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