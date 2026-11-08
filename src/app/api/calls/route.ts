import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sectorName, stageName } from "@/lib/labels";

export const dynamic = "force-dynamic";

/** Public list of open calls. */
export async function GET() {
  const now = new Date();
  const calls = await prisma.template.findMany({
    where: { status: "OPEN", opensAt: { lte: now }, closesAt: { gte: now } },
    orderBy: { closesAt: "asc" },
    select: { code: true, name: true, closesAt: true, fundingSummary: true, dataType: true, scale: true },
  });
  return NextResponse.json(
    calls.map((c) => ({ ...c, sector: sectorName(c.dataType), stage: stageName(c.scale) }))
  );
}
