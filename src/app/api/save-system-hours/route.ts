// src/app/api/save-system-hours/route.ts
import { NextRequest, NextResponse } from "next/server";
import sql from "mssql";

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
    ps.input("Metric", sql.NVarChar);
    ps.input("Hours", sql.Decimal(18, 2));
    ps.input("CreatedBy", sql.NVarChar);
    ps.input("Source", sql.NVarChar);

    await ps.prepare(`
      INSERT INTO Inventory.PC_SystemHours ([Location],[Date],[Metric],[Hours],CreatedBy,Source)
      VALUES (@Location,@Date,@Metric,@Hours,@CreatedBy,@Source)
    `);

    for (const item of items) {
      if (!item.location || !item.date || !item.metric || item.hours == null) {
        await tx.rollback();
        return NextResponse.json({ ok: false, error: "Missing item fields" }, { status: 400 });
      }
      await ps.execute({
        Location: String(item.location),
        Date: new Date(item.date),
        Metric: String(item.metric),
        Hours: Number(item.hours),
        CreatedBy: String(userEmail),
        Source: "App",
      });
    }

    await ps.unprepare();
    await tx.commit();
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error("save-system-hours error:", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: false, error: "Method not allowed" }, { status: 405 });
}
