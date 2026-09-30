import mongoose, { Schema, Document, model, models } from "mongoose";
import { ISubscriptionPlan } from "@/types/models";

export interface ISubscriptionPlanDocument extends ISubscriptionPlan, Document {
  _id: any;
}

const SubscriptionPlanSchema = new Schema<ISubscriptionPlanDocument>(
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

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "INR",
      uppercase: true,
      trim: true,
    },

    duration_days: {
      type: Number,
      required: true,
      min: 1,
    },

    features: {
      type: [String],
      default: [],
    },

    supported_features: {
      // e.g. soma_ai, consultation_analysis, consultation_translation, medical_report_analysis
      type: [String],
      default: [],
      index: true,
    },

    token_limit: {
      type: Number,
      required: true,
      min: 0,
    },

    is_active: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
);

export default models.SubscriptionPlan ||
  model<ISubscriptionPlanDocument>("SubscriptionPlan", SubscriptionPlanSchema);
