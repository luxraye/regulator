import Link from "next/link";
import { Check, Pin, X } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { CommunityHeader } from "@/components/community/community-header";
import { NOTICE_CATEGORIES, lines, noticeCategory, timeAgo } from "@/lib/community";

export const metadata = { title: "Safe practices · CEDA Innovation Portal" };
export const dynamic = "force-dynamic";

export default async function SafePracticesPage() {
  const notices = await prisma.notice.findMany({
    orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
    include: { author: { select: { name: true } } },
  });
  const pinned = notices.filter((n) => n.pinned);
  const byCat = NOTICE_CATEGORIES.map((c) => ({ ...c, items: notices.filter((n) => n.category === c.key && !n.pinned) })).filter((c) => c.items.length);

  const Card = ({ n }: { n: (typeof notices)[number] }) => {
    const cat = noticeCategory(n.category);
    const dos = lines(n.dos);
    const donts = lines(n.donts);
    return (
      <article id={n.id} className="scroll-mt-28 rounded-xl border border-border bg-white p-5 shadow-sm">
        <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
          {n.pinned && (
            <span className="inline-flex items-center gap-1 font-medium text-ceda-orange">
              <Pin className="h-3 w-3" /> Pinned
            </span>
          )}
          <span className={`rounded px-1.5 py-0.5 font-medium ${cat.tone}`}>{cat.label}</span>
          <span className="text-muted-foreground">
            {n.author ? `${n.author.name} · ` : ""}
            {timeAgo(n.createdAt)}
          </span>
        </div>
        <h3 className="mb-2 font-semibold text-ceda-navy">{n.title}</h3>
        <p className="mb-4 text-sm leading-relaxed text-muted-foreground">{n.summary}</p>
        {(dos.length > 0 || donts.length > 0) && (
          <div className="grid gap-3 sm:grid-cols-2">
            {dos.length > 0 && (
              <ul className="space-y-1.5 rounded-lg bg-emerald-50 p-3 text-sm">
                {dos.map((d) => (
                  <li key={d} className="flex gap-2 text-emerald-900">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> {d}
                  </li>
                ))}
              </ul>
            )}
            {donts.length > 0 && (
              <ul className="space-y-1.5 rounded-lg bg-red-50 p-3 text-sm">
                {donts.map((d) => (
                  <li key={d} className="flex gap-2 text-red-900">
                    <X className="mt-0.5 h-4 w-4 shrink-0 text-red-600" /> {d}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </article>
    );
  };

  return (
    <div className="bg-ceda-light/60">
      <CommunityHeader
        active="safe"
        title="Safe practices"
        subtitle="Advice from CEDA on protecting your idea, pitching well and avoiding common traps. Read it before you share your work."
      />
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <nav className="mb-8 flex flex-wrap gap-2" aria-label="Jump to a topic">
          {byCat.map((c) => (
            <a key={c.key} href={`#topic-${c.key}`} className={`rounded-full px-3 py-1.5 text-sm font-medium ${c.tone}`}>
              {c.label}
            </a>
          ))}
        </nav>

        {pinned.length > 0 && (
          <section className="mb-12">
            <h2 className="mb-4 text-xl font-semibold text-ceda-navy">Read these first</h2>
            <div className="grid gap-5 lg:grid-cols-2">
              {pinned.map((n) => <Card key={n.id} n={n} />)}
            </div>
          </section>
        )}

        {byCat.map((c) => (
          <section key={c.key} id={`topic-${c.key}`} className="mb-12 scroll-mt-28">
            <h2 className="mb-4 text-xl font-semibold text-ceda-navy">{c.label}</h2>
            <div className="grid gap-5 lg:grid-cols-2">
              {c.items.map((n) => <Card key={n.id} n={n} />)}
            </div>
          </section>
        ))}

        <p className="rounded-xl border border-border bg-white p-5 text-sm text-muted-foreground">
          This board is general guidance, not legal advice. For a patent, trademark or contract question, speak to a registered IP agent or a lawyer.
          Have a question about it? <Link href="/community" className="font-medium text-ceda-blue hover:underline">Ask in the forum</Link>.
        </p>
      </div>
    </div>
  );
}
