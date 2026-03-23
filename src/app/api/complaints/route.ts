import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export const dynamic = "force-dynamic";

function generateTrackingCode(): string {
  const hex = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `BOCRA-${hex.slice(0, 4)}-${hex.slice(4, 8)}`;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  const body = await req.json();

  const { provider, category, description, isAnonymous, name, email, phone } = body;

  if (!provider || !category || !description) {
    return NextResponse.json(
      { error: "Provider, category, and description are required" },
      { status: 400 }
    );
  }

  let trackingCode = generateTrackingCode();

  // Ensure uniqueness
  let exists = await prisma.complaint.findUnique({ where: { trackingCode } });
  while (exists) {
    trackingCode = generateTrackingCode();
    exists = await prisma.complaint.findUnique({ where: { trackingCode } });
  }

  const complaint = await prisma.complaint.create({
    data: {
      trackingCode,
      userId: isAnonymous ? null : (session?.user as any)?.id || null,
      isAnonymous: !!isAnonymous,
      name: isAnonymous ? null : name || null,
      email: isAnonymous ? null : email || null,
      phone: isAnonymous ? null : phone || null,
      provider,
      category,
      description,
    },
  });

  return NextResponse.json(
    { trackingCode: complaint.trackingCode, id: complaint.id },
    { status: 201 }
  );
}
