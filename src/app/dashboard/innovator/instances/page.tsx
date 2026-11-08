export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/ui/status-badge";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export default async function LicenseeInstancesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = (session.user as any).id;

  const instances = await prisma.instance.findMany({
    where: { innovatorId: userId },
    include: { template: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-bocra-navy">My Instances</h1>
        <p className="text-muted-foreground mt-1">View and interact with your compliance instances</p>
      </div>

      <div className="bg-white rounded-xl border border-border">
        {instances.length === 0 ? (
          <div className="px-6 py-12 text-center text-muted-foreground">
            No instances assigned yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-6 py-3 font-medium text-muted-foreground">Template</th>
                  <th className="px-6 py-3 font-medium text-muted-foreground">Code</th>
                  <th className="px-6 py-3 font-medium text-muted-foreground">Deadline</th>
                  <th className="px-6 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="px-6 py-3 font-medium text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {instances.map((instance) => (
                  <tr key={instance.id} className="hover:bg-bocra-light/50">
                    <td className="px-6 py-4 font-medium">{instance.template.name}</td>
                    <td className="px-6 py-4 text-muted-foreground">{instance.template.code}</td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {formatDate(instance.deadline)}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={instance.status} />
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/dashboard/innovator/instance-runner/${instance.id}`}
                        className={
                          ["PENDING", "IN_PROGRESS", "FLAGGED"].includes(instance.status)
                            ? "inline-block rounded-lg bg-bocra-blue px-3 py-1.5 text-xs font-medium text-white hover:bg-bocra-blue/90"
                            : "text-sm font-medium text-bocra-blue hover:underline"
                        }
                      >
                        {instance.status === "PENDING"
                          ? "Start"
                          : instance.status === "IN_PROGRESS"
                            ? "Continue"
                            : instance.status === "FLAGGED"
                              ? "Fix & resubmit"
                              : "View receipt"}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

