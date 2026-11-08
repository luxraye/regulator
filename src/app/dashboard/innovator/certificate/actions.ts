"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { audit } from "@/lib/audit";

/** The founder chooses whether their award appears on the public Funded innovators page. */
export async function setShowcase(form: FormData) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const id = String(form.get("id") ?? "");
  const on = form.get("showcase") === "on";
  const inst = await prisma.instance.findFirst({ where: { id, innovatorId: user.id, status: "AWARDED" }, select: { id: true } });
  if (!inst) redirect("/dashboard/innovator/instances");
  await prisma.instance.update({ where: { id }, data: { showcase: on } });
  await audit(user.id, on ? "SHOWCASE_OPT_IN" : "SHOWCASE_OPT_OUT", { instanceId: id });
  revalidatePath("/funded");
  redirect(`/dashboard/innovator/certificate/${id}?saved=1`);
}
