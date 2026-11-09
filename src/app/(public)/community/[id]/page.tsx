import { ThreadDetailView } from "@/components/community/community-views";

export const dynamic = "force-dynamic";

export default async function ThreadPage({ params }: { params: { id: string } }) {
  return <ThreadDetailView id={params.id} />;
}
