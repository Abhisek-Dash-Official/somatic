import mongoose, { Schema, Document, model, models } from "mongoose";
import { IAiUsage } from "@/types/models";

export interface IAiUsageDocument extends IAiUsage, Document {
  _id: any;
}

const AiUsageSchema = new Schema<IAiUsageDocument>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    subscription_id: {
      type: Schema.Types.ObjectId,
      ref: "Subscription",
      index: true,
    },

    feature: {
      type: String,
      enum: [
        "soma_ai",
        "consultation_analysis",
        "consultation_translation",
        "medical_report_analysis",
      ],
      required: true,
      index: true,
    },

    ai_model: {
      type: String,
      required: true,
      trim: true,
    },

    tokens_prompt: {
      type: Number,
      required: true,
      min: 0,
    },

    tokens_completion: {
      type: Number,
      required: true,
      min: 0,
    },

    tokens_total: {
      type: Number,
      required: true,
      min: 0,
    },

    response_time_sec: {
      type: Number,
      min: 0,
    },

    reference_id: {
      type: Schema.Types.ObjectId,
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

AiUsageSchema.index({ user_id: 1, created_at: -1 });
AiUsageSchema.index({ subscription_id: 1, created_at: -1 });

export default models.AiUsage ||
  model<IAiUsageDocument>("AiUsage", AiUsageSchema);
