import Link from "next/link";
import { ArrowRight, Layers, Scale } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { schemaOf } from "@/lib/instances";
import { CallCard } from "@/components/ideas/call-card";

export const dynamic = "force-dynamic";
export const metadata = { title: "Calls & rubrics · CEDA Innovation Portal" };

export default async function DashboardCallsAndRubricsPage() {
  const now = new Date();
  const [open, closed] = await Promise.all([
    prisma.template.findMany({
      where: { status: "OPEN", opensAt: { lte: now }, closesAt: { gte: now } },
      orderBy: { closesAt: "asc" },
    }),
    prisma.template.findMany({
      where: { OR: [{ status: "CLOSED" }, { closesAt: { lt: now } }] },
      orderBy: { closesAt: "desc" },
      take: 4,
    }),
  ]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ceda-navy">Calls &amp; scoring rubrics</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Active funding calls, eligibility scope, and the published criterion weights used during blind evaluation.
          </p>
        </div>
        <Link
          href="/eligibility"
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-3.5 py-2 text-xs font-medium text-ceda-navy hover:bg-ceda-light"
        >
          <Scale size={14} className="text-ceda-blue" /> Public eligibility rules
        </Link>
      </div>

      {open.length === 0 ? (
        <p className="rounded-xl border border-border bg-white p-10 text-center text-muted-foreground">
          No calls are open right now.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {open.map((c) => {
            const criteria = schemaOf(c).criteria;
            return (
              <CallCard
                key={c.id}
                call={c}
                footer={
                  criteria.length > 0 && (
                    <div className="mt-3">
                      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Scoring rubric weights
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {criteria.map((k) => (
                          <span
                            key={k.key}
                            className="rounded bg-ceda-light px-1.5 py-0.5 text-[11px] font-medium text-ceda-navy"
                          >
                            {k.label} · {k.weight}%
                          </span>
                        ))}
                      </div>
                    </div>
                  )
                }
                action={
                  <Link
                    href={`/calls/${c.code}`}
                    className="inline-flex items-center gap-1 text-sm font-medium text-ceda-blue hover:underline"
                  >
                    Full call specification <ArrowRight size={14} />
                  </Link>
                }
              />
            );
          })}
        </div>
      )}

      {closed.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-ceda-navy">
            <Layers size={18} className="text-muted-foreground" /> Recently closed calls
          </h2>
          <div className="grid grid-cols-1 gap-6 opacity-85 md:grid-cols-2 xl:grid-cols-3">
            {closed.map((c) => {
              const criteria = schemaOf(c).criteria;
              return (
                <CallCard
                  key={c.id}
                  call={c}
                  footer={
                    criteria.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {criteria.map((k) => (
                          <span
                            key={k.key}
                            className="rounded bg-ceda-light px-1.5 py-0.5 text-[11px] text-muted-foreground"
                          >
                            {k.label} {k.weight}%
                          </span>
                        ))}
                      </div>
                    )
                  }
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
