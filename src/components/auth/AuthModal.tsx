"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import {
  ShieldCheck,
  UserCheck,
  Briefcase,
  LogIn,
  LogOut,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { useAuth, DEMO_ACCOUNTS, AuthUser } from "@/lib/auth/session";
import {
  UserRole,
  getRoleLabel,
  getRoleBadgeVariant,
  getRolePermissionsMatrix,
} from "@/lib/auth/rbac";
import { cn } from "@/lib/utils";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "switcher" | "login" | "matrix";
}

export function AuthModal({ isOpen, onClose, defaultTab = "switcher" }: AuthModalProps) {
  const { user, role, switchRole, login, logout, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = React.useState<"switcher" | "login" | "matrix">(defaultTab);

  let tAuth: any = (k: string) => k;
  let tCom: any = (k: string) => k;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    tAuth = useTranslations("auth");
    // eslint-disable-next-line react-hooks/rules-of-hooks
    tCom = useTranslations("common");
  } catch {
    // Fallback in case rendered outside provider
  }

  // Login form state
  const [loginEmail, setLoginEmail] = React.useState("");
  const [loginPassword, setLoginPassword] = React.useState("");
  const [loginError, setLoginError] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [loginSuccessMessage, setLoginSuccessMessage] = React.useState("");

  const permissionsMatrix = React.useMemo(() => getRolePermissionsMatrix(), []);

  const handleQuickSwitch = (targetRole: UserRole) => {
    switchRole(targetRole);
    setLoginSuccessMessage(`Switched active persona to ${getRoleLabel(targetRole)}.`);
    setTimeout(() => {
      setLoginSuccessMessage("");
    }, 3000);
  };

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginSuccessMessage("");

    if (!loginEmail || !loginEmail.includes("@")) {
      setLoginError("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);
    try {
      await login(loginEmail, loginPassword);
      setLoginSuccessMessage(`Signed in successfully as ${loginEmail}`);
      setTimeout(() => {
        onClose();
        setLoginSuccessMessage("");
      }, 1200);
    } catch {
      setLoginError("Authentication failed. Please check credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const autofillDemoAccount = (demo: AuthUser) => {
    setLoginEmail(demo.email);
    setLoginPassword("xpo-demo-2026");
    setLoginError("");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={tAuth("modalTitle") || "Authentication & Role Governance"}
      description={tAuth("modalSubtitle") || "Manage your active persona, simulate multi-role permissions, or authenticate with credentials."}
      size="lg"
    >
      <div className="space-y-6 pt-2">
        {/* Navigation Tabs */}
        <div className="flex border-b border-border/80 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("switcher")}
            className={cn(
              "flex items-center gap-2 pb-3 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer",
              activeTab === "switcher"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <UserCheck className="h-4 w-4" />
            <span>{tAuth("roleSwitcherTab") || "Role Switcher"}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("login")}
            className={cn(
              "flex items-center gap-2 pb-3 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer",
              activeTab === "login"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <LogIn className="h-4 w-4" />
            <span>{tAuth("loginTab") || "Credentials Sign-In"}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("matrix")}
            className={cn(
              "flex items-center gap-2 pb-3 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer",
              activeTab === "matrix"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <ShieldCheck className="h-4 w-4" />
            <span>{tAuth("matrixTab") || "Permissions Matrix"}</span>
          </button>
        </div>

        {/* Feedback Messages */}
        {loginSuccessMessage && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center gap-2.5 text-xs text-emerald-600 dark:text-emerald-400 animate-fade-in">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{loginSuccessMessage}</span>
          </div>
        )}

        {loginError && (
          <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg flex items-center gap-2.5 text-xs text-destructive animate-fade-in">
            <XCircle className="h-4 w-4 shrink-0" />
            <span>{loginError}</span>
          </div>
        )}

        {/* TAB 1: Role Switcher Persona Cards */}
        {activeTab === "switcher" && (
          <div className="space-y-4">
            <div className="text-xs text-muted-foreground">
              {tAuth("switcherDescription") || "Select a persona below to instantaneously simulate its security permissions, access tier, and portal views."}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Attendee Card */}
              <div
                onClick={() => handleQuickSwitch("ATTENDEE")}
                className={cn(
                  "p-4 rounded-xl border transition-all text-left flex flex-col justify-between gap-3 cursor-pointer group hover:shadow-md",
                  role === "ATTENDEE"
                    ? "border-emerald-500 bg-emerald-500/5 ring-1 ring-emerald-500/30"
                    : "border-border bg-card hover:border-emerald-500/50"
                )}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <UserCheck className="h-4 w-4" />
                    </div>
                    {role === "ATTENDEE" ? (
                      <Badge variant="success" size="sm">{tAuth("activeLabel") || "Active"}</Badge>
                    ) : (
                      <span className="text-[11px] font-medium text-muted-foreground group-hover:text-foreground">{tAuth("switchLabel") || "Switch"}</span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">
                      {DEMO_ACCOUNTS.ATTENDEE.name}
                    </h4>
                    <p className="text-[11px] text-muted-foreground">
                      {DEMO_ACCOUNTS.ATTENDEE.jobTitle}
                    </p>
                    <p className="text-[10px] text-muted-foreground/80 mt-0.5">
                      {DEMO_ACCOUNTS.ATTENDEE.organization}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-border/60">
                  <div className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wider mb-1.5">
                    Tier: Attendee
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <span className="text-[10px] bg-muted/80 px-1.5 py-0.5 rounded text-foreground">
                      Event Discovery
                    </span>
                    <span className="text-[10px] bg-muted/80 px-1.5 py-0.5 rounded text-foreground">
                      Pass Checkout
                    </span>
                  </div>
                </div>
              </div>

              {/* Organizer Card */}
              <div
                onClick={() => handleQuickSwitch("ORGANIZER")}
                className={cn(
                  "p-4 rounded-xl border transition-all text-left flex flex-col justify-between gap-3 cursor-pointer group hover:shadow-md",
                  role === "ORGANIZER"
                    ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                    : "border-border bg-card hover:border-primary/50"
                )}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <Briefcase className="h-4 w-4" />
                    </div>
                    {role === "ORGANIZER" ? (
                      <Badge variant="archetype" size="sm">{tAuth("activeLabel") || "Active"}</Badge>
                    ) : (
                      <span className="text-[11px] font-medium text-muted-foreground group-hover:text-foreground">{tAuth("switchLabel") || "Switch"}</span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">
                      {DEMO_ACCOUNTS.ORGANIZER.name}
                    </h4>
                    <p className="text-[11px] text-muted-foreground">
                      {DEMO_ACCOUNTS.ORGANIZER.jobTitle}
                    </p>
                    <p className="text-[10px] text-muted-foreground/80 mt-0.5">
                      {DEMO_ACCOUNTS.ORGANIZER.organization}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-border/60">
                  <div className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wider mb-1.5">
                    Tier: Organizer
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">
                      Event Wizard
                    </span>
                    <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">
                      Live Customizer
                    </span>
                    <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">
                      QR Scanner
                    </span>
                  </div>
                </div>
              </div>

              {/* Admin Card */}
              <div
                onClick={() => handleQuickSwitch("ADMIN")}
                className={cn(
                  "p-4 rounded-xl border transition-all text-left flex flex-col justify-between gap-3 cursor-pointer group hover:shadow-md",
                  role === "ADMIN"
                    ? "border-rose-500 bg-rose-500/5 ring-1 ring-rose-500/30"
                    : "border-border bg-card hover:border-rose-500/50"
                )}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="h-8 w-8 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    {role === "ADMIN" ? (
                      <Badge variant="destructive" size="sm">{tAuth("activeLabel") || "Active"}</Badge>
                    ) : (
                      <span className="text-[11px] font-medium text-muted-foreground group-hover:text-foreground">{tAuth("switchLabel") || "Switch"}</span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">
                      {DEMO_ACCOUNTS.ADMIN.name}
                    </h4>
                    <p className="text-[11px] text-muted-foreground">
                      {DEMO_ACCOUNTS.ADMIN.jobTitle}
                    </p>
                    <p className="text-[10px] text-muted-foreground/80 mt-0.5">
                      {DEMO_ACCOUNTS.ADMIN.organization}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-border/60">
                  <div className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wider mb-1.5">
                    Tier: SuperAdmin
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <span className="text-[10px] bg-rose-500/10 text-rose-600 dark:text-rose-400 px-1.5 py-0.5 rounded font-medium">
                      Venue Ingestion
                    </span>
                    <span className="text-[10px] bg-rose-500/10 text-rose-600 dark:text-rose-400 px-1.5 py-0.5 rounded font-medium">
                      Crawler Pipeline
                    </span>
                    <span className="text-[10px] bg-rose-500/10 text-rose-600 dark:text-rose-400 px-1.5 py-0.5 rounded font-medium">
                      Audit Logs
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Credentials Sign-In */}
        {activeTab === "login" && (
          <div className="space-y-4">
            <form onSubmit={handleCredentialsSubmit} className="space-y-4">
              <div className="space-y-3">
                <Input
                  label={tAuth("emailLabel") || "Email Address"}
                  type="email"
                  placeholder="name@organization.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
                <Input
                  label={tAuth("passwordLabel") || "Password"}
                  type="password"
                  placeholder="••••••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="text-xs text-muted-foreground">
                  {tAuth("quickAutofill") || "Quick auto-fill:"}
                </div>
                <div className="flex gap-1.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-[11px] h-7 px-2"
                    onClick={() => autofillDemoAccount(DEMO_ACCOUNTS.ATTENDEE)}
                  >
                    {tAuth("attendee") || "Attendee"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-[11px] h-7 px-2"
                    onClick={() => autofillDemoAccount(DEMO_ACCOUNTS.ORGANIZER)}
                  >
                    {tAuth("organizer") || "Organizer"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-[11px] h-7 px-2"
                    onClick={() => autofillDemoAccount(DEMO_ACCOUNTS.ADMIN)}
                  >
                    {tAuth("admin") || "Admin"}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full gap-2"
                disabled={isSubmitting}
              >
                <LogIn className="h-4 w-4" />
                <span>{isSubmitting ? (tAuth("authenticating") || "Authenticating...") : (tAuth("signInBtn") || "Sign In to XPO")}</span>
              </Button>
            </form>
          </div>
        )}

        {/* TAB 3: Permissions Matrix Table */}
        {activeTab === "matrix" && (
          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            <div className="text-xs text-muted-foreground">
              {tAuth("permissionsMatrixTitle") || "Granular Role-Based Access Control (RBAC) permission map enforcing least-privilege security boundaries."}
            </div>

            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-muted/60 border-b border-border">
                    <th className="py-2 px-3 font-semibold text-foreground">{tAuth("capabilityCol") || "Permission Capability"}</th>
                    <th className="py-2 px-2 text-center font-semibold text-emerald-600 dark:text-emerald-400">{tAuth("attendee") || "Attendee"}</th>
                    <th className="py-2 px-2 text-center font-semibold text-primary">{tAuth("organizer") || "Organizer"}</th>
                    <th className="py-2 px-2 text-center font-semibold text-rose-600 dark:text-rose-400">{tAuth("admin") || "Admin"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {permissionsMatrix.map((item) => (
                    <tr key={item.permission} className="hover:bg-muted/30 transition-colors">
                      <td className="py-2 px-3">
                        <div className="font-medium text-foreground">{item.title}</div>
                        <div className="text-[10px] text-muted-foreground">{item.description}</div>
                      </td>
                      <td className="py-2 px-2 text-center">
                        {item.attendee ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto" />
                        ) : (
                          <XCircle className="h-4 w-4 text-muted-foreground/30 mx-auto" />
                        )}
                      </td>
                      <td className="py-2 px-2 text-center">
                        {item.organizer ? (
                          <CheckCircle2 className="h-4 w-4 text-primary mx-auto" />
                        ) : (
                          <XCircle className="h-4 w-4 text-muted-foreground/30 mx-auto" />
                        )}
                      </td>
                      <td className="py-2 px-2 text-center">
                        {item.admin ? (
                          <CheckCircle2 className="h-4 w-4 text-rose-500 mx-auto" />
                        ) : (
                          <XCircle className="h-4 w-4 text-muted-foreground/30 mx-auto" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Active Session Status Footer */}
        <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 bg-muted/20 p-3 rounded-lg">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="h-9 w-9 rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center text-xs shrink-0">
              {user ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() : "GU"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-foreground truncate">
                  {user ? user.name : (tAuth("guestUser") || "Guest User")}
                </span>
                <Badge variant={getRoleBadgeVariant(role)} size="sm">
                  {getRoleLabel(role)}
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground truncate">
                {user ? user.email : (tAuth("notSignedIn") || "Not signed in")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {isAuthenticated ? (
              <Button
                variant="outline"
                size="sm"
                className="text-xs gap-1.5 h-8 text-destructive hover:bg-destructive/10 hover:border-destructive/30"
                onClick={() => {
                  logout();
                  setLoginSuccessMessage("Signed out of active session.");
                  setTimeout(() => setLoginSuccessMessage(""), 2500);
                }}
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>{tAuth("signOutBtn") || "Sign Out"}</span>
              </Button>
            ) : null}
            <Button
              variant="secondary"
              size="sm"
              className="text-xs h-8"
              onClick={onClose}
            >
              {tAuth("doneBtn") || "Done"}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
