// src/app/material-inventory/page.tsx
import Image from "next/image";
import Link from "next/link";
import AuthGate from "@/components/auth-gate";
import InventoryLogger from "@/components/inventory-logger";
import NavigationButtons from "@/components/navigation-buttons";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default function MaterialInventoryPage() {
  return (
    <div className="min-h-screen w-full bg-background flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <header className="w-full max-w-5xl mb-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
        <div className="flex w-full flex-col items-center gap-2 sm:w-auto sm:flex-row sm:gap-4">
          <Link href="/" aria-label="Home" className="cursor-pointer">
            <Image src="/logo.png" alt="Coastal Waste & Recycling Logo" width={150} height={45} />
          </Link>
          <h1 className="text-2xl font-bold font-headline text-primary sm:text-3xl">
            Coastal Inventory Logger
          </h1>
        </div>
        <Button asChild className="h-11 w-full px-6 shadow-sm sm:w-auto">
          <a href="/.auth/logout?post_logout_redirect_uri=/">
            <LogOut className="h-4 w-4" aria-hidden="true" />
            <span>Sign out</span>
          </a>
        </Button>
      </header>

      <main className="w-full flex justify-center">
        <AuthGate>
          <InventoryLogger />
        </AuthGate>
      </main>

      <NavigationButtons />
    </div>
  );
}
