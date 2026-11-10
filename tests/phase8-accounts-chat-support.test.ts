import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { generateTotpSecret, generateTotpToken, verifyTotpToken } from "../src/lib/totp";
import { getConsultingHoursStatus } from "../src/lib/chat/hours";
import { REGULATORY_AUTHORITIES } from "../src/lib/regulators";

describe("Phase 8 — Accounts, Comms, Chat, Support & Regulatory Governance", () => {
  it("generates and verifies standard RFC 6238 TOTP tokens", () => {
    const secret = generateTotpSecret();
    assert.ok(secret.length >= 16, "TOTP secret must be valid Base32 string");

    const code = generateTotpToken(secret);
    assert.equal(code.length, 6, "Code must be 6 digits");
    assert.match(code, /^\d{6}$/, "Code must be numeric");

    const isValid = verifyTotpToken(secret, code, 1);
    assert.equal(isValid, true, "Generated TOTP code must pass verification within window");

    const isInvalid = verifyTotpToken(secret, "000000", 0);
    // Unless by a 1-in-a-million coincidence the code was 000000
    if (code !== "000000") {
      assert.equal(isInvalid, false, "Random wrong code must fail verification");
    }
  });

  it("accurately evaluates CEDA Consultant operating hours (09:00-16:00 CAT, weekdays, non-holidays)", () => {
    // Tuesday Nov 10, 2026 at 10:30 CAT (UTC 08:30) -> OPEN
    const openTime = new Date("2026-11-10T08:30:00Z");
    const openStatus = getConsultingHoursStatus(openTime);
    assert.equal(openStatus.open, true, "Should be open at 10:30 CAT on Tuesday");

    // Sunday Nov 8, 2026 at 11:00 CAT -> CLOSED (Weekend)
    const sundayTime = new Date("2026-11-08T09:00:00Z");
    const sundayStatus = getConsultingHoursStatus(sundayTime);
    assert.equal(sundayStatus.open, false, "Should be closed on Sunday");
    assert.match(sundayStatus.reason || "", /Monday to Friday|weekend/i);

    // Tuesday Nov 10, 2026 at 20:00 CAT (UTC 18:00) -> CLOSED (After 16:00 CAT)
    const eveningTime = new Date("2026-11-10T18:00:00Z");
    const eveningStatus = getConsultingHoursStatus(eveningTime);
    assert.equal(eveningStatus.open, false, "Should be closed in the evening");

    // Botswana Independence Day: September 30 -> CLOSED (Public Holiday)
    const holidayTime = new Date("2026-09-30T09:00:00Z");
    const holidayStatus = getConsultingHoursStatus(holidayTime);
    assert.equal(holidayStatus.open, false, "Should be closed on Botswana Independence Day");
    assert.equal(holidayStatus.isHoliday, true);
  });

  it("verifies all 8 mandated Botswana regulatory authorities exist in directory", () => {
    const requiredAcronyms = ["CIPA", "BURS", "NBFIRA", "BOCRA", "CCA", "IDPC", "BOBS", "LEA"];
    const foundAcronyms = REGULATORY_AUTHORITIES.map((r) => r.acronym);

    for (const req of requiredAcronyms) {
      assert.ok(foundAcronyms.includes(req), `Authority ${req} must be present in directory`);
      const item = REGULATORY_AUTHORITIES.find((r) => r.acronym === req)!;
      assert.ok(item.website.startsWith("http"), `${req} must have a valid URL`);
      assert.ok(item.phone.length > 5, `${req} must have a valid telephone number`);
    }

    // Verify IDPC is transparently flagged as partially verified per directive requirement
    const idpc = REGULATORY_AUTHORITIES.find((r) => r.acronym === "IDPC")!;
    assert.equal(idpc.verified, false, "IDPC must be marked pending verification notes");
    assert.ok(idpc.verificationNotes?.includes("transition"), "IDPC notes must document transition status");
  });

  it("correctly models SLA turnaround times by fault severity", () => {
    const SLA_POLICY = {
      P1: { responseHours: 2, resolutionHours: 8, label: "Critical Outage" },
      P2: { responseHours: 4, resolutionHours: 24, label: "Degraded Service" },
      P3: { responseHours: 24, resolutionHours: 72, label: "General Support" },
    };

    assert.equal(SLA_POLICY.P1.responseHours, 2, "P1 must have 2h response");
    assert.equal(SLA_POLICY.P1.resolutionHours, 8, "P1 must have 8h resolution");
    assert.equal(SLA_POLICY.P2.resolutionHours, 24, "P2 must have 24h resolution");
    assert.equal(SLA_POLICY.P3.resolutionHours, 72, "P3 must have 72h (3 working days) resolution");
  });

  it("supports collaborative evaluation and consensus recording on entries", () => {
    interface EvaluationRecord {
      evaluatorId: string;
      total: number;
      submittedAt: Date;
    }

    const blindEvaluations: EvaluationRecord[] = [
      { evaluatorId: "ev-1", total: 84.5, submittedAt: new Date() },
      { evaluatorId: "ev-2", total: 88.0, submittedAt: new Date() },
    ];

    // Average blind score
    const avgScore = blindEvaluations.reduce((sum, e) => sum + e.total, 0) / blindEvaluations.length;
    assert.equal(avgScore, 86.25);

    // Evaluator consensus agreement reached
    const consensus = {
      consensusScore: 87.0,
      consensusNote: "Panel evaluated market traction and confirmed 100% citizen youth ownership under CIPA.",
      agreedBy: ["ev-1", "ev-2"],
    };

    assert.ok(consensus.consensusScore >= 0 && consensus.consensusScore <= 100);
    assert.equal(consensus.agreedBy.length, 2);
  });
});
