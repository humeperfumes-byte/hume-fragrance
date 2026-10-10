import { config } from "dotenv";
import { readFile } from "node:fs/promises";
import postgres from "postgres";
config({ path: ".env.local", quiet: true });
config({ path: ".env", quiet: true });
async function main() {
  if (!process.env.DATABASE_URL) throw new Error("Database is not configured");
  const client = postgres(process.env.DATABASE_URL, { max: 1, prepare: false, connect_timeout: 10 });
  try {
    await client.unsafe(await readFile("sql/add_customer_access_links.sql", "utf8"));
    console.log("Customer access-link table is ready. Existing tables and orders were not modified.");
  } finally { await client.end(); }
}
main().catch(() => { console.error("Could not prepare customer access-link storage."); process.exitCode = 1; });
