import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword, randomToken, sha256hex } from "@/lib/auth/password";

describe("password primitives", () => {
  it("hashes and verifies with per-hash salts", async () => {
    const a = await hashPassword("Correct Horse 9!");
    const b = await hashPassword("Correct Horse 9!");
    expect(a).not.toBe(b);
    expect(await verifyPassword("Correct Horse 9!", a)).toBe(true);
    expect(await verifyPassword("correct horse 9!", a)).toBe(false);
    expect(await verifyPassword("", a)).toBe(false);
  });

  it("rejects weak passwords at the gate", async () => {
    await expect(hashPassword("short1!")).rejects.toThrow(/at least 10/);
    await expect(hashPassword("nouppercase123!")).rejects.toThrow();
    await expect(hashPassword("NoDigitsHere!!")).rejects.toThrow();
  });

  it("mints unguessable tokens with hashed storage", () => {
    const t1 = randomToken();
    const t2 = randomToken();
    expect(t1).not.toBe(t2);
    expect(t1.length).toBeGreaterThanOrEqual(43);
    expect(sha256hex(t1)).toMatch(/^[0-9a-f]{64}$/);
  });

  it("compares hashes in constant time", async () => {
    const h = await hashPassword("Constant Time 1!");
    expect(await verifyPassword("Constant Time 1!", h)).toBe(true);
    expect(await verifyPassword("Constant Time 2!", h)).toBe(false);
  });
});
