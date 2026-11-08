import { NextRequest, NextResponse } from "next/server";
import type { ComplaintStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser, badRequest, notFound, STAFF_ROLES } from "@/lib/session";
import { audit, notify } from "@/lib/audit";
import { COMPLAINT_STATUSES, complaintStatusMeta } from "@/lib/labels";

export const dynamic = "force-dynamic";

/** Staff update a complaint's status and public notes. */
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { user, error } = await requireUser(STAFF_ROLES);
  if (error) return error;

  const body = await req.json().catch(() => ({}));
  const status = body?.status as ComplaintStatus | undefined;
  const adminNotes = typeof body?.adminNotes === "string" ? body.adminNotes.trim().slice(0, 5000) : undefined;

  if (status && !(COMPLAINT_STATUSES as readonly string[]).includes(status)) return badRequest("Unknown status");
  if (!status && adminNotes === undefined) return badRequest("Nothing to update");

  const existing = await prisma.complaint.findUnique({ where: { id: params.id } });
  if (!existing) return notFound("Complaint not found");

  const updated = await prisma.complaint.update({
    where: { id: params.id },
    data: {
      ...(status ? { status } : {}),
      ...(adminNotes !== undefined ? { adminNotes: adminNotes || null } : {}),
      handledById: user.id,
    },
  });

  await audit(user.id, "COMPLAINT_UPDATED", {
    metadata: { trackingCode: existing.trackingCode, from: existing.status, to: updated.status },
  });

  if (existing.userId && (status !== existing.status || adminNotes !== existing.adminNotes)) {
    await notify(
      existing.userId,
      `Complaint ${existing.trackingCode}: ${complaintStatusMeta[updated.status].label}`,
      updated.adminNotes ?? "BOCRA has updated your complaint.",
      "/dashboard/citizen/complaints"
    );
  }

  return NextResponse.json(updated);
}
