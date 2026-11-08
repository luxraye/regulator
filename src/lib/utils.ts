import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Dates are shown the same way on server and client (avoids hydration mismatches). */
export function formatDate(value: string | Date | null | undefined, withTime = false): string {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  return d.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
    timeZone: "Africa/Gaborone",
  });
}

/** "in 3 days", "2 days overdue", "today". */
export function relativeDeadline(value: string | Date): { text: string; overdue: boolean; soon: boolean } {
  const d = typeof value === "string" ? new Date(value) : value;
  const days = Math.ceil((d.getTime() - Date.now()) / 86_400_000);
  if (days < 0) return { text: `${-days} day${days === -1 ? "" : "s"} overdue`, overdue: true, soon: false };
  if (days === 0) return { text: "due today", overdue: false, soon: true };
  return { text: `due in ${days} day${days === 1 ? "" : "s"}`, overdue: false, soon: days <= 7 };
}

export function timeAgo(value: string | Date): string {
  const d = typeof value === "string" ? new Date(value) : value;
  const s = Math.round((Date.now() - d.getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  if (s < 86400 * 30) return `${Math.floor(s / 86400)} d ago`;
  return formatDate(d);
}

export function formatPula(amount: number | null | undefined): string {
  if (amount == null) return "—";
  return `P${amount.toLocaleString("en-GB")}`;
}
