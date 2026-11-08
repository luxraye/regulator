import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { badRequest, notFound } from "@/lib/session";

export const dynamic = "force-dynamic";

/** Public lookup by tracking code. Never returns the complainant's details. */
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code")?.trim().toUpperCase();
  if (!code) return badRequest("Tracking code is required");

  const complaint = await prisma.complaint.findUnique({
    where: { trackingCode: code },
    select: { trackingCode: true, provider: true, category: true, status: true, adminNotes: true, createdAt: true, updatedAt: true },
  });
  if (!complaint) return notFound("No complaint found with that tracking code");
  return NextResponse.json(complaint);
}
