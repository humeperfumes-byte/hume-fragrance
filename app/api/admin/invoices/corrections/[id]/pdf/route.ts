import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { invoiceCorrections } from "@/db/schema";
import { requireAdminToken } from "@/lib/admin-auth";
import { correctionRecord } from "@/lib/invoice-management-store";
import { renderCorrectionPdf } from "@/lib/correction-pdf";

export const runtime="nodejs";
export async function GET(request:NextRequest,context:{params:Promise<{id:string}>}) {
  const unauthorized=requireAdminToken(request);if(unauthorized)return unauthorized;
  try{
    const id=z.string().uuid().parse((await context.params).id);
    const [row]=await db.select().from(invoiceCorrections).where(eq(invoiceCorrections.id,id));
    if(!row)return NextResponse.json({error:"Correction not found"},{status:404});
    const buffer=await renderCorrectionPdf(correctionRecord(row));
    return new NextResponse(new Uint8Array(buffer),{headers:{"Content-Type":"application/pdf","Content-Disposition":`attachment; filename="${row.number.replace(/\//g,"-")}.pdf"`,"Cache-Control":"private, no-store"}});
  }catch(error){return NextResponse.json({error:error instanceof z.ZodError?"Invalid correction ID":"Could not generate correction PDF"},{status:error instanceof z.ZodError?400:503});}
}
