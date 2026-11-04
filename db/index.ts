import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Connect using Supabase Pooler in Transaction Mode (port 6543).
// Transaction Mode multiplexes serverless connections to prevent database connection exhaustion.
// We must disable prepared statements (prepare: false) as transaction pooling is session-agnostic.
let connectionString = process.env.DATABASE_URL;
// A persistent local server uses the session pooler. Transaction pooling remains
// unchanged for production/serverless instances.
if (process.env.NODE_ENV === "development") {
  const databaseUrl = new URL(connectionString);
  if (databaseUrl.port === "6543" && databaseUrl.hostname.endsWith(".pooler.supabase.com")) {
    databaseUrl.port = "5432";
    connectionString = databaseUrl.toString();
  }
}

// Reuse the development pool across hot reloads instead of opening another pool per edit.
const developmentState = globalThis as typeof globalThis & { humeDevelopmentPool?: { url: string; client: ReturnType<typeof postgres> } };
const cachedClient = process.env.NODE_ENV !== "production" && developmentState.humeDevelopmentPool?.url === connectionString ? developmentState.humeDevelopmentPool.client : undefined;
const poolOptions = {
  // Keep the per-instance client pool deliberately small. Supavisor already
  // performs the shared pooling, and a large client pool on every Vercel
  // instance can create avoidable connection spikes.
  max: process.env.NODE_ENV === "development" ? 1 : 2,
  prepare: false, // Must be false for Supabase Transaction Mode (port 6543)
  idle_timeout: 20,
  // Cold development compilation can briefly delay the connection handshake.
  connect_timeout: process.env.NODE_ENV === "development" ? 15 : 5,
};
const client = cachedClient || postgres(connectionString, poolOptions);
if (process.env.NODE_ENV !== "production") developmentState.humeDevelopmentPool = { url: connectionString, client };

const defaultDb = drizzle(client, { schema });
const requestDatabases = new WeakMap<object, typeof defaultDb>();

function databaseForRequest(): typeof defaultDb {
  // Workers sockets belong to their originating request. Hyperdrive pools the
  // upstream connections; each request gets its own short-lived driver client.
  let context: ReturnType<typeof getCloudflareContext>;
  try {
    context = getCloudflareContext();
  } catch {
    return defaultDb; // Next.js builds, local Node.js, and Vercel.
  }
  const hyperdrive = (context.env as { HYPERDRIVE?: { connectionString: string } }).HYPERDRIVE;
  if (!hyperdrive || typeof context.ctx !== "object" || context.ctx === null) return defaultDb;
  let database = requestDatabases.get(context.ctx);
  if (!database) {
    const requestClient = postgres(hyperdrive.connectionString, {
      ...poolOptions,
      prepare: true,
      fetch_types: false,
      idle_timeout: 1,
    });
    database = drizzle(requestClient, { schema });
    requestDatabases.set(context.ctx, database);
  }
  return database;
}

export const db = new Proxy(defaultDb, {
  get(_target, property) {
    const database = databaseForRequest();
    const value = Reflect.get(database, property, database);
    return typeof value === "function" ? value.bind(database) : value;
  },
});
