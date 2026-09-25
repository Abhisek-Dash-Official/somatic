import mongoose, { Schema, Document, model, models } from "mongoose";
import { IInsuranceClaim } from "@/types/models";

export interface IInsuranceClaimDocument extends IInsuranceClaim, Document {
  _id: any;
}

const InsuranceClaimSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    policy_id: {
      type: Schema.Types.ObjectId,
      ref: "InsurancePolicy",
      required: true,
      index: true,
    },

    hospital_id: {
      type: Schema.Types.ObjectId,
      ref: "Hospital",
    },

    claim_number: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },

    claim_type: {
      type: String,
      enum: ["cashless", "reimbursement"],
      required: true,
    },

    incident_type: {
      type: String,
      enum: ["accident", "illness", "emergency", "other"],
    },

    incident_date: {
      type: Date,
    },

    treatment_date: {
      type: Date,
    },

    admission_date: {
      type: Date,
    },

    discharge_date: {
      type: Date,
    },

    estimated_amount: {
      type: Number,
      min: 0,
    },

    claimed_amount: {
      type: Number,
      min: 0,
    },

    approved_amount: {
      type: Number,
      min: 0,
    },

    status: {
      type: String,
      enum: [
        "draft",
        "submitted",
        "under_review",
        "documents_required",
        "approved",
        "partially_approved",
        "rejected",
        "settled",
      ],
      default: "draft",
    },

    rejection_reason: {
      type: String,
      trim: true,
    },

    documents: [
      {
        type: {
          type: String,
          enum: [
            "claim_form",
            "hospital_bill",
            "discharge_summary",
            "prescription",
            "lab_report",
            "medical_record",
            "id_proof",
            "other",
          ],
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
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
);

export default models.InsuranceClaim ||
  model<IInsuranceClaimDocument>("InsuranceClaim", InsuranceClaimSchema);
