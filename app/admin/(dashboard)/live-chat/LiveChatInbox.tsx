"use client";

import SiteLoading from "@/components/SiteLoading";
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowUp, Bot, Check, ChevronDown, Link2, MessageCircle, Plus, Search, Sparkles, UserRound, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

type Message = { id: string; sessionId: string; sender: string; message: string; createdAt: string };
type Session = { id: string; status: "open" | "waiting" | "resolved" | "closed"; handlingMode: "ai" | "manual"; page: string | null; createdAt: string; updatedAt: string; lastMessage: Message | null; messageCount: number };
const TEMPLATE_GROUPS = {
  general: {
    label: "General replies",
    replies: [
      "Hey! Tell me how I can help you.",
      "Give me a moment, I’m checking this for you.",
      "I understand. Let me help you with that.",
      "Is there anything else I can help you with?",
    ],
  },
  offers: {
    label: "Offers & deals",
    replies: [
      "Let me check the best offer currently available for you.",
      "Tell me what you’re planning to buy and I’ll help you find the best deal.",
      "Our offers can change, so let me confirm the active deal before you order.",
      "If you share your cart value, I can guide you to the most suitable offer.",
    ],
  },
  recommendations: {
    label: "Recommendations",
    replies: [
      "Tell me what kind of fragrances you enjoy—fresh, sweet, woody, spicy, or floral?",
      "Would you like something for daily wear, office, dates, or gifting?",
      "What is your preferred budget? I’ll suggest the best options.",
      "Do you prefer something subtle or a strong, attention-grabbing fragrance?",
    ],
  },
  orders: {
    label: "Orders & delivery",
    replies: [
      "Please share your order number and I’ll check it for you.",
      "Let me check the latest delivery update for your order.",
      "Please share the phone number used for the order so I can locate it.",
      "Tell me what happened during payment and I’ll help you resolve it.",
    ],
  },
  discovery: {
    label: "Discovery & gifting",
    replies: [
      "The Discovery Set lets you try multiple fragrances before choosing a full bottle.",
      "Tell me who the gift is for and what kind of scents they usually enjoy.",
      "What is your gifting budget? I’ll suggest the best option.",
      "The Discovery Set is a good choice when you’re unsure which full bottle to select.",
    ],
  },
} as const;
const CUSTOM_TEMPLATES_KEY = "hume_admin_chat_templates";
const time = (value: string) => new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit", day: "numeric", month: "short" }).format(new Date(value));

