// src/app/api/save-inventory/route.ts
import { NextRequest, NextResponse } from "next/server";
import sql from "mssql";

// Reuse a single pool (prevents socket exhaustion)
const poolPromise = (async () => {
  const cs = process.env.SQL_CONNECTION_STRING;
  if (!cs) throw new Error("SQL_CONNECTION_STRING not configured");
  return sql.connect(cs);
})();

export async function POST(req: NextRequest) {
  try {
    const { userEmail, items } = await req.json();
    if (!userEmail || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });
    }

    const pool = await poolPromise;
    const tx = new sql.Transaction(pool);
    await tx.begin();

    const ps = new sql.PreparedStatement(tx);
    ps.input("Location", sql.NVarChar);
    ps.input("Date", sql.Date);
    ps.input("Material", sql.NVarChar);
    ps.input("Tons", sql.Decimal(18, 3));
    ps.input("CreatedBy", sql.NVarChar);
    ps.input("Source", sql.NVarChar);

    await ps.prepare(`
      INSERT INTO Inventory.PC_Material ([Location],[Date],[Material],[Tons],CreatedBy,Source)
      VALUES (@Location, @Date, @Material, @Tons, @CreatedBy, @Source)
    `);

    for (const item of items) {
      const tonsRaw = item.tons ?? item.quantity;
      if (!item.location || !item.material || !item.weekEnding || tonsRaw == null) {
        await tx.rollback();
        return NextResponse.json({ ok: false, error: "Missing item fields" }, { status: 400 });
      }
      await ps.execute({
        Location: String(item.location),
        Date: new Date(item.weekEnding),
        Material: String(item.material),
        Tons: Number(tonsRaw),
        CreatedBy: String(userEmail),
        Source: "App"
      });
    }

    await ps.unprepare();
    await tx.commit();
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error("save-inventory error:", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: false, error: "Method not allowed" }, { status: 405 });
}
