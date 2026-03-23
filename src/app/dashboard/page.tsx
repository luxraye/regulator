import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardRedirect() {
  const session = await auth();

  if (!session?.user) redirect("/login");

  const role = (session.user as any).role;

  if (role === "SUPERADMIN") redirect("/dashboard/admin");
  if (role === "ADMIN") redirect("/dashboard/admin");
  if (role === "LICENSEE") redirect("/dashboard/licensee");
  if (role === "PUBLIC") redirect("/dashboard/citizen");

  redirect("/login");
}
