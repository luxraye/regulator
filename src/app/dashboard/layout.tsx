import Link from "next/link";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { NotificationBell } from "@/components/layout/notification-bell";
import { MobileSignOut } from "@/components/layout/user-menu";
import { getSessionUser } from "@/lib/session";
import { roleLabels } from "@/lib/labels";
import { LogoMark } from "@/components/brand/logo";


export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();

  return (
    <div className="flex min-h-screen">
      <div className="sticky top-0 hidden h-screen md:block print:hidden">
        <DashboardSidebar />
      </div>
      <div className="flex min-w-0 flex-1 flex-col bg-ceda-sand">
        <header className="sticky top-0 z-30 flex print:hidden h-14 items-center justify-between border-b border-border bg-white/90 px-4 backdrop-blur sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 md:hidden">
            <LogoMark className="h-5 w-5" />
            <span className="text-sm font-bold text-ceda-ink">CEDA Innovation</span>
          </Link>
          <p className="hidden text-sm text-muted-foreground md:block">
            {user?.organizationName && user.role === "INNOVATOR" ? user.organizationName : roleLabels[user?.role ?? ""]}
          </p>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <MobileSignOut />
          </div>
        </header>
        <main className="flex-1 pb-20 md:pb-0 print:pb-0">
          <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </div>
      <MobileBottomNav />
    </div>
  );
}
