export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function LicenseeHistoryPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = (session.user as any).id;

  const instances = await prisma.instance.findMany({
    where: {
      licenseeId: userId,
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
                      Submitted {instance.submittedAt ? new Date(instance.submittedAt).toLocaleDateString() : "N/A"}
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

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    SUBMITTED: { label: "Submitted", className: "bg-indigo-100 text-indigo-700" },
    APPROVED: { label: "Approved", className: "bg-green-100 text-green-700" },
    FLAGGED: { label: "Flagged", className: "bg-orange-100 text-orange-700" },
    REJECTED: { label: "Rejected", className: "bg-red-100 text-red-700" },
  };
  const s = map[status] || { label: status, className: "bg-gray-100 text-gray-600" };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${s.className}`}>
      {s.label}
    </span>
  );
}
