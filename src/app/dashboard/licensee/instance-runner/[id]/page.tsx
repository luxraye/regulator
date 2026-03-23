import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";
import { InstanceRunnerClient } from "./runner-client";

export default async function InstanceRunnerPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const instance = await prisma.instance.findUnique({
    where: { id: params.id },
    include: { template: true, fields: true, files: true },
  });

  if (!instance) redirect("/dashboard/licensee/instances");

  if (instance.licenseeId !== (session.user as any).id) {
    redirect("/dashboard/licensee");
  }

  return (
    <InstanceRunnerClient
      instance={JSON.parse(JSON.stringify(instance))}
    />
  );
}
