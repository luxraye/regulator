import { CommunityForumView } from "@/components/community/community-views";

export const metadata = { title: "Community · CEDA Innovation Portal" };
export const dynamic = "force-dynamic";

export default async function DashboardCommunityPage() {
  return <CommunityForumView basePath="/dashboard/community" inDashboard />;
}
