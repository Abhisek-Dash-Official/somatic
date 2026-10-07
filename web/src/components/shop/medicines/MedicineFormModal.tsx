"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, ImagePlus, Loader2, Pill, X } from "lucide-react";

const CATEGORIES = [
    "prescription",
    "otc",
    "first-aid",
    "supplements",
    "personal-care",
    "devices",
];

const DOSAGE_FORMS = [
    "tablet",
    "capsule",
    "syrup",
    "injection",
    "ointment",
    "drops",
    "powder",
    "gel",
];

interface Props {
    editingMedicine: any;
    onClose: () => void;
    onSuccess: () => void;
}

export default function MedicineFormModal({
    editingMedicine,
    onClose,
    onSuccess,
}: Props) {
    const [formData, setFormData] = useState({
        name: editingMedicine?.name || "",
        brand: editingMedicine?.brand || "",
        manufacturer: editingMedicine?.manufacturer || "",
        category: editingMedicine?.category || "prescription",
        description: editingMedicine?.description || "",
        mrp: editingMedicine?.pricing?.mrp || 0,
        sale_price: editingMedicine?.pricing?.sale_price || 0,
        stock: editingMedicine?.stock || 0,
        sku: editingMedicine?.sku || "",
        dosage_form: editingMedicine?.dosage_form || "tablet",
        packaging: editingMedicine?.packaging || "",
        requires_prescription: editingMedicine?.requires_prescription ?? true,
        composition: editingMedicine?.composition?.join(", ") || "",
        indications: editingMedicine?.indications?.join(", ") || "",
        side_effects: editingMedicine?.side_effects?.join(", ") || "",
        precautions: editingMedicine?.precautions || "",
        how_to_use: editingMedicine?.how_to_use || "",
        tags: editingMedicine?.tags?.join(", ") || "",
        images: editingMedicine?.images || [],
    });

    const [imageUrlInput, setImageUrlInput] = useState("");
    const [saving, setSaving] = useState(false);
    const [failedImages, setFailedImages] = useState<Record<number, boolean>>({});

    const addImageUrl = () => {
        if (imageUrlInput.trim()) {
            setFormData((prev) => ({
                ...prev,
                images: [...prev.images, imageUrlInput.trim()],
            }));
            setImageUrlInput("");
        }
    };

    const removeImageAt = (idx: number) => {
        setFormData((prev) => ({
            ...prev,
            images: prev.images.filter((_: string, i: number) => i !== idx),
        }));
    };

    const updateImageUrl = (idx: number, value: string) => {
        setFormData((prev) => ({
            ...prev,
            images: prev.images.map((img: string, i: number) =>
                i === idx ? value : img,
            ),
        }));

        setFailedImages((prev) => {
            const updated = { ...prev };
            delete updated[idx];
            return updated;
        });
    };

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSaving(true);

        const payload = {
            name: formData.name,
            brand: formData.brand,
            manufacturer: formData.manufacturer,
            category: formData.category.toLowerCase(),
            description: formData.description,
            pricing: {
                mrp: Number(formData.mrp),
                sale_price: Number(formData.sale_price),
                currency: "INR",
            },
            stock: Number(formData.stock),
            sku: formData.sku.toUpperCase(),
            dosage_form: formData.dosage_form.toLowerCase(),
            packaging: formData.packaging,
            requires_prescription: formData.requires_prescription,
            composition: formData.composition
                ? formData.composition
                    .split(",")
                    .map((s: string) => s.trim())
                : [],
            indications: formData.indications
                ? formData.indications
                    .split(",")
                    .map((s: string) => s.trim())
                : [],
            side_effects: formData.side_effects
                ? formData.side_effects
                    .split(",")
                    .map((s: string) => s.trim())
                : [],
            precautions: formData.precautions,
            how_to_use: formData.how_to_use,
            tags: formData.tags
                ? formData.tags
                    .split(",")
                    .map((s: string) => s.trim().toLowerCase())
                : [],
            images: formData.images,
        };

        try {
            const url = editingMedicine
                ? `/api/admin/shop/medicines/${editingMedicine._id}`
                : "/api/admin/shop/medicines";
            const method = editingMedicine ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const json = await res.json();

            if (json.success) onSuccess();
            else alert(json.message || "Operation failed");
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const inputClass =
        "w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";
    const sectionClass = "space-y-3 border-t border-border pt-5";
    const labelClass = "mb-1 block text-xs font-medium text-muted";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black/70 p-3 sm:p-4">
            <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl">
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-surface px-6 py-4">
                    <div>
                        <h2 className="text-lg font-bold text-foreground">
                            {editingMedicine
                                ? "Edit Medicine"
                                : "Add New Medicine"}
                        </h2>

                        <p className="text-xs text-muted">
                            Fill in the details to update inventory
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl p-2 text-muted transition-colors hover:bg-surface-secondary hover:text-foreground"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form
                    id="medicine-form"
                    onSubmit={handleSubmit}
                    className="flex-1 space-y-6 overflow-y-auto p-6 text-foreground"
                >
                    <div className="space-y-3">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-primary">
                            Basic Information
                        </h3>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <label className={labelClass}>
                                    Medicine Name *
                                </label>

                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            name: e.target.value,
                                        })
                                    }
                                    className={inputClass}
                                    placeholder="e.g. Dutasteride"
                                />
                            </div>

                            <div>
                                <label className={labelClass}>Brand *</label>

                                <input
                                    type="text"
                                    required
                                    value={formData.brand}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            brand: e.target.value,
                                        })
                                    }
                                    className={inputClass}
                                    placeholder="e.g. Duprost"
                                />
                            </div>

                            <div>
                                <label className={labelClass}>
                                    Manufacturer *
                                </label>

                                <input
                                    type="text"
                                    required
                                    value={formData.manufacturer}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            manufacturer: e.target.value,
                                        })
                                    }
                                    className={inputClass}
                                    placeholder="e.g. Cipla Ltd"
                                />
                            </div>

                            <div>
                                <label className={labelClass}>SKU *</label>

                                <input
                                    type="text"
                                    required
                                    value={formData.sku}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            sku: e.target.value,
                                        })
                                    }
                                    className={`${inputClass} uppercase`}
                                    placeholder="DUTA-05MG-001"
                                />
                            </div>
                        </div>
                    </div>

                    <div className={sectionClass}>
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-primary">
                            Classification & Form
                        </h3>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <label className={labelClass}>Category *</label>

                                <select
                                    value={formData.category}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            category: e.target.value,
                                        })
                                    }
                                    className={`${inputClass} capitalize`}
                                >
                                    {CATEGORIES.map((cat) => (
                                        <option key={cat} value={cat}>
                                            {cat.replace("-", " ")}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className={labelClass}>
                                    Dosage Form *
                                </label>

                                <select
                                    value={formData.dosage_form}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            dosage_form: e.target.value,
                                        })
                                    }
                                    className={`${inputClass} capitalize`}
                                >
                                    {DOSAGE_FORMS.map((form) => (
                                        <option key={form} value={form}>
                                            {form}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <label
                            htmlFor="req_prescription"
                            className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-border bg-surface-secondary p-3 transition-colors hover:border-primary"
                        >
                            <div
                                className={`flex h-5 w-5 items-center justify-center rounded-md border transition-colors ${formData.requires_prescription
                                        ? "border-primary bg-primary text-primary-foreground"
                                        : "border-border bg-background"
                                    }`}
                            >
                                {formData.requires_prescription && (
                                    <Check className="h-3.5 w-3.5 stroke-3" />
                                )}
                            </div>

                            <input
                                type="checkbox"
                                id="req_prescription"
                                checked={formData.requires_prescription}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        requires_prescription:
                                            e.target.checked,
                                    })
                                }
                                className="sr-only"
                            />

                            <span className="text-sm font-medium text-foreground">
                                Requires Doctor Prescription (Rx)
                            </span>
                        </label>
                    </div>

                    <div className={sectionClass}>
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-primary">
                            Pricing & Stock
                        </h3>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <label className={labelClass}>MRP (₹) *</label>

                                <input
                                    type="number"
                                    required
                                    min="0"
                                    value={formData.mrp}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            mrp: Number(e.target.value),
                                        })
                                    }
                                    className={inputClass}
                                />
                            </div>

                            <div>
                                <label className={labelClass}>
                                    Sale Price (₹) *
                                </label>

                                <input
                                    type="number"
                                    required
                                    min="0"
                                    value={formData.sale_price}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            sale_price: Number(e.target.value),
                                        })
                                    }
                                    className={inputClass}
                                />
                            </div>

                            <div>
                                <label className={labelClass}>
                                    Stock Units *
                                </label>

                                <input
                                    type="number"
                                    required
                                    min="0"
                                    value={formData.stock}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            stock: Number(e.target.value),
                                        })
                                    }
                                    className={inputClass}
                                />
                            </div>

                            <div>
                                <label className={labelClass}>
                                    Packaging *
                                </label>

                                <input
                                    type="text"
                                    required
                                    value={formData.packaging}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            packaging: e.target.value,
                                        })
                                    }
                                    className={inputClass}
                                    placeholder="e.g. 10 tablets per strip"
                                />
                            </div>
                        </div>
                    </div>

                    <div className={sectionClass}>
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-primary">
                            Description & Usage
                        </h3>

                        <div>
                            <label className={labelClass}>Description *</label>

                            <textarea
                                required
                                rows={3}
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        description: e.target.value,
                                    })
                                }
                                className={`${inputClass} resize-none`}
                                placeholder="Enter clinical usage and description..."
                            />
                        </div>
                    </div>

                    <div className={sectionClass}>
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-primary">
                            Product Images
                        </h3>

                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Paste Image URL..."
                                value={imageUrlInput}
                                onChange={(e) =>
                                    setImageUrlInput(e.target.value)
                                }
                                className={inputClass}
                            />

                            <button
                                type="button"
                                onClick={addImageUrl}
                                className="flex items-center gap-1.5 rounded-xl border border-border bg-surface-secondary px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                            >
                                <ImagePlus className="h-4 w-4" />
                                Add
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2 lg:grid-cols-3">
                            {formData.images.map(
                                (img: string, idx: number) => (
                                    <div
                                        key={idx}
                                        className="group relative overflow-hidden rounded-xl border border-border bg-background"
                                    >
                                        <div className="relative flex aspect-video items-center justify-center bg-background">
                                            {!failedImages[idx] && img.trim() ? (
                                                <Image
                                                    src={img}
                                                    alt={`Medicine image ${idx + 1
                                                        }`}
                                                    fill
                                                    className="object-contain"
                                                    unoptimized
                                                    onError={() =>
                                                        setFailedImages(
                                                            (prev) => ({
                                                                ...prev,
                                                                [idx]: true,
                                                            }),
                                                        )
                                                    }
                                                />
                                            ) : (
                                                <Pill className="h-8 w-8 text-muted-foreground" />
                                            )}

                                            <div className="absolute left-2 top-2 rounded-full border border-border bg-surface-secondary px-2 py-1 font-mono text-[10px] text-muted">
                                                {idx === 0 ? "Main" : `#${idx}`}
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeImageAt(idx)
                                                }
                                                className="absolute right-2 top-2 rounded-xl bg-danger p-1.5 text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100"
                                                title="Remove image"
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </button>
                                        </div>

                                        <div className="border-t border-border p-2">
                                            <input
                                                type="text"
                                                value={img}
                                                onChange={(e) =>
                                                    updateImageUrl(
                                                        idx,
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Image URL"
                                                className="w-full rounded-xl border border-border bg-surface px-2.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                                            />
                                        </div>
                                    </div>
                                ),
                            )}
                        </div>
                    </div>
                </form>

                <div className="sticky bottom-0 z-10 flex justify-end gap-3 border-t border-border bg-surface px-6 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl px-4 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface-secondary hover:text-foreground"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        form="medicine-form"
                        disabled={saving}
                        className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-50"
                    >
                        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                        {editingMedicine
                            ? "Save Changes"
                            : "Create Medicine"}
                    </button>
                </div>
            </div>
        </div>
    );
}