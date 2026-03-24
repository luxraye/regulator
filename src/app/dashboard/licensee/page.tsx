export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { FileBox, Clock, CheckCircle2, AlertTriangle } from "lucide-react";

export default async function LicenseeDashboard() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = (session.user as any).id;

  const instances = await prisma.instance.findMany({
    where: { licenseeId: userId },
    include: { template: true },
    orderBy: { createdAt: "desc" },
  });

  const stats = {
    total: instances.length,
    pending: instances.filter((i) => i.status === "PENDING" || i.status === "IN_PROGRESS").length,
    submitted: instances.filter((i) => i.status === "SUBMITTED").length,
    approved: instances.filter((i) => i.status === "APPROVED").length,
    flagged: instances.filter((i) => i.status === "FLAGGED" || i.status === "REJECTED").length,
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-bocra-navy">
          Welcome, {session.user.name}
        </h1>
        <p className="text-muted-foreground mt-1">
          {(session.user as any).organizationName} &mdash; Licensee Dashboard
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={<FileBox />} label="Total Instances" value={stats.total} color="blue" />
        <StatCard icon={<Clock />} label="Pending" value={stats.pending} color="amber" />
        <StatCard icon={<CheckCircle2 />} label="Approved" value={stats.approved} color="green" />
        <StatCard icon={<AlertTriangle />} label="Flagged" value={stats.flagged} color="orange" />
      </div>

      <div className="bg-white rounded-xl border border-border">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-bocra-navy">Recent Instances</h2>
        </div>
        {instances.length === 0 ? (
          <div className="px-6 py-12 text-center text-muted-foreground">
            No instances assigned yet. BOCRA will provision instances for your organization.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {instances.slice(0, 5).map((instance) => (
              <div key={instance.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{instance.template.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {instance.template.code} &middot; Due {new Date(instance.deadline).toLocaleDateString()}
                  </p>
                </div>
                <StatusBadge status={instance.status} />
              </div>
            ))}
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
