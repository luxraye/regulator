import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { audit } from "@/lib/audit";

export const dynamic = "force-dynamic";

/**
 * Data Protection Act 2024: a data subject may get a copy of the personal data held about them.
 * Returns everything linked to the signed-in account as a JSON download.
 */
export async function GET() {
  const { user, error } = await requireUser();
  if (error) return error;

  const data = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      name: true, email: true, phone: true, role: true, omang: true, dateOfBirth: true, gender: true, district: true,
      organizationName: true, licenseNumber: true, youthShareholding: true, consentAt: true, createdAt: true,
      entries: {
        select: {
          referenceCode: true, title: true, status: true, submittedAt: true, reviewNotes: true, awardAmount: true,
          template: { select: { code: true, name: true } },
          fields: { select: { fieldKey: true, fieldValue: true } },
          files: { select: { fileName: true, fileSize: true, serverHash: true, uploadedAt: true } },
        },
      },
      notifications: { select: { title: true, body: true, createdAt: true } },
    },
  });
  await audit(user.id, "DATA_EXPORTED");

  return new NextResponse(JSON.stringify({ exportedAt: new Date().toISOString(), ...data }, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": 'attachment; filename="my-ceda-portal-data.json"',
      "Cache-Control": "no-store",
    },
  });
}
