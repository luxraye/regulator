import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Award } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { forumLabel, initials, timeAgo } from "@/lib/community";
import { replyToThread } from "../actions";

export const dynamic = "force-dynamic";

function Avatar({ name, staff }: { name: string; staff: boolean }) {
  return (
    <span
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${staff ? "bg-ceda-navy text-white" : "bg-ceda-blue/10 text-ceda-blue"}`}
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

export default async function ThreadPage({ params }: { params: { id: string } }) {
  const [user, thread] = await Promise.all([
    getSessionUser(),
    prisma.forumThread.findUnique({
      where: { id: params.id },
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
    <div className="bg-ceda-light/60">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <Link href="/community" className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-ceda-blue hover:underline">
          <ArrowLeft className="h-4 w-4" /> All discussions
        </Link>

        <article className="rounded-xl border border-border bg-white p-5 sm:p-7">
          <p className="mb-2 text-xs">
            <span className="rounded bg-ceda-light px-1.5 py-0.5 font-medium text-ceda-navy">{forumLabel(thread.category)}</span>
          </p>
          <h1 className="mb-4 text-2xl font-bold text-ceda-navy">{thread.title}</h1>
          <div className="mb-5 flex items-center gap-3">
            <Avatar name={thread.author.name} staff={thread.author.role !== "INNOVATOR"} />
            <div className="text-sm">
              <p className="font-medium text-ceda-navy">{who(thread.author)}<FundedBadge show={thread.author.instances.length > 0} /></p>
              <p className="text-muted-foreground">{timeAgo(thread.createdAt)}</p>
            </div>
          </div>
          <div className="whitespace-pre-line leading-relaxed text-foreground/90">{thread.body}</div>
        </article>

        <h2 id="replies" className="mb-4 mt-10 scroll-mt-24 text-lg font-semibold text-ceda-navy">
          {thread.replies.length} {thread.replies.length === 1 ? "reply" : "replies"}
        </h2>
        <ul className="space-y-4">
          {thread.replies.map((r) => {
            const staff = r.author.role !== "INNOVATOR";
            return (
              <li key={r.id} className={`rounded-xl border bg-white p-5 ${staff ? "border-ceda-blue/40" : "border-border"}`}>
                <div className="mb-3 flex items-center gap-3">
                  <Avatar name={r.author.name} staff={staff} />
                  <div className="text-sm">
                    <p className="font-medium text-ceda-navy">
                      {who(r.author)}
                      {staff && <span className="ml-2 rounded bg-ceda-blue/10 px-1.5 py-0.5 text-[11px] font-semibold text-ceda-blue">Staff</span>}
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
              <label htmlFor="body" className="block text-sm font-medium text-ceda-navy">
                Add a reply
              </label>
              <textarea id="body" name="body" required minLength={2} rows={4} className="w-full rounded-lg border border-border p-3 text-sm focus:border-ceda-blue focus:outline-none" placeholder="Share what you know. Keep personal details out." />
              <button className="rounded-lg bg-ceda-blue px-4 py-2 text-sm font-medium text-white hover:bg-ceda-blue/90">Post reply</button>
            </form>
          ) : (
            <p className="text-sm text-muted-foreground">
              <Link href={`/login?callbackUrl=/community/${thread.id}`} className="font-medium text-ceda-blue hover:underline">
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
