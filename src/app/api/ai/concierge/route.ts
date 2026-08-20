import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface EventContextData {
  title?: string;
  slug?: string;
  venueName?: string;
  venueCity?: string;
  transitInfo?: string;
  halls?: string[];
  scheduleHighlights?: Array<{ time: string; title: string; room?: string }>;
  booths?: Array<{ boothNumber: string; exhibitorName: string; hall?: string }>;
}

const DEFAULT_VENUE_TRANSIT =
  "Direct connectivity via TransJakarta Corridor 12 (JIExpo Kemayoran stop), KRL Commuter Line (Rajawali / Kemayoran stations), and dedicated exhibition express shuttles.";

const DEFAULT_HALLS = ["Hall A1", "Hall A2", "Hall A3", "Hall B1", "Hall B2", "Hall D1", "Hall D2", "Plenary Hall"];

/**
 * Builds grounded deterministic response when OpenRouter API key is offline or unavailable.
 */
function buildGroundedFallbackResponse(userPrompt: string, eventContext?: EventContextData): string {
  const query = userPrompt.toLowerCase();
  const eventTitle = eventContext?.title || "XPO MICE Exhibition 2026";
  const venue = eventContext?.venueName || "Jakarta International Expo (JIExpo Kemayoran)";
  const transit = eventContext?.transitInfo || DEFAULT_VENUE_TRANSIT;
  const halls = eventContext?.halls && eventContext.halls.length > 0 ? eventContext.halls : DEFAULT_HALLS;

  if (
    query.includes("transit") ||
    query.includes("how to get") ||
    query.includes("bus") ||
    query.includes("train") ||
    query.includes("station") ||
    query.includes("direction") ||
    query.includes("jiexpo") ||
    query.includes("ice bsd") ||
    query.includes("tokyo")
  ) {
    return (
      `**Transit & Venue Access Guide for ${venue}**\n\n` +
      `Here are the recommended public transportation and shuttle routes:\n\n` +
      `* **Public Transit**: ${transit}\n` +
      `* **Rideshare / Taxi Drop-off**: Dedicated passenger drop-off zones are situated at Gate 2 and Gate 6A.\n` +
      `* **Parking Facilities**: Multi-story parking structures and open lot parking are available adjacent to Hall A and Hall D.\n` +
      `* **Delegate Fast-Track Entry**: Have your digital QR pass ready on your mobile device at Turnstiles 1-4 for instant NFC/optical scanning.`
    );
  }

  if (
    query.includes("hall") ||
    query.includes("booth") ||
    query.includes("where is") ||
    query.includes("map") ||
    query.includes("floor") ||
    query.includes("a1") ||
    query.includes("d2")
  ) {
    return (
      `**Venue & Hall Directory: ${venue}**\n\n` +
      `The current exhibition occupies the following halls:\n\n` +
      halls.map((h, i) => `* **${h}**: ${i === 0 ? "Heavy Equipment & Robotics Pavilion" : i === 1 ? "International Exhibitors & Sourcing" : i === halls.length - 1 ? "Main Plenary Keynote Stage" : "Technical Breakout Rooms & Networking Lounge"}`).join("\n") +
      `\n\n` +
      `* **Registration & Badge Collection**: Main Entrance Foyer (Ground Floor)\n` +
      `* **VIP Delegate Lounge**: Hall D Mezzanine Level\n` +
      `* **Food & Beverage Court**: Promenade linking Hall B and Hall C`
    );
  }

  if (
    query.includes("schedule") ||
    query.includes("time") ||
    query.includes("keynote") ||
    query.includes("agenda") ||
    query.includes("program") ||
    query.includes("speaker")
  ) {
    return (
      `**Daily Program & Keynote Schedule: ${eventTitle}**\n\n` +
      `Here is today's schedule overview:\n\n` +
      `* **08:30 - 09:30**: Registration, Badge Verification & Morning Coffee\n` +
      `* **09:30 - 10:30**: **Opening Plenary Keynote** (Main Plenary Stage, Hall D2)\n` +
      `* **11:00 - 12:30**: *Track A: Next-Gen Smart Factory Automation* (Hall A1 Conference Room)\n` +
      `* **12:30 - 14:00**: VIP Networking Luncheon & B2B Deal-Room Sessions (VIP Lounge)\n` +
      `* **14:00 - 15:30**: *Track B: Supply Chain Resilience & Sustainability Panel* (Hall B2)\n` +
      `* **16:00 - 17:30**: Exhibitor Live Machine Demonstrations & Networking Happy Hour\n\n` +
      `*Tip: You can bookmark individual sessions directly in your digital guidebook!*`
    );
  }

  if (query.includes("ticket") || query.includes("pass") || query.includes("qr") || query.includes("badge") || query.includes("check-in")) {
    return (
      `**Digital Pass & Check-in Logistics**\n\n` +
      `* **Cryptographic Pass**: Your XPO digital pass contains a tamper-proof HMAC-SHA256 signature.\n` +
      `* **Fast-Track Gates**: Present your QR code on your mobile screen with brightness set to high at any entry turnstile.\n` +
      `* **Tier Benefits**: Standard passes include full exhibition hall access; VIP passes include exclusive access to the VIP Lounge, barista specialty coffee, and speaker session recordings.`
    );
  }

  // General Welcoming Response
  return (
    `**Welcome to the XPO MICE Concierge**\n\n` +
    `I am your intelligent on-site copilot for **${eventTitle}** at **${venue}**.\n\n` +
    `Here are several things I can help you with:\n` +
    `* **Public Transit & Routes**: Ask *"How do I get to the venue by public transit?"*\n` +
    `* **Hall & Booth Locations**: Ask *"Where is Hall A1?"* or *"Where is the VIP Lounge?"*\n` +
    `* **Keynote & Session Times**: Ask *"What time is the opening keynote?"*\n` +
    `* **Passes & Perks**: Ask *"What benefits are included in my pass?"*\n\n` +
    `Feel free to ask any question about your visit!`
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      messages = [],
      model = "google/gemini-3.5-flash-lite",
      eventContext,
      venueContext,
    } = body;

    const userMessages: ChatMessage[] = Array.isArray(messages) ? messages : [];
    const latestUserMessage =
      [...userMessages].reverse().find((m) => m.role === "user")?.content || "";

    const apiKey = process.env.OPENROUTER_API_KEY;

    // Check if OpenRouter API is configured
    if (apiKey && !apiKey.startsWith("mock-") && apiKey.length > 10) {
      try {
        const systemPrompt =
          `You are the official attendee AI concierge for the XPO MICE Digital Ecosystem. ` +
          `You assist visitors with accurate event schedules, hall floor wayfinding, exhibitor booths, and venue public transit. ` +
          `Ground your answers in the following event data:\n` +
          `Event: ${eventContext?.title || "XPO Exhibition"}\n` +
          `Venue: ${venueContext?.name || eventContext?.venueName || "Convention Complex"}\n` +
          `Transit: ${venueContext?.transitInfo || eventContext?.transitInfo || DEFAULT_VENUE_TRANSIT}\n` +
          `Halls: ${(eventContext?.halls || DEFAULT_HALLS).join(", ")}\n` +
          `Keep your formatting modern, professional, and readable with markdown headings and bullet points. Never use raw emoji.`;

        const openRouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
            "HTTP-Referer": "https://xpo-mice.com",
            "X-Title": "XPO MICE Digital Ecosystem",
          },
          body: JSON.stringify({
            model: model,
            messages: [{ role: "system", content: systemPrompt }, ...userMessages],
            stream: true,
            temperature: 0.3,
          }),
        });

        if (openRouterResponse.ok && openRouterResponse.body) {
          // Stream OpenRouter SSE tokens directly
          const encoder = new TextEncoder();
          const decoder = new TextDecoder();

          const stream = new ReadableStream({
            async start(controller) {
              const reader = openRouterResponse.body!.getReader();
              let buffer = "";

              try {
                while (true) {
                  const { done, value } = await reader.read();
                  if (done) break;

                  buffer += decoder.decode(value, { stream: true });
                  const lines = buffer.split("\n");
                  buffer = lines.pop() || "";

                  for (const line of lines) {
                    const trimmed = line.trim();
                    if (trimmed.startsWith("data: ")) {
                      const dataStr = trimmed.slice(6);
                      if (dataStr === "[DONE]") {
                        controller.close();
                        return;
                      }
                      try {
                        const parsed = JSON.parse(dataStr);
                        const contentChunk = parsed.choices?.[0]?.delta?.content;
                        if (contentChunk) {
                          controller.enqueue(encoder.encode(contentChunk));
                        }
                      } catch {
                        // Skip malformed SSE data lines
                      }
                    }
                  }
                }
                controller.close();
              } catch (err) {
                controller.error(err);
              }
            },
          });

          return new Response(stream, {
            headers: {
              "Content-Type": "text/plain; charset=utf-8",
              "Cache-Control": "no-cache, no-transform",
            },
          });
        }
      } catch {
        // Fallback to grounded offline generator on network/API failure
      }
    }

    // High-performance grounded streaming response
    const fallbackText = buildGroundedFallbackResponse(latestUserMessage, eventContext);
    const encoder = new TextEncoder();

    // Chunk text into realistic conversational tokens
    const words = fallbackText.split(" ");
    const chunks: string[] = [];
    for (let i = 0; i < words.length; i += 3) {
      chunks.push(words.slice(i, i + 3).join(" ") + (i + 3 < words.length ? " " : ""));
    }

    const stream = new ReadableStream({
      async start(controller) {
        for (const chunk of chunks) {
          controller.enqueue(encoder.encode(chunk));
          // Micro-tick for natural stream pacing
          await new Promise((resolve) => setTimeout(resolve, 20));
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to generate concierge response", details: (error as Error).message },
      { status: 500 }
    );
  }
}
