import crypto from "crypto";

/** Short public reference for an idea, e.g. CEDA-26-4F7Q. No 0/O or 1/I to avoid misreading over the phone. */
export function newReferenceCode(year = new Date().getFullYear()): string {
  const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  const bytes = crypto.randomBytes(4);
  const code = Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
  return `CEDA-${String(year).slice(-2)}-${code}`;
}
