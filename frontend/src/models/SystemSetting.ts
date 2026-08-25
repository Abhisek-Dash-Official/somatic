import mongoose, { Schema, model, models } from "mongoose";

const SystemSettingSchema = new Schema(
  {
    maintenance_mode: { type: Boolean, default: false },
    allow_new_signups: { type: Boolean, default: true },
    ai_model_config: { type: Object },
    updated_by: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: { createdAt: false, updatedAt: "updated_at" } },
);

export default models.SystemSetting ||
  model("SystemSetting", SystemSettingSchema);
