import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  FLAGSHIP_CEDA_HACKATHON_2026,
  validateInstanceDefinition,
  canonicalizeJson,
  computeRulesHash,
  evaluateRuleSuite,
  evaluateRuleExpression,
  compileInstance,
  type InstanceDefinition,
  type AtomicRule,
  type CompoundRule,
} from "../src/lib/instance-engine";

describe("Instance Engine — Definition Schema & Validator", () => {
  test("Flagship Hackathon 2026 definition passes full validation with zero errors", () => {
    assert.ok(FLAGSHIP_CEDA_HACKATHON_2026, "Flagship definition must exist");
    const result = validateInstanceDefinition(FLAGSHIP_CEDA_HACKATHON_2026);
    assert.equal(result.valid, true, `Validation failed: ${JSON.stringify(result.errors)}`);
    assert.equal(result.errors.length, 0);
  });

  test("Fails validation when rubric weights do not sum to 100%", () => {
    const invalidDef: InstanceDefinition = JSON.parse(JSON.stringify(FLAGSHIP_CEDA_HACKATHON_2026));
    invalidDef.rubric.criteria[0].weight = 99; // Alters sum from 100% to 174%
    const result = validateInstanceDefinition(invalidDef);
    assert.equal(result.valid, false);
    const rubricErr = result.errors.find((e) => e.path.includes("rubric"));
    assert.ok(rubricErr, "Expected error on rubric weight sum");
    assert.ok(rubricErr.message.includes("100%"), `Error message should mention 100%: ${rubricErr.message}`);
  });

  test("Fails validation when timeline dates are inverted", () => {
    const invalidDef: InstanceDefinition = JSON.parse(JSON.stringify(FLAGSHIP_CEDA_HACKATHON_2026));
    invalidDef.timeline[0].start = "2026-11-20T00:00:00Z";
    invalidDef.timeline[0].end = "2026-11-10T00:00:00Z";
    const result = validateInstanceDefinition(invalidDef);
    assert.equal(result.valid, false);
    const timeErr = result.errors.find((e) => e.path.includes("timeline"));
    assert.ok(timeErr, "Expected timeline continuity error");
  });

  test("Fails validation when team min exceeds team max", () => {
    const invalidDef: InstanceDefinition = JSON.parse(JSON.stringify(FLAGSHIP_CEDA_HACKATHON_2026));
    invalidDef.team.minSize = 5;
    invalidDef.team.maxSize = 2;
    const result = validateInstanceDefinition(invalidDef);
    assert.equal(result.valid, false);
    const teamErr = result.errors.find((e) => e.path.includes("team"));
    assert.ok(teamErr, "Expected team sizing bounds error");
  });
});

describe("Instance Engine — Canonicalization & Fingerprinting", () => {
  test("Deep key order invariance produces identical canonical JSON and rulesHash", () => {
    const objA = {
      b: 2,
      a: 1,
      nested: { z: "last", y: [1, 2, { d: 4, c: 3 }] },
    };
    const objB = {
      nested: { y: [1, 2, { c: 3, d: 4 }], z: "last" },
      a: 1,
      b: 2,
    };

    const canonA = canonicalizeJson(objA);
    const canonB = canonicalizeJson(objB);
    assert.equal(canonA, canonB, "Canonical representations must be byte-for-byte identical");

    const hashA = computeRulesHash(objA);
    const hashB = computeRulesHash(objB);
    assert.equal(hashA, hashB, "Computed rulesHash must match regardless of key insertion order");
    assert.equal(hashA.length, 64, "SHA-256 hex string must be 64 characters");
  });

  test("Any modification to definition payload strictly alters the rulesHash fingerprint", () => {
    const baseHash = computeRulesHash(FLAGSHIP_CEDA_HACKATHON_2026);
    const modified: InstanceDefinition = JSON.parse(JSON.stringify(FLAGSHIP_CEDA_HACKATHON_2026));
    modified.meta.name = "Modified Competition Name";
    const modifiedHash = computeRulesHash(modified);
    assert.notEqual(baseHash, modifiedHash, "RulesHash must differ when payload changes");
  });
});

