"use client";

import Link from "next/link";
import { toast } from "react-toastify";
import { useCallback, useEffect, useState } from "react";
import {
    Ambulance,
    ArrowLeft,
    CheckCircle2,
    Clock3,
    Hospital,
    Loader2,
    MapPin,
    Phone,
    Send,
    XCircle,
    Activity,
    ChevronRight
} from "lucide-react";

type RequestData = {
    _id: string;
    ai_draft?: {
        is_emergency?: boolean;
        chief_complaints?: string[];
        translated_symptoms?: string;
    };
    patient_info?: {
        username?: string;
        email?: string;
        contact_no?: string;
        address?: string;
        patient_info?: {
            blood_grp?: string;
            known_allergies?: string[];
            chronic_diseases?: string[];
        };
    };
    department_info?: {
        name?: string;
    };
    doctor_info?: {
        username?: string;
        email?: string;
        contact_no?: string;
    };
    ambulance_dispatch?: {
        status?: string;
        patient_location?: {
            address?: string;
            coordinates?: [number, number];
        };
        receiving_hospital?: {
            hospital_id?: string;
            name?: string;
            address?: string;
        };
        hospital_confirmation?: {
            confirmed?: boolean;
            confirmed_at?: string;
        };
        ambulance_service?: {
            name?: string;
            contact_no?: string;
            vehicle_no?: string;
        };
        requested_at?: string;
        dispatched_at?: string;
        arrived_at?: string;
        cancelled_at?: string;
        cancellation_reason?: string;
    };
};

type HospitalData = {
    _id: string;
    name: string;
    address: string;
    contact?: {
        phone?: string;
        emergency_phone?: string;
        email?: string;
    };
    has_ambulance?: boolean;
};

const statusLabels: Record<string, string> = {
    pending: "Pending",
    contacting_patient: "Contacting Patient",
    hospital_selected: "Hospital Selected",
    dispatched: "Dispatched",
    arrived: "Arrived",
    cancelled: "Cancelled",
};

