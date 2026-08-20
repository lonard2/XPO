import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function scanDirectoryForEmojis(dir: string): string[] {
  const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
  const violations: string[] = [];

  function walk(currentDir: string) {
    if (!fs.existsSync(currentDir)) return;
    const files = fs.readdirSync(currentDir);
    for (const file of files) {
      const fullPath = path.join(currentDir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        walk(fullPath);
      } else if (file.endsWith(".tsx") || file.endsWith(".ts")) {
        const content = fs.readFileSync(fullPath, "utf-8");
        if (emojiRegex.test(content)) {
          violations.push(fullPath);
        }
      }
    }
  }

  walk(dir);
  return violations;
}

describe("Quality Gate: Zero-Emoji Compliance Audit", () => {
  it("verifies that no raw Unicode emojis exist in production UI code (src/)", () => {
    const srcDir = path.resolve(__dirname, "../../../src");
    const emojiViolations = scanDirectoryForEmojis(srcDir);
    expect(
      emojiViolations,
      `Found emojis in files: ${emojiViolations.join(", ")}. Use Lucide SVG icons instead.`
    ).toHaveLength(0);
  });
});
