import {
  LayoutDashboard, FileBox, Megaphone, History, ShieldCheck, ClipboardList, Gavel, BarChart3,
  Layers, Users, Grid3X3, Wrench, ScrollText, Settings, Inbox, MessagesSquare, ShieldAlert, Award,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  short?: string;
  icon: React.ReactNode;
  /** Shown in the mobile bottom bar. */
  mobile?: boolean;
}

const i = (C: typeof LayoutDashboard) => <C size={20} />;

const innovator: NavItem[] = [
  { href: "/dashboard/innovator", label: "Overview", short: "Home", icon: i(LayoutDashboard), mobile: true },
  { href: "/dashboard/innovator/calls", label: "Open calls", short: "Calls", icon: i(Megaphone), mobile: true },
  { href: "/dashboard/innovator/instances", label: "My ideas", short: "Ideas", icon: i(FileBox), mobile: true },
  { href: "/dashboard/innovator/history", label: "Activity", icon: i(History), mobile: true },
  { href: "/dashboard/innovator/privacy", label: "My data", icon: i(ShieldCheck) },
  { href: "/dashboard/funded", label: "Funded showcase", icon: i(Award) },
  { href: "/dashboard/community", label: "Community forum", icon: i(MessagesSquare) },
  { href: "/dashboard/community/safe-practices", label: "Safe practices", icon: i(ShieldAlert) },
];

const evaluator: NavItem[] = [
  { href: "/dashboard/evaluator", label: "My assignments", short: "Assigned", icon: i(ClipboardList), mobile: true },
  { href: "/dashboard/calls", label: "Calls & rubrics", short: "Calls", icon: i(Megaphone), mobile: true },
  { href: "/dashboard/funded", label: "Funded showcase", short: "Funded", icon: i(Award), mobile: true },
  { href: "/dashboard/community", label: "Community forum", short: "Forum", icon: i(MessagesSquare), mobile: true },
  { href: "/dashboard/community/safe-practices", label: "Safe practices", icon: i(ShieldAlert) },
];

const adjudicator: NavItem[] = [
  { href: "/dashboard/panel", label: "Panel shortlist", short: "Panel", icon: i(Gavel), mobile: true },
  { href: "/dashboard/reports", label: "Reports", icon: i(BarChart3), mobile: true },
  { href: "/dashboard/calls", label: "Calls & rubrics", short: "Calls", icon: i(Megaphone), mobile: true },
  { href: "/dashboard/funded", label: "Funded showcase", icon: i(Award) },
  { href: "/dashboard/community", label: "Community forum", short: "Forum", icon: i(MessagesSquare), mobile: true },
  { href: "/dashboard/community/safe-practices", label: "Safe practices", icon: i(ShieldAlert) },
];

const admin: NavItem[] = [
  { href: "/dashboard/instances", label: "Instances", short: "Instances", icon: i(Layers), mobile: true },
  { href: "/dashboard/admin", label: "Overview", short: "Home", icon: i(LayoutDashboard), mobile: true },
  { href: "/dashboard/admin/instances", label: "Ideas & screening", short: "Ideas", icon: i(Inbox), mobile: true },
  { href: "/dashboard/admin/calls", label: "Calls", icon: i(Megaphone) },
  { href: "/dashboard/panel", label: "Panel shortlist", short: "Panel", icon: i(Gavel), mobile: true },
  { href: "/dashboard/reports", label: "Reports", icon: i(BarChart3), mobile: true },
  { href: "/dashboard/funded", label: "Funded showcase", icon: i(Award) },
  { href: "/dashboard/community", label: "Community forum", icon: i(MessagesSquare) },
  { href: "/dashboard/admin/notices", label: "Safe practices board", icon: i(ShieldAlert) },
];

const partnerAdmin: NavItem[] = [
  { href: "/dashboard/instances", label: "Instances", short: "Instances", icon: i(Layers), mobile: true },
  { href: "/dashboard/admin", label: "Overview", short: "Home", icon: i(LayoutDashboard), mobile: true },
  { href: "/dashboard/admin/instances", label: "Ideas & screening", short: "Ideas", icon: i(Inbox), mobile: true },
  { href: "/dashboard/reports", label: "Reports", icon: i(BarChart3), mobile: true },
  { href: "/dashboard/funded", label: "Funded showcase", icon: i(Award) },
  { href: "/dashboard/community", label: "Community forum", icon: i(MessagesSquare) },
];

const superadmin: NavItem[] = [
  ...admin,
  { href: "/dashboard/superadmin/users", label: "People & roles", icon: i(Users) },
  { href: "/dashboard/superadmin/matrix", label: "Sector matrix", icon: i(Grid3X3) },
  { href: "/dashboard/superadmin/tools", label: "Verification", icon: i(Wrench) },
  { href: "/dashboard/superadmin/audit", label: "Audit trail", icon: i(ScrollText) },
  { href: "/dashboard/superadmin/settings", label: "Settings", icon: i(Settings) },
];

export function navFor(role?: string): NavItem[] {
  switch (role) {
    case "SUPERADMIN": return superadmin;
    case "ADMIN": return admin;
    case "PARTNER_ADMIN": return partnerAdmin;
    case "ADJUDICATOR": return adjudicator;
    case "EVALUATOR": return evaluator;
    case "INNOVATOR": return innovator;
    default: return [];
  }
}

export const HOME_FOR: Record<string, string> = {
  INNOVATOR: "/dashboard/innovator",
  EVALUATOR: "/dashboard/evaluator",
  ADJUDICATOR: "/dashboard/panel",
  ADMIN: "/dashboard/admin",
  SUPERADMIN: "/dashboard/admin",
  PARTNER_ADMIN: "/dashboard/instances",
};

/** Overview links only light up on an exact match; others also on sub-pages. */
export function isActive(pathname: string, href: string) {
  if (pathname === href) return true;
  if (Object.values(HOME_FOR).includes(href) && href !== "/dashboard/panel" && href !== "/dashboard/evaluator") return false;
  if ((href === "/dashboard/community" || href === "/community") && pathname.startsWith(href + "/safe-practices")) return false;
  return pathname.startsWith(href + "/");
}
