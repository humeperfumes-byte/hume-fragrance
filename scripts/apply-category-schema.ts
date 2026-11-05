import { config } from "dotenv";
import { readFileSync } from "node:fs";
import postgres from "postgres";
config({ path: ".env.local" });
config();
async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL required");
  const client = postgres(process.env.DATABASE_URL, {
    max: 1,
    prepare: false,
    connect_timeout: 10,
  });
  try {
    await client.begin(async (tx) => {
      await tx.unsafe(readFileSync("sql/product-category-system.sql", "utf8"));
    });
    console.log(
      "Category definitions and canonical labels applied; product memberships preserved.",
    );
  } finally {
    await client.end();
  }
}
main().catch(() => {
  console.error(
    "Category migration failed. Check database connectivity and permissions.",
  );
  process.exitCode = 1;
});
