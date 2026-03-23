import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const complaints = await prisma.complaint.findMany({
    where: { userId: (session.user as any).id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(complaints);
}
