"use client";

import { FileText, Plus, Trash2 } from "lucide-react";

export interface InsuranceDocument {
    type: "policy" | "id_proof" | "medical" | "other";
    file_url: string;
}

interface InsuranceDocumentUploadProps {
    documents: InsuranceDocument[];
    onChange: (documents: InsuranceDocument[]) => void;
    requiredTypes?: InsuranceDocument["type"][];
}

const documentTypes: { value: InsuranceDocument["type"]; label: string }[] = [
    { value: "id_proof", label: "ID Proof" },
    { value: "medical", label: "Medical Document" },
    { value: "policy", label: "Existing Policy" },
    { value: "other", label: "Other Document" },
];

export default function InsuranceDocumentUpload({
    documents,
    onChange,
    requiredTypes = [],
}: InsuranceDocumentUploadProps) {
    const addDocument = () => {
        onChange([...documents, { type: "id_proof", file_url: "" }]);
    };

    const updateDocument = (
        index: number,
        field: keyof InsuranceDocument,
        value: string
    ) => {
        const updated = [...documents];
        updated[index] = { ...updated[index], [field]: value } as InsuranceDocument;
        onChange(updated);
    };

    const removeDocument = (index: number) => {
        onChange(documents.filter((_, documentIndex) => documentIndex !== index));
    };

    return (
        <div className="space-y-4">
            {documents.map((document, index) => (
                <div key={index} className="rounded-xl border border-border bg-surface-secondary p-5">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <FileText size={18} />
                            </div>

                            <p className="text-sm font-medium text-foreground">
                                Document {index + 1}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => removeDocument(index)}
                            className="rounded-lg p-2 text-muted-foreground transition hover:bg-danger/10 hover:text-danger"
                        >
                            <Trash2 size={17} />
                        </button>
                    </div>

                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-xs font-medium text-muted">
                                Document Type
                            </label>

                            <select
                                value={document.type}
                                onChange={(event) =>
                                    updateDocument(index, "type", event.target.value)
                                }
                                className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                            >
                                {documentTypes.map((type) => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-2 block text-xs font-medium text-muted">
                                File URL
                            </label>

                            <input
                                type="url"
                                value={document.file_url}
                                onChange={(event) =>
                                    updateDocument(index, "file_url", event.target.value)
                                }
                                placeholder="https://..."
                                className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10"
                            />
                        </div>
                    </div>
                </div>
            ))}

            <button
                type="button"
                onClick={addDocument}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border px-4 py-3 text-sm font-medium text-muted transition hover:border-primary/50 hover:bg-accent hover:text-primary"
            >
                <Plus size={18} />
                Add Document
            </button>

            {requiredTypes.length > 0 && (
                <p className="text-xs text-muted-foreground">
                    Required documents:{" "}
                    {requiredTypes
                        .map((type) =>
                            documentTypes.find((item) => item.value === type)?.label
                        )
                        .filter(Boolean)
                        .join(", ")}
                </p>
            )}
        </div>
    );
}