/**
 * Pointer-tracked 3D tilt math for Expressive motion mode.
 * Pure functions (no DOM) so the curve is unit-testable; the DOM listener
 * lives in `MotionTilt`. Transform-only output keeps motion on the compositor.
 */

export interface TiltAngles {
  rotateX: number;
  rotateY: number;
}

export interface TiltRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

/**
 * Map a pointer position to card rotation in degrees. Centered pointer is
 * flat; edges tilt up to `maxDeg`. Guards zero-size rects.
 */
export function calcTilt(
  rect: TiltRect,
  clientX: number,
  clientY: number,
  maxDeg = 6
): TiltAngles {
  if (!rect.width || !rect.height) return { rotateX: 0, rotateY: 0 };
  const px = (clientX - rect.left) / rect.width - 0.5;
  const py = (clientY - rect.top) / rect.height - 0.5;
  const clamp = (v: number) => Math.max(-0.5, Math.min(0.5, v));
  return {
    rotateX: -(clamp(py) * 2 * maxDeg),
    rotateY: clamp(px) * 2 * maxDeg,
  };
}

/** Compose the hover transform applied to `[data-tilt]` elements. */
export function tiltTransform(angles: TiltAngles): string {
  const rx = Math.round(angles.rotateX * 100) / 100;
  const ry = Math.round(angles.rotateY * 100) / 100;
  return `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px) scale(1.01)`;
}
