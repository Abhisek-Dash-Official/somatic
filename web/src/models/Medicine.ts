import mongoose, { Schema, Document, model, models } from "mongoose";
import { IMedicine } from "@/types/models";

export interface IMedicineDocument extends IMedicine, Document {
  _id: any;
}

const MedicineSchema = new Schema<IMedicineDocument>(
  {
    name: { type: String, required: true, trim: true },
    brand: { type: String, required: true, trim: true },
    manufacturer: { type: String, required: true },
    category: { type: String, required: true, lowercase: true, trim: true },
    description: { type: String, required: true },

    pricing: {
      mrp: { type: Number, required: true, min: 0 },
      sale_price: { type: Number, required: true, min: 0 },
      currency: { type: String, default: "INR" },
    },
    stock: { type: Number, required: true, min: 0 },
    sku: {
      type: String,
      unique: true,
      sparse: true,
      required: true,
      uppercase: true,
    },

    composition: [{ type: String }],
    dosage_form: { type: String, required: true, lowercase: true, trim: true },
    packaging: { type: String, required: true },
    requires_prescription: { type: Boolean, default: false },

    indications: [{ type: String }],
    side_effects: [{ type: String }],
    precautions: { type: String },
    how_to_use: { type: String },

    images: [{ type: String }],
    tags: [{ type: String, lowercase: true }],
    is_active: { type: Boolean, default: true },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  },
);

MedicineSchema.index({ name: "text", brand: "text", tags: "text" });
MedicineSchema.index({ category: 1 });
MedicineSchema.index({ requires_prescription: 1 });

const Medicine =
  models.Medicine || model<IMedicineDocument>("Medicine", MedicineSchema);

export default Medicine;
