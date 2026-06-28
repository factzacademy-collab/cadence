import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword, gradientFor } from "@/lib/password";

describe("password hashing", () => {
  it("verifies the correct password", () => {
    const hash = hashPassword("mysecret123");
    expect(verifyPassword("mysecret123", hash)).toBe(true);
  });

  it("rejects the wrong password", () => {
    const hash = hashPassword("mysecret123");
    expect(verifyPassword("wrongpassword", hash)).toBe(false);
  });

  it("produces different hashes for the same password (unique salts)", () => {
    const h1 = hashPassword("samepassword");
    const h2 = hashPassword("samepassword");
    expect(h1).not.toBe(h2);
    // but both verify the same password
    expect(verifyPassword("samepassword", h1)).toBe(true);
    expect(verifyPassword("samepassword", h2)).toBe(true);
  });

  it("produces the salt:hash format", () => {
    const hash = hashPassword("test");
    expect(hash).toMatch(/^[0-9a-f]+:[0-9a-f]+$/);
  });

  it("rejects malformed stored hashes", () => {
    expect(verifyPassword("test", "not-a-valid-hash")).toBe(false);
    expect(verifyPassword("test", "")).toBe(false);
  });
});

describe("gradientFor", () => {
  it("returns a gradient string", () => {
    const g = gradientFor("demo@cadence.app");
    expect(g).toMatch(/^from-/);
    expect(g).toMatch(/to-/);
  });

  it("is deterministic for the same input", () => {
    expect(gradientFor("test@test.com")).toBe(gradientFor("test@test.com"));
  });

  it("varies across different inputs", () => {
    const gradients = new Set(
      ["a@x.com", "b@x.com", "c@x.com", "d@x.com", "e@x.com", "f@x.com"].map(gradientFor)
    );
    expect(gradients.size).toBeGreaterThan(1);
  });
});
