import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { DATA_TYPES, SCALES, scaleLabels, typeLabels } from "@/lib/labels";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

/** Sector × venture stage: where CEDA has calls, and where ideas are coming from. */
export default async function MatrixPage() {
  const calls = await prisma.template.findMany({
    include: { entries: { where: { status: { not: "DRAFT" } }, select: { status: true } } },
  });
  const cell = (dt: string, sc: string) => calls.filter((c) => c.dataType === dt && c.scale === sc);
  const max = Math.max(1, ...calls.map((c) => c.entries.length));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ceda-ink">Sector matrix</h1>
        <p className="mt-1 text-muted-foreground">
          {DATA_TYPES.length} priority sectors &times; {SCALES.length} venture stages. Each call sits in one cell; shading shows how many ideas it drew.
          Empty cells are gaps in CEDA&apos;s pipeline.
        </p>
      </div>

      <div className="mb-6 overflow-x-auto rounded-xl border border-border bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="min-w-[200px] px-4 py-3 text-left font-medium text-muted-foreground">Sector / stage</th>
              {SCALES.map((sc) => (
                <th key={sc} className="min-w-[120px] px-3 py-3 text-center text-xs font-medium text-muted-foreground">{scaleLabels[sc]}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {DATA_TYPES.map((dt) => (
              <tr key={dt}>
                <td className="px-4 py-3 font-medium">{typeLabels[dt].full}</td>
                {SCALES.map((sc) => {
                  const here = cell(dt, sc);
                  return (
                    <td key={sc} className="px-2 py-2 text-center align-top">
                      {here.length === 0 ? (
                        <span className="text-xs text-muted-foreground/40">·</span>
                      ) : (
                        here.map((c) => {
                          const n = c.entries.length;
                          const shade = n / max;
                          return (
                            <Link
                              key={c.id}
                              href={`/dashboard/admin/instances?filter=all&call=${c.code}`}
                              className={cn("mb-1 block rounded-lg p-2 transition-shadow hover:shadow", shade > 0.6 ? "bg-ceda-orange text-white" : shade > 0.3 ? "bg-ceda-orange/30" : "bg-ceda-orange/10")}
                            >
                              <span className="block font-mono text-xs font-bold">{c.code}</span>
                              <span className="text-[11px] opacity-80">{n} ideas · {c.status.toLowerCase()}</span>
                            </Link>
                          );
                        })
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
        <p className="mb-1 font-medium">Why a matrix?</p>
        <p className="text-xs">
          A cash grant suits an idea-stage founder; a growth-stage venture needs a loan and market access. Placing each call on sector and stage lets CEDA see at a glance
          which parts of the economy its innovation money is reaching, in line with economic diversification goals.
        </p>
      </div>
    </div>
  );
}
