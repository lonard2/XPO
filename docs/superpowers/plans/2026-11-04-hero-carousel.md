# Hero Carousel Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the homepage hero as an editorial split (cinematic image + story panel + up-next strip) with a neat opacity crossfade, keeping every existing behavior.

**Architecture:** `BannerCarousel` keeps its props and all behavior code paths (autoplay, pause, keyboard, swipe, ARIA, countdown, CTAs). The slide body becomes two stacked crossfade layers plus a split layout on `lg`; a thumbnail strip replaces dots on desktop. All movement is CSS under `.motion-expressive`; the global motion-off and reduced-motion kills already in `globals.css` handle the rest, so no JS motion checks.

**Tech Stack:** React 19, Next.js App Router, Tailwind v4 utilities plus three new keyframes in `src/app/globals.css`, Testing Library, Playwright axe.

**Spec:** `docs/superpowers/specs/2026-11-04-hero-carousel-design.md`

## Global Constraints

- Props of `BannerCarousel` (`slides`, `locale`, `autoPlayInterval`, `className`) do not change.
- Every animation lives under `.motion-expressive`; nothing moves otherwise or under `prefers-reduced-motion` (already killed globally).
- Transform/opacity only; no new dependencies, no new fonts.
- New user-visible strings go through `useTranslations` with English fallback.
- First-slide image stays eager/high-priority; thumbnails lazy.
- Fixed hero heights per breakpoint stay (`min-h-[420px] sm:480px lg:520px`); no layout shift between slides.

## Review Focus

- Hammering arrow keys mid-crossfade must never stack three layers or strand an `aria-hidden` layer on top; Task 1's rapid-click test pins a two-layer maximum.
- A single-slide carousel must render no strip, no progress fill, and no dead controls; Task 2's single-slide test pins the empty-state guards.
- With OS reduced-motion on, slides must still rotate on the timer with instant cuts; Task 3's timer test pins rotation independent of CSS animation.
- Manual navigation must restart the progress fill from zero, not resume mid-bar; Task 3's restart test pins the fill key changing on jump.
- A slide whose hero image 404s or is absent must still show the story panel over the archetype gradient fallback, never a broken-image icon; Task 3's fallback test pins it.

---

## Task 1: Crossfade slide layers

**Files:**
- Modify: `src/components/discovery/BannerCarousel.tsx` (slide container region only)
- Test: `tests/unit/components/discovery/BannerCarousel.test.tsx`

**Interfaces:**
- Consumes: existing `currentIndex`, `totalSlides`, `resetAutoPlay` state.
- Produces: `prevIndex: number | null` state plus a `renderSlide(index, { hidden }: { hidden: boolean })` render helper used by Task 2's layout (same slide JSX, two call sites).

- [ ] **Step 1: Write the failing test**

```tsx
it('T3.1: crossfades with at most two layers, outgoing hidden from AT', () => {
  render(<BannerCarousel slides={mockSlides} locale="en" />);
  fireEvent.click(screen.getByLabelText('Next slide'));
  const groups = screen.getAllByRole('group');
  expect(groups.length).toBeLessThanOrEqual(2);
  expect(groups[0]).toHaveAttribute('aria-hidden', 'true');
});

it('T3.1b: rapid navigation never stacks more than two layers', () => {
  render(<BannerCarousel slides={mockSlides} locale="en" />);
  fireEvent.click(screen.getByLabelText('Next slide'));
  fireEvent.click(screen.getByLabelText('Next slide'));
  fireEvent.click(screen.getByLabelText('Previous slide'));
  expect(screen.getAllByRole('group').length).toBeLessThanOrEqual(2);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/components/discovery/BannerCarousel.test.tsx -t "T3.1"`
Expected: FAIL with "Unable to find an element with..." (only one group today).

- [ ] **Step 3: Implement crossfade layers in `src/components/discovery/BannerCarousel.tsx`**

Add `const [prevIndex, setPrevIndex] = React.useState<number | null>(null)`. Every existing `setCurrentIndex` call site (interval, arrows, swipe, dots) sets the outgoing index into `prevIndex` first. Extract the slide JSX (image layer through CTA block, lines ~205-392) into `renderSlide(index, hidden)`; render current normally and, when `prevIndex !== null`, the previous slide absolutely stacked (`absolute inset-0 pointer-events-none`) with `aria-hidden="true"` and no `aria-label`. Clear `prevIndex` on `onTransitionEnd` of the incoming layer plus a 700ms fallback timer, whichever fires first. Incoming layer gets class `hero-crossfade-in` (Task 3 defines the keyframes; the class may not exist yet — the test only asserts structure).

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/components/discovery/BannerCarousel.test.tsx -t "T3.1"`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/discovery/BannerCarousel.tsx tests/unit/components/discovery/BannerCarousel.test.tsx
git commit -m "feat(hero): crossfade slide layers with hidden outgoing"
```

