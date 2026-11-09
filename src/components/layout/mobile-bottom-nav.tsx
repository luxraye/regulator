"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { navFor, isActive } from "@/lib/nav";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const tabs = navFor(session?.user?.role).filter((t) => t.mobile);
  if (tabs.length === 0) return null;

  return (
    <nav className="safe-bottom fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-ceda-navy md:hidden print:hidden">
      <div className="flex items-stretch">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "flex min-h-[56px] flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition-colors",
              isActive(pathname, tab.href) ? "text-ceda-amber" : "text-white/80 active:text-white"
            )}
          >
            {tab.icon}
            <span>{tab.short ?? tab.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
