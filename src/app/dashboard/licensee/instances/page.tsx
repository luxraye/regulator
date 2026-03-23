import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function LicenseeInstancesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = (session.user as any).id;

  const instances = await prisma.instance.findMany({
    where: { licenseeId: userId },
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
                      {new Date(instance.deadline).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={instance.status} />
                    </td>
                    <td className="px-6 py-4">
                      {(instance.status === "PENDING" || instance.status === "IN_PROGRESS") && (
                        <Link
                          href={`/dashboard/licensee/instance-runner/${instance.id}`}
                          className="text-bocra-blue hover:underline text-sm font-medium"
                        >
                          Open Runner
                        </Link>
                      )}
                      {instance.status === "SUBMITTED" && (
                        <span className="text-muted-foreground text-sm">Awaiting review</span>
                      )}
                      {(instance.status === "APPROVED" || instance.status === "FLAGGED" || instance.status === "REJECTED") && (
                        <Link
                          href={`/dashboard/licensee/instance-runner/${instance.id}`}
                          className="text-bocra-blue hover:underline text-sm font-medium"
                        >
                          View Details
                        </Link>
                      )}
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

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    DRAFT: { label: "Draft", className: "bg-gray-100 text-gray-600" },
    PENDING: { label: "Pending", className: "bg-amber-100 text-amber-700" },
    IN_PROGRESS: { label: "In Progress", className: "bg-blue-100 text-blue-700" },
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
