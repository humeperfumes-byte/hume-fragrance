import { db } from "@/db";
import { stockNotifyRequests } from "@/db/schema";
import { desc, sql } from "drizzle-orm";

export type StockNotifyInput = {
  productId: string;
  productName: string;
  email?: string | null;
  phone?: string | null;
  sourcePath?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
};

function isMissingStockNotifyTable(error: unknown) {
  const maybeError = error as { code?: unknown; message?: unknown; cause?: { code?: unknown; message?: unknown } };
  const code = String(maybeError?.code ?? maybeError?.cause?.code ?? "");
  const message = String(maybeError?.message ?? maybeError?.cause?.message ?? "").toLowerCase();
  return code === "42P01" || (message.includes("relation") && message.includes("stock_notify_requests"));
}

async function ensureStockNotifyTable() {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS stock_notify_requests (
      id VARCHAR(255) PRIMARY KEY,
      product_id VARCHAR(255) NOT NULL,
      product_name VARCHAR(255) NOT NULL,
      email VARCHAR(255),
      phone VARCHAR(50),
      source_path VARCHAR(2048),
      status VARCHAR(40) NOT NULL DEFAULT 'new',
      ip_address VARCHAR(255),
      user_agent TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT now(),
      updated_at TIMESTAMP NOT NULL DEFAULT now()
    )
  `);
}

function clean(value?: string | null) {
  return value?.trim() || null;
}

async function insertStockNotifyRequest(input: StockNotifyInput) {
  const now = new Date();
  await db.insert(stockNotifyRequests).values({
    id: crypto.randomUUID(),
    productId: input.productId.trim(),
    productName: input.productName.trim(),
    email: clean(input.email),
    phone: clean(input.phone),
    sourcePath: clean(input.sourcePath),
    status: "new",
    ipAddress: clean(input.ipAddress),
    userAgent: clean(input.userAgent),
    createdAt: now,
    updatedAt: now,
  });
}

export async function captureStockNotifyRequest(input: StockNotifyInput) {
  try {
    await insertStockNotifyRequest(input);
  } catch (error) {
    if (!isMissingStockNotifyTable(error)) throw error;
    await ensureStockNotifyTable();
    await insertStockNotifyRequest(input);
  }
}

export async function listStockNotifyRequests(limit = 100) {
  try {
    return await db
      .select()
      .from(stockNotifyRequests)
      .orderBy(desc(stockNotifyRequests.createdAt))
      .limit(limit);
  } catch (error) {
    if (!isMissingStockNotifyTable(error)) throw error;
    await ensureStockNotifyTable();
    return [];
  }
}
