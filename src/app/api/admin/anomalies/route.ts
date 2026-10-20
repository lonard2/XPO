import { NextResponse } from "next/server";
import { detectAnomalies } from "@/lib/observability/anomalies";
import { resolveEventCaller } from "@/lib/auth/eventOwnership";

/** GET /api/admin/anomalies — admin-only gate signal feed. */
export async function GET(request: Request) {
  try {
    const caller = await resolveEventCaller(request);
    if (caller.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: platform administrators only." }, { status: 403 });
    }
    const signals = await detectAnomalies({ hoursBack: 24 });
    return NextResponse.json({ signals });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to load anomaly feed: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}
