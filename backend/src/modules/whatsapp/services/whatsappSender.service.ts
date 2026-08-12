import { getWhatsAppConfig } from "../config.js";
import type { WhatsAppSendResponse, WhatsAppSendTextInput } from "../types.js";
import { whatsappLog } from "../utils/logger.js";

const sleep = async (ms: number): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, ms));
};

const isRetryableStatus = (status: number): boolean => {
  return status === 429 || status === 500 || status === 502 || status === 503;
};

export const sendWhatsAppTextMessage = async (
  input: WhatsAppSendTextInput & { traceId: string }
): Promise<WhatsAppSendResponse> => {
  const config = getWhatsAppConfig();
  const endpoint = `${config.graphApiBaseUrl}/${config.apiVersion}/${config.phoneNumberId}/messages`;
  const payload = {
    messaging_product: "whatsapp",
    to: input.recipient,
    type: "text",
    text: {
      preview_url: false,
      body: input.text,
    },
  };

  let attempt = 0;
  const maxRetries = 3;
  let lastErrorText = "Unknown WhatsApp API error";

  while (attempt <= maxRetries) {
    attempt += 1;
    whatsappLog.info(input.traceId, "Meta send request", {
      attempt,
      recipient: input.recipient,
      endpoint,
    });

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }).catch((error: unknown) => {
      lastErrorText = error instanceof Error ? error.message : "WhatsApp request failed";
      return null;
    });

    if (!response) {
      if (attempt <= maxRetries) {
        await sleep(250 * 2 ** (attempt - 1));
        continue;
      }

      throw new Error(lastErrorText);
    }

    if (response.ok) {
      const data = (await response.json()) as WhatsAppSendResponse;
      whatsappLog.info(input.traceId, "Meta send response", {
        status: response.status,
        messageId: data.messages?.[0]?.id,
      });
      return data;
    }

    lastErrorText = await response.text().catch(() => "WhatsApp API error");
    whatsappLog.warn(input.traceId, "Meta send response", {
      status: response.status,
      error: lastErrorText.slice(0, 200),
    });

    if (!isRetryableStatus(response.status) || attempt > maxRetries) {
      throw new Error(lastErrorText);
    }

    await sleep(250 * 2 ** (attempt - 1));
  }

  throw new Error(lastErrorText);
};
