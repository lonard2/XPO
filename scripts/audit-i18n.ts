import * as fs from "fs";
import * as path from "path";
import {
  auditHardcodedUi,
  auditUntranslatedValues,
} from "./lib/i18n-audit";

function main(): void {
  const args = process.argv.slice(2);
  const hardcoded = auditHardcodedUi();
  const untranslated = auditUntranslatedValues();

  if (args.includes("--json")) {
    console.log(JSON.stringify({ hardcoded, untranslated }, null, 2));
    return;
  }

  if (args.includes("--update-baseline")) {
    const baselinePath = path.join(process.cwd(), "scripts", "i18n-baseline.json");
    const baseline = {
      hardcodedUi: hardcoded.total,
      untranslatedValues: untranslated.length,
    };
    fs.writeFileSync(baselinePath, `${JSON.stringify(baseline, null, 2)}\n`);
    console.log(`hardcodedUi: ${baseline.hardcodedUi}`);
    console.log(`untranslatedValues: ${baseline.untranslatedValues}`);
    return;
  }

  console.log(`Hardcoded UI strings: ${hardcoded.total}`);
  const topFiles = Object.entries(hardcoded.byFile)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  for (const [file, count] of topFiles) {
    console.log(`  ${String(count).padStart(4)}  ${file}`);
  }
  console.log(`Untranslated values: ${untranslated.length}`);
}

main();
