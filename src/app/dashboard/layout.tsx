import Link from "next/link";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { NotificationBell } from "@/components/layout/notification-bell";
import { MobileSignOut } from "@/components/layout/user-menu";
import { getSessionUser } from "@/lib/session";

const roleLabel: Record<string, string> = {
  PUBLIC: "Citizen",
  LICENSEE: "Licensee",
  ADMIN: "BOCRA Admin",
  SUPERADMIN: "Super Admin",
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();

  return (
    <div className="flex min-h-screen">
      <div className="sticky top-0 hidden h-screen md:block">
        <DashboardSidebar />
      </div>
      <div className="flex min-w-0 flex-1 flex-col bg-bocra-light">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-white/90 px-4 backdrop-blur sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 md:hidden">
            <span className="flex gap-1">
              <span className="h-2 w-2 rounded-full bg-bocra-blue" />
              <span className="h-2 w-2 rounded-full bg-bocra-green" />
              <span className="h-2 w-2 rounded-full bg-bocra-amber" />
              <span className="h-2 w-2 rounded-full bg-bocra-orange" />
            </span>
            <span className="text-sm font-bold text-bocra-navy">BOCRA</span>
          </Link>
          <p className="hidden text-sm text-muted-foreground md:block">
            {user?.organizationName && user.role === "INNOVATOR" ? user.organizationName : roleLabel[user?.role ?? ""]}
          </p>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <MobileSignOut />
          </div>
        </header>
        <main className="flex-1 pb-20 md:pb-0">
          <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </div>
      <MobileBottomNav />
    </div>
  );
}
