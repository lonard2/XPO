"use client";

import * as React from "react";

const MAX_REPORTS_PER_PAGE = 5;

/**
 * Reports uncaught browser errors to /api/telemetry/error.
 *
 * Capped per page load so a render loop cannot flood the endpoint. Reports are
 * sent with keepalive so a navigation does not cancel them.
 */
export function ClientErrorReporter() {
  React.useEffect(() => {
    let sent = 0;

    const report = (message: string, stack?: string) => {
      if (sent >= MAX_REPORTS_PER_PAGE || !message) return;
      sent += 1;
      try {
        void fetch("/api/telemetry/error", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: message.slice(0, 500),
            stack: (stack || "").slice(0, 2000),
            url: window.location.pathname.slice(0, 300),
          }),
          keepalive: true,
        }).catch(() => {});
      } catch {
        // Reporting must never throw.
      }
    };

    const onError = (event: ErrorEvent) => {
      report(event.message, event.error instanceof Error ? event.error.stack : undefined);
    };
    const onRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      report(
        reason instanceof Error ? reason.message : String(reason ?? "Unhandled rejection"),
        reason instanceof Error ? reason.stack : undefined
      );
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  return null;
}
