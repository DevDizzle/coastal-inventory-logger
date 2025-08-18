import Image from "next/image";
import AuthGate from "@/components/auth-gate";
import InventoryLogger from "@/components/inventory-logger";

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-background flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <header className="w-full max-w-5xl mb-8 flex items-center gap-4">
        <Image src="/logo.png" alt="Coastal Waste & Recycling Logo" width={150} height={45} />
        <h1 className="text-3xl font-bold font-headline text-primary">
          Coastal Inventory Logger
        </h1>
      </header>
      <main className="w-full flex justify-center">
        <AuthGate>
          <InventoryLogger />
        </AuthGate>
      </main>
    </div>
  );
}
