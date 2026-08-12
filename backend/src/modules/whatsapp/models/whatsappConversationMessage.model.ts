import mongoose from "mongoose";
import type {
  ConversationDirection,
  ConversationRole,
  ConversationStatus,
  WhatsAppMessageType,
} from "../types.js";

const whatsappConversationMessageSchema = new mongoose.Schema(
  {
    phoneNumber: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    messageId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    direction: {
      type: String,
      enum: ["inbound", "outbound"],
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ["customer", "assistant"],
      required: true,
      index: true,
    },
    messageType: {
      type: String,
      enum: ["text", "image", "audio", "video", "document", "interactive", "unsupported"],
      required: true,
      default: "text",
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    rawEvent: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    status: {
      type: String,
      enum: ["received", "processing", "sent", "failed", "ignored"],
      required: true,
      default: "received",
      index: true,
    },
    errorMessage: {
      type: String,
      default: null,
    },
    traceId: {
      type: String,
      default: null,
      index: true,
      trim: true,
    },
    replyToMessageId: {
      type: String,
      default: null,
      trim: true,
    },
    timestamp: {
      type: Date,
      required: true,
      index: true,
    },
    processedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export interface WhatsAppConversationMessageDoc {
  phoneNumber: string;
  messageId: string;
  direction: ConversationDirection;
  role: ConversationRole;
  messageType: WhatsAppMessageType;
  text: string;
  rawEvent: Record<string, unknown>;
  status: ConversationStatus;
  errorMessage?: string | null;
  traceId?: string | null;
  replyToMessageId?: string | null;
  timestamp: Date;
  processedAt?: Date | null;
}

export const WhatsAppConversationMessage =
  (mongoose.models.WhatsAppConversationMessage as mongoose.Model<WhatsAppConversationMessageDoc>) ||
  mongoose.model<WhatsAppConversationMessageDoc>(
    "WhatsAppConversationMessage",
    whatsappConversationMessageSchema
  );
