import Link from "next/link";
import { PenSquare, ShieldAlert, ArrowRight, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { CommunityHeader } from "@/components/community/community-header";
import { ThreadList, type ThreadRow } from "@/components/community/thread-list";
import { forumLabel, initials, noticeCategory, timeAgo } from "@/lib/community";

export const metadata = { title: "Community · CEDA Innovation Portal" };
export const dynamic = "force-dynamic";

export default async function CommunityPage() {
  const [user, threads, notices, members] = await Promise.all([
    getSessionUser(),
    prisma.forumThread.findMany({
      orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
      include: { author: { select: { name: true, organizationName: true, role: true } }, _count: { select: { replies: true } } },
    }),
    prisma.notice.findMany({ where: { pinned: true }, orderBy: { createdAt: "desc" }, take: 3 }),
    prisma.user.count({ where: { role: "INNOVATOR" } }),
  ]);

  const rows: ThreadRow[] = threads.map((t) => ({
    id: t.id,
    title: t.title,
    excerpt: t.body.slice(0, 220),
    category: t.category,
    categoryLabel: forumLabel(t.category),
    pinned: t.pinned,
    author: t.author.name,
    authorOrg: t.author.organizationName,
    authorIsStaff: t.author.role !== "INNOVATOR",
    initials: initials(t.author.name),
    replies: t._count.replies,
    lastActivity: timeAgo(t.updatedAt),
  }));

  return (
    <div className="bg-ceda-light/60">
      <CommunityHeader
        active="forum"
        title="Ask, share, team up"
        subtitle="A forum for young innovators across Botswana. Ask about calls and pitching, share what worked, and find people to build with."
      />
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_300px] lg:px-8">
        <div>
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-ceda-navy">Discussions</h2>
            <Link
              href={user ? "/community/new" : "/login?callbackUrl=/community/new"}
              className="inline-flex items-center gap-2 rounded-lg bg-ceda-blue px-4 py-2 text-sm font-medium text-white hover:bg-ceda-blue/90"
            >
              <PenSquare className="h-4 w-4" /> Start a discussion
            </Link>
          </div>
          <ThreadList threads={rows} />
        </div>

        <aside className="space-y-6">
          <div className="rounded-xl border border-border bg-white p-5">
            <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-ceda-navy">
              <ShieldAlert className="h-4 w-4 text-ceda-orange" /> From the Safe Practices board
            </p>
            <ul className="space-y-3">
              {notices.map((n) => (
                <li key={n.id}>
                  <Link href={`/community/safe-practices#${n.id}`} className="group block">
                    <span className={`mb-1 inline-block rounded px-1.5 py-0.5 text-[11px] font-medium ${noticeCategory(n.category).tone}`}>
                      {noticeCategory(n.category).label}
                    </span>
                    <span className="block text-sm font-medium text-ceda-navy group-hover:underline">{n.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <Link href="/community/safe-practices" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-ceda-blue hover:underline">
              See all advice <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="rounded-xl border border-border bg-white p-5 text-sm text-muted-foreground">
            <p className="mb-2 flex items-center gap-2 font-semibold text-ceda-navy">
              <Users className="h-4 w-4 text-ceda-blue" /> {members} innovators registered
            </p>
            <p className="mb-3">House rules: be kind, keep it about building businesses, and never post Omang numbers, bank details or your full technical design.</p>
            <p>CEDA staff read the forum and answer questions about calls, but forum replies are not official decisions.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
