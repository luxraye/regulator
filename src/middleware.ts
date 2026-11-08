import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

/**
 * Page-level access control. API routes check roles themselves (see lib/session.ts),
 * so this only guards dashboard pages and sends people to the right place.
 */
const pageRoles: [prefix: string, roles: string[]][] = [
  ["/dashboard/superadmin", ["SUPERADMIN"]],
  ["/dashboard/admin", ["ADMIN", "SUPERADMIN"]],
  ["/dashboard/innovator", ["INNOVATOR"]],
  ["/dashboard/citizen", ["PUBLIC"]],
];

export default auth((req) => {
  const { pathname, search } = req.nextUrl;

  if (!req.auth) {
    const login = new URL("/login", req.url);
    login.searchParams.set("callbackUrl", pathname + search);
    return NextResponse.redirect(login);
  }

  const role = (req.auth.user as { role?: string } | undefined)?.role ?? "";
  const rule = pageRoles.find(([prefix]) => pathname.startsWith(prefix));
  if (rule && !rule[1].includes(role)) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
  return NextResponse.next();
});

export const config = { matcher: ["/dashboard/:path*"] };
