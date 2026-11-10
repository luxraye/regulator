import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export const INBOX_COOKIE_NAME = "ceda_inbox_session";

/**
 * Extracts or generates a session ID for demo inbox scoping.
 */
export function getOrCreateInboxSessionId(req: NextRequest): { sessionId: string; isNew: boolean } {
  const existing = req.cookies.get(INBOX_COOKIE_NAME)?.value;
  if (existing && existing.length >= 16) {
    return { sessionId: existing, isNew: false };
  }
  const newId = crypto.randomBytes(16).toString("hex");
  return { sessionId: newId, isNew: true };
}

/**
 * Attaches the httpOnly inbox session cookie to the response.
 */
export function attachInboxSessionCookie(res: NextResponse, sessionId: string): NextResponse {
  res.cookies.set(INBOX_COOKIE_NAME, sessionId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  return res;
}

/**
 * Masks sensitive OTP codes and tokens for global SUPERADMIN audit views.
 */
export function maskSensitiveComms(msg: any) {
  let maskedBody = String(msg.body || "");
  // Mask 6-digit codes
  maskedBody = maskedBody.replace(/\b\d{6}\b/g, "******");
  // Mask token queries in links
  maskedBody = maskedBody.replace(/token=[a-zA-Z0-9_-]+/g, "token=******");

  const meta = msg.metadata ? { ...msg.metadata } : {};
  if (meta.code) meta.code = "******";
  if (meta.token) meta.token = "******";
  if (meta.actionUrl && typeof meta.actionUrl === "string") {
    meta.actionUrl = meta.actionUrl.replace(/token=[a-zA-Z0-9_-]+/g, "token=******");
  }

  return {
    ...msg,
    body: maskedBody,
    metadata: meta,
  };
}
