import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";
import { audit } from "@/lib/observability/audit";

interface RouteParams {
  params: Promise<{ id: string }>;
}

function normalizeUrl(value: unknown): string | null | "invalid" {
  if (value === null || value === "") return null;
  if (typeof value !== "string") return "invalid";
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "http:" && url.protocol !== "https:") return "invalid";
    return url.toString();
  } catch {
    return "invalid";
  }
}

/**
 * PATCH /api/exhibitor/booths/[id] — the claimant edits their own booth
 * profile. Allocation fields (event, booth number, hall) stay with the
 * organizer; only the public-facing profile is writable here.
 */
export async function PATCH(request: Request, { params }: RouteParams) {
  const gate = await requireUser(request, ["ATTENDEE", "ORGANIZER", "ADMIN"]);
  if (gate.response) return gate.response;

  try {
    const { id } = await params;
    const booth = await db.boothTenant.findUnique({
      where: { id },
      select: { id: true, userId: true, claimStatus: true, eventId: true },
    });
    if (!booth) {
      return NextResponse.json(
        { success: false, error: "NOT_FOUND: booth does not exist." },
        { status: 404 }
      );
    }
    if (booth.userId !== gate.caller.userId && gate.caller.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Forbidden: only the claimant can edit this booth." },
        { status: 403 }
      );
    }
    if (booth.claimStatus !== "PENDING" && booth.claimStatus !== "CLAIMED") {
      return NextResponse.json(
        { success: false, error: "CONFLICT: claim the booth before editing its profile." },
        { status: 409 }
      );
    }

    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const data: Record<string, unknown> = {};

    if (body.companyName !== undefined) {
      const value = typeof body.companyName === "string" ? body.companyName.trim() : "";
      if (!value) {
        return NextResponse.json(
          { success: false, error: "VALIDATION_ERROR: companyName cannot be empty." },
          { status: 400 }
        );
      }
      data.companyName = value.slice(0, 160);
    }
    if (body.description !== undefined) {
      data.description =
        typeof body.description === "string" ? body.description.trim().slice(0, 2000) : null;
    }
    if (body.dimensions !== undefined) {
      data.dimensions =
        typeof body.dimensions === "string" ? body.dimensions.trim().slice(0, 80) : null;
    }
    if (body.boothType !== undefined) {
      data.boothType =
        typeof body.boothType === "string" ? body.boothType.trim().slice(0, 40) : null;
    }
    if (body.websiteUrl !== undefined) {
      const value = normalizeUrl(body.websiteUrl);
      if (value === "invalid") {
        return NextResponse.json(
          { success: false, error: "VALIDATION_ERROR: websiteUrl must be an http(s) URL." },
          { status: 400 }
        );
      }
      data.websiteUrl = value;
    }
    if (body.logoUrl !== undefined) {
      const value = normalizeUrl(body.logoUrl);
      if (value === "invalid") {
        return NextResponse.json(
          { success: false, error: "VALIDATION_ERROR: logoUrl must be an http(s) URL." },
          { status: 400 }
        );
      }
      data.logoUrl = value;
    }
    if (body.areaSqm !== undefined) {
      if (body.areaSqm === null || body.areaSqm === "") {
        data.areaSqm = null;
      } else {
        const value = Number(body.areaSqm);
        if (!Number.isFinite(value) || value < 0) {
          return NextResponse.json(
            { success: false, error: "VALIDATION_ERROR: areaSqm must be a positive number." },
            { status: 400 }
          );
        }
        data.areaSqm = value;
      }
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { success: false, error: "VALIDATION_ERROR: no editable fields were provided." },
        { status: 400 }
      );
    }

    const updated = await db.boothTenant.update({
      where: { id },
      data,
      select: {
        id: true,
        companyName: true,
        description: true,
        websiteUrl: true,
        logoUrl: true,
        dimensions: true,
        areaSqm: true,
        boothType: true,
        claimStatus: true,
      },
    });

    await audit(request, {
      action: "booth.profile.update",
      entity: "BoothTenant",
      entityId: id,
      metadata: { eventId: booth.eventId, fields: Object.keys(data) },
    });

    return NextResponse.json({ success: true, booth: updated });
  } catch {
    return NextResponse.json(
      { success: false, error: "INTERNAL_ERROR: could not update the booth profile." },
      { status: 500 }
    );
  }
}
