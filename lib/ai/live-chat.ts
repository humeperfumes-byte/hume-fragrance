import 'server-only';
import { buildChatPrompt, humanSupportReply, parseChatReply, type ChatTurn } from './live-chat-core';
import { chatKnowledgeFor } from './live-chat-knowledge';
export async function generateHumeChatReply(turns:ChatTurn[], knowledgeProvider = chatKnowledgeFor):Promise<{messages:string[];handoff:boolean}> {
  const handoff=humanSupportReply(turns);
  if(handoff)return {messages:handoff,handoff:true};
  try {
    const key=process.env.GEMINI_API_KEY?.trim();if(!key)throw new Error('unavailable');
    const knowledge=await knowledgeProvider(turns);
    const prompt=buildChatPrompt(turns,knowledge);
    const response=await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent',{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':key},signal:AbortSignal.timeout(20000),body:JSON.stringify({systemInstruction:{parts:[{text:prompt.system}]},contents:[{role:'user',parts:[{text:prompt.conversation}]}],generationConfig:{temperature:0.25,maxOutputTokens:600}})});
    if(!response.ok)throw new Error('unavailable');
    const data=await response.json() as {candidates?:Array<{content?:{parts?:Array<{text?:string}>}}>};
    const messages=parseChatReply(data.candidates?.[0]?.content?.parts?.map(p=>p.text||'').join('')||'');
    if(messages)return {messages,handoff:false};
  }catch{/* Never guess a price, policy or payment state when knowledge/provider fails. */}
  return {messages:['I can’t confirm that accurately right now. I’ll leave your message for the HUME team to help.'],handoff:true};
}
// Retain the admin draft integration; drafts are never sent automatically.
export async function generatePrakharChatReply(turns:ChatTurn[],mode:'first'|'draft'='first'):Promise<string[]|null>{void mode;return (await generateHumeChatReply(turns)).messages;}
