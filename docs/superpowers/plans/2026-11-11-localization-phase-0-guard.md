# Localization Phase 0: Audit Guard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a repeatable audit for hardcoded UI strings and untranslated locale values, with a ratcheting baseline that later phases lower.

**Architecture:** A pure library at `scripts/lib/i18n-audit.ts` walks TSX with the TypeScript compiler API and compares locale bundles. A CLI wrapper prints the inventory or updates the baseline. Two Vitest tests enforce the ratchet.

**Tech Stack:** TypeScript compiler API, tsx, Vitest, next-intl message bundles.

**Spec:** `docs/superpowers/specs/2026-11-11-localization-coverage-design.md`

## Global Constraints

- No new dependencies. `typescript` and `tsx` are already installed.
- Copy-bearing attributes: `aria-label`, `placeholder`, `title`, `alt`, `label`, `helperText`, `description`, `emptyMessage`, `ctaLabel`, `confirmLabel`.
- Never-copy attributes: `className`, `href`, `src`, `id`, `name`, `role`, `type`, `value`, `htmlFor`, `key`, `data-*`, `fill`, `stroke`, `d`, `viewBox`.
- Six locales: `en`, `id`, `ja`, `zh-CN`, `de`, `es`.
- No emojis, no em dashes in any added string or doc.
- The allowlist is exact-match plus regex patterns. Never prefix-match.

## Review Focus

- JSX text split across elements: `Split <strong>across</strong> nodes` must report three fragments, not silently pass.
- A hardcoded string held in a variable or template literal: the AST scan cannot see it, and the guide must say so rather than imply full coverage. Pinned by the "does not see strings held in variables" test.
- An allowlist entry that is a prefix of a real sentence: only an exact match suppresses a hit.
- A brand name identical across locales: the value audit must not flag it.
- A short identical value such as `Info`: the value audit must not flag values at or below the minimum length.

---

### Task 1: Hardcoded UI audit

**Files:**
- Create: `scripts/lib/i18n-audit.ts`
- Create: `scripts/i18n-allowlist.json`
- Create: `tests/fixtures/i18n/sample.tsx`
- Test: `tests/unit/i18n/audit-i18n.test.ts`

**Interfaces:**
- Produces: `auditHardcodedUi(options?: { roots?: string[]; allowlist?: I18nAllowlist; cwd?: string }): HardcodedAuditResult`, `loadAllowlist(filePath?: string): I18nAllowlist`, and the types `HardcodedHit`, `I18nAllowlist`, `HardcodedAuditResult` exactly as declared below. Task 3 consumes `auditHardcodedUi` and `loadAllowlist`.

- [ ] **Step 1: Write the failing test**

Create `tests/fixtures/i18n/sample.tsx`:

```tsx
export function Sample() {
  const hidden = "Hidden string";
  return (
    <div className="flex gap-2" aria-label="Close dialog">
      <span>Plain sentence here</span>
      <a href="https://example.com">Example site</a>
      <p>Split <strong>across</strong> nodes</p>
      <input placeholder="partner@fund.com" />
      <span>{hidden}</span>
    </div>
  );
}
```

