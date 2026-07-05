import { db } from "@/db";
import { customerFeedback } from "@/db/schema";
import { sql } from "drizzle-orm";

export type CustomerFeedbackInput = {
  source: string;
  sourceDetails?: string | null;
  rating: number;
  feedbackText?: string | null;
};

async function ensureFeedbackTable() {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS customer_feedback (
      id VARCHAR(255) PRIMARY KEY,
      source VARCHAR(100) NOT NULL,
      source_details VARCHAR(255),
      rating INTEGER NOT NULL,
      feedback_text TEXT,
      contact_info VARCHAR(255),
      created_at TIMESTAMP NOT NULL DEFAULT now(),
      updated_at TIMESTAMP NOT NULL DEFAULT now()
    )
  `);
}

export async function captureCustomerFeedback(input: CustomerFeedbackInput) {
  try {
    await ensureFeedbackTable();
  } catch (err) {
    console.error("Failed to ensure customer_feedback table exists:", err);
  }

  const now = new Date();
  await db.insert(customerFeedback).values({
    id: crypto.randomUUID(),
    source: input.source.trim(),
    sourceDetails: input.sourceDetails?.trim() || null,
    rating: input.rating,
    feedbackText: input.feedbackText?.trim() || null,
    contactInfo: null,
    createdAt: now,
    updatedAt: now,
  });
}
