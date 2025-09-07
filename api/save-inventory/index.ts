import { app, HttpRequest, HttpResponseInit, InvocationContext, output } from "@azure/functions";

const schema = process.env.AZURE_SQL_SCHEMA || "dbo";
const table = process.env.AZURE_SQL_TABLE || "InventoryLog";

const sqlOut = output.sql({
  commandText: `${schema}.${table}`,
  connectionStringSetting: "SqlConnectionString",
});

export async function saveInventory(req: HttpRequest, ctx: InvocationContext): Promise<HttpResponseInit> {
  try {
    const body = await req.json();
    const rows = Array.isArray(body) ? body : [body];

    for (const r of rows) {
      if (!r.MaterialCode || r.Quantity === undefined) {
        return { status: 400, jsonBody: { error: "MaterialCode and Quantity are required." } };
      }
    }

    const user = req.headers.get("x-ms-client-principal-name") || null;
    const rowsReady = rows.map(r => ({
      EnteredBy: r.EnteredBy ?? user,
      MaterialCode: r.MaterialCode,
      Quantity: r.Quantity,
      Unit: r.Unit ?? null,
      Location: r.Location ?? null,
      Notes: r.Notes ?? null,
    }));

    ctx.extraOutputs.set(sqlOut, rowsReady);
    return { status: 201, jsonBody: { inserted: rowsReady.length } };
  } catch (e: any) {
    ctx.error(`save-inventory error: ${e?.message || e}`);
    return { status: 500, jsonBody: { error: "Server error" } };
  }
}

app.http("save-inventory", {
  methods: ["POST"],
  authLevel: "function",
  extraOutputs: [sqlOut],
  handler: saveInventory,
});
