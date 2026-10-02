"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, CalendarDays, Check, Clock3, CreditCard, FlaskConical, Home, Loader2, MapPin, Plus, Trash2, UserRound } from "lucide-react";
import { toast } from "react-toastify";
import type { ILabBookingDocument } from "@/models/LabBooking";
import type { ITransactionDocument } from "@/models/Transaction";
import type { IUserDocument } from "@/models/User";

type ResultStatus = "normal" | "high" | "low" | "critical" | "abnormal";

type ResultParameter = {
    name: string;
    value: string;
    unit: string;
    reference_range: string;
    status: ResultStatus;
};

type TestResult = {
    test_id: string;
    test_name: string;
    parameters: ResultParameter[];
};

const statusLabels: Record<ILabBookingDocument["status"], string> = {
    booked: "Booked",
    collection_scheduled: "Collection Scheduled",
    sample_collected: "Sample Collected",
    processing: "Processing",
    report_ready: "Report Ready",
    completed: "Completed",
    cancelled: "Cancelled",
};

const timeline = [
    { key: "booked", label: "Booked" },
    { key: "collection_scheduled", label: "Collection Scheduled" },
    { key: "sample_collected", label: "Sample Collected" },
    { key: "processing", label: "Processing" },
    { key: "report_ready", label: "Report Ready" },
    { key: "completed", label: "Completed" },
];

const statusOrder = ["booked", "collection_scheduled", "sample_collected", "processing", "report_ready", "completed"];

function getObjectId(value: unknown) {
    if (value && typeof value === "object" && "_id" in value) {
        return String((value as { _id: unknown })._id);
    }

    return String(value);
}

function createEmptyParameter(): ResultParameter {
    return {
        name: "",
        value: "",
        unit: "",
        reference_range: "",
        status: "normal",
    };
}

