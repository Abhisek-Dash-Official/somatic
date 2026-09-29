import mongoose, { Schema, Document, model, models } from "mongoose";
import { IOrder } from "@/types/models";

export interface IOrderDocument extends IOrder, Document {
  _id: any;
}

const OrderItemSchema = new Schema(
  {
    item_type: {
      type: String,
      enum: ["Medicine", "BloodBank"],
      required: true,
    },
    item_id: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: "items.item_type",
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    manufacturer: {
      type: String,
      trim: true,
    },
    blood_group: {
      type: String,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    unit_price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false },
);

const OrderSchema = new Schema<IOrderDocument>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    items: {
      type: [OrderItemSchema],
      required: true,
      validate: {
        validator: (items: unknown[]) => items.length > 0,
        message: "Order must contain at least one item",
      },
    },

    total_amount: {
      type: Number,
      required: true,
      min: 0,
    },

    payment_method: {
      type: String,
      enum: ["COD", "ONLINE"],
      required: true,
    },

    payment_status: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
      index: true,
    },

    order_status: {
      type: String,
      enum: [
        "placed",
        "confirmed",
        "shipped",
        "out_for_delivery",
        "delivered",
        "cancelled",
      ],
      default: "placed",
      index: true,
    },

    shipping_address: {
      street: {
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
    },
  },
  {
    timestamps: {
      createdAt: "placed_at",
      updatedAt: "updated_at",
    },
  },
);

export default models.Order || model<IOrderDocument>("Order", OrderSchema);
