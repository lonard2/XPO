import { describe, it, expect } from "vitest";
import { GET as healthRoute } from "@/app/api/health/route";

describe("Health endpoint", () => {
  it("reports status, uptime, version, and database latency", async () => {
    const res = await healthRoute();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.status).toBe("ok");
    expect(typeof json.uptimeSec).toBe("number");
    expect(typeof json.version).toBe("string");
    expect(json.db).toBe("ok");
    expect(typeof json.dbLatencyMs).toBe("number");
  });
});