export default function DispatcherLabBookingDetailsPage() {
    const params = useParams();
    const id = String(params.id);

    const [booking, setBooking] = useState<ILabBookingDocument | null>(null);
    const [transaction, setTransaction] = useState<ITransactionDocument | null>(null);
    const [results, setResults] = useState<TestResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState("");
    const [showCancel, setShowCancel] = useState(false);
    const [notes, setNotes] = useState("");

    async function fetchBooking() {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(`/api/dispatcher/lab-bookings/${id}`, {
                cache: "no-store",
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.error || "Failed to fetch booking.");
            }

            setBooking(result.booking);
            setTransaction(result.transaction);
            setNotes(result.booking.notes || "");

            const savedResults: TestResult[] =
                result.booking.results?.map((item: TestResult) => ({
                    test_id: getObjectId(item.test_id),
                    test_name: item.test_name,
                    parameters: item.parameters.map((parameter) => ({
                        name: parameter.name || "",
                        value: parameter.value || "",
                        unit: parameter.unit || "",
                        reference_range: parameter.reference_range || "",
                        status: parameter.status || "normal",
                    })),
                })) || [];

            const existingTestIds = new Set(savedResults.map((item) => item.test_id));

            result.booking.tests.forEach((test: { test_id: unknown; name: string }) => {
                const testId = getObjectId(test.test_id);

                if (!existingTestIds.has(testId)) {
                    savedResults.push({
                        test_id: testId,
                        test_name: test.name,
                        parameters: [createEmptyParameter()],
                    });
                }
            });

            setResults(savedResults);
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to fetch booking.";
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchBooking();
    }, [id]);

    async function performAction(action: string, extra: Record<string, unknown> = {}) {
        try {
            setActionLoading(true);

            const response = await fetch(`/api/dispatcher/lab-bookings/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action,
                    notes,
                    ...extra,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Action failed.");
            }

            toast.success(result.message || "Booking updated successfully.");
            await fetchBooking();
            setShowCancel(false);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Action failed.");
        } finally {
            setActionLoading(false);
        }
    }

    function updateParameter(testIndex: number, parameterIndex: number, field: keyof ResultParameter, value: string) {
        setResults((current) =>
            current.map((test, index) => {
                if (index !== testIndex) {
                    return test;
                }

                return {
                    ...test,
                    parameters: test.parameters.map((parameter, parameterIndexValue) =>
                        parameterIndexValue === parameterIndex
                            ? { ...parameter, [field]: value }
                            : parameter,
                    ),
                };
            }),
        );
    }

    function addParameter(testIndex: number) {
        setResults((current) =>
            current.map((test, index) =>
                index === testIndex
                    ? {
                        ...test,
                        parameters: [...test.parameters, createEmptyParameter()],
                    }
                    : test,
            ),
        );
    }

    function removeParameter(testIndex: number, parameterIndex: number) {
        setResults((current) =>
            current.map((test, index) => {
                if (index !== testIndex) {
                    return test;
                }

                return {
                    ...test,
                    parameters: test.parameters.filter((_, indexValue) => indexValue !== parameterIndex),
                };
            }),
        );
    }

    async function saveResults() {
        if (!booking) {
            return;
        }

        if (results.length !== booking.tests.length) {
            toast.error("Please enter results for every booked test.");
            return;
        }

        const invalidTest = results.find((test) =>
            test.parameters.some(
                (parameter) =>
                    !parameter.name.trim() ||
                    !parameter.value.trim() ||
                    !parameter.unit.trim() ||
                    !parameter.reference_range.trim(),
            ),
        );

        if (invalidTest) {
            toast.error("Please complete every parameter field before saving.");
            return;
        }

        if (results.some((test) => test.parameters.length === 0)) {
            toast.error("Each test must have at least one parameter.");
            return;
        }

        const payload: TestResult[] = results.map((result) => ({
            test_id: getObjectId(result.test_id),
            test_name: result.test_name,
            parameters: result.parameters.map((parameter) => ({
                name: parameter.name.trim(),
                value: parameter.value.trim(),
                unit: parameter.unit.trim(),
                reference_range: parameter.reference_range.trim(),
                status: parameter.status,
            })),
        }));

        await performAction("enter_results", {
            results: payload,
        });
    }

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-background">
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
            </main>
        );
    }

    if (error || !booking) {
        return (
            <main className="min-h-screen bg-background px-5 py-8 text-foreground">
                <div className="mx-auto max-w-5xl">
                    <Link href="/dispatcher/lab-tests" className="mb-6 inline-flex items-center gap-2 text-sm text-muted hover:text-foreground">
                        <ArrowLeft className="h-4 w-4" />
                        Back to lab bookings
                    </Link>

                    <div className="border border-danger/30 bg-danger/10 p-5 text-sm text-danger">
                        {error || "Lab booking not found."}
                    </div>
                </div>
            </main>
        );
    }

    const patient = booking.patient_id as unknown as IUserDocument;
    const currentIndex = statusOrder.indexOf(booking.status);

    return (
        <main className="min-h-screen bg-background text-foreground">
            <div className="mx-auto max-w-6xl px-5 py-6 md:px-8 md:py-8">
                <Link href="/dispatcher/lab-tests" className="mb-6 inline-flex items-center gap-2 text-sm text-muted hover:text-foreground">
                    <ArrowLeft className="h-4 w-4" />
                    Back to lab bookings
                </Link>

                <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                    <div>
                        <p className="mb-2 text-sm font-medium text-primary">Lab Booking</p>
                        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{booking.booking_number}</h1>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="border border-primary/20 bg-primary/10 px-3 py-2 text-sm text-primary">
                            {statusLabels[booking.status]}
                        </span>

                        <span className={`border px-3 py-2 text-sm ${booking.payment_status === "paid" ? "border-success/20 bg-success/10 text-success" : "border-warning/20 bg-warning/10 text-warning"}`}>
                            {booking.payment_status === "paid" ? "Paid" : "Payment Pending"}
                        </span>
                    </div>
                </div>

                <div className="mb-6 border border-border bg-surface p-5">
                    <div className="mb-6">
                        <h2 className="font-semibold">Booking Status</h2>
                        <p className="mt-1 text-sm text-muted">Track the sample from collection to completed report.</p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-6">
                        {timeline.map((item, index) => {
                            const completed = currentIndex >= index;
                            const active = booking.status === item.key;

                            return (
                                <div key={item.key}>
                                    <div className={`mb-2 flex h-9 w-9 items-center justify-center border ${completed ? "border-primary bg-primary text-primary-foreground" : "border-border bg-surface-secondary text-muted"}`}>
                                        {completed ? <Check className="h-4 w-4" /> : index + 1}
                                    </div>

                                    <p className={`text-xs ${active ? "font-medium text-primary" : completed ? "text-foreground" : "text-muted"}`}>
                                        {item.label}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
                    <div className="space-y-6">
                        <section className="border border-border bg-surface">
                            <div className="border-b border-border p-5">
                                <div className="flex items-center gap-2">
                                    <UserRound className="h-5 w-5 text-primary" />
                                    <h2 className="font-semibold">Patient</h2>
                                </div>
                            </div>

                            <div className="grid gap-5 p-5 sm:grid-cols-2">
                                <div>
                                    <p className="text-xs text-muted">Name</p>
                                    <p className="mt-1 text-sm">{patient?.username || "Not available"}</p>
                                </div>

                                <div>
                                    <p className="text-xs text-muted">Contact</p>
                                    <p className="mt-1 text-sm">{patient?.contact_no || "Not available"}</p>
                                </div>

                                <div>
                                    <p className="text-xs text-muted">Email</p>
                                    <p className="mt-1 text-sm">{patient?.email || "Not available"}</p>
                                </div>
                            </div>
                        </section>

                        <section className="border border-border bg-surface">
                            <div className="border-b border-border p-5">
                                <div className="flex items-center gap-2">
                                    <FlaskConical className="h-5 w-5 text-primary" />
                                    <h2 className="font-semibold">Tests & Packages</h2>
                                </div>
                            </div>

                            <div className="divide-y divide-border">
                                {booking.tests.map((test) => (
                                    <div key={getObjectId(test.test_id)} className="flex items-center justify-between gap-4 p-5">
                                        <div>
                                            <p className="text-sm font-medium">{test.name}</p>
                                            <p className="mt-1 text-xs text-muted">
                                                {test.type === "package" ? "Package" : "Individual test"}
                                            </p>
                                        </div>

                                        <p className="text-sm">₹{test.price.toLocaleString("en-IN")}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {["sample_collected", "processing"].includes(booking.status) && (
                            <section className="border border-border bg-surface">
                                <div className="border-b border-border p-5">
                                    <div className="flex items-center gap-2">
                                        <FlaskConical className="h-5 w-5 text-primary" />

                                        <div>
                                            <h2 className="font-semibold">Enter Lab Results</h2>
                                            <p className="mt-1 text-sm text-muted">
                                                Add the parameters and enter the result for each test.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6 p-5">
                                    {results.map((testResult, testIndex) => (
                                        <div key={testResult.test_id} className="border border-border">
                                            <div className="flex items-center justify-between gap-4 border-b border-border bg-surface-secondary p-4">
                                                <div>
                                                    <h3 className="text-sm font-semibold">{testResult.test_name}</h3>
                                                    <p className="mt-1 text-xs text-muted">
                                                        Enter any parameters applicable to this test.
                                                    </p>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => addParameter(testIndex)}
                                                    className="inline-flex h-9 items-center gap-2 border border-primary/30 px-3 text-xs font-medium text-primary hover:bg-primary/10"
                                                >
                                                    <Plus className="h-4 w-4" />
                                                    Add Parameter
                                                </button>
                                            </div>

                                            <div className="space-y-4 p-4">
                                                {testResult.parameters.map((parameter, parameterIndex) => (
                                                    <div key={`${testResult.test_id}-${parameterIndex}`} className="border border-border bg-background p-4">
                                                        <div className="mb-4 flex items-center justify-between">
                                                            <p className="text-xs font-medium text-muted">
                                                                Parameter {parameterIndex + 1}
                                                            </p>

                                                            <button
                                                                type="button"
                                                                onClick={() => removeParameter(testIndex, parameterIndex)}
                                                                className="inline-flex items-center gap-1 text-xs text-danger hover:opacity-80"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                                Remove
                                                            </button>
                                                        </div>

                                                        <div className="grid gap-4 md:grid-cols-2">
                                                            <div>
                                                                <label className="mb-2 block text-xs text-muted">
                                                                    Parameter Name
                                                                </label>

                                                                <input
                                                                    type="text"
                                                                    value={parameter.name}
                                                                    onChange={(event) =>
                                                                        updateParameter(
                                                                            testIndex,
                                                                            parameterIndex,
                                                                            "name",
                                                                            event.target.value,
                                                                        )
                                                                    }
                                                                    placeholder="e.g. Hemoglobin"
                                                                    className="h-10 w-full border border-border bg-surface px-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary"
                                                                />
                                                            </div>

                                                            <div>
                                                                <label className="mb-2 block text-xs text-muted">
                                                                    Result Value
                                                                </label>

                                                                <input
                                                                    type="text"
                                                                    value={parameter.value}
                                                                    onChange={(event) =>
                                                                        updateParameter(
                                                                            testIndex,
                                                                            parameterIndex,
                                                                            "value",
                                                                            event.target.value,
                                                                        )
                                                                    }
                                                                    placeholder="e.g. 14.2"
                                                                    className="h-10 w-full border border-border bg-surface px-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary"
                                                                />
                                                            </div>

                                                            <div>
                                                                <label className="mb-2 block text-xs text-muted">
                                                                    Unit
                                                                </label>

                                                                <input
                                                                    type="text"
                                                                    value={parameter.unit}
                                                                    onChange={(event) =>
                                                                        updateParameter(
                                                                            testIndex,
                                                                            parameterIndex,
                                                                            "unit",
                                                                            event.target.value,
                                                                        )
                                                                    }
                                                                    placeholder="e.g. g/dL"
                                                                    className="h-10 w-full border border-border bg-surface px-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary"
                                                                />
                                                            </div>

                                                            <div>
                                                                <label className="mb-2 block text-xs text-muted">
                                                                    Reference Range
                                                                </label>

                                                                <input
                                                                    type="text"
                                                                    value={parameter.reference_range}
                                                                    onChange={(event) =>
                                                                        updateParameter(
                                                                            testIndex,
                                                                            parameterIndex,
                                                                            "reference_range",
                                                                            event.target.value,
                                                                        )
                                                                    }
                                                                    placeholder="e.g. 13-17"
                                                                    className="h-10 w-full border border-border bg-surface px-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary"
                                                                />
                                                            </div>

                                                            <div>
                                                                <label className="mb-2 block text-xs text-muted">
                                                                    Status
                                                                </label>

                                                                <select
                                                                    value={parameter.status}
                                                                    onChange={(event) =>
                                                                        updateParameter(
                                                                            testIndex,
                                                                            parameterIndex,
                                                                            "status",
                                                                            event.target.value,
                                                                        )
                                                                    }
                                                                    className="h-10 w-full border border-border bg-surface px-3 text-sm outline-none focus:border-primary"
                                                                >
                                                                    <option value="normal">Normal</option>
                                                                    <option value="high">High</option>
                                                                    <option value="low">Low</option>
                                                                    <option value="critical">Critical</option>
                                                                    <option value="abnormal">Abnormal</option>
                                                                </select>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}

                                                {testResult.parameters.length === 0 && (
                                                    <div className="border border-dashed border-border p-6 text-center">
                                                        <p className="text-sm text-muted">
                                                            No parameters added yet.
                                                        </p>

                                                        <button
                                                            type="button"
                                                            onClick={() => addParameter(testIndex)}
                                                            className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-hover"
                                                        >
                                                            <Plus className="h-4 w-4" />
                                                            Add First Parameter
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    <button
                                        type="button"
                                        disabled={actionLoading}
                                        onClick={saveResults}
                                        className="flex h-11 w-full items-center justify-center gap-2 bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {actionLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                                        Save Lab Results
                                    </button>
                                </div>
                            </section>
                        )}

                        {booking.results && booking.results.length > 0 && (
                            <section className="border border-border bg-surface">
                                <div className="border-b border-border p-5">
                                    <h2 className="font-semibold">Entered Results</h2>

                                    {booking.results_entered_at && (
                                        <p className="mt-1 text-xs text-muted">
                                            Entered {new Date(booking.results_entered_at).toLocaleString("en-IN")}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-5 p-5">
                                    {booking.results.map((result) => (
                                        <div key={getObjectId(result.test_id)}>
                                            <h3 className="mb-3 text-sm font-medium">{result.test_name}</h3>

                                            <div className="overflow-x-auto border border-border">
                                                <table className="w-full min-w-162.5 text-left text-sm">
                                                    <thead className="bg-surface-secondary text-xs text-muted">
                                                        <tr>
                                                            <th className="px-4 py-3 font-medium">Parameter</th>
                                                            <th className="px-4 py-3 font-medium">Value</th>
                                                            <th className="px-4 py-3 font-medium">Unit</th>
                                                            <th className="px-4 py-3 font-medium">Reference</th>
                                                            <th className="px-4 py-3 font-medium">Status</th>
                                                        </tr>
                                                    </thead>

                                                    <tbody className="divide-y divide-border">
                                                        {result.parameters.map((parameter, parameterIndex) => (
                                                            <tr key={`${parameter.name}-${parameterIndex}`}>
                                                                <td className="px-4 py-3">{parameter.name}</td>
                                                                <td className="px-4 py-3">{parameter.value}</td>
                                                                <td className="px-4 py-3 text-muted">{parameter.unit || "-"}</td>
                                                                <td className="px-4 py-3 text-muted">{parameter.reference_range || "-"}</td>
                                                                <td className="px-4 py-3">
                                                                    <span className={parameter.status === "normal" ? "text-success" : parameter.status === "critical" ? "text-danger" : "text-warning"}>
                                                                        {parameter.status}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        <section className="border border-border bg-surface">
                            <div className="border-b border-border p-5">
                                <div className="flex items-center gap-2">
                                    <Home className="h-5 w-5 text-primary" />
                                    <h2 className="font-semibold">Collection Details</h2>
                                </div>
                            </div>

                            <div className="grid gap-5 p-5 sm:grid-cols-2">
                                <div>
                                    <div className="flex items-center gap-2 text-xs text-muted">
                                        <CalendarDays className="h-3.5 w-3.5" />
                                        Date
                                    </div>

                                    <p className="mt-1 text-sm">
                                        {new Date(booking.scheduled_date).toLocaleDateString("en-IN", {
                                            day: "2-digit",
                                            month: "long",
                                            year: "numeric",
                                        })}
                                    </p>
                                </div>

                                <div>
                                    <div className="flex items-center gap-2 text-xs text-muted">
                                        <Clock3 className="h-3.5 w-3.5" />
                                        Time slot
                                    </div>

                                    <p className="mt-1 text-sm">{booking.scheduled_slot}</p>
                                </div>

                                <div className="sm:col-span-2">
                                    <div className="flex items-center gap-2 text-xs text-muted">
                                        <MapPin className="h-3.5 w-3.5" />
                                        Collection address
                                    </div>

                                    <p className="mt-1 text-sm">
                                        {booking.collection_address.address_line}, {booking.collection_address.city},{" "}
                                        {booking.collection_address.state} - {booking.collection_address.pincode}
                                    </p>

                                    {booking.collection_address.landmark && (
                                        <p className="mt-1 text-xs text-muted">
                                            Landmark: {booking.collection_address.landmark}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </section>
                    </div>

                    <aside className="space-y-6">
                        <section className="border border-border bg-surface p-5">
                            <div className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5 text-primary" />
                                <h2 className="font-semibold">Payment</h2>
                            </div>

                            <div className="mt-5 space-y-3 text-sm">
                                <div className="flex justify-between gap-4">
                                    <span className="text-muted">Subtotal</span>
                                    <span>₹{booking.subtotal.toLocaleString("en-IN")}</span>
                                </div>

                                <div className="flex justify-between gap-4">
                                    <span className="text-muted">Collection fee</span>
                                    <span>₹{booking.collection_fee.toLocaleString("en-IN")}</span>
                                </div>

                                <div className="flex justify-between gap-4">
                                    <span className="text-muted">Discount</span>
                                    <span>-₹{booking.discount.toLocaleString("en-IN")}</span>
                                </div>

                                <div className="border-t border-border pt-3">
                                    <div className="flex justify-between gap-4 font-semibold">
                                        <span>Total</span>
                                        <span>₹{booking.total_amount.toLocaleString("en-IN")}</span>
                                    </div>
                                </div>

                                <div className="border-t border-border pt-3">
                                    <p className="text-xs text-muted">Payment method</p>
                                    <p className="mt-1">
                                        {booking.payment_method === "cash_on_collection" ? "Cash on collection" : "Online"}
                                    </p>
                                </div>

                                {transaction && (
                                    <div>
                                        <p className="text-xs text-muted">Transaction</p>
                                        <p className="mt-1 break-all text-xs">{String(transaction._id)}</p>
                                    </div>
                                )}
                            </div>

                            {booking.payment_method === "cash_on_collection" && booking.payment_status !== "paid" && (
                                <button
                                    type="button"
                                    disabled={actionLoading}
                                    onClick={() => performAction("confirm_cash_payment")}
                                    className="mt-5 flex h-11 w-full items-center justify-center gap-2 bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {actionLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                                    Confirm Cash Payment
                                </button>
                            )}
                        </section>

                        <section className="border border-border bg-surface p-5">
                            <h2 className="font-semibold">Dispatcher Actions</h2>

                            <p className="mt-1 text-sm text-muted">
                                Update the booking as the collection progresses.
                            </p>

                            <div className="mt-5 space-y-2">
                                {booking.status === "booked" && (
                                    <button
                                        type="button"
                                        disabled={actionLoading}
                                        onClick={() => performAction("schedule_collection")}
                                        className="flex h-11 w-full items-center justify-center gap-2 bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
                                    >
                                        {actionLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                                        Schedule Collection
                                    </button>
                                )}

                                {booking.status === "collection_scheduled" && (
                                    <button
                                        type="button"
                                        disabled={actionLoading}
                                        onClick={() => performAction("sample_collected")}
                                        className="flex h-11 w-full items-center justify-center gap-2 bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
                                    >
                                        {actionLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                                        Mark Sample Collected
                                    </button>
                                )}

                                {booking.status === "sample_collected" && (
                                    <button
                                        type="button"
                                        disabled={actionLoading}
                                        onClick={() => performAction("start_processing")}
                                        className="flex h-11 w-full items-center justify-center gap-2 bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
                                    >
                                        {actionLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                                        Start Processing
                                    </button>
                                )}

                                {booking.status === "processing" && (
                                    <>
                                        {booking.results && booking.results.length > 0 && (
                                            <button
                                                type="button"
                                                disabled={actionLoading}
                                                onClick={() => performAction("report_ready")}
                                                className="flex h-11 w-full items-center justify-center gap-2 border border-primary bg-primary/10 px-4 text-sm font-medium text-primary hover:bg-primary/20 disabled:opacity-50"
                                            >
                                                {actionLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                                                Mark Report Ready
                                            </button>
                                        )}
                                    </>
                                )}

                                {booking.status === "report_ready" && (
                                    <button
                                        type="button"
                                        disabled={actionLoading}
                                        onClick={() => performAction("complete")}
                                        className="flex h-11 w-full items-center justify-center gap-2 bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
                                    >
                                        {actionLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                                        Complete Booking
                                    </button>
                                )}

                                {!["completed", "cancelled"].includes(booking.status) && (
                                    <button
                                        type="button"
                                        disabled={actionLoading}
                                        onClick={() => setShowCancel(true)}
                                        className="flex h-11 w-full items-center justify-center border border-danger/30 px-4 text-sm font-medium text-danger hover:bg-danger/10 disabled:opacity-50"
                                    >
                                        Cancel Booking
                                    </button>
                                )}
                            </div>
                        </section>

                        <section className="border border-border bg-surface p-5">
                            <h2 className="font-semibold">Dispatcher Notes</h2>

                            <textarea
                                value={notes}
                                onChange={(event) => setNotes(event.target.value)}
                                placeholder="Add notes about collection or processing..."
                                rows={5}
                                className="mt-4 w-full resize-none border border-border bg-background p-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary"
                            />

                            <p className="mt-2 text-xs text-muted">
                                Notes are saved when the next booking action is performed.
                            </p>
                            <button
                                type="button"
                                disabled={actionLoading}
                                onClick={() => performAction("update_notes")}
                                className="mt-3 flex h-10 w-full items-center justify-center gap-2 bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
                            >
                                {actionLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                                Save Notes
                            </button>
                        </section>
                    </aside>
                </div>
            </div>

            {showCancel && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-5">
                    <div className="w-full max-w-md border border-border bg-surface p-6">
                        <h2 className="text-lg font-semibold">Cancel Booking</h2>

                        <p className="mt-2 text-sm leading-6 text-muted">
                            Are you sure you want to cancel booking{" "}
                            <span className="font-medium text-foreground">{booking.booking_number}</span>?
                        </p>

                        <div className="mt-6 flex gap-3">
                            <button
                                type="button"
                                onClick={() => setShowCancel(false)}
                                className="h-11 flex-1 border border-border bg-surface-secondary px-4 text-sm hover:border-primary"
                            >
                                Keep Booking
                            </button>

                            <button
                                type="button"
                                disabled={actionLoading}
                                onClick={() => performAction("cancel")}
                                className="h-11 flex-1 bg-danger px-4 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
                            >
                                {actionLoading ? "Cancelling..." : "Cancel Booking"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}