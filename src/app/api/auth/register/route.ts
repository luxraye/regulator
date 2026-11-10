import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { badRequest } from "@/lib/session";
import { checkEligibility, isValidOmang } from "@/lib/eligibility";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { sendEmail, sendSms } from "@/lib/comms/adapter";
import { getOrCreateInboxSessionId, attachInboxSessionCookie } from "@/lib/comms/session";

export const dynamic = "force-dynamic";

/** Innovator sign-up. Staff accounts are created by a super admin. */
export async function POST(req: NextRequest) {
  const limited = checkRateLimit(`register:${getClientIp(req)}`, 10, 60_000);
  if (limited) return limited;

  const body = await req.json().catch(() => null);
  if (!body) return badRequest("Invalid request");

  const str = (v: unknown, max = 200) => String(v ?? "").trim().slice(0, max);
  const name = str(body.name);
  const email = str(body.email).toLowerCase();
  const password = String(body.password ?? "");
  const phone = str(body.phone, 30);
  const omang = str(body.omang, 20).replace(/\s/g, "");
  const dateOfBirth = str(body.dateOfBirth, 10);
  const organizationName = str(body.organizationName);
  const licenseNumber = str(body.licenseNumber, 50);
  const district = str(body.district, 60);
  const gender = str(body.gender, 30) || null;
  const youthShareholding = Number(body.youthShareholding);

  if (!name || !email || !password) return badRequest("Name, email, and password are required");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return badRequest("Email address looks invalid");
  if (password.length < 8) return badRequest("Password must be at least 8 characters");
  if (!isValidOmang(omang)) return badRequest("Enter your 9-digit Omang number");
  if (!dateOfBirth || Number.isNaN(Date.parse(dateOfBirth))) return badRequest("Enter your date of birth");
  if (!organizationName || !licenseNumber) return badRequest("Company name and CIPA registration number are required");
  if (!Number.isFinite(youthShareholding) || youthShareholding < 0 || youthShareholding > 100) {
    return badRequest("Youth shareholding must be a percentage between 0 and 100");
  }
  if (body.consent !== true) return badRequest("Please accept the privacy notice to continue");

  // Eligibility is checked again when applying; here we only stop clearly ineligible sign-ups.
  const elig = checkEligibility({ omang, dateOfBirth, youthShareholding, hasCompany: true });
  if (!elig.eligible) {
    return badRequest("You don't meet the eligibility rules for this programme", { checks: elig.checks.filter((c) => !c.ok) });
  }

  if (await prisma.user.findUnique({ where: { email } })) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }
  if (await prisma.user.findFirst({ where: { omang } })) {
    return NextResponse.json({ error: "An account with this Omang number already exists" }, { status: 409 });
  }

  const emailToken = crypto.randomBytes(24).toString("hex");
  const phoneCode = crypto.randomInt(100000, 999999).toString();
  const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  await prisma.user.create({
    data: {
      name,
      email,
      phone: phone || null,
      passwordHash: await bcrypt.hash(password, 12),
      role: "INNOVATOR",
      omang,
      dateOfBirth: new Date(dateOfBirth),
      gender,
      district: district || null,
      organizationName,
      licenseNumber,
      youthShareholding: Math.round(youthShareholding),
      consentAt: new Date(),
      emailOtp: emailToken,
      emailOtpExpiresAt: tokenExpiresAt,
      phoneOtp: phone ? phoneCode : null,
      phoneOtpExpiresAt: phone ? tokenExpiresAt : null,
    },
  });

  const { sessionId } = getOrCreateInboxSessionId(req);
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const verifyLink = `${baseUrl}/api/auth/verify-email?token=${emailToken}`;

  // Dispatch email verification link (mirrored into scoped /demo-inbox)
  await sendEmail({
    to: email,
    subject: "Verify your email address for CEDA Innovation Portal",
    text: `Dumelang ${name},\n\nWelcome to the CEDA Innovation Management Portal. Please click the link below to verify your email address:\n${verifyLink}\n\nCEDA Innovation Portal`,
    inboxSessionId: sessionId,
    metadata: {
      purpose: "EMAIL_VERIFICATION",
      token: emailToken,
      actionUrl: `/api/auth/verify-email?token=${emailToken}`,
    },
  });

  // Dispatch phone verification OTP if phone provided (mirrored into scoped /demo-inbox)
  if (phone) {
    await sendSms({
      to: phone,
      message: `Dumelang ${name}. Your CEDA Innovation Portal phone verification code is: ${phoneCode}.`,
      inboxSessionId: sessionId,
      metadata: {
        purpose: "PHONE_VERIFICATION",
        code: phoneCode,
      },
    });
  }

  const res = NextResponse.json({
    message: "Account created. Verification link sent to email and OTP sent to phone.",
    emailVerified: false,
    phoneVerified: false,
  }, { status: 201 });

  return attachInboxSessionCookie(res, sessionId);
}
