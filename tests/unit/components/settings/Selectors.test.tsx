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

    expect(screen.getByText("Light Mode")).toBeInTheDocument();
    expect(screen.getByText("Dark Mode")).toBeInTheDocument();
    expect(screen.getByText("System Default")).toBeInTheDocument();
    expect(screen.getByText("High Contrast")).toBeInTheDocument();

    const darkBtn = screen.getByRole("radio", { name: /Dark Mode/i });
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

    expect(screen.getByText("Comfortable")).toBeInTheDocument();
    expect(screen.getByText("Compact")).toBeInTheDocument();

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

    expect(screen.getByText("Modern Sans")).toBeInTheDocument();
    expect(screen.getByText("Editorial Serif")).toBeInTheDocument();
    expect(screen.getByText("Technical Mono")).toBeInTheDocument();
    expect(screen.getByText("Atkinson Hyperlegible")).toBeInTheDocument();

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

    expect(screen.getByText("Font Scaling")).toBeInTheDocument();
    const preset125 = screen.getByRole("button", { name: /Accessible \(125%\)/i });

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

    expect(screen.getByText("Reduced Motion")).toBeInTheDocument();
    expect(screen.getByText("Subtle Dynamics")).toBeInTheDocument();
    expect(screen.getByText("Expressive / Cinematic")).toBeInTheDocument();

    const expressiveBtn = screen.getByRole("radio", { name: /Expressive \/ Cinematic/i });
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
    const techChip = screen.getByRole("button", { name: /Tech & Developer Summit/i });
    act(() => {
      fireEvent.click(techChip);
    });

    const submitBtn = screen.getByRole("button", { name: /Save Profile Changes/i });
    act(() => {
      fireEvent.click(submitBtn);
    });

    expect(screen.getByText(/Profile preferences successfully saved!/i)).toBeInTheDocument();
  });
});
