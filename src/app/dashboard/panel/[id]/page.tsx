import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { IdeaDossier } from "@/components/ideas/idea-dossier";

export const dynamic = "force-dynamic";

export default async function PanelIdeaPage({ params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return <IdeaDossier id={params.id} user={user} mode="panel" />;
}
