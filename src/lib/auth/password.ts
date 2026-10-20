import { scrypt, randomBytes, timingSafeEqual, createHash } from "node:crypto";

const SCRYPT_KEYLEN = 64;
const MIN_PASSWORD_LENGTH = 10;

function passwordPolicy(password: string): void {
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
  }
  if (!/[A-Z]/.test(password)) {
    throw new Error("Password must contain an uppercase letter.");
  }
  if (!/[a-z]/.test(password)) {
    throw new Error("Password must contain a lowercase letter.");
  }
  if (!/[0-9]/.test(password)) {
    throw new Error("Password must contain a digit.");
  }
}

/** scrypt hash in `scrypt$<salt-hex>$<key-hex>` form (salted per password). */
export function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      passwordPolicy(password);
    } catch (err) {
      reject(err);
      return;
    }
    const salt = randomBytes(16).toString("hex");
    scrypt(password, salt, SCRYPT_KEYLEN, (err, derived) => {
      if (err) reject(err);
      else resolve(`scrypt$${salt}$${(derived as Buffer).toString("hex")}`);
    });
  });
}

/** Constant-time verification against a stored hash. Never throws. */
export function verifyPassword(password: string, stored: string): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const [algo, salt, expected] = stored.split("$");
      if (algo !== "scrypt" || !salt || !expected) {
        resolve(false);
        return;
      }
      scrypt(password, salt, SCRYPT_KEYLEN, (err, derived) => {
        if (err) {
          resolve(false);
          return;
        }
        const a = Buffer.from((derived as Buffer).toString("hex"));
        const b = Buffer.from(expected);
        resolve(a.length === b.length && timingSafeEqual(a, b));
      });
    } catch {
      resolve(false);
    }
  });
}

/** Unguessable opaque token for session cookies (base64url, 256-bit). */
export function randomToken(): string {
  return randomBytes(32).toString("base64url");
}

/** SHA-256 hex for storing tokens and OTP codes (preimage never stored). */
export function sha256hex(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}
