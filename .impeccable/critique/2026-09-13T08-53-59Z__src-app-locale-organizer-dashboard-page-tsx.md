---
target: organizer dashboard
total_score: 16
max_score: 40
na_heuristics: 
p0_count: 2
p1_count: 3
target_identity: "file:/Users/lonard/Desktop/XPO/src/app/[locale]/(organizer)/dashboard/page.tsx"
target_fingerprint: "sha256:0cd01248b746bde1d1ac167843b7e983079f35f94183dcb07c9b885612de160d"
target_path: /Users/lonard/Desktop/XPO/src/app/[locale]/(organizer)/dashboard/page.tsx
timestamp: 2026-09-13T08-53-59Z
slug: src-app-locale-organizer-dashboard-page-tsx
---
## Organizer Dashboard : Full Design Critique
### XPO MICE Platform : Mode: Operate : Target: `src/app/[locale]/(organizer)/dashboard/page.tsx`

Method: dual-agent (A: 558d8a41-1d48-49aa-956c-c87f27776ba8 · B: 5228e439-a483-46da-9005-12ea0e304019)

### Design Health Score

| # | Heuristic | Score | Key Findings & Evidence |
|---|-----------|:-----:|-------------------------|
| 1 | Visibility of System Status | 1 / 4 | Static server component displays "Live Metrics • Data as of HH:MM" with pulsing indicator despite zero real-time polling or WebSocket stream; event cards lack temporal status badges. |
| 2 | Match System / Real World | 2 / 4 | MICE terminology is present, but multi-currency revenues (IDR, JPY, USD) are summed directly into a single scalar number and formatted by browser UI locale; global booth occupancy lumps separate cities together. |
| 3 | User Control and Freedom | 1 / 4 | Zero filtering or sorting controls across multi-event rosters; cannot filter by region (ID, JP, Global), temporal state (Live, Upcoming, Concluded), or search by event name. |
| 4 | Consistency and Standards | 2 / 4 | Multiple nested interactive elements (<Link><Button>) violate HTML5 standards and AGENTS.md rules; breadcrumb links duplicate current dashboard URL; three separate buttons trigger event launch. |
| 5 | Error Prevention | 2 / 4 | RBAC session gating protects internal data from Attendee personas, but the concourse dashboard lacks threshold alerts for overbooked halls or maxed-out turnstiles. |
| 6 | Recognition Rather Than Recall | 2 / 4 | Event cards display basic logistics, but the recent check-in audit feed omits timestamps and displays raw truncated hexadecimal hashes instead of human-readable hall turnstile references. |
| 7 | Flexibility and Efficiency | 1 / 4 | No compact tabular view for multi-event portfolios; zero keyboard accelerators; 4 competing outline buttons per card create visual button clutter. |
| 8 | Aesthetic and Minimalist Design | 3 / 4 | Institutional typography and clean 1px border tokens adhere to DESIGN.md; however, bottom-right shortcuts card duplicates primary sidebar navigation. |
| 9 | Error Recovery | 1 / 4 | Database query failures are caught and silently suppressed, rendering zeros across all metrics with no visible error banner or retry prompt. |
| 10 | Help and Documentation | 1 / 4 | No contextual tooltips or documentation explaining operational metric derivations (e.g. Check-In Velocity formula or booth occupancy calculation). |
| **Total** | | **16 / 40** | **Critical Need for Operational Hardening** |

---

### Design Specificity Verdict

**Hybrid facade over a generic SaaS admin dashboard.**

While the interface incorporates MICE lexicon (exhibition, booths, delegates, halls), the operational mechanics and visual layout treat convention concourses like generic SaaS products:

- **Multi-Currency Aggregation Corruption**: Summing un-converted ticket revenues across IDR, JPY, and USD into a single number and formatting according to the user's active UI locale creates extreme reporting corruption (e.g. 150,000,000 IDR formatted as $150,000,000 USD).
- **Static Telemetry Misrepresentation**: The dashboard presents a pulsing "Live Metrics" beacon, yet is rendered as a static Server Component with no background polling or refresh control.
- **Deterministic Scan Evidence**: Assessment B ran the mechanical detector and identified 24 true defects:
  - 10 `nested-interactive` violations (`<Link><Button>` nesting across dashboard and layout).
  - 10 `sub-44px-touch-target` violations (<44px touch targets on mobile viewports).
  - 2 `progress-aria` violations (visual progress meters missing `role="progressbar"`, `aria-valuenow`, and accessible labels).
  - 1 `eyebrow-kicker` violation (craft floor heading hierarchy defect).
  - 1 `dynamic-contrast-risk` violation (raw archetype color injection on text).

