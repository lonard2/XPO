import * as React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Footer } from "@/components/layout/Footer";
import { RegionSwitcher } from "@/components/layout/RegionSwitcher";
import { handleListboxKeyDown } from "@/lib/a11y/listboxKeyboard";

describe("outer chrome audit fixes", () => {
  beforeEach(() => {
    localStorage.clear();
    window.history.replaceState({}, "", "/en");
    document.cookie = "xpo_region=; path=/; max-age=0";
  });

  it("links footer categories to filtered discovery", () => {
    const { container } = render(<Footer locale="en" />);
    const links = Array.from(container.querySelectorAll('a[href*="archetype="]'));
    expect(links.length).toBe(5);
    expect(links[0].getAttribute("href")).toBe("/en/events?archetype=INDUSTRIAL_B2B");
  });

  it("moves focus with arrow keys inside listboxes", () => {
    render(
      <div role="listbox" aria-label="test" onKeyDown={handleListboxKeyDown}>
        <button type="button" role="option" aria-selected="false">Alpha</button>
        <button type="button" role="option" aria-selected="false">Beta</button>
        <button type="button" role="option" aria-selected="false">Gamma</button>
      </div>
    );
    const listbox = screen.getByRole("listbox");
    const beta = screen.getByRole("option", { name: "Beta" });
    (beta as HTMLElement).focus();
    fireEvent.keyDown(listbox, { key: "ArrowDown" });
    expect(document.activeElement?.textContent).toBe("Gamma");
    fireEvent.keyDown(listbox, { key: "ArrowUp" });
    expect(document.activeElement?.textContent).toBe("Beta");
    fireEvent.keyDown(listbox, { key: "Home" });
    expect(document.activeElement?.textContent).toBe("Alpha");
  });

  it("activates region cards with Enter", () => {
    const onChange = vi.fn();
    render(<RegionSwitcher currentLocale="en" variant="cards" onActiveRegionChange={onChange} />);
    const cards = screen.getAllByRole("button", { name: /indonesia|japan|global hubs/i });
    expect(cards.length).toBe(3);
    fireEvent.keyDown(cards[1], { key: "Enter" });
    expect(onChange).toHaveBeenCalledWith("jp");
  });
});
