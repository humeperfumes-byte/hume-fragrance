export type CampaignContact = { key:string; name:string; phone:string|null; marketing_opt_in:boolean };
export function campaignAudience(keys:string[], contacts:CampaignContact[]) {
 const selected=[...new Set(keys)], byKey=new Map(contacts.map(c=>[c.key,c])), phones=new Set<string>();
 const eligible:{key:string;name:string;phone:string}[]=[];
 let noConsent=0,invalidPhone=0,duplicates=0;
 for(const key of selected){const c=byKey.get(key);if(!c?.marketing_opt_in){noConsent++;continue;}const digits=(c.phone||'').replace(/\D/g,'');if(!/^(91|0091|0)?[6-9]\d{9}$/.test(digits)){invalidPhone++;continue;}const phone='91'+digits.slice(-10);if(phones.has(phone)){duplicates++;continue;}phones.add(phone);eligible.push({key,name:c.name||'Customer',phone});}
 return {eligible,excluded:selected.length-eligible.length,noConsent,invalidPhone,duplicates};
}
