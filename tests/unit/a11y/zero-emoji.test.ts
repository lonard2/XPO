import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

/**
 * Programmatic scan to enforce strict zero-emoji policy across all production source files.
 * Replaces all conversational AI quirks and emojis with lucide-react vector SVG icons.
 */
function scanDirectoryForEmojis(dir: string, extensions = [".ts", ".tsx", ".json"]): string[] {
  const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}]/u;
  const violations: string[] = [];

  function walk(currentDir: string) {
    if (!fs.existsSync(currentDir)) return;
    const files = fs.readdirSync(currentDir);
    for (const file of files) {
      const fullPath = path.join(currentDir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        walk(fullPath);
      } else if (extensions.some((ext) => file.endsWith(ext))) {
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

describe("Quality Gate: Zero-Emoji Compliance & Vector SVG Audit", () => {
  const srcDir = path.resolve(__dirname, "../../../src");

  it("T1.1: verifies zero raw Unicode emojis exist in production UI code (src/)", () => {
    const violations = scanDirectoryForEmojis(srcDir, [".tsx", ".ts"]);
    expect(
      violations,
      `Found emojis in files: ${violations.join(", ")}. Use Lucide SVG icons instead.`
    ).toHaveLength(0);
  });

  it("T1.2: verifies component layer exclusively imports vector icons from lucide-react", () => {
    const componentsDir = path.resolve(srcDir, "components");
    if (fs.existsSync(componentsDir)) {
      const files = fs.readdirSync(componentsDir, { recursive: true }) as string[];
      for (const file of files) {
        if (typeof file === "string" && (file.endsWith(".tsx") || file.endsWith(".ts"))) {
          const filePath = path.join(componentsDir, file);
          if (fs.statSync(filePath).isFile()) {
            const content = fs.readFileSync(filePath, "utf-8");
            // If the component uses iconography, it should import from lucide-react
            if (content.includes("icon") || content.includes("Icon")) {
              const hasLucideImport = content.includes("lucide-react") || content.includes("LucideIcon") || !content.includes("<svg");
              expect(hasLucideImport).toBe(true);
            }
          }
        }
      }
    }
  });

  it("T1.3: verifies translation dictionary files (src/messages/) contain zero raw emojis", () => {
    const messagesDir = path.resolve(srcDir, "messages");
    if (fs.existsSync(messagesDir)) {
      const violations = scanDirectoryForEmojis(messagesDir, [".json"]);
      expect(violations).toHaveLength(0);
    }
  });

  it("T2.1 (Boundary): verifies scanner accurately catches artificial emojis in simulated test strings", () => {
    const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}]/u;
    const testCasesWithEmojis = [
      "Welcome to XPO 🚀",
      "VIP Pass 🎫 available now",
      "Indonesia Hub 🇮🇩",
      "Japan Hub 🇯🇵",
      "Check-in verified ✅",
      "Warning ⚠️: Capacity limited",
    ];

    for (const testCase of testCasesWithEmojis) {
      expect(emojiRegex.test(testCase)).toBe(true);
    }
  });

  it("T2.2 (Boundary): verifies scanner passes clean technical SVG strings without false positives", () => {
    const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}]/u;
    const cleanTechnicalStrings = [
      "<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24'><path d='M12 2v20'/></svg>",
      "Badge variant: archetype, status: confirmed",
      "JIExpo Kemayoran - Hall A1, A2, A3, Nusantara Hall 2",
      "Asia/Jakarta (UTC+07:00), Asia/Tokyo (UTC+09:00)",
      "Price: Rp 1.500.000, ¥15,000, $250.00 USD",
      "HMAC-SHA256 signature verified with constant-time equality check",
    ];

    for (const clean of cleanTechnicalStrings) {
      expect(emojiRegex.test(clean)).toBe(false);
    }
  });
});
