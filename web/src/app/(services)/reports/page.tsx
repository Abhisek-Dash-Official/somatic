"use client";

import { ChangeEvent, DragEvent, ReactNode, useState } from "react";
import {
    AlertCircle,
    ArrowRight,
    CheckCircle2,
    ClipboardList,
    FileText,
    HeartPulse,
    Info,
    Sparkles,
    Stethoscope,
    Upload,
    ShieldCheck,
    X,
    Loader2,
} from "lucide-react";

type FindingStatus = "low" | "high" | "normal" | "critical" | "unknown";
type Urgency = "routine" | "follow_up" | "prompt" | "urgent" | "emergency";

interface KeyFinding {
    test: string;
    value: string;
    unit?: string;
    reference_range?: string;
    status: FindingStatus;
    explanation: string;
}

interface AbnormalFinding {
    finding: string;
    explanation: string;
    possible_significance?: string;
}

interface ReportAnalysis {
    report_type: string;
    overall_summary: string;
    urgency: Urgency;
    key_findings: KeyFinding[];
    normal_findings: string[];
    abnormal_findings: AbnormalFinding[];
    important_insights: string[];
    possible_significance: string[];
    questions_for_doctor: string[];
    recommended_next_steps: string[];
    limitations: string[];
    disclaimer?: string;
    file_name?: string;
    ai_model?: string;
    tokens_prompt?: number;
    tokens_completion?: number;
    tokens_total?: number;
    response_time_sec?: number;
}

