"use client";

import React, { useEffect, useState, type ReactNode, type ReactElement } from "react";

/**
 * AuthGate (SWA + Entra ID)
 * - Checks /.auth/me for a signed-in principal
 * - If not authenticated, redirects to /.auth/login/aad (then back to "/")
 * - When authenticated, extracts the user's email and injects it into the child as { userEmail }
 * - Keeps UI minimal; replace the loading return with your spinner if desired
 */
export default function AuthGate({ children }: { children: ReactNode }) {
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/.auth/me", { cache: "no-store" });
        if (!res.ok) throw new Error(`/.auth/me ${res.status}`);
        const data = await res.json();
        const principal = data?.clientPrincipal;
        const e = extractEmail(principal);

        if (!e) {
          // Not authenticated → kick off Microsoft login
          if (!cancelled) {
            window.location.href = "/.auth/login/aad?post_login_redirect_uri=/";
          }
          return;
        }
        if (!cancelled) setEmail(e);
      } catch {
        // Any error → attempt login
        if (!cancelled) {
          window.location.href = "/.auth/login/aad?post_login_redirect_uri=/";
        }
        return;
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // While we check auth; swap for a spinner if you like
  if (checking) return null;

  // If authenticated and child is a single element, inject userEmail prop (e.g., into <InventoryLogger />)
  if (email && React.isValidElement(children)) {
    return React.cloneElement(children as ReactElement, { userEmail: email });
  }

  // Fallback: render children as-is (e.g., if a layout wraps multiple elements)
  return <>{children}</>;
}

/** Robustly extract an email from the SWA principal */
function extractEmail(principal: any): string | null {
  if (!principal) return null;

  // SWA often puts an email-like value in userDetails
  const details = principal.userDetails;
  if (typeof details === "string" && details.includes("@")) return details;

  // Otherwise, search claims for email/UPN
  const claims: any[] = principal.claims || [];
  for (const c of claims) {
    const typ = String(c.typ || c.type || "").toLowerCase();
    const val = String(c.val || c.value || "");
    if (!val) continue;

    if (typ.includes("email")) return val;               // generic "email" claim
    if (typ.endsWith("/emailaddress")) return val;       // AAD emailaddress claim
    if (typ.endsWith("/upn") && val.includes("@")) return val; // UPN as fallback
  }
  return null;
}
