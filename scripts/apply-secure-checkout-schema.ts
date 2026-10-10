import { config } from "dotenv";
import { readFile } from "node:fs/promises";
import postgres from "postgres";
config({ path: ".env.local", quiet: true }); config({ path: ".env", quiet: true });
async function main() {
  if (!process.env.DATABASE_URL) throw new Error("Database unavailable");
  const connection = postgres(process.env.DATABASE_URL, { max: 1, prepare: false, connect_timeout: 10, onnotice: () => {} });
  try {
    await connection`SET lock_timeout = '5s'`;
    const statements = (await readFile("sql/add_secure_checkout_sessions.sql", "utf8")).split(";").map(statement => statement.trim()).filter(Boolean);
    for (const statement of statements) await connection.unsafe(statement);
    console.log("Additive checkout session and diagnostic tables are ready; existing order/product rows were not changed.");
  }
  finally { await connection.end(); }
}
main().catch((error) => { console.error("Could not prepare secure checkout storage", { code: typeof error?.code === "string" ? error.code : "unavailable" }); process.exitCode = 1; });
