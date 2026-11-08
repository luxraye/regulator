import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { badRequest } from "@/lib/session";
import { checkEligibility, isValidOmang } from "@/lib/eligibility";

export const dynamic = "force-dynamic";

/** Innovator sign-up. Staff accounts are created by a super admin. */
export async function POST(req: NextRequest) {
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
    },
  });

  return NextResponse.json({ message: "Account created" }, { status: 201 });
}
