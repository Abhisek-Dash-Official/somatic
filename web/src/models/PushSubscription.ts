import mongoose, { Schema, Document, model, models } from "mongoose";
import { IPushSubscription } from "@/types/models";

export interface IPushSubscriptionDocument extends IPushSubscription, Document {
  _id: any;
}

const PushSubscriptionSchema = new Schema<IPushSubscriptionDocument>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    endpoint: { type: String, required: true, unique: true, trim: true },
    p256dh: { type: String, required: true, trim: true },
    auth: { type: String, required: true, trim: true },
    user_agent: { type: String, trim: true },
    device_name: { type: String, trim: true },
    is_active: { type: Boolean, default: true, index: true },
    last_used_at: { type: Date },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } },
);

PushSubscriptionSchema.index({ user_id: 1, is_active: 1 });

export default models.PushSubscription ||
  model<IPushSubscriptionDocument>("PushSubscription", PushSubscriptionSchema);
