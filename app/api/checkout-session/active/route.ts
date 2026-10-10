import type { NextRequest } from "next/server";
import { activeSecureCheckout } from "@/lib/secure-checkout";
export const runtime = "nodejs";
export const GET = (request: NextRequest) => activeSecureCheckout(request);
