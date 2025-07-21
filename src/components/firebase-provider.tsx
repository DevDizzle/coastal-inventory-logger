"use client";

import { getFirebaseApp } from "@/lib/firebase";
import { type ReactNode } from "react";

// This component ensures that Firebase is initialized on the client side.
export function FirebaseProvider({ children }: { children: ReactNode }) {
  getFirebaseApp(); // Initialize Firebase
  return <>{children}</>;
}
