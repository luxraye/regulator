import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { CalendarClock, CheckCircle2, Coins, FileText, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { schemaOf } from "@/lib/instances";
import { sectorName, stageName, typeLabels } from "@/lib/labels";
import { MAX_AGE, MIN_AGE } from "@/lib/eligibility";
import { formatDate, relativeDeadline } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CallDetailPage({ params }: { params: { code: string } }) {
  const call = await prisma.template.findUnique({ where: { code: params.code.toUpperCase() } });
  if (!call || call.status === "DRAFT") notFound();
  const schema = schemaOf(call);
  const open = call.status === "OPEN" && call.closesAt > new Date();
  const closes = relativeDeadline(call.closesAt);

  return (
    <div>
      <section className="relative h-64 sm:h-80">
        <Image src={typeLabels[call.dataType]?.photo ?? "/images/hero.jpg"} alt="" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ceda-ink via-ceda-ink/50 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-5xl px-4 pb-8 text-white sm:px-6">
          <p className="font-mono text-xs text-white/70">{call.code}</p>
          <h1 className="text-3xl font-bold sm:text-4xl">{call.name}</h1>
          <p className="mt-1 text-white/80">{sectorName(call.dataType)} · {stageName(call.scale)} stage</p>
        </div>
      </section>

      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          {call.description && <p className="text-lg leading-relaxed text-muted-foreground">{call.description}</p>}

          <section id="criteria">
            <h2 className="mb-3 text-xl font-semibold text-ceda-ink">How ideas are scored</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              {call.reviewersPerIdea} independent evaluators score each criterion from 1 to 5. Scores are weighted to a total out of 100 and averaged.
            </p>
            <ul className="space-y-3">
              {schema.criteria.map((c) => (
                <li key={c.key} className="rounded-xl border border-border bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium text-ceda-ink">{c.label}</span>
                    <span className="rounded-full bg-ceda-orange/10 px-2.5 py-0.5 text-sm font-semibold text-ceda-orange">{c.weight}%</span>
                  </div>
                  {c.guide && <p className="mt-1 text-sm text-muted-foreground">{c.guide}</p>}
                  <div className="mt-2 h-1.5 rounded-full bg-ceda-sand"><div className="h-1.5 rounded-full bg-ceda-orange" style={{ width: `${c.weight * 2}%` }} /></div>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-ceda-ink">What you&apos;ll be asked</h2>
            <ol className="list-decimal space-y-1 pl-5 text-sm">
              {schema.fields.map((f) => <li key={f.key}>{f.label}</li>)}
            </ol>
          </section>
        </div>

        <aside className="space-y-4">
          <div className="rounded-xl border border-border bg-white p-5">
            <dl className="space-y-3 text-sm">
              <div className="flex gap-2"><CalendarClock size={16} className="mt-0.5 text-ceda-orange" /><div><dt className="text-muted-foreground">Closes</dt><dd className="font-medium">{formatDate(call.closesAt)} {open && <span className="text-xs text-muted-foreground">({closes.text.replace("due ", "")})</span>}</dd></div></div>
              {call.fundingSummary && <div className="flex gap-2"><Coins size={16} className="mt-0.5 text-ceda-green" /><div><dt className="text-muted-foreground">Funding</dt><dd className="font-medium">{call.fundingSummary}</dd></div></div>}
              <div className="flex gap-2"><Users size={16} className="mt-0.5 text-ceda-orange" /><div><dt className="text-muted-foreground">Who can apply</dt><dd className="font-medium">Citizens aged {MIN_AGE}–{MAX_AGE}, through a CIPA-registered company more than 50% youth-owned</dd></div></div>
            </dl>
            {open ? (
              <Link href="/eligibility" className="mt-5 block rounded-lg bg-ceda-amber px-4 py-2.5 text-center font-semibold text-ceda-ink hover:bg-ceda-amber/90">Check eligibility and apply</Link>
            ) : (
              <p className="mt-5 rounded-lg bg-ceda-sand px-4 py-2.5 text-center text-sm text-muted-foreground">This call has closed</p>
            )}
          </div>
          <div className="rounded-xl border border-border bg-white p-5">
            <h3 className="mb-2 flex items-center gap-2 font-semibold text-ceda-ink"><FileText size={16} /> Documents</h3>
            <ul className="space-y-1.5 text-sm">
              {schema.required_files.map((f) => (
                <li key={f.key} className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="mt-0.5 text-ceda-green" />
                  <span>{f.label}{f.optional && <span className="text-muted-foreground"> (optional)</span>}<span className="block text-xs text-muted-foreground">{f.extensions.join(", ")}, up to {f.maxSizeMB} MB</span></span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
