import mongoose, { Schema, Document, model, models } from "mongoose";
import { IFeedback } from "@/types/models";

export interface IFeedbackDocument extends IFeedback, Document {
  _id: any;
}

const FeedbackSchema = new Schema<IFeedbackDocument>(
  {
    reported_by_user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    ticket_type: { type: String },
    message: { type: String },
    status: { type: String, enum: ["Open", "Resolved"], default: "Open" },
  },
  { timestamps: { createdAt: "created_at", updatedAt: false } },
);

export default models.Feedback ||
  model<IFeedbackDocument>("Feedback", FeedbackSchema);
