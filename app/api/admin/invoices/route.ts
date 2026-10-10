import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { desc, eq, and } from "drizzle-orm";
import { db } from "@/db";
import { savedInvoices } from "@/db/schema";
import { requireAdminToken } from "@/lib/admin-auth";
import { invoiceDocumentSchema } from "@/lib/invoice-document";

export async function GET(request: NextRequest) {
  const unauthorized = requireAdminToken(request); if (unauthorized) return unauthorized;
  try {
    const invoices = await db.select().from(savedInvoices).orderBy(desc(savedInvoices.updatedAt)).limit(500);
    return NextResponse.json({ invoices }, { headers: { "Cache-Control": "private, no-store" } });
  } catch { return NextResponse.json({ error: "Could not load saved invoices" }, { status: 500 }); }
}
const saveSchema = z.object({ id: z.string().uuid(), title: z.string().trim().min(1).max(255), document: invoiceDocumentSchema, expectedUpdatedAt: z.string().datetime().optional() }).strict();
export async function POST(request: NextRequest) {
  const unauthorized = requireAdminToken(request); if (unauthorized) return unauthorized;
  try {
    const input = saveSchema.parse(await request.json());
    const [existing] = await db.select().from(savedInvoices).where(eq(savedInvoices.id, input.id)).limit(1);
    if (existing) {
      if (!input.expectedUpdatedAt || existing.updatedAt.toISOString() !== input.expectedUpdatedAt) return NextResponse.json({ error: "This invoice was updated elsewhere. Reopen it before saving, or use Save as copy." }, { status: 409 });
      const [invoice] = await db.update(savedInvoices).set({ title: input.title, document: input.document, updatedAt: new Date() }).where(and(eq(savedInvoices.id, input.id), eq(savedInvoices.updatedAt, existing.updatedAt))).returning();
      if (!invoice) return NextResponse.json({ error: "Invoice changed while saving. Reopen it before updating." }, { status: 409 });
      return NextResponse.json({ invoice });
    }
    const [invoice] = await db.insert(savedInvoices).values({ id: input.id, title: input.title, document: input.document }).onConflictDoNothing().returning();
    if (!invoice) return NextResponse.json({ error: "Invoice already exists. Reopen it before saving." }, { status: 409 });
    return NextResponse.json({ invoice });
  } catch (error) {
    return NextResponse.json({ error: error instanceof z.ZodError ? error.issues.map(issue => `${issue.path.join(".")}: ${issue.message}`).join("; ") : "Could not save invoice. Your edits are still in the form." }, { status: error instanceof z.ZodError ? 400 : 500 });
  }
}
