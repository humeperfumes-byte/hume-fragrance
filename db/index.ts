import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Connect using Supabase Pooler in Transaction Mode (port 6543).
// Transaction Mode multiplexes serverless connections to prevent database connection exhaustion.
// We must disable prepared statements (prepare: false) as transaction pooling is session-agnostic.
const connectionString = process.env.DATABASE_URL;

const client = postgres(connectionString, {
  // Keep the per-instance client pool deliberately small. Supavisor already
  // performs the shared pooling, and a large client pool on every Vercel
  // instance can create avoidable connection spikes.
  max: 2,
  prepare: false, // Must be false for Supabase Transaction Mode (port 6543)
  idle_timeout: 20,
  connect_timeout: 5,
});

export const db = drizzle(client, { schema });
