import { Award, Briefcase, MapPin, ShieldCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPula } from "@/lib/utils";
import { fundedShowcase } from "@/lib/funded";
import { FundedCard } from "@/components/funded/funded-card";

export const metadata = { title: "Funded showcase · CEDA Innovation Portal" };
export const dynamic = "force-dynamic";

export default async function DashboardFundedShowcasePage() {
  const [items, all] = await Promise.all([
    fundedShowcase(),
    prisma.instance.aggregate({ where: { status: "AWARDED" }, _sum: { awardAmount: true }, _count: true }),
  ]);
  const jobs = items.reduce((n, f) => n + (f.jobs ?? 0), 0);
  const districts = new Set(items.map((f) => f.innovator.district).filter(Boolean)).size;
  const hidden = all._count - items.length;

  const stats = [
    { icon: Award, label: "Ideas funded", value: String(all._count) },
    { icon: ShieldCheck, label: "Awarded in total", value: formatPula(all._sum.awardAmount ?? 0) },
    { icon: Briefcase, label: "Jobs planned (listed)", value: String(jobs) },
    { icon: MapPin, label: "Districts (listed)", value: String(districts) },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ceda-navy">Funded innovators showcase</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Young Batswana whose ideas came through screening, blind scoring, and the adjudication panel. Every award includes a verifiable QR certificate.
        </p>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-white p-4">
            <s.icon className="mb-2 h-5 w-5 text-ceda-blue" />
            <p className="text-2xl font-bold text-ceda-navy">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((f) => (
          <FundedCard key={f.referenceCode} f={f} />
        ))}
      </div>

      <p className="mt-8 rounded-xl border border-border bg-white p-5 text-sm text-muted-foreground">
        Founders choose whether their award is listed here{hidden > 0 ? `, and ${hidden} chose not to be` : ""}. Only the idea&apos;s title and headline impact metrics are shown publicly so no applicant&apos;s commercial plans or IP are exposed.
      </p>
    </div>
  );
}
