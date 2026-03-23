import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";

interface SubmissionPayload {
  instanceId: string;
  licenseeId: string;
  submittedAt: string;
  fileHashes: { fileName: string; hash: string }[];
  fieldCount: number;
}

export function signSubmission(payload: SubmissionPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "100y" });
}

export function verifySubmission(token: string): SubmissionPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SubmissionPayload;
  } catch {
    return null;
  }
}
