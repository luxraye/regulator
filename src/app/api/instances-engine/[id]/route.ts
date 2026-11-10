import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { compileInstance } from "@/lib/instance-engine/compiler";
import { validateInstanceDefinition } from "@/lib/instance-engine/validator";
import { updateLiveInstance } from "@/lib/instance-engine/service";
import { audit } from "@/lib/audit";
import type { InstanceDefinition } from "@/lib/instance-engine/types";
import { Prisma } from "@prisma/client";

interface RouteParams {
  params: { id: string };
}

/**
 * GET /api/instances-engine/[id]
 * Returns instance detail, full 11-section definition, compiled runtime state,
 * version history, and console oversight metrics.
 */
export async function GET(req: Request, { params }: RouteParams) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    const instance = await prisma.instance.findUnique({
      where: { id },
      include: {
        partner: true,
        versions: {
          orderBy: { version: "desc" },
          include: { createdBy: { select: { id: true, name: true, email: true } } },
        },
        roles: {
          include: { user: { select: { id: true, name: true, email: true, role: true } } },
        },
        _count: {
          select: {
            entries: true,
          },
        },
      },
    });

    if (!instance) {
      return NextResponse.json({ error: "Instance not found" }, { status: 404 });
    }

    if (user.role === "PARTNER_ADMIN" && user.partnerId && instance.partnerId !== user.partnerId) {
      return NextResponse.json({ error: "Forbidden: You may only access your partner's instances" }, { status: 403 });
    }

    const definition = instance.definition as unknown as InstanceDefinition;
    const compiled = compileInstance(definition);

    // Compute Console Oversight Metrics
    const entries = await prisma.entry.findMany({
      where: { instanceId: id },
      select: {
        id: true,
        status: true,
        createdAt: true,
        evaluations: {
          select: { id: true, total: true, submittedAt: true, evaluatorId: true },
        },
        checkResults: {
          select: { id: true, status: true, checkKey: true },
        },
      },
    });

    const totalRegistrations = entries.length;
    const eligibleCount = entries.filter((e) => e.status !== "REJECTED").length;
    const ineligibleCount = entries.filter((e) => e.status === "REJECTED").length;

    // Check failures
    let checkFailuresCount = 0;
    for (const e of entries) {
      checkFailuresCount += e.checkResults.filter((c) => c.status === "FAIL").length;
    }

    // Reviewer progress and judge variance flags
    const allEvaluations = entries.flatMap((e) => e.evaluations);
    const completedEvaluations = allEvaluations.filter((ev) => ev.submittedAt !== null);
    const pendingEvaluations = allEvaluations.filter((ev) => ev.submittedAt === null);

    // Compute score variances per entry
    const varianceFlags: { entryId: string; variance: number; reviewerCount: number }[] = [];
    const threshold = definition.rubric?.disagreementThreshold ?? 20;

    for (const e of entries) {
      const completed = e.evaluations.filter((ev) => ev.submittedAt !== null && ev.total != null);
      if (completed.length >= 2) {
        const scores = completed.map((ev) => ev.total as number);
        const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
        const variance = Math.sqrt(scores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / scores.length);
        if (variance >= threshold) {
          varianceFlags.push({ entryId: e.id, variance: Math.round(variance * 10) / 10, reviewerCount: completed.length });
        }
      }
    }

    // Fetch recent audit logs for this instance
    const auditLogs = await prisma.auditLog.findMany({
      where: { instanceId: id },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { actor: { select: { id: true, name: true, email: true } } },
    });

    const consoleMetrics = {
      totalRegistrations,
      eligibleCount,
      ineligibleCount,
      checkFailuresCount,
      completedEvaluationsCount: completedEvaluations.length,
      pendingEvaluationsCount: pendingEvaluations.length,
      varianceFlags,
      chatLoadCount: 0, // Placeholder for live chat activity
      consensusReached: varianceFlags.length === 0,
    };

    return NextResponse.json({
      instance,
      definition,
      compiled,
      consoleMetrics,
      auditLogs,
    });
  } catch (error) {
    console.error("GET /api/instances-engine/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch instance details" }, { status: 500 });
  }
}

/**
 * PUT /api/instances-engine/[id]
 * Updates an instance definition.
 * If DRAFT: updates definition in place.
 * If PUBLISHED or LIVE: invokes updateLiveInstance (version bumping, immutability check, audit reason required).
 */
export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const user = await getSessionUser();
    if (!user || !["ADMIN", "SUPERADMIN", "PARTNER_ADMIN"].includes(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json();
    const { definition, reason } = body;

    if (!definition) {
      return NextResponse.json({ error: "Definition is required" }, { status: 400 });
    }

    const val = validateInstanceDefinition(definition);
    if (!val.valid) {
      return NextResponse.json({ error: "Invalid instance definition", details: val.errors }, { status: 400 });
    }

    const existing = await prisma.instance.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Instance not found" }, { status: 404 });
    }

    if (user.role === "PARTNER_ADMIN" && user.partnerId && existing.partnerId !== user.partnerId) {
      return NextResponse.json({ error: "Forbidden: You may only update your partner's instances" }, { status: 403 });
    }

    if (existing.status === "DRAFT") {
      const opensAt = definition.timeline[0]?.start ? new Date(definition.timeline[0].start) : existing.opensAt;
      const closesAt = definition.timeline[definition.timeline.length - 1]?.end
        ? new Date(definition.timeline[definition.timeline.length - 1].end)
        : existing.closesAt;

      const updated = await prisma.instance.update({
        where: { id },
        data: {
          name: definition.meta?.name ?? existing.name,
          definition: definition as unknown as Prisma.InputJsonValue,
          opensAt,
          closesAt,
        },
      });

      await audit(user.id, "UPDATE_DRAFT_INSTANCE", {
        instanceId: id,
        metadata: { name: updated.name },
      });

      return NextResponse.json({ success: true, instance: updated });
    }

    // Published or Live instance: must use updateLiveInstance
    if (!reason || !reason.trim()) {
      return NextResponse.json({ error: "An audit reason is required to update a published instance." }, { status: 400 });
    }

    const updateResult = await updateLiveInstance(id, definition, reason, user.id);

    if (!updateResult.success) {
      return NextResponse.json({ error: updateResult.errors?.join(", ") || "Update rejected" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      version: updateResult.version,
      rulesHash: updateResult.rulesHash,
    });
  } catch (error) {
    console.error("PUT /api/instances-engine/[id] error:", error);
    return NextResponse.json({ error: "Failed to update instance" }, { status: 500 });
  }
}

/**
 * DELETE /api/instances-engine/[id]
 * Deletes or archives an instance.
 */
export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const user = await getSessionUser();
    if (!user || !["ADMIN", "SUPERADMIN"].includes(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const existing = await prisma.instance.findUnique({
      where: { id },
      include: { _count: { select: { entries: true } } },
    });

    if (!existing) {
      return NextResponse.json({ error: "Instance not found" }, { status: 404 });
    }

    if (existing._count.entries > 0 || existing.status !== "DRAFT") {
      // Cannot hard delete an instance with entries or non-draft; archive it
      const archived = await prisma.instance.update({
        where: { id },
        data: { status: "ARCHIVED" },
      });
      return NextResponse.json({ success: true, action: "ARCHIVED", instance: archived });
    }

    await prisma.instance.delete({ where: { id } });
    return NextResponse.json({ success: true, action: "DELETED" });
  } catch (error) {
    console.error("DELETE /api/instances-engine/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete instance" }, { status: 500 });
  }
}
