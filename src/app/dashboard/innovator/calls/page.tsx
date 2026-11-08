import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, ShieldAlert } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { checkEligibility } from "@/lib/eligibility";
import { schemaOf } from "@/lib/instances";
import { CallCard } from "@/components/ideas/call-card";
import { StartApplication } from "@/components/ideas/start-application";
import { StatusBadge } from "@/components/ui/status-badge";

export const dynamic = "force-dynamic";

export default async function OpenCallsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const now = new Date();

  const [calls, mine, profile] = await Promise.all([
    prisma.template.findMany({
      where: { status: "OPEN", opensAt: { lte: now }, closesAt: { gte: now } },
      orderBy: { closesAt: "asc" },
    }),
    prisma.instance.findMany({ where: { innovatorId: user.id }, select: { id: true, templateId: true, status: true } }),
    prisma.user.findUnique({ where: { id: user.id } }),
  ]);
  const elig = checkEligibility({
    omang: profile?.omang,
    dateOfBirth: profile?.dateOfBirth,
    youthShareholding: profile?.youthShareholding,
    hasCompany: !!profile?.licenseNumber,
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ceda-navy">Open calls</h1>
        <p className="mt-1 text-muted-foreground">
          One application per call. Each call is scored against its own published criteria.
        </p>
      </div>

      {!elig.eligible && (
        <div className="mb-6 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm">
          <ShieldAlert size={18} className="shrink-0 text-amber-700" />
          <div>
            <p className="font-medium text-ceda-navy">Your profile doesn&apos;t meet the eligibility rules yet</p>
            <ul className="mt-1 list-disc pl-5 text-muted-foreground">
              {elig.checks.filter((c) => !c.ok).map((c) => <li key={c.key}>{c.label}: {c.detail}</li>)}
            </ul>
          </div>
        </div>
      )}

      {calls.length === 0 ? (
        <p className="rounded-xl border border-border bg-white p-10 text-center text-muted-foreground">No calls are open right now.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {calls.map((c) => {
            const existing = mine.find((m) => m.templateId === c.id);
            const criteria = schemaOf(c).criteria;
            return (
              <CallCard
                key={c.id}
                call={c}
                footer={
                  criteria.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {criteria.map((k) => (
                        <span key={k.key} className="rounded bg-ceda-light px-1.5 py-0.5 text-[11px] text-muted-foreground">
                          {k.label} {k.weight}%
                        </span>
                      ))}
                    </div>
                  )
                }
                action={
                  existing ? (
                    <div className="flex items-center justify-between gap-2">
                      <StatusBadge status={existing.status} />
                      <Link href={`/dashboard/innovator/instance-runner/${existing.id}`} className="inline-flex items-center gap-1 text-sm font-medium text-ceda-blue hover:underline">
                        {existing.status === "DRAFT" ? "Continue" : "View"} <ArrowRight size={14} />
                      </Link>
                    </div>
                  ) : elig.eligible ? (
                    <StartApplication templateId={c.id} callName={c.name} />
                  ) : null
                }
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
