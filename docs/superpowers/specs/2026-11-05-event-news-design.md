# Design: Event News & Updates (opt-in, hand-picked)

- Date: 2026-11-05
- Status: proposed, awaiting owner approval
- Size: project (model + organizer entry + admin curation + two surfaces)

## Intent and why

Events need a living channel (lineup drops, schedule changes, sold-out
tiers) without mandatory posting quotas — quotas produce filler, and filler
kills a news surface faster than emptiness. Organizers author; editors
hand-pick what reaches the homepage. No auto-approval, ever.

## Goals

1. Organizers post updates on their event (title + short body).
2. Approved updates render as a timeline section on the event detail page.
3. Editors hand-pick ordered slots for a homepage "Latest updates" rail
   per region; empty slots mean no rail, never placeholders.
4. Unapproved updates are invisible everywhere except the author's preview.

## Non-goals

- Mandatory update quotas or posting reminders.
- Comments, reactions, or subscriber notifications.
- Auto-approval, scheduled publishing, or expiry.
- Per-locale update bodies (single language, rendered as-is, like taglines).

## Constraints

- Institutional tone, zero emojis, lucide icons only, no em dashes.
- Additive migration only; auth deny-by-default; `apiError` envelope.
- next-intl production key discipline (new UI keys in all six locales).
- Serious+ axe gate on both surfaces.

## Approaches

### A. New EventUpdate + HomepageNewsSlot models (picked)

`EventUpdate { eventId, title (120 cap), body (500 cap), status
DRAFT/APPROVED, approvedBy?, timestamps }`; `HomepageNewsSlot { updateId
unique, regionCode, position }` for hand ordering per region.

- For: drafts vs approved is a real state machine, not a flag readers
  must interpret; slots make hand-picking explicit and orderable.
- Against: two models instead of one; accepted, slots are the feature.

### B. Reuse showcase alerts for detail page + featured flag for homepage

- For: zero models.
- Against: alerts have no approval state and no cross-event ordering;
  bolting both on corrupts the showcase. Rejected.

## Decided parts

- Organizer entry lives beside showcase editing (exact placement: builder
  call, keep event-management visual language); organizers see their
  drafts with status, never others'.
- Admin reviews in the events console area; approve action stamps
  `approvedBy`; slot picker orders per region with position ints.
- Homepage rail shows slot order, links to the event (update anchor);
  detail timeline shows approved only, newest first.
- API: organizer `POST/PATCH` scoped by event ownership (mirror organizer
  event routes), admin approve + slot endpoints under `requireRole ADMIN`.

## Left to the builder

- Organizer entry exact placement and slot-picker interaction.
- Seed/demo updates (builder call: add or skip with reason).

## Builder-check resolutions (2026-11-05)

Answered by project convention: approve/slot endpoints mirror the assign
route (`requireRole` ADMIN, `apiError` envelope, no `audit()` row —
assign writes none).

Builder calls (mine, check while reading):

1. Delete: organizers delete own drafts, admins delete anything; slots
   cascade (`onDelete: Cascade` per prisma rules). Unapproving an update
   auto-evicts its slot; the rail query additionally only resolves
   APPROVED updates on attendable PUBLIC events (forward-compatible with
   the presentation-tiers doc), so stale slots can never render.
2. Slot model: `{ updateId unique, regionId, position }` where regionId is
   one of `id` / `jp` / `global` (matching `resolveActiveRegion` output);
   `@@unique([regionId, position])`, max 6 slots per region; the admin
   picker saves the ordered list and the route renumbers transactionally.
3. Timeline orders by new `approvedAt DateTime?` descending (stable under
   body edits; re-approval re-stamps).
4. Body renders as plain text with preserved line breaks
   (`whitespace-pre-line`); no markdown, no linkification (XSS surface).
5. Rail links to `/[locale]/events/[slug]#update-<cuid>`; timeline items
   carry matching ids.
6. Caps are Zod `.max` (UTF-16, repo convention), 400 through the envelope
   with per-field errors; titles need not be unique per event.

Still theirs (changes what gets built):

- N1. Post-approval lifecycle: does an organizer edit to an APPROVED
  update revert it to DRAFT for re-approval, or stay live? And is
  rejection delete, back-to-DRAFT, or a reasoned third state?
- N2. Who authors updates on platform-curated events (no organizer):
  admin-only authorship, or blocked until assigned?
- N3. Admin review shape: dedicated pending-updates tab/route, or inline
  per-event approve buttons in the existing console?
