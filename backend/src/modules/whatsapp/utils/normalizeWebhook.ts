import type {
  NormalizedConversationMessage,
  WhatsAppWebhookPayload,
  WhatsAppWebhookValue,
} from "../types.js";

type WhatsAppWebhookMessage = NonNullable<WhatsAppWebhookValue["messages"]>[number];

const parseTimestamp = (value: string | undefined): number => {
  if (!value) {
    return Date.now();
  }

  const timestamp = Number(value);
  if (Number.isFinite(timestamp) && timestamp > 0) {
    return timestamp * 1000;
  }

  return Date.now();
};

const getPhoneNumber = (message: WhatsAppWebhookMessage, value: WhatsAppWebhookValue): string => {
  return message.from?.trim() || value.contacts?.[0]?.wa_id?.trim() || "";
};

const getMessageText = (message: WhatsAppWebhookMessage): string => {
  if (message.type !== "text") {
    return "";
  }

  return message.text?.body?.trim() || "";
};

const getMessageType = (message: WhatsAppWebhookMessage) => {
  switch (message.type) {
    case "text":
    case "image":
    case "audio":
    case "video":
    case "document":
    case "interactive":
      return message.type;
    default:
      return "unsupported" as const;
  }
};

export const extractNormalizedMessages = (
  payload: WhatsAppWebhookPayload
): NormalizedConversationMessage[] => {
  if (payload.object !== "whatsapp_business_account") {
    return [];
  }

  const normalizedMessages: NormalizedConversationMessage[] = [];
  const entries = Array.isArray(payload.entry) ? payload.entry : [];

  for (const entry of entries) {
    const changes = Array.isArray(entry.changes) ? entry.changes : [];

    for (const change of changes) {
      const value = change.value;
      if (!value) {
        continue;
      }

      if (Array.isArray(value.statuses) && value.statuses.length > 0) {
        continue;
      }

      const messages = Array.isArray(value.messages) ? value.messages : [];

      for (const message of messages) {
        const messageType = getMessageType(message);
        if (messageType !== "text") {
          continue;
        }

        const text = getMessageText(message);
        const phoneNumber = getPhoneNumber(message, value);
        const id = message.id?.trim() || "";

        if (!id || !phoneNumber || !text) {
          continue;
        }

        normalizedMessages.push({
          id,
          phoneNumber,
          timestamp: parseTimestamp(message.timestamp),
          messageType,
          text,
          rawPayload: payload as unknown as Record<string, unknown>,
        });
      }
    }
  }

  return normalizedMessages;
};
