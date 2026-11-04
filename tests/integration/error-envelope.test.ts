import { describe, it, expect } from "vitest";
import { POST as checkout } from "@/app/api/tickets/checkout/route";
import { POST as verify } from "@/app/api/tickets/verify/route";
import { POST as login } from "@/app/api/auth/login/route";
import { GET as listMeetings } from "@/app/api/meetings/requests/route";

/**
 * One shape everywhere: every error response carries success:false, the
 * human message unchanged, and a machine-readable code. Covers one route
 * from each of the old dialects plus a scan verdict and a guard denial.
 */
describe("error envelope contract", () => {
  it("checkout validation errors carry a code", async () => {
    const res = await checkout(
      new Request("http://localhost/api/tickets/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
    );
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.code).toBe("VALIDATION_ERROR");
    expect(typeof json.error).toBe("string");
  });

  it("login failures carry a code without leaking which field failed", async () => {
    const res = await login(
      new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "nobody@example.com", password: "wrong" }),
      })
    );
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.code).toBe("UNAUTHENTICATED");
  });

  it("scan verdicts keep valid:false and gain a code", async () => {
    const res = await verify(
      new Request("http://localhost/api/tickets/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
    );
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.valid).toBe(false);
    expect(json.code).toBe("VALIDATION_ERROR");
  });

  it("guard denials carry a code", async () => {
    const res = await listMeetings(new Request("http://localhost/api/meetings/requests"));
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.code).toBe("UNAUTHENTICATED");
  });
});
