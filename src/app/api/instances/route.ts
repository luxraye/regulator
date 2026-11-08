import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, STAFF_ROLES } from "@/lib/session";

export const dynamic = "force-dynamic";

const listSelect = {
  id: true,
  status: true,
  deadline: true,
  createdAt: true,
  submittedAt: true,
  reviewedAt: true,
  submissionCount: true,
  template: { select: { id: true, code: true, name: true } },
  licensee: { select: { id: true, name: true, organizationName: true } },
} as const;

export async function GET() {
  const { user, error } = await requireUser();
  if (error) return error;

  const where = STAFF_ROLES.includes(user.role) ? {} : { licenseeId: user.id };
  const instances = await prisma.instance.findMany({ where, select: listSelect, orderBy: { createdAt: "desc" } });
  return NextResponse.json(instances);
}
