import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { badRequest } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return badRequest("Invalid request");

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  const organizationName = String(body.organizationName ?? "").trim();
  const licenseNumber = String(body.licenseNumber ?? "").trim();
  const isCitizen = body.accountType !== "licensee";

  if (!name || !email || !password) return badRequest("Name, email, and password are required");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return badRequest("Email address looks invalid");
  if (password.length < 8) return badRequest("Password must be at least 8 characters");
  if (!isCitizen && !organizationName) return badRequest("Organization name is required for licensee accounts");
  if (!isCitizen && !licenseNumber) return badRequest("Licence number is required for licensee accounts");

  if (await prisma.user.findUnique({ where: { email } })) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  await prisma.user.create({
    data: {
      name: name.slice(0, 200),
      email,
      passwordHash: await bcrypt.hash(password, 12),
      role: isCitizen ? "PUBLIC" : "LICENSEE",
      organizationName: isCitizen ? null : organizationName.slice(0, 200),
      licenseNumber: isCitizen ? null : licenseNumber.slice(0, 50),
    },
  });

  return NextResponse.json({ message: "Account created" }, { status: 201 });
}
