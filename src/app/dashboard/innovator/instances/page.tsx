import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Lightbulb } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { StatusBadge } from "@/components/ui/status-badge";
import { JourneyTracker } from "@/components/ideas/journey-tracker";
import { formatDate, formatPula } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function MyIdeasPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const ideas = await prisma.instance.findMany({
    where: { innovatorId: user.id },
    select: {
      id: true, title: true, referenceCode: true, status: true, submittedAt: true, createdAt: true, awardAmount: true,
      template: { select: { name: true, closesAt: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ceda-ink">My ideas</h1>
          <p className="mt-1 text-muted-foreground">Every application you have started, and where it is now.</p>
        </div>
        <Link href="/dashboard/innovator/calls" className="inline-flex items-center gap-1 rounded-lg bg-ceda-orange px-4 py-2 text-sm font-medium text-white">
          Browse open calls <ArrowRight size={15} />
        </Link>
      </div>

      {ideas.length === 0 ? (
        <div className="rounded-xl border border-border bg-white px-6 py-14 text-center">
          <Lightbulb className="mx-auto mb-2 text-ceda-amber" />
          <p className="font-medium text-ceda-ink">No ideas yet</p>
          <p className="text-sm text-muted-foreground">Pick an open call and start your first application.</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {ideas.map((i) => (
            <li key={i.id}>
              <Link href={`/dashboard/innovator/instance-runner/${i.id}`} className="group block rounded-xl border border-border bg-white p-5 transition-shadow hover:shadow-md">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono text-[11px] text-muted-foreground">{i.referenceCode}</p>
                    <p className="font-semibold text-ceda-ink group-hover:text-ceda-orange">{i.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {i.template.name} · {i.submittedAt ? `submitted ${formatDate(i.submittedAt)}` : `started ${formatDate(i.createdAt)}, call closes ${formatDate(i.template.closesAt)}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {i.status === "AWARDED" && <span className="text-sm font-bold text-ceda-green">{formatPula(i.awardAmount)}</span>}
                    <StatusBadge status={i.status} />
                  </div>
                </div>
                <div className="mt-4 max-w-xl">
                  <JourneyTracker status={i.status} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
