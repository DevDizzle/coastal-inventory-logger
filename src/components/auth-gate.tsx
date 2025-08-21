"use client";

import React, { useEffect, useState, type ReactNode, type ReactElement } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";

/**
 * AuthGate (SWA + Entra ID)
 * - If not authenticated: render a simple login card with a "Sign in with Microsoft" button.
 * - If authenticated: inject { userEmail } into the single child (e.g., <InventoryLogger />).
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
        if (!cancelled) setEmail(e || null);
      } catch {
        if (!cancelled) setEmail(null);
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Initial silent check
  if (checking) return null;

  // Not signed in → show login UI (no auto-redirect)
  if (!email) {
    return (
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="text-primary" />
              Sign in required
            </CardTitle>
            <CardDescription>
              Please sign in with your company Microsoft account to continue.
            </CardDescription>
          </CardHeader>
          <CardContent />
          <CardFooter>
            <Button
              className="w-full"
              onClick={() =>
                (window.location.href = "/.auth/login/aad?post_login_redirect_uri=/")
              }
            >
              Sign in with Microsoft
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Signed in → inject userEmail into the child (if it's a single React element)
  if (React.isValidElement(children)) {
    return React.cloneElement(children as ReactElement, { userEmail: email });
  }
  return <>{children}</>;
}

function extractEmail(principal: any): string | null {
  if (!principal) return null;
  const details = principal.userDetails;
  if (typeof details === "string" && details.includes("@")) return details;

  const claims: any[] = principal.claims || [];
  for (const c of claims) {
    const typ = String(c.typ || c.type || "").toLowerCase();
    const val = String(c.val || c.value || "");
    if (!val) continue;
    if (typ.includes("email")) return val;
    if (typ.endsWith("/emailaddress")) return val;
    if (typ.endsWith("/upn") && val.includes("@")) return val;
  }
  return null;
}
