import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getSessionUser } from "@/lib/session";
import { FORUM_CATEGORIES } from "@/lib/community";
import { createThread } from "../actions";

export const metadata = { title: "Start a discussion · CEDA Innovation Portal" };
export const dynamic = "force-dynamic";

export default async function NewThreadPage({ searchParams }: { searchParams: { error?: string } }) {
  const user = await getSessionUser();
  if (!user) redirect("/login?callbackUrl=/community/new");
  const input = "w-full rounded-lg border border-border p-3 text-sm focus:border-ceda-blue focus:outline-none";
  return (
    <div className="bg-ceda-light/60">
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <Link href="/community" className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-ceda-blue hover:underline">
          <ArrowLeft className="h-4 w-4" /> All discussions
        </Link>
        <div className="rounded-xl border border-border bg-white p-6 sm:p-8">
          <h1 className="mb-1 text-2xl font-bold text-ceda-navy">Start a discussion</h1>
          <p className="mb-6 text-sm text-muted-foreground">
            Ask a question or share something useful. Don&apos;t post your full technical design, financials or anyone&apos;s personal details.
          </p>
          {searchParams.error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">Add a title of at least 8 characters, a topic, and a message of at least 20 characters.</p>}
          <form action={createThread} className="space-y-4">
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
            <button className="rounded-lg bg-ceda-blue px-5 py-2.5 text-sm font-medium text-white hover:bg-ceda-blue/90">Post discussion</button>
          </form>
        </div>
      </div>
    </div>
  );
}
