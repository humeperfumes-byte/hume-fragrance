import "dotenv/config";
import { readFile } from "node:fs/promises";
import path from "node:path";
import postgres from "postgres";

async function main() {
  const connectionString = process.env.DATABASE_URL?.trim();
  if (!connectionString) throw new Error("DATABASE_URL is not configured.");

  const migration = await readFile(
    path.join(process.cwd(), "sql", "add_live_chat.sql"),
    "utf8",
  );
  const sql = postgres(connectionString, { max: 1, connect_timeout: 10 });

  try {
    await sql.unsafe(migration);
    console.log("Live chat tables are ready.");
  } finally {
    await sql.end();
  }
}

void main();
