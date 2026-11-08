import jwt from "jsonwebtoken";

export interface SubmissionReceipt {
  instanceId: string;
  templateCode: string;
  licenseeId: string;
  licenseeOrg: string | null;
  submittedAt: string;
  submissionNumber: number;
  dataHash: string;
  fieldCount: number;
  fileHashes: { fileKey: string; fileName: string; hash: string }[];
}

const ISSUER = "bocra-regulatory-platform";

function secret(): string {
  const s = process.env.JWT_SECRET;
  if (s) return s;
  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET must be set in production");
  }
  return "dev-only-jwt-secret";
}

export function signSubmission(payload: SubmissionReceipt): string {
  return jwt.sign(payload, secret(), { algorithm: "HS256", issuer: ISSUER });
}

export type VerifyResult =
  | { valid: true; payload: SubmissionReceipt }
  | { valid: false; reason: string; payload: SubmissionReceipt | null };

export function verifySubmission(token: string): VerifyResult {
  try {
    const payload = jwt.verify(token.trim(), secret(), { algorithms: ["HS256"], issuer: ISSUER }) as SubmissionReceipt;
    return { valid: true, payload };
  } catch (e) {
    const decoded = jwt.decode(token.trim()) as SubmissionReceipt | null;
    return { valid: false, reason: (e as Error).message, payload: decoded };
  }
}

export function isJwtSecretConfigured() {
  return !!process.env.JWT_SECRET;
}
