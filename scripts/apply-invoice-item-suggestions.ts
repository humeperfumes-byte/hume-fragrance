import {config} from 'dotenv';
import {readFile} from 'node:fs/promises';
import postgres from 'postgres';
config({path:'.env.local',quiet:true});config({path:'.env',quiet:true});
async function main(){const client=postgres(process.env.DATABASE_URL!,{max:1,prepare:false});try{await client.unsafe(await readFile('sql/add_invoice_item_suggestions.sql','utf8'));console.log('Invoice suggestion library ready; existing invoices and products unchanged.');}finally{await client.end();}}
main().catch(()=>{console.error('Invoice suggestion library setup failed');process.exitCode=1;});
