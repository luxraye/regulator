import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminInstancesPage() {
  const instances = await prisma.instance.findMany({
    include: { template: true, licensee: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-bocra-navy">All Instances</h1>
          <p className="text-muted-foreground mt-1">{instances.length} total instances</p>
        </div>
        <Link
          href="/dashboard/admin/provision"
          className="px-4 py-2 bg-bocra-navy text-white rounded-lg text-sm font-medium hover:bg-bocra-navy/90 transition-colors"
        >
          + Provision New
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="px-6 py-3 font-medium text-muted-foreground">Template</th>
              <th className="px-6 py-3 font-medium text-muted-foreground">Licensee</th>
              <th className="px-6 py-3 font-medium text-muted-foreground">Deadline</th>
              <th className="px-6 py-3 font-medium text-muted-foreground">Status</th>
              <th className="px-6 py-3 font-medium text-muted-foreground">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {instances.map((instance) => (
              <tr key={instance.id} className="hover:bg-bocra-light/50">
                <td className="px-6 py-3">
                  <p className="font-medium">{instance.template.name}</p>
                  <p className="text-xs text-muted-foreground">{instance.template.code}</p>
                </td>
                <td className="px-6 py-3">
                  <p>{instance.licensee.organizationName}</p>
                </td>
                <td className="px-6 py-3 text-muted-foreground">
                  {new Date(instance.deadline).toLocaleDateString()}
                </td>
                <td className="px-6 py-3">
                  <StatusBadge status={instance.status} />
                </td>
                <td className="px-6 py-3 text-muted-foreground">
                  {new Date(instance.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
