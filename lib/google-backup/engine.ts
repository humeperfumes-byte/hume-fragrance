import {BackupError,makeWorkbook} from './format';
import {readBusinessSnapshot} from './catalog';import {GoogleClient,refresh} from './google';
import {assertLease,connection,completeRun,updateRun,type Connection} from './store';
export async function executeBackup(id:string,conn:Connection){
 let google:GoogleClient|undefined,fileId:string|undefined;
 const name=`HUME Backup - ${new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(new Date()).replace(/[:/]/g,'-')} IST - ${id.slice(0,8)}`;
 try{
  const current=await connection();if(!current?.connected||current.googleSub!==conn.googleSub)throw new BackupError('RECONNECT_GOOGLE');
  await assertLease(id);google=new GoogleClient(await refresh(conn.refreshCiphertext));await google.checkPrivate(conn.folderId);
  const {tables,snapshotAt}=await readBusinessSnapshot();const workbook=makeWorkbook(tables,id,snapshotAt);
  await assertLease(id);fileId=await google.createSpreadsheet(conn.folderId,id,name);await updateRun(id,{spreadsheetId:fileId,spreadsheetUrl:`https://docs.google.com/spreadsheets/d/${fileId}/edit`});
  await google.writeAndVerify(fileId,workbook);await assertLease(id);await google.rename(fileId,name);
  await completeRun(id,conn,{recordCount:Object.values(workbook.counts).reduce((a,b)=>a+b,0),sourceBytes:workbook.bytes,cells:workbook.cells,tableCounts:workbook.counts});
 }catch(error){const code=error instanceof BackupError?error.code:'BACKUP_FAILED';if(fileId&&google)await google.rename(fileId,'FAILED - '+name).catch(()=>{});await updateRun(id,{status:'failed',completedAt:new Date(),errorCode:code});}
}
