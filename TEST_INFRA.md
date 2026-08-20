# XPO Testing Infrastructure & Quality Engineering Specification (`TEST_INFRA.md`)

**Document Version:** 1.0.0  
**Architect:** Lead E2E & System Test Architect (`test_track_1`)  
**Workspace:** `/Users/lonard/Desktop/XPO`  
**Applicability:** All Test Suites (`tests/unit/`, `tests/integration/`, `tests/e2e/`)

---

## 1. Executive Summary & Testing Philosophy

The **XPO (MICE Digital Ecosystem)** platform serves enterprise-grade Meetings, Incentives, Conferences, and Exhibitions across global and regional hubs (Indonesia, Japan, Global). Because MICE events handle high-concurrency ticket checkouts, cryptographic door access, real-time stage scheduling, and multi-model AI analytics, the testing framework employs an **Opaque-Box 4-Tier Testing Architecture** backed by deterministic assertions, cryptographic verification, and strict zero-emoji accessibility compliance.

### Core Testing Pillars:
1. **Forensic Integrity**: Every test asserts against authoritative specifications from `PROJECT.md` and `ORIGINAL_REQUEST.md`. No test is designed as a facade or superficial pass.
2. **Deterministic Cryptography**: Anti-tamper ticket signatures are verified with real HMAC-SHA256 calculations and nonces, ensuring replay attacks and bit-flip tampering are strictly rejected.
3. **Multi-Locale & Multi-Currency Fidelity**: All 6 official locales (`en`, `ja`, `zh-CN`, `id`, `de`, `es`) and 5 supported currencies (`IDR`, `JPY`, `USD`, `EUR`, `SGD`) are systematically tested across timezone boundaries.
4. **Zero-Emoji Quality Gate**: A programmatic file audit recursively verifies that zero raw Unicode emoji characters exist in source code, enforcing 100% `lucide-react` vector SVG iconography.
5. **Progressive Independence**: Tests are fully isolated, generating their own fixture state and cleaning up without cross-test state leakage.

---

## 2. 4-Tier Testing Methodology

```
+-----------------------------------------------------------------------------------+
|                        TIER 4: REAL-WORLD MICE USER JOURNEYS                      |
|  (End-to-End flows: Discovery -> Checkout -> QR Pass -> Door Scan -> AI Analytics)|
+-----------------------------------------------------------------------------------+
|                  TIER 3: PAIRWISE CROSS-FEATURE INTERACTIONS                      |
|     (i18n Currency x Archetype Theming x QR Crypto x DB Booking x AI Gateway)     |
+-----------------------------------------------------------------------------------+
|                      TIER 2: BOUNDARY & ADVERSARIAL EDGE CASES                    |
|   (Signature Tampering, Replay Attacks, Extreme Currency, Timezone Warps, Faults)|
+-----------------------------------------------------------------------------------+
|                        TIER 1: FEATURE COVERAGE (>=5 per feature)                 |
|   (Zero-Emoji, QR Crypto, i18n Formatters, 9 Archetypes, AI Gateway, Scraper, RBAC)|
+-----------------------------------------------------------------------------------+
```

---

### Tier 1: Feature Coverage (Minimum 5 Test Cases per Feature)

Every feature in the system is guarded by at least 5 distinct test cases verifying primary behavior, input validation, and expected contract fulfillment:

1. **Feature 1: Zero-Emoji Compliance & Accessible Design Tokens (`tests/unit/a11y/zero-emoji.test.ts`)**
   - T1.1: Root `src/` directory scan for raw Unicode emojis.
   - T1.2: Component files (`.tsx`) inspection for emoji escape sequences.
   - T1.3: Translation dictionary files (`src/messages/`) verification.
   - T1.4: Icon property validation asserting Lucide icon naming conventions.
   - T1.5: Whitelist verification for clean SVG icon rendering.

2. **Feature 2: Cryptographic QR Pass & Anti-Tamper Engine (`tests/unit/tickets/qrPass.test.ts`)**
   - T1.6: Deterministic HMAC-SHA256 signature generation with secret salt.
   - T1.7: Valid signature verification and payload recovery.
   - T1.8: Unique nonce and timestamp embedding in payload.
   - T1.9: SVG QR code XML structure generation with primary brand color.
   - T1.10: Formatted alphanumeric human-readable booking reference (`XPO-PASS-*`).

3. **Feature 3: Multilingual i18n & Regional Formatters (`tests/unit/i18n/formatters.test.ts`)**
   - T1.11: Indonesian Rupiah (`IDR`) currency formatting with `id` locale (`Rp 500.000`).
   - T1.12: Japanese Yen (`JPY`) zero-decimal currency formatting (`¥15,000`).
   - T1.13: Multi-currency formatting across `USD`, `EUR`, `SGD` in `en`, `de`, `zh-CN`, `es`.
   - T1.14: Multi-day date range formatting across timezones (`Asia/Jakarta`, `Asia/Tokyo`, `UTC`).
   - T1.15: Bidirectional text layout direction negotiation (`ltr` vs `rtl`).

