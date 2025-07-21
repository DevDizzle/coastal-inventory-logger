import { getFirestore, collection, writeBatch, doc, serverTimestamp, Timestamp } from "firebase/firestore";
import type { StagedItem } from "@/components/inventory-logger";
import { getFirebaseApp } from "@/lib/firebase";
import { format } from "date-fns";

function generateReceiptHtml(items: StagedItem[], userEmail: string): string {
  const weekEnding = items.length > 0 ? format(items[0].weekEnding, "PPP") : 'N/A';
  const siteLocation = items.length > 0 ? items[0].location : 'N/A';

  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.material}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${item.quantity} ${item.unit}</td>
    </tr>
  `).join('');

  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
      <h2 style="color: #333;">Inventory Submission Receipt</h2>
      <p>Thank you, ${userEmail}, for your submission.</p>
      <p>
        <strong>Site Location:</strong> ${siteLocation}<br/>
        <strong>Week Ending:</strong> ${weekEnding}
      </p>
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <thead>
          <tr>
            <th style="padding: 8px; border-bottom: 2px solid #333; text-align: left;">Material</th>
            <th style="padding: 8px; border-bottom: 2px solid #333; text-align: right;">Quantity</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
      <p style="margin-top: 20px; font-size: 12px; color: #777;">This is an automated receipt. Please do not reply to this email.</p>
    </div>
  `;
}

export async function saveInventoryEntries(items: StagedItem[], userEmail: string): Promise<void> {
  const app = getFirebaseApp();
  if (!app) {
    throw new Error("Firebase app not initialized");
  }

  const db = getFirestore(app);
  const batch = writeBatch(db);
  const inventoryCollection = collection(db, "inventory_entries");
  const mailCollection = collection(db, "mail");

  // Step 1: Save inventory entries
  items.forEach((item) => {
    const docRef = doc(inventoryCollection); 
    const { id, weekEnding, ...rest } = item;
    
    batch.set(docRef, {
      ...rest,
      submittedBy: userEmail,
      weekEnding: Timestamp.fromDate(weekEnding),
      submittedAt: serverTimestamp(),
    });
  });
  
  // Step 2: Create the email document
  const weekEndingDate = items.length > 0 ? format(items[0].weekEnding, "PPP") : "N/A";
  const mailDocRef = doc(mailCollection);
  batch.set(mailDocRef, {
    to: [userEmail],
    message: {
      subject: `Inventory Submission Confirmation - Week Ending ${weekEndingDate}`,
      html: generateReceiptHtml(items, userEmail),
    },
  });


  // Step 3: Commit all changes
  await batch.commit();
}
