import { getFirestore, collection, writeBatch, doc, serverTimestamp, Timestamp } from "firebase/firestore";
import type { StagedItem } from "@/components/inventory-logger";
import { getFirebaseApp } from "@/lib/firebase";

export async function saveInventoryEntries(items: StagedItem[]): Promise<void> {
  const app = getFirebaseApp();
  if (!app) {
    throw new Error("Firebase app not initialized");
  }

  const db = getFirestore(app);
  const batch = writeBatch(db);
  const inventoryCollection = collection(db, "inventory_entries");

  items.forEach((item) => {
    const docRef = doc(inventoryCollection); 
    const { id, weekEnding, ...rest } = item;
    
    batch.set(docRef, {
      ...rest,
      weekEnding: Timestamp.fromDate(weekEnding),
      submittedAt: serverTimestamp(),
    });
  });

  await batch.commit();
}
