import { generateAssistantReply } from "../../../services/assistant.service.js";
import {
  createIncomingConversationMessage,
  getConversationHistory,
  saveOutgoingConversationMessage,
  updateConversationStatus,
} from "./conversation.service.js";
import type { NormalizedConversationMessage } from "../types.js";
import { sendWhatsAppTextMessage } from "./whatsappSender.service.js";
import { whatsappLog } from "../utils/logger.js";

type WhatsAppPipelineMode = "webhook" | "test";

export interface WhatsAppPipelineResult {
  duplicate: boolean;
  processed: boolean;
  conversationId?: string;
  aiResponse?: string;
  normalized?: NormalizedConversationMessage;
}

const buildSystemPrompt = (): string => {
  return [
    "You are QuickWish's WhatsApp assistant.",
    "Respond warmly, clearly, and concisely.",
    "If the customer says hello, greet them and ask how you can help.",
    "Do not mention internal systems, deployment details, or technical implementation.",
    "Do not discuss commerce workflows unless the customer asks a simple product question.",
  ].join(" ");
};

const processMessage = async (
  message: NormalizedConversationMessage,
  traceId: string,
  mode: WhatsAppPipelineMode
): Promise<WhatsAppPipelineResult> => {
  whatsappLog.info(traceId, "webhook received", { mode });
  whatsappLog.debug(traceId, "normalized message", {
    messageId: message.id,
    phoneNumber: message.phoneNumber,
    messageType: message.messageType,
    text: message.text,
  });

  const storedMessage = await createIncomingConversationMessage(message, traceId, "processing");
  if (!storedMessage) {
    whatsappLog.info(traceId, "duplicate WhatsApp message ignored", { mode });
    return {
      processed: true,
      duplicate: true,
      conversationId: message.id,
      normalized: message,
    };
  }

  try {
    const history = await getConversationHistory(message.phoneNumber, 12, message.id);
    whatsappLog.debug(traceId, "AI request", {
      phoneNumber: message.phoneNumber,
      historyCount: history.length,
      mode,
    });
    const aiResponse = await generateAssistantReply({
      systemPrompt: buildSystemPrompt(),
      messages: [
        ...history,
        {
          role: "user",
          content: message.text,
        },
      ],
      temperature: 0.4,
    });
    whatsappLog.debug(traceId, "AI response", {
      preview: aiResponse.slice(0, 120),
      length: aiResponse.length,
    });

    if (mode === "webhook") {
      whatsappLog.debug(traceId, "Meta send request", {
        recipient: message.phoneNumber,
        length: aiResponse.length,
      });
      const sendResponse = await sendWhatsAppTextMessage({
        recipient: message.phoneNumber,
        text: aiResponse,
        traceId,
      });
      whatsappLog.debug(traceId, "Meta send response", {
        messageId: sendResponse.messages?.[0]?.id,
        contacts: sendResponse.contacts?.length || 0,
      });
      const sentMessageId = sendResponse.messages?.[0]?.id;

      await saveOutgoingConversationMessage({
        phoneNumber: message.phoneNumber,
        replyToMessageId: message.id,
        text: aiResponse,
        rawEvent: {
          source: "whatsapp-cloud-api",
          sendResponse,
        },
        timestamp: Date.now(),
        traceId,
        status: "sent",
        ...(sentMessageId ? { messageId: sentMessageId } : {}),
      });

      await updateConversationStatus(message.id, "sent", traceId);
      whatsappLog.info(traceId, "WhatsApp reply sent", { mode });
      return {
        processed: true,
        duplicate: false,
        conversationId: String(storedMessage._id),
        aiResponse,
        normalized: message,
      };
    }

    await saveOutgoingConversationMessage({
      phoneNumber: message.phoneNumber,
      replyToMessageId: message.id,
      text: aiResponse,
      rawEvent: {
        source: "whatsapp-test-mode",
      },
      timestamp: Date.now(),
      traceId,
      status: "sent",
    });

    await updateConversationStatus(message.id, "sent", traceId);
    whatsappLog.info(traceId, "WhatsApp test pipeline completed", { mode });
    return {
      processed: true,
      duplicate: false,
      conversationId: String(storedMessage._id),
      aiResponse,
      normalized: message,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "WhatsApp processing failed";
    await updateConversationStatus(message.id, "failed", traceId, errorMessage);
    whatsappLog.error(traceId, "WhatsApp pipeline failed", { mode, error: errorMessage });
    throw error;
  }
};

export const handleInboundWhatsAppMessage = async (
  message: NormalizedConversationMessage,
  traceId: string
): Promise<WhatsAppPipelineResult> => {
  return processMessage(message, traceId, "webhook");
};

export const handleTestWhatsAppMessage = async (
  message: NormalizedConversationMessage,
  traceId: string
): Promise<WhatsAppPipelineResult> => {
  return processMessage(message, traceId, "test");
};
