import {randomUUID} from 'node:crypto';
import {and,desc,eq,lt,sql} from 'drizzle-orm';
import {db} from '@/db';import {googleBackupConnections as connections,googleBackupRuns as runs} from '@/db/schema';
import {BackupError} from './format';
export type Connection=typeof connections.$inferSelect;
export const connection=async()=> (await db.select().from(connections).where(eq(connections.id,'business')).limit(1))[0]??null;
export async function saveConnection(values:Pick<Connection,'googleSub'|'accountEmail'|'folderId'|'refreshCiphertext'>){await db.transaction(async tx=>{await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext('hume-google-backups'))`);if((await tx.select({id:runs.id}).from(runs).where(and(eq(runs.status,'running'),sql`${runs.leaseUntil}>now()`)).limit(1)).length)throw new BackupError('BACKUP_ALREADY_RUNNING_OR_DONE');await tx.insert(connections).values({id:'business',...values}).onConflictDoUpdate({target:connections.id,set:{...values,connected:true,weeklyEnabled:false,verifiedAt:null,updatedAt:new Date()}});});}
export async function expireStale(){await db.update(runs).set({status:'failed',completedAt:new Date(),errorCode:'BACKUP_INTERRUPTED'}).where(and(eq(runs.status,'running'),lt(runs.leaseUntil,new Date())));}
export async function acquireRun(conn:Connection,trigger:'manual'|'scheduled',scheduledFor:Date|null){
 return db.transaction(async tx=>{
  await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext('hume-google-backups'))`);
  await tx.update(runs).set({status:'failed',completedAt:new Date(),errorCode:'BACKUP_INTERRUPTED'}).where(and(eq(runs.status,'running'),lt(runs.leaseUntil,new Date())));
  const [current]=await tx.select().from(connections).where(eq(connections.id,'business')).limit(1);
  if(!current?.connected||current.googleSub!==conn.googleSub||trigger==='scheduled'&&!current.weeklyEnabled)throw new BackupError('RECONNECT_GOOGLE');
  const rows=await tx.insert(runs).values({id:randomUUID(),googleSub:conn.googleSub,trigger,scheduledFor,status:'running',leaseUntil:new Date(Date.now()+10*60_000)}).onConflictDoNothing().returning();
  if(!rows.length)throw new BackupError('BACKUP_ALREADY_RUNNING_OR_DONE');return rows[0];
 });
}
export async function runHistory(before?:Date){await expireStale();return db.select().from(runs).where(before?lt(runs.startedAt,before):undefined).orderBy(desc(runs.startedAt),desc(runs.id)).limit(21);}
export async function latest(conn:Connection){const latestSuccess=(await db.select().from(runs).where(and(eq(runs.googleSub,conn.googleSub),eq(runs.status,'succeeded'))).orderBy(desc(runs.startedAt)).limit(1))[0]??null;const latestScheduled=(await db.select().from(runs).where(and(eq(runs.googleSub,conn.googleSub),eq(runs.status,'succeeded'),eq(runs.trigger,'scheduled'))).orderBy(desc(runs.scheduledFor)).limit(1))[0]??null;return {latestSuccess,latestScheduled};}
export async function running(){await expireStale();return (await db.select({id:runs.id}).from(runs).where(eq(runs.status,'running')).limit(1))[0]??null;}
export async function updateRun(id:string,values:Partial<typeof runs.$inferInsert>){await db.update(runs).set(values).where(and(eq(runs.id,id),eq(runs.status,'running')));}
export async function completeRun(id:string,conn:Connection,values:Partial<typeof runs.$inferInsert>){await db.transaction(async tx=>{const changed=await tx.update(runs).set({...values,status:'succeeded',completedAt:new Date()}).where(and(eq(runs.id,id),eq(runs.status,'running'))).returning({id:runs.id});if(!changed.length)throw new BackupError('BACKUP_INTERRUPTED');await tx.update(connections).set({weeklyEnabled:true,verifiedAt:new Date(),updatedAt:new Date()}).where(and(eq(connections.id,'business'),eq(connections.googleSub,conn.googleSub),eq(connections.connected,true)));});}
export async function disconnectConnection(){return db.transaction(async tx=>{await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext('hume-google-backups'))`);if((await tx.select({id:runs.id}).from(runs).where(and(eq(runs.status,'running'),sql`${runs.leaseUntil}>now()`)).limit(1)).length)throw new BackupError('BACKUP_ALREADY_RUNNING_OR_DONE');const [previous]=await tx.select().from(connections).where(eq(connections.id,'business')).limit(1);await tx.update(connections).set({connected:false,weeklyEnabled:false,refreshCiphertext:'',updatedAt:new Date()}).where(eq(connections.id,'business'));return previous;});}
export async function assertLease(id:string){const [row]=await db.select({id:runs.id}).from(runs).where(and(eq(runs.id,id),eq(runs.status,'running'),sql`${runs.leaseUntil} > now()`)).limit(1);if(!row)throw new BackupError('BACKUP_INTERRUPTED');}

export async function readRun(id:string){return (await db.select().from(runs).where(eq(runs.id,id)).limit(1))[0]??null;}
