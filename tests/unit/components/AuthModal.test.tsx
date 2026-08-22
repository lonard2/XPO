import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import * as React from "react";
import { AuthModal } from "@/components/auth/AuthModal";
import { AuthProvider, DEMO_ACCOUNTS } from "@/lib/auth/session";

describe("Phase 8 Component: AuthModal Dialog & Role Switcher", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders modal with Role Switcher, Credentials Sign-In, and Permissions Matrix tabs", () => {
    render(
      <AuthProvider>
        <AuthModal isOpen={true} onClose={vi.fn()} defaultTab="switcher" />
      </AuthProvider>
    );

    expect(screen.getByText("Authentication & Role Governance")).toBeDefined();
    expect(screen.getByText("Role Switcher")).toBeDefined();
    expect(screen.getByText("Credentials Sign-In")).toBeDefined();
    expect(screen.getByText("Permissions Matrix")).toBeDefined();
  });

  it("displays persona cards for Attendee, Organizer, and Admin personas", () => {
    render(
      <AuthProvider>
        <AuthModal isOpen={true} onClose={vi.fn()} defaultTab="switcher" />
      </AuthProvider>
    );

    expect(screen.getAllByText(DEMO_ACCOUNTS.ATTENDEE.name).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(DEMO_ACCOUNTS.ORGANIZER.name).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(DEMO_ACCOUNTS.ADMIN.name).length).toBeGreaterThanOrEqual(1);
  });

  it("switches to Credentials Sign-In tab and displays email & password inputs", () => {
    render(
      <AuthProvider>
        <AuthModal isOpen={true} onClose={vi.fn()} defaultTab="login" />
      </AuthProvider>
    );

    expect(screen.getByPlaceholderText("name@organization.com")).toBeDefined();
    expect(screen.getByPlaceholderText("••••••••••••")).toBeDefined();
    expect(screen.getByText("Sign In to XPO")).toBeDefined();
  });

  it("switches to Permissions Matrix tab and renders capability table", () => {
    render(
      <AuthProvider>
        <AuthModal isOpen={true} onClose={vi.fn()} defaultTab="matrix" />
      </AuthProvider>
    );

    expect(screen.getByText("View & Explore Events")).toBeDefined();
    expect(screen.getByText("Door Staff QR Validation")).toBeDefined();
    expect(screen.getByText("Multi-Model AI Intelligence")).toBeDefined();
    expect(screen.getByText("Automated Venue Scraper Pipeline")).toBeDefined();
  });
});
