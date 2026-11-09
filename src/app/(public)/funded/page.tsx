import Link from "next/link";
import { Award, Briefcase, MapPin, ShieldCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPula } from "@/lib/utils";
import { fundedShowcase } from "@/lib/funded";
import { BlueBackdrop } from "@/components/home/blue-backdrop";
import { FundedCard } from "@/components/funded/funded-card";

export const metadata = { title: "Funded innovators · CEDA Innovation Portal" };
export const dynamic = "force-dynamic";

export default async function FundedPage() {
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
    <div className="bg-ceda-sand/60">
      <section className="relative overflow-hidden text-white">
        <BlueBackdrop />
        <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-ceda-amber">Recognition</p>
          <h1 className="text-3xl font-bold sm:text-4xl">Funded innovators</h1>
          <p className="mt-3 max-w-2xl text-white/80">
            Young Batswana whose ideas came through screening, blind scoring and the adjudication panel. Every award has a certificate you can check here.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
                <s.icon className="mb-2 h-5 w-5 text-ceda-amber" />
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-white/70">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((f) => <FundedCard key={f.referenceCode} f={f} />)}
        </div>
        <p className="mt-8 rounded-xl border border-border bg-white p-5 text-sm text-muted-foreground">
          Founders choose whether their award is listed here{hidden > 0 ? `, and ${hidden} chose not to be` : ""}. We show the idea&apos;s title and headline numbers only, never the application, so nobody&apos;s plans or IP are exposed.
          {" "}Have an idea of your own? <Link href="/calls" className="font-medium text-ceda-orange hover:underline">See the open calls</Link>.
        </p>
      </div>
    </div>
  );
}
