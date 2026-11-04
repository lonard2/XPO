import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";
import { rateLimitResponse } from "@/lib/api/rateLimit";
import { audit } from "@/lib/observability/audit";
import { reportError } from "@/lib/observability/logger";
import { normalizeInterests } from "@/lib/matching/suggest";

const MAX_NAME = 120;
const MAX_ORG = 160;
const MAX_TITLE = 120;
const MAX_INTERESTS = 22;

function parseInterests(value: unknown): string[] | null {
  if (value === undefined) return null;
  if (!Array.isArray(value)) return [];
  if (value.length > MAX_INTERESTS) return [];
  return normalizeInterests(value);
}

/**
 * GET /api/profile — the signed-in user's stored profile.
 * 401 without a session. Anonymous visitors keep the local-only form.
 */
export async function GET(request: Request) {
  const gate = await requireUser(request, ["ATTENDEE", "ORGANIZER", "ADMIN"]);
  if (gate.response) return gate.response;

  try {
    const user = await db.user.findUnique({
      where: { id: gate.caller.userId as string },
      select: {
        id: true,
        name: true,
        email: true,
        organization: true,
        jobTitle: true,
        interestsJson: true,
      },
    });
    if (!user) {
      return NextResponse.json(
        { success: false, error: "NOT_FOUND: user does not exist." },
        { status: 404 }
      );
    }

    let interests: string[] = [];
    try {
      interests = normalizeInterests(JSON.parse(user.interestsJson));
    } catch {
      interests = [];
    }

    return NextResponse.json({
      success: true,
      profile: {
        fullName: user.name,
        email: user.email,
        organization: user.organization || "",
        jobTitle: user.jobTitle || "",
        interests,
      },
    });
  } catch (error) {
    reportError("profile-get", error);
    return NextResponse.json(
      { success: false, error: "INTERNAL_ERROR: could not load the profile." },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/profile — persist name, organization, role title and interests.
 * Unknown interest ids are dropped, never stored. Partial updates allowed:
 * omitted fields keep their stored values.
 */
export async function PATCH(request: Request) {
  const limited = await rateLimitResponse("profile-patch", request, {
    limit: 30,
    windowMs: 60_000,
  });
  if (limited) return limited;

  const gate = await requireUser(request, ["ATTENDEE", "ORGANIZER", "ADMIN"]);
  if (gate.response) return gate.response;

  try {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const data: Record<string, unknown> = {};

    if (body.fullName !== undefined) {
      const value = typeof body.fullName === "string" ? body.fullName.trim().slice(0, MAX_NAME) : "";
      if (!value) {
        return NextResponse.json(
          { success: false, error: "VALIDATION_ERROR: fullName cannot be empty." },
          { status: 400 }
        );
      }
      data.name = value;
    }
    if (body.organization !== undefined) {
      data.organization =
        typeof body.organization === "string" ? body.organization.trim().slice(0, MAX_ORG) : null;
    }
    if (body.jobTitle !== undefined) {
      data.jobTitle =
        typeof body.jobTitle === "string" ? body.jobTitle.trim().slice(0, MAX_TITLE) : null;
    }
    if (body.interests !== undefined) {
      const interests = parseInterests(body.interests);
      if (interests === null) {
        return NextResponse.json(
          { success: false, error: "VALIDATION_ERROR: interests must be an array." },
          { status: 400 }
        );
      }
      data.interestsJson = JSON.stringify(interests);
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { success: false, error: "VALIDATION_ERROR: no profile fields were provided." },
        { status: 400 }
      );
    }

    const updated = await db.user.update({
      where: { id: gate.caller.userId as string },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        organization: true,
        jobTitle: true,
        interestsJson: true,
      },
    });

    await audit(request, {
      action: "profile.update",
      entity: "User",
      entityId: updated.id,
      metadata: { fields: Object.keys(data) },
    });

    return NextResponse.json({
      success: true,
      profile: {
        fullName: updated.name,
        email: updated.email,
        organization: updated.organization || "",
        jobTitle: updated.jobTitle || "",
        interests: normalizeInterests(JSON.parse(updated.interestsJson)),
      },
    });
  } catch (error) {
    reportError("profile-patch", error);
    return NextResponse.json(
      { success: false, error: "INTERNAL_ERROR: could not save the profile." },
      { status: 500 }
    );
  }
}
