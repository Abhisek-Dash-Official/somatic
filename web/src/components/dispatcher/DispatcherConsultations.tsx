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

type PopulatedPatient = Pick<
    IUser,
    "username" | "email" | "contact_no" | "address" | "patient_info"
> & { _id: string };

type PopulatedDoctor = Pick<
    IUser,
    "username" | "email" | "contact_no" | "address" | "doctor_info"
> & { _id: string };

type PopulatedDepartment = Pick<IDepartment, "name"> & { _id: string };

type PopulatedConsultation = Omit<
    IConsultation,
    "patient_id" | "assigned_department_id" | "claimed_by_doctor_id"
> & {
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
        className: "border-warning/20 bg-warning/10 text-warning",
    },
    in_review: {
        label: "In Review",
        icon: Stethoscope,
        className: "border-info/20 bg-info/10 text-info",
    },
    completed: {
        label: "Completed",
        icon: CheckCircle2,
        className: "border-success/20 bg-success/10 text-success",
    },
};

const ambulanceConfig: Record<string, { label: string; className: string }> = {
    pending: {
        label: "Ambulance Pending",
        className: "border-warning/20 bg-warning/10 text-warning",
    },
    contacting_patient: {
        label: "Contacting Patient",
        className: "border-info/20 bg-info/10 text-info",
    },
    hospital_selected: {
        label: "Hospital Selected",
        className: "border-primary/20 bg-primary/10 text-primary",
    },
    dispatched: {
        label: "Ambulance Dispatched",
        className: "border-info/20 bg-info/10 text-info",
    },
    arrived: {
        label: "Ambulance Arrived",
        className: "border-success/20 bg-success/10 text-success",
    },
    cancelled: {
        label: "Ambulance Cancelled",
        className: "border-danger/20 bg-danger/10 text-danger",
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
        <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
            <div className="mx-auto w-full max-w-7xl space-y-5 px-4 py-6 sm:space-y-6 sm:px-6 sm:py-8 lg:px-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div className="min-w-0">
                        <div className="mb-2 flex items-center gap-2 text-primary">
                            <Stethoscope className="h-4 w-4" />
                            <span className="text-xs sm:text-sm">
                                Dispatcher Control Center
                            </span>
                        </div>

                        <h1 className="text-2xl font-bold sm:text-3xl">Consultations</h1>

                        <p className="mt-2 max-w-2xl text-sm text-muted">
                            Monitor patient cases, doctor activity, emergencies and ambulance coordination.
                        </p>
                    </div>

                    <div className="shrink-0 rounded-xl border border-border bg-surface px-4 py-2.5 text-xs text-muted">
                        Auto refresh · 15s
                    </div>
                </div>

                <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-5">
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                        <div className="relative md:col-span-2 xl:col-span-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <input
                                value={search}
                                onChange={(e) => handleFilterChange(setSearch, e.target.value)}
                                placeholder="Search symptoms or complaint..."
                                className="h-11 w-full rounded-xl border border-border bg-surface-secondary pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                            />
                        </div>

                        <FilterSelect
                            value={status}
                            onChange={(value) => handleFilterChange(setStatus, value)}
                            options={[
                                ["all", "All Statuses"],
                                ["pending_review", "Pending Review"],
                                ["in_review", "In Review"],
                                ["completed", "Completed"],
                            ]}
                        />

                        <FilterSelect
                            value={emergency}
                            onChange={(value) => handleFilterChange(setEmergency, value)}
                            options={[
                                ["all", "All Cases"],
                                ["emergency", "Emergency Only"],
                                ["normal", "Normal Only"],
                            ]}
                        />

                        <FilterSelect
                            value={ambulance}
                            onChange={(value) => handleFilterChange(setAmbulance, value)}
                            options={[
                                ["all", "All Ambulance"],
                                ["required", "Ambulance Required"],
                                ["not_required", "No Ambulance"],
                            ]}
                        />

                        <FilterSelect
                            value={date}
                            onChange={(value) => handleFilterChange(setDate, value)}
                            options={[
                                ["all", "All Dates"],
                                ["today", "Today"],
                                ["7days", "Last 7 Days"],
                                ["30days", "Last 30 Days"],
                            ]}
                        />

                        <FilterSelect
                            value={sort}
                            onChange={(value) => handleFilterChange(setSort, value)}
                            options={[
                                ["priority", "Priority"],
                                ["newest", "Newest"],
                                ["oldest", "Oldest"],
                            ]}
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between gap-3">
                    <p className="text-sm text-muted">
                        {pagination?.total || 0} consultation
                        {pagination?.total === 1 ? "" : "s"}
                    </p>

                    {loading && (
                        <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" />
                    )}
                </div>

                <div className="space-y-3">
                    {loading && consultations.length === 0 ? (
                        <div className="flex justify-center rounded-2xl border border-border bg-surface py-16 shadow-sm">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : consultations.length === 0 ? (
                        <div className="rounded-2xl border border-border bg-surface px-4 py-16 text-center shadow-sm">
                            <Stethoscope className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                            <p className="text-muted">No consultations found.</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Try changing your filters or search.
                            </p>
                        </div>
                    ) : (
                        consultations.map((consultation) => (
                            <ConsultationCard
                                key={consultation._id}
                                consultation={consultation}
                            />
                        ))
                    )}
                </div>

                {pagination && pagination.totalPages > 1 && (
                    <Pagination pagination={pagination} onPageChange={setPage} />
                )}
            </div>
        </div>
    );
}

function ConsultationCard({
    consultation,
}: {
    consultation: PopulatedConsultation;
}) {
    const status = consultation.status || "pending_review";
    const statusData = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending_review;
    const StatusIcon = statusData.icon;

    const patient = consultation.patient_id?.username || "Unknown Patient";
    const doctor = consultation.claimed_by_doctor_id?.username || "Not assigned";
    const department = consultation.assigned_department_id?.name || "Unassigned";
    const emergency = consultation.ai_draft?.is_emergency === true;
    const ambulanceRequired = consultation.ambulance_dispatch?.required === true;
    const ambulanceStatus = consultation.ambulance_dispatch?.status;

    const symptoms =
        consultation.ai_draft?.translated_symptoms ||
        consultation.patient_input?.symptoms_raw_text ||
        "No symptoms available";

    return (
        <div
            className={`rounded-2xl border bg-surface p-4 shadow-sm transition sm:p-5 ${emergency ? "border-danger/30" : "border-border"
                } hover:border-primary/30`}
        >
            <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-start">
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <h2 className="wrap-break-word text-base font-semibold sm:text-lg">
                            {patient}
                        </h2>

                        <span
                            className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] sm:text-xs ${statusData.className}`}
                        >
                            <StatusIcon className="h-3 w-3" />
                            {statusData.label}
                        </span>

                        {emergency && (
                            <span className="flex items-center gap-1 rounded-full border border-danger/20 bg-danger/10 px-2.5 py-1 text-[11px] text-danger sm:text-xs">
                                <AlertTriangle className="h-3 w-3" />
                                Emergency
                            </span>
                        )}
                    </div>

                    <p className="mt-3 line-clamp-2 wrap-break-word text-sm text-muted">
                        {symptoms}
                    </p>

                    <div className="mt-4 flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:flex-wrap sm:gap-x-5 sm:gap-y-2">
                        <InfoItem icon={Stethoscope} text={department} />
                        <InfoItem icon={User} text={`Doctor: ${doctor}`} />

                        {consultation.patient_input?.age !== undefined && (
                            <InfoItem
                                icon={User}
                                text={`Age: ${consultation.patient_input.age}`}
                            />
                        )}

                        <InfoItem
                            icon={CalendarDays}
                            text={formatDate(consultation.created_at as string)}
                        />
                    </div>
                </div>

                <div className="flex shrink-0 flex-col gap-2 sm:flex-row xl:flex-col">
                    {consultation.claimed_by_doctor_id?.contact_no && (
                        <a
                            href={`tel:${consultation.claimed_by_doctor_id.contact_no}`}
                            className="flex items-center justify-center gap-2 rounded-xl border border-border bg-surface-secondary px-4 py-2.5 text-sm text-muted transition hover:bg-accent hover:text-foreground"
                        >
                            <Phone className="h-4 w-4" />
                            Contact Doctor
                        </a>
                    )}

                    <Link
                        href={`/dispatcher/consultations/${consultation._id}`}
                        className="flex items-center justify-center gap-2 rounded-xl border border-primary/20 bg-primary/10 px-4 py-2.5 text-sm text-primary transition hover:bg-primary/15"
                    >
                        View Case
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
                {ambulanceRequired ? (
                    <Link
                        href={`/dispatcher/ambulances/${consultation._id}`}
                        className="flex items-center gap-1.5 rounded-xl border border-warning/20 bg-warning/10 px-2.5 py-1.5 text-xs text-warning transition hover:bg-warning/15"
                    >
                        <Ambulance className="h-3.5 w-3.5" />
                        {ambulanceStatus && ambulanceConfig[ambulanceStatus]
                            ? ambulanceConfig[ambulanceStatus].label
                            : "Ambulance Required"}
                    </Link>
                ) : (
                    <span className="flex items-center gap-1.5 rounded-xl border border-border bg-surface-secondary px-2.5 py-1.5 text-xs text-muted">
                        <Ambulance className="h-3.5 w-3.5" />
                        No Ambulance Required
                    </span>
                )}

                {consultation.patient_id?.contact_no && (
                    <a
                        href={`tel:${consultation.patient_id.contact_no}`}
                        className="flex items-center gap-1.5 rounded-xl border border-border bg-surface-secondary px-2.5 py-1.5 text-xs text-muted transition hover:bg-accent hover:text-foreground"
                    >
                        <Phone className="h-3.5 w-3.5" />
                        Contact Patient
                    </a>
                )}
            </div>
        </div>
    );
}

function InfoItem({ icon: Icon, text }: { icon: LucideIcon; text: string }) {
    return (
        <span className="flex min-w-0 items-start gap-1.5">
            <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span className="wrap-break-word">{text}</span>
        </span>
    );
}

function FilterSelect({
    value,
    onChange,
    options,
}: {
    value: string;
    onChange: (value: string) => void;
    options: [string, string][];
}) {
    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-11 w-full rounded-xl border border-border bg-surface-secondary px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
        >
            {options.map(([optionValue, label]) => (
                <option key={optionValue} value={optionValue}>
                    {label}
                </option>
            ))}
        </select>
    );
}

function Pagination({
    pagination,
    onPageChange,
}: {
    pagination: Pagination;
    onPageChange: (page: number) => void;
}) {
    const { page, totalPages } = pagination;

    return (
        <div className="flex items-center justify-center gap-2 pt-2">
            <button
                type="button"
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-muted transition hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
            >
                <ArrowLeft className="h-4 w-4" />
            </button>

            <div className="rounded-xl border border-border bg-surface px-4 py-2 text-sm text-muted">
                Page {page} of {totalPages}
            </div>

            <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => onPageChange(page + 1)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-muted transition hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
            >
                <ArrowRight className="h-4 w-4" />
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