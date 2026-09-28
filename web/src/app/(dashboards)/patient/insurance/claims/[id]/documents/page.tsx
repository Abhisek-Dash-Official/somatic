"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit3, ExternalLink, FileText, Plus, Save, Trash2, Upload, X } from "lucide-react";
import { toast } from "react-toastify";
import type { IInsuranceClaim } from "@/types/models";

const documentLabels: Record<string, string> = {
    claim_form: "Claim Form",
    hospital_bill: "Hospital Bill",
    discharge_summary: "Discharge Summary",
    prescription: "Prescription",
    lab_report: "Lab Report",
    medical_record: "Medical Record",
    id_proof: "ID Proof",
    other: "Other",
};

const documentTypes = Object.entries(documentLabels);

type EditableDocument = {
    type: string;
    file_url: string;
};

export default function InsuranceClaimDocumentsPage() {
    const params = useParams();
    const claimId = params.id as string;

    const [claim, setClaim] = useState<IInsuranceClaim | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editDocument, setEditDocument] = useState<EditableDocument>({ type: "other", file_url: "" });
    const [requiredInputs, setRequiredInputs] = useState<Record<string, string>>({});
    const [additionalDocuments, setAdditionalDocuments] = useState<EditableDocument[]>([]);

    useEffect(() => {
        const loadClaim = async () => {
            try {
                const response = await fetch(`/api/insurance/claims/${claimId}`);
                const data = await response.json();

                if (!response.ok) throw new Error(data.error || "Failed to load claim");

                setClaim(data.claim as IInsuranceClaim);
            } catch (error: any) {
                toast.error(error.message || "Failed to load claim");
            } finally {
                setLoading(false);
            }
        };

        loadClaim();
    }, [claimId]);

    const uploadedDocuments = claim?.documents || [];
    const requiredDocuments = claim?.required_documents || [];
    const canUpload = claim?.status === "documents_required";
    const canEdit = claim?.status === "documents_required" || claim?.status === "under_review";

    const getExistingDocument = (type: string) => {
        return uploadedDocuments.find((document: any) => document.type === type);
    };

    const updateRequiredDocument = (type: string, file_url: string) => {
        setRequiredInputs((current) => ({ ...current, [type]: file_url }));
    };

    const getRequiredDocumentValue = (type: string) => {
        const existingDocument = getExistingDocument(type);
        return existingDocument?.file_url || requiredInputs[type] || "";
    };

    const updateAdditionalDocument = (index: number, field: keyof EditableDocument, value: string) => {
        setAdditionalDocuments((current) =>
            current.map((document, documentIndex) =>
                documentIndex === index ? { ...document, [field]: value } : document
            )
        );
    };

    const addAdditionalDocument = () => {
        setAdditionalDocuments((current) => [...current, { type: "other", file_url: "" }]);
    };

    const removeAdditionalDocument = (index: number) => {
        setAdditionalDocuments((current) => current.filter((_, documentIndex) => documentIndex !== index));
    };

    const startEditing = (index: number) => {
        const document = uploadedDocuments[index] as any;

        setEditingIndex(index);
        setEditDocument({
            type: document.type,
            file_url: document.file_url,
        });
    };

    const cancelEditing = () => {
        setEditingIndex(null);
        setEditDocument({ type: "other", file_url: "" });
    };

    const saveDocument = async () => {
        if (editingIndex === null) return;

        if (!editDocument.type || !editDocument.file_url.trim()) {
            toast.warn("Please provide document type and URL");
            return;
        }

        try {
            const response = await fetch(`/api/insurance/claims/${claimId}/documents`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    index: editingIndex,
                    type: editDocument.type,
                    file_url: editDocument.file_url.trim(),
                }),
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.error || "Failed to update document");

            setClaim((current) => {
                if (!current) return current;

                const documents = [...(current.documents || [])];
                documents[editingIndex] = data.document;

                return { ...current, documents };
            });

            cancelEditing();
            toast.success("Document updated successfully");
        } catch (error: any) {
            toast.error(error.message || "Failed to update document");
        }
    };

    const removeDocument = async (index: number) => {
        try {
            const response = await fetch(`/api/insurance/claims/${claimId}/documents`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ index }),
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.error || "Failed to remove document");

            setClaim((current) => {
                if (!current) return current;

                return {
                    ...current,
                    status: data.claim.status,
                    required_documents: data.claim.required_documents || [],
                    documents: data.claim.documents,
                };
            });

            if (editingIndex === index) cancelEditing();

            toast.success("Document removed successfully");
        } catch (error: any) {
            toast.error(error.message || "Failed to remove document");
        }
    };

    const submitDocuments = async () => {
        if (!claim) return;

        const requiredToSubmit = requiredDocuments
            .filter((type) => !getExistingDocument(type))
            .map((type) => ({
                type,
                file_url: (requiredInputs[type] || "").trim(),
            }));

        const missingRequired = requiredToSubmit.filter((document) => !document.file_url);

        if (missingRequired.length > 0) {
            toast.warn(
                `Please provide: ${missingRequired.map((document) => documentLabels[document.type] || document.type).join(", ")}`
            );
            return;
        }

        const extraDocuments = additionalDocuments
            .filter((document) => document.file_url.trim())
            .map((document) => ({
                type: document.type,
                file_url: document.file_url.trim(),
            }));

        const documentsToSubmit = [...requiredToSubmit, ...extraDocuments];

        if (documentsToSubmit.length === 0) {
            toast.warn("Please add at least one document");
            return;
        }

        setSubmitting(true);

        try {
            const response = await fetch(`/api/insurance/claims/${claimId}/documents`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ documents: documentsToSubmit }),
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.missing_documents?.length) {
                    toast.error(
                        `Missing: ${data.missing_documents.map((type: string) => documentLabels[type] || type).join(", ")}`
                    );
                } else {
                    toast.error(data.error || "Failed to submit documents");
                }
                return;
            }

            setClaim((current) =>
                current
                    ? {
                        ...current,
                        status: data.claim.status,
                        documents: data.claim.documents,
                        required_documents: data.claim.required_documents || [],
                    }
                    : current
            );

            setRequiredInputs({});
            setAdditionalDocuments([]);
            toast.success("Documents submitted successfully");
        } catch {
            toast.error("Failed to submit documents");
        } finally {
            setSubmitting(false);
        }
    };

    const inputClass =
        "rounded-lg border border-border bg-surface-secondary px-3 py-2.5 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10";

    if (loading) {
        return (
            <main className="min-h-screen bg-background px-4 py-6 md:px-6">
                <div className="mx-auto max-w-5xl rounded-xl border border-border bg-surface p-8 text-muted">
                    Loading documents...
                </div>
            </main>
        );
    }

    if (!claim) {
        return (
            <main className="min-h-screen bg-background px-4 py-6 md:px-6">
                <div className="mx-auto max-w-5xl rounded-xl border border-border bg-surface p-8 text-center">
                    <FileText className="mx-auto h-10 w-10 text-muted-foreground" />
                    <h1 className="mt-4 text-lg font-semibold text-foreground">Claim not found</h1>
                    <Link
                        href="/patient/insurance/claims"
                        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Claims
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-background px-4 py-6 text-foreground md:px-6">
            <div className="mx-auto max-w-5xl space-y-6">
                <div>
                    <Link
                        href={`/patient/insurance/claims/${claimId}`}
                        className="inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-foreground"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Claim
                    </Link>

                    <h1 className="mt-4 text-2xl font-bold text-foreground">Claim Documents</h1>
                    <p className="mt-1 text-sm text-muted">
                        Claim #{claim.claim_number || claim._id}
                    </p>
                </div>

                <section className="rounded-xl border border-border bg-surface p-5">
                    <div className="mb-5">
                        <h2 className="text-lg font-semibold text-foreground">Submitted Documents</h2>
                        <p className="mt-1 text-sm text-muted">
                            View, edit or remove documents already submitted with this claim.
                        </p>
                    </div>

                    {uploadedDocuments.length > 0 ? (
                        <div className="space-y-3">
                            {uploadedDocuments.map((document: any, index: number) => (
                                <div key={index} className="rounded-lg border border-border bg-surface-secondary p-4">
                                    {editingIndex === index ? (
                                        <div className="space-y-3">
                                            <div className="grid gap-3 md:grid-cols-[190px_1fr]">
                                                <select
                                                    value={editDocument.type}
                                                    onChange={(event) =>
                                                        setEditDocument((current) => ({
                                                            ...current,
                                                            type: event.target.value,
                                                        }))
                                                    }
                                                    className={inputClass}
                                                >
                                                    {documentTypes.map(([value, label]) => (
                                                        <option key={value} value={value} className="bg-surface text-foreground">
                                                            {label}
                                                        </option>
                                                    ))}
                                                </select>

                                                <input
                                                    type="url"
                                                    value={editDocument.file_url}
                                                    onChange={(event) =>
                                                        setEditDocument((current) => ({
                                                            ...current,
                                                            file_url: event.target.value,
                                                        }))
                                                    }
                                                    placeholder="Enter document URL"
                                                    className={inputClass}
                                                />
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                <button
                                                    type="button"
                                                    onClick={saveDocument}
                                                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover"
                                                >
                                                    <Save className="h-4 w-4" />
                                                    Save
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={cancelEditing}
                                                    className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-muted transition hover:bg-accent hover:text-foreground"
                                                >
                                                    <X className="h-4 w-4" />
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                            <div className="flex min-w-0 items-center gap-3">
                                                <div className="rounded-lg bg-primary/10 p-2">
                                                    <FileText className="h-5 w-5 text-primary" />
                                                </div>

                                                <div className="min-w-0">
                                                    <p className="font-medium text-foreground">
                                                        {documentLabels[document.type] || document.type}
                                                    </p>

                                                    <p className="mt-1 truncate text-sm text-muted">
                                                        {document.file_url}
                                                    </p>

                                                    {document.uploaded_at && (
                                                        <p className="mt-1 text-xs text-muted-foreground">
                                                            Uploaded {new Date(document.uploaded_at).toLocaleDateString("en-IN", {
                                                                day: "2-digit",
                                                                month: "short",
                                                                year: "numeric",
                                                            })}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex shrink-0 flex-wrap gap-2">
                                                <a
                                                    href={document.file_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-muted transition hover:border-primary/40 hover:bg-accent hover:text-primary"
                                                >
                                                    <ExternalLink className="h-4 w-4" />
                                                    View
                                                </a>

                                                {canEdit && (
                                                    <button
                                                        type="button"
                                                        onClick={() => startEditing(index)}
                                                        className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-muted transition hover:border-primary/40 hover:bg-accent hover:text-primary"
                                                    >
                                                        <Edit3 className="h-4 w-4" />
                                                        Edit
                                                    </button>
                                                )}

                                                {canEdit && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeDocument(index)}
                                                        className="inline-flex items-center gap-2 rounded-lg border border-danger/20 px-3 py-2 text-sm font-medium text-danger transition hover:bg-danger/10"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                        Remove
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-lg border border-dashed border-border px-5 py-10 text-center">
                            <FileText className="mx-auto h-8 w-8 text-muted-foreground" />
                            <p className="mt-3 text-sm font-medium text-muted">No documents uploaded yet</p>
                        </div>
                    )}
                </section>

                {requiredDocuments.length > 0 && (
                    <section className="rounded-xl border border-border bg-surface p-5">
                        <div className="mb-5">
                            <h2 className="text-lg font-semibold text-foreground">Required Documents</h2>
                            <p className="mt-1 text-sm text-muted">
                                Please provide the documents requested by the insurance dispatcher.
                            </p>
                        </div>

                        <div className="space-y-4">
                            {requiredDocuments.map((type) => {
                                const existingDocument = getExistingDocument(type);
                                const value = getRequiredDocumentValue(type);

                                return (
                                    <div key={type} className="rounded-lg border border-border bg-surface-secondary p-4">
                                        <div className="mb-3 flex items-center gap-3">
                                            <div className="rounded-lg bg-primary/10 p-2">
                                                <FileText className="h-5 w-5 text-primary" />
                                            </div>

                                            <div>
                                                <p className="font-medium text-foreground">
                                                    {documentLabels[type] || type}
                                                </p>

                                                <p className={`text-xs ${existingDocument ? "text-success" : "text-warning"}`}>
                                                    {existingDocument ? "Already uploaded" : "Required"}
                                                </p>
                                            </div>
                                        </div>

                                        {existingDocument ? (
                                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                <p className="min-w-0 truncate text-sm text-muted">
                                                    {existingDocument.file_url}
                                                </p>

                                                <a
                                                    href={existingDocument.file_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-muted transition hover:border-primary/40 hover:bg-accent hover:text-primary"
                                                >
                                                    <ExternalLink className="h-4 w-4" />
                                                    View
                                                </a>
                                            </div>
                                        ) : (
                                            <input
                                                type="url"
                                                value={value}
                                                onChange={(event) => updateRequiredDocument(type, event.target.value)}
                                                placeholder={`Enter ${documentLabels[type] || type} URL`}
                                                className={`w-full ${inputClass}`}
                                            />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

                {canUpload && (
                    <section className="rounded-xl border border-border bg-surface p-5">
                        <div className="mb-5">
                            <h2 className="text-lg font-semibold text-foreground">Additional Documents</h2>
                            <p className="mt-1 text-sm text-muted">
                                You can optionally submit additional documents along with the required documents.
                            </p>
                        </div>

                        <div className="space-y-4">
                            {additionalDocuments.map((document, index) => (
                                <div key={index} className="rounded-lg border border-border bg-surface-secondary p-4">
                                    <div className="grid gap-3 md:grid-cols-[190px_1fr_auto]">
                                        <select
                                            value={document.type}
                                            onChange={(event) => updateAdditionalDocument(index, "type", event.target.value)}
                                            className={inputClass}
                                        >
                                            {documentTypes.map(([value, label]) => (
                                                <option key={value} value={value} className="bg-surface text-foreground">
                                                    {label}
                                                </option>
                                            ))}
                                        </select>

                                        <input
                                            type="url"
                                            value={document.file_url}
                                            onChange={(event) => updateAdditionalDocument(index, "file_url", event.target.value)}
                                            placeholder="Enter document URL"
                                            className={inputClass}
                                        />

                                        <button
                                            type="button"
                                            onClick={() => removeAdditionalDocument(index)}
                                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-danger/20 px-3 py-2 text-sm font-medium text-danger transition hover:bg-danger/10"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ))}

                            <div className="flex flex-col gap-3 sm:flex-row">
                                <button
                                    type="button"
                                    onClick={addAdditionalDocument}
                                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-surface-secondary px-4 py-2.5 text-sm font-medium text-muted transition hover:border-primary/40 hover:bg-accent hover:text-primary"
                                >
                                    <Plus className="h-4 w-4" />
                                    Add Extra Document
                                </button>

                                <button
                                    type="button"
                                    onClick={submitDocuments}
                                    disabled={submitting}
                                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <Upload className="h-4 w-4" />
                                    {submitting ? "Submitting..." : "Submit Documents"}
                                </button>
                            </div>
                        </div>
                    </section>
                )}

                {!canUpload && (
                    <div className="rounded-lg border border-border bg-surface p-4 text-sm text-muted">
                        New documents can only be submitted when the claim requires additional documents.
                    </div>
                )}
            </div>
        </main>
    );
}