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
        inventory: editingBank?.inventory?.length > 0
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
        setFormData((prev) => ({ ...prev, images: prev.images.filter((_: string, i: number) => i !== idx) }));
    };

    const updateImageUrl = (idx: number, value: string) => {
        setFormData((prev) => ({ ...prev, images: prev.images.map((img: string, i: number) => i === idx ? value : img) }));
        setFailedImages((prev) => {
            const updated = { ...prev };
            delete updated[idx];
            return updated;
        });
    };

    const updateInventoryItem = (bg: string, field: "stock_units" | "price_per_unit", val: number) => {
        setFormData((prev) => ({
            ...prev,
            inventory: prev.inventory.map((item: any) => item.blood_group === bg ? { ...item, [field]: val } : item),
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
            const url = editingBank ? `/api/admin/shop/bloodbanks/${editingBank._id}` : "/api/admin/shop/bloodbanks";
            const method = editingBank ? "PUT" : "POST";

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

    const inputClass = "w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-danger focus:outline-none focus:ring-1 focus:ring-danger transition-colors";
    const sectionClass = "space-y-3 border-t border-border pt-5";
    const labelClass = "mb-1 block text-xs font-medium text-muted";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black/70 p-3 sm:p-4">
            <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl">

                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-surface px-6 py-4">
                    <div>
                        <h2 className="text-lg font-bold text-foreground">{editingBank ? "Edit Blood Bank" : "Add Blood Bank"}</h2>
                        <p className="text-xs text-muted">Configure blood bank facilities and inventory</p>
                    </div>

                    <button type="button" onClick={onClose} className="rounded-xl p-2 text-muted hover:bg-surface-secondary hover:text-foreground transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form id="bloodbank-form" onSubmit={handleSubmit} className="flex-1 space-y-6 overflow-y-auto p-6 text-foreground">

                    <div className="space-y-3">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-danger">Facility Info</h3>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <label className={labelClass}>Blood Bank Name *</label>
                                <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={inputClass} />
                            </div>

                            <div>
                                <label className={labelClass}>License No *</label>
                                <input type="text" required value={formData.license_no} onChange={(e) => setFormData({ ...formData, license_no: e.target.value })} className={inputClass} />
                            </div>

                            <div>
                                <label className={labelClass}>Contact No *</label>
                                <input type="text" required pattern="[0-9]{10}" value={formData.contact_no} onChange={(e) => setFormData({ ...formData, contact_no: e.target.value })} className={inputClass} />
                            </div>

                            <div>
                                <label className={labelClass}>Email</label>
                                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={inputClass} />
                            </div>
                        </div>
                    </div>

                    <div className={sectionClass}>
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-danger">Address & Location</h3>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <label className={labelClass}>Street *</label>
                                <input type="text" required value={formData.street} onChange={(e) => setFormData({ ...formData, street: e.target.value })} className={inputClass} />
                            </div>

                            <div>
                                <label className={labelClass}>City *</label>
                                <input type="text" required value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className={inputClass} />
                            </div>

                            <div>
                                <label className={labelClass}>State *</label>
                                <input type="text" required value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} className={inputClass} />
                            </div>

                            <div>
                                <label className={labelClass}>Pincode *</label>
                                <input type="text" required value={formData.pincode} onChange={(e) => setFormData({ ...formData, pincode: e.target.value })} className={inputClass} />
                            </div>
                        </div>

                        <label htmlFor="deliv_avail" className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-surface-secondary p-3 hover:border-danger transition-colors">
                            <div className={`flex h-5 w-5 items-center justify-center rounded-md border transition-colors ${formData.is_delivery_available ? "border-danger bg-danger text-white" : "border-border bg-background"}`}>
                                {formData.is_delivery_available && <Check className="h-3.5 w-3.5 stroke-3" />}
                            </div>

                            <input type="checkbox" id="deliv_avail" checked={formData.is_delivery_available} onChange={(e) => setFormData({ ...formData, is_delivery_available: e.target.checked })} className="sr-only" />

                            <span className="text-sm font-medium text-foreground">Emergency Delivery Available</span>
                        </label>
                    </div>

                    <div className={sectionClass}>
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-danger">Blood Stock & Pricing Matrix</h3>

                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                            {BLOOD_GROUPS.map((bg) => {
                                const item = formData.inventory.find((i: any) => i.blood_group === bg) || { stock_units: 0, price_per_unit: 0 };

                                return (
                                    <div key={bg} className="rounded-xl border border-border bg-background p-3">
                                        <span className="mb-2 block text-xs font-bold text-danger">{bg}</span>

                                        <div className="space-y-2">
                                            <input type="number" min="0" placeholder="Units" value={item.stock_units} onChange={(e) => updateInventoryItem(bg, "stock_units", Number(e.target.value))} className="w-full rounded-lg border border-border bg-surface px-2 py-1.5 text-xs text-foreground focus:border-danger focus:outline-none" />
                                            <input type="number" min="0" placeholder="Price (₹)" value={item.price_per_unit} onChange={(e) => updateInventoryItem(bg, "price_per_unit", Number(e.target.value))} className="w-full rounded-lg border border-border bg-surface px-2 py-1.5 text-xs text-foreground focus:border-danger focus:outline-none" />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className={sectionClass}>
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-danger">Facility Images</h3>

                        <div className="flex gap-2">
                            <input type="text" placeholder="Paste Image URL..." value={imageUrlInput} onChange={(e) => setImageUrlInput(e.target.value)} className={inputClass} />

                            <button type="button" onClick={addImageUrl} className="flex items-center gap-1.5 rounded-xl border border-border bg-surface-secondary px-4 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
                                <ImagePlus className="h-4 w-4" /> Add
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2 lg:grid-cols-3">
                            {formData.images.map((img: string, idx: number) => (
                                <div key={idx} className="group relative overflow-hidden rounded-xl border border-border bg-background">
                                    <div className="relative flex aspect-video items-center justify-center bg-background">
                                        {!failedImages[idx] && img.trim() ? (
                                            <Image src={img} alt={`Blood Bank image ${idx + 1}`} fill className="object-contain" unoptimized onError={() => setFailedImages((prev) => ({ ...prev, [idx]: true }))} />
                                        ) : (
                                            <Pill className="h-8 w-8 text-muted-foreground" />
                                        )}

                                        <div className="absolute top-2 left-2 rounded-md border border-border bg-surface-secondary px-2 py-1 font-mono text-[10px] text-muted">
                                            {idx === 0 ? "Main" : `#${idx}`}
                                        </div>

                                        <button type="button" onClick={() => removeImageAt(idx)} className="absolute top-2 right-2 rounded-lg bg-danger p-1.5 text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100" title="Remove image">
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    </div>

                                    <div className="border-t border-border p-2">
                                        <input type="text" value={img} onChange={(e) => updateImageUrl(idx, e.target.value)} placeholder="Image URL" className="w-full rounded-lg border border-border bg-surface px-2.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </form>

                <div className="sticky bottom-0 z-10 flex justify-end gap-3 border-t border-border bg-surface px-6 py-4">
                    <button type="button" onClick={onClose} className="rounded-xl px-4 py-2 text-sm font-medium text-muted hover:bg-surface-secondary hover:text-foreground transition-colors">
                        Cancel
                    </button>

                    <button type="submit" form="bloodbank-form" disabled={saving} className="flex items-center gap-2 rounded-xl bg-danger px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-danger/90 disabled:opacity-50">
                        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                        {editingBank ? "Save Changes" : "Create Blood Bank"}
                    </button>
                </div>
            </div>
        </div>
    );
}