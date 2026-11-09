import crypto from "node:crypto";
import { secret } from "@/lib/jwt-sign";

export interface AwardFacts {
  referenceCode: string;
  awardAmount: number | null;
  reviewedAt: Date | null;
  organizationName: string | null;
}

/**
 * A short code that proves a certificate came from CEDA. It is an HMAC of the award's key facts,
 * so changing the amount, date or company on a printed copy breaks it.
 */
export function certificateCode(a: AwardFacts): string {
  const facts = [a.referenceCode, a.awardAmount ?? 0, a.reviewedAt?.toISOString() ?? "", a.organizationName ?? ""].join("|");
  const hex = crypto.createHmac("sha256", secret()).update("award-certificate|" + facts).digest("hex").slice(0, 12).toUpperCase();
  return `${hex.slice(0, 4)}-${hex.slice(4, 8)}-${hex.slice(8)}`;
}

export function codeMatches(a: AwardFacts, code: string): boolean {
  const want = Buffer.from(certificateCode(a));
  const got = Buffer.from(code.toUpperCase());
  return want.length === got.length && crypto.timingSafeEqual(want, got);
}

export const verifyPath = (referenceCode: string, code: string) => `/verify/${referenceCode}/${code}`;
