import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "Tracking code is required" }, { status: 400 });
  }

  const complaint = await prisma.complaint.findUnique({
    where: { trackingCode: code },
    select: {
      trackingCode: true,
      provider: true,
      category: true,
      status: true,
      adminNotes: true,
      createdAt: true,
    },
  });

  if (!complaint) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(complaint);
}
