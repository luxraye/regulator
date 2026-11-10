import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendOtp } from "@/lib/comms/adapter";
import crypto from "crypto";

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/otp/send
 * Dispatches a 6-digit one-time passcode via SMS or Email for phone verification or OTP sign-in.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { destination, channel } = body;

    if (!destination) {
      return NextResponse.json({ error: "Destination (email or phone number) is required" }, { status: 400 });
    }

    const cleanDest = String(destination).trim().toLowerCase();
    const isSms = channel === "SMS" || destination.startsWith("+") || /^\d+$/.test(destination.replace(/[\s-]/g, ""));
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

    // Deliver via communication adapter (Resend/SMTP or SMS, mirrored to /demo-inbox)
    await sendOtp(destination, code, isSms ? "SMS" : "EMAIL");

    return NextResponse.json({
      success: true,
      message: `Verification code sent to ${destination}. Captured in /demo-inbox for judges.`,
      channel: isSms ? "SMS" : "EMAIL",
    });
  } catch (error) {
    console.error("POST /api/auth/otp/send error:", error);
    return NextResponse.json({ error: "Failed to send verification code" }, { status: 500 });
  }
}
