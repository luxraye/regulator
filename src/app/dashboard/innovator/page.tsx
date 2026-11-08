import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertTriangle, ArrowRight, CheckCircle2, Clock, FileBox, FlaskConical } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn, formatDate, relativeDeadline } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function LicenseeDashboard() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const instances = await prisma.instance.findMany({
    where: { innovatorId: user.id },
    select: { id: true, status: true, deadline: true, reviewNotes: true, template: { select: { name: true, code: true } } },
    orderBy: { deadline: "asc" },
  });

  const todo = instances.filter((i) => ["PENDING", "IN_PROGRESS", "FLAGGED"].includes(i.status));
  const count = (...s: string[]) => instances.filter((i) => s.includes(i.status)).length;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-bocra-navy">Dumela, {user.name.split(" ")[0]}</h1>
        <p className="mt-1 text-muted-foreground">{user.organizationName} · compliance reporting</p>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat icon={<Clock />} label="To do" value={todo.length} tone="amber" />
        <Stat icon={<FileBox />} label="With BOCRA" value={count("SUBMITTED")} tone="blue" />
        <Stat icon={<CheckCircle2 />} label="Approved" value={count("APPROVED")} tone="green" />
        <Stat icon={<AlertTriangle />} label="Needs changes" value={count("FLAGGED")} tone="orange" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-white lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="font-semibold text-bocra-navy">What&apos;s due</h2>
            <Link href="/dashboard/innovator/instances" className="text-sm font-medium text-bocra-blue hover:underline">All instances</Link>
          </div>
          {todo.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <CheckCircle2 className="mx-auto mb-2 text-bocra-green" />
              <p className="font-medium text-bocra-navy">Nothing due</p>
              <p className="text-sm text-muted-foreground">BOCRA will notify you when a new instance is issued.</p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {todo.map((i) => {
                const d = relativeDeadline(i.deadline);
                return (
                  <li key={i.id}>
                    <Link href={`/dashboard/innovator/instance-runner/${i.id}`} className="group flex items-center justify-between gap-3 px-5 py-4 hover:bg-bocra-light/60">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{i.template.name}</p>
                        <p className="text-xs text-muted-foreground">
                          <span className="font-mono">{i.template.code}</span> · due {formatDate(i.deadline)}{" "}
                          <span className={cn(d.overdue ? "text-red-600" : d.soon ? "text-amber-700" : "")}>({d.text})</span>
                        </p>
                        {i.status === "FLAGGED" && i.reviewNotes && (
                          <p className="mt-1 line-clamp-1 text-xs text-orange-700">BOCRA: {i.reviewNotes}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={i.status} />
                        <ArrowRight size={16} className="text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <Link href="/dashboard/innovator/playground" className="group rounded-xl border border-border bg-gradient-to-br from-bocra-navy to-bocra-blue p-6 text-white">
          <FlaskConical className="mb-3" />
          <h2 className="font-semibold">Practice in the playground</h2>
          <p className="mt-1 text-sm text-white/80">
            Try a sandbox instance, see how validation and file hashing work, and nothing is sent to BOCRA.
          </p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium">
            Open playground <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>
      </div>
    </div>
  );
}

function Stat({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: number; tone: string }) {
  const tones: Record<string, string> = {
    blue: "text-bocra-blue bg-bocra-blue/10",
    amber: "text-amber-600 bg-amber-100",
    green: "text-bocra-green bg-bocra-green/10",
    orange: "text-bocra-orange bg-bocra-orange/10",
  };
  return (
    <div className="rounded-xl border border-border bg-white p-4">
      <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg [&>svg]:h-5 [&>svg]:w-5 ${tones[tone]}`}>{icon}</div>
      <p className="text-2xl font-bold text-bocra-navy">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
