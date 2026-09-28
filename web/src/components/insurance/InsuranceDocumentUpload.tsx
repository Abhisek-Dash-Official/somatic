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

    const updateDocument = (index: number, field: keyof InsuranceDocument, value: string) => {
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
                <div key={index} className="rounded-2xl border border-slate-800 bg-[#0c1426] p-5">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                                <FileText size={18} />
                            </div>
                            <p className="text-sm font-medium text-white">Document {index + 1}</p>
                        </div>

                        <button
                            type="button"
                            onClick={() => removeDocument(index)}
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-red-500/10 hover:text-red-400"
                        >
                            <Trash2 size={17} />
                        </button>
                    </div>

                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-xs font-medium text-slate-400">
                                Document Type
                            </label>
                            <select
                                value={document.type}
                                onChange={(event) => updateDocument(index, "type", event.target.value)}
                                className="w-full rounded-xl border border-slate-700 bg-[#111a2f] px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
                            >
                                {documentTypes.map((type) => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-2 block text-xs font-medium text-slate-400">
                                File URL
                            </label>
                            <input
                                type="url"
                                value={document.file_url}
                                onChange={(event) => updateDocument(index, "file_url", event.target.value)}
                                placeholder="https://..."
                                className="w-full rounded-xl border border-slate-700 bg-[#111a2f] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
                            />
                        </div>
                    </div>
                </div>
            ))}

            <button
                type="button"
                onClick={addDocument}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-700 px-4 py-3 text-sm font-medium text-slate-400 transition hover:border-blue-500/50 hover:text-blue-400"
            >
                <Plus size={18} />
                Add Document
            </button>

            {requiredTypes.length > 0 && (
                <p className="text-xs text-slate-500">
                    Required documents: {requiredTypes.map((type) => documentTypes.find((item) => item.value === type)?.label).filter(Boolean).join(", ")}
                </p>
            )}
        </div>
    );
}