import { NextRequest, NextResponse } from "next/server";
import { requireAdminToken } from "@/lib/admin-auth";
import { ensureManualPaymentLink, ManualOrderError } from "@/lib/manual-order-payment";
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = requireAdminToken(request); if (unauthorized) return unauthorized;
  try { return NextResponse.json({ ok: true, ...await ensureManualPaymentLink((await params).id) }); }
  catch (error) { return NextResponse.json({ error: error instanceof ManualOrderError ? error.message : "Could not recover payment link. Retry this order." }, { status: 400 }); }
}
