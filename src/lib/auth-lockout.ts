/**
 * In-memory failed attempt tracking and lockout for OTP verification.
 * Locks destination after 5 consecutive failed attempts for 15 minutes.
 */

interface LockoutRecord {
  failedAttempts: number;
  lockedUntil?: number;
}

const lockouts = new Map<string, LockoutRecord>();

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export function checkOtpLockout(destination: string): { locked: boolean; message?: string } {
  const key = destination.trim().toLowerCase();
  const record = lockouts.get(key);
  if (!record) return { locked: false };

  const now = Date.now();
  if (record.lockedUntil && record.lockedUntil > now) {
    const minutesRemaining = Math.ceil((record.lockedUntil - now) / 60000);
    return {
      locked: true,
      message: `Too many incorrect attempts. This account is locked from OTP verification for ${minutesRemaining} minute(s).`,
    };
  }

  // Lock expired
  if (record.lockedUntil && record.lockedUntil <= now) {
    lockouts.delete(key);
    return { locked: false };
  }

  return { locked: false };
}

export function recordFailedOtpAttempt(destination: string): { locked: boolean; attemptsLeft: number } {
  const key = destination.trim().toLowerCase();
  const now = Date.now();
  const record = lockouts.get(key) || { failedAttempts: 0 };

  record.failedAttempts += 1;
  if (record.failedAttempts >= MAX_FAILED_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_DURATION_MS;
    lockouts.set(key, record);
    return { locked: true, attemptsLeft: 0 };
  }

  lockouts.set(key, record);
  return { locked: false, attemptsLeft: MAX_FAILED_ATTEMPTS - record.failedAttempts };
}

export function resetOtpLockout(destination: string) {
  const key = destination.trim().toLowerCase();
  lockouts.delete(key);
}

/**
 * Checks whether an account is a protected seeded demo account.
 * Demo accounts cannot have passwords reset/changed or sign in via OTP.
 */
export function isDemoAccount(emailOrPhone: string): boolean {
  const normalized = emailOrPhone.trim().toLowerCase();
  return normalized.endsWith("@demo.ceda.bw");
}
