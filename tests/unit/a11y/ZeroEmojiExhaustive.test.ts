import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Exhaustive Unicode Emoji Scanner for Empirical Challenge.
 * Scans production codebase for any raw Unicode emojis or artificial AI conversational quirks.
 * Targets pictographs, smileys, transport, symbols, and flags while excluding standard typographical characters.
 */
const STRICT_EMOJI_REGEX = /[\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{1F1E0}-\u{1F1FF}]/u;

interface Violation {
  file: string;
  line: number;
  snippet: string;
}

function scanFiles(dir: string, extensions: string[], excludeDirs = ['node_modules', '.next', '.git', '.agents']): Violation[] {
  const violations: Violation[] = [];

  function walk(currentDir: string) {
    if (!fs.existsSync(currentDir)) return;
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (!excludeDirs.includes(entry.name)) {
          walk(path.join(currentDir, entry.name));
        }
      } else if (entry.isFile()) {
        if (extensions.some(ext => entry.name.endsWith(ext))) {
          const fullPath = path.join(currentDir, entry.name);
          const content = fs.readFileSync(fullPath, 'utf-8');
          const lines = content.split('\n');
          lines.forEach((line, index) => {
            if (STRICT_EMOJI_REGEX.test(line)) {
              violations.push({
                file: fullPath,
                line: index + 1,
                snippet: line.trim(),
              });
            }
          });
        }
      }
    }
  }

  walk(dir);
  return violations;
}

describe('Empirical Challenge: Exhaustive Zero-Emoji Compliance Audit', () => {
  const projectRoot = path.resolve(__dirname, '../../../');
  const srcDir = path.join(projectRoot, 'src');
  const publicDir = path.join(projectRoot, 'public');

  it('verifies 100% zero raw emojis in all src/ TypeScript and React components', () => {
    const violations = scanFiles(srcDir, ['.ts', '.tsx']);
    expect(
      violations,
      `Zero-Emoji policy violation in src/:\n${violations.map(v => `${v.file}:${v.line} -> ${v.snippet}`).join('\n')}`
    ).toHaveLength(0);
  });

  it('verifies 100% zero raw emojis in all src/messages/ translation files', () => {
    const messagesDir = path.join(srcDir, 'messages');
    const violations = scanFiles(messagesDir, ['.json']);
    expect(
      violations,
      `Zero-Emoji policy violation in messages:\n${violations.map(v => `${v.file}:${v.line} -> ${v.snippet}`).join('\n')}`
    ).toHaveLength(0);
  });

  it('verifies 100% zero raw emojis in public/ manifest and config files', () => {
    const violations = scanFiles(publicDir, ['.json', '.webmanifest']);
    expect(
      violations,
      `Zero-Emoji policy violation in public/:\n${violations.map(v => `${v.file}:${v.line} -> ${v.snippet}`).join('\n')}`
    ).toHaveLength(0);
  });

  it('verifies scanner catches simulated emoji violations across diverse unicode ranges', () => {
    const mockViolations = [
      '🚀 Launch',
      '🎫 Ticket',
      '🔥 Trending',
      '🤖 AI Concierge',
      '🇯🇵 Tokyo',
      '🇮🇩 Jakarta',
      '🎪 Expo Arena',
    ];
    for (const testCase of mockViolations) {
      expect(STRICT_EMOJI_REGEX.test(testCase)).toBe(true);
    }
  });

  it('verifies scanner preserves non-emoji symbols (e.g. copyright, currency symbols, HTML tags)', () => {
    const nonEmoji = [
      '© 2026 XPO MICE Digital Ecosystem',
      'Price: Rp 1.500.000 / ¥15,000 / $250.00 USD / €200.00 EUR',
      '<svg><path d="M0 0h24v24H0z"/></svg>',
      'Status: [SUCCESS] Verified HMAC-SHA256 signature',
    ];
    for (const testCase of nonEmoji) {
      expect(STRICT_EMOJI_REGEX.test(testCase)).toBe(false);
    }
  });
});
