import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, badRequest, notFound } from "@/lib/session";
import { isEditable, validateFields } from "@/lib/instance-schema";
import { dataHashOf, fieldsToRecord, schemaOf } from "@/lib/instances";
import { signSubmission } from "@/lib/jwt-sign";
import { audit, notifyRoles } from "@/lib/audit";

export const dynamic = "force-dynamic";

/** Lock the instance and issue a signed receipt over its data and file hashes. */
export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const { user, error } = await requireUser(["LICENSEE"]);
  if (error) return error;

  const instance = await prisma.instance.findUnique({
    where: { id: params.id },
    include: { template: true, fields: true, files: { select: { fileKey: true, fileName: true, serverHash: true } } },
  });
  if (!instance || instance.licenseeId !== user.id) return notFound();
  if (!isEditable(instance.status)) return badRequest("This instance has already been submitted");

  const schema = schemaOf(instance.template);
  const fieldErrors = validateFields(schema.fields, fieldsToRecord(instance.fields));
  const missingFiles = schema.required_files
    .filter((rf) => !rf.optional && !instance.files.some((f) => f.fileKey === rf.key))
    .map((rf) => rf.label);

  if (Object.keys(fieldErrors).length || missingFiles.length) {
    return badRequest("The submission is incomplete", { fieldErrors, missingFiles });
  }

  const submittedAt = new Date();
  const submissionNumber = instance.submissionCount + 1;
  const dataHash = dataHashOf(instance.fields);
  const fileHashes = instance.files.map((f) => ({ fileKey: f.fileKey, fileName: f.fileName, hash: f.serverHash }));

  const submissionJwt = signSubmission({
    instanceId: instance.id,
    templateCode: instance.template.code,
    licenseeId: instance.licenseeId,
    licenseeOrg: user.organizationName ?? null,
    submittedAt: submittedAt.toISOString(),
    submissionNumber,
    dataHash,
    fieldCount: instance.fields.length,
    fileHashes,
  });

  // Only move forward if nobody changed the status meanwhile (e.g. a double click).
  const updated = await prisma.instance.updateMany({
    where: { id: instance.id, status: instance.status },
    data: {
      status: "SUBMITTED",
      submittedAt,
      submissionJwt,
      dataHash,
      submissionCount: submissionNumber,
      reviewedAt: null,
      reviewedById: null,
    },
  });
  if (updated.count === 0) return badRequest("This instance was already submitted");

  await audit(user.id, submissionNumber > 1 ? "INSTANCE_RESUBMITTED" : "INSTANCE_SUBMITTED", {
    instanceId: instance.id,
    metadata: { fileCount: fileHashes.length, fieldCount: instance.fields.length, dataHash, submissionNumber },
  });
  await notifyRoles(
    ["ADMIN", "SUPERADMIN"],
    submissionNumber > 1 ? "Resubmission received" : "New submission received",
    `${user.organizationName ?? user.name} submitted ${instance.template.name} (${instance.template.code}).`,
    `/dashboard/admin/instances/${instance.id}`
  );

  return NextResponse.json({ success: true, submissionJwt, dataHash, submittedAt });
}
