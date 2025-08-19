module.exports = async function (context, req) {
  try {
    if (req.method !== "POST") {
      context.res = { status: 405, headers: { "Allow": "POST" }, body: { ok: false, error: "Method not allowed" } };
      return;
    }

    const body = req.body || {};
    // Helpful: ensure items are always an array if you’re batching
    const normalized = Array.isArray(body.items) ? body : { ...body, items: body.items ? body.items : [] };

    context.log("📦 Inventory entry:", JSON.stringify(normalized));
    context.res = {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: { ok: true, receivedAt: new Date().toISOString(), echo: normalized }
    };
  } catch (err) {
    context.log.error("Save-inventory handler error:", err);
    context.res = { status: 500, body: { ok: false, error: "Server error" } };
  }
};
