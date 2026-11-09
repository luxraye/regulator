import { NewThreadView } from "@/components/community/community-views";

export const metadata = { title: "Start a discussion · CEDA Innovation Portal" };
export const dynamic = "force-dynamic";

export default async function NewThreadPage({ searchParams }: { searchParams: { error?: string } }) {
  return <NewThreadView error={searchParams.error} />;
}
