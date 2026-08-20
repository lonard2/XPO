import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";

// Mock next/navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  usePathname: () => "/en/events",
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe("Component: LanguageSwitcher", () => {
  it("renders the current language code and triggers dropdown opening", () => {
    render(<LanguageSwitcher currentLocale="en" />);

    const button = screen.getByRole("button", { name: /Select language/i });
    expect(button).toBeDefined();
    expect(screen.getByText(/en/i)).toBeDefined();

    // Click to open dropdown
    fireEvent.click(button);

    // Verify language options are listed
    expect(screen.getByText("日本語")).toBeDefined();
    expect(screen.getByText("简体中文")).toBeDefined();
    expect(screen.getByText("Bahasa Indonesia")).toBeDefined();
    expect(screen.getByText("Deutsch")).toBeDefined();
    expect(screen.getByText("Español")).toBeDefined();
  });

  it("navigates to target locale route when a language option is clicked", () => {
    render(<LanguageSwitcher currentLocale="en" />);

    const button = screen.getByRole("button", { name: /Select language/i });
    fireEvent.click(button);

    const jaOption = screen.getByText("日本語");
    fireEvent.click(jaOption);

    expect(mockPush).toHaveBeenCalledWith("/ja/events");
  });

  it("renders pills variant properly with accessible radiogroup", () => {
    render(<LanguageSwitcher currentLocale="en" variant="pills" />);

    const radiogroup = screen.getByRole("radiogroup", { name: /Language selection/i });
    expect(radiogroup).toBeDefined();

    const options = screen.getAllByRole("radio");
    expect(options.length).toBe(6);
  });
});
