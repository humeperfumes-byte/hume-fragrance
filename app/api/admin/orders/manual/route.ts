import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { requireAdminToken } from "@/lib/admin-auth";
import { createManualOrder, ensureManualPaymentLink, ManualOrderError } from "@/lib/manual-order-payment";
export async function POST(request: NextRequest) {
  const unauthorized = requireAdminToken(request); if (unauthorized) return unauthorized;
  try {
    const order = await createManualOrder(await request.json());
    try { return NextResponse.json({ ok: true, ...await ensureManualPaymentLink(order.id) }); }
    catch (error) { return NextResponse.json({ ok: true, order, linkError: error instanceof ManualOrderError ? error.message : "Order saved, but the payment link could not be confirmed. Use Generate / recover link on this order." }); }
  } catch (error) {
    return NextResponse.json({ error: error instanceof ZodError ? error.issues.map(issue => `${issue.path.join(".")}: ${issue.message}`).join("; ") : error instanceof ManualOrderError ? error.message : "Could not create order. Retry the same request." }, { status: error instanceof ZodError || error instanceof ManualOrderError ? 400 : 500 });
  }
}
