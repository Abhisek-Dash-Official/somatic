import mongoose, { Schema, model, models } from "mongoose";

const AiModelConfigSchema = new Schema(
  {
    current_model: {
      type: String,
      required: true,
    },
    daily_token_threshold_alert: {
      type: Number,
      default: 1000000,
    },
    system_prompt: {
      type: String,
    },
  },
  { _id: false },
);

const SystemSettingSchema = new Schema(
  {
    maintenance_mode: {
      type: Boolean,
      default: false,
    },
    allow_new_signups: {
      type: Boolean,
      default: true,
    },
    ai_model_config: {
      type: AiModelConfigSchema,
      required: true,
    },
    updated_by: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: {
      createdAt: false,
      updatedAt: "updated_at",
    },
  },
);

export default models.SystemSetting ||
  model("SystemSetting", SystemSettingSchema);
