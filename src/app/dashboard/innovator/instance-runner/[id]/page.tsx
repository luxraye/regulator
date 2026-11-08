import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { fileMetaSelect, schemaOf } from "@/lib/instances";
import { InstanceRunnerClient } from "./runner-client";

export const dynamic = "force-dynamic";

export default async function InstanceRunnerPage({ params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const instance = await prisma.instance.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      status: true,
      deadline: true,
      reviewNotes: true,
      reviewedAt: true,
      submittedAt: true,
      submissionJwt: true,
      dataHash: true,
      submissionCount: true,
      innovatorId: true,
      template: true,
      fields: { select: { fieldKey: true, fieldValue: true } },
      files: { select: fileMetaSelect },
    },
  });

  if (!instance || instance.innovatorId !== user.id) notFound();

  const { template, ...rest } = instance;
  delete (rest as { innovatorId?: string }).innovatorId;
  return (
    <InstanceRunnerClient
      instance={JSON.parse(
        JSON.stringify({
          ...rest,
          template: { name: template.name, code: template.code, description: template.description, schema: schemaOf(template) },
        })
      )}
    />
  );
}
