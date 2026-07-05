import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function main() {
  try {
    const { db } = await import("../db");
    const { checkoutDrafts } = await import("../db/schema");
    const { eq, or, like } = await import("drizzle-orm");
    
    const rows = await db
      .select()
      .from(checkoutDrafts)
      .where(
        or(
          like(checkoutDrafts.email, "%priyanshu%"),
          like(checkoutDrafts.addressLine1, "%WADGAON%")
        )
      );
      
    console.log(`Found ${rows.length} matching checkout drafts:`);
    for (const row of rows) {
      console.log(`Draft ID: ${row.id}`);
      console.log(`Email: ${row.email}`);
      console.log(`Phone: ${row.phone}`);
      console.log(`Name: ${row.fullName}`);
      console.log(`Address: ${row.addressLine1}`);
      console.log("CartSnapshot:");
      console.log(JSON.stringify(row.cartSnapshot, null, 2));
      console.log("-----------------------------------------");
    }
  } catch (err) {
    console.error("Error reading draft:", err);
  }
}

main();
