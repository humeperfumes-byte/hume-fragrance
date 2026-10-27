import {createHash} from 'node:crypto';
export type RecordRow=Record<string,unknown>;
export type BackupTable={name:string;rows:RecordRow[];columns:string[]};
export type BackupTab={title:string;values:(string|number|boolean)[][]};
export const tabWidth=(tab:BackupTab)=>tab.values.reduce((max,row)=>Math.max(max,row.length),1);
export const FORMAT_VERSION=1,MAX_SOURCE_BYTES=50*1024*1024,MAX_CELLS=8_000_000;
export class BackupError extends Error {constructor(public code:string){super(code);}}
export const hash=(value:string)=>createHash('sha256').update(value).digest('hex');
export function canonical(value:unknown):string {
 const clean=(v:unknown):unknown=>v instanceof Date?v.toISOString():typeof v==='bigint'?v.toString():Array.isArray(v)?v.map(clean):v&&typeof v==='object'?Object.fromEntries(Object.entries(v).sort(([a],[b])=>a.localeCompare(b)).map(([k,item])=>[k,clean(item)])):v;
 return JSON.stringify(clean(value));
}
export function splitUnicode(value:string,size=20_000):string[]{
 if(!Number.isInteger(size)||size<2)throw new BackupError('BACKUP_FAILED');const parts:string[]=[];let start=0;
 while(start<value.length){let end=Math.min(start+size,value.length);const code=value.charCodeAt(end-1);if(end<value.length&&code>=0xD800&&code<=0xDBFF)end--;parts.push(value.slice(start,end));start=end;}
 return parts.length?parts:[''];
}
export type Workbook={tabs:BackupTab[];bytes:number;cells:number;counts:Record<string,number>;digests:Record<string,string>};
export function makeWorkbook(tables:BackupTable[],runId:string,snapshotAt:string):Workbook{
 const chunks:BackupTab={title:'Data Chunks',values:[['Reference','Table','Source row','Field','Part','Parts','SHA256','Data','Encoding']]};
 const tabs:BackupTab[]=[],counts:Record<string,number>={},digests:Record<string,string>={};let bytes=0;
 for(const table of tables){
  const values:BackupTab['values']=[[...table.columns,'__row_json']];
  table.rows.forEach((row,index)=>{
   const original=canonical(row);bytes+=Buffer.byteLength(original,'utf8');if(bytes>MAX_SOURCE_BYTES)throw new BackupError('BACKUP_TOO_LARGE');
   const chunk=(text:string,field:string,encoding="text")=>{
    if(text.length<=20_000)return text;
    const ref=hash(`${runId}:${table.name}:${index}:${field}`),parts=splitUnicode(text),digest=hash(text);
    parts.forEach((data,i)=>chunks.values.push([ref,table.name,String(index+1),field,i+1,parts.length,digest,data,encoding]));return `@chunk:${ref}`;
   };
   const encoded:RecordRow={};
   const display=table.columns.map(column=>{const v=row[column];const text=v===null||v===undefined?'':v instanceof Date?v.toISOString():typeof v==='object'?canonical(v):String(v);const encoding=typeof v==='object'&&v!==null?'json':'text';const compact=chunk(text,column,encoding);encoded[column]=compact!==text?{__hume_chunk:compact.slice(7),__hume_encoding:encoding}:v??null;return compact;});
   const payload=canonical(encoded);values.push([...display,chunk(payload,'__row_json')]);
  });
  counts[table.name]=table.rows.length;digests[table.name]=hash(canonical(table.rows));
  tabs.push({title:table.name,values});
 }
 tabs.push(chunks);
 const summary:BackupTab={title:'Backup Summary',values:[['HUME business backup','IN PROGRESS'],['Format version',FORMAT_VERSION],['Run ID',runId],['Snapshot UTC',snapshotAt],['Schedule','Sunday around 3:30 AM IST'],['Direction','One-way backup; spreadsheet edits never update the website'],['Excluded','Credentials, OTPs, login/access tokens, raw payment webhooks, browsing logs, IP addresses, user agents'],['Large values','@chunk references resolve through Data Chunks; __row_json preserves exact approved values'],['Table','Records','SHA256'],...Object.entries(counts).map(([name,count])=>[name,count,digests[name]])]};
 const all=[summary,...tabs];const cells=all.reduce((sum,t)=>sum+t.values.length*tabWidth(t),0);if(cells>MAX_CELLS)throw new BackupError('BACKUP_TOO_LARGE');
 return {tabs:all,bytes,cells,counts,digests};
}
export function verifyWorkbook(actual:BackupTab[],source:Workbook):void{
 const map=new Map(actual.map(tab=>[tab.title,tab.values]));const chunkRows=map.get('Data Chunks')?.slice(1)||[];
 const groups=new Map<string,typeof chunkRows>();for(const row of chunkRows){const key=String(row[0]);groups.set(key,[...(groups.get(key)||[]),row]);}
 const expand=(ref:string)=>{const parts=(groups.get(ref)||[]).sort((a,b)=>Number(a[4])-Number(b[4]));if(!parts.length||parts.length!==Number(parts[0][5])||parts.some((p,i)=>Number(p[4])!==i+1))throw new BackupError('VERIFICATION_FAILED');const text=parts.map(p=>String(p[7])).join('');if(hash(text)!==parts[0][6])throw new BackupError('VERIFICATION_FAILED');return text;};
 for(const [name,count] of Object.entries(source.counts)){
  const rows=map.get(name),expected=source.tabs.find(tab=>tab.title===name)!;if(!rows||rows.length!==count+1||canonical(rows)!==canonical(expected.values))throw new BackupError('VERIFICATION_FAILED');
  const column=rows[0].length-1;
  const decoded=rows.slice(1).map(row=>{let text=String(row[column]??'');if(text.startsWith('@chunk:'))text=expand(text.slice(7));const record=JSON.parse(text) as RecordRow;for(const [key,v] of Object.entries(record)){if(v&&typeof v==='object'&&!Array.isArray(v)&&'__hume_chunk' in v){const raw=expand(String(v.__hume_chunk));record[key]='__hume_encoding' in v&&v.__hume_encoding==='json'?JSON.parse(raw):raw;}}return record;});
  if(hash(canonical(decoded))!==source.digests[name])throw new BackupError('VERIFICATION_FAILED');
 }
 if(canonical(map.get('Data Chunks'))!==canonical(source.tabs.find(t=>t.title==='Data Chunks')!.values))throw new BackupError('VERIFICATION_FAILED');
}
export function valueBatches(tabs:BackupTab[],maxBytes=1_400_000){
 const batches:{range:string;values:BackupTab['values']}[][]=[];let batch:{range:string;values:BackupTab['values']}[]=[],bytes=0;
 for(const tab of tabs)for(let i=0;i<tab.values.length;i++){
  const range=`'${tab.title.replaceAll("'","''")}'!A${i+1}`;const entry={range,values:[tab.values[i]]};const size=Buffer.byteLength(JSON.stringify(entry),'utf8');if(size>maxBytes)throw new BackupError('BACKUP_TOO_LARGE');if(bytes+size>maxBytes&&batch.length){batches.push(batch);batch=[];bytes=0;}batch.push(entry);bytes+=size;
 }
 if(batch.length)batches.push(batch);return batches;
}
