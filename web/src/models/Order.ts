import mongoose, { Schema, Document, model, models } from "mongoose";
import { IOrder } from "@/types/models";

export interface IOrderDocument extends IOrder, Document {
  _id: any;
}

const OrderItemSchema = new Schema(
  {
    item_type: {
      type: String,
      enum: ["medicine", "blood"],
      required: true,
    },
    item_id: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: "items.item_type", // Dynamic reference (Medicine or BloodBank)
    },
    blood_group: { type: String }, // Used only for blood orders
    quantity: { type: Number, required: true, min: 1 },
    unit_price: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const OrderSchema = new Schema<IOrderDocument>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [OrderItemSchema],
    total_amount: { type: Number, required: true, min: 0 },

    payment_method: {
      type: String,
      enum: ["COD", "ONLINE"],
      required: true,
    },
    payment_status: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
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
    },

    shipping_address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
    },
  },
  {
    timestamps: { createdAt: "placed_at", updatedAt: "updated_at" },
  },
);

export default models.Order || model<IOrderDocument>("Order", OrderSchema);
