import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, badRequest, notFound, PANEL_ROLES } from "@/lib/session";
import { notify, notifyRoles } from "@/lib/audit";

export const dynamic = "force-dynamic";

async function load(id: string) {
  return prisma.instance.findUnique({ where: { id }, select: { id: true, innovatorId: true, referenceCode: true, title: true } });
}

/** Clarification thread. Innovators see only non-internal messages. Evaluators (blind) see none. */
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const { user, error } = await requireUser();
  if (error) return error;
  const instance = await load(params.id);
  if (!instance) return notFound();
  const isOwner = instance.innovatorId === user.id;
  if (!isOwner && !PANEL_ROLES.includes(user.role)) return notFound();

  const messages = await prisma.message.findMany({
    where: { instanceId: instance.id, ...(isOwner ? { internal: false } : {}) },
    orderBy: { createdAt: "asc" },
    include: { author: { select: { name: true, role: true } } },
  });
  return NextResponse.json(
    messages.map((m) => ({
      id: m.id,
      body: m.body,
      internal: m.internal,
      createdAt: m.createdAt,
      mine: m.authorId === user.id,
      author: m.author.role === "INNOVATOR" ? m.author.name : isOwner ? "CEDA team" : m.author.name,
      fromCeda: m.author.role !== "INNOVATOR",
    }))
  );
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { user, error } = await requireUser();
  if (error) return error;
  const instance = await load(params.id);
  if (!instance) return notFound();
  const isOwner = instance.innovatorId === user.id;
  if (!isOwner && !PANEL_ROLES.includes(user.role)) return notFound();

  const body = await req.json().catch(() => ({}));
  const text = typeof body?.body === "string" ? body.body.trim().slice(0, 4000) : "";
  if (text.length < 2) return badRequest("Write a message");
  const internal = !isOwner && !!body?.internal;

  const msg = await prisma.message.create({ data: { instanceId: instance.id, authorId: user.id, body: text, internal } });

  if (isOwner) {
    await notifyRoles(["ADMIN"], `Reply on ${instance.referenceCode}`, text.slice(0, 140), `/dashboard/admin/instances/${instance.id}`);
  } else if (!internal) {
    await notify(instance.innovatorId, `CEDA asked about ${instance.referenceCode}`, text.slice(0, 140), `/dashboard/innovator/instance-runner/${instance.id}`);
  }
  return NextResponse.json({ id: msg.id }, { status: 201 });
}
