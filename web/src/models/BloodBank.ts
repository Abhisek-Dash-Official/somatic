import mongoose, { Schema, Document, model, models } from "mongoose";
import { IBloodBank } from "@/types/models";

export interface IBloodBankDocument extends IBloodBank, Document {
  _id: any;
}

const BloodInventorySchema = new Schema(
  {
    blood_group: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      required: true,
    },
    stock_units: { type: Number, required: true, min: 0, default: 0 },
    price_per_unit: { type: Number, required: true, min: 0 },
    last_updated: { type: Date, default: Date.now },
  },
  { _id: false },
);

const BloodBankSchema = new Schema<IBloodBankDocument>(
  {
    name: { type: String, required: true, trim: true },
    hospital_affiliation: { type: String, trim: true },
    images: [{ type: String }],
    license_no: { type: String, required: true, unique: true },
    contact_no: { type: String, required: true, match: /^[0-9]{10}$/ },
    email: { type: String, lowercase: true, trim: true },

    address: {
      street: { type: String, required: true },
      city: { type: String, required: true, index: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },
    },

    inventory: [BloodInventorySchema],

    is_delivery_available: { type: Boolean, default: false },
    is_active: { type: Boolean, default: true },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  },
);

BloodBankSchema.index({ "address.city": 1, "inventory.blood_group": 1 });
BloodBankSchema.index({ "address.pincode": 1 });

export default models.BloodBank ||
  model<IBloodBankDocument>("BloodBank", BloodBankSchema);
