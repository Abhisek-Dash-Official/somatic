import mongoose, { Schema, Document, model, models } from "mongoose";
import { ITransaction } from "@/types/models";

export interface ITransactionDocument extends ITransaction, Document {
  _id: any;
}

const TransactionSchema = new Schema<ITransactionDocument>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    transaction_type: {
      type: String,
      enum: ["insurance_premium", "shop_order", "lab_booking", "subscription"],
      required: true,
      index: true,
    },

    reference_id: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    amount: {
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

    status: {
      type: String,
      enum: [
        "created",
        "pending",
        "paid",
        "failed",
        "refunded",
        "partially_refunded",
        "cancelled",
      ],
      default: "created",
      index: true,
    },

    payment_gateway: {
      type: String,
      enum: ["razorpay", "cash"],
      default: "razorpay",
    },

    gateway_order_id: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },

    gateway_payment_id: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },

    gateway_signature: {
      type: String,
      trim: true,
    },

    paid_at: {
      type: Date,
    },

    failed_at: {
      type: Date,
    },

    failure_reason: {
      type: String,
      trim: true,
    },

    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
);

export default models.Transaction ||
  model<ITransactionDocument>("Transaction", TransactionSchema);