4. **Feature 4: 9-Archetype Dynamic Theming Engine (`tests/unit/theming/theming.test.ts`)**
   - T1.16: Industrial B2B archetype token resolution (Slate/Amber palette, technical badge).
   - T1.17: Tech Summit archetype token resolution (Indigo/Cyan palette, mono typography).
   - T1.18: Medical Symposium archetype token resolution (Teal/Emerald palette, serif typography).
   - T1.19: Finance & Investor archetype token resolution (Navy/Gold palette, encrypted badge).
   - T1.20: Pop Culture & Gaming archetype token resolution (Purple/Pink palette, vibrant styling).
   - T1.21: Music Festival, Mega Expo, Diplomatic, and Incentive Retreat token resolutions.
   - T1.22: Dynamic CSS variable injection map (`--archetype-primary`, `--archetype-accent`, etc.).
   - T1.23: Organizer custom branding color & hero badge override application.

5. **Feature 5: OpenRouter Multi-Model AI Gateway (`tests/unit/ai/openrouter.test.ts`)**
   - T1.24: Support and configuration for all 6 models (`gemini-3.5-flash-lite`, `gemini-3.7-flash`, `deepseek-v4-pro-0813`, `qwen/qwen3.7-plus`, `openai/gpt-5.6-luna`, `google/gemma-4-26b-a4b-it`).
   - T1.25: Structured output extraction with Zod schema validation.
   - T1.26: Streaming response generator chunking.
   - T1.27: Context payload injection (venue, halls, schedule, exhibitors).
   - T1.28: Offline mock fallback resilience when API key is unconfigured.

6. **Feature 6: Venue Calendar Scraper & Deduplication Pipeline (`tests/unit/crawler/scraper.test.ts`)**
   - T1.29: Simulated venue calendar raw HTML/JSON schedule ingestion.
   - T1.30: Event title slugification and hall name normalization.
   - T1.31: SHA-256 fingerprint deduplication (preventing double-ingestion of same event date/venue).
   - T1.32: Batch crawl statistics generation (total, new, updated, skipped).
   - T1.33: Multi-venue schedule parsing (JIExpo, ICE BSD, Tokyo Big Sight).

7. **Feature 7: Multi-Role RBAC & Session Guards (`tests/unit/auth/rbac.test.ts`)**
   - T1.34: Role hierarchy validation (`ATTENDEE` < `ORGANIZER` < `ADMIN`).
   - T1.35: Attendee portal access permissions.
   - T1.36: Organizer command center route authorization (`/(organizer)/*`).
   - T1.37: Admin governance portal route authorization (`/(admin)/*`).
   - T1.38: Fast developer role-switching simulation for rapid test cycles.

---

### Tier 2: Boundary & Adversarial Edge Cases

Tier 2 exposes domain engines to extreme, malformed, and adversarial inputs to guarantee zero crash and zero security breach:

1. **Cryptographic Tamper Resistance**:
   - Signature payload truncation (chopped last 4 bytes).
   - Bit-flip in payload string (modifying tier from `STANDARD` to `VIP`).
   - Forged HMAC with invalid secret key.
   - Replay attack with expired timestamp.
   - Nonce tampering and collision rejection.

2. **Currency & Locale Boundaries**:
   - Zero-amount tickets (`0 IDR` free passes).
   - Massive transaction amounts (`100,000,000 IDR`, `5,000,000 JPY`).
   - Negative amounts and non-integer inputs gracefully sanitized.
   - Unsupported or malformed locale tags falling back safely to `en`.
   - Single-day vs Multi-day spanning across month/year boundaries (e.g. Dec 30, 2026 – Jan 2, 2027).

3. **Archetype Theming Invariants**:
   - Unknown archetype fallback to `INDUSTRIAL_B2B`.
   - Partial organizer branding overrides (e.g. only overriding `primaryColor` without touching `accentColor`).
   - Hex color string normalization and CSS variable format compliance.

4. **Crawler Ingestion Edge Cases**:
   - Empty event schedules from dormant venues.
   - Malformed dates (e.g. invalid leap day, missing end date).
   - Duplicate events with subtle whitespace/casing variations.

5. **AI Gateway Edge Cases**:
   - Empty prompt or missing message array handling.
   - Malformed JSON responses falling back to resilient schema defaults.
   - Extreme token limit constraints.

---

### Tier 3: Pairwise Cross-Feature Interactions

Tier 3 validates the contracts where two or more distinct subsystems interact:

