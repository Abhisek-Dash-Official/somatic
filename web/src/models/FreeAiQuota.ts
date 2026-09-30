import { Schema, Document, model, models } from "mongoose";
import { IFreeAiQuota } from "@/types/models";

export interface IFreeAiQuotaDocument extends IFreeAiQuota, Document {
  user_id: Schema.Types.ObjectId;
}

const FreeAiQuotaSchema = new Schema<IFreeAiQuotaDocument>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    feature: {
      type: String,
      enum: ["consultation_analysis"],
      required: true,
      index: true,
    },
    token_limit: {
      type: Number,
      default: 10000,
      min: 0,
    },
    tokens_used: {
      type: Number,
      default: 0,
      min: 0,
    },
    period_start: {
      type: Date,
      required: true,
    },
    period_end: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
);

FreeAiQuotaSchema.index({ user_id: 1, feature: 1 }, { unique: true });

export default models.FreeAiQuota ||
  model<IFreeAiQuotaDocument>("FreeAiQuota", FreeAiQuotaSchema);
