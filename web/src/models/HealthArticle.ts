import mongoose, { Schema, Document, model, models } from "mongoose";
import { IHealthArticle } from "@/types/models";

export interface IHealthArticleDocument extends Document, IHealthArticle {
  _id: any;
}

const HealthArticleSchema = new Schema<IHealthArticleDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
      lowercase: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      enum: ["medicines", "diseases", "health", "everyday_healthcare"],
      required: true,
      index: true,
    },

    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],

    content: {
      type: String,
      required: true,
    },

    cover_image: {
      type: String,
      trim: true,
    },

    author: {
      type: String,
      default: "SOMATIC Health Team",
      trim: true,
    },

    read_time: {
      type: Number,
      min: 1,
    },

    is_featured: {
      type: Boolean,
      default: false,
      index: true,
    },

    is_published: {
      type: Boolean,
      default: false,
      index: true,
    },

    published_at: {
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

export default models.HealthArticle ||
  model<IHealthArticleDocument>("HealthArticle", HealthArticleSchema);
