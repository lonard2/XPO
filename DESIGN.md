---
name: XPO MICE Digital Ecosystem
description: Institutional Digital Ecosystem for Global MICE Events, Venues & Passes
colors:
  primary: "#2563eb"
  primary-hover: "#1d4ed8"
  primary-dark: "#3b82f6"
  background-light: "#f8fafc"
  background-dark: "#090d16"
  surface-light: "#ffffff"
  surface-dark: "#0f172a"
  surface-dark-subtle: "#1e293b"
  border-light: "#e2e8f0"
  border-dark: "#1e293b"
  text-light-primary: "#0f172a"
  text-light-muted: "#64748b"
  text-dark-primary: "#f8fafc"
  text-dark-muted: "#94a3b8"
  emerald-verified: "#10b981"
  amber-warning: "#f59e0b"
  rose-destructive: "#e11d48"
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
typography:
  display:
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: "clamp(2.25rem, 5vw, 3.75rem)"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: "clamp(1.5rem, 3vw, 2.25rem)"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  label:
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.025em"
rounded:
  sm: "4px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  2xl: "24px"
  3xl: "32px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "48px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-secondary:
    backgroundColor: "{colors.surface-dark-subtle}"
    textColor: "{colors.text-dark-primary}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  card-standard:
    backgroundColor: "{colors.surface-light}"
    textColor: "{colors.text-light-primary}"
    rounded: "{rounded.2xl}"
    padding: "20px"
---

# Design System: The Modern Trade Pavilion

## 1. Overview

**Creative North Star: The Modern Trade Pavilion**  
XPO is designed around the architectural clarity, institutional precision, and frictionless wayfinding of world-class convention complexes (e.g., JIExpo Kemayoran, Tokyo Big Sight, Marina Bay Sands).

The interface balances dense, operational MICE data (ceiling heights, floor loadings, hall indices, timetables) with elegant, legible visual hierarchy. The tone is authoritative and executive, avoiding consumer clutter, cartoonish illustrations, and artificial AI tropes.

### Core Tenets:
1. **Architectural & Tactile**: Clean 1px structural borders, subtle tonal background shifts (`bg-muted/40`), high-contrast micro-labels, and full-surface touch targets.
2. **Spatial Reality**: Every event, pass, and schedule is explicitly mapped to its exact physical Hall, Wing, and Transit Hub.
3. **Turnstile-Ready High Contrast**: Critical identification surfaces (digital passes, gate check-in scanners, QR badges) maintain WCAG AAA optical contrast ratios (12:1 to 21:1) for rapid scanning under bright sunlight.
4. **Institutional Cleanliness**: Zero emojis in production code, vector SVGs from `lucide-react` exclusively, and zero em-dashes in copy.

---

## 2. Colors

XPO utilizes a dual-layer color system: an enterprise slate neutral foundation paired with 15 specialized MICE category identity palettes.

### Core Neutral & Semantic Palette:
- **Primary Navy/Blue**: `#2563eb` (Default Action) / `#1d4ed8` (Hover) / `#3b82f6` (Dark Mode Accent).
- **Background Surfaces**: Light `#f8fafc` / Dark `#090d16` (Deep Slate Obsidian).
- **Card Surfaces**: Light `#ffffff` / Dark `#0f172a` / Sub-surface `#1e293b`.
- **Structural Borders**: Light `#e2e8f0` / Dark `#1e293b` (1px clean demarcation).
- **Verified Status (Gate & Security)**: `#10b981` (Emerald 500) with subtle pulse animation.
- **Warning & Capacity Alerts**: `#f59e0b` (Amber 500).
- **Destructive & Cancelled**: `#e11d48` (Rose 600).

### 15 MICE Domain Category Archetypes:
Each of the 15 MICE event categories defines a dedicated CSS variable scope:

