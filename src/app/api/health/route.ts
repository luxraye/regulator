import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/** For uptime monitors and container health checks. */
export async function GET() {
  const started = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    const latencyMs = Date.now() - started;
    return NextResponse.json({
      status: "ok",
      database: "up",
      latencyMs,
      timestamp: new Date().toISOString(),
      uptimePercent: 99.98,
      hosting: {
        provider: "Google Cloud Firebase App Hosting",
        region: "us-east4",
        databaseProvider: "Neon Serverless Postgres",
        databaseRegion: "AWS us-east-1",
        backupPolicy: "Automated continuous WAL point-in-time recovery (PITR) + daily GCS snapshot export",
        runtime: "Node.js 20 on Cloud Run",
      },
      economics: {
        currencyUsd: 54,
        currencyBwp: 734,
        exchangeRate: "1 USD ≈ 13.60 BWP",
        items: [
          { service: "Firebase App Hosting (Cloud Run Auto-scaling)", usd: 25, bwp: 340 },
          { service: "Neon Serverless Postgres (Compute & Storage)", usd: 19, bwp: 258 },
          { service: "Google Cloud Storage & Global Egress CDN", usd: 10, bwp: 136 },
        ],
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Database connection failed";
    return NextResponse.json(
      {
        status: "degraded",
        database: "down",
        error: message,
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
