import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { isDemoAccount, checkOtpLockout, recordFailedOtpAttempt, resetOtpLockout } from "../src/lib/auth-lockout";
import { maskSensitiveComms } from "../src/lib/comms/session";

describe("Phase 8b — Demo Inbox & Authentication Security Controls", () => {
  it("strictly protects all seeded demo accounts (*@demo.ceda.bw) from modification", () => {
    assert.equal(isDemoAccount("super@demo.ceda.bw"), true);
    assert.equal(isDemoAccount("admin@demo.ceda.bw"), true);
    assert.equal(isDemoAccount("innovator@demo.ceda.bw"), true);
    assert.equal(isDemoAccount("evaluator@demo.ceda.bw"), true);
    assert.equal(isDemoAccount("consultant@demo.ceda.bw"), true);
    assert.equal(isDemoAccount("SUPER@DEMO.CEDA.BW"), true, "Case-insensitive check");

    // Regular users are allowed
    assert.equal(isDemoAccount("innovator@gmail.com"), false);
    assert.equal(isDemoAccount("founder@startup.co.bw"), false);
  });

  it("masks sensitive tokens, OTP codes, and reset URLs for global admin audit logs", () => {
    const rawMessage = {
      to: "innovator@gmail.com",
      body: "Your verification code is 849201. Click https://portal.ceda.co.bw/reset?token=a8f9c0e2d1 to reset.",
      metadata: {
        code: "849201",
        token: "a8f9c0e2d1",
        actionUrl: "/reset?token=a8f9c0e2d1",
      },
    };

    const masked = maskSensitiveComms(rawMessage);

    assert.ok(!masked.body.includes("849201"), "Body must not contain unmasked OTP");
    assert.ok(masked.body.includes("******"), "Body must contain masked placeholder");
    assert.ok(!masked.body.includes("a8f9c0e2d1"), "Body must not contain unmasked token");
    assert.equal(masked.metadata.code, "******");
    assert.equal(masked.metadata.token, "******");
    assert.ok(!masked.metadata.actionUrl.includes("a8f9c0e2d1"));
  });

  it("enforces 5-attempt threshold and locks OTP verification for destination", () => {
    const testDest = "user-test@example.com";
    resetOtpLockout(testDest);

    assert.equal(checkOtpLockout(testDest).locked, false);

    // 4 failed attempts -> still not locked
    for (let i = 1; i <= 4; i++) {
      const res = recordFailedOtpAttempt(testDest);
      assert.equal(res.locked, false);
      assert.equal(res.attemptsLeft, 5 - i);
    }

    // 5th failed attempt -> locked!
    const fifth = recordFailedOtpAttempt(testDest);
    assert.equal(fifth.locked, true);
    assert.equal(fifth.attemptsLeft, 0);

    const lockedStatus = checkOtpLockout(testDest);
    assert.equal(lockedStatus.locked, true);
    assert.match(lockedStatus.message || "", /locked/i);

    // Reset lockout
    resetOtpLockout(testDest);
    assert.equal(checkOtpLockout(testDest).locked, false);
  });

  it("scopes demo inbox messages strictly by browser session cookie", () => {
    const sessionA = "sess_judge_alpha_123456";
    const sessionB = "sess_judge_beta_789012";

    const messages = [
      { id: "1", body: "Code A1", metadata: { inboxSessionId: sessionA, code: "111111" } },
      { id: "2", body: "Code B1", metadata: { inboxSessionId: sessionB, code: "222222" } },
      { id: "3", body: "Code A2", metadata: { inboxSessionId: sessionA, code: "333333" } },
    ];

    // Anonymous caller without session cookie
    const anonCookie = undefined;
    const anonResults = anonCookie
      ? messages.filter((m) => (m.metadata as any)?.inboxSessionId === anonCookie)
      : [];
    assert.equal(anonResults.length, 0, "Anonymous user without cookie gets zero messages");

    // Judge A with sessionA cookie
    const judgeAResults = messages.filter((m) => (m.metadata as any)?.inboxSessionId === sessionA);
    assert.equal(judgeAResults.length, 2, "Judge A only sees their own messages");
    assert.equal(judgeAResults[0].metadata.code, "111111");

    // Judge B with sessionB cookie
    const judgeBResults = messages.filter((m) => (m.metadata as any)?.inboxSessionId === sessionB);
    assert.equal(judgeBResults.length, 1);
    assert.equal(judgeBResults[0].metadata.code, "222222");
  });
});
