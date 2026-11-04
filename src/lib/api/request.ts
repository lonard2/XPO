/**
 * Shared request-reading conventions. Three rules, one place:
 *
 * 1. Events and venues resolve by id OR slug. Every `[id]` route accepts
 *    either; the helper builds the where clause so the nine call sites
 *    cannot drift apart.
 * 2. DELETE identifiers come from the query, and a JSON body overrides
 *    them. Body wins, everywhere: the booth manager deletes with a bare
 *    `?id=` (no body at all), so the body read is best-effort and an empty
 *    body keeps the query values instead of 500ing.
 * 3. User-controlled paging goes through parsePagination (see
 *    `./pagination`). Fixed internal windows stay fixed.
 */

/** Match a row by primary id or by slug. Model-agnostic where clause. */
export function idOrSlugWhere(id: string): { OR: Array<{ id: string } | { slug: string }> } {
  return { OR: [{ id }, { slug: id }] };
}

export interface DeleteIdentifiers {
  id: string | null;
  ids: string[];
}

/**
 * Single `id` plus multi `ids` for bulk DELETEs. Query first, JSON body
 * wins. Never throws on an empty body.
 */
export async function deleteIdentifiers(request: Request): Promise<DeleteIdentifiers> {
  const searchParams = new URL(request.url).searchParams;
  let id = searchParams.get("id");
  let ids = (searchParams.get("ids") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  try {
    const body = await request.json();
    if (typeof body?.id === "string" && body.id.trim()) id = body.id;
    if (Array.isArray(body?.ids)) {
      ids = body.ids
        .filter((v: unknown): v is string => typeof v === "string" && !!v.trim())
        .map((v: string) => v.trim());
    }
  } catch {
    // Empty body: the query values stand.
  }
  return { id, ids };
}

/**
 * Named scalar params for DELETEs, e.g. bookingId/perkId. Same convention:
 * query first, JSON body wins, empty body keeps the query values.
 */
export async function readDeleteParams(
  request: Request,
  names: string[]
): Promise<Record<string, string | undefined>> {
  const searchParams = new URL(request.url).searchParams;
  const out: Record<string, string | undefined> = {};
  for (const name of names) out[name] = searchParams.get(name) ?? undefined;
  try {
    const body = await request.json();
    for (const name of names) {
      if (typeof body?.[name] === "string" && body[name].trim()) {
        out[name] = body[name].trim();
      }
    }
  } catch {
    // Empty body: the query values stand.
  }
  return out;
}