export function LiveChatInbox() {
  const router = useRouter(), searchParams = useSearchParams();
  const selectedId = searchParams.get("session");
  const [sessions, setSessions] = useState<Session[]>([]), [messages, setMessages] = useState<Message[]>([]);
  const [query, setQuery] = useState(""), [sending, setSending] = useState(false), [loading, setLoading] = useState(true);
  const [drafts,setDrafts] = useState<Record<string,string>>({});
  const text = drafts[selectedId || ""] || "";
  const setText = (value:string|((previous:string)=>string)) => { const id=selectedId||""; setDrafts(current=>({...current,[id]:typeof value==="function"?value(current[id]||""):value})); };
  const selectedRef=useRef(selectedId); selectedRef.current=selectedId;
  const requestRef=useRef(0), busyRef=useRef(false), nearBottomRef=useRef(true);
  const loadedRef=useRef<string|null|undefined>(undefined);
  const [aiSuggestion,setAiSuggestion]=useState("");
  const suggestionTarget=useRef<string|null>(null);
  const [loadError,setLoadError]=useState("");
  const [error,setError]=useState(""), [notice,setNotice]=useState(""), [savingControl,setSavingControl]=useState(false);
  const [hasMore,setHasMore]=useState(false), [loadingOlder,setLoadingOlder]=useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [customTemplates, setCustomTemplates] = useState<string[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const conversationRef = useRef<HTMLDivElement>(null);
  const replyRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try { setCustomTemplates(JSON.parse(localStorage.getItem(CUSTOM_TEMPLATES_KEY) || "[]") as string[]); } catch { setCustomTemplates([]); }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const load = useCallback(async () => {
    if (busyRef.current) return;
    const requestId=++requestRef.current;
    const target=selectedId;
    try {
      const suffix=target?`?session=${encodeURIComponent(target)}`:"";
      const response=await fetch(`/api/admin/live-chat${suffix}`,{cache:"no-store",signal:AbortSignal.timeout(15000)});
      const data=await response.json();
      if(!response.ok)throw new Error(data.error||"Unable to load inbox");
      if(requestId!==requestRef.current||selectedRef.current!==target)return;
      setSessions(data.sessions); setLoadError("");
      if(loadedRef.current!==target){setHasMore(data.hasMore);loadedRef.current=target;}
      setMessages(current=>{
        const existing=current.filter(message=>message.sessionId===target);

        const merged=new Map([...existing,...data.messages].map(message=>[message.id,message]));
        const next=[...merged.values()].sort((a,b)=>new Date(a.createdAt).getTime()-new Date(b.createdAt).getTime()||a.id.localeCompare(b.id));
        return next.length===current.length&&next.every((message,index)=>message.id===current[index]?.id)?current:next;
      });
    }catch(error){if(requestId===requestRef.current&&selectedRef.current===target)setLoadError(error instanceof Error?error.message:"Inbox could not be loaded");}
    finally{if(requestId===requestRef.current&&selectedRef.current===target)setLoading(false);}
  },[selectedId]);
  useEffect(()=>{
    ++requestRef.current;loadedRef.current=undefined;setAiSuggestion("");setAiLoading(false);setMessages([]);setLoading(true);setHasMore(false);setError("");setNotice("");setAiError("");nearBottomRef.current=true;
    let stopped=false,timer:number;
    const poll=async()=>{await load();if(!stopped)timer=window.setTimeout(poll,3000);};
    void poll();return()=>{stopped=true;clearTimeout(timer);};
  },[load]);
  useEffect(()=>{const panel=conversationRef.current;if(panel&&nearBottomRef.current)panel.scrollTo({top:panel.scrollHeight,behavior:"smooth"});},[messages,selectedId]);
  const loadOlder=async()=>{
    if(!selectedId||!messages[0]||messages[0].sessionId!==selectedId||loadingOlder)return;
    const target=selectedId,panel=conversationRef.current,height=panel?.scrollHeight||0,top=panel?.scrollTop||0;
    setLoadingOlder(true);
    try{const response=await fetch(`/api/admin/live-chat?session=${encodeURIComponent(target)}&before=${encodeURIComponent(messages[0].id)}`,{cache:"no-store",signal:AbortSignal.timeout(15000)});const data=await response.json();if(!response.ok)throw new Error(data.error||"Older messages unavailable");if(selectedRef.current!==target)return;nearBottomRef.current=false;setHasMore(data.hasMore);setMessages(current=>[...new Map([...data.messages,...current].map(message=>[message.id,message])).values()]);requestAnimationFrame(()=>{if(panel)panel.scrollTop=top+panel.scrollHeight-height;});}catch(error){if(selectedRef.current===target)setError(error instanceof Error?error.message:"Older messages unavailable");}finally{setLoadingOlder(false);}
  };
  useEffect(() => {
    const field = replyRef.current;
    if (!field) return;
    field.style.height = "auto";
    field.style.height = `${Math.min(field.scrollHeight, 112)}px`;
  }, [text]);

  const filtered = useMemo(() => sessions.filter(session => (statusFilter === "all" || session.status === statusFilter) && `${session.id} ${session.lastMessage?.message ?? ""} ${session.page ?? ""}`.toLowerCase().includes(query.toLowerCase())), [query, sessions, statusFilter]);
  const selected = sessions.find(session => session.id === selectedId);
  const choose=(id:string)=>{const params=new URLSearchParams(searchParams.toString());params.set("session",id);router.replace(`/admin/live-chat?${params}`,{scroll:false});};
  const updateControl=async(patch:{status?:Session["status"];handlingMode?:Session["handlingMode"]})=>{
    if(!selectedId||busyRef.current)return;const target=selectedId;
    busyRef.current=true;++requestRef.current;setSavingControl(true);setError("");setNotice("");
    try{const response=await fetch("/api/admin/live-chat",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({sessionId:target,...patch}),signal:AbortSignal.timeout(15000)});const data=await response.json();if(!response.ok||!data.session)throw new Error(data.error||"Control update failed");setSessions(current=>current.map(session=>session.id===target?{...session,...data.session}:session));if(selectedRef.current===target)setNotice(patch.handlingMode?patch.handlingMode==="ai"?"AI enabled for new customer messages.":"You have control. Automatic AI replies are paused.":"Conversation status saved.");}catch(error){if(selectedRef.current===target)setError(error instanceof Error?error.message:"Control update failed");}finally{busyRef.current=false;setSavingControl(false);}
  };
  const updateStatus=(status:Session["status"])=>updateControl({status});
  const updateHandlingMode=(handlingMode:Session["handlingMode"])=>updateControl({handlingMode});
  const defaultTemplates = useMemo<string[]>(() => Object.values(TEMPLATE_GROUPS).flatMap(group => [...group.replies]), []);
  const isSavedTemplate = (message: string) => defaultTemplates.includes(message) || customTemplates.includes(message);
  const saveTemplate = (message: string) => {
    if (isSavedTemplate(message)) return;
    const updated = [...customTemplates, message];
    setCustomTemplates(updated);
    localStorage.setItem(CUSTOM_TEMPLATES_KEY, JSON.stringify(updated));
  };
  const addLink = () => {
    setText(current => `${current}${current && !current.endsWith(" ") ? " " : ""}https://`);
    window.setTimeout(() => replyRef.current?.focus(), 0);
  };
  const createAiDraft = async () => {
    if (!selectedId || aiLoading) return;
    const target=selectedId;
    setAiLoading(true); setAiError("");
    try {
      const response = await fetch("/api/admin/live-chat/ai-draft", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId: selectedId }), signal: AbortSignal.timeout(30000) });
      const data = await response.json() as { draft?: string; error?: string };
      if (!response.ok || !data.draft) throw new Error(data.error || "AI draft could not be generated");
      if(selectedRef.current!==target)return;
      suggestionTarget.current=target; setAiSuggestion(data.draft);
    } catch (error) {
      if(selectedRef.current===target)setAiError(error instanceof Error ? error.message : "AI draft could not be generated");
    } finally { if(selectedRef.current===target)setAiLoading(false); }
  };

  const send=async(event:FormEvent)=>{
    event.preventDefault();const message=text.trim(),target=selectedId;if(!message||!target||busyRef.current||sending)return;
    busyRef.current=true;++requestRef.current;setSending(true);setError("");setNotice("");
    try{const response=await fetch("/api/admin/live-chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({sessionId:target,message}),signal:AbortSignal.timeout(20000)});const data=await response.json();if(!response.ok||!data.message)throw new Error(data.error||"Reply was not confirmed");setDrafts(current=>({...current,[target]:""}));setSessions(current=>current.map(session=>session.id===target?{...session,handlingMode:"manual",status:"open",lastMessage:data.message,messageCount:session.messageCount+1}:session));if(selectedRef.current===target){nearBottomRef.current=true;setMessages(current=>[...new Map([...current,data.message].map(message=>[message.id,message])).values()]);setNotice("Reply sent. AI is paused while you handle this conversation.");}}
    catch(error){if(selectedRef.current===target)setError((error instanceof Error?error.message:"Reply could not be confirmed")+". Your draft is preserved. Refresh the conversation before retrying to avoid a duplicate.");}
    finally{busyRef.current=false;setSending(false);}
  };

  return <main className="mx-auto max-w-[1500px] p-3 sm:p-5">
    <div className="mb-4 flex items-end justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#c9b3ff]/65">Customer care</p><h1 className="mt-1 text-2xl font-semibold text-white">Live conversations</h1><p className="mt-1 text-xs text-white/35">Telegram alerts you. Reply to customers here.</p></div><div className="rounded-full border border-emerald-300/15 bg-emerald-300/[.07] px-3 py-1.5 text-[10px] font-semibold text-emerald-200/70">{sessions.length} recent conversations</div></div>
    {(error||loadError)&&<div role="alert" className="mb-3 rounded-xl border border-red-300/20 bg-red-400/10 p-3 text-xs text-red-100">{error||loadError}<button type="button" onClick={()=>{setError("");void load();}} className="ml-3 font-semibold underline">Refresh inbox</button></div>}
    {notice&&<p role="status" className="mb-3 rounded-xl border border-emerald-300/20 bg-emerald-300/10 p-3 text-xs text-emerald-100">{notice}</p>}
    <section className="grid overflow-visible rounded-[24px] border border-white/[.08] bg-[#111113] shadow-[0_24px_70px_rgba(0,0,0,.24)] md:h-[calc(100dvh-170px)] md:min-h-[560px] md:grid-cols-[340px_1fr] md:overflow-hidden">
      <aside className={`${selectedId ? "hidden md:flex" : "flex"} min-w-0 flex-col border-r border-white/[.07]`}>
        <div className="space-y-2 border-b border-white/[.07] p-3"><label className="flex h-10 items-center gap-2 rounded-xl border border-white/[.08] bg-white/[.035] px-3 text-white/35"><Search className="h-4 w-4"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search recent conversations" className="w-full bg-transparent text-xs text-white outline-none placeholder:text-white/25"/></label><select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} className="h-9 w-full rounded-xl border border-white/[.08] bg-[#19191c] px-3 text-[10px] text-white/55 outline-none"><option value="all">All conversations</option><option value="open">Open</option><option value="waiting">Needs team reply</option><option value="resolved">Resolved</option><option value="closed">Closed</option></select></div>
        <div className="flex-1 overflow-y-auto [scrollbar-color:rgba(255,255,255,.15)_transparent] [scrollbar-width:thin]">{loading ? <SiteLoading compact dark title="Opening conversations" description="Getting your inbox ready." /> : filtered.length ? filtered.map(session => <button key={session.id} onClick={()=>choose(session.id)} className={`relative block w-full border-b border-white/[.055] p-4 text-left transition hover:bg-white/[.04] ${selectedId===session.id?"bg-[#c9b3ff]/[.08]":""}`}>{session.lastMessage?.sender==="customer"&&<span className="absolute right-3 top-4 h-2 w-2 rounded-full bg-[#d8f39a] shadow-[0_0_8px_rgba(216,243,154,.5)]"/>}<div className="flex items-start gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#d8f39a] text-xs font-bold text-[#11150f]">C</span><span className="min-w-0 flex-1"><span className="flex justify-between gap-2 pr-3"><b className="text-xs font-semibold text-white/80">Customer {session.id.slice(-6).toUpperCase()}</b><small className="text-[9px] text-white/25">{time(session.updatedAt)}</small></span><span className="mt-1 block truncate text-[11px] text-white/40">{session.lastMessage?.message || "New conversation"}</span><span className="mt-1 flex items-center gap-2 text-[9px] text-white/20"><span className="capitalize">{session.status}</span><span>·</span><span className={session.handlingMode==="ai"?"text-[#d8f39a]/70":"text-[#c9b3ff]/80"}>{session.handlingMode==="ai"?"AI enabled":"Manual"}</span><span>·</span><span className="truncate">{session.page || "Storefront"}</span></span></span></div></button>) : <p className="p-5 text-xs text-white/30">No conversations yet.</p>}</div>
      </aside>
      <div className={`${selectedId ? "flex" : "hidden md:flex"} min-w-0 flex-col overflow-visible md:overflow-hidden`}>
        {loading && selectedId ? <SiteLoading compact dark title="Opening conversation" description="Loading the latest customer messages." /> : !selected ? <div className="flex flex-1 flex-col items-center justify-center text-center"><span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[.05] text-[#c9b3ff]"><MessageCircle/></span><h2 className="mt-4 text-lg font-semibold text-white/75">Choose a conversation</h2><p className="mt-1 text-xs text-white/30">Customer messages will appear here in real time.</p></div> : <>
          <header className="flex min-h-16 flex-wrap items-center gap-2 border-b border-white/[.07] px-4 py-2"><button onClick={()=>router.replace('/admin/live-chat')} className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/60 md:hidden"><ArrowLeft className="h-4 w-4"/></button><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#d8f39a] text-xs font-bold text-[#11150f]">C</span><div className="min-w-0 flex-1"><h2 className="text-sm font-semibold text-white/85">Customer {selected.id.slice(-6).toUpperCase()}</h2><p className="truncate text-[10px] text-white/30">{selected.page || "Storefront"} · {selected.messageCount} messages</p></div><button type="button" disabled={savingControl||sending} onClick={()=>void updateHandlingMode(selected.handlingMode==="ai"?"manual":"ai")} className={`flex h-9 items-center gap-1.5 rounded-xl border px-2.5 text-[9px] font-semibold ${selected.handlingMode==="ai"?"border-[#d8f39a]/20 bg-[#d8f39a]/[.07] text-[#d8f39a]/80":"border-[#c9b3ff]/20 bg-[#c9b3ff]/[.07] text-[#c9b3ff]/80"}`}>{savingControl?<><Loader2 className="h-3.5 w-3.5 animate-spin"/>Saving…</>:selected.handlingMode==="ai"?<><UserRound className="h-3.5 w-3.5"/>Take over</>:<><Bot className="h-3.5 w-3.5"/>Enable AI</>}</button><select disabled={savingControl||sending} value={selected.status} onChange={e=>void updateStatus(e.target.value as Session["status"])} className="h-9 max-w-28 rounded-xl border border-white/10 bg-[#19191c] px-2 text-[9px] capitalize text-white/55 outline-none"><option value="open">Open</option><option value="waiting">Waiting</option><option value="resolved">Resolved</option><option value="closed">Closed</option></select></header><div className="flex items-center gap-2 border-b border-white/[.07] bg-white/[.025] px-4 py-2 text-[11px] text-white/55">{selected.handlingMode==="ai"?<Bot className="h-3.5 w-3.5 text-[#d8f39a]"/>:<UserRound className="h-3.5 w-3.5 text-[#c9b3ff]"/>}{selected.handlingMode==="ai"?"AI is enabled for new customer messages. Your reply takes over automatically.":"Manual control — automatic AI replies are paused."}</div>
          <div ref={conversationRef} onScroll={event=>{const panel=event.currentTarget;nearBottomRef.current=panel.scrollHeight-panel.scrollTop-panel.clientHeight<90;}} className="min-h-[300px] max-h-[48dvh] flex-none space-y-3 overflow-y-auto bg-[#0d0d0f] p-4 [scrollbar-color:rgba(201,179,255,.22)_transparent] [scrollbar-width:thin] md:min-h-0 md:max-h-none md:flex-1">{hasMore&&<button disabled={loadingOlder} onClick={()=>void loadOlder()} className="mx-auto block rounded-lg border border-white/10 px-3 py-2 text-xs text-[#c9b3ff]">{loadingOlder?"Loading history…":"Load earlier messages"}</button>}{messages.length===0&&<p className="p-4 text-xs text-white/40">No messages in this conversation yet.</p>}{messages.filter(message=>message.sessionId===selectedId).map(message => <div key={message.id} className={`flex items-end gap-1.5 ${message.sender === "customer" ? "justify-start" : "justify-end"}`}>{message.sender !== "customer" && <button type="button" onClick={()=>saveTemplate(message.message)} disabled={isSavedTemplate(message.message)} aria-label={isSavedTemplate(message.message)?"Saved as template":"Add reply to templates"} className={`mb-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${isSavedTemplate(message.message)?"border-emerald-300/15 bg-emerald-300/10 text-emerald-200/70":"border-white/10 bg-white/[.04] text-white/35 hover:border-[#c9b3ff]/30 hover:text-[#c9b3ff]"}`}>{isSavedTemplate(message.message)?<Check className="h-3 w-3"/>:<Plus className="h-3 w-3"/>}</button>}<div className={`max-w-[78%] rounded-[18px] px-4 py-3 text-xs leading-5 ${message.sender === "customer" ? "rounded-bl-md bg-white/[.07] text-white/75" : "rounded-br-md bg-[#c9b3ff] text-[#17131f]"}`}><p className="whitespace-pre-wrap break-words">{message.message}</p><p className={`mt-1 text-[8px] ${message.sender === "customer"?"text-white/25":"text-black/35"}`}>{message.sender === "customer"?"Customer":"HUME reply"} · {time(message.createdAt)}</p></div></div>)}</div>
          <div className="border-t border-white/[.07] bg-[#131315] p-3"><div className="mb-2 grid grid-cols-[1fr_auto] gap-2"><button type="button" onClick={()=>setTemplatesOpen(value=>!value)} className="flex items-center justify-between rounded-xl border border-[#c9b3ff]/15 bg-[#c9b3ff]/[.055] px-3 py-2.5 text-left"><span><b className="block text-[11px] font-semibold text-white/85">Quick replies</b><small className="mt-0.5 block text-[9px] text-white/40">Scroll through every category</small></span><ChevronDown className={`h-4 w-4 text-[#c9b3ff]/60 transition-transform ${templatesOpen?"rotate-180":""}`}/></button><button type="button" onClick={()=>void createAiDraft()} disabled={aiLoading||sending||savingControl} className="flex min-w-[86px] flex-col items-center justify-center rounded-xl border border-[#d8f39a]/15 bg-[#d8f39a]/[.06] px-3 text-[#d8f39a]/75 hover:border-[#d8f39a]/30 hover:bg-[#d8f39a]/10 disabled:opacity-40"><Sparkles className="h-4 w-4"/><span className="mt-1 text-[8px] font-bold uppercase tracking-[.1em]">{aiLoading?"Thinking…":"AI draft"}</span></button></div>{templatesOpen&&<div className="mb-3 max-h-[48dvh] space-y-3 overflow-y-auto rounded-2xl border border-[#c9b3ff]/15 bg-[#0d0d0f] p-2.5 [scrollbar-color:rgba(201,179,255,.25)_transparent] [scrollbar-width:thin] md:max-h-72">{customTemplates.length>0&&<section><h3 className="mb-1.5 px-1 text-[9px] font-bold uppercase tracking-[.16em] text-emerald-200/60">Saved replies</h3><div className="grid gap-1.5 xl:grid-cols-2">{customTemplates.map(template=><button key={template} type="button" onClick={()=>{setText(template);setTemplatesOpen(false);window.setTimeout(()=>replyRef.current?.focus(),0);}} className="rounded-lg border border-emerald-300/10 bg-emerald-300/[.045] px-3 py-2 text-left text-[10px] leading-4 text-white/65 hover:border-emerald-300/25 hover:text-white/90">{template}</button>)}</div></section>}{Object.entries(TEMPLATE_GROUPS).map(([key,group])=><section key={key}><h3 className="mb-1.5 px-1 text-[9px] font-bold uppercase tracking-[.16em] text-[#c9b3ff]/55">{group.label}</h3><div className="grid gap-1.5 xl:grid-cols-2">{group.replies.map(template=><button key={template} type="button" onClick={()=>{setText(template);setTemplatesOpen(false);window.setTimeout(()=>replyRef.current?.focus(),0);}} className="rounded-lg border border-white/[.07] bg-[#1c1c20] px-3 py-2 text-left text-[10px] leading-4 text-white/65 transition hover:border-[#c9b3ff]/35 hover:bg-[#24222a] hover:text-white/90">{template}</button>)}</div></section>)}</div>}{aiSuggestion&&suggestionTarget.current===selectedId&&<div className="mb-3 rounded-xl border border-[#c9b3ff]/25 bg-[#c9b3ff]/5 p-3"><p className="mb-2 text-[10px] font-semibold text-[#c9b3ff]">AI suggested reply · not sent</p><p className="max-h-40 overflow-y-auto whitespace-pre-wrap text-xs text-white/70">{aiSuggestion}</p><button type="button" disabled={sending} onClick={()=>{setText(aiSuggestion);setAiSuggestion("");replyRef.current?.focus();}} className="mt-2 rounded-lg bg-[#c9b3ff] px-3 py-2 text-xs font-semibold text-black">Use suggestion in composer</button></div>}{aiError&&<p className="mb-2 rounded-lg bg-red-400/10 px-3 py-2 text-[9px] text-red-200/70">{aiError}</p>}<form onSubmit={send} className="flex items-end gap-2 rounded-2xl border border-white/[.09] bg-white/[.04] p-2 focus-within:border-[#c9b3ff]/35"><button type="button" onClick={addLink} aria-label="Add link" title="Add link" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[.07] text-white/35 hover:border-[#c9b3ff]/25 hover:text-[#c9b3ff]"><Link2 className="h-4 w-4"/></button><textarea ref={replyRef} value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();e.currentTarget.form?.requestSubmit();}}} rows={1} disabled={sending} maxLength={1200} placeholder="Reply to this customer…" className="max-h-28 min-h-9 flex-1 resize-none bg-transparent px-2 py-2 text-xs text-white outline-none placeholder:text-white/25"/><button disabled={!text.trim()||sending||savingControl} className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#c9b3ff] text-[#17131f] disabled:opacity-30">{sending?<Loader2 className="h-4 w-4 animate-spin"/>:<ArrowUp className="h-4 w-4"/>}</button></form><p className="mt-2 flex items-center gap-1 text-[9px] text-white/20"><Sparkles className="h-3 w-3"/>{selected.handlingMode === "ai" ? "AI answers automatically. Take over or send a reply to pause it." : "You control this conversation. AI drafts are suggestions and are never sent automatically."}</p></div>
        </>}
      </div>
    </section>
  </main>;
}
