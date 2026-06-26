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
  max: 5, // Allow up to 5 concurrent connections per serverless instance for parallel queries (Promise.all)
  prepare: false, // Must be false for Supabase Transaction Mode (port 6543)
  idle_timeout: 2, // Automatically close connection after 2s of inactivity to prevent dead sockets in serverless environment
  connect_timeout: 5, // Lower connection timeout to prevent long hangs on cold starts
});

export const db = drizzle(client, { schema });
