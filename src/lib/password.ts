import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

/**
 * Password hashing utilities (server-only by convention — do not import from
 * client components). Uses Node's scrypt with a per-user salt.
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const test = scryptSync(password, salt, 64);
  const target = Buffer.from(hash, "hex");
  if (test.length !== target.length) return false;
  return timingSafeEqual(test, target);
}

/** Stable avatar gradient from a string (for new users). */
export function gradientFor(seed: string): string {
  const h = createHash("sha256").update(seed).digest();
  const opts = [
    "from-primary to-mint",
    "from-coral to-amber-brand",
    "from-plum to-primary",
    "from-mint to-coral",
    "from-amber-brand to-coral",
    "from-primary to-plum",
  ];
  return opts[h[0] % opts.length];
}
