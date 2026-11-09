import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { seedDemoData } from "@/lib/seed-demo";

export async function POST() {
  const { error } = await requireUser(["SUPERADMIN"]);
  if (error) return error;

  try {
    const counts = await seedDemoData(prisma);
    return NextResponse.json({ status: "ok", ...counts });
  } catch (err) {
    console.error("Failed to reset demo data:", err);
    return NextResponse.json({ error: "Failed to reset demo data" }, { status: 500 });
  }
}
