import React from "react";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { SettingsProvider } from "@/components/settings/SettingsProvider";
import { ThemeModeSelector } from "@/components/settings/ThemeModeSelector";
import { UIDensitySelector } from "@/components/settings/UIDensitySelector";
import { TypographySelector } from "@/components/settings/TypographySelector";
import { FontScaleSlider } from "@/components/settings/FontScaleSlider";
import { MotionController } from "@/components/settings/MotionController";
import { AIConciergeToggle } from "@/components/settings/AIConciergeToggle";
import { ProfileSettingsForm } from "@/components/settings/ProfileSettingsForm";

describe("UI/UX Settings Suite Component Selectors", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("ThemeModeSelector renders all 4 theme options and toggles active theme", async () => {
    render(
      <SettingsProvider>
        <ThemeModeSelector />
      </SettingsProvider>
    );

    expect(screen.getAllByText(/Light/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Dark/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/System/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/High Contrast/i)[0]).toBeInTheDocument();

    const darkBtn = screen.getByRole("radio", { name: /Dark/i });
    act(() => {
      fireEvent.click(darkBtn);
    });
    expect(darkBtn).toHaveAttribute("aria-checked", "true");
  });

  it("UIDensitySelector toggles between Comfortable and Compact density", () => {
    render(
      <SettingsProvider>
        <UIDensitySelector />
      </SettingsProvider>
    );

    expect(screen.getAllByText(/Comfortable/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Compact/i)[0]).toBeInTheDocument();

    const compactBtn = screen.getByRole("radio", { name: /Compact/i });
    act(() => {
      fireEvent.click(compactBtn);
    });
    expect(compactBtn).toHaveAttribute("aria-checked", "true");
  });

  it("TypographySelector renders font engine options and allows typeface selection", () => {
    render(
      <SettingsProvider>
        <TypographySelector />
      </SettingsProvider>
    );

    expect(screen.getAllByText(/Modern Sans/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Editorial Serif/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Technical Mono/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Atkinson Hyperlegible/i)[0]).toBeInTheDocument();

    const serifBtn = screen.getByRole("radio", { name: /Editorial Serif/i });
    act(() => {
      fireEvent.click(serifBtn);
    });
    expect(serifBtn).toHaveAttribute("aria-checked", "true");
  });

  it("FontScaleSlider adjusts font scale via slider and presets", () => {
    render(
      <SettingsProvider>
        <FontScaleSlider />
      </SettingsProvider>
    );

    expect(screen.getByText(/Font Scale/i)).toBeInTheDocument();
    const preset125 = screen.getByRole("button", { name: /125%/i });

    act(() => {
      fireEvent.click(preset125);
    });

    expect(screen.getAllByText("125%")[0]).toBeInTheDocument();
  });

  it("MotionController renders Off, Subtle, and Expressive animation options", () => {
    render(
      <SettingsProvider>
        <MotionController />
      </SettingsProvider>
    );

    expect(screen.getAllByText(/Minimal|Reduced/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Subtle/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Expressive/i)[0]).toBeInTheDocument();

    const expressiveBtn = screen.getByRole("radio", { name: /Expressive/i });
    act(() => {
      fireEvent.click(expressiveBtn);
    });
    expect(expressiveBtn).toHaveAttribute("aria-checked", "true");
  });

  it("AIConciergeToggle toggles floating concierge switch", () => {
    render(
      <SettingsProvider>
        <AIConciergeToggle />
      </SettingsProvider>
    );

    const toggleSwitch = screen.getByRole("switch");
    expect(toggleSwitch).toHaveAttribute("aria-checked", "true");

    act(() => {
      fireEvent.click(toggleSwitch);
    });
    expect(toggleSwitch).toHaveAttribute("aria-checked", "false");
  });

  it("ProfileSettingsForm captures attendee details and MICE interest matrix", () => {
    render(
      <SettingsProvider>
        <ProfileSettingsForm />
      </SettingsProvider>
    );

    const nameInput = screen.getByPlaceholderText(/Budi Santoso/i);
    const orgInput = screen.getByPlaceholderText(/Global Robotics/i);

    act(() => {
      fireEvent.change(nameInput, { target: { value: "Airi Suzuki" } });
      fireEvent.change(orgInput, { target: { value: "Yokohama Exhibition Group" } });
    });

    // Select interest chip
    const techChip = screen.getByRole("button", { name: /Tech.*Developer/i });
    act(() => {
      fireEvent.click(techChip);
    });

    const submitBtn = screen.getByRole("button", { name: /Save/i });
    act(() => {
      fireEvent.click(submitBtn);
    });

    expect(screen.getByText(/successfully saved|saved successfully/i)).toBeInTheDocument();
  });
});
