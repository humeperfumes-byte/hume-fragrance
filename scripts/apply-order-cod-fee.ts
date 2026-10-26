import { config } from "dotenv";
import { readFile } from "node:fs/promises";
import postgres from "postgres";
config({ path: ".env.local", quiet: true }); config({ path: ".env", quiet: true });
async function main() {
  if (!process.env.DATABASE_URL) throw new Error("Database unavailable");
  const url = new URL(process.env.DATABASE_URL);
  if (url.port === "6543" && url.hostname.endsWith(".pooler.supabase.com")) url.port = "5432";
  const connection = postgres(url.toString(), { max: 1, prepare: false, connect_timeout: 10, onnotice: () => {} });
  try {
    await connection.begin(async tx => {
      await tx.unsafe("SET LOCAL lock_timeout = '5s'");
      await tx.unsafe("SET LOCAL statement_timeout = '20s'");
      const statements = (await readFile("sql/add_order_cod_fee.sql", "utf8")).split(";").map(s => s.trim()).filter(Boolean);
      for (const statement of statements) await tx.unsafe(statement);
    });
    console.log("COD fee storage ready; existing totals and payment amounts were preserved.");
  } finally { await connection.end(); }
}
main().catch(error => { console.error("Could not prepare COD fee storage", { code: typeof error?.code === "string" ? error.code : "unavailable" }); process.exitCode = 1; });
