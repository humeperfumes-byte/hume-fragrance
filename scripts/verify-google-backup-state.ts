import {config} from 'dotenv';import postgres from 'postgres';import {randomUUID} from 'node:crypto';
config({path:'.env.local',quiet:true});config({path:'.env',quiet:true});
async function main(){if(!process.env.DATABASE_URL)throw new Error('Missing database');const db=postgres(process.env.DATABASE_URL,{max:1,prepare:false,connect_timeout:10,idle_timeout:2,onnotice:()=>{}});const rollback=new Error('ROLLBACK_VERIFICATION');let checks=0;
 try{
  const permissions=await db`select c.relname,c.relrowsecurity,has_table_privilege('anon',c.oid,'SELECT,INSERT,UPDATE,DELETE') as anon_access,has_table_privilege('authenticated',c.oid,'SELECT,INSERT,UPDATE,DELETE') as authenticated_access from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname in ('google_backup_connections','google_backup_runs')`;
  if(permissions.length!==2||permissions.some(r=>!r.relrowsecurity||r.anon_access||r.authenticated_access))throw new Error('Metadata access not private');checks++;
  try{await db.begin(async tx=>{
   await tx.unsafe("SET LOCAL lock_timeout='3s'; SET LOCAL statement_timeout='10s'");await tx.unsafe("SELECT pg_advisory_xact_lock(hashtext('hume-google-backups'))");
   const [active]=await tx.unsafe("select exists(select 1 from public.google_backup_connections where connected=true) or exists(select 1 from public.google_backup_runs where status='running') as active");if(active.active)throw new Error('Active configuration exists; verification refuses to alter it');
   const id=randomUUID();await tx.unsafe("INSERT INTO public.google_backup_runs(id,google_sub,trigger,status,lease_until) VALUES($1,'verification-only','manual','running',now()+interval '10 minutes')",[id]);
   let overlapBlocked=false;try{await tx.savepoint(async sp=>{await sp.unsafe("INSERT INTO public.google_backup_runs(id,google_sub,trigger,status,lease_until) VALUES($1,'verification-only','manual','running',now()+interval '10 minutes')",[randomUUID()]);});}catch(error){overlapBlocked=Boolean(error&&typeof error==='object'&&'code' in error&&error.code==='23505');}if(!overlapBlocked)throw new Error('Overlap constraint failed');checks++;
   await tx.unsafe("UPDATE public.google_backup_runs SET status='failed' WHERE id=$1",[id]);
   await tx.unsafe("INSERT INTO public.google_backup_runs(id,google_sub,trigger,scheduled_for,status,lease_until) VALUES($1,'verification-only','scheduled','2026-01-03T22:00:00Z','failed',now())",[randomUUID()]);
   let duplicateBlocked=false;try{await tx.savepoint(async sp=>{await sp.unsafe("INSERT INTO public.google_backup_runs(id,google_sub,trigger,scheduled_for,status,lease_until) VALUES($1,'verification-only','scheduled','2026-01-03T22:00:00Z','failed',now())",[randomUUID()]);});}catch(error){duplicateBlocked=Boolean(error&&typeof error==='object'&&'code' in error&&error.code==='23505');}if(!duplicateBlocked)throw new Error('Scheduled deduplication failed');checks++;
   throw rollback;
  });}catch(error){if(error!==rollback)throw error;}
  const [left]=await db`select count(*)::int as count from public.google_backup_runs where google_sub='verification-only'`;if(left.count)throw new Error('Verification rows were not rolled back');checks++;
  console.log(JSON.stringify({checks,metadata:'private',overlap:'blocked',scheduledDuplicates:'blocked',verificationRowsPersisted:0,businessRecordsChanged:0}));
 }finally{await db.end();}
}
main().catch(()=>{console.error('Backup metadata verification needs review; transaction rolled back.');process.exitCode=1;});
