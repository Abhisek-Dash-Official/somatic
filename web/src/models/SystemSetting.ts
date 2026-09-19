import mongoose, { Schema, Document, model, models } from "mongoose";
import { ISystemSetting } from "@/types/models";

export interface ISystemSettingDocument extends ISystemSetting, Document {
  _id: any;
}

const AiModelConfigSchema = new Schema(
  {
    current_model: { type: String, required: true },
    daily_token_threshold_alert: { type: Number, default: 1000000 },
    system_prompt: { type: String },
  },
  { _id: false },
);

const SystemSettingSchema = new Schema<ISystemSettingDocument>(
  {
    maintenance_mode: { type: Boolean, default: false },
    allow_new_signups: { type: Boolean, default: true },
    ai_model_config: { type: AiModelConfigSchema, required: true },
    updated_by: { type: Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: { createdAt: false, updatedAt: "updated_at" },
  },
);

export default models.SystemSetting ||
  model<ISystemSettingDocument>("SystemSetting", SystemSettingSchema);
