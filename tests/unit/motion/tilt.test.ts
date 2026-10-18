import { describe, it, expect } from "vitest";
import { calcTilt, tiltTransform } from "@/lib/motion/tilt";

const RECT = { left: 100, top: 100, width: 200, height: 100 };

describe("expressive tilt math", () => {
  it("is flat at the card center", () => {
    expect(calcTilt(RECT, 200, 150)).toEqual({ rotateX: -0, rotateY: 0 });
  });

  it("tilts toward pointer edges within the cap", () => {
    const right = calcTilt(RECT, 300, 150);
    expect(right.rotateY).toBe(6);
    expect(right.rotateX).toBe(-0);
    const top = calcTilt(RECT, 200, 100);
    expect(top.rotateX).toBe(6);
    const corner = calcTilt(RECT, 0, 0);
    expect(Math.abs(corner.rotateX)).toBeLessThanOrEqual(6);
    expect(Math.abs(corner.rotateY)).toBeLessThanOrEqual(6);
  });

  it("guards zero-size rects", () => {
    expect(calcTilt({ left: 0, top: 0, width: 0, height: 0 }, 5, 5)).toEqual({
      rotateX: 0,
      rotateY: 0,
    });
  });

  it("composes a perspective hover transform", () => {
    expect(tiltTransform({ rotateX: 3, rotateY: -2 })).toBe(
      "perspective(900px) rotateX(3deg) rotateY(-2deg) translateY(-4px) scale(1.01)"
    );
  });
});
