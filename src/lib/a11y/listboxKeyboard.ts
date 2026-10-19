import * as React from "react";

/**
 * Roving focus for listbox dropdowns: Arrow keys move between
 * `[role="option"]` buttons, Home/End jump. Attach to the listbox
 * container's onKeyDown. Native button activation covers Enter/Space.
 */
export function handleListboxKeyDown(e: React.KeyboardEvent<HTMLElement>): void {
  const options = Array.from(
    e.currentTarget.querySelectorAll<HTMLElement>('[role="option"]')
  );
  if (options.length === 0) return;
  const active = document.activeElement as HTMLElement | null;
  let idx = active ? options.indexOf(active) : -1;
  switch (e.key) {
    case "ArrowDown":
    case "ArrowRight":
      idx = (idx + 1) % options.length;
      break;
    case "ArrowUp":
    case "ArrowLeft":
      idx = (idx - 1 + options.length) % options.length;
      break;
    case "Home":
      idx = 0;
      break;
    case "End":
      idx = options.length - 1;
      break;
    default:
      return;
  }
  e.preventDefault();
  options[idx].focus();
}
