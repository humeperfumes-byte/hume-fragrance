import { db } from "@/db";
import { corporateGiftingLeads } from "@/db/schema";
import { sql } from "drizzle-orm";

export type CorporateGiftingLeadInput = {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  estimatedQuantity?: number | null;
  customizationDetails?: string | null;
};

function clean(value?: string | null) {
  return value?.trim() || null;
}

async function ensureCorporateGiftingTable() {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS corporate_gifting_leads (
      id VARCHAR(255) PRIMARY KEY,
      company_name VARCHAR(255) NOT NULL,
      contact_name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(50) NOT NULL,
      estimated_quantity INTEGER,
      customization_details TEXT,
      status VARCHAR(50) NOT NULL DEFAULT 'new',
      created_at TIMESTAMP NOT NULL DEFAULT now(),
      updated_at TIMESTAMP NOT NULL DEFAULT now()
    )
  `);
}

async function insertCorporateGiftingLead(input: CorporateGiftingLeadInput) {
  const now = new Date();
  await db.insert(corporateGiftingLeads).values({
    id: crypto.randomUUID(),
    companyName: input.companyName.trim(),
    contactName: input.contactName.trim(),
    email: clean(input.email)!.toLowerCase(),
    phone: input.phone.trim(),
    estimatedQuantity: input.estimatedQuantity ?? null,
    customizationDetails: clean(input.customizationDetails),
    status: "new",
    createdAt: now,
    updatedAt: now,
  });
}

export async function captureCorporateGiftingLead(input: CorporateGiftingLeadInput) {
  // Ensure table exists dynamically
  try {
    await ensureCorporateGiftingTable();
  } catch (err) {
    console.error("Failed to ensure corporate_gifting_leads table exists:", err);
  }

  // Insert the B2B lead
  await insertCorporateGiftingLead(input);
}