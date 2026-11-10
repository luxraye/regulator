import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");
    const email = searchParams.get("email");

    if (!token) {
      return NextResponse.json({ error: "Missing verification token" }, { status: 400 });
    }

    // Find user with this token
    const user = await prisma.user.findFirst({
      where: {
        emailOtp: token,
        ...(email ? { email: email.toLowerCase().trim() } : {}),
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid or expired verification token" }, { status: 400 });
    }

    if (user.emailOtpExpiresAt && user.emailOtpExpiresAt < new Date()) {
      return NextResponse.json({ error: "Verification token has expired. Please request a new one." }, { status: 410 });
    }

    // Mark email verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerifiedAt: new Date(),
        emailOtp: null,
        emailOtpExpiresAt: null,
      },
    });

    // Redirect to login or dashboard with verified status
    const redirectUrl = new URL("/login", req.url);
    redirectUrl.searchParams.set("verified", "true");
    redirectUrl.searchParams.set("email", user.email);
    return NextResponse.redirect(redirectUrl);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