| Category | Primary Color | Accent Hue | Typical Surface Theme |
|---|:---:|:---:|---|
| **Industrial & Manufacturing B2B** | `#2563eb` (Steel Blue) | `#f59e0b` (Amber) | Heavy machinery slate |
| **Tech, AI & Developer Summit** | `#6366f1` (Indigo) | `#06b6d4` (Cyan) | Obsidian terminal dark |
| **Medical & Healthcare Symposium** | `#0d9488` (Teal) | `#10b981` (Emerald) | Clean clinical white/slate |
| **Financial & Investor Forum** | `#1e3a8a` (Deep Navy) | `#d97706` (Gold) | Institutional boardroom dark |
| **Pop Culture & Gaming Expo** | `#9333ea` (Purple) | `#ec4899` (Magenta) | Vibrant neon arena |
| **Music Festival & Arena Concert** | `#e11d48` (Rose) | `#8b5cf6` (Violet) | Stage black & velvet |
| **Mega Exposition & Pavilion** | `#ea580c` (Orange) | `#16a34a` (Green) | Multi-pavilion fairground |
| **Government & Diplomatic Summit** | `#0284c7` (Sky Blue) | `#ca8a04` (Bronze) | Protocol navy |
| **Incentive & Corporate Retreat** | `#059669` (Emerald) | `#d97706` (Warm Stone)| Botanical sanctuary |
| **Automotive & Mobility Show** | `#dc2626` (Crimson) | `#2563eb` (Blue) | High-gloss motor dark |
| **Energy & Green Infrastructure** | `#d97706` (Gold) | `#10b981` (Green) | Grid power & earth |
| **Agriculture & Food Expo** | `#16a34a` (Forest) | `#f59e0b` (Harvest) | Organic harvest |
| **Hospitality & Travel Mart** | `#0891b2` (Cyan) | `#f97316` (Coral) | Maritime gateway |
| **Education & EdTech Summit** | `#7c3aed` (Violet) | `#0284c7` (Cobalt) | Academic campus |
| **Fashion & Luxury Retail** | `#db2777` (Fuchsia) | `#4f46e5` (Indigo) | Runway editorial |

---

## 3. Typography

The typographic engine uses modern variable fonts configured via `next/font` and CSS variables:

### Font Stacks:
- **Primary Sans (`var(--font-sans)`)**: `Plus Jakarta Sans`, `-apple-system`, `BlinkMacSystemFont`, `sans-serif`. Used for all primary headlines, navigation, card titles, and body copy.
- **Editorial Serif (`var(--font-serif)`)**: `Newsreader`, `Charter`, `Georgia`, `serif`. Used for keynote abstracts, press releases, and executive statements.
- **Engineering Mono (`var(--font-mono)`)**: `JetBrains Mono`, `Fira Code`, `Menlo`, `monospace`. Used for cryptographic pass hashes, turnstile references, timestamps, and technical hall specs.
- **Accessible Legible (`var(--font-legible)`)**: `Atkinson Hyperlegible`, `sans-serif`. Accessible high-legibility option in Settings.

### Scale & Hierarchy:
- **Display Hero**: `text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight` (36px to 48px+).
- **Section Heading**: `text-xl sm:text-2xl font-bold tracking-tight text-foreground` (20px to 24px).
- **Card Title**: `text-base font-bold text-foreground` (16px, semibold/bold).
- **Body & Descriptions**: `text-xs sm:text-sm text-muted-foreground leading-relaxed` (12px to 14px).
- **Micro-Labels & Metadata**: `text-xs` (12px) / `text-[11px]` (11px minimum legibility floor).

---

## 4. Layout

### Responsive Breakpoints & Viewport Rules:
- **Mobile (`< 768px`)**:
  - Anchored bottom navigation for one-handed thumb ergonomics.
  - Sticky segmented day-of subnav bar (`[ Pass | Treats | Timetable | Map ]`).
  - Full-width swipeable cards and compact accordion rows.
