import type { Prisma, Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function audit(
  actorId: string,
  action: string,
  opts: { instanceId?: string; metadata?: Prisma.InputJsonValue } = {}
) {
  await prisma.auditLog.create({
    data: { actorId, action, instanceId: opts.instanceId, metadata: opts.metadata },
  });
}

export async function notify(userId: string, title: string, body: string, link?: string) {
  await prisma.notification.create({ data: { userId, title, body, link } });
}

/** Notify everyone with one of the given roles (e.g. all programme admins). */
export async function notifyRoles(roles: Role[], title: string, body: string, link?: string) {
  const users = await prisma.user.findMany({ where: { role: { in: roles } }, select: { id: true } });
  if (users.length === 0) return;
  await prisma.notification.createMany({
    data: users.map((u) => ({ userId: u.id, title, body, link })),
  });
}
