import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { badRequest, notFound } from "@/lib/session";
import { instanceStatusMeta, JOURNEY } from "@/lib/labels";

export const dynamic = "force-dynamic";

/** Public status lookup by reference code (web and USSD). Never returns personal data. */
export async function GET(req: NextRequest) {
  const ref = req.nextUrl.searchParams.get("ref")?.trim().toUpperCase();
  if (!ref) return badRequest("Reference code is required");

  const inst = await prisma.instance.findUnique({
    where: { referenceCode: ref },
    select: { referenceCode: true, status: true, submittedAt: true, reviewedAt: true, template: { select: { name: true } } },
  });
  if (!inst || inst.status === "DRAFT") return notFound("No submitted idea has that reference");

  const stageIndex = JOURNEY.findIndex((s) => (s.statuses as readonly string[]).includes(inst.status));
  return NextResponse.json({
    referenceCode: inst.referenceCode,
    call: inst.template.name,
    status: instanceStatusMeta[inst.status].label,
    stage: JOURNEY[stageIndex]?.label,
    stageIndex,
    submittedAt: inst.submittedAt,
    updatedAt: inst.reviewedAt ?? inst.submittedAt,
  });
}
