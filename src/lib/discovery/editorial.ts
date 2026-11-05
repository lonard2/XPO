/**
 * Editorial blurb resolution for the hero carousel.
 *
 * One chain, server-side only: unapproved content never resolves (the
 * approval gate is a publication switch, not display logic), an exact
 * non-empty locale override wins, otherwise the English default applies,
 * otherwise null. Empty-string overrides count as unset so a cleared
 * translation falls back instead of rendering blank.
 */
export const EDITORIAL_LOCALES = [
  "en",
  "id",
  "ja",
  "zh-CN",
  "de",
  "es",
] as const;

export type EditorialLocale = (typeof EDITORIAL_LOCALES)[number];

export interface EditorialBlurbInput {
  approved: boolean;
  blurb?: string | null;
  i18n?: Record<string, string> | null;
  locale: string;
}

export function resolveEditorialBlurb(
  input: EditorialBlurbInput
): string | null {
  if (!input.approved) return null;

  // Only dictionary locales resolve overrides; unknown keys (and unknown
  // requested locales) fall through to the default.
  if ((EDITORIAL_LOCALES as readonly string[]).includes(input.locale)) {
    const override = input.i18n?.[input.locale];
    if (override && override.trim().length > 0) return override;
  }

  if (input.blurb && input.blurb.trim().length > 0) return input.blurb;

  return null;
}
