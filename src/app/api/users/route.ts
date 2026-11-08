import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import type { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser, badRequest, notFound, STAFF_ROLES } from "@/lib/session";
import { audit } from "@/lib/audit";

export const dynamic = "force-dynamic";

const ROLES: Role[] = ["INNOVATOR", "EVALUATOR", "ADJUDICATOR", "ADMIN", "SUPERADMIN"];

export async function GET(req: NextRequest) {
  const { error } = await requireUser(STAFF_ROLES);
  if (error) return error;

  const role = req.nextUrl.searchParams.get("role") as Role | null;
  if (role && !ROLES.includes(role)) return badRequest("Unknown role");

  const users = await prisma.user.findMany({
    where: role ? { role } : undefined,
    select: { id: true, name: true, email: true, role: true, organizationName: true, licenseNumber: true, expertise: true, createdAt: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(users);
}

/** Super admins can change a user's role. */
export async function PATCH(req: NextRequest) {
  const { user, error } = await requireUser(["SUPERADMIN"]);
  if (error) return error;

  const { id, role } = (await req.json().catch(() => ({}))) as { id?: string; role?: Role };
  if (!id || !role || !ROLES.includes(role)) return badRequest("Expected { id, role }");
  if (id === user.id) return badRequest("You can't change your own role");

  const target = await prisma.user.findUnique({ where: { id }, select: { id: true, role: true, email: true } });
  if (!target) return notFound("User not found");

  const updated = await prisma.user.update({
    where: { id },
    data: { role },
    select: { id: true, role: true },
  });
  await audit(user.id, "USER_ROLE_CHANGED", { metadata: { userId: id, email: target.email, from: target.role, to: role } });
  return NextResponse.json(updated);
}

/** Super admins add evaluators, adjudicators and staff. Returns a one-time password to hand over. */
export async function POST(req: NextRequest) {
  const { user, error } = await requireUser(["SUPERADMIN"]);
  if (error) return error;

  const body = await req.json().catch(() => ({}));
  const name = String(body?.name ?? "").trim().slice(0, 200);
  const email = String(body?.email ?? "").trim().toLowerCase();
  const role = body?.role as Role;
  const expertise = String(body?.expertise ?? "").trim().slice(0, 200) || null;
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return badRequest("Name and a valid email are required");
  if (!["EVALUATOR", "ADJUDICATOR", "ADMIN"].includes(role)) return badRequest("Choose evaluator, adjudicator or admin");
  if (await prisma.user.findUnique({ where: { email } })) return NextResponse.json({ error: "Email already registered" }, { status: 409 });

  const tempPassword = crypto.randomBytes(6).toString("base64url");
  const created = await prisma.user.create({
    data: { name, email, role, expertise, organizationName: "CEDA", passwordHash: await bcrypt.hash(tempPassword, 12) },
    select: { id: true, name: true, email: true, role: true },
  });
  await audit(user.id, "USER_CREATED", { metadata: { email, role } });
  return NextResponse.json({ ...created, tempPassword }, { status: 201 });
}
