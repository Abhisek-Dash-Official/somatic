import mongoose, { Schema, Document, model, models } from "mongoose";
import { ILearn } from "@/types/models";

export interface ILearnDocument extends ILearn, Document {
  _id: any;
}

const AuthorSchema = new Schema(
  {
    name: { type: String, required: true },
    credentials: { type: String },
    avatar: { type: String },
  },
  { _id: false },
);

const LearnSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    desc: { type: String, required: true },
    content: { type: String, required: true },
    cover_image: { type: String, required: true },
    category: { type: String, required: true },
    tags: [{ type: String, trim: true }],
    expert_summary: { type: String },
    read_time: { type: Number, required: true },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
    author: { type: AuthorSchema, required: true },
    is_medically_reviewed: { type: Boolean, default: false },
    reviewed_by: { type: String },
    views: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } },
);

export default models.Learn || model("Learn", LearnSchema);
