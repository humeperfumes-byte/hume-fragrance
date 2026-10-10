import { NextRequest } from "next/server";
import { startSecureCheckout, saveSecureDraft } from "@/lib/secure-checkout";
export const runtime = "nodejs";
export const POST = (request: NextRequest) => startSecureCheckout(request);
export const PATCH = (request: NextRequest) => saveSecureDraft(request);
