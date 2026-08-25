import mongoose, { Schema, model, models } from "mongoose";

const FeedbackSchema = new Schema(
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

export default models.Feedback || model("Feedback", FeedbackSchema);
