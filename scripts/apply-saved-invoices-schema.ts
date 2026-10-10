import { config } from "dotenv";
import { readFile } from "node:fs/promises";
import postgres from "postgres";
config({ path: ".env.local", quiet: true });
config({ path: ".env", quiet: true });
async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured");
  const client = postgres(process.env.DATABASE_URL, { max: 1, prepare: false, connect_timeout: 10 });
  try {
    await client.unsafe(await readFile("sql/add_saved_invoices.sql", "utf8"));
    console.log("Saved invoices table is ready. Existing tables were not changed.");
  } finally { await client.end(); }
}
main().catch(() => { console.error("Could not prepare the saved invoices table."); process.exitCode = 1; });
