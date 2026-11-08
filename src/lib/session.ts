import { NextResponse } from "next/server";
import type { Role } from "@prisma/client";
import { auth } from "@/lib/auth";

export interface SessionUser {
  id: string;
  role: Role;
  name: string;
  email: string;
  organizationName?: string | null;
}

/** The signed-in user, or null. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth();
  const user = session?.user as Partial<SessionUser> | undefined;
  if (!user?.id || !user.role) return null;
  return user as SessionUser;
}

export const STAFF_ROLES: Role[] = ["ADMIN", "SUPERADMIN"];

/**
 * Guard for API routes. Returns the user, or a ready-made error response.
 * Usage: const { user, error } = await requireUser(["ADMIN"]); if (error) return error;
 */
export async function requireUser(
  roles?: Role[]
): Promise<{ user: SessionUser; error: null } | { user: null; error: NextResponse }> {
  const user = await getSessionUser();
  if (!user) {
    return { user: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  if (roles && !roles.includes(user.role)) {
    return { user: null, error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { user, error: null };
}

export function badRequest(message: string, extra?: Record<string, unknown>) {
  return NextResponse.json({ error: message, ...extra }, { status: 400 });
}

export function notFound(message = "Not found") {
  return NextResponse.json({ error: message }, { status: 404 });
}
