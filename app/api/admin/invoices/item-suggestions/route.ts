import {createHash} from 'node:crypto';
import {NextRequest,NextResponse} from 'next/server';
import {desc} from 'drizzle-orm';
import {z} from 'zod';
import {db} from '@/db';
import {invoiceItemSuggestions} from '@/db/schema';
import {requireAdminToken} from '@/lib/admin-auth';
import {customInvoiceSuggestionSchema,invoiceSuggestionKey,savedInvoiceSuggestion} from '@/lib/invoice-suggestions';
import {readBoundedJson} from '@/lib/bounded-request-body';

export async function GET(request:NextRequest){
 const unauthorized=requireAdminToken(request);if(unauthorized)return unauthorized;
 try{const rows=await db.select().from(invoiceItemSuggestions).orderBy(desc(invoiceItemSuggestions.updatedAt)).limit(1000);return NextResponse.json({suggestions:rows.map(savedInvoiceSuggestion).filter(Boolean)},{headers:{'Cache-Control':'private, no-store'}});}catch{return NextResponse.json({error:'Could not load saved item suggestions'},{status:503});}
}
export async function POST(request:NextRequest){
 const unauthorized=requireAdminToken(request);if(unauthorized)return unauthorized;
 try{const input=customInvoiceSuggestionSchema.parse(await readBoundedJson(request,8000));const id=createHash('sha256').update(invoiceSuggestionKey(input.name,input.unit)).digest('hex');const values={...input,id,price:input.price.toFixed(2),updatedAt:new Date()};const [row]=await db.insert(invoiceItemSuggestions).values(values).onConflictDoUpdate({target:invoiceItemSuggestions.id,set:{name:values.name,category:values.category,unit:values.unit,price:values.price,updatedAt:values.updatedAt}}).returning();return NextResponse.json({suggestion:savedInvoiceSuggestion(row)},{headers:{'Cache-Control':'private, no-store'}});}catch(error){return NextResponse.json({error:error instanceof z.ZodError?'Check the item name, price and unit':'Could not save this item to suggestions'},{status:error instanceof z.ZodError?400:503});}
}
