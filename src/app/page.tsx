import { Waves } from "lucide-react";
import AuthGate from "@/components/auth-gate";
import InventoryLogger from "@/components/inventory-logger";
import { FirebaseProvider } from "@/components/firebase-provider";

export default function Home() {
  return (
    <FirebaseProvider>
      <div className="min-h-screen w-full bg-background flex flex-col items-center p-4 sm:p-6 lg:p-8">
        <header className="w-full max-w-5xl mb-8 flex items-center gap-3">
          <div className="bg-primary p-2 rounded-lg">
            <Waves className="h-8 w-8 text-primary-foreground" />
          </div>
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
    </FirebaseProvider>
  );
}
