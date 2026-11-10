import crypto from "crypto";
import { audit } from "@/lib/audit";

export type WebhookEventType = "stage.changed" | "decision.recorded" | "instance.published";

export interface WebhookDeliveryResult {
  success: boolean;
  statusCode?: number;
  error?: string;
  deliveredAt: string;
}

/**
 * Dispatches an HMAC-SHA256 signed outbound webhook to a Partner's configured callback endpoint.
 */
export async function dispatchPartnerWebhook(
  partnerId: string,
  event: WebhookEventType,
  payload: Record<string, unknown>,
  webhookUrl?: string,
  webhookSecret?: string
): Promise<WebhookDeliveryResult> {
  const targetUrl = webhookUrl || process.env.PARTNER_WEBHOOK_URL;
  const secret = webhookSecret || process.env.PARTNER_WEBHOOK_SECRET || "ceda_webhook_signing_secret_default";

  const eventPayload = {
    id: `evt_${Date.now().toString(36)}_${crypto.randomBytes(4).toString("hex")}`,
    event,
    partnerId,
    timestamp: new Date().toISOString(),
    data: payload,
  };

  const bodyJson = JSON.stringify(eventPayload);
  const signature = crypto.createHmac("sha256", secret).update(bodyJson).digest("hex");

  if (!targetUrl) {
    // If no webhook URL configured, record mock dispatch in audit trail
    await audit("system", "WEBHOOK_DISPATCH_MOCK", {
      metadata: { event, partnerId, signature: `sha256=${signature}`, eventId: eventPayload.id },
    });
    return {
      success: true,
      deliveredAt: eventPayload.timestamp,
    };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CEDA-Event": event,
        "X-CEDA-Signature": `sha256=${signature}`,
        "User-Agent": "CEDA-Innovation-Portal-Webhooks/1.0",
      },
      body: bodyJson,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    await audit("system", "WEBHOOK_DISPATCH", {
      metadata: {
        event,
        partnerId,
        statusCode: res.status,
        targetUrl,
        eventId: eventPayload.id,
      },
    });

    return {
      success: res.ok,
      statusCode: res.status,
      deliveredAt: eventPayload.timestamp,
    };
  } catch (err: any) {
    console.error(`Webhook delivery failed for partner "${partnerId}":`, err.message);
    return {
      success: false,
      error: err.message,
      deliveredAt: eventPayload.timestamp,
    };
  }
}
