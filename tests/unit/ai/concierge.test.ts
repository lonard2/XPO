import { describe, it, expect } from "vitest";
import { POST } from "@/app/api/ai/concierge/route";
import { NextRequest } from "next/server";

describe("Attendee AI Concierge API Route (POST /api/ai/concierge)", () => {
  it("streams grounded public transit instructions for venue queries", async () => {
    const req = new NextRequest("http://localhost:3000/api/ai/concierge", {
      method: "POST",
      body: JSON.stringify({
        messages: [{ role: "user", content: "How do I get to JIExpo by public transit?" }],
        eventContext: {
          title: "Manufacturing Indonesia 2026",
          venueName: "Jakarta International Expo (JIExpo)",
          transitInfo: "TransJakarta Corridor 12 and KRL Rajawali Station",
          halls: ["Hall A1", "Hall A2", "Hall D2"],
        },
      }),
    });

    const response = await POST(req);
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("text/plain");

    const reader = response.body?.getReader();
    expect(reader).toBeDefined();

    const decoder = new TextDecoder();
    let text = "";
    while (true) {
      const { done, value } = await reader!.read();
      if (done) break;
      text += decoder.decode(value, { stream: true });
    }

    expect(text).toContain("Transit & Venue Access Guide");
    expect(text).toContain("TransJakarta Corridor 12");
  });

  it("streams grounded hall and booth location directories", async () => {
    const req = new NextRequest("http://localhost:3000/api/ai/concierge", {
      method: "POST",
      body: JSON.stringify({
        messages: [{ role: "user", content: "Where is Hall A1 and how do I find the plenary stage?" }],
        eventContext: {
          title: "AI Developer Summit Tokyo",
          venueName: "Tokyo Big Sight",
          halls: ["East Hall 1", "East Hall 2", "Main Plenary Hall"],
        },
      }),
    });

    const response = await POST(req);
    expect(response.status).toBe(200);

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let text = "";
    while (true) {
      const { done, value } = await reader!.read();
      if (done) break;
      text += decoder.decode(value, { stream: true });
    }

    expect(text).toContain("Venue & Hall Directory");
    expect(text).toContain("East Hall 1");
    expect(text).toContain("Main Plenary Hall");
  });

  it("streams schedule and keynote timetable overviews", async () => {
    const req = new NextRequest("http://localhost:3000/api/ai/concierge", {
      method: "POST",
      body: JSON.stringify({
        messages: [{ role: "user", content: "What time is the keynote and opening plenary?" }],
        eventContext: {
          title: "Global FinTech Summit 2026",
          venueName: "Marina Bay Sands Expo",
        },
      }),
    });

    const response = await POST(req);
    expect(response.status).toBe(200);

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let text = "";
    while (true) {
      const { done, value } = await reader!.read();
      if (done) break;
      text += decoder.decode(value, { stream: true });
    }

    expect(text).toContain("Daily Program & Keynote Schedule");
    expect(text).toContain("Opening Plenary Keynote");
  });

  it("provides digital pass and check-in instructions", async () => {
    const req = new NextRequest("http://localhost:3000/api/ai/concierge", {
      method: "POST",
      body: JSON.stringify({
        messages: [{ role: "user", content: "How do I check in with my QR ticket pass?" }],
      }),
    });

    const response = await POST(req);
    expect(response.status).toBe(200);

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let text = "";
    while (true) {
      const { done, value } = await reader!.read();
      if (done) break;
      text += decoder.decode(value, { stream: true });
    }

    expect(text).toContain("Digital Pass & Check-in Logistics");
    expect(text).toContain("HMAC-SHA256");
  });
});
