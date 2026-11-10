import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const sessionUser = await getSessionUser();
  if (!sessionUser?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: sessionUser.email },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      omang: true,
      emailVerifiedAt: true,
      phoneVerifiedAt: true,
      totpEnabled: true,
      partnerId: true,
      createdAt: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(user);
}