const ACCEPTED_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export default function ReportsPage() {
    const [file, setFile] = useState<File | null>(null);
    const [analysis, setAnalysis] = useState<ReportAnalysis | null>(null);
    const [error, setError] = useState("");
    const [isDragging, setIsDragging] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const validateFile = (selectedFile: File) => {
        if (!ACCEPTED_TYPES.includes(selectedFile.type)) {
            setError("Please upload a PDF, JPG, PNG, or WEBP file.");
            return false;
        }

        if (selectedFile.size <= 0) {
            setError("The selected file is empty.");
            return false;
        }

        if (selectedFile.size > MAX_FILE_SIZE) {
            setError("The report must be smaller than 10 MB.");
            return false;
        }

        setError("");
        setAnalysis(null);
        setFile(selectedFile);
        return true;
    };

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) validateFile(selectedFile);
        event.target.value = "";
    };

    const handleDrop = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(false);

        const droppedFile = event.dataTransfer.files?.[0];

        if (droppedFile) validateFile(droppedFile);
    };

    const removeFile = () => {
        setFile(null);
        setAnalysis(null);
        setError("");
    };

    const analyzeReport = async () => {
        if (!file) return;

        setIsAnalyzing(true);
        setError("");
        setAnalysis(null);

        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch("/api/reports/analyze", {
                method: "POST",
                body: formData,
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result?.error ||
                    result?.detail ||
                    "Failed to analyze the medical report."
                );
            }

            setAnalysis(result.data || result);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Something went wrong while analyzing the report."
            );
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <main className="min-h-screen bg-background text-foreground">
            <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
                {!analysis && (
                    <>
                        <section className="mb-8">
                            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
                                <Sparkles className="h-3.5 w-3.5" />
                                AI Medical Report Analysis
                            </div>

                            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                                Understand your medical report
                            </h1>

                            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted sm:text-base">
                                Upload a medical report and SOMATIC will organize the findings,
                                explain medical terms, and highlight points you may want to
                                discuss with your doctor.
                            </p>
                        </section>

                        <section className="rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-6">
                            {!file ? (
                                <div
                                    onDragOver={(event) => {
                                        event.preventDefault();
                                        setIsDragging(true);
                                    }}
                                    onDragLeave={() => setIsDragging(false)}
                                    onDrop={handleDrop}
                                    className={`relative flex min-h-80 flex-col items-center justify-center rounded-xl border-2 border-dashed px-5 text-center transition ${isDragging
                                            ? "border-primary bg-primary/5"
                                            : "border-border hover:border-primary/40"
                                        }`}
                                >
                                    <input
                                        id="report-file"
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                                        onChange={handleFileChange}
                                        className="sr-only"
                                    />

                                    <label
                                        htmlFor="report-file"
                                        className="flex cursor-pointer flex-col items-center"
                                    >
                                        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                            <Upload className="h-7 w-7" />
                                        </div>

                                        <h2 className="text-base font-semibold">
                                            Upload your medical report
                                        </h2>

                                        <p className="mt-2 max-w-md text-sm leading-6 text-muted">
                                            Drag and drop your file here, or click to browse from
                                            your device.
                                        </p>

                                        <span className="mt-4 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover">
                                            Choose file
                                        </span>

                                        <p className="mt-4 text-xs text-muted">
                                            PDF, JPG, PNG or WEBP · Maximum 10 MB
                                        </p>
                                    </label>
                                </div>
                            ) : (
                                <div className="rounded-xl border border-border bg-background p-4 sm:p-5">
                                    <div className="flex items-start gap-4">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                            <FileText className="h-6 w-6" />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium">
                                                {file.name}
                                            </p>

                                            <p className="mt-1 text-xs text-muted">
                                                {formatFileSize(file.size)} ·{" "}
                                                {file.type === "application/pdf"
                                                    ? "PDF document"
                                                    : "Image"}
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={removeFile}
                                            className="rounded-xl p-2 text-muted transition-colors hover:bg-surface-secondary hover:text-foreground"
                                            aria-label="Remove file"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>

                                    <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
                                        <button
                                            type="button"
                                            onClick={removeFile}
                                            className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-surface-secondary"
                                        >
                                            Choose another
                                        </button>

                                        <button
                                            type="button"
                                            onClick={analyzeReport}
                                            disabled={isAnalyzing}
                                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            {isAnalyzing ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    Analyzing report...
                                                </>
                                            ) : (
                                                <>
                                                    Analyze report
                                                    <ArrowRight className="h-4 w-4" />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="mt-5 flex items-start gap-3 rounded-xl border border-border bg-background p-4">
                                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />

                                <p className="text-xs leading-5 text-muted">
                                    Your report is analyzed to provide educational insights.
                                    SOMATIC does not replace a qualified healthcare professional
                                    or provide a definitive diagnosis.
                                </p>
                            </div>
                        </section>
                    </>
                )}

                {error && (
                    <div className="mt-4 flex items-start gap-3 rounded-xl border border-danger/20 bg-danger/5 p-4 text-sm text-danger">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {isAnalyzing && (
                    <section className="mt-6 rounded-2xl border border-border bg-surface p-8 text-center sm:p-12">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                            <HeartPulse className="h-7 w-7 animate-pulse" />
                        </div>

                        <h2 className="mt-5 text-lg font-semibold">
                            Analyzing your report
                        </h2>

                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
                            SOMATIC is reading the report and organizing the relevant
                            findings. This may take a moment.
                        </p>

                        <div className="mx-auto mt-6 h-1.5 max-w-xs overflow-hidden rounded-full bg-surface-secondary">
                            <div className="h-full w-1/2 animate-pulse rounded-full bg-primary" />
                        </div>
                    </section>
                )}

                {analysis && (
                    <ReportResults analysis={analysis} onNewReport={removeFile} />
                )}
            </div>
        </main>
    );
}

function ReportResults({
    analysis,
    onNewReport,
}: {
    analysis: ReportAnalysis;
    onNewReport: () => void;
}) {
    return (
        <section className="space-y-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <div className="mb-2 inline-flex items-center gap-2 text-xs font-medium text-primary">
                        <CheckCircle2 className="h-4 w-4" />
                        Analysis complete
                    </div>

                    <h2 className="text-2xl font-semibold tracking-tight">
                        Report insights
                    </h2>

                    <p className="mt-1 text-sm text-muted">
                        {analysis.file_name || "Medical report"}
                    </p>
                </div>

                <button
                    type="button"
                    onClick={onNewReport}
                    className="inline-flex w-fit items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-surface-secondary"
                >
                    <Upload className="h-4 w-4" />
                    Analyze another
                </button>
            </div>

            <div className="grid gap-5 lg:grid-cols-[1.4fr_0.6fr]">
                <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <FileText className="h-5 w-5" />
                        </div>

                        <div>
                            <p className="text-xs font-medium uppercase tracking-wider text-muted">
                                Report type
                            </p>

                            <p className="mt-0.5 text-sm font-semibold">
                                {analysis.report_type || "Medical report"}
                            </p>
                        </div>
                    </div>

                    <div className="mt-6">
                        <h3 className="text-base font-semibold">Overall summary</h3>

                        <p className="mt-3 text-sm leading-7 text-muted">
                            {analysis.overall_summary}
                        </p>
                    </div>
                </div>

                <UrgencyCard urgency={analysis.urgency} />
            </div>

            {analysis.abnormal_findings?.length > 0 && (
                <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
                    <SectionHeader
                        icon={<AlertCircle className="h-5 w-5" />}
                        title="Abnormal findings"
                        description="Findings that may require medical attention or discussion with a healthcare professional."
                    />

                    <div className="mt-5 grid gap-3">
                        {analysis.abnormal_findings.map((finding, index) => (
                            <div
                                key={`${finding.finding}-${index}`}
                                className="rounded-xl border border-warning/20 bg-warning/5 p-4"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <h4 className="text-sm font-semibold">
                                        {finding.finding}
                                    </h4>

                                    <span className="shrink-0 rounded-full bg-warning/10 px-2.5 py-1 text-xs font-medium text-warning">
                                        Review
                                    </span>
                                </div>

                                <p className="mt-2 text-sm leading-6 text-muted">
                                    {finding.explanation}
                                </p>

                                {finding.possible_significance && (
                                    <div className="mt-3 rounded-xl border border-border bg-background p-3">
                                        <p className="text-xs font-medium text-foreground">
                                            Possible significance
                                        </p>

                                        <p className="mt-1 text-xs leading-5 text-muted">
                                            {finding.possible_significance}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {analysis.important_insights?.length > 0 && (
                <InsightList
                    title="Important insights"
                    description="Key points identified from the report that may be useful to keep in mind."
                    icon={<Info className="h-5 w-5" />}
                    items={analysis.important_insights}
                />
            )}

            {analysis.key_findings?.length > 0 && (
                <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
                    <SectionHeader
                        icon={<ClipboardList className="h-5 w-5" />}
                        title="Key findings"
                        description="Important values and observations identified in the report."
                    />

                    <div className="mt-5 overflow-hidden rounded-xl border border-border">
                        <div className="hidden grid-cols-[1.3fr_1fr_1fr_0.8fr] border-b border-border bg-surface-secondary px-4 py-3 text-xs font-medium text-muted sm:grid">
                            <span>Test</span>
                            <span>Result</span>
                            <span>Reference range</span>
                            <span>Status</span>
                        </div>

                        <div className="divide-y divide-border">
                            {analysis.key_findings.map((finding, index) => (
                                <div
                                    key={`${finding.test}-${index}`}
                                    className="grid gap-3 px-4 py-4 sm:grid-cols-[1.3fr_1fr_1fr_0.8fr] sm:items-center"
                                >
                                    <div>
                                        <p className="text-sm font-medium">{finding.test}</p>

                                        <p className="mt-1 text-xs leading-5 text-muted sm:hidden">
                                            {finding.explanation}
                                        </p>
                                    </div>

                                    <p className="text-sm">
                                        {finding.value} {finding.unit || ""}
                                    </p>

                                    <p className="text-sm text-muted">
                                        {finding.reference_range || "Not provided"}
                                    </p>

                                    <StatusBadge status={finding.status} />

                                    <p className="hidden text-xs leading-5 text-muted sm:col-span-4 sm:block">
                                        {finding.explanation}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            <div className="grid gap-5 lg:grid-cols-2">
                {analysis.normal_findings?.length > 0 && (
                    <InsightList
                        title="Normal findings"
                        description="Findings that were not flagged as abnormal in the report."
                        icon={<CheckCircle2 className="h-5 w-5" />}
                        items={analysis.normal_findings}
                    />
                )}

                {analysis.possible_significance?.length > 0 && (
                    <InsightList
                        title="Possible significance"
                        description="Contextual information about what certain findings may indicate."
                        icon={<Info className="h-5 w-5" />}
                        items={analysis.possible_significance}
                    />
                )}

                {analysis.recommended_next_steps?.length > 0 && (
                    <InsightList
                        title="Recommended next steps"
                        description="Practical points to consider based on the report."
                        icon={<ArrowRight className="h-5 w-5" />}
                        items={analysis.recommended_next_steps}
                    />
                )}

                {analysis.questions_for_doctor?.length > 0 && (
                    <InsightList
                        title="Questions for your doctor"
                        description="Questions you may want to discuss during your consultation."
                        icon={<Stethoscope className="h-5 w-5" />}
                        items={analysis.questions_for_doctor}
                    />
                )}
            </div>

            {analysis.limitations?.length > 0 && (
                <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
                    <div className="flex items-start gap-3">
                        <Info className="mt-0.5 h-5 w-5 shrink-0 text-muted" />

                        <div>
                            <h3 className="text-sm font-semibold">Important</h3>

                            <ul className="mt-3 space-y-2">
                                {analysis.limitations.map((limitation, index) => (
                                    <li
                                        key={index}
                                        className="text-xs leading-6 text-muted"
                                    >
                                        • {limitation}
                                    </li>
                                ))}
                            </ul>

                            <p className="mt-4 border-t border-border pt-4 text-xs leading-6 text-muted">
                                {analysis.disclaimer ||
                                    "This analysis is educational and does not replace evaluation or treatment from a qualified healthcare professional."}
                            </p>
                        </div>
                    </div>
                </section>
            )}

            {(analysis.tokens_total !== undefined ||
                analysis.response_time_sec !== undefined) && (
                    <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-1 text-[11px] text-muted">
                        {analysis.tokens_total !== undefined && (
                            <span>
                                {analysis.tokens_total.toLocaleString()} AI tokens used
                            </span>
                        )}

                        {analysis.response_time_sec !== undefined &&
                            analysis.response_time_sec > 0 && (
                                <span>{analysis.response_time_sec}s response time</span>
                            )}
                    </div>
                )}
        </section>
    );
}

function UrgencyCard({ urgency }: { urgency: Urgency }) {
    const config = {
        routine: {
            label: "Routine",
            text: "No immediate concern identified from the report alone.",
            className: "border-success/20 bg-success/5 text-success",
        },
        follow_up: {
            label: "Follow-up",
            text: "Consider discussing the findings at your next appointment.",
            className: "border-primary/20 bg-primary/5 text-primary",
        },
        prompt: {
            label: "Prompt review",
            text: "Consider contacting a healthcare professional soon.",
            className: "border-warning/20 bg-warning/5 text-warning",
        },
        urgent: {
            label: "Urgent",
            text: "Seek appropriate medical attention promptly.",
            className: "border-danger/20 bg-danger/5 text-danger",
        },
        emergency: {
            label: "Emergency",
            text: "This report indicates a potentially serious situation requiring immediate medical attention.",
            className: "border-danger/20 bg-danger/5 text-danger",
        },
    }[urgency] || {
        label: "Review",
        text: "Discuss the report with a healthcare professional.",
        className: "border-border bg-surface text-foreground",
    };

    return (
        <div className={`rounded-2xl border p-5 sm:p-6 ${config.className}`}>
            <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />

                <span className="text-xs font-semibold uppercase tracking-wider">
                    Suggested urgency
                </span>
            </div>

            <p className="mt-4 text-xl font-semibold">{config.label}</p>
            <p className="mt-2 text-sm leading-6 opacity-80">{config.text}</p>
        </div>
    );
}

function InsightList({
    title,
    description,
    icon,
    items,
}: {
    title: string;
    description: string;
    icon: ReactNode;
    items: string[];
}) {
    return (
        <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
            <div className="flex items-start gap-3">
                <div className="mt-0.5 text-primary">{icon}</div>

                <div>
                    <h3 className="text-base font-semibold">{title}</h3>
                    <p className="mt-1 text-sm text-muted">{description}</p>
                </div>
            </div>

            <ul className="mt-5 space-y-3">
                {items.map((item, index) => (
                    <li
                        key={index}
                        className="flex gap-3 text-sm leading-6 text-muted"
                    >
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        <span>{item}</span>
                    </li>
                ))}
            </ul>
        </section>
    );
}

function SectionHeader({
    icon,
    title,
    description,
}: {
    icon: ReactNode;
    title: string;
    description: string;
}) {
    return (
        <div className="flex items-start gap-3">
            <div className="mt-0.5 text-primary">{icon}</div>

            <div>
                <h3 className="text-base font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-muted">{description}</p>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: FindingStatus }) {
    const config = {
        low: "bg-warning/10 text-warning",
        high: "bg-warning/10 text-warning",
        normal: "bg-success/10 text-success",
        critical: "bg-danger/10 text-danger",
        unknown: "bg-surface-secondary text-muted",
    }[status];

    return (
        <span
            className={`w-fit rounded-full px-2.5 py-1 text-xs font-medium capitalize ${config}`}
        >
            {status}
        </span>
    );
}

function formatFileSize(bytes: number) {
    if (bytes < 1024 * 1024) {
        return `${Math.round(bytes / 1024)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}