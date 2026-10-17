import {config} from 'dotenv';
import {readFile} from 'node:fs/promises';
import postgres from 'postgres';
config({path:'.env.local',quiet:true});config({path:'.env',quiet:true});
async function main(){const client=postgres(process.env.DATABASE_URL!,{max:1,prepare:false});try{await client.unsafe(await readFile('sql/add_external_order_receipt.sql','utf8'));console.log('External payment receipt column ready; existing order data unchanged.');}finally{await client.end();}}
main().catch(()=>{console.error('External receipt schema setup failed');process.exitCode=1;});
