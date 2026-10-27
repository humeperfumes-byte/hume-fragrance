import {createCipheriv,createDecipheriv,randomBytes} from 'node:crypto';
import {BackupError,type BackupTab,type Workbook,valueBatches,verifyWorkbook,tabWidth} from './format';
const DRIVE='https://www.googleapis.com/drive/v3',SHEETS='https://sheets.googleapis.com/v4/spreadsheets';
export const REQUIRED_SCOPE='https://www.googleapis.com/auth/drive.file';
function key(){const value=Buffer.from(process.env.GOOGLE_BACKUP_ENCRYPTION_KEY||'','base64');if(value.length!==32)throw new BackupError('SETUP_REQUIRED');return value;}
export function configured(){try{key();return Boolean(process.env.GOOGLE_BACKUP_CLIENT_ID&&process.env.GOOGLE_BACKUP_CLIENT_SECRET&&process.env.GOOGLE_BACKUP_REDIRECT_URI);}catch{return false;}}
export function encrypt(text:string){const iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',key(),iv);const data=Buffer.concat([cipher.update(text,'utf8'),cipher.final()]);return Buffer.concat([iv,cipher.getAuthTag(),data]).toString('base64');}
export function decrypt(text:string){try{const bytes=Buffer.from(text,'base64'),decipher=createDecipheriv('aes-256-gcm',key(),bytes.subarray(0,12));decipher.setAuthTag(bytes.subarray(12,28));return Buffer.concat([decipher.update(bytes.subarray(28)),decipher.final()]).toString('utf8');}catch{throw new BackupError('RECONNECT_GOOGLE');}}
async function oauth(body:Record<string,string>){
 const response=await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({...body,client_id:process.env.GOOGLE_BACKUP_CLIENT_ID||'',client_secret:process.env.GOOGLE_BACKUP_CLIENT_SECRET||''}),cache:'no-store',signal:AbortSignal.timeout(15000)});
 if(!response.ok)throw new BackupError('RECONNECT_GOOGLE');return await response.json() as {access_token:string;refresh_token?:string;scope?:string};
}
export async function exchangeCode(code:string,verifier:string){const tokens=await oauth({grant_type:'authorization_code',code,code_verifier:verifier,redirect_uri:process.env.GOOGLE_BACKUP_REDIRECT_URI||''});if(!tokens.refresh_token||!tokens.scope?.split(' ').includes(REQUIRED_SCOPE))throw new BackupError('RECONNECT_GOOGLE');return tokens;}
export async function refresh(ciphertext:string){const tokens=await oauth({grant_type:'refresh_token',refresh_token:decrypt(ciphertext)});if(!tokens.access_token)throw new BackupError('RECONNECT_GOOGLE');return tokens.access_token;}
export async function revoke(ciphertext:string){const response=await fetch('https://oauth2.googleapis.com/revoke',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({token:decrypt(ciphertext)}),signal:AbortSignal.timeout(10000)});if(!response.ok)throw new BackupError('GOOGLE_UNAVAILABLE');}
export class GoogleClient{
 private lastRequest=0;
 constructor(private token:string,private deadline=Date.now()+240_000,private minimumInterval=1050){}
 async request<T>(url:string,options:RequestInit={},retry=true):Promise<T>{
  for(let attempt=0;attempt<5;attempt++){
   if(Date.now()>this.deadline)throw new BackupError('BACKUP_TIMEOUT');
   const delay=Math.max(0,this.minimumInterval-(Date.now()-this.lastRequest));if(delay)await new Promise(r=>setTimeout(r,delay));this.lastRequest=Date.now();
   let response:Response;
   try{response=await fetch(url,{...options,headers:{'Content-Type':'application/json',...options.headers,Authorization:`Bearer ${this.token}`},cache:'no-store',signal:AbortSignal.timeout(Math.min(20000,Math.max(1000,this.deadline-Date.now())))});}catch{if(!retry||attempt===4)throw new BackupError('GOOGLE_UNAVAILABLE');await new Promise(r=>setTimeout(r,1000*2**attempt));continue;}
   if(response.ok)return response.status===204?undefined as T:await response.json() as T;
   if(response.status===401)throw new BackupError('RECONNECT_GOOGLE');
   if(response.status===403||response.status===404)throw new BackupError('GOOGLE_ACCESS_OR_STORAGE');
   if(!retry||![429,500,502,503,504].includes(response.status)||attempt===4)throw new BackupError('GOOGLE_UNAVAILABLE');
   await response.body?.cancel();await new Promise(r=>setTimeout(r,Math.min(16000,1000*2**attempt)+Math.random()*250));
  }
  throw new BackupError('GOOGLE_UNAVAILABLE');
 }
 async identity(){return this.request<{sub:string;email:string;email_verified:boolean}>('https://openidconnect.googleapis.com/v1/userinfo');}
 async createFolder(){return this.request<{id:string}>(DRIVE+'/files?fields=id',{method:'POST',body:JSON.stringify({name:'HUME Database Backups',mimeType:'application/vnd.google-apps.folder'})},false);}
 async checkPrivate(folderId:string){
  const folder=await this.request<{trashed?:boolean;ownedByMe?:boolean}>(`${DRIVE}/files/${encodeURIComponent(folderId)}?fields=trashed,ownedByMe`);
  const data=await this.request<{permissions?:{role:string;type:string}[];nextPageToken?:string}>(`${DRIVE}/files/${encodeURIComponent(folderId)}/permissions?fields=permissions(role,type),nextPageToken&pageSize=100`);
  if(folder.trashed||!folder.ownedByMe||data.nextPageToken||data.permissions?.some(p=>p.role!=='owner'))throw new BackupError('FOLDER_NOT_PRIVATE');
 }
 async createSpreadsheet(folderId:string,runId:string,name:string){
  await this.checkPrivate(folderId);
  const existing=await this.request<{files:{id:string}[]}>(DRIVE+'/files?fields=files(id)&q='+encodeURIComponent(`trashed = false and '${folderId}' in parents and appProperties has { key='humeBackupRun' and value='${runId}' }`));
  if(existing.files.length)return existing.files[0].id;
  // Do not automatically retry creation after an ambiguous network failure.
  return (await this.request<{id:string}>(DRIVE+'/files?fields=id',{method:'POST',body:JSON.stringify({name:'IN PROGRESS - '+name,mimeType:'application/vnd.google-apps.spreadsheet',parents:[folderId],appProperties:{humeBackupRun:runId}})},false)).id;
 }
 async rename(id:string,name:string){await this.request(`${DRIVE}/files/${id}?fields=id`,{method:'PATCH',body:JSON.stringify({name})});}
 async writeAndVerify(id:string,workbook:Workbook){
  const existing=await this.request<{sheets?:{properties:{sheetId:number}}[]}>(`${SHEETS}/${id}?fields=sheets.properties.sheetId`);
  const add=workbook.tabs.map((tab,index)=>({addSheet:{properties:{sheetId:index+100,title:tab.title,gridProperties:{rowCount:Math.max(1,tab.values.length),columnCount:tabWidth(tab),frozenRowCount:1}}}}));
  const requests:unknown[]=[...add,...(existing.sheets||[]).map(s=>({deleteSheet:{sheetId:s.properties.sheetId}}))];
  workbook.tabs.forEach((tab,index)=>{requests.push({repeatCell:{range:{sheetId:index+100,startRowIndex:0,endRowIndex:tab.values.length},cell:{userEnteredFormat:{numberFormat:{type:'TEXT'},verticalAlignment:'TOP'}},fields:'userEnteredFormat'}},{repeatCell:{range:{sheetId:index+100,startRowIndex:0,endRowIndex:1},cell:{userEnteredFormat:{textFormat:{bold:true},backgroundColor:{red:.85,green:.9,blue:.96}}},fields:'userEnteredFormat'}});if(tab.title!=='Backup Summary')requests.push({setBasicFilter:{filter:{range:{sheetId:index+100,startRowIndex:0,endRowIndex:tab.values.length,startColumnIndex:0,endColumnIndex:tab.values[0].length}}}});});
  await this.request(`${SHEETS}/${id}:batchUpdate`,{method:'POST',body:JSON.stringify({requests})},false);
  const batches=valueBatches(workbook.tabs);for(const data of batches)await this.request(`${SHEETS}/${id}/values:batchUpdate`,{method:'POST',body:JSON.stringify({valueInputOption:'RAW',data})});
  const actual:BackupTab[]=workbook.tabs.map(tab=>({title:tab.title,values:[]}));
  // Re-read the exact same bounded ranges; verification causes no extra database reads.
  for(const data of batches){
   // Limit URL length by reading request ranges in groups rather than a multi-megabyte URL.
   const entries=data;for(let start=0;start<entries.length;start+=80){const part=entries.slice(start,start+80);const params=new URLSearchParams({valueRenderOption:'UNFORMATTED_VALUE'});for(const entry of part){const row=entry.range.match(/\d+$/)![0];let col='',n=entry.values[0].length;while(n>0){n--;col=String.fromCharCode(65+n%26)+col;n=Math.floor(n/26);}params.append('ranges',entry.range+':'+col+row);}
    const response=await this.request<{valueRanges:{values?:BackupTab['values']}[]}>(`${SHEETS}/${id}/values:batchGet?${params}`);
    if(response.valueRanges.length!==part.length)throw new BackupError('VERIFICATION_FAILED');
    part.forEach((entry,i)=>{const title=entry.range.slice(1,entry.range.indexOf("'!")),row=Number(entry.range.match(/\d+$/)![0])-1;actual.find(tab=>tab.title===title)!.values[row]=response.valueRanges[i].values?.[0]||[];});
   }
  }
  verifyWorkbook(actual,workbook);
  await this.request(`${SHEETS}/${id}/values/'Backup%20Summary'!B1?valueInputOption=RAW`,{method:'PUT',body:JSON.stringify({values:[['VERIFIED COMPLETE']]})});
 }
}
