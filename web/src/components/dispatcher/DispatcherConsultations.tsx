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
    Phone,
    Search,
    Stethoscope,
    User,
    type LucideIcon,
} from "lucide-react";
import { useUserStore } from "@/store/useUserStore";
import type { IConsultation, IDepartment, IUser } from "@/types/models";

type PopulatedPatient = Pick<IUser, "username" | "email" | "contact_no" | "address" | "patient_info"> & { _id: string; };

type PopulatedDoctor = Pick<IUser, "username" | "email" | "contact_no" | "address" | "doctor_info"> & { _id: string; };

type PopulatedDepartment = Pick<IDepartment, "name"> & { _id: string; };

type PopulatedConsultation = Omit<IConsultation, "patient_id" | "assigned_department_id" | "claimed_by_doctor_id"> & {
    patient_id?: PopulatedPatient;
    assigned_department_id?: PopulatedDepartment;
    claimed_by_doctor_id?: PopulatedDoctor;
};

interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

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
    pending: {
        label: "Ambulance Pending",
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
        label: "Ambulance Dispatched",
        className: "text-orange-400 bg-orange-500/10 border-orange-500/20",
    },
    arrived: {
        label: "Ambulance Arrived",
        className: "text-green-400 bg-green-500/10 border-green-500/20",
    },
    cancelled: {
        label: "Ambulance Cancelled",
        className: "text-red-400 bg-red-500/10 border-red-500/20",
    },
};

