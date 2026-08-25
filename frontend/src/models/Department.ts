import mongoose, { Schema, model, models } from "mongoose";

const DepartmentSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    desc: { type: String },
    head_doctor_id: { type: Schema.Types.ObjectId, ref: "User" },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: { createdAt: "created_at", updatedAt: false } },
);

export default models.Department || model("Department", DepartmentSchema);
