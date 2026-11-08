"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSessionUser, STAFF_ROLES } from "@/lib/session";
import { FORUM_CATEGORIES, NOTICE_CATEGORIES } from "@/lib/community";

const clean = (v: FormDataEntryValue | null, max: number) => String(v ?? "").trim().slice(0, max);

export async function createThread(form: FormData) {
  const user = await getSessionUser();
  if (!user) redirect("/login?callbackUrl=/community/new");
  const title = clean(form.get("title"), 140);
  const body = clean(form.get("body"), 5000);
  const category = clean(form.get("category"), 20);
  if (title.length < 8 || body.length < 20 || !FORUM_CATEGORIES.some((c) => c.key === category)) {
    redirect("/community/new?error=1");
  }
  const t = await prisma.forumThread.create({ data: { title, body, category, authorId: user.id } });
  revalidatePath("/community");
  redirect(`/community/${t.id}`);
}

export async function replyToThread(form: FormData) {
  const threadId = clean(form.get("threadId"), 40);
  const user = await getSessionUser();
  if (!user) redirect(`/login?callbackUrl=/community/${threadId}`);
  const body = clean(form.get("body"), 3000);
  if (body.length >= 2) {
    await prisma.forumReply.create({ data: { body, threadId, authorId: user.id } });
    await prisma.forumThread.update({ where: { id: threadId }, data: { updatedAt: new Date() } });
  }
  revalidatePath(`/community/${threadId}`);
  redirect(`/community/${threadId}#replies`);
}

export async function createNotice(form: FormData) {
  const user = await getSessionUser();
  if (!user || !STAFF_ROLES.includes(user.role)) redirect("/dashboard");
  const title = clean(form.get("title"), 140);
  const summary = clean(form.get("summary"), 600);
  const category = clean(form.get("category"), 20);
  if (title.length < 5 || summary.length < 10 || !NOTICE_CATEGORIES.some((c) => c.key === category)) {
    redirect("/dashboard/admin/notices?error=1");
  }
  await prisma.notice.create({
    data: {
      title,
      summary,
      category,
      dos: clean(form.get("dos"), 2000),
      donts: clean(form.get("donts"), 2000),
      pinned: form.get("pinned") === "on",
      authorId: user.id,
    },
  });
  revalidatePath("/community/safe-practices");
  redirect("/dashboard/admin/notices?posted=1");
}

export async function toggleNoticePin(form: FormData) {
  const user = await getSessionUser();
  if (!user || !STAFF_ROLES.includes(user.role)) redirect("/dashboard");
  const id = clean(form.get("id"), 40);
  const n = await prisma.notice.findUnique({ where: { id } });
  if (n) await prisma.notice.update({ where: { id }, data: { pinned: !n.pinned } });
  revalidatePath("/community/safe-practices");
  redirect("/dashboard/admin/notices");
}
