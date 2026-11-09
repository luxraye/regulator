"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { navFor, isActive } from "@/lib/nav";
import { roleLabels } from "@/lib/labels";
import { Logo, LogoMark } from "@/components/brand/logo";

export function DashboardSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);
  const nav = navFor(session?.user?.role);

  return (
    <aside className={cn("flex h-screen flex-col bg-ceda-navy text-white transition-all duration-200", collapsed ? "w-16" : "w-64")}>
      <div className="flex items-center justify-between border-b border-white/10 p-4">
        <Link href="/">{collapsed ? <LogoMark /> : <Logo tone="light" sub={false} />}</Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded p-1 transition-colors hover:bg-white/10"
          aria-label={collapsed ? "Expand menu" : "Collapse menu"}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-4">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
              isActive(pathname, item.href) ? "bg-ceda-blue text-white" : "text-white/80 hover:bg-white/10 hover:text-white"
            )}
            title={collapsed ? item.label : undefined}
          >
            {item.icon}
            {!collapsed && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>

      <div className="space-y-2 border-t border-white/10 p-4">
        {!collapsed && session?.user && (
          <div className="mb-2 text-xs text-white/75">
            <p className="truncate font-medium text-white">{session.user.name}</p>
            <p className="truncate">{session.user.email}</p>
            <p className="mt-1 text-ceda-amber">{roleLabels[session.user.role ?? ""] ?? session.user.role}</p>
          </div>
        )}
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-white/80 transition-colors hover:bg-white/10 hover:text-white"
          title={collapsed ? "Sign out" : undefined}
        >
          <LogOut size={20} />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </aside>
  );
}
