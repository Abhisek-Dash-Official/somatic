import mongoose, { Schema, Document, model, models } from "mongoose";

export interface IHospital extends Document {
  name: string;
  qr_identifier: string;
  paperwork_endpoint: string;

  auth_config?: {
    type?: "none" | "api_key" | "bearer" | "basic";
    api_key?: string;
    api_key_header?: string;
    token?: string;
    username?: string;
    password?: string;
  };

  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

const HospitalSchema = new Schema<IHospital>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    qr_identifier: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },

    paperwork_endpoint: {
      type: String,
      required: true,
      trim: true,
    },

    auth_config: {
      type: {
        type: String,
        enum: ["none", "api_key", "bearer", "basic"],
        default: "none",
      },

      api_key: {
        type: String,
      },

      api_key_header: {
        type: String,
      },

      token: {
        type: String,
      },

      username: {
        type: String,
      },

      password: {
        type: String,
      },
    },

    is_active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
);

export default models.Hospital || model<IHospital>("Hospital", HospitalSchema);
