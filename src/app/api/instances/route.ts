import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = (session.user as any).role;
  const userId = (session.user as any).id;

  let instances;
  if (role === "ADMIN" || role === "SUPERADMIN") {
    instances = await prisma.instance.findMany({
      include: { template: true, licensee: true },
      orderBy: { createdAt: "desc" },
    });
  } else {
    instances = await prisma.instance.findMany({
      where: { licenseeId: userId },
      include: { template: true },
      orderBy: { createdAt: "desc" },
    });
  }

  return NextResponse.json(instances);
}
