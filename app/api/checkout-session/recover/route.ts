import { NextRequest } from "next/server";
import { recoverSecurePayment } from "@/lib/secure-checkout";
export const runtime = "nodejs";
export const POST = (request: NextRequest) => recoverSecurePayment(request);
