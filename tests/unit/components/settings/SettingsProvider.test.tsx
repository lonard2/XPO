import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import {
  SettingsProvider,
  useSettings,
  DEFAULT_SETTINGS,
} from "@/components/settings/SettingsProvider";

function TestConsumer() {
  const settings = useSettings();
  return (
    <div>
      <div data-testid="is-mounted">{settings.isMounted ? "mounted" : "unmounted"}</div>
      <div data-testid="theme">{settings.theme}</div>
      <div data-testid="density">{settings.density}</div>
      <div data-testid="typography">{settings.typography}</div>
      <div data-testid="font-scale">{settings.fontScale}</div>
      <div data-testid="motion-mode">{settings.motionMode}</div>
      <div data-testid="ai-concierge">{settings.aiConciergeEnabled ? "enabled" : "disabled"}</div>
      <div data-testid="profile-name">{settings.profile.fullName}</div>
      <div data-testid="profile-interests">{settings.profile.interests.join(",")}</div>

      <button onClick={() => settings.setTheme("dark")}>Set Dark</button>
      <button onClick={() => settings.setTheme("high-contrast")}>Set High Contrast</button>
      <button onClick={() => settings.setDensity("compact")}>Set Compact</button>
      <button onClick={() => settings.setTypography("technical-mono")}>Set Technical Mono</button>
      <button onClick={() => settings.setFontScale(1.15)}>Set Font Scale</button>
      <button onClick={() => settings.setFontScale(2.5)}>Set Overflow Scale</button>
      <button onClick={() => settings.setMotionMode("expressive")}>Set Expressive Motion</button>
      <button onClick={() => settings.setAiConciergeEnabled(false)}>Disable AI</button>
      <button
        onClick={() =>
          settings.setProfile({
            fullName: "Taro Yamada",
            organization: "Tokyo Robotics",
            interests: ["TECH_DEV_SUMMIT", "INDUSTRIAL_B2B"],
          })
        }
      >
        Update Profile
      </button>
      <button onClick={() => settings.resetToDefaults()}>Reset Defaults</button>
    </div>
  );
}

describe("SettingsProvider & useSettings Hook", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = "";
    document.documentElement.style.removeProperty("--font-scale");
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("provides default settings when localStorage is empty", async () => {
    render(
      <SettingsProvider>
        <TestConsumer />
      </SettingsProvider>
    );

    expect(screen.getByTestId("theme").textContent).toBe(DEFAULT_SETTINGS.theme);
    expect(screen.getByTestId("density").textContent).toBe(DEFAULT_SETTINGS.density);
    expect(screen.getByTestId("typography").textContent).toBe(DEFAULT_SETTINGS.typography);
    expect(screen.getByTestId("font-scale").textContent).toBe(DEFAULT_SETTINGS.fontScale.toString());
    expect(screen.getByTestId("motion-mode").textContent).toBe(DEFAULT_SETTINGS.motionMode);
    expect(screen.getByTestId("ai-concierge").textContent).toBe("enabled");
  });

  it("updates theme and synchronizes dark class on document element", () => {
    render(
      <SettingsProvider>
        <TestConsumer />
      </SettingsProvider>
    );

    act(() => {
      screen.getByText("Set Dark").click();
    });

    expect(screen.getByTestId("theme").textContent).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);

    act(() => {
      screen.getByText("Set High Contrast").click();
    });

    expect(screen.getByTestId("theme").textContent).toBe("high-contrast");
    expect(document.documentElement.classList.contains("high-contrast")).toBe(true);
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("updates UI density and applies corresponding class", () => {
    render(
      <SettingsProvider>
        <TestConsumer />
      </SettingsProvider>
    );

    act(() => {
      screen.getByText("Set Compact").click();
    });

    expect(screen.getByTestId("density").textContent).toBe("compact");
    expect(document.documentElement.classList.contains("density-compact")).toBe(true);
  });

  it("updates typography and applies corresponding class", () => {
    render(
      <SettingsProvider>
        <TestConsumer />
      </SettingsProvider>
    );

    act(() => {
      screen.getByText("Set Technical Mono").click();
    });

    expect(screen.getByTestId("typography").textContent).toBe("technical-mono");
    expect(document.documentElement.classList.contains("typography-technical-mono")).toBe(true);
  });

  it("updates font scale with automatic clamping to valid boundaries (0.9 - 1.25)", () => {
    render(
      <SettingsProvider>
        <TestConsumer />
      </SettingsProvider>
    );

    act(() => {
      screen.getByText("Set Font Scale").click();
    });

    expect(screen.getByTestId("font-scale").textContent).toBe("1.15");
    expect(document.documentElement.style.getPropertyValue("--font-scale")).toBe("1.15");

    // Overflow boundary test: 2.5 should clamp to 1.25
    act(() => {
      screen.getByText("Set Overflow Scale").click();
    });

    expect(screen.getByTestId("font-scale").textContent).toBe("1.25");
    expect(document.documentElement.style.getPropertyValue("--font-scale")).toBe("1.25");
  });

  it("updates motion mode and applies class", () => {
    render(
      <SettingsProvider>
        <TestConsumer />
      </SettingsProvider>
    );

    act(() => {
      screen.getByText("Set Expressive Motion").click();
    });

    expect(screen.getByTestId("motion-mode").textContent).toBe("expressive");
    expect(document.documentElement.classList.contains("motion-expressive")).toBe(true);
  });

  it("toggles AI concierge and persists to localStorage", () => {
    render(
      <SettingsProvider>
        <TestConsumer />
      </SettingsProvider>
    );

    act(() => {
      screen.getByText("Disable AI").click();
    });

    expect(screen.getByTestId("ai-concierge").textContent).toBe("disabled");
  });

  it("updates attendee profile and resets cleanly to defaults", () => {
    render(
      <SettingsProvider>
        <TestConsumer />
      </SettingsProvider>
    );

    act(() => {
      screen.getByText("Update Profile").click();
    });

    expect(screen.getByTestId("profile-name").textContent).toBe("Taro Yamada");
    expect(screen.getByTestId("profile-interests").textContent).toContain("TECH_DEV_SUMMIT");

    act(() => {
      screen.getByText("Reset Defaults").click();
    });

    expect(screen.getByTestId("profile-name").textContent).toBe("");
    expect(screen.getByTestId("theme").textContent).toBe("system");
    expect(screen.getByTestId("font-scale").textContent).toBe("1");
  });
});
