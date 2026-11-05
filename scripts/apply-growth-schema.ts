import {config} from 'dotenv';import {readFileSync} from 'node:fs';import postgres from 'postgres';
config({path:'.env.local'});config();
async function main(){if(!process.env.DATABASE_URL)throw Error('Database required');const db=postgres(process.env.DATABASE_URL,{prepare:false,max:1,connect_timeout:15});try{await db.begin(async tx=>{await tx.unsafe(readFileSync('sql/growth-system.sql','utf8'));});console.log('Growth schema applied. Earning and referrals remain off until configured; no customer messages sent.');}finally{await db.end();}}
main().catch(()=>{console.error('Growth migration failed; check database connectivity.');process.exitCode=1;});
