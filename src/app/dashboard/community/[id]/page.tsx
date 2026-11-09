import { ThreadDetailView } from "@/components/community/community-views";

export const dynamic = "force-dynamic";

export default async function DashboardThreadPage({ params }: { params: { id: string } }) {
  return <ThreadDetailView id={params.id} basePath="/dashboard/community" />;
}
