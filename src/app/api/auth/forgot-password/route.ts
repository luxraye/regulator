import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/comms/adapter";
import crypto from "crypto";

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/forgot-password
 * Issues a cryptographically secure password reset token and dispatches reset link.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: cleanEmail } });

    // Always respond with success to avoid account enumeration attacks
    if (!user) {
      return NextResponse.json({
        success: true,
        message: "If an account exists with this email, a password reset link has been dispatched.",
      });
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
      metadata: {
        purpose: "PASSWORD_RESET",
        resetToken,
        actionUrl: `/reset-password?token=${resetToken}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: "If an account exists with this email, a password reset link has been dispatched.",
    });
  } catch (error) {
    console.error("POST /api/auth/forgot-password error:", error);
    return NextResponse.json({ error: "Failed to process password reset request" }, { status: 500 });
  }
}
