import { NextResponse } from "next/server";
import { resolveEventCaller, type EventCaller } from "./eventOwnership";

export type GuardRole = "ATTENDEE" | "ORGANIZER" | "ADMIN";

export interface RoleGate {
  caller: EventCaller;
  response: NextResponse | null;
}

function deny(authenticated: boolean, message?: string): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error:
        message ??
        (authenticated
          ? "Forbidden: your role cannot perform this action."
          : "Unauthorized: sign in to continue."),
    },
    { status: authenticated ? 403 : 401 }
  );
}

/**
 * Resolve the caller from the session (demo personas only when the flag
 * allows it) and require one of the allowed roles.
 *
 * Deny by default: a missing identity is 401, never a pass. This replaces
 * the older pattern of reading `xpo_role` straight from the cookie and
 * rejecting only the literal "ATTENDEE", which let an unauthenticated
 * request through because `undefined` is not "ATTENDEE".
 */
export async function requireRole(
  req: Request,
  allowed: GuardRole[]
): Promise<RoleGate> {
  const caller = await resolveEventCaller(req);
  const authenticated = Boolean(caller.role);
  if (!caller.role || !allowed.includes(caller.role as GuardRole)) {
    return { caller, response: deny(authenticated) };
  }
  return { caller, response: null };
}

/**
 * Like `requireRole`, but also requires a concrete user id. Use this where
 * the caller's identity is written to a row (event ownership) or used to
 * scope a read. A role without an id is a demo artifact, not an actor.
 */
export async function requireUser(
  req: Request,
  allowed: GuardRole[]
): Promise<RoleGate> {
  const gate = await requireRole(req, allowed);
  if (gate.response) return gate;
  // Admins act on platform objects and are not attributed by user id here;
  // organizers are, because their id becomes the event owner or read scope.
  if (!gate.caller.userId && gate.caller.role !== "ADMIN") {
    return {
      caller: gate.caller,
      response: deny(true, "Unauthorized: user identity is required."),
    };
  }
  return gate;
}
