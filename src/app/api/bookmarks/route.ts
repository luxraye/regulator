import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const bookmarks = await prisma.bookmark.findMany({
    where: { userId: (session.user as any).id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(bookmarks);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, url, category } = await req.json();

  if (!title || !url) {
    return NextResponse.json({ error: "Title and URL are required" }, { status: 400 });
  }

  const bookmark = await prisma.bookmark.create({
    data: {
      userId: (session.user as any).id,
      title,
      url,
      category: category || null,
    },
  });

  return NextResponse.json(bookmark, { status: 201 });
}
