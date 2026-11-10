import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { computeRulesHash, canonicalizeJson } from "@/lib/instance-engine/canonical";
import { ensureFlagshipInstance } from "@/lib/instance-engine/flagship";
import type { InstanceDefinition } from "@/lib/instance-engine/types";

interface RouteParams {
  params: { slug: string };
}

/**
 * GET /api/instances-public/[slug]/verify
 * Public endpoint to verify that an instance's published rules have not been tampered with.
 * Deterministically recomputes the SHA-256 fingerprint from the canonical definition.
 */
export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { slug } = params;

    if (slug === "ceda-hackathon-2026") {
      await ensureFlagshipInstance(prisma);
    }

    const instance = await prisma.instance.findUnique({
      where: { slug },
      include: {
        partner: { select: { name: true, slug: true } },
        versions: {
          orderBy: { version: "desc" },
          take: 5,
          select: { version: true, rulesHash: true, reason: true, createdAt: true },
        },
      },
    });

    if (!instance) {
      return NextResponse.json({ error: "Competition instance not found" }, { status: 404 });
    }

    const def = instance.definition as unknown as InstanceDefinition;
    const computedHash = computeRulesHash(def);
    const storedHash = instance.rulesHash;
    const matches = computedHash === storedHash;

    const canonicalString = canonicalizeJson(def);

    return NextResponse.json({
      verified: matches,
      matches,
      instanceName: instance.name,
      slug: instance.slug,
      partner: instance.partner?.name,
      status: instance.status,
      storedRulesHash: storedHash,
      computedRulesHash: computedHash,
      byteLength: Buffer.byteLength(canonicalString, "utf8"),
      verifiedAt: new Date().toISOString(),
      currentVersion: instance.versions[0]?.version ?? 1,
      versionHistory: instance.versions,
    });
  } catch (error) {
    console.error("GET /api/instances-public/[slug]/verify error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
