import { describe, it, expect, afterEach, vi } from "vitest";
import { notifyAlert, resetAlertState, alertingConfigured } from "@/lib/observability/alerts";

afterEach(() => {
  resetAlertState();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("alert webhook", () => {
  it("is a no-op when no webhook is configured", async () => {
    expect(alertingConfigured()).toBe(false);
    await expect(notifyAlert({ key: "x", title: "t", message: "m" })).resolves.toBe(false);
  });

  it("posts a Slack-compatible payload", async () => {
    vi.stubEnv("ALERT_WEBHOOK_URL", "https://hooks.example.com/services/T/B");
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    global.fetch = fetchMock as unknown as typeof fetch;

    await expect(
      notifyAlert({ key: "checkout", title: "Server error in checkout", message: "boom", severity: "error" })
    ).resolves.toBe(true);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://hooks.example.com/services/T/B");
    const body = JSON.parse((init as RequestInit).body as string);
    expect(body.text).toContain("[error] Server error in checkout");
    expect(body.text).toContain("boom");
    expect(body.key).toBe("checkout");
  });

  it("suppresses repeats for the same key inside the cooldown", async () => {
    vi.stubEnv("ALERT_WEBHOOK_URL", "https://hooks.example.com/x");
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    global.fetch = fetchMock as unknown as typeof fetch;

    await expect(notifyAlert({ key: "route", title: "a", message: "1" })).resolves.toBe(true);
    await expect(notifyAlert({ key: "route", title: "b", message: "2" })).resolves.toBe(false);
    await expect(notifyAlert({ key: "other", title: "c", message: "3" })).resolves.toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("returns false when the webhook fails", async () => {
    vi.stubEnv("ALERT_WEBHOOK_URL", "https://hooks.example.com/x");
    global.fetch = vi.fn().mockRejectedValue(new Error("network")) as unknown as typeof fetch;
    await expect(notifyAlert({ key: "route", title: "a", message: "1" })).resolves.toBe(false);
  });
});