export default function DispatcherAmbulanceDetail({ consultationId }: { consultationId: string }) {
    const [request, setRequest] = useState<RequestData | null>(null);
    const [hospitals, setHospitals] = useState<HospitalData[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);
    const [hospitalLoading, setHospitalLoading] = useState(false);

    const [address, setAddress] = useState("");
    const [latitude, setLatitude] = useState("");
    const [longitude, setLongitude] = useState("");

    const [selectedHospital, setSelectedHospital] = useState("");
    const [ambulanceName, setAmbulanceName] = useState("");
    const [ambulanceContact, setAmbulanceContact] = useState("");
    const [vehicleNo, setVehicleNo] = useState("");
    const [cancelReason, setCancelReason] = useState("");

    const fetchRequest = useCallback(async () => {
        try {
            const res = await fetch(`/api/dispatcher/ambulances/${consultationId}`);

            if (!res.ok) throw new Error("Failed to fetch request");

            const data = await res.json();
            const current = data.request;

            setRequest(current);

            setAddress(current?.ambulance_dispatch?.patient_location?.address || "");
            setLatitude(String(current?.ambulance_dispatch?.patient_location?.coordinates?.[1] ?? ""));
            setLongitude(String(current?.ambulance_dispatch?.patient_location?.coordinates?.[0] ?? ""));
            setSelectedHospital(current?.ambulance_dispatch?.receiving_hospital?.hospital_id || "");
            setAmbulanceName(current?.ambulance_dispatch?.ambulance_service?.name || "");
            setAmbulanceContact(current?.ambulance_dispatch?.ambulance_service?.contact_no || "");
            setVehicleNo(current?.ambulance_dispatch?.ambulance_service?.vehicle_no || "");
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [consultationId]);

    useEffect(() => {
        fetchRequest();
    }, [fetchRequest]);

    const performAction = async (action: string, body: Record<string, unknown> = {}) => {
        try {
            setActionLoading(true);

            const res = await fetch(`/api/dispatcher/ambulances/${consultationId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action, ...body }),
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.error || "Something went wrong");
                return false;
            }

            toast.success(data.message || "Status updated successfully");
            await fetchRequest();
            return true;
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong");
            return false;
        } finally {
            setActionLoading(false);
        }
    };

    const validateAmbulanceDetails = () => {
        if (!ambulanceName.trim() || !ambulanceContact.trim() || !vehicleNo.trim()) {
            toast.warn("Please fill in all ambulance details before updating this status");
            return false;
        }

        return true;
    };

    const findHospitals = async () => {
        try {
            if (!latitude || !longitude) {
                toast.error("Enter patient latitude and longitude first");
                return;
            }

            setHospitalLoading(true);
            setHospitals([]);

            const res = await fetch(
                `/api/dispatcher/ambulances/${consultationId}/hospitals?latitude=${latitude}&longitude=${longitude}`,
            );

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.error || "Unable to find hospitals");
                return;
            }

            setHospitals(data.hospitals || []);

            if (data.hospitals?.length) {
                toast.success(`${data.hospitals.length} nearby hospital(s) found`);
            } else {
                toast.info("No active hospitals found within 10 km");
            }
        } catch (error) {
            console.error(error);
            toast.error("Unable to find nearby hospitals");
        } finally {
            setHospitalLoading(false);
        }
    };

    const saveLocation = async () => {
        if (!address.trim()) {
            toast.error("Enter the patient's current address or landmark");
            return;
        }

        if (!latitude || !longitude) {
            toast.error("Enter the patient's latitude and longitude");
            return;
        }

        setLocationLoading(true);

        const success = await performAction("save_location", {
            address: address.trim(),
            latitude,
            longitude,
        });

        if (success) {
            toast.success("Patient location saved");
        }

        setLocationLoading(false);
    };

    const status = request?.ambulance_dispatch?.status || "pending";

    if (loading) {
        return (
            <main className="min-h-screen bg-background px-4 py-8 text-foreground">
                <div className="mx-auto flex max-w-7xl items-center justify-center py-32">
                    <Loader2 className="h-7 w-7 animate-spin text-primary" />
                </div>
            </main>
        );
    }

    if (!request) {
        return (
            <main className="min-h-screen bg-background px-4 py-8 text-foreground">
                <div className="mx-auto max-w-7xl rounded-xl border border-border bg-surface p-10 text-center">
                    <XCircle className="mx-auto h-10 w-10 text-danger" />
                    <h1 className="mt-4 text-xl font-semibold">Ambulance request not found</h1>
                    <Link
                        href="/dispatcher/ambulances"
                        className="mt-5 inline-flex rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary-hover"
                    >
                        Back to Requests
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-background px-4 py-6 text-foreground sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <Link
                    href="/dispatcher/ambulances"
                    className="mb-5 inline-flex items-center gap-2 text-sm text-muted transition hover:text-foreground"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Ambulance Requests
                </Link>

                <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-danger/20 bg-danger/10">
                            <Ambulance className="h-6 w-6 text-danger" />
                        </div>

                        <div>
                            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                Emergency Coordination
                            </p>
                            <h1 className="text-2xl font-bold sm:text-3xl">
                                {request.patient_info?.username || "Patient"}
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                            {statusLabels[status] || status}
                        </span>

                        {request.ai_draft?.is_emergency && (
                            <span className="rounded-full border border-danger/20 bg-danger/10 px-4 py-2 text-sm font-medium text-danger">
                                Emergency
                            </span>
                        )}
                    </div>
                </div>

                <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
                    <div className="space-y-5">
                        <section className="rounded-xl border border-border bg-surface p-5">
                            <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
                                <div>
                                    <h2 className="text-lg font-semibold">Patient Information</h2>
                                    <p className="mt-1 text-sm text-muted">
                                        Details required for emergency coordination.
                                    </p>
                                </div>

                                {request.patient_info?.contact_no && (
                                    <a
                                        href={`tel:${request.patient_info.contact_no}`}
                                        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary-hover"
                                    >
                                        <Phone className="h-4 w-4" />
                                        Call Patient
                                    </a>
                                )}
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                <Info label="Patient" value={request.patient_info?.username || "Not available"} />
                                <Info label="Contact" value={request.patient_info?.contact_no || "Not available"} />
                                <Info label="Blood Group" value={request.patient_info?.patient_info?.blood_grp || "Not available"} />
                                <Info label="Department" value={request.department_info?.name || "Not assigned"} />
                            </div>

                            <div className="mt-5 grid gap-4 sm:grid-cols-2">
                                <Info label="Email" value={request.patient_info?.email || "Not available"} />
                                <Info label="Registered Address" value={request.patient_info?.address || "Not available"} />
                            </div>
                        </section>

                        <section className="rounded-xl border border-danger/20 bg-surface p-5">
                            <div className="mb-4 flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-danger/10">
                                    <Activity className="h-5 w-5 text-danger" />
                                </div>
                                <div>
                                    <h2 className="font-semibold">Clinical Context</h2>
                                    <p className="text-sm text-muted">Quick context for the dispatcher.</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                        Symptoms
                                    </p>
                                    <p className="rounded-lg border border-border bg-background p-3 text-sm leading-6 text-foreground">
                                        {request.ai_draft?.translated_symptoms || "No symptoms available"}
                                    </p>
                                </div>

                                {request.ai_draft?.chief_complaints?.length ? (
                                    <div>
                                        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                            Chief Complaints
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {request.ai_draft.chief_complaints.map((complaint, index) => (
                                                <span
                                                    key={index}
                                                    className="rounded-full border border-danger/20 bg-danger/10 px-3 py-1.5 text-xs text-danger"
                                                >
                                                    {complaint}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                        </section>

                        <section className="rounded-xl border border-border bg-surface p-5">
                            <div className="mb-5 flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                    <MapPin className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h2 className="font-semibold">Patient Pickup Location</h2>
                                    <p className="text-sm text-muted">
                                        Enter the current location provided by the patient.
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-4">
                                <input
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    placeholder="Current address / landmark"
                                    className="h-12 rounded-lg border border-border bg-surface-secondary px-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10"
                                />

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <input
                                        value={latitude}
                                        onChange={(e) => setLatitude(e.target.value)}
                                        placeholder="Latitude"
                                        className="h-12 rounded-lg border border-border bg-surface-secondary px-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10"
                                    />
                                    <input
                                        value={longitude}
                                        onChange={(e) => setLongitude(e.target.value)}
                                        placeholder="Longitude"
                                        className="h-12 rounded-lg border border-border bg-surface-secondary px-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10"
                                    />
                                </div>

                                <div className="flex flex-wrap gap-3">
                                    <button
                                        onClick={saveLocation}
                                        disabled={locationLoading}
                                        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary-hover disabled:opacity-50"
                                    >
                                        {locationLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
                                        Save Location
                                    </button>

                                    <button
                                        onClick={findHospitals}
                                        disabled={hospitalLoading}
                                        className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface-secondary px-4 py-2.5 text-sm font-medium text-muted transition hover:bg-accent hover:text-foreground disabled:opacity-50"
                                    >
                                        {hospitalLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Hospital className="h-4 w-4" />}
                                        Find Nearby Hospitals
                                    </button>
                                </div>
                            </div>
                        </section>

                        {hospitals.length > 0 && (
                            <section className="rounded-xl border border-border bg-surface p-5">
                                <div className="mb-5">
                                    <h2 className="text-lg font-semibold">Nearby Hospitals</h2>
                                    <p className="mt-1 text-sm text-muted">
                                        Select a hospital after confirming emergency support by phone.
                                    </p>
                                </div>

                                <div className="grid gap-3">
                                    {hospitals.map((hospital) => (
                                        <button
                                            key={hospital._id}
                                            onClick={() => setSelectedHospital(hospital._id)}
                                            className={`w-full rounded-lg border p-4 text-left transition ${selectedHospital === hospital._id
                                                ? "border-primary bg-primary/10"
                                                : "border-border bg-background hover:border-primary/30 hover:bg-surface-secondary"
                                                }`}
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div>
                                                    <p className="font-medium text-foreground">{hospital.name}</p>
                                                    <p className="mt-1 text-sm text-muted">{hospital.address}</p>
                                                    <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                                                        {hospital.contact?.phone && <p>Phone: {hospital.contact.phone}</p>}
                                                        {hospital.contact?.emergency_phone && <p>Emergency: {hospital.contact.emergency_phone}</p>}
                                                        {hospital.contact?.email && <p>Email: {hospital.contact.email}</p>}
                                                    </div>
                                                </div>

                                                {selectedHospital === hospital._id && (
                                                    <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                <button
                                    disabled={!selectedHospital || actionLoading}
                                    onClick={() => performAction("select_hospital", { hospital_id: selectedHospital })}
                                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary-hover disabled:opacity-40"
                                >
                                    <Hospital className="h-4 w-4" />
                                    Select Hospital
                                </button>
                            </section>
                        )}
                    </div>

                    <aside className="space-y-5">
                        <section className="rounded-xl border border-border bg-surface p-5">
                            <h2 className="mb-4 font-semibold">Coordination</h2>

                            <div className="space-y-3">
                                <button
                                    onClick={() => performAction("contact_patient")}
                                    disabled={actionLoading}
                                    className="flex w-full items-center justify-between rounded-lg border border-border bg-background px-4 py-3 text-sm transition hover:border-primary/40 hover:bg-surface-secondary"
                                >
                                    <span className="flex items-center gap-3">
                                        <Phone className="h-4 w-4 text-primary" />
                                        Update Status: Patient Contacted
                                    </span>
                                    <ChevronRight />
                                </button>

                                <button
                                    onClick={() => performAction("confirm_hospital")}
                                    disabled={!request.ambulance_dispatch?.receiving_hospital?.hospital_id || actionLoading}
                                    className="flex w-full items-center justify-between rounded-lg border border-border bg-background px-4 py-3 text-sm transition hover:border-success/40 hover:bg-surface-secondary disabled:opacity-40"
                                >
                                    <span className="flex items-center gap-3">
                                        <CheckCircle2 className="h-4 w-4 text-success" />
                                        Update Status: Hospital Confirmed
                                    </span>
                                    <ChevronRight />
                                </button>

                                <button
                                    onClick={() => {
                                        if (!validateAmbulanceDetails()) return;
                                        performAction("dispatch");
                                    }}
                                    disabled={!request.ambulance_dispatch?.hospital_confirmation?.confirmed || actionLoading}
                                    className="flex w-full items-center justify-between rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary-hover disabled:opacity-40"
                                >
                                    <span className="flex items-center gap-3">
                                        <Send className="h-4 w-4" />
                                        Update Status: Ambulance Dispatched
                                    </span>
                                    <ChevronRight />
                                </button>

                                <button
                                    onClick={() => {
                                        if (!validateAmbulanceDetails()) return;
                                        performAction("arrived");
                                    }}
                                    disabled={status !== "dispatched" || actionLoading}
                                    className="flex w-full items-center justify-between rounded-lg border border-success/20 bg-success/10 px-4 py-3 text-sm text-success transition hover:bg-success/15 disabled:opacity-40"
                                >
                                    <span className="flex items-center gap-3">
                                        <CheckCircle2 className="h-4 w-4" />
                                        Update Status: Ambulance Arrived
                                    </span>
                                    <ChevronRight />
                                </button>
                            </div>
                        </section>

                        <section className="rounded-xl border border-border bg-surface p-5">
                            <div className="mb-4 flex items-center gap-3">
                                <Ambulance className="h-5 w-5 text-primary" />
                                <h2 className="font-semibold">Ambulance Details</h2>
                            </div>

                            <div className="space-y-3">
                                <input
                                    value={ambulanceName}
                                    onChange={(e) => setAmbulanceName(e.target.value)}
                                    placeholder="Service name"
                                    className="h-11 w-full rounded-lg border border-border bg-surface-secondary px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10"
                                />
                                <input
                                    value={ambulanceContact}
                                    onChange={(e) => setAmbulanceContact(e.target.value)}
                                    placeholder="Driver / service contact"
                                    className="h-11 w-full rounded-lg border border-border bg-surface-secondary px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10"
                                />
                                <input
                                    value={vehicleNo}
                                    onChange={(e) => setVehicleNo(e.target.value)}
                                    placeholder="Vehicle number"
                                    className="h-11 w-full rounded-lg border border-border bg-surface-secondary px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10"
                                />

                                <button
                                    onClick={() => {
                                        if (!validateAmbulanceDetails()) return;
                                        performAction("ambulance_details", {
                                            name: ambulanceName,
                                            contact_no: ambulanceContact,
                                            vehicle_no: vehicleNo,
                                        });
                                    }}
                                    disabled={actionLoading}
                                    className="w-full rounded-lg border border-border bg-surface-secondary px-4 py-2.5 text-sm font-medium text-muted transition hover:bg-accent hover:text-foreground disabled:opacity-50"
                                >
                                    Save Ambulance Details
                                </button>
                            </div>
                        </section>

                        <section className="rounded-xl border border-danger/20 bg-danger/10 p-5">
                            <h2 className="font-semibold text-danger">Cancel Request</h2>

                            <textarea
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                placeholder="Reason for cancellation..."
                                className="mt-3 min-h-24 w-full resize-none rounded-lg border border-danger/20 bg-background p-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-danger focus:ring-4 focus:ring-danger/10"
                            />

                            <button
                                onClick={() => {
                                    if (!cancelReason.trim()) {
                                        toast.error("Enter cancellation reason");
                                        return;
                                    }
                                    performAction("cancel", { reason: cancelReason });
                                }}
                                disabled={actionLoading}
                                className="mt-3 w-full rounded-lg border border-danger/20 bg-danger/10 px-4 py-2.5 text-sm font-medium text-danger transition hover:bg-danger/15 disabled:opacity-50"
                            >
                                Cancel Ambulance Request
                            </button>
                        </section>

                        <section className="rounded-xl border border-border bg-surface p-5">
                            <h2 className="mb-4 font-semibold">Timeline</h2>

                            <div className="space-y-4">
                                <TimelineItem label="Request Created" date={request.ambulance_dispatch?.requested_at} />
                                <TimelineItem label="Ambulance Dispatched" date={request.ambulance_dispatch?.dispatched_at} />
                                <TimelineItem label="Ambulance Arrived" date={request.ambulance_dispatch?.arrived_at} />
                                {request.ambulance_dispatch?.cancelled_at && (
                                    <TimelineItem label="Request Cancelled" date={request.ambulance_dispatch.cancelled_at} />
                                )}
                            </div>
                        </section>
                    </aside>
                </div>
            </div>
        </main>
    );
}

function Info({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-lg border border-border bg-surface-secondary p-3">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-1 truncate text-sm font-medium text-foreground">{value}</p>
        </div>
    );
}

function TimelineItem({ label, date }: { label: string; date?: string }) {
    return (
        <div className="flex gap-3">
            <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Clock3 className="h-3.5 w-3.5 text-primary" />
            </div>

            <div>
                <p className="text-sm font-medium text-foreground">{label}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                    {date ? new Date(date).toLocaleString("en-IN") : "Pending"}
                </p>
            </div>
        </div>
    );
}