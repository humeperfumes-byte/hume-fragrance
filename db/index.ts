import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const client = postgres(process.env.DATABASE_URL, {
  max: 1,
  prepare: false,
  idle_timeout: 2, // Automatically close connection after 2s of inactivity so Vercel does not freeze with an open dead socket
  connect_timeout: 5, // Lower connection timeout to prevent long hangs on cold starts
});

export const db = drizzle(client, { schema });
