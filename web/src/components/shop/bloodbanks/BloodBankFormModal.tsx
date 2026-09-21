"use client";

import { useState } from "react";
import Image from "next/image";
import { X, ImagePlus, Loader2, Check, Pill } from "lucide-react";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

interface Props {
    editingBank: any;
    onClose: () => void;
    onSuccess: () => void;
}

export default function BloodBankFormModal({ editingBank, onClose, onSuccess }: Props) {
    const [formData, setFormData] = useState({
        name: editingBank?.name || "",
        hospital_affiliation: editingBank?.hospital_affiliation || "",
        license_no: editingBank?.license_no || "",
        contact_no: editingBank?.contact_no || "",
        email: editingBank?.email || "",
        street: editingBank?.address?.street || "",
        city: editingBank?.address?.city || "",
        state: editingBank?.address?.state || "",
        pincode: editingBank?.address?.pincode || "",
        lat: editingBank?.address?.coordinates?.lat || 0,
        lng: editingBank?.address?.coordinates?.lng || 0,
        is_delivery_available: editingBank?.is_delivery_available || false,
        images: editingBank?.images || [],
        inventory: editingBank?.inventory && editingBank.inventory.length > 0
            ? editingBank.inventory
            : BLOOD_GROUPS.map((bg) => ({ blood_group: bg, stock_units: 0, price_per_unit: 0 })),
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

    const updateInventoryItem = (bg: string, field: "stock_units" | "price_per_unit", val: number) => {
        setFormData((prev) => ({
            ...prev,
            inventory: prev.inventory.map((item: any) =>
                item.blood_group === bg ? { ...item, [field]: val } : item
            ),
        }));
    };

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSaving(true);

        const payload = {
            name: formData.name,
            hospital_affiliation: formData.hospital_affiliation,
            license_no: formData.license_no,
            contact_no: formData.contact_no,
            email: formData.email,
            address: {
                street: formData.street,
                city: formData.city,
                state: formData.state,
                pincode: formData.pincode,
                coordinates: { lat: Number(formData.lat), lng: Number(formData.lng) },
            },
            is_delivery_available: formData.is_delivery_available,
            images: formData.images,
            inventory: formData.inventory,
        };

        try {
            const url = editingBank
                ? `/api/admin/shop/bloodbanks/${editingBank._id}`
                : "/api/admin/shop/bloodbanks";
            const method = editingBank ? "PUT" : "POST";

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
                            {editingBank ? "Edit Blood Bank" : "Add Blood Bank"}
                        </h2>
                        <p className="text-xs text-slate-400">Configure blood bank facilities and inventory</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-xl transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form id="bloodbank-form" onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1 text-slate-200">

                    {/* Section: Facility Details */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-semibold text-rose-400 uppercase tracking-wider">Facility Info</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-medium text-slate-300 block mb-1">Blood Bank Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 placeholder:text-slate-600 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-300 block mb-1">License No *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.license_no}
                                    onChange={(e) => setFormData({ ...formData, license_no: e.target.value })}
                                    className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 placeholder:text-slate-600 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-300 block mb-1">Contact No *</label>
                                <input
                                    type="text"
                                    required
                                    pattern="[0-9]{10}"
                                    value={formData.contact_no}
                                    onChange={(e) => setFormData({ ...formData, contact_no: e.target.value })}
                                    className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 placeholder:text-slate-600 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-300 block mb-1">Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 placeholder:text-slate-600 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section: Location */}
                    <div className="space-y-3 pt-2 border-t border-slate-800/60">
                        <h3 className="text-xs font-semibold text-rose-400 uppercase tracking-wider">Address & Location</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-medium text-slate-300 block mb-1">Street *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.street}
                                    onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                                    className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-300 block mb-1">City *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-300 block mb-1">State *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.state}
                                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                    className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-300 block mb-1">Pincode *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.pincode}
                                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                                    className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all"
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <label
                                htmlFor="deliv_avail"
                                className="flex items-center gap-3 cursor-pointer bg-slate-950/50 p-3 rounded-xl border border-slate-800 hover:border-slate-700 transition-all"
                            >
                                <div
                                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${formData.is_delivery_available
                                        ? "bg-rose-600 border-rose-500 text-white"
                                        : "border-slate-700 bg-slate-900"
                                        }`}
                                >
                                    {formData.is_delivery_available && <Check className="w-3.5 h-3.5 stroke-3" />}
                                </div>
                                <input
                                    type="checkbox"
                                    id="deliv_avail"
                                    checked={formData.is_delivery_available}
                                    onChange={(e) => setFormData({ ...formData, is_delivery_available: e.target.checked })}
                                    className="sr-only"
                                />
                                <span className="text-sm font-medium text-slate-200">Emergency Delivery Available</span>
                            </label>
                        </div>
                    </div>

                    {/* Section: Blood Stock Inventory */}
                    <div className="space-y-3 pt-2 border-t border-slate-800/60">
                        <h3 className="text-xs font-semibold text-rose-400 uppercase tracking-wider">Blood Stock & Pricing Matrix</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {BLOOD_GROUPS.map((bg) => {
                                const item = formData.inventory.find((i: any) => i.blood_group === bg) || {
                                    stock_units: 0,
                                    price_per_unit: 0,
                                };
                                return (
                                    <div key={bg} className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                                        <span className="text-xs font-bold text-rose-500 block mb-2">{bg}</span>
                                        <div className="space-y-2">
                                            <input
                                                type="number"
                                                min="0"
                                                placeholder="Units"
                                                value={item.stock_units}
                                                onChange={(e) => updateInventoryItem(bg, "stock_units", Number(e.target.value))}
                                                className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-lg p-1.5 text-xs focus:outline-none focus:border-rose-500"
                                            />
                                            <input
                                                type="number"
                                                min="0"
                                                placeholder="Price (₹)"
                                                value={item.price_per_unit}
                                                onChange={(e) => updateInventoryItem(bg, "price_per_unit", Number(e.target.value))}
                                                className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-lg p-1.5 text-xs focus:outline-none focus:border-rose-500"
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Section: Images */}
                    <div className="space-y-3 pt-2 border-t border-slate-800/60">
                        <h3 className="text-xs font-semibold text-rose-400 uppercase tracking-wider">Facility Images</h3>
                        <div className="flex gap-2">
                            <input
                                type="url"
                                placeholder="Paste Image URL..."
                                value={imageUrlInput}
                                onChange={(e) => setImageUrlInput(e.target.value)}
                                className="flex-1 bg-slate-950/80 border border-slate-800 text-slate-100 placeholder:text-slate-600 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-rose-500 transition-all"
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
                                            type="url"
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
                        form="bloodbank-form"
                        disabled={saving}
                        className="px-5 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-500 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-rose-600/20 disabled:opacity-50"
                    >
                        {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                        {editingBank ? "Save Changes" : "Create Blood Bank"}
                    </button>
                </div>

            </div>
        </div>
    );
}