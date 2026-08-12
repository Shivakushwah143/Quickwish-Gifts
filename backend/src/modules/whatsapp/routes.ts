import { Router } from "express";
import {
  receiveWhatsAppWebhook,
  sendWhatsAppTestMessage,
  whatsappHealth,
  testWhatsAppPipeline,
  verifyWhatsAppWebhook,
} from "./controllers/whatsappWebhook.controller.js";

const whatsappRouter = Router();

whatsappRouter.get("/health", whatsappHealth);
whatsappRouter.get("/webhook", verifyWhatsAppWebhook);
whatsappRouter.post("/webhook", receiveWhatsAppWebhook);

if (process.env.NODE_ENV !== "production") {
  whatsappRouter.post("/test", testWhatsAppPipeline);
  whatsappRouter.post("/send-test", sendWhatsAppTestMessage);
}

export default whatsappRouter;