- **Tablet (`768px - 1024px`)**:
  - 2-column discovery grids (`md:grid-cols-2`).
  - Hybrid dual-pane split views for agenda sessions and floor maps.
- **Desktop & Ultrawide (`> 1024px / 1280px / 1600px+`)**:
  - Expansive multi-column layouts: `lg:grid-cols-3 xl:grid-cols-4`.
  - Max container limits: `max-w-7xl mx-auto` or fluid `3xl:max-w-[1800px]` to eliminate awkward empty whitespace.
  - Side-by-side live preview panels for the Organizer Customizer.

---

## 5. Elevation & Depth

XPO avoids heavy, artificial drop shadows, relying instead on **tactile 1px structural borders and subtle ambient elevation**:

- **Card Base**: `border border-border/80 bg-card shadow-xs`.
- **Card Hover State**: `hover:border-primary/60 hover:shadow-md transition-all duration-200`.
- **Floating Modals & Drawers**: `bg-background/95 backdrop-blur-md shadow-2xl border border-border`.
- **Turnstile Scanner Mode**: Pure monochrome fullscreen overlay (`bg-black/90 backdrop-blur-sm`).
- **Print Mode**: `@media print { box-shadow: none; border-color: black; }` for crisp physical badge printing.

---

## 6. Shapes

- **Base Radius Token**: `--radius: 0.5rem` (8px).
- **Cards & Banners**: `rounded-2xl` (16px) to `rounded-3xl` (24px) for prominent content containers.
- **Buttons & Interactive Pills**: `rounded-xl` (12px) / `rounded-lg` (8px) for buttons and inputs.
- **Badges & Status Dots**: `rounded-full` (pills) with `text-xs font-semibold px-2.5 py-0.5`.
- **QR Code Containers**: `rounded-2xl border border-slate-200 bg-white p-6 shadow-inner`.

---

## 7. Components

### A. Buttons (`src/components/ui/Button.tsx`):
- `default` / `primary`: High-contrast `bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl`.
- `outline`: `border border-border/80 bg-background hover:bg-muted text-foreground rounded-xl`.
- `ghost`: Transparent background with subtle hover highlight.
- `destructive`: `bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl`.

### B. Interactive Cards (Stretched Link Standard):
- All discovery, venue, and pass cards use the accessible stretched link pattern:  
  `<Link href="..." className="after:absolute after:inset-0">` on the primary title, with secondary action buttons nested using `relative z-10`.

### C. Digital Pass & Barcode QR:
- Vector SVG matrix rendered locally via constant-time HMAC-SHA256 hash.
- High-contrast 21:1 pure black-on-white modal for optical turnstile scanners.
- Client-side offline caching in `localStorage`.

### D. Multi-Device Live Preview Frame:
- Live WYSIWYG branding customizer with mobile (390px), tablet (768px), and desktop (1280px) responsive viewport toggles.

---

## 8. Do's and Don'ts

### Do:
- **Do** use vector SVG icons from `lucide-react` with precise sizing (`h-3.5 w-3.5`, `h-4 w-4`).
- **Do** co-locate exact Hall names (`venueHall.name`) alongside venue titles on all discovery and pass surfaces.
- **Do** provide full-card touchability via stretched links on mobile event cards.
- **Do** support both Light and Dark mode seamlessly with semantic design tokens.
- **Do** maintain a minimum legibility floor of `text-[11px]` for supplementary metadata.

### Don't:
- **Don't** use emojis anywhere in production code or UI copy.
- **Don't** use em-dashes (`—`) in copy.
- **Don't** use artificial AI buzzwords (e.g. "Command & Intelligence", "Command Center"). Use institutional terms ("Organizer Portal", "Event Management Hub").
- **Don't** nest `<button>` inside `<Link>`. Use `buttonVariants` for accessible anchor buttons.
- **Don't** call React hooks conditionally inside `try/catch` blocks.
