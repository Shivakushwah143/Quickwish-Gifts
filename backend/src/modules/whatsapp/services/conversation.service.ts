import { WhatsAppConversationMessage } from "../models/whatsappConversationMessage.model.js";
import type {
  ConversationRole,
  ConversationStatus,
  NormalizedConversationMessage,
} from "../types.js";
import type { AssistantMessage } from "../../../services/assistant.service.js";

const toAssistantMessageRole = (role: ConversationRole): "user" | "assistant" => {
  return role === "customer" ? "user" : "assistant";
};

export const findConversationMessageById = async (messageId: string) => {
  return WhatsAppConversationMessage.findOne({ messageId }).lean();
};

export const createIncomingConversationMessage = async (
  message: NormalizedConversationMessage,
  traceId: string,
  status: ConversationStatus = "processing"
) => {
  try {
    return await WhatsAppConversationMessage.create({
      phoneNumber: message.phoneNumber,
      messageId: message.id,
      direction: "inbound",
      role: "customer",
      messageType: message.messageType,
      text: message.text,
      rawEvent: message.rawPayload,
      status,
      traceId,
      timestamp: new Date(message.timestamp),
    });
  } catch (error) {
    const mongoError = error as { code?: number };
    if (mongoError?.code === 11000) {
      return null;
    }

    throw error;
  }
};

export const saveOutgoingConversationMessage = async ({
  phoneNumber,
  replyToMessageId,
  text,
  rawEvent,
  timestamp,
  messageId,
  traceId,
  status = "sent",
}: {
  phoneNumber: string;
  replyToMessageId: string;
  text: string;
  rawEvent: Record<string, unknown>;
  timestamp: number;
  messageId?: string;
  traceId: string;
  status?: ConversationStatus;
}) => {
  const resolvedMessageId = messageId || `${replyToMessageId}-reply-${Date.now()}`;

  const update: Record<string, unknown> = {
    phoneNumber,
    messageId: resolvedMessageId,
    direction: "outbound",
    role: "assistant",
    messageType: "text",
    text,
    rawEvent,
    status,
    traceId,
    replyToMessageId,
    timestamp: new Date(timestamp),
  };

  if (status === "sent") {
    update.processedAt = new Date();
  }

  return WhatsAppConversationMessage.findOneAndUpdate(
    { messageId: resolvedMessageId },
    { $set: update },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    }
  );
};

export const updateConversationStatus = async (
  messageId: string,
  status: ConversationStatus,
  traceId: string,
  errorMessage?: string
) => {
  const update: Record<string, unknown> = {
    status,
    errorMessage: errorMessage || null,
    traceId,
  };

  if (status === "sent") {
    update.processedAt = new Date();
  }

  return WhatsAppConversationMessage.findOneAndUpdate(
    { messageId },
    {
      $set: update,
    },
    { new: true }
  );
};

export const getConversationHistory = async (
  phoneNumber: string,
  limit = 10,
  excludeMessageId?: string
): Promise<AssistantMessage[]> => {
  const query: Record<string, unknown> = {
    phoneNumber,
    status: { $in: ["received", "sent", "processing"] },
  };

  if (excludeMessageId) {
    query.messageId = { $ne: excludeMessageId };
  }

  const messages = await WhatsAppConversationMessage.find(query)
    .sort({ timestamp: 1 })
    .limit(limit)
    .lean();

  return messages.map((message) => ({
    role: toAssistantMessageRole(message.role),
    content: message.text,
  }));
};
