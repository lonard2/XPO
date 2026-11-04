import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import {
  idOrSlugWhere,
  deleteIdentifiers,
  readDeleteParams,
} from "@/lib/api/request";

describe("request helpers", () => {
  it("matches a row by id or slug", () => {
    expect(idOrSlugWhere("abc")).toEqual({ OR: [{ id: "abc" }, { slug: "abc" }] });
  });

  it("reads DELETE identifiers from the query when the body is empty", async () => {
    const { id, ids } = await deleteIdentifiers(
      new Request("http://localhost/x?id=a&ids=b, c", { method: "DELETE" })
    );
    expect(id).toBe("a");
    expect(ids).toEqual(["b", "c"]);
  });

  it("lets the JSON body win over the query", async () => {
    const { id, ids } = await deleteIdentifiers(
      new Request("http://localhost/x?id=query", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: "body", ids: ["x"] }),
      })
    );
    expect(id).toBe("body");
    expect(ids).toEqual(["x"]);
  });

  it("fills named params from the query and lets the body win", async () => {
    const queryOnly = await readDeleteParams(
      new Request("http://localhost/x?bookingId=b&perkId=p", { method: "DELETE" }),
      ["bookingId", "perkId"]
    );
    expect(queryOnly).toEqual({ bookingId: "b", perkId: "p" });

    const overridden = await readDeleteParams(
      new Request("http://localhost/x?bookingId=b&perkId=p", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ perkId: "q" }),
      }),
      ["bookingId", "perkId"]
    );
    expect(overridden).toEqual({ bookingId: "b", perkId: "q" });
  });
});

describe("pagination convention", () => {
  function routeFiles(dir: string): string[] {
    const out: string[] = [];
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) out.push(...routeFiles(full));
      else if (entry === "route.ts") out.push(full);
    }
    return out;
  }

  it("reads user-controlled paging only through parsePagination", () => {
    const offenders: string[] = [];
    for (const file of routeFiles("src/app/api")) {
      const src = readFileSync(file, "utf8");
      if (/searchParams\.get\("take"\)|searchParams\.get\("skip"\)/.test(src)) {
        offenders.push(file);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("resolves events and venues by id or slug through one helper", () => {
    const raw: string[] = [];
    for (const file of routeFiles("src/app/api")) {
      const src = readFileSync(file, "utf8");
      if (/OR:\s*\[\{\s*id\s*\},\s*\{\s*slug:\s*id\s*\}\]/.test(src)) {
        raw.push(file);
      }
    }
    expect(raw).toEqual([]);
  });
});
