import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, ArrowRight, Award, Check, PenSquare, Pin, ShieldAlert, Users, X } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { CommunityHeader } from "@/components/community/community-header";
import { ThreadList, type ThreadRow } from "@/components/community/thread-list";
import { FORUM_CATEGORIES, NOTICE_CATEGORIES, forumLabel, initials, lines, noticeCategory, timeAgo } from "@/lib/community";
import { createThread, replyToThread } from "@/app/(public)/community/actions";

export async function CommunityForumView({
  basePath = "/community",
  inDashboard = false,
}: {
  basePath?: string;
  inDashboard?: boolean;
}) {
  const [user, threads, notices, members] = await Promise.all([
    getSessionUser(),
    prisma.forumThread.findMany({
      orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
      include: { author: { select: { name: true, organizationName: true, role: true, instances: { where: { status: "AWARDED", showcase: true }, select: { id: true }, take: 1 } } }, _count: { select: { replies: true } } },
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
    authorFunded: t.author.instances.length > 0,
    initials: initials(t.author.name),
    replies: t._count.replies,
    lastActivity: timeAgo(t.updatedAt),
  }));

  return (
    <div className={inDashboard ? "overflow-hidden rounded-2xl border border-border bg-white/60" : "bg-ceda-sand/60"}>
      <CommunityHeader
        active="forum"
        basePath={basePath}
        inDashboard={inDashboard}
        title="Ask, share, team up"
        subtitle="A forum for young innovators across Botswana. Ask about calls and pitching, share what worked, and find people to build with."
      />
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_300px] lg:px-8">
        <div>
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-ceda-ink">Discussions</h2>
            <Link
              href={user ? `${basePath}/new` : `/login?callbackUrl=${encodeURIComponent(`${basePath}/new`)}`}
              className="inline-flex items-center gap-2 rounded-lg bg-ceda-orange px-4 py-2 text-sm font-medium text-white hover:bg-ceda-orange/90"
            >
              <PenSquare className="h-4 w-4" /> Start a discussion
            </Link>
          </div>
          <ThreadList threads={rows} basePath={basePath} />
        </div>

        <aside className="space-y-6">
          <div className="rounded-xl border border-border bg-white p-5">
            <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-ceda-ink">
              <ShieldAlert className="h-4 w-4 text-ceda-orange" /> From the Safe Practices board
            </p>
            <ul className="space-y-3">
              {notices.map((n) => (
                <li key={n.id}>
                  <Link href={`${basePath}/safe-practices#${n.id}`} className="group block">
                    <span className={`mb-1 inline-block rounded px-1.5 py-0.5 text-[11px] font-medium ${noticeCategory(n.category).tone}`}>
                      {noticeCategory(n.category).label}
                    </span>
                    <span className="block text-sm font-medium text-ceda-ink group-hover:underline">{n.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <Link href={`${basePath}/safe-practices`} className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-ceda-orange hover:underline">
              See all advice <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="rounded-xl border border-border bg-white p-5 text-sm text-muted-foreground">
            <p className="mb-2 flex items-center gap-2 font-semibold text-ceda-ink">
              <Users className="h-4 w-4 text-ceda-orange" /> {members} innovators registered
            </p>
            <p className="mb-3">House rules: be kind, keep it about building businesses, and never post Omang numbers, bank details or your full technical design.</p>
            <p>CEDA staff read the forum and answer questions about calls, but forum replies are not official decisions.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}

export async function SafePracticesView({
  basePath = "/community",
  inDashboard = false,
}: {
  basePath?: string;
  inDashboard?: boolean;
}) {
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
        <h3 className="mb-2 font-semibold text-ceda-ink">{n.title}</h3>
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
    <div className={inDashboard ? "overflow-hidden rounded-2xl border border-border bg-white/60" : "bg-ceda-sand/60"}>
      <CommunityHeader
        active="safe"
        basePath={basePath}
        inDashboard={inDashboard}
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
            <h2 className="mb-4 text-xl font-semibold text-ceda-ink">Read these first</h2>
            <div className="grid gap-5 lg:grid-cols-2">
              {pinned.map((n) => <Card key={n.id} n={n} />)}
            </div>
          </section>
        )}

        {byCat.map((c) => (
          <section key={c.key} id={`topic-${c.key}`} className="mb-12 scroll-mt-28">
            <h2 className="mb-4 text-xl font-semibold text-ceda-ink">{c.label}</h2>
            <div className="grid gap-5 lg:grid-cols-2">
              {c.items.map((n) => <Card key={n.id} n={n} />)}
            </div>
          </section>
        ))}

        <p className="rounded-xl border border-border bg-white p-5 text-sm text-muted-foreground">
          This board is general guidance, not legal advice. For a patent, trademark or contract question, speak to a registered IP agent or a lawyer.
          Have a question about it? <Link href={basePath} className="font-medium text-ceda-orange hover:underline">Ask in the forum</Link>.
        </p>
      </div>
    </div>
  );
}

function Avatar({ name, staff }: { name: string; staff: boolean }) {
  return (
    <span
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${staff ? "bg-ceda-ink text-white" : "bg-ceda-orange/10 text-ceda-orange"}`}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}

const FUNDED = { where: { status: "AWARDED" as const, showcase: true }, select: { id: true }, take: 1 };

function FundedBadge({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <Link href="/funded" className="ml-2 inline-flex items-center gap-0.5 rounded bg-ceda-amber/20 px-1.5 py-0.5 text-[11px] font-semibold text-amber-800 hover:bg-ceda-amber/30" title="CEDA-funded innovator">
      <Award className="h-3 w-3" /> CEDA-funded
    </Link>
  );
}

export async function ThreadDetailView({
  id,
  basePath = "/community",
}: {
  id: string;
  basePath?: string;
}) {
  const [user, thread] = await Promise.all([
    getSessionUser(),
    prisma.forumThread.findUnique({
      where: { id },
      include: {
        author: { select: { name: true, organizationName: true, role: true, instances: FUNDED } },
        replies: { orderBy: { createdAt: "asc" }, include: { author: { select: { name: true, organizationName: true, role: true, instances: FUNDED } } } },
      },
    }),
  ]);
  if (!thread) notFound();
  const who = (a: { name: string; organizationName: string | null; role: string }) =>
    a.role !== "INNOVATOR" ? `${a.name} · CEDA` : a.organizationName ? `${a.name} · ${a.organizationName}` : a.name;

  return (
    <div className="bg-ceda-sand/60">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <Link href={basePath} className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-ceda-orange hover:underline">
          <ArrowLeft className="h-4 w-4" /> All discussions
        </Link>

        <article className="rounded-xl border border-border bg-white p-5 sm:p-7">
          <p className="mb-2 text-xs">
            <span className="rounded bg-ceda-sand px-1.5 py-0.5 font-medium text-ceda-ink">{forumLabel(thread.category)}</span>
          </p>
          <h1 className="mb-4 text-2xl font-bold text-ceda-ink">{thread.title}</h1>
          <div className="mb-5 flex items-center gap-3">
            <Avatar name={thread.author.name} staff={thread.author.role !== "INNOVATOR"} />
            <div className="text-sm">
              <p className="font-medium text-ceda-ink">{who(thread.author)}<FundedBadge show={thread.author.instances.length > 0} /></p>
              <p className="text-muted-foreground">{timeAgo(thread.createdAt)}</p>
            </div>
          </div>
          <div className="whitespace-pre-line leading-relaxed text-foreground/90">{thread.body}</div>
        </article>

        <h2 id="replies" className="mb-4 mt-10 scroll-mt-24 text-lg font-semibold text-ceda-ink">
          {thread.replies.length} {thread.replies.length === 1 ? "reply" : "replies"}
        </h2>
        <ul className="space-y-4">
          {thread.replies.map((r) => {
            const staff = r.author.role !== "INNOVATOR";
            return (
              <li key={r.id} className={`rounded-xl border bg-white p-5 ${staff ? "border-ceda-orange/40" : "border-border"}`}>
                <div className="mb-3 flex items-center gap-3">
                  <Avatar name={r.author.name} staff={staff} />
                  <div className="text-sm">
                    <p className="font-medium text-ceda-ink">
                      {who(r.author)}
                      {staff && <span className="ml-2 rounded bg-ceda-orange/10 px-1.5 py-0.5 text-[11px] font-semibold text-ceda-orange">Staff</span>}
                      <FundedBadge show={r.author.instances.length > 0} />
                    </p>
                    <p className="text-muted-foreground">{timeAgo(r.createdAt)}</p>
                  </div>
                </div>
                <p className="whitespace-pre-line leading-relaxed text-foreground/90">{r.body}</p>
              </li>
            );
          })}
        </ul>

        <div className="mt-8 rounded-xl border border-border bg-white p-5">
          {user ? (
            <form action={replyToThread} className="space-y-3">
              <input type="hidden" name="threadId" value={thread.id} />
              <input type="hidden" name="basePath" value={basePath} />
              <label htmlFor="body" className="block text-sm font-medium text-ceda-ink">
                Add a reply
              </label>
              <textarea id="body" name="body" required minLength={2} rows={4} className="w-full rounded-lg border border-border p-3 text-sm focus:border-ceda-orange focus:outline-none" placeholder="Share what you know. Keep personal details out." />
              <button className="rounded-lg bg-ceda-orange px-4 py-2 text-sm font-medium text-white hover:bg-ceda-orange/90">Post reply</button>
            </form>
          ) : (
            <p className="text-sm text-muted-foreground">
              <Link href={`/login?callbackUrl=${encodeURIComponent(`${basePath}/${thread.id}`)}`} className="font-medium text-ceda-orange hover:underline">
                Sign in
              </Link>{" "}
              to reply.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export async function NewThreadView({
  error,
  basePath = "/community",
}: {
  error?: string;
  basePath?: string;
}) {
  const user = await getSessionUser();
  if (!user) redirect(`/login?callbackUrl=${encodeURIComponent(`${basePath}/new`)}`);
  const input = "w-full rounded-lg border border-border p-3 text-sm focus:border-ceda-orange focus:outline-none";
  return (
    <div className="bg-ceda-sand/60">
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <Link href={basePath} className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-ceda-orange hover:underline">
          <ArrowLeft className="h-4 w-4" /> All discussions
        </Link>
        <div className="rounded-xl border border-border bg-white p-6 sm:p-8">
          <h1 className="mb-1 text-2xl font-bold text-ceda-ink">Start a discussion</h1>
          <p className="mb-6 text-sm text-muted-foreground">
            Ask a question or share something useful. Don&apos;t post your full technical design, financials or anyone&apos;s personal details.
          </p>
          {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">Add a title of at least 8 characters, a topic, and a message of at least 20 characters.</p>}
          <form action={createThread} className="space-y-4">
            <input type="hidden" name="basePath" value={basePath} />
            <div>
              <label htmlFor="title" className="mb-1.5 block text-sm font-medium">Title</label>
              <input id="title" name="title" required minLength={8} maxLength={140} className={input} placeholder="e.g. How detailed should my budget be?" />
            </div>
            <div>
              <label htmlFor="category" className="mb-1.5 block text-sm font-medium">Topic</label>
              <select id="category" name="category" required className={input} defaultValue="general">
                {FORUM_CATEGORIES.map((c) => (
                  <option key={c.key} value={c.key}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="body" className="mb-1.5 block text-sm font-medium">Message</label>
              <textarea id="body" name="body" required minLength={20} rows={7} className={input} />
            </div>
            <button className="rounded-lg bg-ceda-orange px-5 py-2.5 text-sm font-medium text-white hover:bg-ceda-orange/90">Post discussion</button>
          </form>
        </div>
      </div>
    </div>
  );
}
