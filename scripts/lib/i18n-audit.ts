import * as fs from "fs";
import * as path from "path";
import { parse } from "@babel/parser";

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

const COPY_ATTRIBUTES = new Set([
  "aria-label",
  "placeholder",
  "title",
  "alt",
  "label",
  "helperText",
  "description",
  "emptyMessage",
  "ctaLabel",
  "confirmLabel",
]);

const LETTERS = /[A-Za-z]{2}/;

export function loadAllowlist(
  filePath: string = path.join(process.cwd(), "scripts", "i18n-allowlist.json")
): I18nAllowlist {
  try {
    const parsed = JSON.parse(fs.readFileSync(filePath, "utf8")) as Partial<I18nAllowlist>;
    return {
      exact: Array.isArray(parsed.exact) ? parsed.exact : [],
      patterns: Array.isArray(parsed.patterns) ? parsed.patterns : [],
      files: Array.isArray(parsed.files) ? parsed.files : [],
    };
  } catch {
    return { exact: [], patterns: [], files: [] };
  }
}

function collectTsxFiles(dir: string, out: string[]): void {
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectTsxFiles(full, out);
    } else if (entry.isFile() && entry.name.endsWith(".tsx")) {
      out.push(full);
    }
  }
}

function isSuppressed(text: string, relFile: string, allowlist: I18nAllowlist): boolean {
  if (allowlist.exact.includes(text)) return true;
  if (allowlist.files.includes(relFile)) return true;
  return allowlist.patterns.some((pattern) => {
    try {
      return new RegExp(pattern).test(text);
    } catch {
      return false;
    }
  });
}

interface BabelNode {
  type?: string;
  value?: unknown;
  name?: { name?: string } | string;
  loc?: { start?: { line?: number } };
  [key: string]: unknown;
}

function walk(node: unknown, visit: (node: BabelNode) => void): void {
  if (!node || typeof node !== "object") return;
  const candidate = node as BabelNode;

  if (typeof candidate.type === "string") visit(candidate);

  for (const key of Object.keys(candidate)) {
    if (key === "loc" || key === "start" || key === "end" || key === "extra") continue;
    const child = candidate[key];
    if (Array.isArray(child)) {
      for (const entry of child) walk(entry, visit);
    } else if (child && typeof child === "object") {
      walk(child, visit);
    }
  }
}

function attributeName(node: BabelNode): string | null {
  if (typeof node.name === "string") return node.name;
  if (node.name && typeof node.name === "object" && typeof node.name.name === "string") {
    return node.name.name;
  }
  return null;
}

export function auditHardcodedUi(options: {
  roots?: string[];
  allowlist?: I18nAllowlist;
  cwd?: string;
} = {}): HardcodedAuditResult {
  const cwd = options.cwd ?? process.cwd();
  const roots = (options.roots ?? ["src/app", "src/components"]).map((root) =>
    path.resolve(cwd, root)
  );
  const allowlist = options.allowlist ?? loadAllowlist();

  const files: string[] = [];
  for (const root of roots) collectTsxFiles(root, files);

  const hits: HardcodedHit[] = [];

  for (const file of files) {
    const relFile = path.relative(cwd, file).split(path.sep).join("/");
    if (allowlist.files.includes(relFile)) continue;

    const source = fs.readFileSync(file, "utf8");
    const ast = parse(source, {
      sourceType: "module",
      plugins: ["jsx", "typescript"],
      errorRecovery: true,
    });

    walk(ast.program, (node) => {
      if (node.type === "JSXText") {
        const value = String(node.value ?? "").trim();
        if (LETTERS.test(value) && !isSuppressed(value, relFile, allowlist)) {
          hits.push({
            file: relFile,
            line: node.loc?.start?.line ?? 0,
            kind: "text",
            attribute: null,
            text: value,
          });
        }
        return;
      }

      if (node.type !== "JSXAttribute") return;
      const name = attributeName(node);
      if (!name || !COPY_ATTRIBUTES.has(name)) return;

      const valueNode = node.value as BabelNode | undefined;
      if (!valueNode || valueNode.type !== "StringLiteral") return;

      const value = String(valueNode.value ?? "").trim();
      const skipped =
        value.startsWith("http") ||
        value.startsWith("/") ||
        value.startsWith("#") ||
        value.startsWith("{");
      if (!LETTERS.test(value) || skipped) return;
      if (isSuppressed(value, relFile, allowlist)) return;

      hits.push({
        file: relFile,
        line: node.loc?.start?.line ?? 0,
        kind: "attribute",
        attribute: name,
        text: value,
      });
    });
  }

  hits.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);

  const byFile: Record<string, number> = {};
  for (const hit of hits) {
    byFile[hit.file] = (byFile[hit.file] ?? 0) + 1;
  }

  return { hits, total: hits.length, byFile };
}
