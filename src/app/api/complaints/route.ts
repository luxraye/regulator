import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import type { ComplaintStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionUser, requireUser, badRequest, STAFF_ROLES } from "@/lib/session";
import { notifyRoles } from "@/lib/audit";
import { COMPLAINT_STATUSES } from "@/lib/labels";

export const dynamic = "force-dynamic";

function generateTrackingCode(): string {
  const hex = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `BOCRA-${hex.slice(0, 4)}-${hex.slice(4, 8)}`;
}

const clip = (v: unknown, max: number) => (typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null);

/** File a complaint. Works signed in or out, and anonymously. */
export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  const body = await req.json().catch(() => null);
  if (!body) return badRequest("Invalid request");

  const provider = clip(body.provider, 200);
  const category = clip(body.category, 200);
  const description = clip(body.description, 5000);
  const isAnonymous = !!body.isAnonymous;

  if (!provider || !category || !description) {
    return badRequest("Provider, category, and description are required");
  }
  if (description.length < 20) return badRequest("Please describe the problem in at least 20 characters");

  const email = isAnonymous ? null : clip(body.email, 200);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return badRequest("Email address looks invalid");

  let trackingCode = generateTrackingCode();
  while (await prisma.complaint.findUnique({ where: { trackingCode } })) trackingCode = generateTrackingCode();

  const complaint = await prisma.complaint.create({
    data: {
      trackingCode,
      userId: isAnonymous ? null : user?.id ?? null,
      isAnonymous,
      name: isAnonymous ? null : clip(body.name, 200),
      email,
      phone: isAnonymous ? null : clip(body.phone, 50),
      provider,
      category,
      description,
    },
  });

  await notifyRoles(
    ["ADMIN", "SUPERADMIN"],
    "New consumer complaint",
    `${category} against ${provider} (${complaint.trackingCode}).`,
    `/dashboard/admin/complaints?open=${complaint.id}`
  );

  return NextResponse.json({ trackingCode: complaint.trackingCode, id: complaint.id }, { status: 201 });
}

/** Staff list of complaints, with optional ?status= and ?q= filters. */
export async function GET(req: NextRequest) {
  const { error } = await requireUser(STAFF_ROLES);
  if (error) return error;

  const status = req.nextUrl.searchParams.get("status") as ComplaintStatus | null;
  const q = req.nextUrl.searchParams.get("q")?.trim();
  const where: Prisma.ComplaintWhereInput = {};
  if (status && (COMPLAINT_STATUSES as readonly string[]).includes(status)) where.status = status;
  if (q) {
    where.OR = [
      { trackingCode: { contains: q, mode: "insensitive" } },
      { provider: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }

  const complaints = await prisma.complaint.findMany({ where, orderBy: { createdAt: "desc" }, take: 200 });
  return NextResponse.json(complaints);
}
