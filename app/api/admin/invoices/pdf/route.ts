import {NextRequest,NextResponse} from 'next/server';
import {requireAdminToken} from '@/lib/admin-auth';
import {invoiceDocumentSchema,invoiceFinancialFingerprint} from '@/lib/invoice-document';
import {renderInvoicePdf} from '@/lib/invoice-pdf';
import {invoiceFilename} from '@/lib/invoice-filename';
import {calculateInvoice} from '@/lib/invoice-calculations';
import {db} from '@/db';
import {issuedInvoices,savedInvoices} from '@/db/schema';
import {eq} from 'drizzle-orm';
import {z} from 'zod';
import {readBoundedJson} from '@/lib/bounded-request-body';
export const runtime='nodejs';
export const maxDuration=60;

export async function POST(request:NextRequest) {
 const unauthorized=requireAdminToken(request);if(unauthorized)return unauthorized;
 try {
  const input=z.object({id:z.string().uuid().optional(),document:invoiceDocumentSchema}).parse(await readBoundedJson(request,512000));
  let document=input.document;
  if(document.lifecycle==='issued') {
   if(!input.id)return NextResponse.json({error:'Reopen the issued invoice before export'},{status:400});
   const [saved]=await db.select({document:savedInvoices.document}).from(savedInvoices).innerJoin(issuedInvoices,eq(issuedInvoices.invoiceId,savedInvoices.id)).where(eq(savedInvoices.id,input.id)).limit(1);
   if(!saved)return NextResponse.json({error:'Issued invoice not found. Reopen it from Saved invoices.'},{status:404});
   if(invoiceFinancialFingerprint(saved.document)!==invoiceFinancialFingerprint(input.document))return NextResponse.json({error:'The saved invoice differs from this tab. Reopen it before downloading.'},{status:409});
   document=saved.document;
  }
  const errors=calculateInvoice(document).errors;
  if(errors.length)return NextResponse.json({error:errors.join(' ')},{status:400});
  const bytes=await renderInvoicePdf(document);
  if(bytes.subarray(0,5).toString()!=='%PDF-')throw new Error('Invalid PDF output');
  const name=invoiceFilename(document.buyerName,document.invoiceDate)+'.pdf';
  return new NextResponse(new Uint8Array(bytes),{headers:{'Content-Type':'application/pdf','Content-Disposition':`attachment; filename="invoice.pdf"; filename*=UTF-8''${encodeURIComponent(name)}`,'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
 }catch(error){
  if(error instanceof z.ZodError)return NextResponse.json({error:'Check invoice details: '+error.issues.map(issue=>issue.message).join('; ')},{status:400});
  console.error('Invoice PDF export failed',{type:error instanceof Error?error.name:'unknown'});
  return NextResponse.json({error:'PDF export could not finish. Your invoice is preserved. Please retry; if it is issued, reopen the saved copy first.'},{status:500});
 }
}
