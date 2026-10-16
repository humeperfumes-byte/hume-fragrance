import {randomUUID} from 'node:crypto';
import {NextRequest,NextResponse} from 'next/server';
import {z} from 'zod';
import {and,desc,eq,sql} from 'drizzle-orm';
import {db} from '@/db';
import {savedInvoices,invoiceCounters,issuedInvoices,invoiceRevisions} from '@/db/schema';
import {requireAdminToken} from '@/lib/admin-auth';
import {invoiceDocumentSchema,invoiceFinancialFingerprint} from '@/lib/invoice-document';
import {calculateInvoice,financialYear,issuedNumber,validateForIssue} from '@/lib/invoice-calculations';
import {readBoundedJson} from '@/lib/bounded-request-body';
class InvoiceError extends Error {constructor(message:string,public status=409){super(message);}}
export async function GET(request:NextRequest){const unauthorized=requireAdminToken(request);if(unauthorized)return unauthorized;try{const id=request.nextUrl.searchParams.get('id');if(id){const history=await db.select().from(invoiceRevisions).where(eq(invoiceRevisions.invoiceId,id)).orderBy(desc(invoiceRevisions.createdAt)).limit(200);return NextResponse.json({history},{headers:{'Cache-Control':'private, no-store'}});}const invoices=await db.select().from(savedInvoices).orderBy(desc(savedInvoices.updatedAt)).limit(500);return NextResponse.json({invoices},{headers:{'Cache-Control':'private, no-store'}});}catch{return NextResponse.json({error:'Could not load invoice register or history'},{status:503});}}
const saveSchema=z.object({id:z.string().uuid(),title:z.string().trim().min(1).max(255),document:invoiceDocumentSchema,expectedUpdatedAt:z.string().datetime().optional(),action:z.enum(['save','issue']).default('save')}).strict();
export async function POST(request:NextRequest){const unauthorized=requireAdminToken(request);if(unauthorized)return unauthorized;try{
  const input=saveSchema.parse(await readBoundedJson(request,512000));
  const errors=calculateInvoice(input.document).errors;if(errors.length)throw new InvoiceError(errors.join(' '),400);
  const invoice=await db.transaction(async tx=>{
    await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${input.id}))`);
    const [existing]=await tx.select().from(savedInvoices).where(eq(savedInvoices.id,input.id)).limit(1);
    const [issued]=await tx.select().from(issuedInvoices).where(eq(issuedInvoices.invoiceId,input.id)).limit(1);
    if(existing&&existing.title===input.title&&JSON.stringify(existing.document)===JSON.stringify(input.document)&&input.action==='save')return existing;
    if(existing&&(!input.expectedUpdatedAt||existing.updatedAt.toISOString()!==input.expectedUpdatedAt))throw new InvoiceError('This invoice changed elsewhere. Reopen it before saving.');
    let document={...input.document};let action='saved';
    if(issued){
      if(input.action==='issue')throw new InvoiceError('This invoice is already issued. Reopen it to see the assigned number.');
      if(invoiceFinancialFingerprint(existing!.document)!==invoiceFinancialFingerprint(document))throw new InvoiceError('Issued invoice details are locked. Use a new document or an accountant-approved credit/debit note for corrections.');
      action='payment_recorded';
    }else if(input.action==='issue'){
      const issues=validateForIssue(document);if(issues.length)throw new InvoiceError(issues.join(' '),400);
      const year=financialYear(document.invoiceDate);await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${`invoice-sequence-${year}`}))`);
      const [counter]=await tx.insert(invoiceCounters).values({financialYear:year,lastNumber:1}).onConflictDoUpdate({target:invoiceCounters.financialYear,set:{lastNumber:sql`${invoiceCounters.lastNumber}+1`}}).returning();
      document={...document,invoiceNumber:issuedNumber(year,counter.lastNumber),lifecycle:'issued',issuedAt:new Date().toISOString()};action='issued';
    }else{document={...document,lifecycle:'draft',issuedAt:undefined};}
    if(document.showPaymentAmounts){const totals=calculateInvoice(document);document.paymentStatus=totals.balanceDue===0?'Paid':totals.amountReceived>0?'Partially Paid':'Unpaid';}
    if(existing){const [prior]=await tx.select({id:invoiceRevisions.id}).from(invoiceRevisions).where(eq(invoiceRevisions.invoiceId,input.id)).limit(1);if(!prior)await tx.insert(invoiceRevisions).values({id:randomUUID(),invoiceId:existing.id,action:"legacy_snapshot",title:existing.title,document:existing.document,createdAt:existing.updatedAt});}
    const now=new Date();
    const [saved]=existing?await tx.update(savedInvoices).set({title:input.title,document,updatedAt:now}).where(and(eq(savedInvoices.id,input.id),eq(savedInvoices.updatedAt,existing.updatedAt))).returning():await tx.insert(savedInvoices).values({id:input.id,title:input.title,document,createdAt:now,updatedAt:now}).returning();
    if(!saved)throw new InvoiceError('Invoice changed while saving. Reopen it.');
    if(action==='issued')await tx.insert(issuedInvoices).values({invoiceId:saved.id,financialYear:financialYear(document.invoiceDate),invoiceNumber:document.invoiceNumber,document,issuedAt:now});
    await tx.insert(invoiceRevisions).values({id:randomUUID(),invoiceId:saved.id,action,title:saved.title,document:saved.document,createdAt:now});
    return saved;
  });return NextResponse.json({invoice});
}catch(error){return NextResponse.json({error:error instanceof InvoiceError?error.message:error instanceof z.ZodError?error.issues.map(issue=>`${issue.path.join('.')}: ${issue.message}`).join('; '):'Could not save invoice. Your edits are still in the form.'},{status:error instanceof InvoiceError?error.status:error instanceof z.ZodError?400:500});}}
