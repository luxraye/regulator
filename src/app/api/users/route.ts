import { NextRequest, NextResponse } from "next/server";
import type { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser, badRequest, notFound, STAFF_ROLES } from "@/lib/session";
import { audit } from "@/lib/audit";

export const dynamic = "force-dynamic";

const ROLES: Role[] = ["PUBLIC", "LICENSEE", "ADMIN", "SUPERADMIN"];

export async function GET(req: NextRequest) {
  const { error } = await requireUser(STAFF_ROLES);
  if (error) return error;

  const role = req.nextUrl.searchParams.get("role") as Role | null;
  if (role && !ROLES.includes(role)) return badRequest("Unknown role");

  const users = await prisma.user.findMany({
    where: role ? { role } : undefined,
    select: { id: true, name: true, email: true, role: true, organizationName: true, licenseNumber: true, createdAt: true },
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
