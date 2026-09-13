# Design Critique: Organizer Booth & Tenant Manager
**Target**: `src/app/[locale]/(organizer)/booths/page.tsx`
**Slug**: `src-app-locale-organizer-booths-page-tsx`
**Timestamp**: 2026-09-13T10:06:00Z
**Method**: dual-agent (A: 7fe20d8d-9c02-4471-8acc-424fd2fb4202 · B: 4edd410e-91e9-426e-a3c5-9b9d4792ba4f)
**Mode**: Operate (High-density floor logistics, tenant lot allocation, rapid filtering, bulk CSV roster ingestion)

---

## 1. Design Health Score

| # | Heuristic | Score | Key Issue |
|---|---|:---:|---|
| 1 | Visibility of System Status | 2/4 | CSV importer gives zero progress feedback; unassigned lots fail on backend silently while UI reports false success. |
| 2 | Match System / Real World | 3/4 | Uses realistic convention terminology; but lots are isolated cards rather than an interactive hall matrix or spreadsheet. |
| 3 | User Control and Freedom | 2/4 | No delete, remove, or release tenant action exists anywhere in the UI; Trash2 icon is imported but unused. |
| 4 | Consistency and Standards | 2/4 | Badge uses variant="archetype" with undefined CSS variables; lines 823-824 render banned em-dashes. |
| 5 | Error Prevention | 1/4 | Naive line.split(",") breaks on quoted commas; zero duplicate lot number detection; freeform hall text input. |
| 6 | Recognition Rather Than Recall | 3/4 | Dynamic hall and status filters; but modal forces coordinators to manually type hall names from memory. |
| 7 | Flexibility and Efficiency | 1/4 | Lacks table view, batch actions, roster CSV export, keyboard shortcuts, or density toggles for 150-500 booths. |
| 8 | Aesthetic and Minimalist Design | 3/4 | Clean structural 1px borders; but cards are 180px tall with excessive vertical whitespace for enterprise floor ops. |
| 9 | Error Recovery | 2/4 | CSV modal displays validation preview; but invalid rows cannot be fixed in-place and lack line numbers. |
| 10 | Help and Documentation | 2/4 | Input placeholders are realistic; but Upload button only accepts copy-pasted text with no file dropper or CSV specs. |
| **Total** | | **21/40** | **Needs Work (52.5%)** |

---

## 2. Design Specificity Verdict

- **LLM Assessment**: The interface incorporates essential MICE nomenclature (booth lot numbers, hall grouping, commercial tenants, industry taxonomy, occupancy telemetry). However, the interaction model treats 150 to 500 convention lots as loose 3-column e-commerce cards rather than a high-density tabular matrix. Furthermore, spatial dimensions (e.g. 3x3m shell scheme vs 6x6m raw space) are absent, the CSV importer commits only to ephemeral React state without backend persistence, and the single-booth API route rejects unassigned lots that lack a company name.
- **Deterministic Scan**: Mechanical detection identified 38 defects across 30 entries:
  - 1 eyebrow kicker above the main h1 (`booths/page.tsx:428`)
  - 1 heading hierarchy skip (h1 to h3 without an intermediate h2 at line 597)
  - 1 progress bar lacking `role="progressbar"` and ARIA attributes (`booths/page.tsx:495-500`)
  - 10 touch target violations under 44px (card edit button at 28px height, filter controls at 30px, modal actions at 32px)
  - 1 contrast and token failure: `variant="archetype"` badge references undefined CSS variables (`--archetype-primary`, `--archetype-surface`)
  - 1 table semantics gap: booth inventory is rendered as unannounced `<div>` cards without list or table landmarks
  - 4 missing visible form labels on search and filter dropdowns
  - 2 modal accessibility defects: lack of focus trap and missing `aria-labelledby`
  - 3 CSV parser safety issues: naive comma split, unbounded line parsing, and unvalidated URL protocol
  - 1 persistence gap: CSV bulk import updates local React state only and is lost on page refresh
  - 13 unused imports (10 Lucide icons, 3 Card subcomponents)
  - 3 dead variables/hooks (`locale`, `tCom`, and `isLoading` updated but never rendered in JSX)
  - 2 rule violations: em-dashes on lines 823 and 824 (`"—"`).
- **Visual Overlays**: CLI scan executed cleanly; overlays logged to report.

