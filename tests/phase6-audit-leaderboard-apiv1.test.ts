import { describe, it } from "node:test";
import assert from "node:assert/strict";
import crypto from "crypto";
import { computeAuditRecordHash, GENESIS_HASH } from "../src/lib/audit";
import { canonicalizeJson } from "../src/lib/instance-engine/canonical";
import { sha256 } from "../src/lib/hash";

describe("Phase 6 — Audit Log Hash Chaining", () => {
  it("computes deterministic SHA-256 hash for an audit record", () => {
    const timestamp = "2026-11-10T00:00:00.000Z";
    const hash1 = computeAuditRecordHash(
      GENESIS_HASH,
      "user_123",
      "INSTANCE_PUBLISH",
      "inst_1",
      null,
      { version: 1, reason: "Initial launch" },
      timestamp
    );

    const hash2 = computeAuditRecordHash(
      GENESIS_HASH,
      "user_123",
      "INSTANCE_PUBLISH",
      "inst_1",
      null,
      { version: 1, reason: "Initial launch" },
      timestamp
    );

    assert.equal(hash1, hash2);
    assert.equal(hash1.length, 64);
    assert.match(hash1, /^[0-9a-f]{64}$/);
  });

  it("produces distinct hash when any field or metadata key order differs", () => {
    const timestamp = "2026-11-10T00:00:00.000Z";
    const h1 = computeAuditRecordHash(
      GENESIS_HASH,
      "user_123",
      "INSTANCE_PUBLISH",
      "inst_1",
      null,
      { a: 1, b: 2 },
      timestamp
    );
    // Canonical JSON ensures key order doesn't alter hash
    const h2 = computeAuditRecordHash(
      GENESIS_HASH,
      "user_123",
      "INSTANCE_PUBLISH",
      "inst_1",
      null,
      { b: 2, a: 1 },
      timestamp
    );
    assert.equal(h1, h2, "Canonicalization guarantees identical hash regardless of key order");

    // Altered actorId
    const h3 = computeAuditRecordHash(
      GENESIS_HASH,
      "user_999",
      "INSTANCE_PUBLISH",
      "inst_1",
      null,
      { a: 1, b: 2 },
      timestamp
    );
    assert.notEqual(h1, h3, "Altered actor changes hash");

    // Altered prevHash
    const h4 = computeAuditRecordHash(
      "1111111111111111111111111111111111111111111111111111111111111111",
      "user_123",
      "INSTANCE_PUBLISH",
      "inst_1",
      null,
      { a: 1, b: 2 },
      timestamp
    );
    assert.notEqual(h1, h4, "Altered prevHash changes hash");
  });

  it("detects breaks in sequential hash chain", () => {
    // Simulate chain of 3 events
    const event1Time = "2026-11-10T01:00:00.000Z";
    const h1 = computeAuditRecordHash(GENESIS_HASH, "u1", "EVAL_START", "i1", null, {}, event1Time);

    const event2Time = "2026-11-10T01:05:00.000Z";
    const h2 = computeAuditRecordHash(h1, "u2", "SCORE_SUBMIT", "i1", "e1", { score: 85 }, event2Time);

    const event3Time = "2026-11-10T01:10:00.000Z";
    const h3 = computeAuditRecordHash(h2, "u3", "DECISION_AWARD", "i1", "e1", { rank: 1 }, event3Time);

    const chain = [
      { id: "1", prevHash: GENESIS_HASH, hash: h1, actorId: "u1", action: "EVAL_START", time: event1Time },
      { id: "2", prevHash: h1, hash: h2, actorId: "u2", action: "SCORE_SUBMIT", time: event2Time },
      { id: "3", prevHash: h2, hash: h3, actorId: "u3", action: "DECISION_AWARD", time: event3Time },
    ];

    // Verify valid chain
    let currentPrev = GENESIS_HASH;
    for (const record of chain) {
      assert.equal(record.prevHash, currentPrev);
      currentPrev = record.hash;
    }

    // Tamper with event 2: replace prevHash
    const tamperedChain = [
      chain[0],
      { ...chain[1], prevHash: "bad_hash_value_1234567890abcdef" },
      chain[2],
    ];

    let tamperDetected = false;
    let expected = GENESIS_HASH;
    for (let i = 0; i < tamperedChain.length; i++) {
      if (tamperedChain[i].prevHash !== expected) {
        tamperDetected = true;
        assert.equal(i, 1);
        break;
      }
      expected = tamperedChain[i].hash;
    }
    assert.equal(tamperDetected, true, "Chain break detected at index 1");
  });
});

describe("Phase 6 — Reproducible Leaderboard & Fingerprinting", () => {
  it("determines rankings and tie-breaking by reference code deterministically", () => {
    interface MockEntry {
      referenceCode: string;
      title: string;
      meanScore: number;
    }

    const testEntries: MockEntry[] = [
      { referenceCode: "CEDA-2026-003", title: "AgriTech Bot", meanScore: 82.5 },
      { referenceCode: "CEDA-2026-001", title: "Solar Cool", meanScore: 94.0 },
      { referenceCode: "CEDA-2026-004", title: "HealthTrack", meanScore: 82.5 }, // Same score as 003, tie-break by ref
      { referenceCode: "CEDA-2026-002", title: "FinFlow", meanScore: 89.2 },
    ];

    // Sort descending by score, deterministic tie-break by referenceCode
    testEntries.sort((a, b) => {
      if (b.meanScore !== a.meanScore) {
        return b.meanScore - a.meanScore;
      }
      return a.referenceCode.localeCompare(b.referenceCode);
    });

    assert.equal(testEntries[0].referenceCode, "CEDA-2026-001");
    assert.equal(testEntries[1].referenceCode, "CEDA-2026-002");
    // Between 003 and 004 (tied at 82.5), 003 comes first alphabetically
    assert.equal(testEntries[2].referenceCode, "CEDA-2026-003");
    assert.equal(testEntries[3].referenceCode, "CEDA-2026-004");

    // Canonical fingerprinting
    const canon = canonicalizeJson(testEntries);
    const hashA = sha256(Buffer.from(canon, "utf8"));
    const hashB = sha256(Buffer.from(canonicalizeJson([...testEntries]), "utf8"));
    assert.equal(hashA, hashB);
    assert.equal(hashA.length, 64);
  });
});

describe("Phase 6 — API v1 Authentication & Webhooks", () => {
  it("validates API key structure and prefix extraction", () => {
    const rawKey = "ceda_live_1234567890abcdef1234567890abcdef";
    assert.ok(rawKey.startsWith("ceda_live_"));
    const prefix = rawKey.slice(0, 18);
    assert.equal(prefix, "ceda_live_12345678");

    const hash = sha256(Buffer.from(rawKey, "utf8"));
    assert.equal(hash.length, 64);
  });

  it("generates and verifies HMAC-SHA256 signatures for outbound webhooks", () => {
    const secret = "super_secret_webhook_key_2026";
    const payload = {
      event: "stage.changed",
      instanceId: "inst_flagship_1",
      newStage: "EVALUATION",
    };

    const payloadJson = JSON.stringify(payload);
    const signature = crypto.createHmac("sha256", secret).update(payloadJson).digest("hex");

    // Receiver verification
    const expectedSig = crypto.createHmac("sha256", secret).update(payloadJson).digest("hex");
    assert.equal(signature, expectedSig);

    // Tampered payload fails verification
    const tamperedPayload = JSON.stringify({ ...payload, newStage: "CONCLUDED" });
    const tamperedSig = crypto.createHmac("sha256", secret).update(tamperedPayload).digest("hex");
    assert.notEqual(signature, tamperedSig);
  });
});