Create `tests/unit/i18n/audit-i18n.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import * as path from "path";
import {
  auditHardcodedUi,
  loadAllowlist,
  type I18nAllowlist,
} from "../../../scripts/lib/i18n-audit";

const FIXTURE = path.resolve(__dirname, "../../fixtures/i18n");
const EMPTY: I18nAllowlist = { exact: [], patterns: [], files: [] };

describe("hardcoded UI audit", () => {
  it("finds JSX text and copy-bearing attributes", () => {
    const result = auditHardcodedUi({ roots: [FIXTURE], allowlist: EMPTY, cwd: FIXTURE });
    const texts = result.hits.map((hit) => hit.text);

    expect(texts).toContain("Plain sentence here");
    expect(texts).toContain("Close dialog");
    expect(texts).toContain("Example site");
  });

  it("reports split JSX text as separate fragments", () => {
    const result = auditHardcodedUi({ roots: [FIXTURE], allowlist: EMPTY, cwd: FIXTURE });
    const texts = result.hits.map((hit) => hit.text);

    expect(texts).toContain("Split");
    expect(texts).toContain("across");
    expect(texts).toContain("nodes");
  });

  it("ignores className, href, and structural attributes", () => {
    const result = auditHardcodedUi({ roots: [FIXTURE], allowlist: EMPTY, cwd: FIXTURE });

    expect(result.hits.some((hit) => hit.text.includes("flex gap-2"))).toBe(false);
    expect(result.hits.some((hit) => hit.text.includes("https://"))).toBe(false);
    expect(result.hits.every((hit) => hit.attribute !== "className")).toBe(true);
    expect(result.hits.every((hit) => hit.attribute !== "href")).toBe(true);
  });

  it("suppresses only exact allowlist matches, never prefixes", () => {
    const exact = auditHardcodedUi({
      roots: [FIXTURE],
      allowlist: { exact: ["Plain sentence here"], patterns: [], files: [] },
      cwd: FIXTURE,
    });
    const prefix = auditHardcodedUi({
      roots: [FIXTURE],
      allowlist: { exact: ["Plain"], patterns: [], files: [] },
      cwd: FIXTURE,
    });

    expect(exact.hits.some((hit) => hit.text === "Plain sentence here")).toBe(false);
    expect(prefix.hits.some((hit) => hit.text === "Plain sentence here")).toBe(true);
  });

  it("reports the file and a one-based line number", () => {
    const result = auditHardcodedUi({ roots: [FIXTURE], allowlist: EMPTY, cwd: FIXTURE });
    const hit = result.hits.find((entry) => entry.text === "Plain sentence here");

    expect(hit?.file).toContain("sample.tsx");
    expect(hit?.line).toBe(5);
  });

  it("applies regex patterns to email addresses", () => {
    const result = auditHardcodedUi({
      roots: [FIXTURE],
      allowlist: { exact: [], patterns: ["^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$"], files: [] },
      cwd: FIXTURE,
    });

    expect(result.hits.some((hit) => hit.text === "partner@fund.com")).toBe(false);
  });

  it("does not see strings held in variables", () => {
    const result = auditHardcodedUi({ roots: [FIXTURE], allowlist: EMPTY, cwd: FIXTURE });
    expect(result.hits.some((hit) => hit.text === "Hidden string")).toBe(false);
  });

  it("does not throw on JSX expressions", () => {
    expect(() =>
      auditHardcodedUi({ roots: [FIXTURE], allowlist: EMPTY, cwd: FIXTURE })
    ).not.toThrow();
  });

  it("loads the repository allowlist", () => {
    const allowlist = loadAllowlist();
    expect(allowlist.exact).toContain("B2B");
    expect(allowlist.patterns.some((pattern) => pattern.includes("https"))).toBe(true);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run tests/unit/i18n/audit-i18n.test.ts`
Expected: FAIL, the module `scripts/lib/i18n-audit` cannot be resolved.

- [ ] **Step 3: Implement the audit library**

Create `scripts/lib/i18n-audit.ts` with these exact exports:

```ts
import * as fs from "fs";
import * as path from "path";
import * as ts from "typescript";

export interface HardcodedHit {
  file: string;
  line: number;
  kind: "text" | "attribute";
  attribute: string | null;
  text: string;
}

export interface I18nAllowlist {
  exact: string[];
  patterns: string[];
  files: string[];
}

export interface HardcodedAuditResult {
  hits: HardcodedHit[];
  total: number;
  byFile: Record<string, number>;
}

export function loadAllowlist(filePath?: string): I18nAllowlist;
export function auditHardcodedUi(options?: {
  roots?: string[];
  allowlist?: I18nAllowlist;
  cwd?: string;
}): HardcodedAuditResult;
```

Implementation requirements:

- Default roots are `["src/app", "src/components"]`, default cwd is `process.cwd()`, default allowlist is `loadAllowlist()`.
- Resolve every root against `cwd` before walking.
- Walk recursively, collecting `.tsx` files only.
- Parse with `ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)`.
- Visit every node with `ts.forEachChild`.
- For `ts.SyntaxKind.JsxText`, trim the text and keep it when it contains at least two consecutive letters.
- For `ts.SyntaxKind.JsxAttribute`, read the attribute name; keep only names in the copy-bearing set; accept a `StringLiteral` initializer; trim the value and keep it when it contains at least two consecutive letters.
- Ignore an initializer that starts with `http`, `/`, `#`, or `{`.
- Suppress a hit when the trimmed text is in `allowlist.exact`, matches any `allowlist.patterns` regex, or the relative file path is in `allowlist.files`.
- Compute the line with `sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1`.
- Sort hits by file, then line.
- `total` is `hits.length`; `byFile` counts hits per relative path.
- `loadAllowlist` reads `scripts/i18n-allowlist.json` by default and returns empty arrays when the file is absent.

Create `scripts/i18n-allowlist.json`:

