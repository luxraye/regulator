import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { StudioBuilder } from "@/components/instance-studio/studio-builder";
import type { InstanceDefinition } from "@/lib/instance-engine/types";

interface EditPageProps {
  params: { id: string };
}

export const metadata = {
  title: "Instance Studio | CEDA",
};

export default async function EditInstancePage({ params }: EditPageProps) {
  const user = await getSessionUser();
  if (!user || !["ADMIN", "SUPERADMIN", "PARTNER_ADMIN"].includes(user.role)) {
    redirect("/dashboard");
  }

  const { id } = params;

  const instance = await prisma.instance.findUnique({
    where: { id },
    include: {
      versions: {
        orderBy: { version: "desc" },
        take: 1,
      },
    },
  });

  if (!instance) {
    notFound();
  }

  const definition = instance.definition as unknown as InstanceDefinition;
  const currentVersion = instance.versions[0]?.version ?? 1;

  return (
    <StudioBuilder
      initialDefinition={definition}
      instanceId={instance.id}
      isExisting={true}
      status={instance.status}
      currentRulesHash={instance.rulesHash}
      version={currentVersion}
    />
  );
}
