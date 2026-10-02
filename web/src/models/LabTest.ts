import mongoose, { Schema, Document, model, models } from "mongoose";
import { ILabTest } from "@/types/models";

export interface ILabTestDocument extends ILabTest, Document {
  _id: any;
}

const LabTestSchema = new Schema<ILabTestDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    code: {
      type: String,
      unique: true,
      sparse: true,
      uppercase: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    type: {
      type: String,
      enum: ["test", "package"],
      default: "test",
      index: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    home_collection: {
      type: Boolean,
      default: true,
    },

    sample_type: {
      type: String,
      trim: true,
    },

    preparation: {
      type: String,
      trim: true,
    },

    report_time: {
      type: String,
      trim: true,
    },

    parameters: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },

        unit: {
          type: String,
          trim: true,
        },

        reference_range: {
          type: String,
          trim: true,
        },
      },
    ],

    is_active: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
);

export default models.LabTest ||
  model<ILabTestDocument>("LabTest", LabTestSchema);
