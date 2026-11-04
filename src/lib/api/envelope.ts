import { NextResponse } from "next/server";

const PREFIX_RE = /^([A-Z][A-Z0-9_]+):\s?/;

const FALLBACK_BY_STATUS: Record<number, string> = {
  400: "VALIDATION_ERROR",
  401: "UNAUTHENTICATED",
  403: "FORBIDDEN",
  404: "NOT_FOUND",
  409: "CONFLICT",
  423: "LOCKED",
  429: "RATE_LIMITED",
};

/**
 * Derive the machine-readable code for an error message. Messages already
 * follow the `CODE: human text` convention, so the code is the prefix;
 * anything else falls back to the status. The human text is never rewritten.
 */
export function errorCodeFor(message: string, status: number): string {
  const match = message.match(PREFIX_RE);
  if (match) return match[1];
  return FALLBACK_BY_STATUS[status] ?? (status >= 500 ? "INTERNAL_ERROR" : "ERROR");
}

export interface ApiErrorExtra {
  [key: string]: unknown;
}

/**
 * The single error envelope: `{ success: false, error, code }`.
 *
 * `error` keeps its existing text byte-for-byte (including the legacy
 * `CODE:` prefix), so clients matching on substrings and tests asserting on
 * messages keep passing. `code` is the machine field new clients should
 * branch on. `extra` carries route-specific fields (`details`, `issues`,
 * scan verdicts like `valid`) without forking the shape.
 */
export function apiError(
  message: string,
  status = 500,
  extra?: ApiErrorExtra,
  init?: { headers?: HeadersInit }
): NextResponse {
  return NextResponse.json(
    { success: false, error: message, code: errorCodeFor(message, status), ...extra },
    { status, ...init }
  );
}
