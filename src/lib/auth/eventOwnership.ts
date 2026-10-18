/**
 * Event ownership resolution for strict ownership enforcement.
 *
 * Model: organizers write only events whose `organizerId` matches their user id;
 * platform-curated events (`organizerId: null`) are admin-only. Reads stay open
 * (scanner verification, public loads). Caller identity follows the existing
 * conventions: `xpo_role` cookie / `x-xpo-user-role` header for the role and the
 * `xpo_auth_user` cookie (`{ id, email, ... }`) / `x-xpo-user-id` /
 * `x-xpo-user-email` headers for the user. Server-safe: no `window` access.
 */

export interface EventCaller {
  role: string | null;
  userId: string | null;
  email: string | null;
}

function parseAuthUserCookie(cookieHeader: string): { id?: string; email?: string } | null {
  const match = cookieHeader.match(/xpo_auth_user=([^;]+)/);
  if (!match) return null;
  try {
    return JSON.parse(decodeURIComponent(match[1]));
  } catch {
    return null;
  }
}

/** Resolve the caller from a WHATWG Request (route handlers). */
export function getEventCaller(req: Request): EventCaller {
  const cookieHeader = req.headers.get("cookie") || "";
  const roleMatch = cookieHeader.match(/xpo_role=([^;]+)/);
  const role = roleMatch
    ? decodeURIComponent(roleMatch[1])
    : req.headers.get("x-xpo-user-role");
  const authUser = parseAuthUserCookie(cookieHeader);
  const userId =
    req.headers.get("x-xpo-user-id") || authUser?.id || null;
  const email =
    req.headers.get("x-xpo-user-email") || authUser?.email || null;
  return { role, userId, email };
}

interface CookieJar {
  get(name: string): { value: string } | undefined;
}

/** Resolve the caller from a cookie jar (server components via `next/headers`). */
export function getEventCallerFromCookies(cookies: CookieJar): EventCaller {
  const role = cookies.get("xpo_role")?.value || null;
  const rawUser = cookies.get("xpo_auth_user")?.value;
  let userId: string | null = null;
  let email: string | null = null;
  if (rawUser) {
    try {
      const parsed = JSON.parse(decodeURIComponent(rawUser));
      userId = parsed?.id || null;
      email = parsed?.email || null;
    } catch {
      // Ignore malformed cookie
    }
  }
  return { role, userId, email };
}

/**
 * Write rule: ADMIN may write anything; an authenticated organizer may write
 * only events they own; curated events (`organizerId: null`) are admin-only.
 */
export function canWriteEvent(
  caller: EventCaller,
  organizerId: string | null | undefined
): boolean {
  if (caller.role === "ADMIN") return true;
  if (!caller.userId) return false;
  if (!organizerId) return false;
  return organizerId === caller.userId;
}

/** Partition events for dashboard grouping. */
export function partitionCurated<T extends { organizerId?: string | null }>(
  events: T[]
): { curated: T[]; owned: T[] } {
  return {
    curated: events.filter((e) => !e.organizerId),
    owned: events.filter((e) => e.organizerId),
  };
}

export interface OwnershipGate {
  ok: boolean;
  status: number;
  error: string;
}

const WRITE_DENIED =
  "Forbidden: Only the owning organizer or a platform administrator can modify this event.";

/**
 * Gate a mutation against a set of event ids. Loads each event's owner and
 * denies unless the caller may write ALL of them. Missing events are 404.
 */
export async function requireEventWrites(
  req: Request,
  eventIds: Array<string | null | undefined>,
  db: {
    event: {
      findMany(args: unknown): Promise<Array<{ id: string; organizerId: string | null }>>;
    };
  }
): Promise<OwnershipGate> {
  const ids = [...new Set(eventIds.filter(Boolean))] as string[];
  if (ids.length === 0) {
    return { ok: false, status: 400, error: "Missing required eventId." };
  }
  const caller = getEventCaller(req);
  const events = await db.event.findMany({
    where: { id: { in: ids } },
    select: { id: true, organizerId: true },
  });
  if (events.length !== ids.length) {
    return { ok: false, status: 404, error: "Event not found." };
  }
  if (!events.every((e) => canWriteEvent(caller, e.organizerId))) {
    return { ok: false, status: 403, error: WRITE_DENIED };
  }
  return { ok: true, status: 200, error: "" };
}

/**
 * Gate a mutation against booth ids by resolving their parent events first.
 * Missing booths are 404.
 */
export async function requireBoothWrites(
  req: Request,
  boothIds: Array<string | null | undefined>,
  db: {
    boothTenant: {
      findMany(args: unknown): Promise<Array<{ id: string; eventId: string }>>;
    };
    event: {
      findMany(args: unknown): Promise<Array<{ id: string; organizerId: string | null }>>;
    };
  }
): Promise<OwnershipGate> {
  const ids = [...new Set(boothIds.filter(Boolean))] as string[];
  if (ids.length === 0) {
    return { ok: false, status: 400, error: "Missing booth ID." };
  }
  const booths = await db.boothTenant.findMany({
    where: { id: { in: ids } },
    select: { id: true, eventId: true },
  });
  if (booths.length !== ids.length) {
    return { ok: false, status: 404, error: "Booth lot not found or already deleted." };
  }
  return requireEventWrites(
    req,
    booths.map((b) => b.eventId),
    db
  );
}