export default function DispatcherConsultations() {
    const { fetchUser } = useUserStore();

    const [consultations, setConsultations] = useState<PopulatedConsultation[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("all");
    const [emergency, setEmergency] = useState("all");
    const [ambulance, setAmbulance] = useState("all");
    const [date, setDate] = useState("all");
    const [sort, setSort] = useState("priority");
    const [page, setPage] = useState(1);

    const fetchConsultations = async () => {
        try {
            setLoading(true);

            const params = new URLSearchParams();

            params.set("page", String(page));
            params.set("limit", "10");
            params.set("search", search);
            params.set("status", status);
            params.set("emergency", emergency);
            params.set("ambulance", ambulance);
            params.set("date", date);
            params.set("sort", sort);

            const res = await fetch(`/api/dispatcher/consultations?${params.toString()}`);

            if (!res.ok) throw new Error("Failed to fetch consultations");

            const data = await res.json();

            setConsultations(data.consultations || []);
            setPagination(data.pagination || null);
        } catch (error) {
            console.error(error);
            setConsultations([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    useEffect(() => {
        fetchConsultations();

        const interval = setInterval(fetchConsultations, 15000);

        return () => clearInterval(interval);
    }, [page, search, status, emergency, ambulance, date, sort]);

    const handleFilterChange = (setter: (value: string) => void, value: string) => {
        setter(value);
        setPage(1);
    };

    return (
        <div className="min-h-screen bg-[#0B1120] text-slate-300 overflow-x-hidden">
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-5 sm:space-y-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 text-blue-400 mb-2">
                            <Stethoscope className="w-4 h-4" />
                            <span className="text-xs sm:text-sm">Dispatcher Control Center</span>
                        </div>

                        <h1 className="text-2xl sm:text-3xl font-bold text-white">Consultations</h1>

                        <p className="text-sm text-slate-400 mt-2 max-w-2xl">
                            Monitor patient cases, doctor activity, emergencies and ambulance coordination.
                        </p>
                    </div>

                    <div className="shrink-0 rounded-xl border border-slate-800 bg-[#131C31] px-4 py-2 text-xs text-slate-400">
                        Auto refresh · 15s
                    </div>
                </div>

                <div className="bg-[#131C31] border border-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                        <div className="relative md:col-span-2 xl:col-span-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />

                            <input
                                value={search}
                                onChange={(e) => handleFilterChange(setSearch, e.target.value)}
                                placeholder="Search symptoms or complaint..."
                                className="w-full h-10 bg-[#0B1120] border border-slate-800 rounded-lg pl-9 pr-3 text-sm text-white placeholder:text-slate-600 outline-none focus:border-blue-500/50"
                            />
                        </div>

                        <FilterSelect value={status} onChange={(value) => handleFilterChange(setStatus, value)} options={[["all", "All Statuses"], ["pending_review", "Pending Review"], ["in_review", "In Review"], ["completed", "Completed"]]} />

                        <FilterSelect value={emergency} onChange={(value) => handleFilterChange(setEmergency, value)} options={[["all", "All Cases"], ["emergency", "Emergency Only"], ["normal", "Normal Only"]]} />

                        <FilterSelect value={ambulance} onChange={(value) => handleFilterChange(setAmbulance, value)} options={[["all", "All Ambulance"], ["required", "Ambulance Required"], ["not_required", "No Ambulance"]]} />

                        <FilterSelect value={date} onChange={(value) => handleFilterChange(setDate, value)} options={[["all", "All Dates"], ["today", "Today"], ["7days", "Last 7 Days"], ["30days", "Last 30 Days"]]} />

                        <FilterSelect value={sort} onChange={(value) => handleFilterChange(setSort, value)} options={[["priority", "Priority"], ["newest", "Newest"], ["oldest", "Oldest"]]} />
                    </div>
                </div>

                <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                        <p className="text-sm text-slate-400">
                            {pagination?.total || 0} consultation{pagination?.total === 1 ? "" : "s"}
                        </p>
                    </div>

                    {loading && <Loader2 className="w-4 h-4 text-blue-400 animate-spin shrink-0" />}
                </div>

                <div className="space-y-3">
                    {loading && consultations.length === 0 ? (
                        <div className="bg-[#131C31] border border-slate-800 rounded-xl sm:rounded-2xl py-16 flex justify-center">
                            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                        </div>
                    ) : consultations.length === 0 ? (
                        <div className="bg-[#131C31] border border-slate-800 rounded-xl sm:rounded-2xl py-16 px-4 text-center">
                            <Stethoscope className="w-10 h-10 text-slate-700 mx-auto mb-3" />

                            <p className="text-slate-400">No consultations found.</p>

                            <p className="text-xs text-slate-600 mt-1">Try changing your filters or search.</p>
                        </div>
                    ) : (
                        consultations.map((consultation) => (
                            <ConsultationCard key={consultation._id} consultation={consultation} />
                        ))
                    )}
                </div>

                {pagination && pagination.totalPages > 1 && <Pagination pagination={pagination} onPageChange={setPage} />}
            </div>
        </div>
    );
}

function ConsultationCard({ consultation }: { consultation: PopulatedConsultation }) {
    const status = consultation.status || "pending_review";
    const statusData = statusConfig[status] || statusConfig.pending_review;
    const StatusIcon = statusData.icon;

    const patient = consultation.patient_id?.username || "Unknown Patient";
    const doctor = consultation.claimed_by_doctor_id?.username || "Not assigned";
    const department = consultation.assigned_department_id?.name || "Unassigned";
    const emergency = consultation.ai_draft?.is_emergency === true;
    const ambulanceRequired = consultation.ambulance_dispatch?.required === true;
    const ambulanceStatus = consultation.ambulance_dispatch?.status;
    const symptoms = consultation.ai_draft?.translated_symptoms || consultation.patient_input?.symptoms_raw_text || "No symptoms available";

    return (
        <div className={`bg-[#131C31] border rounded-xl sm:rounded-2xl p-4 sm:p-5 transition hover:border-slate-700 ${emergency ? "border-red-500/30" : "border-slate-800"}`}>
            <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-base sm:text-lg font-semibold text-white wrap-break-word">{patient}</h2>

                        <span className={`text-[11px] sm:text-xs px-2.5 py-1 rounded-full border flex items-center gap-1 ${statusData.className}`}>
                            <StatusIcon className="w-3 h-3" />
                            {statusData.label}
                        </span>

                        {emergency && (
                            <span className="text-[11px] sm:text-xs px-2.5 py-1 rounded-full border border-red-500/20 bg-red-500/10 text-red-400 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                Emergency
                            </span>
                        )}
                    </div>

                    <p className="text-sm text-slate-400 mt-3 line-clamp-2 wrap-break-word">{symptoms}</p>

                    <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-x-5 sm:gap-y-2 mt-4 text-xs text-slate-500">
                        <InfoItem icon={Stethoscope} text={department} />
                        <InfoItem icon={User} text={`Doctor: ${doctor}`} />

                        {consultation.patient_input?.age !== undefined && (
                            <InfoItem icon={User} text={`Age: ${consultation.patient_input.age}`} />
                        )}

                        <InfoItem icon={CalendarDays} text={formatDate(consultation.created_at as string)} />
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row xl:flex-col gap-2 shrink-0">
                    {consultation.claimed_by_doctor_id?.contact_no && (
                        <a
                            href={`tel:${consultation.claimed_by_doctor_id.contact_no}`}
                            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-slate-200 transition"
                        >
                            <Phone className="w-4 h-4" />
                            Contact Doctor
                        </a>
                    )}

                    <Link
                        href={`/dispatcher/consultations/${consultation._id}`}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-lg text-sm text-blue-400 transition"
                    >
                        View Case
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap gap-2">
                {ambulanceRequired ? (
                    <Link
                        href={`/dispatcher/ambulances/${consultation._id}`}
                        className="text-xs px-2.5 py-1.5 rounded-lg border border-orange-500/20 bg-orange-500/10 text-orange-400 flex items-center gap-1.5 hover:bg-orange-500/15 transition"
                    >
                        <Ambulance className="w-3.5 h-3.5" />

                        {ambulanceStatus && ambulanceConfig[ambulanceStatus]
                            ? ambulanceConfig[ambulanceStatus].label
                            : "Ambulance Required"}
                    </Link>
                ) : (
                    <span className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-800 bg-slate-900/50 text-slate-500 flex items-center gap-1.5">
                        <Ambulance className="w-3.5 h-3.5" />
                        No Ambulance Required
                    </span>
                )}

                {consultation.patient_id?.contact_no && (
                    <a
                        href={`tel:${consultation.patient_id.contact_no}`}
                        className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-800 bg-slate-900/50 text-slate-400 hover:text-white transition flex items-center gap-1.5"
                    >
                        <Phone className="w-3.5 h-3.5" />
                        Contact Patient
                    </a>
                )}
            </div>
        </div>
    );
}

function InfoItem({ icon: Icon, text }: { icon: LucideIcon; text: string }) {
    return (
        <span className="flex items-start gap-1.5 min-w-0">
            <Icon className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span className="wrap-break-word">{text}</span>
        </span>
    );
}

function FilterSelect({ value, onChange, options }: { value: string; onChange: (value: string) => void; options: [string, string][] }) {
    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-10 bg-[#0B1120] border border-slate-800 rounded-lg px-3 text-sm text-slate-300 outline-none focus:border-blue-500/50"
        >
            {options.map(([optionValue, label]) => (
                <option key={optionValue} value={optionValue}>
                    {label}
                </option>
            ))}
        </select>
    );
}

function Pagination({ pagination, onPageChange }: { pagination: Pagination; onPageChange: (page: number) => void }) {
    const { page, totalPages } = pagination;

    return (
        <div className="flex items-center justify-center gap-2 pt-2">
            <button
                type="button"
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-800 bg-[#131C31] text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none transition"
            >
                <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="px-3 text-sm text-slate-400">Page {page} of {totalPages}</div>

            <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => onPageChange(page + 1)}
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-800 bg-[#131C31] text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none transition"
            >
                <ArrowRight className="w-4 h-4" />
            </button>
        </div>
    );
}

function formatDate(date: string) {
    if (!date) return "Unknown date";

    return new Date(date).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}