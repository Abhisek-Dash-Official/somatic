import mongoose, { Schema, Document, model, models } from "mongoose";
import { IHospital } from "@/types/models";

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

    contact: {
      phone: {
        type: String,
        required: true,
      },

      emergency_phone: {
        type: String,
      },

      email: {
        type: String,
        lowercase: true,
        trim: true,
      },
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
        default: "Point",
      },

      coordinates: {
        type: [Number],
        required: true,
      },
    },

    has_ambulance: {
      type: Boolean,
      default: false,
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

HospitalSchema.index({ location: "2dsphere" });

export default models.Hospital || model<IHospital>("Hospital", HospitalSchema);
