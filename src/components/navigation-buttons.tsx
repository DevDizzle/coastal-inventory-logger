// src/components/navigation-buttons.tsx
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

/**
 * Renders navigation buttons used throughout the app.
 * "Equipment Inventory" is disabled and marked as coming soon.
 */
export default function NavigationButtons() {
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
      <Button asChild>
        <Link href="/material-inventory">Material Inventory</Link>
      </Button>
      <Button asChild>
        <Link href="/system-hours">System Hours</Link>
      </Button>
      <Button disabled className="bg-gray-300 text-gray-500 cursor-not-allowed" title="Coming soon">
        Equipment Inventory
      </Button>
    </div>
  );
}
