"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  FileBox,
  ClipboardCheck,
  BarChart3,
  Users,
  Settings,
  Layers,
  PlusCircle,
  History,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Grid3X3,
  FlaskConical,
  Wrench,
  Bookmark,
  Star,
  MessageSquareWarning,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const citizenNav: NavItem[] = [
  { href: "/dashboard/citizen", label: "Overview", icon: <LayoutDashboard size={20} /> },
  { href: "/dashboard/citizen/complaints", label: "My Complaints", icon: <MessageSquareWarning size={20} /> },
  { href: "/dashboard/citizen/bookmarks", label: "Bookmarks", icon: <Bookmark size={20} /> },
  { href: "/dashboard/citizen/events", label: "Starred Events", icon: <Star size={20} /> },
];

const licenseeNav: NavItem[] = [
  { href: "/dashboard/licensee", label: "Overview", icon: <LayoutDashboard size={20} /> },
  { href: "/dashboard/licensee/instances", label: "My Instances", icon: <FileBox size={20} /> },
  { href: "/dashboard/licensee/playground", label: "Playground", icon: <FlaskConical size={20} /> },
  { href: "/dashboard/licensee/history", label: "History", icon: <History size={20} /> },
];

const adminNav: NavItem[] = [
  { href: "/dashboard/admin", label: "Overview", icon: <LayoutDashboard size={20} /> },
  { href: "/dashboard/admin/provision", label: "Provision", icon: <PlusCircle size={20} /> },
  { href: "/dashboard/admin/instances", label: "All Instances", icon: <FileBox size={20} /> },
  { href: "/dashboard/admin/review", label: "Review Queue", icon: <ClipboardCheck size={20} /> },
  { href: "/dashboard/admin/analytics", label: "Analytics", icon: <BarChart3 size={20} /> },
];

const superAdminNav: NavItem[] = [
  ...adminNav,
  { href: "/dashboard/superadmin/templates", label: "Templates", icon: <Layers size={20} /> },
  { href: "/dashboard/superadmin/users", label: "Users", icon: <Users size={20} /> },
  { href: "/dashboard/superadmin/matrix", label: "Matrix", icon: <Grid3X3 size={20} /> },
  { href: "/dashboard/superadmin/tools", label: "Verification", icon: <Wrench size={20} /> },
  { href: "/dashboard/superadmin/settings", label: "Settings", icon: <Settings size={20} /> },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);

  const role = session?.user?.role;
  const nav = role === "SUPERADMIN"
    ? superAdminNav
    : role === "ADMIN"
    ? adminNav
    : role === "PUBLIC"
    ? citizenNav
    : licenseeNav;

  return (
    <aside
      className={cn(
        "bg-bocra-navy text-white flex flex-col transition-all duration-200 min-h-screen",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <span className="w-2 h-2 rounded-full bg-bocra-blue" />
              <span className="w-2 h-2 rounded-full bg-bocra-green" />
              <span className="w-2 h-2 rounded-full bg-bocra-amber" />
              <span className="w-2 h-2 rounded-full bg-bocra-orange" />
            </div>
            <span className="font-bold text-sm">BOCRA Portal</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded hover:bg-white/10 transition-colors"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <nav className="flex-1 py-4 space-y-1 px-2">
        {nav.map((item) => {
          const overviewPaths = ["/dashboard/admin", "/dashboard/licensee", "/dashboard/citizen"];
          const isActive = pathname === item.href || 
            (!overviewPaths.includes(item.href) && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-bocra-blue text-white"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              )}
              title={collapsed ? item.label : undefined}
            >
              {item.icon}
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10 space-y-2">
        {!collapsed && session?.user && (
          <div className="text-xs text-white/60 mb-2">
            <p className="text-white font-medium truncate">{session.user.name}</p>
            <p className="truncate">{session.user.email}</p>
            <p className="capitalize mt-1 text-bocra-amber">{session.user.role?.toLowerCase()}</p>
          </div>
        )}
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors",
          )}
          title={collapsed ? "Sign Out" : undefined}
        >
          <LogOut size={20} />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
