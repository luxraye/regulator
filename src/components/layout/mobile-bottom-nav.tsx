"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  MessageSquareWarning,
  Bookmark,
  Star,
  FileBox,
  ClipboardCheck,
  BarChart3,
  PlusCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TabItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const citizenTabs: TabItem[] = [
  { href: "/dashboard/citizen", label: "Home", icon: <LayoutDashboard size={20} /> },
  { href: "/dashboard/citizen/complaints", label: "Complaints", icon: <MessageSquareWarning size={20} /> },
  { href: "/dashboard/citizen/bookmarks", label: "Bookmarks", icon: <Bookmark size={20} /> },
  { href: "/dashboard/citizen/events", label: "Events", icon: <Star size={20} /> },
];

const licenseeTabs: TabItem[] = [
  { href: "/dashboard/licensee", label: "Home", icon: <LayoutDashboard size={20} /> },
  { href: "/dashboard/licensee/instances", label: "Instances", icon: <FileBox size={20} /> },
];

const adminTabs: TabItem[] = [
  { href: "/dashboard/admin", label: "Home", icon: <LayoutDashboard size={20} /> },
  { href: "/dashboard/admin/provision", label: "Provision", icon: <PlusCircle size={20} /> },
  { href: "/dashboard/admin/review", label: "Review", icon: <ClipboardCheck size={20} /> },
  { href: "/dashboard/admin/analytics", label: "Analytics", icon: <BarChart3 size={20} /> },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role;

  const tabs = role === "PUBLIC"
    ? citizenTabs
    : role === "LICENSEE"
    ? licenseeTabs
    : role === "ADMIN" || role === "SUPERADMIN"
    ? adminTabs
    : [];

  if (tabs.length === 0) return null;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-bocra-navy border-t border-white/10 safe-bottom">
      <div className="flex items-stretch">
        {tabs.map((tab) => {
          const isActive =
            pathname === tab.href ||
            (tab.href !== "/dashboard/citizen" &&
              tab.href !== "/dashboard/licensee" &&
              tab.href !== "/dashboard/admin" &&
              pathname.startsWith(tab.href));
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition-colors min-h-[56px]",
                isActive
                  ? "text-bocra-blue"
                  : "text-white/50 active:text-white/80"
              )}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
