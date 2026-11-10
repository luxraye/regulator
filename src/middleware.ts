import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

/**
 * Page-level access control. API routes check roles themselves (see lib/session.ts),
 * so this only guards dashboard pages and sends people to the right place.
 */
export const pageRoles: [prefix: string, roles: string[]][] = [
  ["/dashboard/instances", ["ADMIN", "SUPERADMIN", "PARTNER_ADMIN"]],
  ["/dashboard/superadmin", ["SUPERADMIN"]],
  ["/dashboard/admin", ["ADMIN", "SUPERADMIN", "PARTNER_ADMIN"]],
  ["/dashboard/panel", ["ADJUDICATOR", "ADMIN", "SUPERADMIN"]],
  ["/dashboard/reports", ["ADJUDICATOR", "ADMIN", "SUPERADMIN", "PARTNER_ADMIN", "COMMITTEE_OBSERVER"]],
  ["/dashboard/evaluator", ["EVALUATOR"]],
  ["/dashboard/innovator", ["INNOVATOR"]],
  ["/dashboard/calls", ["INNOVATOR", "EVALUATOR", "ADJUDICATOR", "ADMIN", "SUPERADMIN", "CONSULTANT", "COMMITTEE_OBSERVER"]],
  ["/dashboard/funded", ["INNOVATOR", "EVALUATOR", "ADJUDICATOR", "ADMIN", "SUPERADMIN", "PARTNER_ADMIN"]],
  ["/dashboard/community", ["INNOVATOR", "EVALUATOR", "ADJUDICATOR", "ADMIN", "SUPERADMIN", "PARTNER_ADMIN", "CONSULTANT", "COMMITTEE_OBSERVER"]],
  ["/dashboard/subscriptions", ["INNOVATOR"]],
  ["/dashboard/profile", ["INNOVATOR"]],
  ["/dashboard/partner", ["PARTNER_ADMIN"]],
  ["/dashboard/consultant", ["CONSULTANT"]],
  ["/dashboard/observer", ["COMMITTEE_OBSERVER"]],
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
