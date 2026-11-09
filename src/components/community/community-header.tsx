import Link from "next/link";
import { MessagesSquare, ShieldAlert } from "lucide-react";
import { BlueBackdrop } from "@/components/home/blue-backdrop";

/** Blue band with the Forum / Safe practices tabs. */
export function CommunityHeader({
  active,
  title,
  subtitle,
  basePath = "/community",
  inDashboard = false,
}: {
  active: "forum" | "safe";
  title: string;
  subtitle: string;
  basePath?: string;
  inDashboard?: boolean;
}) {
  const tab = (on: boolean) =>
    `inline-flex items-center gap-2 rounded-t-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
      on ? "bg-white text-ceda-navy" : "text-white/80 hover:bg-white/10 hover:text-white"
    }`;
  return (
    <section className={`relative overflow-hidden bg-[#0b4a86] text-white ${inDashboard ? "rounded-t-2xl" : ""}`}>
      <BlueBackdrop />
      <div className="relative mx-auto max-w-6xl px-4 pt-10 sm:px-6 lg:px-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-ceda-amber">Innovator community</p>
        <h1 className="text-3xl font-bold sm:text-4xl">{title}</h1>
        <p className="mt-2 max-w-2xl text-white/80">{subtitle}</p>
        <nav className="mt-8 flex gap-1" aria-label="Community sections">
          <Link href={basePath} className={tab(active === "forum")} aria-current={active === "forum" ? "page" : undefined}>
            <MessagesSquare className="h-4 w-4" /> Forum
          </Link>
          <Link href={`${basePath}/safe-practices`} className={tab(active === "safe")} aria-current={active === "safe" ? "page" : undefined}>
            <ShieldAlert className="h-4 w-4" /> Safe practices
          </Link>
        </nav>
      </div>
    </section>
  );
}