---

### Overall Impression

The dashboard presents an aesthetically clean visual foundation adhering to XPO's design system tokens, but falters in real-world MICE operational environments. A show director at JIExpo Kemayoran or Tokyo Big Sight cannot trust un-converted currency numbers, lacks live turnstile telemetry, cannot filter active from past expos, and is subjected to nested interactive HTML bugs.

---

### What is Working

1. **Clean Design System Aesthetics**: Consistent Plus Jakarta Sans typography, tactile 1px border tokens, and zero emojis or conversational AI quirks.
2. **High-Contrast Metric Presentation**: KPI cards feature large, legible typography with 10% tinted icon containers.
3. **Institutional RBAC Gating**: Clean role restriction barrier in `layout.tsx` offering a direct switch to the Organizer persona.

---

### Priority Issues

**[P0] Multi-Currency Revenue Aggregation Corruption**
- What: Ticket sales across IDR, JPY, and USD are summed into a single integer, then formatted using the UI locale currency.
- Why it matters: Causes severe financial misreporting. An Indonesian event with Rp 150.000.000 in sales displays as $150,000,000 USD when viewed in English.
- Fix: Group revenues by currency denomination or scope the dashboard to the event's regional currency.
- Suggested command: /impeccable harden

**[P0] Invalid Interactive HTML Nesting (<Link><Button>)**
- What: 10 instances of `<Link href="..."><Button>...</Button></Link>` across `dashboard/page.tsx` and `layout.tsx`.
- Why it matters: Violates HTML5 content models, confuses screen readers, creates nested focus stops, and breaks browser interaction.
- Fix: Refactor to `<Link href="..." className={buttonVariants({...})}>` or use Button with `asChild`.
- Suggested command: /impeccable audit

**[P1] Silent Database Error State Suppression**
- What: Catch block silently logs database errors and renders zeros across all metrics with no user-facing indication.
- Why it matters: If the network drops or the database fails, organizers panic assuming their event data was deleted.
- Fix: Render an operational Alert Banner with a "Retry Connection" button when database queries fail.
- Suggested command: /impeccable harden

**[P1] Missing Temporal Triage and Event Filtering**
- What: Events are dumped into an unfilterable, unsorted card grid without temporal status indicators.
- Why it matters: Organizers managing multiple events cannot tell which exhibition is running today versus three weeks ago.
- Fix: Implement temporal triage tabs (Happening Now, Upcoming, Concluded) with search and `getEventTemporalStatus` badges.
- Suggested command: /impeccable layout

**[P2] Unannounced Progress Bars and Missing Timestamps**
- What: Progress meters lack WAI-ARIA `role="progressbar"` attributes, and check-in audit feeds omit timestamps.
- Why it matters: Blind operators cannot perceive capacity metrics, and door supervisors cannot verify when an attendee was admitted.
- Fix: Add `role="progressbar"` with `aria-valuenow` attributes, and include relative timestamps ("2 min ago") on recent check-ins.
- Suggested command: /impeccable polish

---

### Persona Red Flags

- **Alex (Power User)**: Managing concurrent expos in Jakarta and Tokyo. Revenue is merged into a single corrupted number; cannot filter between Indonesian and Japanese venues; timezones are blurred into browser local time.
- **Sam (Accessibility-Dependent)**: Screen reader user. Progress meters announce nothing; nested `<Link><Button>` creates duplicate tab stops; audit feed is composed of unsemantic divs rather than an accessible table.
- **Riley (Stress Tester)**: Testing 0 events yields empty white space without an onboarding CTA; testing database disconnection renders misleading zero metrics without an error banner.

---

### Minor Observations

- Breadcrumb duplicate link: `Organizer Hub > Dashboard` both link to `/${locale}/dashboard`.
- Hexadecimal noise: Check-in feed renders raw hashes like `e3b0c44298fc1c14...` instead of turnstile hall gates.
- Redundant shortcuts: Bottom-right operations card duplicates navigation links present in the primary left sidebar.

---

### Questions to Consider

1. Should the dashboard dynamically toggle between **Build Mode** (pre-event planning and ticket sales) and **Show-Day Mode** (concourse turnstile throughput and hall capacity)?
2. In a multi-regional MICE platform spanning Indonesia, Japan, and Global hubs, should financial metrics always be separated into dedicated regional wallets?
3. Should the physical Hall be elevated as the primary operational unit instead of the abstract Event database record?
