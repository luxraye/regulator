import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { checkOtpLockout, recordFailedOtpAttempt, resetOtpLockout, isDemoAccount } from "@/lib/auth-lockout";

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/otp/verify
 * Validates 6-digit one-time passcode for phone/email verification or passwordless sign-in.
 */
export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const ipLimited = checkRateLimit(`otp-verify:ip:${ip}`, 5, 15 * 60 * 1000);
    if (ipLimited) return ipLimited;

    const body = await req.json();
    const { destination, code } = body;

    if (!destination || !code) {
      return NextResponse.json({ error: "Destination and verification code are required" }, { status: 400 });
    }

    const cleanDest = String(destination).trim().toLowerCase();
    const cleanCode = String(code).trim();

    // Protect demo accounts
    if (isDemoAccount(cleanDest)) {
      return NextResponse.json(
        { error: "Demo accounts use the shared demo password (CedaDemo2026!) and do not support OTP sign-in." },
        { status: 400 }
      );
    }

    // Check lockout before processing
    const lockout = checkOtpLockout(cleanDest);
    if (lockout.locked) {
      return NextResponse.json({ error: lockout.message }, { status: 429 });
    }

    const destLimited = checkRateLimit(`otp-verify:dest:${cleanDest}`, 5, 15 * 60 * 1000);
    if (destLimited) return destLimited;

    const now = new Date();
    const isPhone = cleanDest.startsWith("+") || /^\d+$/.test(cleanDest.replace(/[\s-]/g, ""));

    const user = isPhone
      ? await prisma.user.findFirst({
          where: {
            phone: destination,
            phoneOtp: cleanCode,
            phoneOtpExpiresAt: { gte: now },
          },
        })
      : await prisma.user.findFirst({
          where: {
            email: cleanDest,
            emailOtp: cleanCode,
            emailOtpExpiresAt: { gte: now },
          },
        });

    if (!user) {
      const { locked, attemptsLeft } = recordFailedOtpAttempt(cleanDest);
      if (locked) {
        return NextResponse.json(
          { error: "Too many incorrect attempts. This account is locked from OTP verification for 15 minutes." },
          { status: 429 }
        );
      }
      return NextResponse.json(
        { error: `Invalid or expired verification code. ${attemptsLeft} attempt(s) remaining before account lockout.` },
        { status: 400 }
      );
    }

    // Success: clear failed attempts
    resetOtpLockout(cleanDest);

    // Mark verified and clear single-use OTP
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: isPhone
        ? { phoneVerifiedAt: now, phoneOtp: null, phoneOtpExpiresAt: null }
        : { emailVerifiedAt: now, emailOtp: null, emailOtpExpiresAt: null },
    });

    await audit(user.id, isPhone ? "VERIFY_PHONE_OTP" : "VERIFY_EMAIL_OTP", {
      metadata: { destination, verifiedAt: now.toISOString() },
    });

    return NextResponse.json({
      success: true,
      verified: true,
      user: {
        id: updated.id,
        email: updated.email,
        name: updated.name,
        role: updated.role,
      },
    });
  } catch (error) {
    console.error("POST /api/auth/otp/verify error:", error);
    return NextResponse.json({ error: "Failed to verify code" }, { status: 500 });
  }
}
