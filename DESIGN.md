---
name: XPO MICE Digital Ecosystem
description: Institutional Digital Ecosystem for Global MICE Events, Venues & Passes
colors:
  primary: "#1d4ed8"
  primary-hover: "#2563eb"
  primary-foreground: "#f8fafc"
  background: "#f8fafc"
  foreground: "#0f172a"
  card: "#ffffff"
  muted: "#f1f5f9"
  muted-foreground: "#475569"
  border: "#e2e8f0"
  input: "#e2e8f0"
  ring: "#2563eb"
  success: "#10b981"
  warning: "#f59e0b"
  destructive: "#e11d48"
  info: "#0284c7"
  dark-background: "#090d16"
  dark-foreground: "#f8fafc"
  dark-card: "#0f172a"
  dark-border: "#1e293b"
  dark-muted-foreground: "#94a3b8"
  archetype-primary: "#2563eb"
  archetype-accent: "#0ea5e9"
  category-industrial: "#2563eb"
  category-tech: "#6366f1"
  category-medical: "#0d9488"
  category-finance: "#1e3a8a"
  category-popculture: "#9333ea"
  category-music: "#e11d48"
  category-megaexpo: "#ea580c"
  category-diplomatic: "#0284c7"
  category-retreat: "#059669"
  category-automotive: "#dc2626"
  category-energy: "#d97706"
  category-agritech: "#16a34a"
  category-hospitality: "#0891b2"
  category-education: "#7c3aed"
  category-fashion: "#db2777"
  category-proptech: "#0284c7"
  category-media: "#7c3aed"
  category-supplychain: "#0d9488"
  category-franchise: "#ca8a04"
  category-aerospace: "#1e3a8a"
  category-faith: "#047857"
  category-sports: "#ea580c"
typography:
  display:
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: "3rem"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "0em"
  body:
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "0em"
  label:
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.05em"
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
  xl: "12px"
  2xl: "16px"
  3xl: "24px"
  full: "9999px"
spacing:
  1: "4px"
  2: "8px"
  3: "12px"
  4: "16px"
  6: "24px"
  8: "32px"
  12: "48px"
  16: "64px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.lg}"
    padding: "0 16px"
    height: "40px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-outline:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.lg}"
    padding: "0 16px"
    height: "40px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    rounded: "{rounded.lg}"
    padding: "0 16px"
    height: "40px"
  input-default:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
    height: "40px"
  card-default:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.2xl}"
    padding: "24px"
  badge-pill:
    backgroundColor: "{colors.muted}"
    textColor: "{colors.muted-foreground}"
    rounded: "{rounded.full}"
    padding: "2px 10px"
---

# Design System: XPO MICE Digital Ecosystem

## Overview

**Creative North Star: "The Modern Trade Pavilion"**

XPO is built around the architectural clarity, institutional precision, and frictionless wayfinding of a world-class convention complex. The interface should feel like the building itself: a legible concourse, a well-marked hall directory, a trade floor organized so a delegate can cross it without asking for directions.

The voice is authoritative and architectural. Dense operational data, including ceiling clearances, floor loadings, hall indices, timetables, and pass references, is presented with the same calm hierarchy as a printed exhibition guide. Nothing decorative competes with the information a delegate, organizer, or venue operator needs in the moment.

The system favors structural borders, tonal surface shifts, and generous touch targets over ornament. It is institutional without being cold, and precise without becoming a console. Consumer-ticketing playfulness, cartoon illustration, and artificial intelligence jargon are outside the world.

**Key Characteristics:**
- Architectural, legible, and executive in tone.
- Operational density with an 11px metadata floor.
- 1px structural borders with ambient, state-driven shadows.
- Exact hall and venue naming carried onto every relevant surface.
- High-contrast credential surfaces for turnstile scanning.
- Light and dark modes driven by the same semantic tokens.

## Colors

The palette pairs an institutional slate foundation with 22 category identity palettes. The primary blue is deliberately deeper than a typical product blue because the tinted chip pairings must clear AA for small text.

