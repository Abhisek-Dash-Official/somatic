import mongoose, { Schema, Document, model, models } from "mongoose";
import { ISubscription } from "@/types/models";

export interface ISubscriptionDocument extends ISubscription, Document {
  _id: any;
}

const SubscriptionSchema = new Schema<ISubscriptionDocument>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    plan_id: {
      type: Schema.Types.ObjectId,
      ref: "SubscriptionPlan",
      required: true,
      index: true,
    },

    plan_name: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["pending", "active", "expired", "cancelled"],
      default: "pending",
      index: true,
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

    token_limit: {
      type: Number,
      required: true,
      min: 0,
    },

    tokens_used: {
      type: Number,
      default: 0,
      min: 0,
    },

    start_date: {
      type: Date,
    },

    end_date: {
      type: Date,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
);

SubscriptionSchema.index({ user_id: 1, status: 1 });

export default models.Subscription ||
  model<ISubscriptionDocument>("Subscription", SubscriptionSchema);
