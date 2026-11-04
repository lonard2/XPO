# Hero Carousel Redesign (Editorial Feature Story)

Date: 2026-11-04. Owner picked the richer route over polish-only.
Preserved from the current carousel: autoplay with hover/focus/manual
pause, keyboard arrows, swipe with scroll guard, ARIA region/slide wiring,
the countdown widget, and the per-state CTAs (past/live/upcoming).

## Intent and why

The homepage hero should sell the event, not list it. Today every slide
is one stacked card with badges, title, details and buttons; slides swap
with no transition and the image sits still. Delegates skim past it. An
editorial split — cinematic image beside a neutral story panel with an
accent edge in the event's own color, plus a visible up-next strip —
gives each event an identity and a reason to click.

## Goals

- Each slide reads as a feature story: image-led, one clear action.
- Visitors see what is coming next and can jump to it (thumbnail strip).
- Motion (image drift, staggered entrance, autoplay progress) that never
  moves for visitors who need stillness.
- No accessibility regression: the axe gate (serious and above, three
  pages, both themes) stays green.

## Non-goals

- No change to slide content or data: same `BannerSlide` fields, same
  CTAs per temporal state, same countdown widget.
- No change below the hero: quick calendar, category pills and everything
  else on the homepage stay as they are.
- No new dependencies or fonts.

## Anti-goals

- A hero that autoplays through motion for reduced-motion visitors, even
  once, is a failure even if it looks stunning.
- A layout that needs a redesign of mobile: phones keep the current
  stacked card, upgraded only with entrance motion and progress dots.
- Mystery navigation: the strip must never replace the accessible name,
  current-slide announcement, or keyboard behavior of today's dots.

## Constraints

- Mobile-first responsive: stacked card below `lg`, split from `lg` up.
- Institutional aesthetic: lucide icons only, no emoji, existing Badge
  and button variants, accent color only from the slide's archetype
  tokens (already contrast-checked via `getReadableBadgeColors`).
- Motion gating: all movement lives under `.motion-expressive` so the
  Subtle and Off settings stay still; `prefers-reduced-motion` kills it
  independently of the setting, following the existing globals.css
  pattern. Transform/opacity only (compositor-cheap), like the sheen.
- Performance: first slide image stays eager/high-priority; thumbnails
  are lazy and small. No layout shift: fixed hero heights per breakpoint
  as today.
- i18n: any new strings go through `useTranslations` with English
  fallback, matching the file's current pattern.

## Approaches considered

1. **Polish-only** (rejected by owner): Ken Burns drift, staggered
   entrance, progress dots on the existing stacked card. Cheapest, but
   keeps the banner-with-buttons reading the owner wants to leave.
2. **Full-bleed cinematic** (dropped): edge-to-edge image with overlaid
   story. Strongest look, but breaks the rounded-card page rhythm, risks
   text-over-image contrast regressions in both themes, and fights the
   scrim system O4 just settled.
3. **Editorial split with up-next strip** (picked): image panel (~60%)
   beside a story panel with an accent edge, thumbnail strip below
   doubling as progress indicators. Keeps the card system, the scrim,
   and every behavior worth keeping.

## Decided parts (from the conversation)

- Desktop (`lg` and up): split panel. Image left with slow drift;
  story right: kicker badge, title, tagline, date/venue/hall row,
  countdown widget, the same CTA pair as today for the slide's temporal
  state. Accent edge and badge reuse the slide's archetype tokens.
- Strip: up to all slides as thumbnail buttons (image, title, date),
  active one with an autoplay progress fill whose duration matches the
  autoplay interval and which pauses with it. The strip is the indicator:
  same ARIA names and `aria-current` semantics as today's dots.
- Mobile: current stacked layout, plus staggered content entrance and
  the existing dots (dots gain the same progress fill).
- Motion: image drift and entrance stagger under `.motion-expressive`
  only; everything static otherwise and under reduced-motion. Pause,
  keyboard, swipe, ARIA live regions: unchanged code paths.
- Component shape: `BannerCarousel` keeps its props (`slides`, `locale`,
  `autoPlayInterval`, `className`). New internal pieces (story panel,
  strip, progress fill) stay in the same file unless the builder finds a
  clean split; the countdown widget is untouched.
- Strip placement: inside the carousel region, directly below the hero
  card, part of the same `aria-roledescription="carousel"` region (my
  call: keeps one labelled region instead of splitting it).
- Indicators per breakpoint: thumbnail strip on `lg` and up, today's dots
  below `lg` (my call: matches the stacked-vs-split layout split).
  Arrows and pause/play stay overlaid top-right of the hero card in both.
- Panel background: neutral card with an accent edge and badge, not a
  tinted panel (my call: the decided section already says this; a tinted
  panel reintroduces the text-over-color contrast risk that rejected the
  full-bleed option. Intent section corrected accordingly).
- Overflow: existing clamps stand (title balance, tagline `line-clamp-2`,
  fixed hero heights); strip titles truncate to one line, strip scrolls
  horizontally with snap past ~6 slides (my call).
- Strip keyboard model: roving tabindex with arrow keys, following the
  existing arrow-key handling; one tab stop for the whole strip (my call:
  ten all-tabbable thumbnails would wreck the tab order).
- Reduced motion: rotation continues, all movement goes static (my call:
  pure CSS gating, no timer rewiring; stopping rotation would remove
  content from visitors who need stillness, and the current carousel
  already rotates for them).

## Open question for the owner

- **Cut or crossfade between slides?** The current container remounts per
  slide (hard cut); entrance stagger works on top of that. A gentle
  opacity crossfade needs overlapping layers and exit handling. Builder
  recommendation below; owner decides.

## Left to the builder

- Exact drift scale and duration, stagger delays, and progress-fill
  easing, within the compositor-cheap rule.
- Thumbnail strip sizing and overflow behavior beyond ~6 slides
  (scroll-x with snap is the suggested default).
- Whether the story panel sits right or alternates sides per slide
  (default: fixed right; alternation adds motion-sickness risk with
  autoplay).
- Test updates: the existing `BannerCarousel` unit tests assert the
  current DOM; keep every behavior assertion, change only selectors the
  redesign moves.

## Verification

- `tsc`, ESLint, full vitest suite green.
- Playwright axe spec green at serious and above, light and dark, on all
  three gate pages.
- Manual pass: keyboard-only run, swipe on a narrow viewport, pause on
  hover, and the Subtle/Off motion settings plus OS reduced-motion.
