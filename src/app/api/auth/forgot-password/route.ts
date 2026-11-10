import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/comms/adapter";
import { getOrCreateInboxSessionId, attachInboxSessionCookie, inboxOwnsDestination } from "@/lib/comms/session";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { isDemoAccount } from "@/lib/auth-lockout";
import crypto from "crypto";

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/forgot-password
 * Issues a cryptographically secure password reset token and dispatches reset link.
 */
export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    // Rate limit: 5 requests per 15 minutes per IP
    const ipLimited = checkRateLimit(`forgot-pw:ip:${ip}`, 5, 15 * 60 * 1000);
    if (ipLimited) return ipLimited;

    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const cleanEmail = String(email).trim().toLowerCase();

    // Rate limit: 5 requests per 15 minutes per destination email
    const destLimited = checkRateLimit(`forgot-pw:dest:${cleanEmail}`, 5, 15 * 60 * 1000);
    if (destLimited) return destLimited;

    // Block reset attempts on seeded demo accounts
    if (isDemoAccount(cleanEmail)) {
      return NextResponse.json(
        { error: "Demo accounts use the shared demo password (CedaDemo2026!) and cannot be reset." },
        { status: 400 }
      );
    }

    const { sessionId } = getOrCreateInboxSessionId(req);

    const user = await prisma.user.findUnique({ where: { email: cleanEmail } });

    // If user does not exist, return generic success without leaking existence
    if (!user) {
      const res = NextResponse.json({
        success: true,
        message: "If an account exists with this email, a password reset link has been dispatched.",
      });
      return attachInboxSessionCookie(res, sessionId);
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpiresAt: expiresAt,
      },
    });

    const resetUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`;

    await sendEmail({
      to: cleanEmail,
      subject: "Reset your CEDA Innovation Portal Password",
      text: `Dumelang ${user.name},\n\nYou requested a password reset for your CEDA Innovation Portal account.\n\nClick the link below or copy it into your browser to choose a new password:\n${resetUrl}\n\nThis link is valid for 1 hour. If you did not make this request, you can safely ignore this email.\n\nCEDA Innovation Portal`,
      // Only the browser that registered this account sees the link in the demo inbox.
      inboxSessionId: (await inboxOwnsDestination(cleanEmail, sessionId)) ? sessionId : undefined,
      metadata: {
        purpose: "PASSWORD_RESET",
        resetToken,
        actionUrl: `/reset-password?token=${resetToken}`,
      },
    });

    const res = NextResponse.json({
      success: true,
      message: "If an account exists with this email, a password reset link has been dispatched.",
    });
    return attachInboxSessionCookie(res, sessionId);
  } catch (error) {
    console.error("POST /api/auth/forgot-password error:", error);
    return NextResponse.json({ error: "Failed to process password reset request" }, { status: 500 });
  }
}
