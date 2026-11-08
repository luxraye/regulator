import Link from "next/link";
import { ExternalLink, Pin } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { NOTICE_CATEGORIES, noticeCategory, timeAgo } from "@/lib/community";
import { createNotice, toggleNoticePin } from "@/app/(public)/community/actions";

export const dynamic = "force-dynamic";

export default async function NoticesAdminPage({ searchParams }: { searchParams: { posted?: string; error?: string } }) {
  const notices = await prisma.notice.findMany({ orderBy: [{ pinned: "desc" }, { createdAt: "desc" }], include: { author: { select: { name: true } } } });
  const input = "w-full rounded-lg border border-border bg-white p-2.5 text-sm focus:border-ceda-blue focus:outline-none";

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ceda-navy">Safe practices board</h1>
          <p className="text-sm text-muted-foreground">Post advice for innovators on IP, pitching, contracts and scams. It appears on the public board and in the community sidebar.</p>
        </div>
        <Link href="/community/safe-practices" className="inline-flex items-center gap-1 text-sm font-medium text-ceda-blue hover:underline">
          View the board <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <section className="space-y-3">
          <h2 className="font-semibold text-ceda-navy">{notices.length} notices</h2>
          {notices.map((n) => (
            <div key={n.id} className="flex items-start justify-between gap-4 rounded-xl border border-border bg-white p-4">
              <div className="min-w-0">
                <p className="mb-1 flex flex-wrap items-center gap-2 text-xs">
                  <span className={`rounded px-1.5 py-0.5 font-medium ${noticeCategory(n.category).tone}`}>{noticeCategory(n.category).label}</span>
                  <span className="text-muted-foreground">{n.author?.name ?? "CEDA"} · {timeAgo(n.createdAt)}</span>
                </p>
                <p className="font-medium text-ceda-navy">{n.title}</p>
                <p className="line-clamp-2 text-sm text-muted-foreground">{n.summary}</p>
              </div>
              <form action={toggleNoticePin}>
                <input type="hidden" name="id" value={n.id} />
                <button
                  className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium ${n.pinned ? "border-ceda-orange text-ceda-orange" : "border-border text-muted-foreground hover:text-ceda-navy"}`}
                  title={n.pinned ? "Unpin" : "Pin to the top"}
                >
                  <Pin className="h-3.5 w-3.5" /> {n.pinned ? "Pinned" : "Pin"}
                </button>
              </form>
            </div>
          ))}
        </section>

        <section className="h-fit rounded-xl border border-border bg-ceda-light p-5">
          <h2 className="mb-4 font-semibold text-ceda-navy">Post a notice</h2>
          {searchParams.posted && <p className="mb-3 rounded-lg bg-emerald-50 p-2.5 text-sm text-emerald-800">Posted to the board.</p>}
          {searchParams.error && <p className="mb-3 rounded-lg bg-red-50 p-2.5 text-sm text-red-700">Add a title, a topic and a summary.</p>}
          <form action={createNotice} className="space-y-3">
            <input name="title" required minLength={5} maxLength={140} placeholder="Title" className={input} />
            <select name="category" required className={input} defaultValue="ip">
              {NOTICE_CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
            </select>
            <textarea name="summary" required minLength={10} rows={3} placeholder="What innovators need to know" className={input} />
            <textarea name="dos" rows={3} placeholder={"Do (one per line)"} className={input} />
            <textarea name="donts" rows={3} placeholder={"Avoid (one per line)"} className={input} />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="pinned" /> Pin to the top
            </label>
            <button className="w-full rounded-lg bg-ceda-blue px-4 py-2.5 text-sm font-medium text-white hover:bg-ceda-blue/90">Post notice</button>
          </form>
        </section>
      </div>
    </div>
  );
}
