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
  const { user, error } = await requireUser(["INNOVATOR"]);
  if (error) return error;

  const instance = await prisma.entry.findUnique({
    where: { id: params.id },
    include: { template: true, fields: true, files: { select: { fileKey: true, fileName: true, serverHash: true } } },
  });
  if (!instance || instance.innovatorId !== user.id) return notFound();
  if (!isEditable(instance.status)) return badRequest("This idea has already been submitted");
  // First submissions must arrive while the call is open; a resubmission after feedback may come later.
  if (instance.status === "DRAFT" && instance.template && instance.template.closesAt < new Date()) {
    return badRequest("This call closed before the idea was submitted");
  }

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
    referenceCode: instance.referenceCode,
    title: instance.title,
    templateCode: instance.template?.code ?? "",
    innovatorId: instance.innovatorId,
    innovatorOrg: user.organizationName ?? null,
    submittedAt: submittedAt.toISOString(),
    submissionNumber,
    dataHash,
    fieldCount: instance.fields.length,
    fileHashes,
  });

  // Only move forward if nobody changed the status meanwhile (e.g. a double click).
  const updated = await prisma.entry.updateMany({
    where: { id: instance.id, status: instance.status },
    data: {
      status: "SUBMITTED",
      submittedAt,
      submissionJwt,
      dataHash,
      submissionCount: submissionNumber,
      reviewedAt: null,
      reviewedById: null,
      reviewNotes: instance.status === "FLAGGED" ? instance.reviewNotes : null,
    },
  });
  if (updated.count === 0) return badRequest("This idea was already submitted");

  await audit(user.id, submissionNumber > 1 ? "IDEA_RESUBMITTED" : "IDEA_SUBMITTED", {
    entryId: instance.id,
    instanceId: instance.instanceId,
    metadata: { fileCount: fileHashes.length, fieldCount: instance.fields.length, dataHash, submissionNumber },
  });
  await notifyRoles(
    ["ADMIN", "SUPERADMIN"],
    submissionNumber > 1 ? "Idea resubmitted after feedback" : "New idea submitted",
    `${instance.referenceCode} "${instance.title}" was submitted to ${instance.template?.name ?? "CEDA Innovation Call"}.`,
    `/dashboard/admin/instances/${instance.id}`
  );

  return NextResponse.json({ success: true, submissionJwt, dataHash, submittedAt });
}