---

## 3. Overall Impression

The top occupancy telemetry and multi-faceted filter bar provide clear operational value for floor coordinators. However, the experience is severely crippled by data persistence gaps (bulk CSV rows vanish on page reload), naive comma splitting that mangles company names with legal suffixes, an unannounced 3-column card grid that forces 65+ viewports of scrolling for large exhibitions, sub-44px touch targets on all interactive controls, and undefined CSS variables on occupied lot badges.

---

## 4. What is Working

1. **Integrated Floor Saturation Telemetry**: The top metric strip gives immediate visibility into total lots, occupied units, vacant inventory, and an occupancy percentage bar, offering coordinators a rapid status check.
2. **Instant Multi-Faceted Filter Bar**: Combines full-text search with Hall, Status, and Event dropdowns, allowing rapid filtering across hundreds of lots in memory.
3. **Pre-Commit CSV Validation Preview**: Rows are validated in real time before commitment, flagging rows missing required lot identifiers.

---

## 5. Priority Issues (P0 to P3)

- **[P0] Data Persistence Omission and Ephemeral CSV Ingestion**
  - *Why it matters*: Bulk CSV imports update local React state only. Coordinators importing 100+ booths lose all records upon page reload or navigation.
  - *Fix*: Implement backend persistence for bulk imports and support vacant lots in the API.
  - *Suggested command*: `/impeccable harden`

- **[P0] Undefined Archetype CSS Variables and Banned Em-Dashes**
  - *Why it matters*: Occupied badges use `variant="archetype"`, which renders transparent backgrounds due to missing CSS variables, and lines 823-824 render forbidden em-dashes (`"—"`).
  - *Fix*: Replace `variant="archetype"` with `variant="secondary"` (or a high-contrast semantic token) and replace em-dashes with hyphens `"-"` or `"Unassigned"`.
  - *Suggested command*: `/impeccable polish`

- **[P0] Naive CSV Comma Splitting and Missing URL Sanitization**
  - *Why it matters*: `line.split(",")` breaks whenever company names or industries contain commas (e.g. "PT Nusantara, Tbk"), corrupting column indices. Unvalidated URLs allow `javascript:` execution.
  - *Fix*: Replace naive split with RFC 4180 quote-aware regex and validate URL protocols to `http:`/`https:`.
  - *Suggested command*: `/impeccable harden`

- **[P1] Sub-44px Touch Targets and Missing Visible Form Labels**
  - *Why it matters*: Card action buttons (28px height), modal buttons (32px), and filter selects (30px) cause frequent miss-taps on mobile or tablet devices on the exhibition floor.
  - *Fix*: Update all operational controls and buttons to `min-h-[44px]` and add visible accessible labels.
  - *Suggested command*: `/impeccable layout`

- **[P1] Eyebrow Kicker, Heading Skip, and Progress Bar ARIA Accessibility**
  - *Why it matters*: The header uses a banned kicker above `<h1>`, skips directly from `<h1>` to `<h3>`, and the occupancy bar lacks `role="progressbar"` attributes for screen readers.
  - *Fix*: Restructure the header to eliminate the kicker, nest card headings under an `<h2>` section, and add ARIA attributes to the occupancy bar.
  - *Suggested command*: `/impeccable typeset`

- **[P2] Format Inefficiency: Card Grid vs High-Density Table View**
  - *Why it matters*: Managing 200+ booths in large 3-column cards causes visual fatigue and excessive scrolling.
  - *Fix*: Provide a responsive high-density table view with sortable columns alongside the card view.
  - *Suggested command*: `/impeccable layout`

---

## 6. Persona Red Flags

- **Alex (Operations Director - 200 Booth Multi-Hall Expo)**: FAIL. Card performance forces 65+ viewport heights of scrolling. Alex cannot perform batch actions, cannot delete/unassign lots, and bulk imports are lost on reload.
- **Sam (Accessibility-Dependent Staff)**: FAIL. The booth roster is an unannounced `<div>` grid lacking table or list landmarks. Modals lack focus traps and `aria-labelledby`. The progress bar has no ARIA role.
- **Riley (Stress Tester / Dirty Data)**: FAIL. A 500-row CSV with quoted commas corrupts all column offsets. Duplicate booth numbers are accepted silently without collision warnings.
