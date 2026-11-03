import sharp from "sharp";
import { mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "public", "icons");
mkdirSync(outDir, { recursive: true });

function svgIcon(size, { maskable = false, label = "XPO", sub = null } = {}) {
  const pad = maskable ? size * 0.12 : 0;
  const inner = size - pad * 2;
  const radius = Math.round(size * (maskable ? 0.22 : 0.2));
  const fontSize = Math.round(inner * (sub ? 0.24 : 0.3));
  const subSize = Math.round(inner * 0.09);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${radius}" fill="#2563eb"/>
  <rect x="${pad}" y="${pad}" width="${inner}" height="${inner}" rx="${Math.round(radius * 0.8)}" fill="none" stroke="#ffffff" stroke-opacity="0.25" stroke-width="${Math.max(2, size * 0.008)}"/>
  <text x="50%" y="${sub ? "46%" : "50%"}" text-anchor="middle" dominant-baseline="central" font-family="Arial, Helvetica, sans-serif" font-weight="800" font-size="${fontSize}" fill="#ffffff" letter-spacing="1">${label}</text>
  ${sub ? `<text x="50%" y="66%" text-anchor="middle" dominant-baseline="central" font-family="Arial, Helvetica, sans-serif" font-weight="600" font-size="${subSize}" fill="#bfdbfe" letter-spacing="3">${sub}</text>` : ""}
</svg>`;
}

const jobs = [
  { file: "icon-192x192.png", size: 192, opts: { label: "XPO", sub: "MICE" } },
  { file: "icon-512x512.png", size: 512, opts: { label: "XPO", sub: "MICE" } },
  { file: "icon-maskable-192x192.png", size: 192, opts: { maskable: true, label: "XPO", sub: "MICE" } },
  { file: "icon-maskable-512x512.png", size: 512, opts: { maskable: true, label: "XPO", sub: "MICE" } },
  { file: "apple-touch-icon.png", size: 180, opts: { label: "XPO", sub: "MICE" } },
  { file: "favicon-32x32.png", size: 32, opts: { label: "X" } },
  { file: "favicon-16x16.png", size: 16, opts: { label: "X" } },
  { file: "shortcut-events.png", size: 96, opts: { label: "EV" } },
  { file: "shortcut-tickets.png", size: 96, opts: { label: "QR" } },
  { file: "shortcut-organizer.png", size: 96, opts: { label: "ORG" } },
  { file: "shortcut-venues.png", size: 96, opts: { label: "HALL" } },
];

for (const job of jobs) {
  const svg = Buffer.from(svgIcon(job.size, job.opts));
  const out = join(outDir, job.file);
  await sharp(svg).png().toFile(out);
  console.log("wrote", job.file);
}
