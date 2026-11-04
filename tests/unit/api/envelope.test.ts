import { describe, it, expect } from "vitest";
import { apiError, errorCodeFor } from "@/lib/api/envelope";

describe("error envelope", () => {
  it("keeps the message text and lifts the prefix into code", async () => {
    const res = apiError("QUOTA_EXCEEDED: quota is spent.", 409);
    expect(res.status).toBe(409);
    const json = await res.json();
    expect(json).toEqual({
      success: false,
      error: "QUOTA_EXCEEDED: quota is spent.",
      code: "QUOTA_EXCEEDED",
    });
  });

  it("falls back to the status when the message carries no code", async () => {
    const cases: Array<[string, number, string]> = [
      ["Missing fields.", 400, "VALIDATION_ERROR"],
      ["Sign in first.", 401, "UNAUTHENTICATED"],
      ["No entry.", 403, "FORBIDDEN"],
      ["Gone.", 404, "NOT_FOUND"],
      ["Taken.", 409, "CONFLICT"],
      ["Locked.", 423, "LOCKED"],
      ["Slow down.", 429, "RATE_LIMITED"],
      ["Boom.", 500, "INTERNAL_ERROR"],
    ];
    for (const [message, status, code] of cases) {
      expect(errorCodeFor(message, status)).toBe(code);
    }
    // Prefix-like prose is not a code: only SCREAMING_SNAKE counts.
    expect(errorCodeFor("Bad Request: nope.", 400)).toBe("VALIDATION_ERROR");
    expect(errorCodeFor("Forbidden: nope.", 403)).toBe("FORBIDDEN");
  });

  it("carries route extras without forking the shape", async () => {
    const res = apiError("VALIDATION_ERROR: bad hash.", 400, { valid: false });
    const json = await res.json();
    expect(json).toEqual({
      success: false,
      error: "VALIDATION_ERROR: bad hash.",
      code: "VALIDATION_ERROR",
      valid: false,
    });
  });
});
