module.exports = async function (context, req) {
  const body = req.body || {};
  context.log("📦 Inventory entry:", JSON.stringify(body));
  context.res = { status: 200, headers: { "Content-Type": "application/json" }, body: { ok: true, echo: body } };
};
