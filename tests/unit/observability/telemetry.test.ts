import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("@/lib/observability/logger", () => ({
  reportError: vi.fn(),
  reportWarn: vi.fn(),
}));

import { POST } from "@/app/api/telemetry/error/route";
import { reportError } from "@/lib/observability/logger";

const post = (body: unknown) =>
  POST(
    new Request("http://localhost/api/telemetry/error", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
  );

beforeEach(() => {
  vi.mocked(reportError).mockClear();
});

describe("client error telemetry", () => {
  it("accepts a bounded report and answers 204", async () => {
    const response = await post({ message: "TypeError: x is undefined", stack: "at y", url: "/en/events" });
    expect(response.status).toBe(204);
    expect(reportError).toHaveBeenCalledWith("client", expect.any(Error), {
      stack: "at y",
      url: "/en/events",
    });
  });

  it("truncates oversized fields", async () => {
    await post({ message: "m".repeat(5000), stack: "s".repeat(9000), url: "/u".repeat(1000) });
    const [, , context] = vi.mocked(reportError).mock.calls[0];
    expect((context as any).stack).toHaveLength(2000);
    expect((context as any).url).toHaveLength(300);
  });

  it("ignores an empty message without reporting", async () => {
    const response = await post({ message: "   " });
    expect(response.status).toBe(204);
    expect(reportError).not.toHaveBeenCalled();
  });

  it("survives a malformed body", async () => {
    const response = await POST(
      new Request("http://localhost/api/telemetry/error", { method: "POST", body: "not json" })
    );
    expect(response.status).toBe(204);
  });
});
