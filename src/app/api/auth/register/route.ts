import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, organizationName, licenseNumber, accountType } =
      await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    const isCitizen = accountType === "citizen";

    if (!isCitizen && !organizationName) {
      return NextResponse.json(
        { error: "Organization name is required for licensee accounts" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: isCitizen ? "PUBLIC" : "LICENSEE",
        organizationName: isCitizen ? null : organizationName,
        licenseNumber: isCitizen ? null : licenseNumber || null,
      },
    });

    return NextResponse.json({ message: "Account created" }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
