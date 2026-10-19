import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import {
  GET as listClaims,
  POST as claimVoucher,
  DELETE as releaseVoucher,
  buildVoucherCode,
} from "@/app/api/perks/claim/route";

describe("voucher claim endpoint", () => {
  it("builds deterministic, collision-free codes", () => {
    const a = buildVoucherCode("HASH-A", "perk-1");
    expect(a).toBe(buildVoucherCode("HASH-A", "perk-1"));
    expect(a).not.toBe(buildVoucherCode("HASH-A", "perk-2"));
    expect(a).not.toBe(buildVoucherCode("HASH-B", "perk-1"));
    expect(a).toMatch(/^XPO-[0-9A-F]{4}-[0-9A-F]{4}$/);
  });

  it("claims idempotently, enforces tiers, lists, and releases", async () => {
    const booking = await db.booking.findFirst({
      include: { ticketTier: true, event: { include: { perks: true } } },
    });
    expect(booking).toBeDefined();
    const perk = booking!.event.perks[0];
    expect(perk).toBeDefined();

    const post = (body: unknown) =>
      new NextRequest("http://localhost:3000/api/perks/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

    // Missing fields rejected.
    expect((await claimVoucher(post({}))).status).toBe(400);

    // Claim works and is idempotent (same code twice).
    const first = await claimVoucher(post({ bookingId: booking!.id, perkId: perk!.id }));
    expect(first.status).toBe(201);
    const firstJson = await first.json();
    const second = await claimVoucher(post({ bookingId: booking!.id, perkId: perk!.id }));
    const secondJson = await second.json();
    expect(secondJson.claim.code).toBe(firstJson.claim.code);

    // Listed from the server record.
    const listed = await listClaims(
      new NextRequest(`http://localhost:3000/api/perks/claim?bookingId=${booking!.id}`)
    );
    const listedJson = await listed.json();
    expect(listedJson.claims.length).toBeGreaterThanOrEqual(1);

    // Release removes the record.
    const delReq = new NextRequest("http://localhost:3000/api/perks/claim", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId: booking!.id, perkId: perk!.id }),
    });
    expect((await releaseVoucher(delReq)).status).toBe(200);
    const relisted = await listClaims(
      new NextRequest(`http://localhost:3000/api/perks/claim?bookingId=${booking!.id}`)
    );
    expect((await relisted.json()).claims.some((c: any) => c.perkId === perk!.id)).toBe(false);
  });
});
