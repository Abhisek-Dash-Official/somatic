import mongoose, { Schema, Document, model, models } from "mongoose";
import { INotification } from "@/types/models";

export interface INotificationDocument extends INotification, Document {
  _id: any;
}

const NotificationSchema = new Schema<INotificationDocument>(
  {
    sender_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    recipient_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    priority: {
      type: String,
      enum: ["low", "normal", "high", "urgent"],
      default: "normal",
      index: true,
    },
    is_read: {
      type: Boolean,
      default: false,
      index: true,
    },
    read_at: {
      type: Date,
    },
    action_url: {
      type: String,
      trim: true,
    },
    reference_id: {
      type: Schema.Types.ObjectId,
      index: true,
    },
    reference_type: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
);

NotificationSchema.index({ recipient_id: 1, is_read: 1, created_at: -1 });
NotificationSchema.index({ recipient_id: 1, priority: 1, created_at: -1 });
NotificationSchema.index({ reference_type: 1, reference_id: 1 });

export default models.Notification ||
  model<INotificationDocument>("Notification", NotificationSchema);
