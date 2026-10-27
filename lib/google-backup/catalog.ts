import postgres from 'postgres';
import {BACKUP_REGISTRY} from './registry';
import {BackupError,canonical,MAX_SOURCE_BYTES,type BackupTable,type RecordRow} from './format';
type Rule='scalar'|'strings'|{[key:string]:Rule}|Rule[];
const scalars=(keys:string)=>Object.fromEntries(keys.split(' ').map(key=>[key,'scalar'])) as Record<string,Rule>;
const selection=scalars('id name inspiration');
const cartItem:Rule={...scalars('id name image inspiration size quantity price isGift'),kitSelections:[selection],sampleSelections:[selection]};
const invoiceRule:Rule={...scalars('sellerName sellerAddress sellerEmail sellerPhone sellerGstin customerId buyerName buyerAddress buyerEmail buyerPhone buyerAlternativePhone buyerGstin separateShipping shippingName shippingAddress shippingPhone invoiceNumber invoiceDate paymentStatus showPaymentStatus targetGrandTotal lifecycle issuedAt priceMode taxMode sellerStateCode placeOfSupplyCode placeOfSupply shippingGstPercent amountReceived showPaymentAmounts shippingFee bankDetails terms notes'),items:[scalars('id name category unit hsnSac quantity price gstPercent')]};
const orderSpec=BACKUP_REGISTRY.find(t=>t.name==='orders')!;
const orderRule:Rule={...scalars(orderSpec.snapshotKeys.filter(k=>!['externalPaymentReceipt','cartSnapshot','giftItems'].includes(k)).join(' ')),externalPaymentReceipt:scalars('amountMinor method reference recordedAt'),cartSnapshot:[cartItem],giftItems:'strings'};
const rules:Record<string,Record<string,Rule>>={
 products:{images:'strings',seo_keywords:'strings',badges:scalars('bestSeller humeSpecial limitedStock soldOut comingSoon showInDiscoverySet recommendedSample'),notes:{top:'strings',heart:'strings',base:'strings'},longevity:{...scalars('duration sillage'),season:'strings',occasion:'strings'}},
 accessories:{images:'strings'},reviews:{images:'strings'},images:{tags:'strings'},blog_posts:{seo_keywords:'strings'},
 orders:{external_payment_receipt:scalars('amountMinor method reference recordedAt'),cart_snapshot:[cartItem],gift_items:'strings'},
 order_edit_audits:{before_snapshot:orderRule,after_snapshot:orderRule},
 checkout_drafts:{cart_snapshot:[cartItem],pricing_breakdown:scalars('subtotal shippingFee grandTotal overrideTotal appliedCouponCode welcomeBackPercent discountAmount codFee manualAdjustment')},
 saved_invoices:{document:invoiceRule},issued_invoices:{document:invoiceRule},invoice_revisions:{document:invoiceRule},invoice_reusable_defaults:{document:invoiceRule},
 invoice_item_suggestions:{details:scalars('gstPercent hsnSac priceMode taxMode')},
 invoice_corrections:{details:{source:invoiceRule,includeShipping:'scalar',lines:[scalars('itemId description quantity grossMinor taxableMinor cgstMinor sgstMinor igstMinor')]}},
};
export function sanitize(value:unknown,rule:Rule):unknown{
 if(value===null||value===undefined)return null;
 if(rule==='scalar')return value instanceof Date?value.toISOString():['string','number','boolean','bigint'].includes(typeof value)?typeof value==='bigint'?String(value):value:null;
 if(rule==='strings')return Array.isArray(value)?value.filter(v=>typeof v==='string'):[];
 if(Array.isArray(rule))return Array.isArray(value)?value.map(item=>sanitize(item,rule[0])):[];
 if(typeof value!=='object'||Array.isArray(value))return {};
 return Object.fromEntries(Object.entries(rule).filter(([key])=>key in value).map(([key,child])=>[key,sanitize((value as RecordRow)[key],child)]));
}
export function sanitizeRow(name:string,row:RecordRow,jsonColumns:readonly string[]):RecordRow{
 const spec=BACKUP_REGISTRY.find(table=>table.name===name);if(!spec)throw new BackupError('UNAPPROVED_FIELD');const out:RecordRow=Object.fromEntries(spec.columns.map(column=>[column,row[column]??null]));for(const column of jsonColumns){
  let rule=rules[name]?.[column];
  if(name==='site_settings')rule=row.key==='admin_controls'?scalars('behavioralIntelligenceEnabled announcementEnabled announcementText announcementLink heroOfferText freeDeliveryThreshold shippingChargeBelowThreshold giftOneThreshold giftTwoThreshold welcomeBackEnabled razorpayEnabled whatsappCheckoutEnabled whatsappNumber defaultAdminWindowHours'):{outOfStock:'scalar'};
  if(!rule)throw new BackupError('UNAPPROVED_FIELD');out[column]=sanitize(row[column],rule);
 }
 return out;
}
export async function readBusinessSnapshot():Promise<{tables:BackupTable[];snapshotAt:string}>{
 if(!process.env.DATABASE_URL)throw new BackupError('DATABASE_UNAVAILABLE');
 const client=postgres(process.env.DATABASE_URL,{max:1,prepare:false,connect_timeout:10,idle_timeout:2,onnotice:()=>{}});
 try{return await client.begin('isolation level repeatable read read only',async tx=>{
  await tx.unsafe("SET LOCAL statement_timeout = '20s'");
  const [time]=await tx.unsafe('SELECT now() as snapshot_at');const snapshotAt=new Date(time.snapshot_at).toISOString();
  const tables:BackupTable[]=[];let bytes=0;
  for(const spec of BACKUP_REGISTRY){const rows:RecordRow[]=[];let last:unknown=null;
   while(true){const filter=spec.name==='site_settings'?"key IN ('admin_controls','kit_availability')":'true';
    const result=await tx.unsafe(`SELECT ${spec.columns.map(c=>'"'+c+'"').join(',')} FROM public."${spec.name}" WHERE ${filter} ${last===null?'':`AND "${spec.key}" > $1`} ORDER BY "${spec.key}" LIMIT 500`,last===null?[]:[last as string]);
    for(const row of result){const safe=sanitizeRow(spec.name,row,spec.json);bytes+=Buffer.byteLength(canonical(safe));if(bytes>MAX_SOURCE_BYTES)throw new BackupError('BACKUP_TOO_LARGE');rows.push(safe);}
    if(result.length<500)break;last=result[result.length-1][spec.key];
   }
   tables.push({name:spec.name,columns:[...spec.columns],rows});
  }
  const accountRows:RecordRow[]=[];
  for await(const batch of tx.unsafe(`SELECT identity_type,identifier,email,phone,min(created_at) as first_seen,max(last_used_at) as last_seen FROM public.customer_account_sessions GROUP BY identity_type,identifier,email,phone ORDER BY identity_type,identifier,email,phone`).cursor(500)){
   for(const row of batch){bytes+=Buffer.byteLength(canonical(row));if(bytes>MAX_SOURCE_BYTES)throw new BackupError('BACKUP_TOO_LARGE');accountRows.push({...row});}
  }
  tables.push({name:'Account Contacts',columns:['identity_type','identifier','email','phone','first_seen','last_seen'],rows:accountRows});
  const contacts:RecordRow[]=[];
  const contactSources=['orders','checkout_drafts','invoice_customers','corporate_gifting_leads','stock_notify_requests'];
  for(const table of tables.filter(t=>contactSources.includes(t.name)))for(const row of table.rows){contacts.push({source_table:table.name,source_id:row.id,name:row.full_name??row.name??row.contact_name??null,email:row.email??null,phone:row.phone??null,alternative_phone:row.alternate_phone??null,address:row.address??row.address_line_1??null,address_line_2:row.address_line_2??null,city:row.city??null,state:row.state??null,pincode:row.pincode??null});}
  tables.push({name:'Customer Contacts',columns:['source_table','source_id','name','email','phone','alternative_phone','address','address_line_2','city','state','pincode'],rows:contacts});
  return {tables,snapshotAt};
 });}finally{await client.end();}
}