describe("Instance Engine — Deterministic Rule Evaluator", () => {
  const rules = FLAGSHIP_CEDA_HACKATHON_2026.eligibility;

  test("Passes fully eligible youth innovator team", () => {
    const context = {
      age: 26,
      citizenship: "BW",
      omang: "123456789",
      youthShareholding: 75,
      hasCompany: true,
      affiliationDeclared: true,
      consentGiven: true,
      teamSize: 3,
    };

    const evaluation = evaluateRuleSuite(rules, context);
    assert.equal(evaluation.passed, true);
    assert.equal(evaluation.score, 100);
  });

  test("Fails with clear diagnostic when youth shareholding is <= 50%", () => {
    const context = {
      age: 24,
      citizenship: "BW",
      omang: "123456789",
      youthShareholding: 40,
      hasCompany: true,
      affiliationDeclared: true,
      consentGiven: true,
      teamSize: 2,
    };

    const evaluation = evaluateRuleSuite(rules, context);
    assert.equal(evaluation.passed, false);
    const failedRule = evaluation.results.find((r) => r.field === "youthShareholding");
    assert.ok(failedRule, "Expected youthShareholding rule to fail");
    assert.equal(failedRule.passed, false);
  });

  test("Fails when applicant age is outside youth window (> 35)", () => {
    const context = {
      age: 38,
      citizenship: "BW",
      omang: "123456789",
      youthShareholding: 100,
      hasCompany: true,
      affiliationDeclared: true,
      consentGiven: true,
      teamSize: 1,
    };

    const evaluation = evaluateRuleSuite(rules, context);
    assert.equal(evaluation.passed, false);
    const ageRule = evaluation.results.find((r) => r.field === "age");
    assert.ok(ageRule, "Expected age rule to fail");
    assert.equal(ageRule.passed, false);
  });

  test("Evaluates compound ASTs (ALL, ANY, NOT) accurately", () => {
    const compoundAll: CompoundRule = {
      all: [
        { field: "citizenship", op: "eq", value: "BW" },
        { field: "age", op: "gte", value: 18 },
      ],
      failureMessage: "Must be a Botswana citizen of legal age",
    };
    assert.equal(evaluateRuleExpression(compoundAll, { citizenship: "BW", age: 20 }).passed, true);
    assert.equal(evaluateRuleExpression(compoundAll, { citizenship: "ZA", age: 20 }).passed, false);

    const compoundAny: CompoundRule = {
      any: [
        { field: "district", op: "eq", value: "Gaborone" },
        { field: "district", op: "eq", value: "Francistown" },
      ],
    };
    assert.equal(evaluateRuleExpression(compoundAny, { district: "Gaborone" }).passed, true);
    assert.equal(evaluateRuleExpression(compoundAny, { district: "Maun" }).passed, false);

    const compoundNot: CompoundRule = {
      not: { field: "blacklisted", op: "eq", value: true },
      failureMessage: "Applicant must not be blacklisted",
    };
    assert.equal(evaluateRuleExpression(compoundNot, { blacklisted: false }).passed, true);
    assert.equal(evaluateRuleExpression(compoundNot, { blacklisted: true }).passed, false);
  });
});

describe("Instance Engine — Compiler", () => {
  test("Compiles definition into active stage timeline, form schema and guard checklist", () => {
    const compiled = compileInstance(FLAGSHIP_CEDA_HACKATHON_2026);
    assert.ok(compiled);
    assert.equal(compiled.rulesHash.length, 64);
    assert.equal(compiled.stages.length, FLAGSHIP_CEDA_HACKATHON_2026.timeline.length);
    assert.equal(compiled.rubric.criteria.length, FLAGSHIP_CEDA_HACKATHON_2026.rubric.criteria.length);
    assert.equal(compiled.slug, "ceda-hackathon-2026");
    assert.ok(compiled.guards);
    assert.ok(compiled.summary.totalPrizesPula > 0);
  });
});
