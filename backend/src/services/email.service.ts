export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

export interface OrderConfirmationEmailInput {
  customerName: string;
  customerEmail: string;
  orderId: string;
  items: OrderItem[];
  totalAmount: number;
}

interface BrevoEmailPayload {
  sender: {
    email: string;
    name: string;
  };
  to: Array<{
    email: string;
  }>;
  subject: string;
  htmlContent: string;
}

const BREVO_EMAIL_ENDPOINT = "https://api.brevo.com/v3/smtp/email";

const getRequiredEnv = (key: string): string => {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
};

const escapeHtml = (value: string): string => {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

export const sendEmail = async (
  to: string,
  subject: string,
  html: string
): Promise<void> => {
  const apiKey = getRequiredEnv("BREVO_API_KEY");
  const senderEmail = getRequiredEnv("BREVO_SENDER_EMAIL");
  const senderName = getRequiredEnv("BREVO_SENDER_NAME");

  const payload: BrevoEmailPayload = {
    sender: {
      email: senderEmail,
      name: senderName,
    },
    to: [{ email: to }],
    subject,
    htmlContent: html,
  };

  try {
    const response = await fetch(BREVO_EMAIL_ENDPOINT, {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (response.status !== 201) {
      const responseBody = await response.text();
      throw new Error(
        `Brevo email API failed with status ${response.status}: ${responseBody}`
      );
    }

    console.log(`Order confirmation email sent successfully to ${to}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown email error";
    console.error(`Failed to send email to ${to}: ${message}`);
    throw error;
  }
};

export const sendOrderConfirmationEmail = async ({
  customerName,
  customerEmail,
  orderId,
  items,
  totalAmount,
}: OrderConfirmationEmailInput): Promise<void> => {
  const safeCustomerName = escapeHtml(customerName);
  const safeOrderId = escapeHtml(orderId);

  const itemRows = items
    .map((item) => {
      const safeItemName = escapeHtml(item.name);
      const quantity = Number.isFinite(item.quantity) ? item.quantity : 1;
      const price = Number.isFinite(item.price) ? item.price : 0;

      return `
        <tr>
          <td style="padding: 12px 0; color: #2b1d25; font-weight: 600;">${safeItemName}</td>
          <td style="padding: 12px 0; color: #7b6a73; text-align: center;">${quantity}</td>
          <td style="padding: 12px 0; color: #2b1d25; text-align: right; font-weight: 600;">${formatCurrency(price)}</td>
        </tr>
      `;
    })
    .join("");

  const html = `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Order Confirmation</title>
      </head>
      <body style="margin: 0; padding: 0; background: #f8f3ec; font-family: Arial, sans-serif; color: #2b1d25;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: #f8f3ec; padding: 32px 16px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 640px; background: #ffffff; border: 1px solid #eadfd4; border-radius: 18px; overflow: hidden;">
                <tr>
                  <td style="background: #4a1f3b; padding: 28px 32px; color: #ffffff;">
                    <h1 style="margin: 0; font-size: 26px; line-height: 1.25;">Your order is confirmed</h1>
                    <p style="margin: 10px 0 0; color: #f3e7dc; font-size: 15px;">Thank you for choosing QuickWish.</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 28px 32px;">
                    <p style="margin: 0 0 18px; font-size: 16px; line-height: 1.6;">
                      Hi <strong>${safeCustomerName}</strong>, your order has been confirmed and our team is preparing it with care.
                    </p>

                    <div style="background: #fff8ed; border: 1px solid #eadfd4; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
                      <p style="margin: 0; color: #7b6a73; font-size: 13px;">Order ID</p>
                      <p style="margin: 6px 0 0; color: #2b1d25; font-size: 18px; font-weight: 700;">${safeOrderId}</p>
                    </div>

                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
                      <thead>
                        <tr>
                          <th align="left" style="padding-bottom: 10px; border-bottom: 1px solid #eadfd4; color: #7b6a73; font-size: 12px; text-transform: uppercase;">Item</th>
                          <th align="center" style="padding-bottom: 10px; border-bottom: 1px solid #eadfd4; color: #7b6a73; font-size: 12px; text-transform: uppercase;">Qty</th>
                          <th align="right" style="padding-bottom: 10px; border-bottom: 1px solid #eadfd4; color: #7b6a73; font-size: 12px; text-transform: uppercase;">Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${itemRows}
                      </tbody>
                    </table>

                    <div style="border-top: 1px solid #eadfd4; margin-top: 10px; padding-top: 18px; text-align: right;">
                      <span style="color: #7b6a73; font-size: 14px;">Total Amount</span>
                      <div style="color: #4a1f3b; font-size: 24px; font-weight: 700; margin-top: 4px;">${formatCurrency(totalAmount)}</div>
                    </div>

                    <p style="margin: 28px 0 0; color: #7b6a73; font-size: 14px; line-height: 1.6;">
                      We will share delivery updates soon. Thank you for trusting us with your special moment.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  await sendEmail(customerEmail, `Order confirmed: ${orderId}`, html);
};
