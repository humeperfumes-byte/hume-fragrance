"use client";

import { FormEvent, KeyboardEvent, useCallback, useEffect, useRef, useState } from "react";
import { ArrowUp, ChevronDown, Copy, ExternalLink, MessageCircle, RotateCcw, X } from "lucide-react";

type Msg = { id: string; sender: "customer" | "admin"; message: string; createdAt: string; status?: "sending" | "failed" };
type Identity = { sessionId: string; token: string };
const SESSION_KEY = "hume_live_chat_session";
const CART_SESSION_KEY = "hume_cart_session_id";
const CHECKOUT_SESSION_KEY = "hume_checkout_session_id";
const LAST_READ_KEY = "hume_live_chat_last_read_at";
const QUICK_QUESTIONS = [
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

function identity(): Identity {
  try {
    const saved = localStorage.getItem(SESSION_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as Partial<Identity>;
      if (parsed.sessionId && parsed.token) {
        const cartSessionId = localStorage.getItem(CART_SESSION_KEY);
        if (cartSessionId && cartSessionId !== parsed.sessionId) {
          const linked = { sessionId: cartSessionId, token: `${crypto.randomUUID()}${crypto.randomUUID()}` };
          localStorage.setItem(SESSION_KEY, JSON.stringify(linked));
          localStorage.setItem(CHECKOUT_SESSION_KEY, cartSessionId);
          return linked;
        }
        if (!localStorage.getItem(CART_SESSION_KEY)) localStorage.setItem(CART_SESSION_KEY, parsed.sessionId);
        if (!localStorage.getItem(CHECKOUT_SESSION_KEY)) localStorage.setItem(CHECKOUT_SESSION_KEY, parsed.sessionId);
        return parsed as Identity;
      }
    }
  } catch { localStorage.removeItem(SESSION_KEY); }
  const linkedSessionId = localStorage.getItem(CART_SESSION_KEY) || localStorage.getItem(CHECKOUT_SESSION_KEY);
  const value = { sessionId: linkedSessionId || crypto.randomUUID(), token: `${crypto.randomUUID()}${crypto.randomUUID()}` };
  localStorage.setItem(SESSION_KEY, JSON.stringify(value));
  localStorage.setItem(CART_SESSION_KEY, value.sessionId);
  localStorage.setItem(CHECKOUT_SESSION_KEY, value.sessionId);
  return value;
}

export default function LiveChatWidget() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [sending, setSending] = useState(false);
  const [showQuestions, setShowQuestions] = useState(true);
  const [chatReady, setChatReady] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const openedAt = useRef(0), last = useRef(""), end = useRef<HTMLDivElement>(null);
  const lastReadAt = useRef(0);
  const latestMessage = messages.at(-1);
  const waitingForReply = latestMessage?.sender === "customer" && latestMessage.status !== "failed";

  const activateChat = useCallback(async () => {
    const auth = identity();
    try {
      const response = await fetch("/api/live-chat/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...auth, page: location.pathname }),
        signal: AbortSignal.timeout(8_000),
      });
      if (response.ok) setChatReady(true);
    } catch { /* The next cart event or chat open will retry. */ }
  }, []);

  useEffect(() => {
    lastReadAt.current = Number(localStorage.getItem(LAST_READ_KEY) || 0);
    if (localStorage.getItem(SESSION_KEY) || localStorage.getItem(CART_SESSION_KEY)) void activateChat();
    const activateForCart = (event: Event) => {
      const detail = (event as CustomEvent<{ eventType?: string; payload?: Record<string, unknown> }>).detail;
      if (detail?.eventType === "add_to_cart" || (detail?.eventType === "cart_open" && Number(detail.payload?.itemCount || 0) > 0)) {
        void activateChat();
      }
    };
    window.addEventListener("hume:tracking", activateForCart as EventListener);
    return () => window.removeEventListener("hume:tracking", activateForCart as EventListener);
  }, [activateChat]);

  useEffect(() => {
    if (!open && !chatReady) return;
    if (open) openedAt.current = Date.now();
    const auth = identity();
    let timer: number | undefined, stopped = false;
    const poll = async () => {
      if (stopped) return;
      if (!document.hidden) {
        try {
          const query = new URLSearchParams(auth);
          if (last.current) query.set("after", last.current);
          const response = await fetch(`/api/live-chat/messages?${query}`, { cache: "no-store", signal: AbortSignal.timeout(8_000) });
          if (response.ok) {
            const data = await response.json() as { messages: Msg[] };
            if (data.messages.length) {
              if (!open && data.messages.some(message => message.sender === "admin" && new Date(message.createdAt).getTime() > lastReadAt.current)) {
                setHasUnread(true);
              }
              setMessages(current => [...current.filter(a => !data.messages.some(b => b.id === a.id || (a.status === "sending" && a.sender === b.sender && a.message === b.message))), ...data.messages]);
              last.current = data.messages.at(-1)?.createdAt ?? "";
            }
          }
        } catch { /* Retry quietly on the next poll. */ }
      }
      const age = Date.now() - openedAt.current;
      timer = window.setTimeout(poll, document.hidden ? 15_000 : open ? (age < 60_000 ? 1_500 : age < 300_000 ? 3_000 : 10_000) : 5_000);
    };
    void poll();
    return () => { stopped = true; if (timer) clearTimeout(timer); };
  }, [chatReady, open]);

  const openChat = () => {
    const now = Date.now();
    lastReadAt.current = now;
    localStorage.setItem(LAST_READ_KEY, String(now));
    setHasUnread(false);
    setOpen(true);
    void activateChat();
  };

  useEffect(() => { if (open) end.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, open]);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  const sendMessage = async (value: string, retryId?: string) => {
    const message = value.trim();
    if (!message || sending) return;
    setSending(true); setText(""); setShowQuestions(false);
    const auth = identity();
    setChatReady(true);
    const pending: Msg = { id: retryId ?? `pending-${crypto.randomUUID()}`, sender: "customer", message, createdAt: new Date().toISOString(), status: "sending" };
    setMessages(current => retryId ? current.map(item => item.id === retryId ? pending : item) : [...current, pending]);
    try {
      const response = await fetch("/api/live-chat/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...auth, message, page: location.pathname }), signal: AbortSignal.timeout(10_000),
      });
      if (!response.ok) throw new Error();
      const data = await response.json() as { message: Msg };
      setMessages(current => [...current.filter(item => item.id !== pending.id && item.id !== data.message.id), data.message]);
      last.current = data.message.createdAt; openedAt.current = Date.now();
    } catch {
      setMessages(current => current.map(item => item.id === pending.id ? { ...item, status: "failed" } : item));
    } finally { setSending(false); }
  };

  const send = (event: FormEvent) => {
    event.preventDefault();
    void sendMessage(text);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); }
  };

  return <>
    {!open && <button type="button" onClick={openChat} aria-label={hasUnread ? "New message—open chat" : "Chat to our team"} className="group fixed bottom-20 right-0 z-40 flex h-[58px] min-w-[126px] items-center gap-2.5 overflow-hidden rounded-l-[19px] border border-r-0 border-[#aa8a50]/25 bg-[linear-gradient(115deg,rgba(255,253,248,.96),rgba(244,237,224,.9))] px-3 text-left text-[#191713] shadow-[-9px_10px_30px_rgba(50,39,20,.15)] backdrop-blur-xl backdrop-saturate-150 transition-[padding,box-shadow] duration-200 hover:pl-3.5 hover:shadow-[-11px_13px_34px_rgba(50,39,20,.2)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a77b2f] md:bottom-7"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#191713] shadow-[0_4px_12px_rgba(25,23,19,.2),inset_0_1px_0_rgba(255,255,255,.12)]"><MessageCircle className="h-4 w-4 stroke-[1.7] text-[#e8c878]" /></span><span className="flex flex-col">{hasUnread && <span className="mb-1 inline-flex items-center gap-1 text-[7px] font-bold uppercase leading-none tracking-[.12em] text-[#8a682b]"><span className="relative flex h-1.5 w-1.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#76a916] opacity-60"/><span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#76a916]"/></span>New message</span>}<span className="font-serif text-[18px] font-semibold leading-[15px] tracking-[-.02em]">Chat</span><span className="mt-1 text-[7px] font-bold uppercase leading-none tracking-[.14em] text-[#876b39]">to our team</span></span><span aria-hidden="true" className="absolute inset-x-2 top-0 h-px bg-gradient-to-r from-transparent via-white to-white/20" /><span aria-hidden="true" className="absolute bottom-0 left-10 right-0 h-px bg-gradient-to-r from-[#b58b3e]/45 to-transparent" /></button>}
    {open && <><button type="button" aria-label="Close live chat" onClick={() => setOpen(false)} className="fixed inset-0 z-[69] bg-black/55 backdrop-blur-[2px] animate-in fade-in duration-200 md:bg-black/20" /><section role="dialog" aria-modal="true" aria-label="HUME live chat" className="fixed inset-x-0 bottom-0 z-[70] flex h-[82dvh] max-h-[680px] flex-col overflow-hidden rounded-t-[30px] border border-white/10 bg-[#0d100c] text-white shadow-[0_-24px_80px_rgba(0,0,0,.35)] animate-in slide-in-from-bottom-8 duration-300 md:inset-auto md:bottom-6 md:right-6 md:h-[600px] md:w-[390px] md:rounded-[28px]">
      <div className="mx-auto mt-2 h-1 w-9 rounded-full bg-white/25 md:hidden" />
      <header className="relative border-b border-white/[.07] bg-[radial-gradient(circle_at_top_right,rgba(207,255,100,.1),transparent_42%),linear-gradient(135deg,#11150f,#0b0d0a)] px-4 pb-3 pt-2.5 text-white">
        <button type="button" onClick={() => setOpen(false)} aria-label="Close live chat" className="absolute right-3 top-2.5 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/10 hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"><X className="h-4 w-4" /></button>
        <p className="text-[9px] font-bold uppercase tracking-[.18em] text-[#d8f39a]">Prakhar from HUME</p>
        <h2 className="mt-1 pr-11 font-serif text-[23px] font-light leading-tight">Hi, how can I help?</h2>
        <p className="mt-0.5 flex items-center text-[10px] text-white/55"><span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-[#b8dc69] shadow-[0_0_8px_rgba(184,220,105,.55)]" />Online now</p>
      </header>
      <div aria-live="polite" className="flex-1 space-y-2 overflow-y-auto bg-[radial-gradient(circle_at_15%_30%,rgba(207,255,100,.035),transparent_32%)] px-4 py-4 [scrollbar-color:rgba(216,243,154,.28)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-button]:hidden [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#d8f39a]/25 [&::-webkit-scrollbar-thumb:hover]:bg-[#d8f39a]/40 [&::-webkit-scrollbar-track]:bg-transparent">
        <div className="flex items-end gap-2"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#d8f39a] text-[10px] font-bold text-[#11150f]">P</span><div className="max-w-[78%] rounded-[20px] rounded-bl-md bg-[#292c28] px-4 py-3 text-[13px] leading-5 text-white/90">Hey, I&apos;m Prakhar. How can I help you?</div></div>
        {messages.map(item => <div key={item.id} className={`flex items-end gap-2 ${item.sender === "customer" ? "justify-end" : "justify-start"}`}>{item.sender === "admin" && <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#d8f39a] text-[10px] font-bold text-[#11150f]">P</span>}<div className={`max-w-[78%] ${item.sender === "customer" ? "text-right" : "text-left"}`}><div className={`whitespace-pre-line rounded-[20px] px-4 py-3 text-left text-[13px] leading-5 ${item.sender === "customer" ? "rounded-br-md bg-[#d8f39a] text-[#11150f]" : "rounded-bl-md bg-[#292c28] text-white/90"}`}><MessageText text={item.message} customer={item.sender === "customer"}/></div><div className={`mt-1 flex items-center gap-1.5 px-1 text-[9px] ${item.sender === "customer" ? "justify-end" : "justify-start"} ${item.status === "failed" ? "text-[#ef9b91]" : "text-white/30"}`}><span>{item.status === "sending" ? "Sending…" : item.status === "failed" ? "Couldn’t send" : messageTime(item.createdAt)}</span>{item.status === "failed" && <button type="button" disabled={sending} onClick={() => void sendMessage(item.message, item.id)} className="inline-flex items-center gap-1 font-medium text-[#d8f39a]"><RotateCcw className="h-2.5 w-2.5" />Retry</button>}</div></div></div>)}
        {waitingForReply && <div className="flex items-end gap-2" aria-label="Prakhar is typing"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#d8f39a] text-[10px] font-bold text-[#11150f]">P</span><div className="flex h-10 items-center gap-1 rounded-[18px] rounded-bl-md bg-[#292c28] px-4"><span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/55 [animation-delay:-.3s]"/><span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/55 [animation-delay:-.15s]"/><span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/55"/></div></div>}
        <div ref={end} />
      </div>
      <form onSubmit={send} className="border-t border-white/[.07] bg-[#11140f]/95 px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-3 backdrop-blur">
        {!!messages.length && <button type="button" onClick={() => setShowQuestions(value => !value)} className="mb-2 flex items-center gap-1 text-[10px] font-medium text-white/45 hover:text-white/70">Common questions <ChevronDown className={`h-3 w-3 transition-transform ${showQuestions ? "rotate-180" : ""}`} /></button>}
        {showQuestions && <div className="mb-2.5 grid grid-flow-col grid-rows-2 gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">{QUICK_QUESTIONS.map(question => <button key={question} type="button" disabled={sending} onClick={() => void sendMessage(question)} className="whitespace-nowrap rounded-full border border-white/10 bg-white/[.06] px-2.5 py-1.5 text-[10px] leading-4 text-white/65 transition-colors hover:border-[#d8f39a]/35 hover:bg-[#d8f39a]/10 hover:text-white disabled:opacity-40">{question}</button>)}</div>}
        <div className="flex items-end gap-2 rounded-[18px] border border-white/10 bg-[#222520] p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,.04)] focus-within:border-[#cfff64]/40 focus-within:ring-2 focus-within:ring-[#cfff64]/10">
          <textarea aria-label="Chat message" value={text} onChange={e => setText(e.target.value)} onKeyDown={onKeyDown} onFocus={() => setTimeout(() => end.current?.scrollIntoView({ behavior: "smooth" }), 250)} rows={1} maxLength={1200} placeholder="Write a message..." className="max-h-24 min-h-9 flex-1 resize-none bg-transparent px-2 py-2 text-sm text-white outline-none placeholder:text-white/30" />
          <button type="submit" disabled={sending || !text.trim()} aria-label={sending ? "Sending message" : "Send message"} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[13px] bg-[#d8f39a] text-[#11150f] hover:bg-[#e2f8ad] disabled:opacity-30"><ArrowUp className="h-[18px] w-[18px]" /></button>
        </div>
      </form>
    </section></>}
  </>;
}
