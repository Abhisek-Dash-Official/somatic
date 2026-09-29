import mongoose, { Schema, Document, model, models } from "mongoose";
import { ILabBooking } from "@/types/models";

export interface ILabBookingDocument extends Document, ILabBooking {
  _id: any;
}

const LabBookingSchema = new Schema<ILabBookingDocument>(
  {
    booking_number: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },

    patient_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    tests: [
      {
        test_id: {
          type: Schema.Types.ObjectId,
          ref: "LabTest",
          required: true,
        },

        name: {
          type: String,
          required: true,
          trim: true,
        },

        type: {
          type: String,
          enum: ["test", "package"],
          required: true,
        },

        price: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],

    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    collection_fee: {
      type: Number,
      default: 0,
      min: 0,
    },

    discount: {
      type: Number,
      default: 0,
      min: 0,
    },

    total_amount: {
      type: Number,
      required: true,
      min: 0,
    },

    payment_status: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded", "partially_refunded"],
      default: "pending",
      index: true,
    },

    collection_address: {
      address_line: {
        type: String,
        required: true,
        trim: true,
      },

      city: {
        type: String,
        required: true,
        trim: true,
      },

      state: {
        type: String,
        required: true,
        trim: true,
      },

      pincode: {
        type: String,
        required: true,
        trim: true,
      },

      landmark: {
        type: String,
        trim: true,
      },
    },

    scheduled_date: {
      type: Date,
      required: true,
      index: true,
    },

    scheduled_slot: {
      type: String,
      required: true,
      trim: true,
    },

    collector_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },

    status: {
      type: String,
      enum: [
        "booked",
        "collection_scheduled",
        "sample_collected",
        "processing",
        "report_ready",
        "completed",
        "cancelled",
      ],
      default: "booked",
      index: true,
    },

    sample_collected_at: Date,
    processing_started_at: Date,
    report_ready_at: Date,
    completed_at: Date,
    cancelled_at: Date,

    cancellation_reason: {
      type: String,
      trim: true,
    },

    results: [
      {
        test_id: {
          type: Schema.Types.ObjectId,
          ref: "LabTest",
          required: true,
        },

        test_name: {
          type: String,
          required: true,
          trim: true,
        },

        parameters: [
          {
            name: {
              type: String,
              required: true,
              trim: true,
            },

            value: {
              type: String,
              required: true,
              trim: true,
            },

            unit: {
              type: String,
              trim: true,
              required: true,
            },

            reference_range: {
              type: String,
              trim: true,
              required: true,
            },

            status: {
              type: String,
              enum: ["normal", "high", "low", "critical", "abnormal"],
              required: true,
            },
          },
        ],
      },
    ],

    results_entered_by: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    results_entered_at: {
      type: Date,
    },

    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
);

export default models.LabBooking ||
  model<ILabBookingDocument>("LabBooking", LabBookingSchema);
