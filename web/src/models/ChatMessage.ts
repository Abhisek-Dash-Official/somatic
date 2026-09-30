import mongoose, { Schema, Document, model, models } from "mongoose";

export interface IChatMessage extends Document {
  conversation_id: mongoose.Types.ObjectId;
  user_id: mongoose.Types.ObjectId;
  role: "user" | "assistant";
  content: string;
  created_at: Date;
  updated_at: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>(
  {
    conversation_id: {
      type: Schema.Types.ObjectId,
      ref: "ChatConversation",
      required: true,
      index: true,
    },

    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },

    content: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
);

ChatMessageSchema.index({
  conversation_id: 1,
  created_at: 1,
});

export default models.ChatMessage ||
  model<IChatMessage>("ChatMessage", ChatMessageSchema);
