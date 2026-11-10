import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/otp/verify
 * Validates 6-digit one-time passcode for phone/email verification or passwordless sign-in.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { destination, code } = body;

    if (!destination || !code) {
      return NextResponse.json({ error: "Destination and verification code are required" }, { status: 400 });
    }

    const cleanDest = String(destination).trim().toLowerCase();
    const cleanCode = String(code).trim();
    const now = new Date();

    const isPhone = destination.startsWith("+") || /^\d+$/.test(destination.replace(/[\s-]/g, ""));

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
      return NextResponse.json({ error: "Invalid or expired verification code" }, { status: 400 });
    }

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
        phoneVerified: !!updated.phoneVerifiedAt,
        emailVerified: !!updated.emailVerifiedAt,
      },
    });
  } catch (error) {
    console.error("POST /api/auth/otp/verify error:", error);
    return NextResponse.json({ error: "Failed to verify code" }, { status: 500 });
  }
}
