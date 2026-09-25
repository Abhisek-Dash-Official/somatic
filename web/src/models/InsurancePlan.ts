import mongoose, { Schema, Document, model, models } from "mongoose";
import { IInsurancePlan } from "@/types/models";

export interface IInsurancePlanDocument extends IInsurancePlan, Document {
  _id: any;
}

const InsurancePlanSchema = new Schema<IInsurancePlanDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    coverage_amount: {
      type: Number,
      required: true,
      min: 0,
    },

    premium_amount: {
      type: Number,
      required: true,
      min: 0,
    },

    premium_frequency: {
      type: String,
      enum: ["monthly", "quarterly", "half_yearly", "yearly"],
      required: true,
    },

    features: [{ type: String }],

    is_active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
);

export default models.InsurancePlan ||
  model("InsurancePlan", InsurancePlanSchema);
