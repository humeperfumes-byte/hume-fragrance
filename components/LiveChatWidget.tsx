"use client";

import { FormEvent, KeyboardEvent, useCallback, useEffect, useRef, useState } from "react";
import { chatCutoff } from "@/lib/live-chat-retention";
import { ArrowUp, ChevronDown, Copy, ExternalLink, MessageCircle, RotateCcw, X } from "lucide-react";

type Msg = { id: string; sender: "customer" | "admin" | "ai"; message: string; createdAt: string; status?: "sending" | "failed" };
type Identity = { sessionId: string; token: string };
const SESSION_KEY = "hume_live_chat_session";
const LAST_READ_KEY = "hume_live_chat_last_read_at";
const QUICK_QUESTIONS = [
  "I’d like to talk to a human",
  "Help me choose a perfume",
  "Any offers or deals available?",
  "Which perfume lasts longest?",
  "Suggest a perfume for men",
  "Suggest a perfume for women",
  "Help me choose a gift",
  "Tell me about the Discovery Set",
  "How long does delivery take?",
  "Which fragrance gets compliments?",
];
const messageTime = (value: string) => new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit" }).format(new Date(value));

function MessageText({ text, customer }: { text: string; customer: boolean }) {
  const lines = text.split("\n");
  return <>{lines.map((line, lineIndex) => {
    const recommendation = line.match(/^(\d+\.\s*)(.+?)(\s+—.*)$/);
    if (recommendation) {
      return <span key={`${line}-${lineIndex}`}>{lineIndex > 0 && <br/>}{recommendation[1]}<strong className="font-semibold">{recommendation[2]}</strong>{recommendation[3]}</span>;
    }
    const parts = line.split(/(https?:\/\/[^\s]+)/g);
    return <span key={`${line}-${lineIndex}`}>{lineIndex > 0 && <br/>}{parts.map((part, index) => part.match(/^https?:\/\//) ? <span key={`${part}-${index}`} className={`mt-2 flex items-center gap-1.5 rounded-lg px-2 py-1.5 ${customer ? "bg-black/10" : "bg-white/[.06]"}`}><a href={part} target="_blank" rel="noopener noreferrer" className="min-w-0 flex-1 truncate underline underline-offset-2">{part}</a><ExternalLink className="h-3 w-3 shrink-0"/><button type="button" onClick={()=>void navigator.clipboard.writeText(part)} aria-label="Copy link" className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md hover:bg-black/10"><Copy className="h-3 w-3"/></button></span> : <span key={`${part}-${index}`}>{part}</span>)}</span>;
  })}</>;
}

let memoryIdentity: Identity | undefined;
function identity(reset = false): Identity {
  if (!reset) {
    try {
      const saved = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
      if (typeof saved?.sessionId === "string" && saved.sessionId.length > 0 && saved.sessionId.length <= 255 &&
          typeof saved.token === "string" && saved.token.length >= 32 && saved.token.length <= 255) return saved;
    } catch {}
    if (memoryIdentity) return memoryIdentity;
  }
  const next = { sessionId: crypto.randomUUID(), token: crypto.randomUUID() + crypto.randomUUID() };
  memoryIdentity = next;
  try { localStorage.setItem(SESSION_KEY, JSON.stringify(next)); } catch {}
  return next;
}

function merge(current: Msg[], incoming: Msg[]) {
  const cutoff = chatCutoff().getTime();
  const byId = new Map(current.filter(item => Date.parse(item.createdAt) >= cutoff).map(item => [item.id, item]));
  for (const item of incoming) byId.set(item.id, item);
  const next = [...byId.values()].sort((a,b) => a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id));
  return next.length === current.length && next.every((item, index) =>
    item.id === current[index].id && item.status === current[index].status && item.createdAt === current[index].createdAt,
  ) ? current : next;
}

export default function LiveChatWidget() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [sending, setSending] = useState(false);
  const [handlingMode, setHandlingMode] = useState("ai");
  const [chatStatus, setChatStatus] = useState("open");
  const [showQuestions, setShowQuestions] = useState(true);
  const [auth, setAuth] = useState<Identity>();
  const [hasUnread, setHasUnread] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [connection, setConnection] = useState("loading");
  const [awaiting, setAwaiting] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const panelRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const nearBottom = useRef(true);
  const firstPoll = useRef(true);
  const lastReadAt = useRef(0);
  const sendingRef = useRef(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const latest = messages.at(-1);
  const waitingForReply = awaiting && connection === "ready" && handlingMode === "ai" && latest?.sender === "customer" && !latest.status;

  useEffect(() => {
    try {
      lastReadAt.current = Number(localStorage.getItem(LAST_READ_KEY) || 0);
      if (localStorage.getItem(SESSION_KEY)) {
        const timer = window.setTimeout(() => setAuth(current => current ?? identity()), 0);
        return () => clearTimeout(timer);
      }
    } catch {}
  }, []);

  const fetchHistory = useCallback(async (active: Identity, signal: AbortSignal, before?: string) => {
    const query = new URLSearchParams({ sessionId: active.sessionId });
    if (before) query.set("before", before);
    const response = await fetch("/api/live-chat/messages?" + query, { headers: { "x-chat-token": active.token }, cache: "no-store", signal });
    if (response.status === 403) return null;
    if (!response.ok) throw new Error("Chat history unavailable");
    return await response.json() as { messages: Msg[]; handlingMode: string; status?: string; hasMore: boolean };
  }, []);

  useEffect(() => {
    if (!auth) return;
    const controller = new AbortController();
    let timer: number;
    const poll = async () => {
      if (!document.hidden) {
        try {
          const data = await fetchHistory(auth, AbortSignal.timeout(8000));
          if (controller.signal.aborted) return;
          setLoadingHistory(false);
          if (!data) { setConnection("invalid"); return; }
          setConnection("ready");
          setHandlingMode(data.handlingMode);
          setChatStatus(data.status ?? "open");
          if (firstPoll.current) {
            setHasMore(data.hasMore);
            if (data.messages.length) setShowQuestions(false);
            firstPoll.current = false;
          }
          setMessages(current => merge(current, data.messages));
          const newest = Math.max(0, ...data.messages.filter(item => item.sender !== "customer").map(item => Date.parse(item.createdAt)));
          if (newest > lastReadAt.current) {
            if (!open) setHasUnread(true);
            else {
              lastReadAt.current = newest;
              try { localStorage.setItem(LAST_READ_KEY, String(newest)); } catch {}
            }
          }
        } catch { if (!controller.signal.aborted) { setConnection("offline"); setLoadingHistory(false); } }
      }
      if (!controller.signal.aborted) timer = window.setTimeout(poll, open ? 2500 : 12000);
    };
    void poll();
    return () => { controller.abort(); clearTimeout(timer); };
  }, [auth, fetchHistory, open]);

  const openChat = () => {
    setAuth(current => current ?? identity());
    nearBottom.current = true;
    setHasUnread(false);
    setOpen(true);
  };
  const closeChat = () => {
    setOpen(false);
    requestAnimationFrame(() => triggerRef.current?.focus());
  };
  const loadOlder = async () => {
    const first = messages.find(item => !item.status);
    const panel = panelRef.current;
    if (!auth || !first || !panel || loadingOlder) return;
    setLoadingOlder(true);
    const { scrollHeight, scrollTop } = panel;
    try {
      const data = await fetchHistory(auth, AbortSignal.timeout(8000), first.id);
      if (!data) { setConnection("invalid"); return; }
      nearBottom.current = false;
      setHasMore(data.hasMore);
      setMessages(current => merge(current, data.messages));
      requestAnimationFrame(() => { panel.scrollTop = scrollTop + panel.scrollHeight - scrollHeight; });
    } catch { setConnection("offline"); }
    finally { setLoadingOlder(false); }
  };
  useEffect(() => { if (open) closeRef.current?.focus(); }, [open]);
  useEffect(() => {
    const panel = panelRef.current;
    if (open && panel && nearBottom.current) panel.scrollTop = panel.scrollHeight;
  }, [messages, open]);
  useEffect(() => {
    if (!awaiting) return;
    const timer = window.setTimeout(() => setAwaiting(false), 45000);
    return () => clearTimeout(timer);
  }, [awaiting]);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") closeChat();
      if (event.key !== "Tab") return;
      const focusable = [...(dialogRef.current?.querySelectorAll<HTMLElement>(
        "button:not(:disabled), textarea:not(:disabled), a[href]",
      ) ?? [])];
      const first = focusable[0], last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  const sendMessage = async (value: string, retryId?: string) => {
    const message = value.trim();
    if (!message || !auth || sendingRef.current || connection === "invalid") return;
    sendingRef.current = true;
    nearBottom.current = true;
    setSending(true);
    if (!retryId && text.trim() === message) setText("");
    setShowQuestions(false);
    const pending: Msg = { id: retryId ?? crypto.randomUUID(), sender: "customer", message, createdAt: new Date().toISOString(), status: "sending" };
    setMessages(current => merge(current, [pending]));
    try {
      const response = await fetch("/api/live-chat/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...auth, messageId: pending.id, message, page: location.pathname }), signal: AbortSignal.timeout(10000),
      });
      if (response.status === 403) setConnection("invalid");
      if (!response.ok) throw new Error("Message was not confirmed");
      const data = await response.json() as { message: Msg; handlingMode: string };
      setMessages(current => merge(current, [data.message]));
      setHandlingMode(data.handlingMode);
      setChatStatus(data.handlingMode === "manual" ? "waiting" : "open");
      setAwaiting(true);
    } catch {
      setMessages(current => current.map(item => item.id === pending.id && item.status === "sending" ? { ...item, status: "failed" } : item));
    } finally { sendingRef.current = false; setSending(false); }
  };

  const send = (event: FormEvent) => {
    event.preventDefault();
    void sendMessage(text);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); }
  };

  return <>
    {!open && <button ref={triggerRef} type="button" onClick={openChat} aria-label={hasUnread ? "New message—open chat" : "Chat to our team"} className="group fixed bottom-20 right-0 z-40 flex h-[58px] min-w-[126px] items-center gap-2.5 overflow-hidden rounded-l-[19px] border border-r-0 border-[#aa8a50]/25 bg-[linear-gradient(115deg,rgba(255,253,248,.96),rgba(244,237,224,.9))] px-3 text-left text-[#191713] shadow-[-9px_10px_30px_rgba(50,39,20,.15)] backdrop-blur-xl backdrop-saturate-150 transition-[padding,box-shadow] duration-200 hover:pl-3.5 hover:shadow-[-11px_13px_34px_rgba(50,39,20,.2)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a77b2f] md:bottom-7"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#191713] shadow-[0_4px_12px_rgba(25,23,19,.2),inset_0_1px_0_rgba(255,255,255,.12)]"><MessageCircle className="h-4 w-4 stroke-[1.7] text-[#e8c878]" /></span><span className="flex flex-col">{hasUnread && <span className="mb-1 inline-flex items-center gap-1 text-[7px] font-bold uppercase leading-none tracking-[.12em] text-[#8a682b]"><span className="relative flex h-1.5 w-1.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#76a916] opacity-60"/><span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#76a916]"/></span>New message</span>}<span className="font-serif text-[18px] font-semibold leading-[15px] tracking-[-.02em]">Chat</span><span className="mt-1 text-[7px] font-bold uppercase leading-none tracking-[.14em] text-[#876b39]">to our team</span></span><span aria-hidden="true" className="absolute inset-x-2 top-0 h-px bg-gradient-to-r from-transparent via-white to-white/20" /><span aria-hidden="true" className="absolute bottom-0 left-10 right-0 h-px bg-gradient-to-r from-[#b58b3e]/45 to-transparent" /></button>}
    {open && <><button tabIndex={-1} type="button" aria-label="Close live chat" onClick={closeChat} className="fixed inset-0 z-[69] bg-black/55 backdrop-blur-[2px] animate-in fade-in duration-200 md:bg-black/20" /><section ref={dialogRef} role="dialog" aria-modal="true" aria-label="HUME live chat" className="fixed inset-x-0 bottom-0 z-[70] flex h-[82dvh] max-h-[680px] flex-col overflow-hidden rounded-t-[30px] border border-white/10 bg-[#0d100c] text-white shadow-[0_-24px_80px_rgba(0,0,0,.35)] animate-in slide-in-from-bottom-8 duration-300 md:inset-auto md:bottom-6 md:right-6 md:h-[600px] md:w-[390px] md:rounded-[28px]">
      <div className="mx-auto mt-2 h-1 w-9 rounded-full bg-white/25 md:hidden" />
      <header className="relative border-b border-white/[.07] bg-[radial-gradient(circle_at_top_right,rgba(207,255,100,.1),transparent_42%),linear-gradient(135deg,#11150f,#0b0d0a)] px-4 pb-3 pt-2.5 text-white">
        <button ref={closeRef} type="button" onClick={closeChat} aria-label="Close live chat" className="absolute right-3 top-2.5 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/10 hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"><X className="h-4 w-4" /></button>
        <p className="text-[9px] font-bold uppercase tracking-[.18em] text-[#d8f39a]">HUME support</p>
        <h2 className="mt-1 pr-11 font-serif text-[23px] font-light leading-tight">Hi, how can I help?</h2>
        <p className="mt-0.5 flex items-center text-[10px] text-white/55"><span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-[#b8dc69] shadow-[0_0_8px_rgba(184,220,105,.55)]" />{chatStatus === "waiting" ? "Waiting for the HUME team" : chatStatus === "closed" || chatStatus === "resolved" ? "Send a message to reopen this chat" : handlingMode === "manual" ? "With the HUME team" : "AI assistance · human support available"}</p>
      </header>
      <div ref={panelRef} onScroll={event => { const panel = event.currentTarget; nearBottom.current = panel.scrollHeight - panel.scrollTop - panel.clientHeight < 72; }} role="log" aria-label="Conversation" className="flex-1 space-y-2 overflow-y-auto bg-[radial-gradient(circle_at_15%_30%,rgba(207,255,100,.035),transparent_32%)] px-4 py-4 [scrollbar-color:rgba(216,243,154,.28)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-button]:hidden [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#d8f39a]/25 [&::-webkit-scrollbar-thumb:hover]:bg-[#d8f39a]/40 [&::-webkit-scrollbar-track]:bg-transparent">
        {loadingHistory && <p className="text-sm text-white/70">Loading conversation…</p>}
        {connection === "offline" && <p role="status" className="rounded-lg bg-white/10 p-3 text-sm">Chat connection interrupted. Reconnecting…</p>}
        {connection === "invalid" && <div role="status" className="rounded-lg bg-white/10 p-3 text-sm">This browser can’t access the previous chat. <button type="button" disabled={sending || loadingOlder} className="underline" onClick={() => { firstPoll.current = true; setMessages([]); setHasMore(false); setConnection("loading"); setAuth(identity(true)); }}>Start a new chat</button></div>}
        {hasMore && <button type="button" disabled={loadingOlder} onClick={() => void loadOlder()} className="mx-auto block rounded-lg border border-white/20 px-3 py-2 text-sm">{loadingOlder ? "Loading…" : "Load earlier messages"}</button>}
        {!messages.length && connection === "ready" && <div className="flex items-end gap-2"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#d8f39a] text-[10px] font-bold text-[#11150f]">H</span><div className="max-w-[78%] rounded-[20px] rounded-bl-md bg-[#292c28] px-4 py-3 text-[13px] leading-5 text-white/90">Hi! I’m HUME’s AI assistant. I can help you choose a fragrance or connect you with our team.</div></div>}
        {messages.map(item => <div key={item.id} className={`flex items-end gap-2 ${item.sender === "customer" ? "justify-end" : "justify-start"}`}>{item.sender !== "customer" && <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#d8f39a] text-[10px] font-bold text-[#11150f]">H</span>}<div className={`max-w-[78%] ${item.sender === "customer" ? "text-right" : "text-left"}`}><div className={`whitespace-pre-line [overflow-wrap:anywhere] rounded-[20px] px-4 py-3 text-left text-[13px] leading-5 ${item.sender === "customer" ? "rounded-br-md bg-[#d8f39a] text-[#11150f]" : "rounded-bl-md bg-[#292c28] text-white/90"}`}><MessageText text={item.message} customer={item.sender === "customer"}/></div><div className={`mt-1 flex items-center gap-1.5 px-1 text-[9px] ${item.sender === "customer" ? "justify-end" : "justify-start"} ${item.status === "failed" ? "text-[#ef9b91]" : "text-white/30"}`}><span>{item.status === "sending" ? "Sending…" : item.status === "failed" ? "Couldn’t send" : messageTime(item.createdAt)}</span>{item.status === "failed" && <button type="button" disabled={sending || connection === "invalid"} onClick={() => void sendMessage(item.message, item.id)} className="inline-flex items-center gap-1 font-medium text-[#d8f39a]"><RotateCcw className="h-2.5 w-2.5" />Retry</button>}</div></div></div>)}
        {waitingForReply && <div className="flex items-end gap-2" aria-label="HUME assistant is replying"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#d8f39a] text-[10px] font-bold text-[#11150f]">H</span><div className="flex h-10 items-center gap-1 rounded-[18px] rounded-bl-md bg-[#292c28] px-4"><span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/55 [animation-delay:-.3s]"/><span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/55 [animation-delay:-.15s]"/><span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/55"/></div></div>}
      </div>
      <form onSubmit={send} className="border-t border-white/[.07] bg-[#11140f]/95 px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-3 backdrop-blur">
        {!!messages.length && <button type="button" onClick={() => setShowQuestions(value => !value)} className="mb-2 flex items-center gap-1 text-[10px] font-medium text-white/45 hover:text-white/70">Common questions <ChevronDown className={`h-3 w-3 transition-transform ${showQuestions ? "rotate-180" : ""}`} /></button>}
        {showQuestions && <div className="mb-2.5 grid grid-flow-col grid-rows-2 gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">{QUICK_QUESTIONS.map(question => <button key={question} type="button" disabled={sending || connection === "invalid"} onClick={() => void sendMessage(question)} className="whitespace-nowrap rounded-full border border-white/10 bg-white/[.06] px-2.5 py-1.5 text-[10px] leading-4 text-white/65 transition-colors hover:border-[#d8f39a]/35 hover:bg-[#d8f39a]/10 hover:text-white disabled:opacity-40">{question}</button>)}</div>}
        <p className="mb-2 text-xs text-white/60">Chat history is kept for five days.</p>
        <div className="flex items-end gap-2 rounded-[18px] border border-white/10 bg-[#222520] p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,.04)] focus-within:border-[#cfff64]/40 focus-within:ring-2 focus-within:ring-[#cfff64]/10">
          <textarea aria-label="Chat message" value={text} onChange={e => setText(e.target.value)} onKeyDown={onKeyDown} rows={1} maxLength={1200} placeholder="Write a message..." className="max-h-24 min-h-9 flex-1 resize-none bg-transparent px-2 py-2 text-sm text-white outline-none placeholder:text-white/30" />
          <button type="submit" disabled={sending || connection === "invalid" || !text.trim()} aria-label={sending ? "Sending message" : "Send message"} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[13px] bg-[#d8f39a] text-[#11150f] hover:bg-[#e2f8ad] disabled:opacity-30"><ArrowUp className="h-[18px] w-[18px]" /></button>
        </div>
      </form>
    </section></>}
  </>;
}
