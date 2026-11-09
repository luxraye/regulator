import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { evaluateRuleSuite } from "@/lib/instance-engine/rules";
import { validateInstanceDefinition } from "@/lib/instance-engine/validator";
import type { InstanceDefinition } from "@/lib/instance-engine/types";

interface SimulationCandidate {
  id: string;
  name: string;
  scenario: string;
  context: {
    age: number;
    citizenship: string;
    omang: string;
    youthShareholding: number;
    hasCompany: boolean;
    district: string;
    teamSize: number;
    consentGiven: boolean;
    affiliationDeclared: boolean;
    [key: string]: unknown;
  };
}

const DEFAULT_CANDIDATES: SimulationCandidate[] = [
  {
    id: "candidate-1",
    name: "Tshepo Modise (Smart Solar Chilling)",
    scenario: "Ideal Youth Innovator: 24 y/o, Botswana Citizen, 80% youth shareholding, registered company.",
    context: {
      age: 24,
      citizenship: "BW",
      omang: "123456789",
      youthShareholding: 80,
      hasCompany: true,
      district: "Gaborone",
      teamSize: 3,
      consentGiven: true,
      affiliationDeclared: true,
      fundingRequested: 180000,
      jobs12m: 6,
    },
  },
  {
    id: "candidate-2",
    name: "Boitumelo Phiri (Agri-Fintech)",
    scenario: "Age Boundary: 38 y/o applicant applying under youth challenge.",
    context: {
      age: 38,
      citizenship: "BW",
      omang: "987654321",
      youthShareholding: 100,
      hasCompany: true,
      district: "Maun",
      teamSize: 2,
      consentGiven: true,
      affiliationDeclared: true,
      fundingRequested: 95000,
      jobs12m: 3,
    },
  },
  {
    id: "candidate-3",
    name: "Kabelo Dube & Partners (Eco-Packaging)",
    scenario: "Low Youth Shareholding: 29 y/o lead with 35% youth equity (majority non-youth co-owners).",
    context: {
      age: 29,
      citizenship: "BW",
      omang: "456789123",
      youthShareholding: 35,
      hasCompany: true,
      district: "Francistown",
      teamSize: 4,
      consentGiven: true,
      affiliationDeclared: true,
      fundingRequested: 220000,
      jobs12m: 10,
    },
  },
  {
    id: "candidate-4",
    name: "Non-Citizen Team",
    scenario: "Citizenship Restriction: Foreign passport without Botswana national citizenship.",
    context: {
      age: 27,
      citizenship: "ZA",
      omang: "",
      youthShareholding: 100,
      hasCompany: false,
      district: "Gaborone",
      teamSize: 1,
      consentGiven: true,
      affiliationDeclared: false,
      fundingRequested: 50000,
      jobs12m: 2,
    },
  },
];

/**
 * POST /api/instances-engine/simulate
 * Dry-runs sample and custom candidates through instance eligibility rules,
 * guard checks, and scoring rubrics.
 */
export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { definition, customCandidate } = body;

    if (!definition) {
      return NextResponse.json({ error: "Instance definition is required" }, { status: 400 });
    }

    const validation = validateInstanceDefinition(definition);
    const def = (definition as InstanceDefinition);
    const rules = def.eligibility ?? [];

    const candidatesToTest = [...DEFAULT_CANDIDATES];
    if (customCandidate) {
      candidatesToTest.unshift({
        id: "custom-candidate",
        name: customCandidate.name || "Custom Test Candidate",
        scenario: "Interactive user-configured simulation candidate",
        context: customCandidate,
      });
    }

    const candidateResults = candidatesToTest.map((c) => {
      const evalReport = evaluateRuleSuite(rules, c.context);

      // Guard inspection checks simulation
      const guardsReport = {
        magicBytesPassed: true,
        archiveLimitsPassed: true,
        malwareSignatureClean: true,
        status: "PASSED",
      };

      // Rubric preview simulation (sample marks out of 100)
      const criteriaBreakdown = (def.rubric?.criteria ?? []).map((crit) => {
        const sampleScoreRatio = evalReport.passed ? 0.85 : 0.45;
        const awardedPoints = Math.round((crit.weight * sampleScoreRatio) * 10) / 10;
        return {
          criterionKey: crit.key,
          label: crit.label,
          weight: crit.weight,
          simulatedPoints: awardedPoints,
        };
      });

      const totalSimulatedScore = criteriaBreakdown.reduce((sum, cb) => sum + cb.simulatedPoints, 0);

      return {
        candidateId: c.id,
        name: c.name,
        scenario: c.scenario,
        eligible: evalReport.passed,
        scorePercentage: evalReport.score,
        ruleResults: evalReport.results,
        guardsReport,
        simulatedScore: Math.round(totalSimulatedScore),
        verdict: evalReport.passed ? "ELIGIBLE" : "INELIGIBLE",
        summaryExplanation: evalReport.passed
          ? "Satisfies all eligibility requirements, youth ownership thresholds, and statutory consent."
          : `Failed ${evalReport.results.filter((r) => !r.passed).length} eligibility condition(s): ` +
            evalReport.results
              .filter((r) => !r.passed)
              .map((r) => r.message)
              .join("; "),
      };
    });

    return NextResponse.json({
      validDefinition: validation.valid,
      validationErrors: validation.errors,
      validationWarnings: validation.warnings,
      candidateResults,
      testedRulesCount: rules.length,
      criteriaCount: def.rubric?.criteria?.length ?? 0,
    });
  } catch (error) {
    console.error("POST /api/instances-engine/simulate error:", error);
    return NextResponse.json({ error: "Simulation failed" }, { status: 500 });
  }
}
