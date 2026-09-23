"use client";

import { useState } from "react";
import Image from "next/image";
import { X, ImagePlus, Loader2, Pill, Check } from "lucide-react";

const CATEGORIES = ["prescription", "otc", "first-aid", "supplements", "personal-care", "devices"];
const DOSAGE_FORMS = ["tablet", "capsule", "syrup", "injection", "ointment", "drops", "powder", "gel"];

interface Props {
    editingMedicine: any;
    onClose: () => void;
    onSuccess: () => void;
}

export default function MedicineFormModal({ editingMedicine, onClose, onSuccess }: Props) {
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
            setFormData((prev) => ({ ...prev, images: [...prev.images, imageUrlInput.trim()] }));
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
                i === idx ? value : img
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
            pricing: { mrp: Number(formData.mrp), sale_price: Number(formData.sale_price), currency: "INR" },
            stock: Number(formData.stock),
            sku: formData.sku.toUpperCase(),
            dosage_form: formData.dosage_form.toLowerCase(),
            packaging: formData.packaging,
            requires_prescription: formData.requires_prescription,
            composition: formData.composition ? formData.composition.split(",").map((s: string) => s.trim()) : [],
            indications: formData.indications ? formData.indications.split(",").map((s: string) => s.trim()) : [],
            side_effects: formData.side_effects ? formData.side_effects.split(",").map((s: string) => s.trim()) : [],
            precautions: formData.precautions,
            how_to_use: formData.how_to_use,
            tags: formData.tags ? formData.tags.split(",").map((s: string) => s.trim().toLowerCase()) : [],
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
            if (json.success) {
                onSuccess();
            } else {
                alert(json.message || "Operation failed");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-hidden">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">

                {/* Header */}
                <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-md px-6 py-4 border-b border-slate-800/80 flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-bold text-slate-100">
                            {editingMedicine ? "Edit Medicine" : "Add New Medicine"}
                        </h2>
                        <p className="text-xs text-slate-400">Fill in the details to update inventory</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-xl transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form id="medicine-form" onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1 text-slate-200">

                    {/* Section: Basic Information */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Basic Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-medium text-slate-300 block mb-1">Medicine Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 placeholder:text-slate-600 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                    placeholder="e.g. Dutasteride"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-300 block mb-1">Brand *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.brand}
                                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                    className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 placeholder:text-slate-600 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                    placeholder="e.g. Duprost"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-300 block mb-1">Manufacturer *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.manufacturer}
                                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                                    className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 placeholder:text-slate-600 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                    placeholder="e.g. Cipla Ltd"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-300 block mb-1">SKU *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.sku}
                                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                    className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 placeholder:text-slate-600 rounded-xl px-3.5 py-2.5 text-sm uppercase focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                    placeholder="DUTA-05MG-001"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section: Category & Classification */}
                    <div className="space-y-3 pt-2 border-t border-slate-800/60">
                        <h3 className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Classification & Form</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-medium text-slate-300 block mb-1">Category *</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 capitalize transition-all"
                                >
                                    {CATEGORIES.map((cat) => (
                                        <option key={cat} value={cat} className="bg-slate-900 text-slate-100 capitalize">
                                            {cat.replace("-", " ")}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-300 block mb-1">Dosage Form *</label>
                                <select
                                    value={formData.dosage_form}
                                    onChange={(e) => setFormData({ ...formData, dosage_form: e.target.value })}
                                    className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 capitalize transition-all"
                                >
                                    {DOSAGE_FORMS.map((form) => (
                                        <option key={form} value={form} className="bg-slate-900 text-slate-100 capitalize">
                                            {form}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 pt-2">
                            <label
                                htmlFor="req_prescription"
                                className="flex items-center gap-3 cursor-pointer bg-slate-950/50 p-3 rounded-xl border border-slate-800 w-full hover:border-slate-700 transition-all"
                            >
                                <div
                                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${formData.requires_prescription
                                        ? "bg-blue-600 border-blue-500 text-white"
                                        : "border-slate-700 bg-slate-900"
                                        }`}
                                >
                                    {formData.requires_prescription && <Check className="w-3.5 h-3.5 stroke-3" />}
                                </div>
                                <input
                                    type="checkbox"
                                    id="req_prescription"
                                    checked={formData.requires_prescription}
                                    onChange={(e) => setFormData({ ...formData, requires_prescription: e.target.checked })}
                                    className="sr-only"
                                />
                                <span className="text-sm font-medium text-slate-200">Requires Doctor Prescription (Rx)</span>
                            </label>
                        </div>
                    </div>

                    {/* Section: Pricing & Stock */}
                    <div className="space-y-3 pt-2 border-t border-slate-800/60">
                        <h3 className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Pricing & Stock</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-medium text-slate-300 block mb-1">MRP (₹) *</label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    value={formData.mrp}
                                    onChange={(e) => setFormData({ ...formData, mrp: Number(e.target.value) })}
                                    className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-300 block mb-1">Sale Price (₹) *</label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    value={formData.sale_price}
                                    onChange={(e) => setFormData({ ...formData, sale_price: Number(e.target.value) })}
                                    className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-300 block mb-1">Stock Units *</label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    value={formData.stock}
                                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                                    className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-300 block mb-1">Packaging *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.packaging}
                                    onChange={(e) => setFormData({ ...formData, packaging: e.target.value })}
                                    className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 placeholder:text-slate-600 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                    placeholder="e.g. 10 tablets per strip"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section: Description */}
                    <div className="space-y-3 pt-2 border-t border-slate-800/60">
                        <h3 className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Description & Usage</h3>
                        <div>
                            <label className="text-xs font-medium text-slate-300 block mb-1">Description *</label>
                            <textarea
                                required
                                rows={3}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 placeholder:text-slate-600 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                placeholder="Enter clinical usage and description..."
                            />
                        </div>
                    </div>

                    {/* Section: Images */}
                    <div className="space-y-3 pt-2 border-t border-slate-800/60">
                        <h3 className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Product Images</h3>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Paste Image URL..."
                                value={imageUrlInput}
                                onChange={(e) => setImageUrlInput(e.target.value)}
                                className="flex-1 bg-slate-950/80 border border-slate-800 text-slate-100 placeholder:text-slate-600 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-blue-500 transition-all"
                            />
                            <button
                                type="button"
                                onClick={addImageUrl}
                                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-1.5 transition-all border border-slate-700/60"
                            >
                                <ImagePlus className="w-4 h-4" /> Add
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                            {formData.images.map((img: string, idx: number) => (
                                <div
                                    key={idx}
                                    className="relative group rounded-xl overflow-hidden border border-slate-800 bg-slate-950"
                                >
                                    <div className="relative aspect-video bg-slate-950 flex items-center justify-center">
                                        {!failedImages[idx] && img.trim() ? (
                                            <Image
                                                src={img}
                                                alt={`Medicine image ${idx + 1}`}
                                                fill
                                                className="object-contain"
                                                unoptimized
                                                onError={() =>
                                                    setFailedImages((prev) => ({
                                                        ...prev,
                                                        [idx]: true,
                                                    }))
                                                }
                                            />
                                        ) : (
                                            <Pill className="w-8 h-8 text-slate-600" />
                                        )}

                                        <div className="absolute top-2 left-2 bg-slate-900/90 text-slate-300 text-[10px] px-2 py-1 rounded-md font-mono border border-slate-700/50">
                                            {idx === 0 ? "Main" : `#${idx}`}
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => removeImageAt(idx)}
                                            className="absolute top-2 right-2 p-1.5 bg-rose-600/90 hover:bg-rose-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-md"
                                            title="Remove image"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>

                                    <div className="p-2 border-t border-slate-800">
                                        <input
                                            type="text"
                                            value={img}
                                            onChange={(e) => updateImageUrl(idx, e.target.value)}
                                            placeholder="Image URL"
                                            className="w-full bg-slate-900 border border-slate-800 text-slate-300 placeholder:text-slate-600 rounded-lg px-2.5 py-2 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </form>

                {/* Footer */}
                <div className="sticky bottom-0 z-10 bg-slate-900/95 backdrop-blur-md px-6 py-4 border-t border-slate-800/80 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="medicine-form"
                        disabled={saving}
                        className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
                    >
                        {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                        {editingMedicine ? "Save Changes" : "Create Medicine"}
                    </button>
                </div>

            </div>
        </div>
    );
}