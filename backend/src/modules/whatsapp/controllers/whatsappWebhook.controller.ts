import crypto from "crypto";
import type { Request, Response } from "express";
import { getWhatsAppConfig } from "../config.js";
import type {
  NormalizedConversationMessage,
  WhatsAppTestRequestBody,
  WhatsAppWebhookPayload,
  WhatsAppWebhookVerificationQuery,
} from "../types.js";
import { extractNormalizedMessages } from "../utils/normalizeWebhook.js";
import { verifyWhatsAppSignature } from "../utils/signature.js";
import { whatsappLog } from "../utils/logger.js";
import {
  handleInboundWhatsAppMessage,
  handleTestWhatsAppMessage,
} from "../services/whatsappWebhook.service.js";
import { sendWhatsAppTextMessage } from "../services/whatsappSender.service.js";

const verifyWebhookToken = (query: WhatsAppWebhookVerificationQuery): boolean => {
  const config = getWhatsAppConfig();
  return query["hub.mode"] === "subscribe" && query["hub.verify_token"] === config.verifyToken;
};

const createTraceId = (): string => {
  return crypto.randomUUID();
};

const createTestNormalizedMessage = (
  phone: string,
  message: string,
  traceId: string
): NormalizedConversationMessage => {
  return {
    id: `test-${traceId}`,
    phoneNumber: phone.trim(),
    timestamp: Date.now(),
    messageType: "text",
    text: message.trim(),
    rawPayload: {
      source: "local-test",
      traceId,
    },
  };
};

export const verifyWhatsAppWebhook = (req: Request, res: Response): void => {
  const query = req.query as WhatsAppWebhookVerificationQuery;
  const challenge = query["hub.challenge"];

  if (!verifyWebhookToken(query)) {
    res.status(403).send("Forbidden");
    return;
  }

  res.status(200).send(challenge || "");
};

export const receiveWhatsAppWebhook = async (req: Request, res: Response): Promise<void> => {
  const traceId = createTraceId();
  req.traceId = traceId;
  whatsappLog.info(traceId, "webhook received", { path: "/api/v1/whatsapp/webhook" });

  const signature = req.header("x-hub-signature-256") || undefined;
  if (!verifyWhatsAppSignature(signature, req.rawBody)) {
    whatsappLog.warn(traceId, "invalid WhatsApp signature");
    res.status(403).json({ success: false, message: "Invalid signature", traceId });
    return;
  }

  const payload = req.body as WhatsAppWebhookPayload;
  const normalizedMessages = extractNormalizedMessages(payload);
  whatsappLog.debug(traceId, "normalized message batch", {
    count: normalizedMessages.length,
  });

  if (normalizedMessages.length === 0) {
    whatsappLog.info(traceId, "ignored WhatsApp webhook event");
    res.status(200).json({ success: true, message: "Ignored", traceId });
    return;
  }

  try {
    for (const message of normalizedMessages) {
      const result = await handleInboundWhatsAppMessage(message, traceId);
      if (result.duplicate) {
        continue;
      }
    }

    res.status(200).json({
      success: true,
      processed: normalizedMessages.length,
      traceId,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "WhatsApp webhook failed";
    res.status(500).json({ success: false, message, traceId });
  }
};

export const testWhatsAppPipeline = async (req: Request, res: Response): Promise<void> => {
  if (process.env.NODE_ENV === "production") {
    res.status(404).json({ success: false, message: "Not found" });
    return;
  }

  const traceId = createTraceId();
  req.traceId = traceId;

  const body = req.body as WhatsAppTestRequestBody;
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (!phone || !message) {
    res.status(400).json({
      success: false,
      message: "phone and message are required",
      traceId,
    });
    return;
  }

  const normalized = createTestNormalizedMessage(phone, message, traceId);
  whatsappLog.info(traceId, "running WhatsApp test pipeline");

  try {
    const result = await handleTestWhatsAppMessage(normalized, traceId);
    if (result.duplicate) {
      res.status(200).json({
        success: true,
        normalized,
        aiResponse: "",
        conversationId: result.conversationId || normalized.id,
        traceId,
        duplicate: true,
      });
      return;
    }

    res.status(200).json({
      success: true,
      normalized,
      aiResponse: result.aiResponse || "",
      conversationId: result.conversationId || normalized.id,
      traceId,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "WhatsApp test pipeline failed";
    res.status(500).json({ success: false, message, traceId });
  }
};

export const whatsappHealth = (_req: Request, res: Response): void => {
  const config = getWhatsAppConfig();
  res.status(200).json({
    webhook: true,
    groq: Boolean(process.env.GROQ_API_KEY?.trim() || process.env.GROK_API_KEY?.trim()),
    meta: Boolean(config.accessToken && config.phoneNumberId && config.verifyToken && config.appSecret),
  });
};

export const sendWhatsAppTestMessage = async (req: Request, res: Response): Promise<void> => {
  if (process.env.NODE_ENV === "production") {
    res.status(404).json({ success: false, message: "Not found" });
    return;
  }

  const traceId = createTraceId();
  req.traceId = traceId;

  const body = req.body as WhatsAppTestRequestBody;
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (!phone || !message) {
    res.status(400).json({
      success: false,
      message: "phone and message are required",
      traceId,
    });
    return;
  }

  const config = getWhatsAppConfig();
  const metaRequest = {
    method: "POST",
    url: `${config.graphApiBaseUrl}/${config.apiVersion}/${config.phoneNumberId}/messages`,
    body: {
      messaging_product: "whatsapp",
      to: phone,
      type: "text",
      text: {
        preview_url: false,
        body: message,
      },
    },
  };

  whatsappLog.info(traceId, "development send-test received", {
    phone,
  });
  whatsappLog.debug(traceId, "Meta request", metaRequest);

  try {
    const metaResponse = await sendWhatsAppTextMessage({
      recipient: phone,
      text: message,
      traceId,
    });

    whatsappLog.debug(traceId, "Meta response", metaResponse as Record<string, unknown>);

    res.status(200).json({
      success: true,
      metaRequest,
      metaResponse,
      traceId,
    });
  } catch (error) {
    const messageText = error instanceof Error ? error.message : "WhatsApp send-test failed";
    res.status(502).json({
      success: false,
      message: messageText,
      metaRequest,
      traceId,
    });
  }
};
