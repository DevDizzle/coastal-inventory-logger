import { NextRequest, NextResponse } from "next/server";
import sql from "mssql";

// Insert inventory entries into Azure SQL
// Requires an environment variable `SQL_CONNECTION_STRING`
export async function POST(req: NextRequest) {
  let pool: sql.ConnectionPool | undefined;
  try {
    const { userEmail, items } = await req.json().catch(() => ({}));
    if (!userEmail || !Array.isArray(items)) {
      return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });
    }

    const connStr = process.env.SQL_CONNECTION_STRING;
    if (!connStr) {
      throw new Error("SQL_CONNECTION_STRING not configured");
    }

    pool = await sql.connect(connStr);

    for (const item of items) {
      await pool
        .request()
        .input("userEmail", sql.NVarChar, userEmail)
        .input("location", sql.NVarChar, item.location)
        .input("weekEnding", sql.Date, new Date(item.weekEnding))
        .input("material", sql.NVarChar, item.material)
        .input("quantity", sql.Int, item.quantity)
        .input("unit", sql.NVarChar, item.unit)
        .query(
          `INSERT INTO InventoryEntries (userEmail, location, weekEnding, material, quantity, unit)
           VALUES (@userEmail, @location, @weekEnding, @material, @quantity, @unit)`
        );
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("save-inventory error:", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  } finally {
    await pool?.close();
  }
}

// Guard other methods
export async function GET() {
  return NextResponse.json({ ok: false, error: "Method not allowed" }, { status: 405 });
}
