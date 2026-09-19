import mongoose, { Schema, Document, model, models } from "mongoose";
import { ICart } from "@/types/models";

export interface ICartDocument extends ICart, Document {
  _id: any;
}

const CartItemSchema = new Schema(
  {
    item_type: {
      type: String,
      enum: ["medicine", "blood"],
      required: true,
    },
    item_id: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: "items.item_type",
    },
    blood_group: { type: String },
    quantity: { type: Number, required: true, min: 1, default: 1 },
  },
  { _id: false },
);

const CartSchema = new Schema<ICartDocument>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: [CartItemSchema],
    total_amount: { type: Number, required: true, min: 0, default: 0 },
  },
  { timestamps: { createdAt: false, updatedAt: "updated_at" } },
);

export default models.Cart || model<ICartDocument>("Cart", CartSchema);
