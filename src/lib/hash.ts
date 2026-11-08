import crypto from "crypto";

export function sha256(data: Buffer | string): string {
  return crypto.createHash("sha256").update(data).digest("hex");
}

export function verifyHash(buffer: Buffer, expectedHash: string): boolean {
  const actual = Buffer.from(sha256(buffer), "hex");
  const expected = Buffer.from(expectedHash, "hex");
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}
