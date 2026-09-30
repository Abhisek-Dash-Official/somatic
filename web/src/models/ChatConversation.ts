import mongoose, { Schema, Document, model, models } from "mongoose";

export interface IChatConversation extends Document {
  user_id: mongoose.Types.ObjectId;
  title: string;
  summary: string;
  is_archived: boolean;
  last_message_at: Date;
  created_at: Date;
  updated_at: Date;
}

const ChatConversationSchema = new Schema<IChatConversation>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },

    summary: {
      type: String,
      default: "",
      trim: true,
    },

    is_archived: {
      type: Boolean,
      default: false,
      index: true,
    },

    last_message_at: {
      type: Date,
      default: Date.now,
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

ChatConversationSchema.index({
  user_id: 1,
  last_message_at: -1,
});

export default models.ChatConversation ||
  model<IChatConversation>("ChatConversation", ChatConversationSchema);
