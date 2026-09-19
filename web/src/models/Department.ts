import mongoose, { Schema, Document, model, models } from "mongoose";
import { IDepartment } from "@/types/models";

export interface IDepartmentDocument extends IDepartment, Document {
  _id: any;
}

const DepartmentSchema = new Schema<IDepartmentDocument>(
  {
    name: { type: String, required: true, unique: true },
    desc: { type: String },
    head_doctor_id: { type: Schema.Types.ObjectId, ref: "User" },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: { createdAt: "created_at", updatedAt: false } },
);

export default models.Department ||
  model<IDepartmentDocument>("Department", DepartmentSchema);
