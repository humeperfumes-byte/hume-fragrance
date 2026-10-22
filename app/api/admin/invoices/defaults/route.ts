import {NextRequest,NextResponse} from "next/server";
import {eq} from "drizzle-orm";
import {db} from "@/db";
import {invoiceReusableDefaults} from "@/db/schema";
import {requireAdminToken} from "@/lib/admin-auth";
export async function GET(request:NextRequest){const unauthorized=requireAdminToken(request);if(unauthorized)return unauthorized;try{const [row]=await db.select().from(invoiceReusableDefaults).where(eq(invoiceReusableDefaults.id,"business"));return NextResponse.json({defaults:row?.document||null},{headers:{"Cache-Control":"private, no-store"}});}catch{return NextResponse.json({error:"Could not load invoice defaults"},{status:503});}}
