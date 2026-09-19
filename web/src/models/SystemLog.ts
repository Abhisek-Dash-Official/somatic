import mongoose, { Schema, Document, model, models } from "mongoose";
import { ISystemLog } from "@/types/models";

export interface ISystemLogDocument extends ISystemLog, Document {
  _id: any;
}

const SystemLogSchema = new Schema<ISystemLogDocument>(
  {
    timestamp: { type: Date, default: Date.now },
    actor_id: { type: Schema.Types.ObjectId, ref: "User" },
    actor_role: {
      type: String,
      enum: ["admin", "doctor", "assistant_doctor", "patient", "dispatcher"],
    },
    action_type: { type: String },
    target_id: { type: Schema.Types.ObjectId },
    details: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: "created_at", updatedAt: false } },
);

export default models.SystemLog ||
  model<ISystemLogDocument>("SystemLog", SystemLogSchema);