### Primary
- **Institutional Cobalt** (#1d4ed8): Primary actions, active navigation, focus rings, and the default credential accent. The deeper step was chosen so `text-primary` on a `bg-primary/10` tint clears 4.5:1 for small text.
- **Cobalt Lift** (#2563eb): Hover and pressed states, dark-mode primary, and the brighter accent used on dark surfaces.

### Neutral
- **Paper** (#f8fafc): Light-mode page background.
- **Ink** (#0f172a): Primary text and headings in light mode.
- **White Card** (#ffffff): Raised card and panel surfaces in light mode.
- **Slate Wash** (#f1f5f9): Muted panels, chips, table stripes, and secondary buttons.
- **Slate Text** (#475569): Secondary text, descriptions, and metadata. Chosen over slate 500 so small text clears AA on muted and tinted surfaces.
- **Structure Line** (#e2e8f0): The 1px border that defines cards, inputs, dividers, and table edges.
- **Obsidian** (#090d16): Dark-mode page background.
- **Deep Slate Card** (#0f172a): Dark-mode card surface.
- **Night Border** (#1e293b): Dark-mode structural border.
- **Night Text** (#f8fafc): Dark-mode primary text.
- **Night Muted** (#94a3b8): Dark-mode secondary text.

### Semantic
- **Verified Emerald** (#10b981): Successful pass verification, confirmed bookings, and operational health.
- **Attention Amber** (#f59e0b): Capacity warnings, standby notices, and low-availability states.
- **Revocation Rose** (#e11d48): Cancellations, errors, and revoked passes.
- **Protocol Sky** (#0284c7): Informational notices, guidance, and diplomatic protocol accents.

### 22 MICE Category Palettes
Each category sets `--archetype-primary`, `--archetype-accent`, and a surface family for its themed event page. The palette is applied through CSS variables, never hardcoded per component.

| Category | Primary | Accent | Surface Character |
|---|:---:|:---:|---|
| Industrial & Manufacturing B2B | #2563eb | #f59e0b | Heavy machinery slate |
| Tech, AI & Developer Summit | #6366f1 | #06b6d4 | Obsidian terminal dark |
| Medical & Healthcare Symposium | #0d9488 | #10b981 | Clinical white and slate |
| Financial & Investor Forum | #1e3a8a | #d97706 | Institutional boardroom dark |
| Pop Culture & Gaming Expo | #9333ea | #ec4899 | Vibrant neon arena |
| Music Festival & Arena Concert | #e11d48 | #8b5cf6 | Stage black and velvet |
| Mega Exposition & Pavilion | #ea580c | #16a34a | Multi-pavilion fairground |
| Government & Diplomatic Summit | #0284c7 | #ca8a04 | Protocol navy |
| Incentive & Corporate Retreat | #059669 | #d97706 | Botanical sanctuary |
| Automotive & Mobility Show | #dc2626 | #2563eb | High-gloss motor dark |
| Energy & Green Infrastructure | #d97706 | #10b981 | Grid power and earth |
| Agriculture & Food Expo | #16a34a | #f59e0b | Organic harvest |
| Hospitality & Travel Mart | #0891b2 | #f97316 | Maritime gateway |
| Education & EdTech Summit | #7c3aed | #0284c7 | Academic campus |
| Fashion & Luxury Retail | #db2777 | #4f46e5 | Runway editorial |
| Building, Architecture & PropTech | #0284c7 | #f59e0b | Material specification slate |
| Media, Broadcast & Pro-AV | #7c3aed | #06b6d4 | Studio control room |
| Supply Chain, Logistics & Packaging | #0d9488 | #3b82f6 | Warehouse grid |
| Franchise, Retail & SME Business | #ca8a04 | #16a34a | High-street retail |
| Aerospace, Aviation & Defense | #1e3a8a | #06b6d4 | Flight deck steel |
| Faith, Pilgrimage & Community | #047857 | #d97706 | Contemplative stone |
| Sports, Fitness & Outdoor | #ea580c | #0284c7 | Track and field |

### Named Rules
**The One Accent Rule.** A screen carries one category accent and one primary action color. Category palettes color identity, not every control. The primary cobalt remains the action color inside themed pages unless the category explicitly owns the action.

**The Contrast First Rule.** A tinted text pairing is acceptable only when it clears AA at its rendered size. The primary and muted text values were darkened for this reason and must not be brightened back for aesthetics.

## Typography

**Display Font:** Plus Jakarta Sans (with system-ui, sans-serif)
**Body Font:** Plus Jakarta Sans (with system-ui, sans-serif)
**Editorial Font:** Newsreader (with Charter, Georgia, serif)
**Mono Font:** JetBrains Mono (with Fira Code, Menlo, monospace)
**Accessible Font:** Atkinson Hyperlegible (with Segoe UI, Tahoma, sans-serif)

**Character:** A geometric, institutional sans carries the operational interface. Newsreader adds a measured editorial voice to keynotes, abstracts, and executive statements. JetBrains Mono is reserved for references, hashes, timestamps, and technical hall data, where character alignment matters.

### Hierarchy
- **Display** (800, 3rem, 1.1, -0.02em): Page heroes and event titles on large screens. Clamps down to 2rem on mobile.
- **Headline** (700, 1.5rem, 1.2): Section headings and major panel titles.
- **Title** (700, 1rem, 1.3): Card titles, drawer headings, and list leaders.
- **Body** (400, 0.875rem, 1.6): Descriptions, abstracts, and supporting copy. Keep long reading lines near 65 to 75 characters.
- **Label** (600, 0.75rem, 0.05em, uppercase when used as a category or section eyebrow): Micro-labels, table headers, badge text, and metadata.

### Named Rules
**The 11px Floor Rule.** Supplementary metadata never drops below 11px. If a value cannot fit at 11px, remove information or restructure the layout; do not shrink the type.

**The Mono Reserve Rule.** Monospace is for machine-readable and reference values: pass references, DOI strings, timestamps, coordinates, and hall specifications. Body copy stays in the sans.

## Layout

The layout is a fluid institutional grid. Content sits in a centered container with responsive gutters; wide surfaces expand toward 1800px rather than leaving dead space on ultrawide displays.

- **Mobile (< 768px):** one column, anchored bottom navigation, sticky day-of subnavigation on event pages, full-width cards, and bottom sheets instead of large modals. Touch targets are at least 44px.
- **Tablet (768px to 1024px):** two-column discovery and venue grids, collapsible sidebars, and split agenda views.
- **Desktop (1024px to 1280px):** three- and four-column grids, side-by-side customizer and preview, and high-density data tables.
- **Ultrawide (1600px and above):** four- and five-column grids with a fluid container up to 1800px.

Spacing follows a 4px base rhythm. Section separation is typically 48px to 64px, card padding is 16px to 24px, and compact density reduces card padding to 12px. The density setting changes padding through `--card-padding`; it does not change type size.

### Named Rules
**The Full-Width Rule.** Desktop layouts use the available width. A three-column grid on a 1600px screen is a failure unless the content genuinely stops at three columns.

**The Thumb-Zone Rule.** On mobile, primary navigation and the pass action live within the bottom third of the screen.

## Elevation & Depth

Depth is structural first and ambient second. Surfaces are flat at rest, defined by a 1px border and a tonal surface shift. Shadows appear as a response to state: hover, elevation, or focus. The system does not use heavy drop shadows to separate content that a border already separates.

### Shadow Vocabulary
- **`shadow-xs`** (`0 1px 2px 0 rgb(0 0 0 / 0.05)`): Resting cards, inputs, and badges.
- **`shadow-sm`** (`0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)`): Buttons and small raised controls.
- **`shadow-md`** (`0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)`): Hovered cards and floating panels.
- **`shadow-2xl`** (`0 25px 50px -12px rgb(0 0 0 / 0.25)`): Modals, drawers, and the live preview frame.
- **Expressive hover lift** (`translateY(-4px) scale(1.01)` plus a primary-tinted ambient shadow): Interactive cards in Expressive motion mode only.

### Named Rules
**The Border-First Rule.** A surface earns a shadow only when it leaves the page plane or responds to a pointer. At rest, a 1px border does the separating.

**The Motion Mode Rule.** Hover lift and press scale follow the user's motion setting: off, subtle, or expressive. Do not hardcode a lift that ignores the setting.

## Shapes

The form language is architectural: soft rectangles, clean edges, and circular status marks. Corners are rounded but never pill-shaped except for badges, chips, and filter tabs.

- **Base radius:** 8px (`--radius`).
- **Cards and banners:** 16px (`rounded-2xl`) to 24px (`rounded-3xl`).
- **Buttons and inputs:** 6px to 8px (`rounded-md` to `rounded-lg`).
- **Badges, chips, and filter tabs:** fully rounded (`rounded-full`).
- **Pass and QR containers:** 16px with a white field and an inner border for optical contrast.
- **Borders:** 1px at 80% border opacity for resting surfaces; full border opacity on focus and active states.

### Named Rules
**The Soft Rectangle Rule.** Content containers are soft rectangles. Pills are reserved for status, filters, and compact actions, not for primary content cards.

## Components

### Buttons
- **Shape:** 8px radius, 40px default height, 32px small, 48px large.
- **Primary:** Institutional Cobalt background with Paper text, medium weight, 16px horizontal padding. Hover drops to 90% opacity; active scales to 0.98.
- **Outline:** Paper background, 1px Structure Line border, Ink text. Hover fills with the Slate Wash accent.
- **Ghost:** Transparent at rest, Slate Wash on hover. Used for tertiary actions and icon buttons.
- **Archetype:** Category primary background with white text. Used inside a themed event page for the page's own primary action.
- **Focus:** 2px ring in the primary color with a 2px offset. Never remove the focus ring.

### Cards and Containers
- **Corner Style:** 16px radius.
- **Background:** White Card in light mode, Deep Slate Card in dark mode.
- **Border:** 1px Structure Line at 80% opacity.
- **Shadow Strategy:** `shadow-xs` at rest; `shadow-md` on hover for interactive cards.
- **Internal Padding:** 24px comfortable, 12px compact, driven by `--card-padding`.

### Inputs and Fields
- **Style:** 40px height, 6px radius, 1px Structure Line border, Paper background, 14px text.
- **Focus:** 2px ring in the primary color with a 2px offset; border shifts to the ring color.
- **Error:** Revocation Rose border and a 12px error line below the field, wired with `aria-invalid` and `aria-describedby`.
- **Disabled:** 50% opacity with a not-allowed cursor.

### Chips and Badges
- **Style:** Fully rounded, 12px semibold text, 2px by 10px padding.
- **Default:** Slate Wash background with Slate Text.
- **Semantic:** Emerald, Amber, Sky, and Rose tinted surfaces for verified, warning, info, and destructive states.
- **Archetype:** Category surface with category primary text and a category border.

### Navigation
- **Top bar:** 64px tall, sticky, Paper or Obsidian surface with a 1px bottom border. Brand mark at the left, primary navigation in the center, region and account controls at the right.
- **Mobile:** Bottom navigation with icon and label, 44px minimum targets, and a safe-area inset.
- **Active state:** Primary color text and a subtle primary tint, never a filled pill across the whole item.

### Digital Pass
The pass is the signature component. A white card with a 16px radius, a high-contrast QR matrix, the event and hall name, the pass reference in mono, and a status badge. It is designed to be read by a turnstile scanner in bright light: pure black on white for the code field, no gradients over the code, and a 21:1 contrast target.

### Live Preview Frame
The organizer customizer uses a device frame with mobile (390px), tablet (768px), and desktop (1280px) toggles. The frame carries the real event hero, palette, typography, and section visibility. It is a preview of the actual page, not a stylized mockup.

## Do's and Don'ts

### Do:
- **Do** use vector SVG icons from `lucide-react` at 14px, 16px, or 20px, with `aria-hidden` on decorative icons.
- **Do** co-locate the exact hall name with the venue name on discovery, pass, and timetable surfaces.
- **Do** keep touch targets at 44px or larger on mobile, including icon-only controls.
- **Do** support light and dark mode through the semantic tokens, not hardcoded colors.
- **Do** keep the 11px metadata floor and the 65 to 75 character reading line.
- **Do** show a visible focus ring on every interactive element.

### Don't:
- **Don't** use emojis in production code or copy.
- **Don't** use em dashes in copy.
- **Don't** use artificial intelligence buzzwords such as "Command Center" or "Command and Intelligence". Use institutional terms: Organizer Portal, Event Management Hub, Event Categories, Attendee Perks and Guidebook.
- **Don't** nest a `<button>` inside a `<Link>`; use `buttonVariants` for accessible anchor buttons.
- **Don't** brighten the primary or muted text back to a value that fails AA on tinted chips.
- **Don't** put gradients or imagery behind a QR code or a pass reference.
