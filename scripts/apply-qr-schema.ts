import { config } from "dotenv";
import { readFileSync } from "node:fs";
import postgres from "postgres";
config({ path: ".env.local" });
config();
async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
  const client = postgres(process.env.DATABASE_URL, { prepare: false, max: 1 });
  try {
    await client.begin(async (tx) => {
      await tx.unsafe(readFileSync("sql/qr-system.sql", "utf8"));
    });
    console.log("QR migration applied; existing data preserved.");
  } finally {
    await client.end();
  }
}
main().catch(() => {
  console.error(
    "QR migration failed. Check database connectivity and permissions.",
  );
  process.exitCode = 1;
});
