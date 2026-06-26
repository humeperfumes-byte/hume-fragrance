import { db } from "./db";
import { behavioralEvents } from "./db/schema";

async function main() {
  console.log("Testing db connection through configured client...");
  try {
    const res = await db.select().from(behavioralEvents).limit(5);
    console.log("Success! Fetched rows:", res.length);
  } catch (err) {
    console.error("Failed to query through configured client:", err);
  }
}

main();
