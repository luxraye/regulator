import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { HOME_FOR } from "@/lib/nav";

export default async function DashboardRedirect() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  redirect(HOME_FOR[user.role] ?? "/login");
}
