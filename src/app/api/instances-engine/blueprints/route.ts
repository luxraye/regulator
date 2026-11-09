import { NextResponse } from "next/server";
import { BLUEPRINT_CATALOG } from "@/lib/instance-engine/blueprints";

/**
 * GET /api/instances-engine/blueprints
 * Returns pre-configured competition blueprints.
 */
export async function GET() {
  return NextResponse.json({
    blueprints: BLUEPRINT_CATALOG.map((b) => ({
      id: b.id,
      key: b.key,
      name: b.name,
      category: b.category,
      description: b.description,
      partnerSlug: b.partnerSlug,
      prizes: b.defaultPrizes,
      stageCount: b.definition.timeline.length,
      rubricCriteriaCount: b.definition.rubric.criteria.length,
    })),
  });
}
