import { describe, it, expect, vi, afterEach } from "vitest";
import { reportError, reportWarn } from "@/lib/observability/logger";

describe("structured logger", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("emits single-line JSON with scope and context", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    reportError("auth-login", new Error("boom"), { email: "a@xpo.com" });
    expect(spy).toHaveBeenCalledTimes(1);
    const line = spy.mock.calls[0][0] as string;
    const parsed = JSON.parse(line);
    expect(parsed.level).toBe("error");
    expect(parsed.scope).toBe("auth-login");
    expect(parsed.message).toBe("boom");
    expect(parsed.email).toBe("a@xpo.com");
    expect(typeof parsed.ts).toBe("string");
  });

  it("never throws on unserializable input", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const circular: any = { a: 1 };
    circular.self = circular;
    expect(() => reportError("x", circular)).not.toThrow();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("warns without an error object", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    reportWarn("otp", "suspicious burst", { ip: "9.9.9.9" });
    const parsed = JSON.parse(spy.mock.calls[0][0] as string);
    expect(parsed.level).toBe("warn");
    expect(parsed.message).toBe("suspicious burst");
  });
});
