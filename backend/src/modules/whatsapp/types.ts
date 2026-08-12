export type WhatsAppMessageType =
  | "text"
  | "image"
  | "audio"
  | "video"
  | "document"
  | "interactive"
  | "unsupported";

export interface NormalizedConversationMessage {
  id: string;
  phoneNumber: string;
  timestamp: number;
  messageType: WhatsAppMessageType;
  text: string;
  rawPayload: Record<string, unknown>;
}

export type ConversationDirection = "inbound" | "outbound";
export type ConversationRole = "customer" | "assistant";
export type ConversationStatus = "received" | "processing" | "sent" | "failed" | "ignored";

export interface WhatsAppWebhookVerificationQuery {
  "hub.mode"?: string;
  "hub.verify_token"?: string;
  "hub.challenge"?: string;
}

export interface WhatsAppWebhookPayload {
  object?: string;
  entry?: Array<{
    id?: string;
    changes?: Array<{
      value?: WhatsAppWebhookValue;
    }>;
  }>;
}

export interface WhatsAppWebhookValue {
  messaging_product?: string;
  metadata?: {
    display_phone_number?: string;
    phone_number_id?: string;
  };
  contacts?: Array<{
    wa_id?: string;
    profile?: {
      name?: string;
    };
  }>;
  messages?: Array<{
    id?: string;
    from?: string;
    timestamp?: string;
    type?: string;
    text?: {
      body?: string;
    };
    image?: Record<string, unknown>;
    audio?: Record<string, unknown>;
    video?: Record<string, unknown>;
    document?: Record<string, unknown>;
    interactive?: Record<string, unknown>;
  }>;
  statuses?: Array<{
    id?: string;
    status?: string;
    timestamp?: string;
    recipient_id?: string;
  }>;
}

export interface WhatsAppSendTextInput {
  recipient: string;
  text: string;
}

export interface WhatsAppTestRequestBody {
  phone?: string;
  message?: string;
}

export interface WhatsAppSendResponse {
  messaging_product?: string;
  contacts?: Array<{
    input?: string;
    wa_id?: string;
  }>;
  messages?: Array<{
    id?: string;
  }>;
}
