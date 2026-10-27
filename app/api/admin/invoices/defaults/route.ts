import {invoiceDefaultsSchema} from "@/lib/invoice-workflow";
import {NextRequest,NextResponse} from "next/server";
import {eq} from "drizzle-orm";
import {db} from "@/db";
import {invoiceReusableDefaults} from "@/db/schema";
import {requireAdminToken} from "@/lib/admin-auth";
export async function GET(request:NextRequest){const unauthorized=requireAdminToken(request);if(unauthorized)return unauthorized;try{const [row]=await db.select().from(invoiceReusableDefaults).where(eq(invoiceReusableDefaults.id,"business"));return NextResponse.json({defaults:row?.document||null},{headers:{"Cache-Control":"private, no-store"}});}catch{return NextResponse.json({error:"Could not load invoice defaults"},{status:503});}}

export async function POST(request:NextRequest){
 const unauthorized=requireAdminToken(request);if(unauthorized)return unauthorized;
 try{
  const parsed=invoiceDefaultsSchema.safeParse(await request.json());
  if(!parsed.success)return NextResponse.json({error:'Check your seller and tax settings.'},{status:400});
  await db.insert(invoiceReusableDefaults).values({id:'business',document:parsed.data,updatedAt:new Date()}).onConflictDoUpdate({target:invoiceReusableDefaults.id,set:{document:parsed.data,updatedAt:new Date()}});
  return NextResponse.json({defaults:parsed.data});
 }catch{return NextResponse.json({error:'Could not remember settings. Please retry.'},{status:503});}
}
