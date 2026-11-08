export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/ui/status-badge";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export default async function LicenseeHistoryPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = (session.user as any).id;

  const instances = await prisma.instance.findMany({
    where: {
      innovatorId: userId,
      status: { in: ["SUBMITTED", "APPROVED", "FLAGGED", "REJECTED"] },
    },
    include: { template: true },
    orderBy: { submittedAt: "desc" },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-bocra-navy">Submission History</h1>
        <p className="text-muted-foreground mt-1">Past submissions and their review outcomes</p>
      </div>

      <div className="bg-white rounded-xl border border-border">
        {instances.length === 0 ? (
          <div className="px-6 py-12 text-center text-muted-foreground">
            No submission history yet.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {instances.map((instance) => (
              <div key={instance.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{instance.template.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Submitted {formatDate(instance.submittedAt)} ·{" "}
                      <Link href={`/dashboard/innovator/instance-runner/${instance.id}`} className="text-bocra-blue hover:underline">
                        View receipt
                      </Link>
                    </p>
                  </div>
                  <StatusBadge status={instance.status} />
                </div>
                {instance.reviewNotes && (
                  <p className="mt-2 text-sm text-muted-foreground bg-bocra-light p-3 rounded-lg">
                    <span className="font-medium">Review notes:</span> {instance.reviewNotes}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

