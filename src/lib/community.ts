/** Forum categories and Safe Practices board sections, shared by pages, actions and the seed. */

export const FORUM_CATEGORIES = [
  { key: "funding", label: "Funding & CEDA calls" },
  { key: "pitching", label: "Pitching" },
  { key: "building", label: "Building the product" },
  { key: "markets", label: "Customers & markets" },
  { key: "cofounders", label: "Find a co-founder" },
  { key: "general", label: "General" },
] as const;

export type ForumCategory = (typeof FORUM_CATEGORIES)[number]["key"];

export const NOTICE_CATEGORIES = [
  { key: "ip", label: "Protecting your idea", tone: "bg-sky-100 text-sky-800" },
  { key: "pitching", label: "Pitch pitfalls", tone: "bg-amber-100 text-amber-800" },
  { key: "contracts", label: "Contracts & co-founders", tone: "bg-violet-100 text-violet-800" },
  { key: "scams", label: "Scams & fees", tone: "bg-red-100 text-red-800" },
  { key: "data", label: "Data & privacy", tone: "bg-emerald-100 text-emerald-800" },
] as const;

export type NoticeCategory = (typeof NOTICE_CATEGORIES)[number]["key"];

export const forumLabel = (k: string) => FORUM_CATEGORIES.find((c) => c.key === k)?.label ?? "General";
export const noticeCategory = (k: string) => NOTICE_CATEGORIES.find((c) => c.key === k) ?? NOTICE_CATEGORIES[0];

export const lines = (s: string) => s.split("\n").map((l) => l.trim()).filter(Boolean);

export function timeAgo(d: Date) {
  const s = (Date.now() - d.getTime()) / 1000;
  if (s < 3600) return `${Math.max(1, Math.floor(s / 60))} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  if (s < 86400 * 30) return `${Math.floor(s / 86400)} d ago`;
  return d.toLocaleDateString("en-BW", { day: "numeric", month: "short", year: "numeric" });
}

export function initials(name: string) {
  return name.replace(/^(Dr|Mma|Rra|Mr|Ms)\.?\s+/i, "").split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");
}
