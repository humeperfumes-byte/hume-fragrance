"use client";

import { useState, useEffect, useRef } from "react";
import {
  Download,
  ArrowLeft,
  Copy,
  Check
} from "lucide-react";
import Link from "next/link";
import { toast } from "@/hooks/use-toast";
import {invoiceDefaults,invoiceDefaultsSchema,invoiceCompletionIssues} from "@/lib/invoice-workflow";
import { InvoiceEditor } from "./InvoiceEditor";
import type {InvoiceSuggestion} from '@/lib/invoice-suggestions';
import { CustomerDirectory } from "./CustomerDirectory";
import { InvoiceRecords } from "./InvoiceRecords";
import { SavedInvoiceLibrary } from "./SavedInvoiceLibrary";
import { calculateInvoice } from "@/lib/invoice-calculations";
import { InvoiceHistory } from "./InvoiceHistory";
import { invoiceFilename } from "@/lib/invoice-filename";
import { recoverableInvoiceSchema } from "@/lib/invoice-recovery";
import { invoiceSnapshotFingerprint, invoiceOptionDefaults, invoiceOptions, invoiceDocumentSchema, newInvoiceIdentity, duplicateInvoice, type InvoiceDocument, type InvoiceItem, type SavedInvoice } from "@/lib/invoice-document";

