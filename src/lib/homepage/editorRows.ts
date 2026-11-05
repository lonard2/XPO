import { resolveRowCopy } from "./rows";

export interface EditorRowSource {
  id: string;
  title: string;
  titleI18n?: unknown;
  subtitle?: string | null;
  subtitleI18n?: unknown;
  eventIdsJson: string;
}

/**
 * Resolves stored editor rows against the events that actually render.
 * Ids that no longer resolve to a public attendable event are skipped,
 * and a row with no surviving items disappears entirely.
 */
export function resolveEditorRows<T extends { id: string }>(
  rows: EditorRowSource[],
  events: T[],
  locale: string
): Array<{ id: string; title: string; subtitle: string | null; items: T[] }> {
  const byId = new Map(events.map((event) => [event.id, event]));

  const parseIds = (json: string): string[] => {
    try {
      const parsed = JSON.parse(json);
      return Array.isArray(parsed)
        ? parsed.filter((id): id is string => typeof id === "string")
        : [];
    } catch {
      return [];
    }
  };

  return rows
    .map((row) => {
      const copy = resolveRowCopy(
        {
          title: row.title,
          titleI18n: row.titleI18n as Record<string, string> | null,
          subtitle: row.subtitle,
          subtitleI18n: row.subtitleI18n as Record<string, string> | null,
        },
        locale
      );
      const items = parseIds(row.eventIdsJson)
        .map((id) => byId.get(id))
        .filter((event): event is T => Boolean(event));
      return { id: row.id, ...copy, items };
    })
    .filter((row) => row.items.length > 0);
}
