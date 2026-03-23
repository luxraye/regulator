import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";
import { FileBox, Users, ClipboardCheck, AlertTriangle } from "lucide-react";

export default async function AdminDashboard() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [instanceCount, userCount, recentInstances] = await Promise.all([
    prisma.instance.count(),
    prisma.user.count({ where: { role: "LICENSEE" } }),
    prisma.instance.findMany({
      include: { template: true, licensee: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  const submitted = await prisma.instance.count({ where: { status: "SUBMITTED" } });
  const approved = await prisma.instance.count({ where: { status: "APPROVED" } });
  const flagged = await prisma.instance.count({ where: { status: { in: ["FLAGGED", "REJECTED"] } } });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-bocra-navy">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of regulatory compliance activity
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={<FileBox />} label="Total Instances" value={instanceCount} color="blue" />
        <StatCard icon={<Users />} label="Licensees" value={userCount} color="green" />
        <StatCard icon={<ClipboardCheck />} label="Awaiting Review" value={submitted} color="amber" />
        <StatCard icon={<AlertTriangle />} label="Flagged" value={flagged} color="orange" />
      </div>

      <div className="bg-white rounded-xl border border-border">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-bocra-navy">Recent Instances</h2>
          <span className="text-xs text-muted-foreground">{approved} approved this period</span>
        </div>
        {recentInstances.length === 0 ? (
          <div className="px-6 py-12 text-center text-muted-foreground">
            No instances provisioned yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-6 py-3 font-medium text-muted-foreground">Template</th>
                  <th className="px-6 py-3 font-medium text-muted-foreground">Licensee</th>
                  <th className="px-6 py-3 font-medium text-muted-foreground">Deadline</th>
                  <th className="px-6 py-3 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentInstances.map((instance) => (
                  <tr key={instance.id} className="hover:bg-bocra-light/50">
                    <td className="px-6 py-3">
                      <p className="font-medium">{instance.template.name}</p>
                      <p className="text-xs text-muted-foreground">{instance.template.code}</p>
                    </td>
                    <td className="px-6 py-3">
                      <p>{instance.licensee.name}</p>
                      <p className="text-xs text-muted-foreground">{instance.licensee.organizationName}</p>
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">
                      {new Date(instance.deadline).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3">
                      <StatusBadge status={instance.status} />
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

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  const colorMap: Record<string, string> = {
    blue: "text-bocra-blue bg-bocra-blue/10",
    amber: "text-bocra-amber bg-bocra-amber/10",
    green: "text-bocra-green bg-bocra-green/10",
    orange: "text-bocra-orange bg-bocra-orange/10",
  };
  return (
    <div className="bg-white rounded-xl border border-border p-5">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${colorMap[color]}`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-bocra-navy">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
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
