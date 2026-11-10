# Homepage Deferred Minors

> **For agentic workers:** Use superpowers:executing-plans. Steps use checkbox syntax.

**Goal:** Close every deferred minor from the two homepage critiques in three verified commits.

**Spec:** the deferred lists in the 2026-11-05 and 2026-11-10 critiques.

## Global Constraints

- Zero emojis, lucide only, no em dashes.
- Every user-visible string through next-intl.
- One commit per group, pushed to `origin/main`.

### Task 1: Mobile chrome minors

- Move the pagination dots out of the absolute bottom-right corner and into normal flow below the stage, so the fixed bottom nav cannot cover them.
- Raise the footer bottom padding from `pb-28` to `pb-36` to clear the concierge FAB.
- Render the drawer sign-in only when `!user` and give it a 44px target.
- Tests: dots container is relative, footer has `pb-36`, drawer source has `!user` and `min-h-[44px]`.

### Task 2: Carousel minors

- Track `prefers-reduced-motion` in state and hide the pause/resume control when it is set.
- Render the clamped `safeIndex` instead of `currentIndex` so a shrinking array never paints a blank frame.
- Return early from the window keydown handler when `totalSlides === 0`.
- Tests: reduced-motion hides the control; zero-slide ArrowRight does not poison the next render; shrink test stays green.

### Task 3: Polish and test minors

- Put the global focus rule inside `@layer base` so `outline-none` utilities can win.
- Make the "All Categories" tab count match the visible set (8 collapsed, 22 expanded).
- Update the contrast test to Tailwind v4's emerald-700 (`#007a55`).
- Strengthen the reduced-motion and edition tests where behavior is testable.
- Record the dynamic-rendering tradeoff accurately in the final note.
