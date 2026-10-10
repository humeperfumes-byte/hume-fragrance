import { config } from "dotenv";
import postgres from "postgres";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
config({ path: ".env.local", quiet: true });
config({ path: ".env", quiet: true });
async function main() {
  if (!process.env.DATABASE_URL) throw new Error("Database is not configured");
  const client = postgres(process.env.DATABASE_URL, { max: 1, prepare: false });
  const rollback = new Error("ROLLBACK_INVOICE_CHECK");
  try {
    try {
      await client.begin(async tx => {
        const id = randomUUID();
        const [saved] = await tx.unsafe("insert into saved_invoices (id,title,document) values ($1,$2,$3::jsonb) returning *", [id, "Invoice persistence check", { buyerName: "Test", items: [{ name: "Machine", price: 4000 }, { name: "Samples", price: 0 }] }]);
        assert.equal(saved.document.items[1].price, 0);
        await tx.unsafe("update saved_invoices set document = $1::jsonb where id = $2", [{ ...saved.document, buyerName: "Updated" }, id]);
        const [reopened] = await tx.unsafe("select * from saved_invoices where id = $1", [id]);
        assert.equal(reopened.document.buyerName, "Updated");
        assert.equal(reopened.document.items[0].name, "Machine");
        throw rollback;
      });
    } catch (error) { if (error !== rollback) throw error; }
    console.log("Invoice save, update and reopen checks passed. Test transaction rolled back.");
  } finally { await client.end(); }
}
main().catch(error => { console.error("Invoice persistence check failed.", { name: error?.name, code: error?.code, message: error instanceof Error ? error.message : "Unknown error" }); process.exitCode = 1; });
