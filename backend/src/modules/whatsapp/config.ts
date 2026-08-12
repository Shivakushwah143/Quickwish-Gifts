export interface WhatsAppConfig {
  accessToken: string;
  phoneNumberId: string;
  verifyToken: string;
  appSecret: string;
  apiVersion: string;
  graphApiBaseUrl: string;
}

const getRequiredEnv = (name: string): string => {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required WhatsApp environment variable: ${name}`);
  }

  return value;
};

export const getWhatsAppConfig = (): WhatsAppConfig => {
  return {
    accessToken: getRequiredEnv("WHATSAPP_ACCESS_TOKEN"),
    phoneNumberId: getRequiredEnv("WHATSAPP_PHONE_NUMBER_ID"),
    verifyToken: getRequiredEnv("WHATSAPP_VERIFY_TOKEN"),
    appSecret: getRequiredEnv("WHATSAPP_APP_SECRET"),
    apiVersion: process.env.WHATSAPP_API_VERSION?.trim() || "v20.0",
    graphApiBaseUrl: process.env.WHATSAPP_GRAPH_BASE_URL?.trim() || "https://graph.facebook.com",
  };
};
