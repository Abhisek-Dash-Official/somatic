import mongoose, { Schema, model, models } from "mongoose";

const ConsultationSchema = new Schema(
  {
    patient_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    assigned_department_id: { type: Schema.Types.ObjectId, ref: "Department" },
    claimed_by_doctor_id: { type: Schema.Types.ObjectId, ref: "User" },
    status: {
      type: String,
      enum: ["pending_review", "in_review", "completed"],
    },
    patient_input: {
      age: { type: Number, min: 0, max: 120 },
      weight_kg: { type: Number },
      symptoms_raw_text: { type: String },
      attachments: [
        {
          file_url: { type: String },
          file_type: { type: String },
        },
      ],
      preferred_prescription_language: { type: String },
    },
    ai_draft: {
      is_emergency: { type: Boolean, default: false },
      chief_complaints: [{ type: String }],
      ayurvedic_hints: { type: String },
      ai_summary_and_advice: { type: String },
    },
    doctor_final_prescription: {
      medicines: [{ type: String }],
      instructions: { type: String },
      next_follow_up: { type: Date, default: null },
    },
    resolved_at: { type: Date },
  },
  { timestamps: { createdAt: "created_at", updatedAt: false } },
);

export default models.Consultation || model("Consultation", ConsultationSchema);
