import mongoose, { Schema, model, models } from "mongoose";

const UserSchema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password_hash: { type: String, required: true },
    avatar_id: { type: String },
    contact_no: { type: String, match: /^[0-9]{10}$/ },
    address: { type: String },
    role: {
      type: String,
      enum: ["admin", "doctor", "patient"],
      required: true,
    },
    doctor_info: {
      reg_no: { type: String },
      qualification: { type: String },
      experience: { type: Number },
      department_id: { type: Schema.Types.ObjectId, ref: "Department" },
      is_accepting_cases: { type: Boolean, default: true },
    },
    patient_info: {
      blood_grp: { type: String },
      known_allergies: [{ type: String }],
      chronic_diseases: [{ type: String }],
    },
    is_delete: { type: Boolean, default: false },
    is_ban: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: "created_at", updatedAt: false } },
);

export default models.User || model("User", UserSchema);
