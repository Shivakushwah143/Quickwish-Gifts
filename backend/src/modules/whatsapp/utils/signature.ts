import crypto from "crypto";
import { getWhatsAppConfig } from "../config.js";

const timingSafeEqual = (a: string, b: string): boolean => {
  const aBuffer = Buffer.from(a, "utf8");
  const bBuffer = Buffer.from(b, "utf8");

  if (aBuffer.length !== bBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(aBuffer, bBuffer);
};

export const verifyWhatsAppSignature = (
  signatureHeader: string | undefined,
  rawBody: Buffer | undefined
): boolean => {
  if (!signatureHeader || !rawBody?.length) {
    return false;
  }

  const [algorithm, signature] = signatureHeader.split("=");
  if (algorithm !== "sha256" || !signature) {
    return false;
  }

  const config = getWhatsAppConfig();
  const expected = crypto
    .createHmac("sha256", config.appSecret)
    .update(rawBody)
    .digest("hex");

  return timingSafeEqual(signature, expected);
};