```json
{
  "exact": [
    "XPO",
    "MICE",
    "B2B",
    "B2C",
    "EV",
    "AI",
    "CME",
    "ISO",
    "STEM",
    "QR",
    "AV",
    "OEM",
    "AGV",
    "AMR",
    "BIM",
    "SMPTE",
    "VIP",
    "SME",
    "F&B",
    "KRL",
    "MRT",
    "WIB",
    "JST",
    "UTC",
    "IDR",
    "JPY",
    "USD",
    "EUR",
    "SGD",
    "OpenRouter",
    "Stripe",
    "GitHub",
    "LinkedIn",
    "WhatsApp",
    "Google Calendar",
    "Apple",
    "Outlook",
    "Thunderbird",
    "Tokyo Big Sight, Makuhari Messe, Pacifico Yokohama",
    "JIExpo Kemayoran, ICE BSD City, JICC Senayan, NICE PIK 2, GBK Complex, JIS",
    "USD ($) / EUR (€) / SGD (S$)",
    "WIB (Asia/Jakarta, UTC+7)",
    "JST (Asia/Tokyo, UTC+9)",
    "Apple Calendar, Outlook, Thunderbird"
  ],
  "patterns": [
    "^https?://",
    "^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$",
    "^#[0-9a-fA-F]{3,8}$"
  ],
  "files": []
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run tests/unit/i18n/audit-i18n.test.ts`
Expected: PASS, nine tests.

- [ ] **Step 5: Typecheck and lint**

Run: `npx tsc --noEmit` and `npx eslint scripts/lib/i18n-audit.ts tests/unit/i18n/audit-i18n.test.ts`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add scripts/lib/i18n-audit.ts scripts/i18n-allowlist.json tests/fixtures/i18n/sample.tsx tests/unit/i18n/audit-i18n.test.ts
git commit -m "feat(i18n): add hardcoded UI audit"
```

---

### Task 2: Untranslated value audit

**Files:**
- Modify: `scripts/lib/i18n-audit.ts`
- Test: `tests/unit/i18n/audit-values.test.ts`

**Interfaces:**
- Consumes: `I18nAllowlist` and `loadAllowlist` from Task 1.
- Produces: `auditUntranslatedValues(options?: { messagesDir?: string; allowlist?: I18nAllowlist; minLength?: number }): UntranslatedHit[]` with `UntranslatedHit { locale: string; key: string; value: string }`. Task 3 consumes it.

- [ ] **Step 1: Write the failing test**

Create `tests/unit/i18n/audit-values.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { auditUntranslatedValues } from "../../../scripts/lib/i18n-audit";

