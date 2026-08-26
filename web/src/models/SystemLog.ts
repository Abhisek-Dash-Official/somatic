import mongoose, { Schema, model, models } from "mongoose";

const SystemLogSchema = new Schema(
  {
    timestamp: { type: Date, default: Date.now },
    actor_id: { type: Schema.Types.ObjectId, ref: "User" },
    actor_role: { type: String, enum: ["admin", "doctor", "patient"] },
    action_type: { type: String },
    target_id: { type: Schema.Types.ObjectId },
    details: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: "created_at", updatedAt: false } },
);

export default models.SystemLog || model("SystemLog", SystemLogSchema);
