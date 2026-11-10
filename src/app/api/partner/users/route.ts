import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { audit } from "@/lib/audit";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";

export const dynamic = "force-dynamic";

/**
 * GET /api/partner/users
 * Returns list of team members scoped strictly to the partner organization.
 */
export async function GET(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user || !["PARTNER_ADMIN", "SUPERADMIN"].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    let partnerId = user.partnerId;
    if (user.role === "SUPERADMIN" && searchParams.get("partnerId")) {
      partnerId = searchParams.get("partnerId");
    }

    if (!partnerId) {
      return NextResponse.json({ users: [] });
    }

    const users = await prisma.user.findMany({
      where: { partnerId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        expertise: true,
        phone: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("GET /api/partner/users error:", error);
    return NextResponse.json({ error: "Failed to fetch team members" }, { status: 500 });
  }
}

/**
 * POST /api/partner/users
 * Invites or creates a new team member scoped to the partner organization.
 */
export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user || !["PARTNER_ADMIN", "SUPERADMIN"].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { email, name, role, expertise, phone, password } = body;

    if (!email || !name) {
      return NextResponse.json({ error: "Email and name are required" }, { status: 400 });
    }

    let partnerId = user.partnerId;
    if (user.role === "SUPERADMIN" && body.partnerId) {
      partnerId = body.partnerId;
    }

    if (!partnerId) {
      return NextResponse.json({ error: "No partner specified" }, { status: 400 });
    }

    const partner = await prisma.partner.findUnique({ where: { id: partnerId } });
    if (!partner) {
      return NextResponse.json({ error: "Partner not found" }, { status: 404 });
    }

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (existing) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 });
    }

    const assignedRole = (role as Role) || Role.EVALUATOR;
    // Disallow assigning SUPERADMIN or roles outside partner scope
    if (!["EVALUATOR", "ADJUDICATOR", "PARTNER_ADMIN"].includes(assignedRole)) {
      return NextResponse.json({ error: "Invalid role for partner team member" }, { status: 400 });
    }

    const pwd = password || "CedaDemo2026!";
    const passwordHash = await bcrypt.hash(pwd, 10);

    const newUser = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        name: name.trim(),
        role: assignedRole,
        partnerId,
        organizationName: partner.name,
        expertise: expertise || null,
        phone: phone || null,
        passwordHash,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        expertise: true,
        phone: true,
        createdAt: true,
      },
    });

    await audit(user.id, "CREATE_PARTNER_USER", {
      metadata: {
        createdUserId: newUser.id,
        createdEmail: newUser.email,
        role: newUser.role,
        partnerId,
      },
    });

    return NextResponse.json({ success: true, user: newUser }, { status: 201 });
  } catch (error) {
    console.error("POST /api/partner/users error:", error);
    return NextResponse.json({ error: "Failed to create team member" }, { status: 500 });
  }
}
