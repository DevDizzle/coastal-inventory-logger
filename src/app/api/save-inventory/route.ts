import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    // This logs on the server (visible in SWA logs)
    console.log("📦 Inventory entry:", JSON.stringify(body));
    return NextResponse.json({ ok: true, echo: body }, { status: 200 });
  } catch (err) {
    console.error("save-inventory error:", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}

// (Optional) guard other methods
export async function GET() {
  return NextResponse.json({ ok: false, error: "Method not allowed" }, { status: 405 });
}
