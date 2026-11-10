import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendOtp } from "@/lib/comms/adapter";
import { getOrCreateInboxSessionId, attachInboxSessionCookie } from "@/lib/comms/session";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { checkOtpLockout, isDemoAccount } from "@/lib/auth-lockout";
import crypto from "crypto";

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/otp/send
 * Dispatches a 6-digit one-time passcode via SMS or Email for phone verification or OTP sign-in.
 */
export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const ipLimited = checkRateLimit(`otp-send:ip:${ip}`, 5, 15 * 60 * 1000);
    if (ipLimited) return ipLimited;

    const body = await req.json();
    const { destination, channel } = body;

    if (!destination) {
      return NextResponse.json({ error: "Destination (email or phone number) is required" }, { status: 400 });
    }

    const cleanDest = String(destination).trim().toLowerCase();

    // Protect seeded demo accounts
    if (isDemoAccount(cleanDest)) {
      return NextResponse.json(
        { error: "Demo accounts use the shared demo password (CedaDemo2026!) and do not support OTP sign-in." },
        { status: 400 }
      );
    }

    // Check if destination is locked from too many failed OTP attempts
    const lockout = checkOtpLockout(cleanDest);
    if (lockout.locked) {
      return NextResponse.json({ error: lockout.message }, { status: 429 });
    }

    // Rate limit per destination: 5 requests per 15 minutes
    const destLimited = checkRateLimit(`otp-send:dest:${cleanDest}`, 5, 15 * 60 * 1000);
    if (destLimited) return destLimited;

    const { sessionId } = getOrCreateInboxSessionId(req);

    const isSms = channel === "SMS" || cleanDest.startsWith("+") || /^\d+$/.test(cleanDest.replace(/[\s-]/g, ""));
    const code = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Locate user if exists
    const user = isSms
      ? await prisma.user.findFirst({ where: { phone: destination } })
      : await prisma.user.findUnique({ where: { email: cleanDest } });

    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: isSms
          ? { phoneOtp: code, phoneOtpExpiresAt: expiresAt }
          : { emailOtp: code, emailOtpExpiresAt: expiresAt },
      });
    }

    // Deliver via communication adapter (mirrored to scoped /demo-inbox)
    await sendOtp(destination, code, isSms ? "SMS" : "EMAIL", sessionId);

    const res = NextResponse.json({
      success: true,
      message: `Verification code sent to ${destination}. Captured in /demo-inbox for judges.`,
      channel: isSms ? "SMS" : "EMAIL",
    });
    return attachInboxSessionCookie(res, sessionId);
  } catch (error) {
    console.error("POST /api/auth/otp/send error:", error);
    return NextResponse.json({ error: "Failed to send verification code" }, { status: 500 });
  }
}
