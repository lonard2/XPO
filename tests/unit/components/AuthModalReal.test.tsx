import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import * as React from "react";
import { AuthModal } from "@/components/auth/AuthModal";
import { AuthProvider } from "@/lib/auth/session";

function mockApi(mapping: Record<string, any>) {
  global.fetch = vi.fn().mockImplementation((url: string, init?: any) => {
    const key = Object.keys(mapping).find((k) => url.includes(k));
    if (!key) return Promise.resolve({ ok: false, status: 404, json: () => Promise.resolve({}) });
    const entry = mapping[key];
    const body = typeof entry.body === "function" ? entry.body(url, init) : entry.body;
    return Promise.resolve({
      ok: entry.ok,
      status: entry.status,
      json: () => Promise.resolve(body),
      headers: new Headers(entry.headers || {}),
    });
  }) as any;
}

describe("AuthModal real authentication", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("submits credentials to the login API instead of demo matching", async () => {
    const seen: string[] = [];
    mockApi({
      "/api/auth/login": {
        ok: true,
        status: 200,
        body: { user: { id: "u1", email: "real@xpo.com", name: "Real User", role: "ORGANIZER" } },
      },
      "/api/auth/me": {
        ok: true,
        status: 200,
        body: { user: { id: "u1", email: "real@xpo.com", name: "Real User", role: "ORGANIZER" } },
      },
      "/api/auth/demo-status": { ok: true, status: 200, body: { allowed: true } },
    });
    const spy = global.fetch as any;
    render(
      <AuthProvider>
        <AuthModal isOpen={true} onClose={vi.fn()} defaultTab="login" />
      </AuthProvider>
    );
    fireEvent.change(screen.getByPlaceholderText("name@organization.com"), {
      target: { value: "real@xpo.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("••••••••••••"), {
      target: { value: "Str0ng Pass 1!" },
    });
    fireEvent.click(screen.getByText("Sign In to XPO"));
    await waitFor(() => {
      expect(
        spy.mock.calls.some(
          ([url, init]: any[]) =>
            url.includes("/api/auth/login") &&
            JSON.parse(init.body).email === "real@xpo.com" &&
            JSON.parse(init.body).password === "Str0ng Pass 1!"
        )
      ).toBe(true);
    });
    await waitFor(() => {
      expect(screen.getByText(/signed in successfully/i)).toBeInTheDocument();
    });
    expect(seen.length).toBeGreaterThanOrEqual(0);
  });

  it("shows server login errors instead of succeeding", async () => {
    mockApi({
      "/api/auth/login": { ok: false, status: 401, body: { error: "Invalid email or password." } },
      "/api/auth/demo-status": { ok: true, status: 200, body: { allowed: true } },
    });
    render(
      <AuthProvider>
        <AuthModal isOpen={true} onClose={vi.fn()} defaultTab="login" />
      </AuthProvider>
    );
    fireEvent.change(screen.getByPlaceholderText("name@organization.com"), {
      target: { value: "real@xpo.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("••••••••••••"), {
      target: { value: "Wr0ng Pass 1!" },
    });
    fireEvent.click(screen.getByText("Sign In to XPO"));
    await waitFor(() => {
      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
    });
  });

  it("offers an email-code tab that verifies into a session", async () => {
    mockApi({
      "/api/auth/otp/request": { ok: true, status: 200, body: { success: true } },
      "/api/auth/otp/verify": {
        ok: true,
        status: 200,
        body: { user: { id: "u2", email: "otp@xpo.com", name: "Otp User", role: "ATTENDEE" } },
      },
      "/api/auth/me": {
        ok: true,
        status: 200,
        body: { user: { id: "u2", email: "otp@xpo.com", name: "Otp User", role: "ATTENDEE" } },
      },
      "/api/auth/demo-status": { ok: true, status: 200, body: { allowed: true } },
    });
    render(
      <AuthProvider>
        <AuthModal isOpen={true} onClose={vi.fn()} defaultTab="otp" />
      </AuthProvider>
    );
    fireEvent.change(screen.getByPlaceholderText("name@organization.com"), {
      target: { value: "otp@xpo.com" },
    });
    fireEvent.click(screen.getByText(/send code/i));
    await waitFor(() => {
      expect(screen.getByPlaceholderText("123456")).toBeInTheDocument();
    });
    fireEvent.change(screen.getByPlaceholderText("123456"), { target: { value: "654321" } });
    fireEvent.click(screen.getByText(/verify & sign in/i));
    await waitFor(() => {
      expect(screen.getByText(/signed in successfully/i)).toBeInTheDocument();
    });
  });

  it("hides the role switcher when demo auth is disallowed", async () => {
    mockApi({
      "/api/auth/demo-status": { ok: true, status: 200, body: { allowed: false } },
    });
    render(
      <AuthProvider>
        <AuthModal isOpen={true} onClose={vi.fn()} defaultTab="switcher" />
      </AuthProvider>
    );
    await waitFor(() => {
      expect(screen.queryByText("Role Switcher")).toBeNull();
    });
    expect(screen.getByText("Credentials Sign-In")).toBeInTheDocument();
  });
});
