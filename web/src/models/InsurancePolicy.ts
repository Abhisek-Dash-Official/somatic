import mongoose, { Schema, Document, model, models } from "mongoose";
import { IInsurancePolicy } from "@/types/models";

export interface IInsurancePolicyDocument extends IInsurancePolicy, Document {
  _id: any;
}

const InsurancePolicySchema = new Schema<IInsurancePolicyDocument>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    plan_id: {
      type: Schema.Types.ObjectId,
      ref: "InsurancePlan",
      required: true,
      index: true,
    },

    policy_number: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    insured_members: [
      {
        name: { type: String, required: true, trim: true },
        relationship: { type: String, required: true, trim: true },
        date_of_birth: { type: Date },
      },
    ],

    start_date: {
      type: Date,
      required: true,
    },

    expiry_date: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "approved",
        "payment_pending",
        "active",
        "rejected",
        "expired",
        "cancelled",
      ],
      default: "pending",
    },

    documents: [
      {
        type: {
          type: String,
          enum: ["policy", "id_proof", "medical", "other"],
        },
        file_url: {
          type: String,
          required: true,
        },
        uploaded_at: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    approved_by: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    approved_at: {
      type: Date,
    },

    rejected_by: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    rejected_at: {
      type: Date,
    },

    rejection_reason: {
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

export default models.InsurancePolicy ||
  model<IInsurancePolicyDocument>("InsurancePolicy", InsurancePolicySchema);
