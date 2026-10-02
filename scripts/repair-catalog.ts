import { config } from "dotenv";
import { mkdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import postgres from "postgres";
import {
  DISCOVERY_SET_PRICE, DISCOVERY_SET_SIZE, DISCOVERY_SET_SAMPLE_COUNT,
  DISCOVERY_SET_SHORT_DESCRIPTION, DISCOVERY_SET_DESCRIPTION, DISCOVERY_SET_IMAGES,
} from "../lib/discovery-set";

config({ path: ".env.local", quiet: true });
const sql = postgres(process.env.DATABASE_URL!, { max: 1, prepare: false });
const targets = new Set(["hume-discovery-set", "tom-ford-oud-wood"]);
const hash = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");

async function main() {
  await sql.begin(async (transaction) => {
    // postgres TransactionSql uses Omit<Sql>, which drops the callable signature
    // in this TypeScript version. The runtime transaction remains a SQL tag.
    const tx = transaction as unknown as typeof sql;
    // Lock the snapshot so concurrent catalog edits cannot invalidate verification.
    const before = await tx`select * from products order by id for update`;
    if (!before.some((p) => p.id === "oud-wood")) throw new Error("Canonical Oud Wood is missing");
    for (const id of targets) {
      if (!before.some((p) => p.id === id)) throw new Error(`Repair target missing: ${id}`);
    }
    await mkdir("output/catalog-backups", { recursive: true });
    const backup = `output/catalog-backups/catalog-${Date.now()}.json`;
    await writeFile(backup, JSON.stringify(before, null, 2));
    await tx`update products set price=${String(DISCOVERY_SET_PRICE)}, size=${DISCOVERY_SET_SIZE},
      inspiration=${`Build your own ${DISCOVERY_SET_SAMPLE_COUNT} sample box`},
      description=${DISCOVERY_SET_SHORT_DESCRIPTION}, seo_description=${DISCOVERY_SET_DESCRIPTION},
      images=${tx.json(DISCOVERY_SET_IMAGES)}, updated_at=now()
      where id=${"hume-discovery-set"}`;
    await tx`update products set visibility=${"seo_only"},
      badges=badges || ${tx.json({ showInDiscoverySet: false, recommendedSample: false })}::jsonb,
      updated_at=now() where id=${"tom-ford-oud-wood"}`;
    const after = await tx`select * from products order by id`;
    const protectedBefore = before.filter((p) => !targets.has(p.id));
    const protectedAfter = after.filter((p) => !targets.has(p.id));
    if (hash(protectedBefore) !== hash(protectedAfter)) throw new Error("Unrelated products changed; rolling back");
    console.log(JSON.stringify({ backup, changedIds: [...targets], protectedProducts: protectedAfter.length,
      protectedProductsUnchanged: true, publicProducts: after.filter((p) => p.visibility === "public").length }));
  });
}
main().catch((error) => { console.error("Catalog repair failed:", error.code ?? error.message); process.exitCode = 1; })
  .finally(() => sql.end());
