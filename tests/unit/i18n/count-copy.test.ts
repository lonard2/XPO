import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const MESSAGES = path.join(process.cwd(), "src", "messages");
const LOCALES = ["en", "id", "ja", "zh-CN", "de", "es"];

describe("Count copy", () => {
  it("provides a singular message for every count that can be one", () => {
    for (const locale of LOCALES) {
      const bundle = JSON.parse(
        fs.readFileSync(path.join(MESSAGES, `${locale}.json`), "utf8")
      );

      expect({
        locale,
        missing: !bundle.discovery?.selectedCountOne,
      }).toEqual({ locale, missing: false });
      expect({
        locale,
        missing: !bundle.tickets?.onlyRemainingOne,
      }).toEqual({ locale, missing: false });
    }
  });
});
