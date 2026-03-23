import crypto from "crypto";

export function hashBuffer(buffer: Buffer): string {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

export async function hashFileClient(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function verifyHash(buffer: Buffer, expectedHash: string): boolean {
  const actualHash = hashBuffer(buffer);
  return actualHash === expectedHash;
}
