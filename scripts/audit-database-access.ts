import {config} from 'dotenv';
import postgres from 'postgres';
config({path:'.env.local',quiet:true});config({path:'.env',quiet:true});
async function main(){
 if(!process.env.DATABASE_URL)throw new Error('Database is not configured');
 const url=new URL(process.env.DATABASE_URL);
 // Use the session pooler for this short administrator audit.
 if(url.hostname.endsWith('.pooler.supabase.com')&&url.port==='6543')url.port='5432';
 const db=postgres(url.toString(),{max:1,prepare:false,connect_timeout:15,idle_timeout:2,onnotice:()=>{}});
 try{await db.begin('read only',async tx=>{
  await tx.unsafe(`set local statement_timeout = '20s'`);
  const identity=await tx.unsafe(`select current_user as role, r.rolsuper as superuser,r.rolbypassrls as bypass_rls from pg_roles r where r.rolname=current_user`);
  const tables=await tx.unsafe(`select c.relname as name, c.relkind as kind,pg_get_userbyid(c.relowner) as owner,c.relrowsecurity as rls,c.relforcerowsecurity as force_rls,has_table_privilege('anon',c.oid,'SELECT') as anon_read,has_table_privilege('anon',c.oid,'INSERT,UPDATE,DELETE,TRUNCATE') as anon_write,has_table_privilege('authenticated',c.oid,'SELECT') as authenticated_read,has_table_privilege('authenticated',c.oid,'INSERT,UPDATE,DELETE,TRUNCATE') as authenticated_write,(select count(*)::int from pg_policy p where p.polrelid=c.oid) as policies from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind in ('r','p','v','m','f') order by c.relname`);
  const sensitive=await tx.unsafe(`select table_name,column_name from information_schema.columns where table_schema='public' and column_name ~* '(password|secret|token|email|phone|address)' order by table_name,column_name`);
  const functions=await tx.unsafe(`select p.oid::regprocedure::text as name,p.prosecdef as security_definer,has_function_privilege('anon',p.oid,'EXECUTE') as anon_execute,has_function_privilege('authenticated',p.oid,'EXECUTE') as authenticated_execute,pg_get_userbyid(p.proowner) as owner from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and not exists (select 1 from pg_depend d where d.classid='pg_proc'::regclass and d.objid=p.oid and d.deptype='e') order by 1`);
  const policies=await tx.unsafe(`select schemaname,tablename,policyname,roles,cmd,qual,with_check from pg_policies where schemaname='public'`);
  console.log(JSON.stringify(process.argv.includes('--details')?{project:url.username.split('.')[1]||'direct connection',identity,tables,sensitive,functions,policies}:{project:url.username.split('.')[1]||'direct connection',identity,tableCount:tables.length,rlsDisabled:tables.filter(table=>!table.rls).map(table=>table.name),publicRoleAccessible:tables.filter(table=>table.anon_read||table.anon_write||table.authenticated_read||table.authenticated_write).length,customFunctions:functions.length,policies:policies.length,sensitiveTables:[...new Set(sensitive.map(column=>column.table_name))]},null,2));
 });}finally{await db.end();}
}
main().catch(()=>{console.error('Read-only database access audit failed. No changes made.');process.exitCode=1;});
