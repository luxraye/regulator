import { CommunityForumView } from "@/components/community/community-views";

export const metadata = { title: "Community · CEDA Innovation Portal" };
export const dynamic = "force-dynamic";

export default async function CommunityPage() {
  return <CommunityForumView />;
}
