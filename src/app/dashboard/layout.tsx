import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <div className="hidden md:block">
        <DashboardSidebar />
      </div>
      <main className="flex-1 bg-bocra-light overflow-auto pb-16 md:pb-0">
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
      <MobileBottomNav />
    </div>
  );
}