const recoveryKey = "hume-invoice-session-v1";
type Recovery = { document: InvoiceDocument; savedId: string | null; savedAt: string | null; savedSnapshot: string; title: string; pendingId?: string | null };
export default function InvoicePage({suggestions=[]}:{suggestions?:InvoiceSuggestion[]}) {
  const [mobileView, setMobileView] = useState("edit");
  const [zoomPreview, setZoomPreview] = useState(false);
  const [previewScale, setPreviewScale] = useState(1);
  const previewRef = useRef<HTMLElement>(null);
  const [recovery, setRecovery] = useState<Recovery | null>(null);
  const [recoveryReady, setRecoveryReady] = useState(false);
  const [recoveryStatus, setRecoveryStatus] = useState("");
  const [savedSuggestions,setSavedSuggestions]=useState<InvoiceSuggestion[]>([]);
  const defaultsLoaded=useRef(false);
  const rememberedDefaults=useRef<Partial<InvoiceDocument>>({});
  const [validationErrors, setValidationErrors] = useState<{path:string;message:string}[]>([]);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [savedSnapshot, setSavedSnapshot] = useState("");
  const [saveTitle, setSaveTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [customersOpen,setCustomersOpen]=useState(false);
  const [recordsId,setRecordsId]=useState<string|null>(null);
  const [registerVersion,setRegisterVersion]=useState(0);
  const [cancelled,setCancelled]=useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [editorInitialSection,setEditorInitialSection]=useState("Items");
  const pendingSaveId = useRef<string | null>(null);
  const [copying, setCopying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [exporting,setExporting]=useState(false);
  const [options,setOptions]=useState<ReturnType<typeof invoiceOptions>>(invoiceOptionDefaults);

  // 1. Seller Information (preset with HUME details)
  const [sellerName, setSellerName] = useState("HUME FRAGRANCE");
  const [sellerAddress, setSellerAddress] = useState("Vijay Tower, P Rd, Gandhinagar, Kanpur, Uttar Pradesh, 208012");
  const [sellerEmail, setSellerEmail] = useState("support@humefragrance.com");
  const [sellerPhone, setSellerPhone] = useState("+91 95590 24822");
  const [sellerGstin, setSellerGstin] = useState("");

  // 2. Buyer Information
  const [buyerName, setBuyerName] = useState("");
  const [buyerAddress, setBuyerAddress] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [buyerGstin, setBuyerGstin] = useState("");

  // 3. Invoice Metadata
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("Unpaid");
  const [showPaymentStatus, setShowPaymentStatus] = useState(false);

  // 4. Line Items
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: "1", name: "", category: "other", unit: "pcs", quantity: 1, price: 0, gstPercent: 18 }
  ]);

  // 5. Additional Settings
  const [targetGrandTotal, setTargetGrandTotal] = useState<string>("");
  const [shippingFee, setShippingFee] = useState<number>(0);
  const [bankDetails, setBankDetails] = useState("Name: \nAccount No.: \nIFSC Code: ");
  const [terms, setTerms] = useState("Goods once sold will not be taken back.");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const element = previewRef.current;
    if (!element) return;
    const observer = new ResizeObserver(() => setPreviewScale(Math.min(1, Math.max(0.1, (element.clientWidth - 24) / (210 * 96 / 25.4)))));
    observer.observe(element);
    return () => observer.disconnect();
  }, [mobileView]);
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(recoveryKey);
      if (raw) {
        const candidate = JSON.parse(raw);
        const parsed = recoverableInvoiceSchema.safeParse(candidate.document);
        if (parsed.success && (candidate.savedId === null || typeof candidate.savedId === "string") && (candidate.savedAt === null || typeof candidate.savedAt === "string") && typeof candidate.savedSnapshot === "string" && typeof candidate.title === "string") setRecovery({...candidate,document:parsed.data});
      }
    } catch { setRecoveryStatus("Draft recovery unavailable. Save drafts to keep your work."); }
    setRecoveryReady(true);
  }, []);
  // Set default dates on client mount (using local timezone offsets)
  useEffect(() => {
    const identity = newInvoiceIdentity();
    setInvoiceDate(identity.invoiceDate);
    setInvoiceNumber(identity.invoiceNumber);
    try {
      const raw=localStorage.getItem("hume-invoice-defaults-v1");
      if(raw){const defaults=invoiceDefaultsSchema.partial().parse(JSON.parse(raw));rememberedDefaults.current=defaults;setOptions(previous=>({...previous,...Object.fromEntries(Object.entries(defaults).filter(([key])=>key in invoiceOptionDefaults))}));setShowPaymentStatus(defaults.showPaymentStatus??false);const setters={sellerName:setSellerName,sellerAddress:setSellerAddress,sellerEmail:setSellerEmail,sellerPhone:setSellerPhone,sellerGstin:setSellerGstin,bankDetails:setBankDetails,terms:setTerms};for(const [key,setter] of Object.entries(setters)){const value=defaults[key as keyof typeof defaults];if(typeof value==="string"&&value.length<=4000)setter(value);}}
    } catch { /* Keep built-in defaults when storage is unavailable. */ }
  }, []);

  const invoiceData: InvoiceDocument = { ...options, sellerName, sellerAddress, sellerEmail, sellerPhone, sellerGstin, buyerName, buyerAddress, buyerEmail, buyerPhone, buyerGstin, invoiceNumber, invoiceDate, paymentStatus: paymentStatus as InvoiceDocument["paymentStatus"], showPaymentStatus, items, targetGrandTotal, shippingFee, bankDetails, terms, notes };
  const initialSnapshot = useRef<string | null>(null);
  if (invoiceNumber && !initialSnapshot.current) initialSnapshot.current = invoiceSnapshotFingerprint({ document: invoiceData, title: "" });
  const dirty = savedId ? savedSnapshot !== invoiceSnapshotFingerprint({ document: invoiceData, title: saveTitle }) : Boolean(initialSnapshot.current && initialSnapshot.current !== invoiceSnapshotFingerprint({ document: invoiceData, title: saveTitle }));
  const defaultsInput=JSON.stringify(invoiceData);
  const applyDefaults=useRef(applyInvoice);
  applyDefaults.current=applyInvoice;
  useEffect(()=>{
    if(!recoveryReady||recovery||dirty||savedId||defaultsLoaded.current)return;
    const controller=new AbortController();
    fetch("/api/admin/invoices/defaults",{cache:"no-store",signal:controller.signal}).then(response=>response.json()).then(result=>{
      if(controller.signal.aborted)return;
      defaultsLoaded.current=true;
      if(result.defaults){const defaults=invoiceDefaultsSchema.parse(result.defaults);rememberedDefaults.current=defaults;initialSnapshot.current=null;applyDefaults.current({...JSON.parse(defaultsInput),...defaults});}
    }).catch(()=>{});
    return()=>controller.abort();
  },[recoveryReady,recovery,dirty,savedId,defaultsInput]);
  const recoveryPayload = JSON.stringify({document:invoiceData,savedId,savedAt,savedSnapshot,title:saveTitle,pendingId:pendingSaveId.current});
  useEffect(() => {
    if (!recoveryReady || recovery) return;
    const timer = setTimeout(() => {
      try {
        if (dirty) { sessionStorage.setItem(recoveryKey, recoveryPayload); setRecoveryStatus("Draft backed up in this tab"); }
        else { sessionStorage.removeItem(recoveryKey); setRecoveryStatus(""); }
      } catch { setRecoveryStatus("Draft backup unavailable. Save your draft to keep your work."); }
    }, 600);
    return () => clearTimeout(timer);
  }, [recoveryPayload, dirty, recoveryReady, recovery]);
  function applyInvoice(data: InvoiceDocument) {
    setOptions({...invoiceOptions(data),issuedAt:data.issuedAt});
    setSellerName(data.sellerName); setSellerAddress(data.sellerAddress); setSellerEmail(data.sellerEmail); setSellerPhone(data.sellerPhone); setSellerGstin(data.sellerGstin);
    setBuyerName(data.buyerName); setBuyerAddress(data.buyerAddress); setBuyerEmail(data.buyerEmail); setBuyerPhone(data.buyerPhone); setBuyerGstin(data.buyerGstin);
    setInvoiceNumber(data.invoiceNumber); setInvoiceDate(data.invoiceDate); setPaymentStatus(data.showPaymentAmounts ? calculateInvoice(data).balanceDue===0 ? "Paid" : (data.amountReceived||0)>0 ? "Partially Paid" : "Unpaid" : data.paymentStatus); setItems(data.items);
    setShowPaymentStatus(data.showPaymentStatus ?? false);
    setTargetGrandTotal(data.targetGrandTotal); setShippingFee(data.shippingFee); setBankDetails(data.bankDetails); setTerms(data.terms); setNotes(data.notes);
  }
  useEffect(() => {
    if (!dirty) return;
    const handler = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);
  function openSaved(invoice: SavedInvoice, asNew: boolean) {
    if (saving) return;
    if (dirty && !window.confirm("Replace the current form? Unsaved changes will be lost.")) return;
    const normalized = { ...invoice.document, ...invoiceOptions(invoice.document), ...(invoice.document.lifecycle!=="issued" && "customerId" in invoice ? {customerId:invoice.customerId||undefined}:{}), issuedAt:invoice.document.issuedAt, showPaymentStatus: invoice.document.showPaymentStatus ?? false };
    const data = asNew ? duplicateInvoice({...normalized,customerId:invoice.customerId||normalized.customerId}) : normalized;
    setValidationErrors([]);setMobileView("edit");setEditorInitialSection(asNew?"Billing & shipping":"Items");
    setCancelled(!asNew && Boolean(invoice.ledger?.cancelled));
    applyInvoice(data); setSavedId(asNew ? null : invoice.id); setSavedAt(asNew ? null : invoice.updatedAt); setSaveTitle(asNew ? "" : invoice.title);
    setSavedSnapshot(asNew ? "" : invoiceSnapshotFingerprint({ document: data, title: invoice.title })); pendingSaveId.current = null; setLibraryOpen(false);
    toast({ title: asNew ? "New invoice from saved details" : "Saved invoice opened", description: asNew ? "Change the customer, address or items, then issue this new invoice. The original stays unchanged." : "Make your changes, then choose Update saved invoice." });
  }
  function startNewInvoice() {
    if (saving || (dirty && !window.confirm("Start a new invoice? Unsaved changes will be lost."))) return;
    applyInvoice({ ...invoiceData, ...rememberedDefaults.current, ...newInvoiceIdentity(), customerId:undefined, separateShipping:false, shippingName:"", shippingAddress:"", shippingPhone:"", buyerName: "", buyerAddress: "", buyerEmail: "", buyerPhone: "", buyerAlternativePhone:undefined, buyerGstin: "", paymentStatus: "Unpaid", lifecycle:"draft", issuedAt:undefined, amountReceived:0, showPaymentStatus:rememberedDefaults.current.showPaymentStatus??false, notes:"", items: [{ id: crypto.randomUUID(), name: "", category: "other", unit: "pcs", quantity: 1, price: 0, gstPercent: 18 }], shippingFee: 0, targetGrandTotal: "" });
    setCancelled(false);setEditorInitialSection("Items");
    initialSnapshot.current = null;
    setValidationErrors([]);
    setSavedId(null); setSavedAt(null); setSavedSnapshot(""); setSaveTitle(""); pendingSaveId.current = null; setLibraryOpen(false);
    toast({ title: "New invoice ready", description: "Your seller, bank and terms details have been kept." });
  }
  async function saveInvoice(asCopy = false, issue = false) {
    const data = asCopy ? duplicateInvoice(invoiceData) : invoiceData;
    if(issue){const issues=invoiceCompletionIssues(data);if(issues.length){setMobileView("edit");setValidationErrors(issues);toast({title:"Complete the red marked fields",description:"Open Review required fields to jump to each detail.",variant:"destructive"});return;}}
    const parsed = invoiceDocumentSchema.safeParse(data);
    if (!parsed.success) { setMobileView("edit"); setValidationErrors(parsed.error.issues.map(issue=>({path:issue.path.join("."),message:issue.message}))); toast({ title: "Check invoice details", description: parsed.error.issues.map(issue => issue.message).join("; "), variant: "destructive" }); return; }
    setValidationErrors([]);
    const id = asCopy ? crypto.randomUUID() : savedId || pendingSaveId.current || crypto.randomUUID();
    if (!asCopy && !savedId) pendingSaveId.current = id;
    const title = (!asCopy && saveTitle.trim()) || invoiceFilename(data.buyerName, data.invoiceDate);
    setSaving(true);
    try {
      const response = await fetch("/api/admin/invoices", { method: "POST", headers: { "Content-Type": "application/json" }, signal: AbortSignal.timeout(30000), body: JSON.stringify({ id, title, document: parsed.data, action:issue?"issue":"save", ...(!asCopy && savedAt ? { expectedUpdatedAt: savedAt } : {}) }) });
      const result = await response.json(); if (!response.ok) throw new Error(result.error || "Could not save invoice");
      const invoice: SavedInvoice = result.invoice;
      setCancelled(false);
      applyInvoice(invoice.document);
      if(invoice.document.lifecycle!=="issued"||issue||asCopy){
        try{const defaults=invoiceDefaults(invoice.document);rememberedDefaults.current=defaults;localStorage.setItem("hume-invoice-defaults-v1",JSON.stringify(defaults));}catch{}
        void fetch("/api/admin/invoices/item-suggestions",{cache:"no-store"}).then(response=>response.ok?response.json():null).then(result=>{if(result?.suggestions)setSavedSuggestions(result.suggestions);}).catch(()=>{});
      }
      setRegisterVersion(value=>value+1);
      setSavedId(invoice.id); setSavedAt(invoice.updatedAt); setSaveTitle(invoice.title); setSavedSnapshot(invoiceSnapshotFingerprint({ document: { ...invoice.document, ...invoiceOptions(invoice.document) }, title: invoice.title })); pendingSaveId.current = null;
      setLibraryOpen(false);
      toast({ title: "Invoice saved", description: "You can reopen it from Saved invoices." });
    } catch (error) { toast({ title: "Save failed", description: error instanceof Error ? error.message : "Your edits are still in the form.", variant: "destructive" }); }
    finally { setSaving(false); }
  }


  const totals=calculateInvoice(invoiceData);
  const noGst=invoiceData.taxMode==='none';
  const handlePrint=async()=>{
    if(exporting||saving)return;
    if(invoiceData.lifecycle==='issued'&&dirty){toast({title:'Save your payment changes first',description:'Choose Update payment record, then download the saved invoice.'});return;}
    const parsed=invoiceDocumentSchema.safeParse(invoiceData);if(!parsed.success){toast({title:"Complete invoice details before export",description:parsed.error.issues.map(issue=>issue.message).join("; "),variant:"destructive"});return;}
    if(totals.errors.length){toast({title:"Check invoice totals",description:totals.errors.join(" "),variant:"destructive"});return;}
    setExporting(true);try{const container=document.querySelector<HTMLElement>(".print-container");if(!container)throw new Error("Invoice preview is unavailable. Please reload and retry.");const {downloadInvoicePreview}=await import("@/lib/invoice-preview-pdf");await downloadInvoicePreview(container,invoiceFilename(buyerName,invoiceDate)+".pdf");}catch(error){toast({title:"PDF could not be downloaded",description:error instanceof Error?error.message:"Please retry",variant:"destructive"});}finally{setExporting(false);}
  };

  const handleCopyImage = async () => {
    const container = document.querySelector(".print-container");
    if (!container) return;

    setCopying(true);

    try {
      const { createInvoiceImage } = await import("@/lib/invoice-image");
      const blob = await createInvoiceImage(container as HTMLElement);

      if (blob) {
        await navigator.clipboard.write([
          new ClipboardItem({
            [blob.type]: blob,
          }),
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);

        toast({
          title: "Copied!",
          description: "Invoice image copied to clipboard. You can paste it directly into WhatsApp!",
        });
      }
    } catch (error) {
      console.error("Error copying invoice image:", error);
      toast({
        title: "Error",
        description: "Failed to copy image. Please try downloading the PDF instead.",
        variant: "destructive",
      });
    } finally {
      setCopying(false);
    }
  };

  return (
    <main className="invoice-workspace min-h-screen bg-[#0d0d0d] text-white/90 print:bg-white print:text-black">
      {/* Top Header - Hidden during print */}
      <header className="invoice-controls border-b border-white/10 bg-[#141414] px-6 py-4 print:hidden flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/dashboard" className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] transition hover:bg-white/[0.08]">
            <ArrowLeft className="h-4 w-4 text-white/65" />
          </Link>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Invoice workspace</h1>
            <p className="text-xs text-white/35">HUME Fragrance</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCopyImage}
            disabled={copying}
            className="flex items-center gap-2 bg-white px-4 py-2 text-xs font-semibold tracking-[0.05em] text-black transition hover:bg-white/90 rounded-none shadow-sm disabled:opacity-50"
          >
            {copying ? (
              <>
                <span className="animate-spin h-3.5 w-3.5 border-2 border-black border-t-transparent rounded-full" />
                COPYING...
              </>
            ) : copied ? (
              <>
                <Check className="h-4 w-4 text-emerald-600" />
                COPIED!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                COPY IMAGE
              </>
            )}
          </button>

          <button
            onClick={()=>void handlePrint()}
            disabled={exporting||saving}
            className="flex items-center gap-2 border border-white/20 bg-white/[0.04] px-4 py-2 text-xs font-semibold tracking-[0.05em] text-white transition hover:bg-white/[0.08] rounded-none shadow-sm"
          >
            <Download className="h-4 w-4" />
            {exporting?"PREPARING PDF…":"DOWNLOAD PDF"}
          </button>
        </div>
      </header>

      <div className="invoice-controls invoice-toolbar sticky top-0 z-20 flex flex-wrap items-center gap-3 border-b border-white/10 bg-[#191a21] px-6 py-4 print:hidden">
        <button type="button" disabled={saving} className="invoice-small-button" onClick={startNewInvoice}>+ New invoice</button>
        <label className="min-w-0 flex-1 text-xs text-white/60">Save name<input disabled={saving} className="mt-1 block w-full min-w-0 rounded-lg border border-white/20 bg-black/20 px-3 py-2.5 text-sm text-white" placeholder="Invoice name (optional)" value={saveTitle} maxLength={255} onChange={e => setSaveTitle(e.target.value)} /></label>
        <button disabled={saving||cancelled} className="rounded-lg bg-[#c4aeec] px-4 py-3 text-sm font-semibold text-black disabled:opacity-50" onClick={() => saveInvoice()}>{saving ? "Saving…" : savedId ? invoiceData.lifecycle==="issued" ? "Update payment record" : "Update saved draft" : "Save draft"}</button>
        {savedId && <button disabled={saving} className="invoice-small-button" onClick={() => saveInvoice(true)}>Save as copy</button>}
        <button disabled={saving} className="invoice-small-button" onClick={() => setLibraryOpen(!libraryOpen)}>Saved invoices / repeat</button>
        <button disabled={saving} className="invoice-small-button" onClick={()=>setCustomersOpen(!customersOpen)}>Customers</button>
        {savedId&&<button disabled={saving||dirty} className="invoice-small-button" title={dirty?"Save changes before opening records":undefined} onClick={()=>setRecordsId(savedId)}>Records & corrections</button>}
        <span className="text-xs text-white/45">{savedId ? dirty ? "Unsaved changes" : "All changes saved" : "Not saved yet"}</span>
        <div className="flex w-full flex-wrap items-center gap-3 border-t border-white/10 pt-3 text-xs text-white/45"><span className="rounded-full bg-white/5 px-3 py-1">{savedId ? "Editing saved invoice" : "New document"}</span><span>{invoiceNumber || "Preparing invoice number…"}</span><span>{items.length} line item{items.length === 1 ? "" : "s"}</span><span className="ml-auto font-semibold text-[#c4aeec]">Total ₹{totals.grandTotal.toFixed(2)}</span></div>
      </div>
      {invoiceData.lifecycle!=="issued"&&<div className="invoice-controls invoice-issue-bar border-b border-white/10 bg-[#15161b] px-6 py-3 text-sm text-white/65"><span>Draft</span><button type="button" disabled={saving} onClick={()=>void saveInvoice(false,true)} className="ml-4 rounded-lg bg-[#c4aeec] px-4 py-2 font-semibold text-black disabled:opacity-50">{saving?"Saving…":"Issue invoice & lock details"}</button>{totals.errors.map(error=><p key={error} className="mt-2 text-amber-200">{error}</p>)}</div>}
      {invoiceData.lifecycle==="issued"&&!cancelled&&<p className="invoice-controls border-b border-white/10 bg-emerald-400/10 px-6 py-3 text-sm text-emerald-100">Issued · {invoiceNumber} · Details locked</p>}
      {savedId&&<div className="invoice-controls px-6 py-2 print:hidden"><button type="button" className="invoice-small-button" disabled={saving} onClick={()=>openSaved({id:savedId,title:saveTitle,document:invoiceData,createdAt:savedAt||'',updatedAt:savedAt||''},true)}>Repeat this invoice</button><span className="ml-3 text-xs text-white/50">Keeps customer and items; resets date, number and received amount.</span></div>}
      {libraryOpen && <SavedInvoiceLibrary key={`register-${registerVersion}`} onManage={invoice=>setRecordsId(invoice.id)} onOpen={invoice => openSaved(invoice, false)} onDuplicate={invoice => openSaved(invoice, true)} onClose={() => setLibraryOpen(false)} />}

      {cancelled&&<p className="invoice-controls border-b border-white/10 bg-amber-200/10 px-6 py-3 text-sm text-amber-100 print:hidden">Cancelled · Original invoice retained. See Records for the cancellation credit note.</p>}
      {customersOpen&&<CustomerDirectory key={`customers-${registerVersion}`} onClose={()=>setCustomersOpen(false)} onOpen={invoice=>openSaved(invoice,false)}/>}
      {recordsId&&<InvoiceRecords key={recordsId} id={recordsId} onClose={()=>setRecordsId(null)} onChanged={invoice=>{setRegisterVersion(value=>value+1);if(invoice.id===savedId&&!dirty){applyInvoice(invoice.document);setSavedAt(invoice.updatedAt);setCancelled(Boolean(invoice.ledger?.cancelled));setSavedSnapshot(invoiceSnapshotFingerprint({document:{...invoice.document,...invoiceOptions(invoice.document)},title:saveTitle}));}}}/>}
      {recovery && <div role="status" className="invoice-controls flex flex-wrap items-center gap-3 border-b border-white/10 bg-[#191a21] px-6 py-4 print:hidden"><span className="text-sm">An unfinished invoice is available from this tab.</span><button className="invoice-small-button" onClick={()=>{applyInvoice(recovery.document);setSavedId(recovery.savedId);setSavedAt(recovery.savedAt);setSavedSnapshot(recovery.savedSnapshot);setSaveTitle(recovery.title);pendingSaveId.current=typeof recovery.pendingId==="string" && /^[0-9a-f-]{36}$/i.test(recovery.pendingId)?recovery.pendingId:null;setRecovery(null);}}>Restore draft</button><button className="invoice-small-button" onClick={()=>{sessionStorage.removeItem(recoveryKey);setRecovery(null);}}>Discard backup</button></div>}
      {recoveryStatus && <p role="status" className="invoice-controls invoice-backup-status px-6 py-2 text-xs text-white/45 print:hidden">{recoveryStatus}</p>}
      {validationErrors.length > 0 && <div role="alert" className="invoice-controls px-6 py-3 text-sm text-amber-200 print:hidden"><p>Check these details before saving:</p>{validationErrors.map((error,index)=><button key={index} className="block py-2 text-left underline" onClick={()=>{setMobileView("edit");requestAnimationFrame(()=>{const field=document.querySelector<HTMLElement>(`[data-invoice-path="${error.path}"]`);const details=field?.closest("details");if(details)details.open=true;field?.focus();field?.scrollIntoView({block:"center",behavior:"smooth"});});}}>{error.path}: {error.message}</button>)}</div>}
      <div className="invoice-controls invoice-view-switch flex gap-2 px-5 py-3 xl:hidden print:hidden" aria-label="Invoice workspace view">{["edit","preview"].map(view=><button key={view} type="button" aria-pressed={mobileView===view} className={`invoice-small-button ${mobileView===view?"text-[#c4aeec]":""}`} onClick={()=>setMobileView(view)}>{view==="edit"?"Edit invoice":"Preview invoice"}</button>)}{mobileView==="preview"&&<button type="button" className="invoice-small-button ml-auto" aria-pressed={zoomPreview} onClick={()=>setZoomPreview(!zoomPreview)}>{zoomPreview?"Fit to screen":"Full size"}</button>}</div>
      {/* Editor & Preview Workspace */}
      <div className="mx-auto max-w-[1900px] grid grid-cols-1 xl:grid-cols-[560px_1fr] print:block">

        {/* Left Side: Editor Form Panel - Hidden during print */}
        <aside data-mobile-view={mobileView} className="invoice-controls invoice-editor border-r border-white/10 bg-[#111215] p-5 lg:p-7 print:hidden"><fieldset disabled={saving||invoiceData.lifecycle==="issued"}><InvoiceEditor key={invoiceNumber} initialSection={editorInitialSection} document={invoiceData} onChange={applyInvoice} suggestions={[...suggestions,...savedSuggestions]} /></fieldset>{invoiceData.lifecycle==="issued"&&<section className="invoice-card mt-5"><h2>Payment record</h2><label className="invoice-field mt-3"><span>Amount recorded received (₹)</span><input disabled={saving||cancelled} type="number" min="0" max={totals.grandTotal} step="0.01" value={options.amountReceived} onChange={e=>applyInvoice({...invoiceData,amountReceived:Number(e.target.value),showPaymentAmounts:true})}/></label><label className="mt-3 flex items-center gap-2 text-sm"><input type="checkbox" checked={showPaymentStatus} onChange={e=>setShowPaymentStatus(e.target.checked)}/>Show payment status</label></section>}{savedId&&<InvoiceHistory key={savedAt} id={savedId}/>}</aside>

        <section ref={previewRef} data-mobile-view={mobileView} style={{"--invoice-scale":zoomPreview?1:previewScale} as React.CSSProperties} className="invoice-preview flex items-start justify-center bg-[#181818] p-8 min-h-[calc(100vh-69px)] overflow-y-auto overflow-x-auto w-full print:p-0 print:bg-white print:h-auto print:overflow-visible">

          {/* Printable Invoice Page Container */}
          <div className="print-container flex-shrink-0 bg-white text-black p-12 font-sans shadow-2xl relative print:shadow-none print:w-full print:min-h-0 print:h-auto" style={{ fontFamily: 'var(--font-sans), sans-serif' }}>

            <div>
              {/* Invoice Header */}
              <div className="flex justify-between items-start border-b border-black/10 pb-8">
                <div>
                  <img src="/images/logo/invoice-hume-black.png" alt="HUME Fragrance" width={1958} height={803} className="h-16 w-auto object-contain" />
                  <p className="text-sm font-bold tracking-[0.15em] text-black uppercase mt-2">HUME FRAGRANCE</p>
                  <div className="text-xs md:text-sm leading-relaxed text-black/75 mt-4 max-w-[320px]">
                    <p className="mt-0.5">{sellerAddress}</p>
                    <p className="mt-1">Email: {sellerEmail}</p>
                    <p>Phone: {sellerPhone}</p>
                    {!noGst && sellerGstin && <p className="mt-1 font-semibold text-black">GSTIN: {sellerGstin}</p>}
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-block bg-black px-4 py-1.5 text-xs font-bold uppercase tracking-[0.15em] text-white">
                    INVOICE
                  </span>
                  <div className="mt-4 space-y-1.5 text-xs md:text-sm">
                    <p className="text-black/50 text-[11px] uppercase tracking-wider font-semibold">Invoice No</p>
                    <p className="font-bold text-base text-black">{invoiceNumber || "—"}</p>
                    <p className="text-black/50 text-[11px] uppercase tracking-wider font-semibold mt-2">Date</p>
                    <p className="font-bold text-black">{invoiceDate ? new Date(invoiceDate).toLocaleDateString("en-IN") : "—"}</p>
                  </div>
                </div>
              </div>

              {/* Billing Info */}
              <div className="grid grid-cols-2 gap-8 pt-5 pb-2">
                <div className="text-xs md:text-sm">
                  <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-black/45">{invoiceData.separateShipping ? "BILLED TO:" : "BILLED & SHIPPING TO:"}</p>
                  <div className="mt-2.5 space-y-1 text-black/85">
                    <p className="font-bold text-base text-black">{buyerName || "—"}</p>
                    {buyerAddress && <p className="leading-relaxed whitespace-pre-line">{buyerAddress}</p>}
                    {buyerEmail && <p>Email: {buyerEmail}</p>}
                    {buyerPhone && <p>Phone: {buyerPhone}</p>}
                    {invoiceData.buyerAlternativePhone?.trim() && <p>Alt. phone: {invoiceData.buyerAlternativePhone}</p>}
                    {!noGst && invoiceData.placeOfSupply&&<p>Place of supply: {invoiceData.placeOfSupply} ({invoiceData.placeOfSupplyCode})</p>}
                    {!noGst && buyerGstin && <p className="font-semibold mt-1 text-black">GSTIN: {buyerGstin}</p>}
                  </div>
                </div>

                <div className="text-xs md:text-sm">
                  {invoiceData.separateShipping && <div className="mb-4"><p className="text-[11px] font-bold uppercase tracking-[0.15em] text-black/45">SHIPPING TO:</p><div className="mt-2.5 space-y-1 text-black/85">{invoiceData.shippingName && <p className="font-bold text-base text-black">{invoiceData.shippingName}</p>}{invoiceData.shippingAddress && <p className="leading-relaxed whitespace-pre-line">{invoiceData.shippingAddress}</p>}{invoiceData.shippingPhone && <p>Phone: {invoiceData.shippingPhone}</p>}</div></div>}
                  {showPaymentStatus && <div className="text-right">
                  <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-black/45">Payment Details</p>
                  <div className="mt-2.5 space-y-1 text-black/85">
                    {showPaymentStatus && <p className="font-semibold">Status: <span className={`font-bold text-xs md:text-sm uppercase tracking-wider ml-1 ${
                      paymentStatus === "Paid"
                        ? "text-emerald-600 print:text-emerald-700"
                        : paymentStatus === "Unpaid"
                        ? "text-rose-600 print:text-rose-700"
                        : "text-amber-500 print:text-amber-600"
                    }`}>{paymentStatus}</span></p>}
                  </div>
                </div>}</div>
              </div>

              {/* Line Items Table */}
              <div className="pt-3 pb-8">
                <table className="w-full text-left text-xs md:text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-black/15 text-[11px] font-bold uppercase tracking-[0.12em] text-black/45">
                      <th className="py-3 w-8">#</th>
                      <th className="py-3">Item Description</th>
                      <th className="py-3 text-right w-20">Price</th>
                      <th className="py-3 text-center w-14">Qty</th>
                      {!noGst&&<th className="py-3 text-center w-14">GST %</th>}
                      <th className="py-3 text-right w-28">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => {

                      return (
                        <tr key={item.id} className="border-b border-black/5">
                          <td className="py-4 text-black/40 font-medium">{index + 1}</td>
                          <td className="py-4 font-medium text-[15px] text-black">{item.name || "Untitled Item"}{!noGst&&item.hsnSac&&<span className="mt-1 block text-[10px] text-black/50">HSN/SAC: {item.hsnSac}</span>}{!noGst&&<span className="mt-1 block text-[10px] text-black/50">Taxable: ₹{totals.lines[index].taxable.toFixed(2)}{totals.lines[index].discount>0?` · Discount: ₹${totals.lines[index].discount.toFixed(2)}`:""}</span>}</td>
                          <td className="py-4 text-right font-medium">₹{item.price.toFixed(2)}</td>
          <td className="py-4 text-center font-medium">{item.quantity}<span className="block text-[10px] text-black/45">{item.unit}</span></td>
                          {!noGst&&<td className="py-4 text-center font-medium text-black/60">{totals.lines[index].rate}%</td>}
                          <td className="py-4 text-right font-bold">₹{totals.lines[index].gross.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Summary / Calculation Totals */}
              <div className="grid grid-cols-[1fr_280px] gap-8 py-4 border-t border-black/10">
                <div className="text-xs md:text-sm space-y-4">
                  {notes && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-black/45">Notes</p>
                      <p className="mt-1 text-black/75 leading-relaxed">{notes}</p>
                    </div>
                  )}
                  {terms && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-black/45">Terms & Conditions</p>
                      <p className="mt-1 text-xs text-black/60 leading-relaxed whitespace-pre-line">{terms}</p>
                    </div>
                  )}
                  {bankDetails.trim() && (
                    <div className="break-inside-avoid">
                      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-black/45">Bank Details</p>
                      <p className="mt-1 text-xs text-black/75 leading-relaxed whitespace-pre-line break-words">{bankDetails}</p>
                    </div>
                  )}
                </div>

                <div className="text-xs md:text-sm space-y-2.5">
                  <div className="flex justify-between text-black/60">
                    <span>{noGst?"Subtotal":"Taxable value"}</span>
                    <span className="font-semibold">₹{totals.itemSubtotal.toFixed(2)}</span>
                  </div>
                  {totals.taxKind==="split"&&totals.totalGst>0&&<><div className="flex justify-between text-black/60"><span>CGST</span><span>₹{totals.cgst.toFixed(2)}</span></div><div className="flex justify-between text-black/60"><span>SGST</span><span>₹{totals.sgst.toFixed(2)}</span></div></>}
                  {totals.taxKind==="igst"&&totals.totalGst>0&&<div className="flex justify-between text-black/60"><span>IGST</span><span>₹{totals.igst.toFixed(2)}</span></div>}
                  {shippingFee > 0 && (
                    <div className="flex justify-between text-black/60">
                      <span>{noGst?"Shipping":"Shipping (excl. GST)"}</span>
                      <span className="font-semibold">+₹{totals.shippingTaxable.toFixed(2)}</span>
                    </div>
                  )}
                  {totals.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-bold">
                      <span>Discount included ({totals.discountPercent.toFixed(2).replace(/\.00$/, "")}%)</span>
                      <span>₹{totals.discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-bold border-t border-black/10 pt-3 text-black">
                    <span>Grand Total</span>
                    <span>₹{totals.grandTotal.toFixed(2)}</span>
                  </div>
                  {invoiceData.showPaymentAmounts && <>
                    <div className="flex justify-between text-black/60"><span>Amount recorded received</span><span>₹{totals.amountReceived.toFixed(2)}</span></div>
                    <div className="flex justify-between font-bold"><span>Balance due</span><span>₹{totals.balanceDue.toFixed(2)}</span></div>
                  </>}
                </div>
              </div>
            </div>

          </div>
        </section>

      </div>

      <style jsx global>{`
        .print-container { width: 210mm; min-height: 297mm; height: fit-content; box-sizing: border-box; align-self: flex-start; }
        .invoice-editor { min-width: 0; }
        @media screen and (max-width: 1279px) {
          .invoice-editor[data-mobile-view="preview"] { display:none; }
          .invoice-preview[data-mobile-view="edit"] { position:absolute; left:-10000px; width:850px; }
          .invoice-preview[data-mobile-view="preview"] { padding:12px; min-height:0; justify-content:flex-start; }
          .invoice-preview[data-mobile-view="preview"] .print-container { zoom:var(--invoice-scale); margin-inline:auto; }
        }
        .invoice-card { border: 1px solid rgba(255,255,255,.10); border-radius: 16px; padding: 20px; background: rgba(255,255,255,.025); }
        details.invoice-card { padding: 0; overflow: hidden; }
        .invoice-section-toggle { width: 100%; min-height: 48px; padding: 20px; box-sizing: border-box; }
        .invoice-section-toggle:hover { background: rgba(255,255,255,.035); }
        .invoice-section-content { padding: 0 20px 20px; }
        .invoice-fields[hidden] { display:none; }
        .invoice-field:has([aria-invalid="true"]) > span::after { content:'●'; color:#f87171; margin-left:6px; font-size:10px; }
        .invoice-field:has([aria-invalid="true"])::after { content:attr(data-error); color:#fca5a5; font-size:11px; }
        .invoice-field [aria-invalid="true"] { border-color:rgba(248,113,113,.7); }
        details.invoice-card:has([aria-invalid="true"]) > summary > span::after { content:'●'; color:#f87171; margin-left:8px; font-size:10px; }
        .invoice-card h2 { font-size: 15px; font-weight: 600; margin-bottom: 16px; }
        .invoice-fields { display: grid; grid-template-columns: minmax(0,1fr); gap: 16px; }
        .invoice-field { display: flex; min-width: 0; flex-direction: column; gap: 7px; font-size: 12px; color: rgba(255,255,255,.65); }
        .invoice-field input, .invoice-field textarea, .invoice-field select { width: 100%; min-width: 0; border: 1px solid rgba(255,255,255,.18); background: #202229; color: #fff; border-radius: 9px; padding: 12px; font-size: 14px; line-height: 1.5; outline: none; color-scheme: dark; }
        .invoice-field input:focus, .invoice-field textarea:focus, .invoice-field select:focus { border-color: #c4aeec; box-shadow: 0 0 0 3px rgba(196,174,236,.12); }
        .invoice-field textarea { resize: vertical; min-height: 84px; }
        .invoice-field input::placeholder, .invoice-field textarea::placeholder { color: rgba(255,255,255,.30); }
        .invoice-small-button { display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 10px 13px; border: 1px solid rgba(255,255,255,.18); border-radius: 9px; font-size: 12px; background: rgba(255,255,255,.04); }
        .invoice-small-button:hover { background: rgba(255,255,255,.10); }
        @media (min-width: 640px) { .invoice-fields { grid-template-columns: repeat(2,minmax(0,1fr)); } }
        @media screen {
          .invoice-workspace .invoice-controls { font-size:12px; line-height:1.4; }
          .invoice-workspace > header.invoice-controls { padding:10px 12px; gap:8px; }
          .invoice-workspace > header h1 { font-size:15px; }
          .invoice-workspace > header p { font-size:10px; }
          .invoice-workspace > header a { width:28px; height:28px; }
          .invoice-workspace .invoice-controls button,
          .invoice-workspace .invoice-controls .invoice-small-button {
            min-height:30px; padding:6px 9px; font-size:11px; line-height:1.35; gap:5px; border-radius:6px;
          }
          .invoice-workspace .invoice-controls button svg { width:13px; height:13px; }
          .invoice-workspace .invoice-toolbar { padding:8px 12px; gap:7px; }
          .invoice-workspace .invoice-toolbar > label { font-size:10px; }
          .invoice-workspace .invoice-toolbar > div { gap:6px; padding-top:7px; font-size:10px; }
          .invoice-workspace .invoice-toolbar > div span { padding:3px 6px; }
          .invoice-workspace .invoice-controls input:not([type="checkbox"]),
          .invoice-workspace .invoice-controls select,
          .invoice-workspace .invoice-controls textarea {
            min-height:32px; padding:6px 8px; font-size:13px; line-height:1.4; border-radius:6px;
          }
          .invoice-workspace .invoice-controls input[type="checkbox"] { width:13px; height:13px; }
          .invoice-workspace .invoice-controls textarea { min-height:56px; }
          .invoice-workspace .invoice-controls .invoice-fields { gap:10px; }
          .invoice-workspace .invoice-controls .invoice-field { gap:4px; font-size:10px; }
          .invoice-workspace .invoice-controls .invoice-card { padding:12px; border-radius:10px; }
          .invoice-workspace .invoice-controls details.invoice-card { padding:0; }
          .invoice-workspace .invoice-controls .invoice-section-toggle { padding:12px; }
          .invoice-workspace .invoice-controls .invoice-section-content { padding:0 12px 12px; }
          .invoice-workspace .invoice-controls .invoice-card h2 { font-size:13px; margin-bottom:10px; }
          .invoice-workspace .invoice-controls :is(h2,h3,summary) { font-size:13px; }
          .invoice-workspace .invoice-controls .text-sm { font-size:12px; }
          .invoice-workspace .invoice-controls .text-xs { font-size:10px; }
          .invoice-workspace .invoice-controls :is(.space-y-5,.space-y-4) > :not([hidden]) { margin-block:0 10px; }
          .invoice-workspace .invoice-controls :is(.space-y-5,.space-y-4) > :last-child { margin-bottom:0; }
          .invoice-workspace .invoice-controls :is(.p-4,.p-5) { padding:10px; }
          .invoice-workspace .invoice-controls .mb-4 { margin-bottom:10px; }
          .invoice-workspace .invoice-controls .mt-4 { margin-top:10px; }
          .invoice-workspace .invoice-editor { padding:10px 12px; }
          .invoice-workspace section.invoice-controls { padding:12px; }
          .invoice-workspace .invoice-view-switch { padding:8px 12px; gap:6px; }
          .invoice-workspace .invoice-issue-bar { padding:8px 12px; font-size:11px; }
          .invoice-workspace .invoice-issue-bar button { margin-left:8px; }
          .invoice-workspace .invoice-backup-status { padding:4px 12px; font-size:10px; }
          .invoice-workspace .invoice-editor button[aria-label^="Remove"] { min-width:28px; min-height:28px; padding:5px; }
          .invoice-workspace .invoice-controls input[aria-label="Search saved invoices"] { padding-left:32px; }
        }
        @media screen and (max-width: 639px) {
          .invoice-workspace .invoice-toolbar { position:static; }
          .invoice-workspace .invoice-toolbar > label { flex-basis:100%; order:-1; }
        }
        @media print {
          @page {
            size: A4 portrait;
            margin: 0 !important;
          }
          body {
            background-color: white !important;
            color: black !important;
            font-size: 12px !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          header, aside, button {
            display: none !important;
          }
          main {
            background-color: white !important;
            min-height: auto !important;
          }
          section {
            padding: 0 !important;
            margin: 0 !important;
            background-color: white !important;
            min-height: auto !important;
          }
          .print-container {
            font-family: var(--font-sans), sans-serif !important;
            padding: 20mm !important;
            width: 210mm !important;
            height: 297mm !important;
            box-sizing: border-box !important;
            position: relative !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:w-full {
            width: 100% !important;
          }
          .print\\:min-h-0 {
            min-height: 0 !important;
          }
          .print\\:h-auto {
            height: auto !important;
          }
          .print\\:overflow-visible {
            overflow: visible !important;
          }
          .print\\:block {
            display: block !important;
          }
        }
      `}</style>
    </main>
  );
}
