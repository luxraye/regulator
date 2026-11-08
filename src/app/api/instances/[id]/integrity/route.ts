import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, notFound, STAFF_ROLES } from "@/lib/session";
import { checkIntegrity } from "@/lib/instances";

export const dynamic = "force-dynamic";

/** Re-verify a submitted instance's receipt, data and files. */
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const { user, error } = await requireUser();
  if (error) return error;

  const instance = await prisma.instance.findUnique({ where: { id: params.id }, select: { licenseeId: true } });
  if (!instance) return notFound();
  if (!STAFF_ROLES.includes(user.role) && instance.licenseeId !== user.id) return notFound();

  const report = await checkIntegrity(params.id);
  if (!report) return NextResponse.json({ error: "This instance has not been submitted yet" }, { status: 400 });
  return NextResponse.json(report);
}
