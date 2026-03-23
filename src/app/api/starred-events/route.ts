import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const events = await prisma.starredEvent.findMany({
    where: { userId: (session.user as any).id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(events);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, date, url, notes } = await req.json();

  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const event = await prisma.starredEvent.create({
    data: {
      userId: (session.user as any).id,
      title,
      date: date ? new Date(date) : null,
      url: url || null,
      notes: notes || null,
    },
  });

  return NextResponse.json(event, { status: 201 });
}