describe("untranslated value audit", () => {
  it("flags English prose copied into another locale", () => {
    const hits = auditUntranslatedValues();
    expect(hits).toContainEqual(
      expect.objectContaining({ locale: "de", key: "home.organizerPill1" })
    );
  });

  it("does not flag allowlisted proper nouns", () => {
    const hits = auditUntranslatedValues();
    expect(hits.some((hit) => hit.key === "regions.jp.keyVenues")).toBe(false);
  });

  it("does not flag values at or below the minimum length", () => {
    const hits = auditUntranslatedValues({ minLength: 18 });
    expect(hits.every((hit) => hit.value.length > 18)).toBe(true);
  });

  it("does not flag values without spaces", () => {
    const hits = auditUntranslatedValues();
    expect(hits.every((hit) => hit.value.includes(" "))).toBe(true);
  });

  it("reports one hit per locale and key", () => {
    const hits = auditUntranslatedValues();
    const keys = hits.map((hit) => `${hit.locale}:${hit.key}`);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("ignores the source locale", () => {
    const hits = auditUntranslatedValues();
    expect(hits.some((hit) => hit.locale === "en")).toBe(false);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run tests/unit/i18n/audit-values.test.ts`
Expected: FAIL, `auditUntranslatedValues` is not exported.

- [ ] **Step 3: Implement the value audit**

Add to `scripts/lib/i18n-audit.ts`:

```ts
export interface UntranslatedHit {
  locale: string;
  key: string;
  value: string;
}

export function auditUntranslatedValues(options?: {
  messagesDir?: string;
  allowlist?: I18nAllowlist;
  minLength?: number;
}): UntranslatedHit[];
```

Requirements:

- Default `messagesDir` is `src/messages`, default `minLength` is 18, default allowlist is `loadAllowlist()`.
- Read every `.json` bundle in the directory. The source locale is `en`; skip it.
- Flatten nested objects to dot-separated keys.
- For each string value in a non-English locale that is identical to the English value, flag it when all hold: length greater than `minLength`, it contains a space, it is not in `allowlist.exact`, and it matches no `allowlist.patterns` regex.
- Return hits sorted by locale, then key.

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run tests/unit/i18n/audit-values.test.ts`
Expected: PASS, six tests.

- [ ] **Step 5: Commit**

```bash
git add scripts/lib/i18n-audit.ts tests/unit/i18n/audit-values.test.ts
git commit -m "feat(i18n): audit untranslated locale values"
```

---

### Task 3: CLI, baseline ratchet, and guide

**Files:**
- Create: `scripts/audit-i18n.ts`
- Create: `scripts/i18n-baseline.json` (generated)
- Test: `tests/unit/i18n/no-hardcoded-ui.test.ts`
- Modify: `package.json`
- Create: `docs/guides/localization.md`

**Interfaces:**
- Consumes: `auditHardcodedUi`, `auditUntranslatedValues`, `loadAllowlist`.
- Produces: the CLI and the baseline file. Later phases run `npm run i18n:audit:update` after lowering the counts.

- [ ] **Step 1: Write the failing ratchet test**

Create `tests/unit/i18n/no-hardcoded-ui.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import {
  auditHardcodedUi,
  auditUntranslatedValues,
} from "../../../scripts/lib/i18n-audit";
import baseline from "../../../scripts/i18n-baseline.json";

describe("localization ratchet", () => {
  it("does not add hardcoded UI strings", () => {
    const result = auditHardcodedUi();
    expect(result.total).toBeLessThanOrEqual(baseline.hardcodedUi);
  });

  it("does not add English values to non-English bundles", () => {
    expect(auditUntranslatedValues().length).toBeLessThanOrEqual(
      baseline.untranslatedValues
    );
  });

  it("keeps the baseline shape", () => {
    expect(typeof baseline.hardcodedUi).toBe("number");
    expect(typeof baseline.untranslatedValues).toBe("number");
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run tests/unit/i18n/no-hardcoded-ui.test.ts`
Expected: FAIL, `scripts/i18n-baseline.json` cannot be resolved.

- [ ] **Step 3: Implement the CLI**

Create `scripts/audit-i18n.ts`. It must:

- Run only when invoked directly; the library stays side-effect free.
- `--json` prints `{ hardcoded: auditHardcodedUi(), untranslated: auditUntranslatedValues() }`.
- `--update-baseline` writes `scripts/i18n-baseline.json` with `{ "hardcodedUi": total, "untranslatedValues": count }` and prints both numbers.
- Without flags, print a summary: total hardcoded hits, the ten files with the most hits, and the untranslated count.

- [ ] **Step 4: Generate the baseline**

Run: `npx tsx scripts/audit-i18n.ts --update-baseline`
Expected: writes `scripts/i18n-baseline.json` with the current counts. Record the two numbers in the commit message.

- [ ] **Step 5: Run the ratchet test to verify it passes**

Run: `npx vitest run tests/unit/i18n/no-hardcoded-ui.test.ts`
Expected: PASS, three tests.

- [ ] **Step 6: Add the package scripts**

Add to `package.json`:

```json
"i18n:audit": "tsx scripts/audit-i18n.ts",
"i18n:audit:update": "tsx scripts/audit-i18n.ts --update-baseline"
```

- [ ] **Step 7: Write the guide**

Create `docs/guides/localization.md` covering:

- The two audits and what each detects.
- How to read the inventory and update the baseline.
- The allowlist policy: exact matches only, no prefixes, and review at every phase.
- The known limitation: strings passed through variables or template literals escape the AST scan.
- The phase order and how a phase lowers the baseline.
- The commands: `npm run i18n:audit`, `npm run i18n:audit:update`, and the ratchet test.

- [ ] **Step 8: Run the full suite and build**

Run:

```bash
docker rm -f xpo-test-db > /dev/null 2>&1
docker run -d --name xpo-test-db -e POSTGRES_USER=xpo -e POSTGRES_PASSWORD=xpo_dev_password -e POSTGRES_DB=xpo -p 5434:5432 postgres:16-alpine
export DATABASE_URL="postgresql://xpo:xpo_dev_password@localhost:5434/xpo"
npx prisma migrate deploy
npm run db:seed
npx vitest run
npm run build
```

Expected: every test file passes and the build exits `0`.

- [ ] **Step 9: Commit**

```bash
git add scripts/audit-i18n.ts scripts/i18n-baseline.json tests/unit/i18n/no-hardcoded-ui.test.ts package.json docs/guides/localization.md
git commit -m "feat(i18n): ratchet hardcoded and untranslated strings"
```
