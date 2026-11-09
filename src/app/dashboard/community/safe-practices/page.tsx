import { SafePracticesView } from "@/components/community/community-views";

export const metadata = { title: "Safe practices · CEDA Innovation Portal" };
export const dynamic = "force-dynamic";

export default async function DashboardSafePracticesPage() {
  return <SafePracticesView basePath="/dashboard/community" inDashboard />;
}
