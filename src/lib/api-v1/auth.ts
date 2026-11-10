import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sha256 } from "@/lib/hash";

export interface AuthenticatedPartner {
  partnerId: string;
  partnerName: string;
  partnerSlug: string;
  keyId: string;
  keyPrefix: string;
}

/**
 * Generates a high-entropy cryptographically secure API key for a Partner.
 */
export async function createPartnerApiKey(
  partnerId: string,
  name: string,
  createdById: string
): Promise<{ apiKey: string; keyPrefix: string; id: string }> {
  const randomBytes = crypto.randomBytes(24).toString("hex");
  const apiKey = `ceda_live_${randomBytes}`;
  const keyPrefix = apiKey.slice(0, 18);
  const keyHash = sha256(Buffer.from(apiKey, "utf8"));

  const record = await prisma.apiKey.create({
    data: {
      partnerId,
      name,
      keyPrefix,
      keyHash,
      createdById,
    },
  });

  return { apiKey, keyPrefix, id: record.id };
}

/**
 * Authenticates an incoming API v1 request via Bearer token or X-API-Key header.
 */
export async function authenticatePartnerRequest(
  req: Request
): Promise<AuthenticatedPartner | null> {
  let token: string | null = null;

  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7).trim();
  }

  if (!token) {
    const xApiKey = req.headers.get("x-api-key");
    if (xApiKey) token = xApiKey.trim();
  }

  if (!token || !token.startsWith("ceda_live_")) {
    return null;
  }

  const keyPrefix = token.slice(0, 18);
  const keyHash = sha256(Buffer.from(token, "utf8"));

  const keyRecord = await prisma.apiKey.findFirst({
    where: {
      keyPrefix,
      keyHash,
      revokedAt: null,
    },
    include: {
      partner: true,
    },
  });

  if (!keyRecord || !keyRecord.partner) {
    return null;
  }

  // Update lastUsedAt asynchronously
  prisma.apiKey
    .update({
      where: { id: keyRecord.id },
      data: { lastUsedAt: new Date() },
    })
    .catch(() => {});

  return {
    partnerId: keyRecord.partner.id,
    partnerName: keyRecord.partner.name,
    partnerSlug: keyRecord.partner.slug,
    keyId: keyRecord.id,
    keyPrefix: keyRecord.keyPrefix,
  };
}
