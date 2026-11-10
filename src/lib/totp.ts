import crypto from "crypto";

/**
 * Standard RFC 6238 TOTP implementation using Node.js crypto.
 * No external dependencies required.
 */
export function generateTotpSecret(): string {
  // 20 bytes = 160 bits, standard for SHA-1 TOTP
  const bytes = crypto.randomBytes(20);
  return base32Encode(bytes);
}

const BASE32_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

function base32Encode(buffer: Buffer): string {
  let bits = 0;
  let value = 0;
  let output = "";

  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;

    while (bits >= 5) {
      output += BASE32_CHARS[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += BASE32_CHARS[(value << (5 - bits)) & 31];
  }

  return output;
}

function base32Decode(str: string): Buffer {
  const cleanStr = str.replace(/=+$/, "").toUpperCase();
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];

  for (let i = 0; i < cleanStr.length; i++) {
    const idx = BASE32_CHARS.indexOf(cleanStr[i]);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;

    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return Buffer.from(bytes);
}

export function generateTotpToken(secret: string, counter?: number): string {
  const timeStep = counter !== undefined ? counter : Math.floor(Date.now() / 1000 / 30);
  const timeBuf = Buffer.alloc(8);
  timeBuf.writeBigInt64BE(BigInt(timeStep));

  const key = base32Decode(secret);
  const hmac = crypto.createHmac("sha1", key).update(timeBuf).digest();

  const offset = hmac[hmac.length - 1] & 0x0f;
  const binary =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  const otp = (binary % 1000000).toString().padStart(6, "0");
  return otp;
}

export function verifyTotpToken(secret: string, token: string, window = 1): boolean {
  if (!token || token.length !== 6) return false;
  const currentStep = Math.floor(Date.now() / 1000 / 30);

  for (let offset = -window; offset <= window; offset++) {
    const expected = generateTotpToken(secret, currentStep + offset);
    if (crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected))) {
      return true;
    }
  }
  return false;
}

export function getTotpUri(secret: string, accountName: string, issuer = "CEDA Innovation"): string {
  const encIssuer = encodeURIComponent(issuer);
  const encAccount = encodeURIComponent(accountName);
  return `otpauth://totp/${encIssuer}:${encAccount}?secret=${secret}&issuer=${encIssuer}&algorithm=SHA1&digits=6&period=30`;
}
