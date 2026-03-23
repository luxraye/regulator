import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const protectedRoutes: Record<string, string[]> = {
  "/dashboard/admin": ["ADMIN", "SUPERADMIN"],
  "/dashboard/superadmin": ["SUPERADMIN"],
  "/dashboard/licensee": ["LICENSEE"],
  "/dashboard/citizen": ["PUBLIC"],
};

const protectedApiRoutes: Record<string, string[]> = {
  "/api/instances/provision": ["ADMIN", "SUPERADMIN"],
  "/api/templates": ["SUPERADMIN"],
  "/api/dashboard": ["ADMIN", "SUPERADMIN"],
  "/api/users": ["SUPERADMIN"],
  "/api/bookmarks": ["PUBLIC"],
  "/api/starred-events": ["PUBLIC"],
};

export default auth((req) => {
  const { pathname } = req.nextUrl;

  const isProtected =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/api/instances") ||
    pathname.startsWith("/api/templates") ||
    pathname.startsWith("/api/dashboard") ||
    pathname.startsWith("/api/users") ||
    pathname.startsWith("/api/upload") ||
    pathname.startsWith("/api/bookmarks") ||
    pathname.startsWith("/api/starred-events");

  if (isProtected) {
    if (!req.auth) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const userRole = (req.auth.user as any)?.role;

    for (const [route, roles] of Object.entries(protectedRoutes)) {
      if (pathname.startsWith(route) && !roles.includes(userRole)) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    for (const [route, roles] of Object.entries(protectedApiRoutes)) {
      if (pathname.startsWith(route) && !roles.includes(userRole)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/instances/:path*",
    "/api/templates/:path*",
    "/api/dashboard/:path*",
    "/api/users/:path*",
    "/api/upload/:path*",
    "/api/bookmarks/:path*",
    "/api/starred-events/:path*",
  ],
};
