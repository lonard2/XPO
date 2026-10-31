# Homepage Critique Follow-ups (2026-10-31, second batch)

Everything still open after the two P0 fixes (`0fcf1f7`, `57fdf5f`).

- [x] **C1. Inventory-shaped layout.** Featured grid adapts its columns to the number of
  attendable events; a single venue card is centred instead of hugging the left edge.
- [x] **C2. Mobile and tablet chrome.** Hero CTA clears the bottom nav at 390; tablets get
  persistent navigation; carousel dots reach the 24px target floor; the smallest
  controls are enlarged.
- [x] **C3. Price disclosure.** Cards show a free trade pass plus the paid tier range
  instead of a bare "Free" that hides VIP access.
- [x] **C4. Verified badge.** Replace the unverifiable "Verified MICE Ecosystem" claim with
  a statement the platform can back.
- [x] **C5. Perks card.** Rewrite the unbacked deal-room copy to the features that exist,
  and give the card a destination.
- [x] **C6. Calendar ARIA.** Give the date grid a real grid structure instead of orphaned
  row and columnheader roles.
- [ ] **C7. Search copy.** Localise the regional suggestion labels, and replace the
  "cockpit" aria-label with plain language.
- [ ] **C8. Small truths.** Footer category list, "1 listed" copy, dead `noUpcomingDetail`
  key, stale `PRODUCT.md` category count.
- [ ] **C9. Header clarity.** Make the region and language switchers visually distinct
  instead of two adjacent controls both answering "Indonesia".

Deferred: making editions path-based instead of cookie-based. That is a routing change,
not a fix, and needs its own decision.
