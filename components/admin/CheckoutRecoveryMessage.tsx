'use client';
import { useState } from 'react';
import { Dialog,DialogContent,DialogDescription,DialogHeader,DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy,MessageCircle,Mail,Link2,ShieldCheck } from 'lucide-react';
import { checkoutRecoveryMessage,type RecoveryDraft } from '@/lib/checkout-recovery';
import { normalizeAdminPhone } from '@/lib/admin-message-templates';
import { toast } from '@/hooks/use-toast';
export type PreparedRecovery={draft:RecoveryDraft;url:string;id:string;expiresAt:string};
export default function CheckoutRecoveryMessage({recovery,onClose}:{recovery:PreparedRecovery|null;onClose:()=>void}){
 const [copied,setCopied]=useState(false);
 if(!recovery)return null;
 const message=checkoutRecoveryMessage(recovery.draft.fullName,recovery.url);
 const normalizedPhone=normalizeAdminPhone(recovery.draft.phone);
 const phone=/^91[6-9]\d{9}$/.test(normalizedPhone||'')?normalizedPhone:null;
 async function copy(text:string){try{await navigator.clipboard.writeText(text);setCopied(true);toast({title:'Copied',description:'Review the message before sharing it with this customer.'});}catch{toast({title:'Copy unavailable',description:'Select and copy the message below.',variant:'destructive'});}}
 return <Dialog open onOpenChange={open=>{if(!open){setCopied(false);onClose();}}}><DialogContent className="max-h-[90dvh] overflow-y-auto border-white/10 bg-[#171719] text-white sm:max-w-lg"><DialogHeader><p className="text-[10px] uppercase tracking-[.2em] text-[#d5bb86]">A personal invitation back</p><DialogTitle className="font-serif text-2xl">Your selection is saved</DialogTitle><DialogDescription className="text-white/45">A private checkout link, ready for your review. Nothing is sent automatically.</DialogDescription></DialogHeader>
 <div className="rounded-2xl border border-[#d5bb86]/20 bg-[linear-gradient(145deg,#2b251d,#19191c)] p-4"><p className="mb-3 text-[10px] uppercase tracking-[.22em] text-[#d5bb86]">HUME · FRAGRANCE</p><textarea readOnly aria-label="Recovery message preview" value={message.body} className="min-h-[290px] w-full resize-none bg-transparent text-[13px] leading-6 text-white/85 outline-none"/></div>
 <p className="flex gap-2 text-xs leading-5 text-white/45"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0"/>On their original browser, the link restores the saved checkout and delivery details. Another device must verify access before private details can be shown. The link expires {new Date(recovery.expiresAt).toLocaleDateString('en-IN',{timeZone:'Asia/Kolkata'})}.</p>
 <div className="grid grid-cols-2 gap-2"><Button type="button" onClick={()=>copy(message.body)} className="gap-2"><Copy className="h-4 w-4"/>{copied?'Copy again':'Copy message'}</Button><Button type="button" variant="outline" className="gap-2 border-white/15 bg-white/5 text-white" onClick={()=>copy(recovery.url)}><Link2 className="h-4 w-4"/>Copy link</Button></div>
 <div className="grid grid-cols-2 gap-2">{phone?<a href={`https://wa.me/${phone}?text=${encodeURIComponent(message.body)}`} target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center justify-center gap-2 rounded-lg border border-emerald-400/20 bg-emerald-400/10 text-sm font-medium text-emerald-200"><MessageCircle className="h-4 w-4"/>Open WhatsApp</a>:<Button disabled>No mobile number</Button>}{recovery.draft.email?<a href={`mailto:${encodeURIComponent(recovery.draft.email)}?subject=${encodeURIComponent(message.subject)}&body=${encodeURIComponent(message.body)}`} className="flex min-h-11 items-center justify-center gap-2 rounded-lg border border-sky-400/20 bg-sky-400/10 text-sm font-medium text-sky-200"><Mail className="h-4 w-4"/>Prepare email</a>:<Button disabled>No email address</Button>}</div>
 <p className="text-[11px] text-white/35">Opening a message does not mark the customer contacted. Record that separately after you have followed up.</p>
 </DialogContent></Dialog>;
}
