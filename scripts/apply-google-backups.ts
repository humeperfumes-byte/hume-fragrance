import {config} from 'dotenv';import {readFile} from 'node:fs/promises';import postgres from 'postgres';
config({path:'.env.local',quiet:true});config({path:'.env',quiet:true});
async function main(){if(!process.env.DATABASE_URL)throw new Error('Missing database');const client=postgres(process.env.DATABASE_URL,{max:1,prepare:false,connect_timeout:10,idle_timeout:2,onnotice:()=>{}});try{await client.unsafe(await readFile('sql/add_google_backups.sql','utf8'));console.log('Private Google backup metadata tables ready. Business records unchanged.');}finally{await client.end();}}
main().catch(()=>{console.error('Google backup table setup failed.');process.exitCode=1;});
