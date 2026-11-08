"use client";

import Link from "next/link";
import { useState } from "react";
import { MessageCircle, Pin } from "lucide-react";
import { FORUM_CATEGORIES } from "@/lib/community";

export type ThreadRow = {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  categoryLabel: string;
  pinned: boolean;
  author: string;
  authorOrg: string | null;
  authorIsStaff: boolean;
  initials: string;
  replies: number;
  lastActivity: string;
};

/** Thread list with category chips. Filtering happens in the browser so the list stays one page. */
export function ThreadList({ threads }: { threads: ThreadRow[] }) {
  const [cat, setCat] = useState<string>("all");
  const shown = cat === "all" ? threads : threads.filter((t) => t.category === cat);
  const chip = (on: boolean) =>
    `rounded-full border px-3 py-1.5 text-sm transition-colors ${on ? "border-ceda-navy bg-ceda-navy text-white" : "border-border bg-white text-ceda-navy hover:border-ceda-blue"}`;

  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-2" role="tablist" aria-label="Filter by topic">
        <button className={chip(cat === "all")} onClick={() => setCat("all")} role="tab" aria-selected={cat === "all"}>
          All topics
        </button>
        {FORUM_CATEGORIES.map((c) => (
          <button key={c.key} className={chip(cat === c.key)} onClick={() => setCat(c.key)} role="tab" aria-selected={cat === c.key}>
            {c.label}
          </button>
        ))}
      </div>
      <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-white">
        {shown.map((t) => (
          <li key={t.id}>
            <Link href={`/community/${t.id}`} className="flex gap-4 p-4 transition-colors hover:bg-ceda-light sm:p-5">
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                  t.authorIsStaff ? "bg-ceda-navy text-white" : "bg-ceda-blue/10 text-ceda-blue"
                }`}
                aria-hidden
              >
                {t.initials}
              </span>
              <span className="min-w-0 flex-1">
                <span className="mb-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  {t.pinned && (
                    <span className="inline-flex items-center gap-1 font-medium text-ceda-orange">
                      <Pin className="h-3 w-3" /> Pinned
                    </span>
                  )}
                  <span className="rounded bg-ceda-light px-1.5 py-0.5 font-medium text-ceda-navy">{t.categoryLabel}</span>
                  <span>
                    {t.author}
                    {t.authorIsStaff ? " · CEDA" : t.authorOrg ? ` · ${t.authorOrg}` : ""}
                  </span>
                </span>
                <span className="block font-semibold text-ceda-navy">{t.title}</span>
                <span className="mt-1 line-clamp-2 block text-sm text-muted-foreground">{t.excerpt}</span>
              </span>
              <span className="hidden shrink-0 flex-col items-end gap-1 text-xs text-muted-foreground sm:flex">
                <span className="inline-flex items-center gap-1">
                  <MessageCircle className="h-3.5 w-3.5" /> {t.replies}
                </span>
                <span>{t.lastActivity}</span>
              </span>
            </Link>
          </li>
        ))}
        {shown.length === 0 && <li className="p-8 text-center text-sm text-muted-foreground">No discussions in this topic yet. Start one.</li>}
      </ul>
    </div>
  );
}
