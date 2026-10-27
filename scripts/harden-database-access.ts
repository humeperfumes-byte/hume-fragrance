import {config} from 'dotenv';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import postgres from 'postgres';
config({path:'.env.local',quiet:true});config({path:'.env',quiet:true});
async function main(){
 if(!process.env.DATABASE_URL)throw new Error('Database not configured');
 const url=new URL(process.env.DATABASE_URL);
 if(url.hostname.endsWith('.pooler.supabase.com')&&url.port==='6543')url.port='5432';
 if(url.username!=='postgres.dwgwlayrpgypbbpezxiu')throw new Error('Unexpected database target; inspect configuration before applying');
 const db=postgres(url.toString(),{max:1,prepare:false,connect_timeout:15,idle_timeout:2,onnotice:()=>{}});
 try{
  const [role]=await db`select current_user as name,rolbypassrls as bypass from pg_roles where rolname=current_user`;
  if(role.name!=='postgres'||!role.bypass)throw new Error('Unexpected application database role');
  const before=await db`select c.relname,c.relkind,c.relrowsecurity,c.relforcerowsecurity,c.relacl::text as acl,pg_get_userbyid(c.relowner) as owner from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind in ('r','p','v','m','f','S') order by c.relname`;
  const columns=await db`select c.relname,a.attname,a.attacl::text as acl from pg_attribute a join pg_class c on c.oid=a.attrelid join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and a.attnum>0 and not a.attisdropped and a.attacl is not null`;
  const defaults=await db`select pg_get_userbyid(defaclrole) as owner,defaclnamespace::regnamespace::text as schema,defaclobjtype,defaclacl::text as acl from pg_default_acl where defaclrole=(select oid from pg_roles where rolname='postgres')`;
  console.log(JSON.stringify({mode:process.argv.includes('--apply')?'apply':'plan only',project:'dwgwlayrpgypbbpezxiu',applicationRole:role.name,applicationBypassesRls:role.bypass,objects:before.length,tablesWithoutRls:before.filter(row=>['r','p'].includes(row.relkind)&&!row.relrowsecurity).length}));
  if(!process.argv.includes('--apply')){console.log('No changes made. Review sql/harden_public_database_access.sql before applying.');return;}
  await mkdir('output/security',{recursive:true});
  const backup=`output/security/database-permissions-before-${Date.now()}.json`;
  await writeFile(backup,JSON.stringify({recordedAt:new Date().toISOString(),project:'dwgwlayrpgypbbpezxiu',before,columns,defaults},null,2));
  const migration=await readFile('sql/harden_public_database_access.sql','utf8');
  await db.begin(async tx=>{
   await tx.unsafe(migration);
   const [check]=await tx.unsafe(`select count(*)::int as exposed from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind in ('r','p','v','m','f') and (has_table_privilege('anon',c.oid,'SELECT,INSERT,UPDATE,DELETE,TRUNCATE') or has_any_column_privilege('anon',c.oid,'SELECT,INSERT,UPDATE') or has_table_privilege('authenticated',c.oid,'SELECT,INSERT,UPDATE,DELETE,TRUNCATE') or has_any_column_privilege('authenticated',c.oid,'SELECT,INSERT,UPDATE'))`);
   if(check.exposed!==0)throw new Error('Public API access remains; transaction will roll back');
   // Verify normal application SQL without retrieving or changing customer rows.
   for(const table of ['products','orders','saved_invoices','customer_account_sessions','coupons'])await tx.unsafe(`SELECT 1 FROM public.${table} LIMIT 0`);
   const privileges=await tx.unsafe(`select c.relname from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind in ('r','p') and exists (select 1 from (values ('SELECT'),('INSERT'),('UPDATE'),('DELETE')) required(privilege) where not has_table_privilege(current_user,c.oid,required.privilege))`);
   if(privileges.length)throw new Error('Application privileges changed; transaction will roll back');
  });
  console.log('Applied and verified: public API table access blocked; application database access preserved.');
  console.log(`Permission snapshot: ${backup}`);
 }finally{await db.end();}
}
main().catch(()=>{console.error('Database hardening stopped. If a transaction was active, it was rolled back. No row data is changed by this script.');process.exitCode=1;});
