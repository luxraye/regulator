import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const role = searchParams.get("role");

  const users = await prisma.user.findMany({
    where: role ? { role: role as any } : undefined,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      organizationName: true,
      licenseNumber: true,
      createdAt: true,
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(users);
}