## Task 2: Editorial split layout and up-next strip

**Files:**
- Modify: `src/components/discovery/BannerCarousel.tsx`
- Test: `tests/unit/components/discovery/BannerCarousel.test.tsx`

**Interfaces:**
- Consumes: Task 1's `renderSlide(index, hidden)` helper.
- Produces: story-panel and strip DOM with stable selectors Task 3 animates: `.hero-story` (panel), `.hero-strip` (strip list), `.hero-progress-fill` (active fill bar).

- [ ] **Step 1: Write the failing tests**

```tsx
it('T3.2: renders an up-next strip with one button per slide and current marked', () => {
  render(<BannerCarousel slides={mockSlides} locale="en" />);
  const strip = document.querySelector('.hero-strip');
  expect(strip).not.toBeNull();
  const buttons = strip!.querySelectorAll('button');
  expect(buttons.length).toBe(mockSlides.length);
  expect(buttons[0]).toHaveAttribute('aria-current', 'true');
});

it('T3.3: strip uses roving tabindex with a single tab stop', () => {
  render(<BannerCarousel slides={mockSlides} locale="en" />);
  const buttons = document.querySelector('.hero-strip')!.querySelectorAll('button');
  const tabbables = Array.from(buttons).filter((b) => (b as HTMLElement).tabIndex === 0);
  expect(tabbables.length).toBe(1);
});

it('T3.3b: a single slide renders no strip and no progress fill', () => {
  render(<BannerCarousel slides={[mockSlides[0]]} locale="en" />);
  expect(document.querySelector('.hero-strip')).toBeNull();
  expect(document.querySelector('.hero-progress-fill')).toBeNull();
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/unit/components/discovery/BannerCarousel.test.tsx -t "T3.2"`
Expected: FAIL (no `.hero-strip` in the document).

- [ ] **Step 3: Implement split layout and strip in `src/components/discovery/BannerCarousel.tsx`**

Inside `renderSlide`: on `lg` screens the content row becomes `lg:grid lg:grid-cols-[1.6fr_1fr]` — image layer unchanged on the left; the story panel (badges, title, tagline, metadata, countdown, CTAs, unchanged copy) moves into a right column with `border-l-4` in `archetypeTokens.primary` (decorative border, contrast-exempt) on a neutral card surface, class `hero-story`. Below `lg` the current stacked JSX renders byte-identical. After the hero card, inside the same `region` wrapper: `div.hero-strip.hidden.lg:flex` with `overflow-x-auto` and scroll snap for long slide lists, one button per slide (lazy 96px thumbnail, single-line truncated title, date), reusing the `goToSlide` aria-label key and `aria-current` semantics from the dots. Dots stay rendered for all breakpoints (mobile shows dots, desktop shows both dots and strip? No: dots gain `lg:hidden`). Roving tabindex: `tabIndex={idx === currentIndex ? 0 : -1}`; extend the existing window arrow handler so that when `document.activeElement` is inside `.hero-strip`, focus moves to the newly active thumbnail after the index change (via a strip ref and effect on `currentIndex`).

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/unit/components/discovery/BannerCarousel.test.tsx`
Expected: PASS (old behavior tests T1.1–T2.2 keep passing; update only selectors the redesign moved, never behavior assertions).

- [ ] **Step 5: Commit**

```bash
git add src/components/discovery/BannerCarousel.tsx tests/unit/components/discovery/BannerCarousel.test.tsx
git commit -m "feat(hero): editorial split layout with up-next strip"
```

## Task 3: Expressive motion (drift, stagger, progress)

**Files:**
- Modify: `src/app/globals.css`, `src/components/discovery/BannerCarousel.tsx`
- Test: `tests/unit/components/discovery/BannerCarousel.test.tsx`

**Interfaces:**
- Consumes: Task 2's `.hero-story`, `.hero-strip`, `.hero-progress-fill`, incoming-layer class hook.
- Produces: nothing downstream; this is the last code task.

- [ ] **Step 1: Write the failing tests**

```tsx
it('T3.4: progress fill duration matches the autoplay interval and pauses with it', () => {
  render(<BannerCarousel slides={mockSlides} locale="en" autoPlayInterval={9000} />);
  const fill = document.querySelector('.hero-progress-fill') as HTMLElement;
  expect(fill.style.animationDuration).toBe('9000ms');
  fireEvent.mouseEnter(screen.getByRole('region'));
  expect(fill.style.animationPlayState).toBe('paused');
});