1. **Localization x Archetype Theming x Ticket Pricing**:
   - A Japanese attendee (`ja` locale) viewing a `TECH_DEV_SUMMIT` archetype event with `JPY` currency formatting and archetype-specific styling variables.
2. **Ticket Checkout x Cryptographic Signing x Prisma DB Booking**:
   - Completing a ticket checkout transaction, computing the HMAC signature, persisting to DB with relational tier linking, and ensuring unique hash constraint.
3. **QR Scanner Verification x State Mutation x Perk Unlocking**:
   - Ingesting a scanned QR payload, validating signature, verifying booking status transition from `CONFIRMED` to `CHECKED_IN`, recording `checkedInAt`, and granting tier-specific VIP perks.
4. **OpenRouter AI Gateway x Event Telemetry x Organizer Report Persistence**:
   - Fetching real event attendee & booth telemetry, passing through OpenRouter with Zod schema, and persisting structured output into `AIReport` table.

---

### Tier 4: Real-World MICE User Journeys

Tier 4 tests execute complete, end-to-end user workflows spanning multiple steps:

1. **Journey 1: Attendee Discovery -> Filter -> Checkout -> QR Pass -> Digital Guidebook**
   - Attendee searches events by archetype (`INDUSTRIAL_B2B`) and city (`Jakarta`).
   - Selects "Manufacturing Indonesia 2026" at JIExpo Kemayoran.
   - Selects "VIP Delegate" tier, completes checkout.
   - Receives tamper-proof cryptographic QR Pass.
   - Opens Digital Guidebook, tracks Main Stage keynotes, and unlocks VIP Lounge perks.

2. **Journey 2: Organizer Event Setup -> Live Branding Customizer -> Door Check-In Scanner**
   - Organizer sets up event with custom branding overrides.
   - Generates preview tokens.
   - Launches Door Staff Scanner simulation.
   - Scans valid attendee QR pass: check-in succeeds with green confirmation and badge details.
   - Scans same pass second time: check-in correctly rejected with `ALREADY_CHECKED_IN` warning.
   - Scans tampered pass: check-in strictly rejected with `INVALID_SIGNATURE` error.

3. **Journey 3: Admin Venue Schedule Ingestion & Crawler Deduplication**
   - Admin triggers venue crawler for JIExpo and ICE BSD.
   - First run ingests 10 new events.
   - Second run with identical data detects 10 duplicates, ingests 0, and records audit log.

4. **Journey 4: Organizer Multi-Model AI Analytics Generation**
   - Organizer selects event telemetry and chooses `google/gemini-3.7-flash`.
   - Generates Executive Daily Digest with sentiment score, booth foot traffic, and recommendations.
   - Persists report to database and displays structured KPI dashboard.

---

## 3. Pass/Fail Semantics & Quality Gate Thresholds

| Quality Gate | Condition for PASS | Condition for FAIL | Enforcement Mechanism |
|---|---|---|---|
| **Zero-Emoji Compliance** | 0 raw Unicode emojis in all `.ts`, `.tsx`, `.json` files in `src/` | >= 1 raw emoji character found | `tests/unit/a11y/zero-emoji.test.ts` |
| **Cryptographic Tamper Gate** | 100% of tampered signatures rejected; 100% of valid signatures verified | Any tampered hash verifies OR valid hash fails | `tests/unit/tickets/qrPass.test.ts` |
| **Type Safety Gate** | `npm run type-check` returns exit code 0 | Any TypeScript compilation error | `tsc --noEmit` |
| **Test Suite Pass Rate** | 100% of all Vitest tests pass across all tiers | >= 1 test failure | `vitest run` |
| **Prisma Relational Gate** | Zero foreign key constraint violations during seed & checkout | Any unhandled DB schema mismatch | `tests/integration/db.test.ts` |

---

## 4. Test Execution & Automation Runbook

```bash
# 1. Run all unit and integration test suites
npm test

# 2. Run test suites in watch mode for development
npm run test:watch

# 3. Verify TypeScript type safety
npm run type-check

# 4. Verify Next.js production build
npm run build
```

---

## 5. Escalation & Defect Resolution Protocol

1. **Test Failure Categorization**:
   - **Type A: Test Specification Bug**: The test made incorrect assumptions about the contract in `PROJECT.md`. Fix: Update test assertion to match specification.
   - **Type B: Implementation Defect**: Implementation code fails to meet documented specification or leaks raw emojis. Fix: Escalate defect with line numbers and repro to implementing subagent.
   - **Type C: Non-Deterministic Flakiness**: Timezone or timestamp boundary mismatch. Fix: Pin timestamps and nonces using mock clocks / fixed seeds.
2. **Zero-Emoji Escalation**: If any agent introduces a raw emoji, the zero-emoji test immediately flags the exact file and line. Replace with `lucide-react` SVG icon.