it('T3.5: story content uses the shared stagger entrance', () => {
  render(<BannerCarousel slides={mockSlides} locale="en" />);
  expect(document.querySelector('.hero-story.stagger-children')).not.toBeNull();
});

it('T3.5b: rotation runs on the timer and the fill restarts on jump', () => {
  // This file already runs on fake timers (see beforeEach); add `act` to
  // its @testing-library/react import for the advance below.
  render(<BannerCarousel slides={mockSlides} locale="en" autoPlayInterval={7000} />);
  act(() => { vi.advanceTimersByTime(7000); });
  expect(screen.getByRole('group').getAttribute('aria-label')).toContain(mockSlides[1].title);
  const fillBefore = document.querySelector('.hero-progress-fill');
  fireEvent.click(screen.getByLabelText('Next slide'));
  // Keyed by slide plus timer generation, so manual navigation mounts a
  // fresh bar instead of resuming the old one mid-fill.
  expect(document.querySelector('.hero-progress-fill')).not.toBe(fillBefore);
});

it('T3.5c: a slide without an image falls back to the gradient', () => {
  const imageless = { ...mockSlides[0], heroImageUrl: undefined };
  render(<BannerCarousel slides={[imageless]} locale="en" />);
  expect(document.querySelector('.hero-story')).not.toBeNull();
  expect(screen.queryByRole('img')).toBeNull();
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/unit/components/discovery/BannerCarousel.test.tsx -t "T3.4"`
Expected: FAIL (no `.hero-progress-fill` exists).

- [ ] **Step 3: Implement motion in `src/app/globals.css` and `src/components/discovery/BannerCarousel.tsx`**

CSS, all under `.motion-expressive` following the existing sheen/stagger pattern: `@keyframes hero-drift` (scale 1.02 to 1.09, 9s ease-in-out infinite alternate), `.motion-expressive .hero-drift` applying it; `@keyframes hero-crossfade` (opacity 0 to 1, 0.45s ease-out), `.motion-expressive .hero-crossfade-in` applying it; `@keyframes hero-progress` (width 0% to 100% linear), `.motion-expressive .hero-progress-fill` applying it with `animation-fill-mode: forwards`. No global-kill additions needed: the existing `.motion-off` and reduced-motion blocks already zero animations. Component: image `img` gains `hero-drift` with `key={slide.id}` so drift restarts per slide; incoming layer div gains `hero-crossfade-in`; story panel content wrapper gains `stagger-children` with `key={slide.id}` so the rise-in ladder replays per slide; active strip thumbnail (and active mobile dot) contains `span.hero-progress-fill` with inline `animationDuration: ${autoPlayInterval}ms`, `animationPlayState: isEffectivePaused ? 'paused' : 'running'`, keyed by `${currentIndex}-${timerKey}` so manual navigation restarts the bar.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/unit/components/discovery/BannerCarousel.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/globals.css src/components/discovery/BannerCarousel.tsx tests/unit/components/discovery/BannerCarousel.test.tsx
git commit -m "feat(hero): expressive drift, stagger and autoplay progress"
```

## Task 4: Full verification and axe gate

**Files:**
- Modify: none (docs only if the axe run finds something).

**Interfaces:**
- Consumes: all three tasks above.

- [ ] **Step 1: Run typecheck, lint, and the full unit suite**

Run: `npx tsc --noEmit`, then `npx eslint src/components/discovery/BannerCarousel.tsx src/app/globals.css tests/unit/components/discovery/BannerCarousel.test.tsx`, then `npx vitest run`
Expected: zero errors; the suite green (known flakes, if any, fail-and-pass in isolation as usual).

- [ ] **Step 2: Run the Playwright axe gate in both themes**

Run: `npx playwright test tests/e2e/accessibility.spec.ts --reporter=line` against `npx next dev -p 3111` with a seeded database.
Expected: 3 passed. If any serious node appears, fix the node (contrast or ARIA), never the gate.

- [ ] **Step 3: Manual behavior pass**

Keyboard-only run (tab order: strip has one stop, arrows move within it), swipe on a narrow viewport, pause on hover freezes both rotation and the progress bar, Subtle/Off settings and OS reduced-motion show a fully static but still rotating carousel. Record any deviation as a fix, not a waiver.

- [ ] **Step 4: Push**

Run: `git push origin main`
Expected: clean push; working tree otherwise untouched (`git status --short` shows only the three task commits' files).
