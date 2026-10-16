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
import { InvoiceEditor } from "./InvoiceEditor";
import { SavedInvoiceLibrary } from "./SavedInvoiceLibrary";
import { calculateInvoice } from "@/lib/invoice-calculations";
import { InvoiceHistory } from "./InvoiceHistory";
import { invoiceFilename } from "@/lib/invoice-filename";
import { invoiceOptionDefaults, invoiceOptions, invoiceDocumentSchema, newInvoiceIdentity, duplicateInvoice, type InvoiceDocument, type InvoiceItem, type SavedInvoice } from "@/lib/invoice-document";

export default function InvoicePage() {
  const [savedId, setSavedId] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [savedSnapshot, setSavedSnapshot] = useState("");
  const [saveTitle, setSaveTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
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
  const [terms, setTerms] = useState("1. Goods once sold will not be taken back.\n2. Interest @ 18% per annum will be charged if payment is not received within due date.");
  const [notes, setNotes] = useState("");

  // Set default dates on client mount (using local timezone offsets)
  useEffect(() => {
    const identity = newInvoiceIdentity();
    setInvoiceDate(identity.invoiceDate);
    setInvoiceNumber(identity.invoiceNumber);
  }, []);

  const invoiceData: InvoiceDocument = { ...options, sellerName, sellerAddress, sellerEmail, sellerPhone, sellerGstin, buyerName, buyerAddress, buyerEmail, buyerPhone, buyerGstin, invoiceNumber, invoiceDate, paymentStatus: paymentStatus as InvoiceDocument["paymentStatus"], showPaymentStatus, items, targetGrandTotal, shippingFee, bankDetails, terms, notes };
  const dirty = savedId ? savedSnapshot !== JSON.stringify({ document: invoiceData, title: saveTitle }) : Boolean(buyerName || buyerAddress || buyerPhone || saveTitle || shippingFee || targetGrandTotal || items.some(item => item.name));
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
    const normalized = { ...invoice.document, ...invoiceOptions(invoice.document), issuedAt:invoice.document.issuedAt, showPaymentStatus: invoice.document.showPaymentStatus ?? false };
    const data = asNew ? duplicateInvoice(normalized) : normalized;
    applyInvoice(data); setSavedId(asNew ? null : invoice.id); setSavedAt(asNew ? null : invoice.updatedAt); setSaveTitle(asNew ? "" : invoice.title);
    setSavedSnapshot(asNew ? "" : JSON.stringify({ document: data, title: invoice.title })); pendingSaveId.current = null; setLibraryOpen(false);
    toast({ title: asNew ? "New invoice from saved details" : "Saved invoice opened", description: asNew ? "A new invoice number was created. Edit the details and save." : "Make your changes, then choose Update saved invoice." });
  }
  function startNewInvoice() {
    if (saving || (dirty && !window.confirm("Start a new invoice? Unsaved changes will be lost."))) return;
    applyInvoice({ ...invoiceData, ...newInvoiceIdentity(), buyerName: "", buyerAddress: "", buyerEmail: "", buyerPhone: "", buyerGstin: "", paymentStatus: "Unpaid", lifecycle:"draft", issuedAt:undefined, amountReceived:0, showPaymentStatus:false, notes:"", items: [{ id: crypto.randomUUID(), name: "", category: "other", unit: "pcs", quantity: 1, price: 0, gstPercent: 18 }], shippingFee: 0, targetGrandTotal: "" });
    setSavedId(null); setSavedAt(null); setSavedSnapshot(""); setSaveTitle(""); pendingSaveId.current = null; setLibraryOpen(false);
    toast({ title: "New invoice ready", description: "Your seller, bank and terms details have been kept." });
  }
  async function saveInvoice(asCopy = false, issue = false) {
    const data = asCopy ? duplicateInvoice(invoiceData) : invoiceData;
    const parsed = invoiceDocumentSchema.safeParse(data);
    if (!parsed.success) { toast({ title: "Check invoice details", description: parsed.error.issues.map(issue => issue.message).join("; "), variant: "destructive" }); return; }
    const id = asCopy ? crypto.randomUUID() : savedId || pendingSaveId.current || crypto.randomUUID();
    if (!asCopy && !savedId) pendingSaveId.current = id;
    const title = (!asCopy && saveTitle.trim()) || invoiceFilename(data.buyerName, data.invoiceDate);
    setSaving(true);
    try {
      const response = await fetch("/api/admin/invoices", { method: "POST", headers: { "Content-Type": "application/json" }, signal: AbortSignal.timeout(30000), body: JSON.stringify({ id, title, document: parsed.data, action:issue?"issue":"save", ...(!asCopy && savedAt ? { expectedUpdatedAt: savedAt } : {}) }) });
      const result = await response.json(); if (!response.ok) throw new Error(result.error || "Could not save invoice");
      const invoice: SavedInvoice = result.invoice;
      applyInvoice(invoice.document);
      setSavedId(invoice.id); setSavedAt(invoice.updatedAt); setSaveTitle(invoice.title); setSavedSnapshot(JSON.stringify({ document: invoice.document, title: invoice.title })); pendingSaveId.current = null;
      setLibraryOpen(false);
      toast({ title: "Invoice saved", description: "You can reopen it from Saved invoices." });
    } catch (error) { toast({ title: "Save failed", description: error instanceof Error ? error.message : "Your edits are still in the form.", variant: "destructive" }); }
    finally { setSaving(false); }
  }


  const totals=calculateInvoice(invoiceData);
  const handlePrint=async()=>{
    const parsed=invoiceDocumentSchema.safeParse(invoiceData);if(!parsed.success){toast({title:"Complete invoice details before export",description:parsed.error.issues.map(issue=>issue.message).join("; "),variant:"destructive"});return;}
    if(totals.errors.length){toast({title:"Check invoice totals",description:totals.errors.join(" "),variant:"destructive"});return;}
    setExporting(true);try{const response=await fetch("/api/admin/invoices/pdf",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:savedId||undefined,document:parsed.data}),signal:AbortSignal.timeout(60000)});if(!response.ok){const data=await response.json();throw new Error(data.error||"PDF export failed");}const blob=await response.blob();const url=URL.createObjectURL(blob),link=document.createElement("a");link.href=url;link.download=invoiceFilename(buyerName,invoiceDate)+".pdf";link.click();window.setTimeout(()=>URL.revokeObjectURL(url),30000);}catch(error){toast({title:"PDF could not be downloaded",description:error instanceof Error?error.message:"Please try again",variant:"destructive"});}finally{setExporting(false);}
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
    <main className="min-h-screen bg-[#0d0d0d] text-white/90 print:bg-white print:text-black">
      {/* Top Header - Hidden during print */}
      <header className="border-b border-white/10 bg-[#141414] px-6 py-4 print:hidden flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/dashboard" className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] transition hover:bg-white/[0.08]">
            <ArrowLeft className="h-4 w-4 text-white/65" />
          </Link>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Invoice workspace</h1>
            <p className="text-xs text-white/35">HUME Fragrance · Create, save and reuse</p>
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

      <div className="sticky top-0 z-20 flex flex-wrap items-center gap-3 border-b border-white/10 bg-[#191a21] px-6 py-4 print:hidden">
        <button type="button" disabled={saving} className="invoice-small-button" onClick={startNewInvoice}>+ New invoice</button>
        <label className="min-w-0 flex-1 text-xs text-white/60">Save name<input disabled={saving} className="mt-1 block w-full min-w-[200px] rounded-lg border border-white/20 bg-black/20 px-3 py-2.5 text-sm text-white" placeholder="Automatic: date, time, customer, HUME Fragrance" value={saveTitle} maxLength={255} onChange={e => setSaveTitle(e.target.value)} /></label>
        <button disabled={saving} className="rounded-lg bg-[#c4aeec] px-4 py-3 text-sm font-semibold text-black disabled:opacity-50" onClick={() => saveInvoice()}>{saving ? "Saving…" : savedId ? invoiceData.lifecycle==="issued" ? "Update payment record" : "Update saved draft" : "Save draft"}</button>
        {savedId && <button disabled={saving} className="invoice-small-button" onClick={() => saveInvoice(true)}>Save as copy</button>}
        <button disabled={saving} className="invoice-small-button" onClick={() => setLibraryOpen(!libraryOpen)}>Saved invoices</button>
        <span className="text-xs text-white/45">{savedId ? dirty ? "Unsaved changes" : "All changes saved" : "Not saved yet"}</span>
        <div className="flex w-full flex-wrap items-center gap-3 border-t border-white/10 pt-3 text-xs text-white/45"><span className="rounded-full bg-white/5 px-3 py-1">{savedId ? "Editing saved invoice" : "New document"}</span><span>{invoiceNumber || "Preparing invoice number…"}</span><span>{items.length} line item{items.length === 1 ? "" : "s"}</span><span className="ml-auto font-semibold text-[#c4aeec]">Total ₹{totals.grandTotal.toFixed(2)}</span></div>
      </div>
      {invoiceData.lifecycle!=="issued"&&<div className="border-b border-white/10 bg-[#15161b] px-6 py-3 text-sm text-white/65"><span>Draft · A financial-year invoice number is assigned when issued.</span><button type="button" disabled={saving} onClick={()=>void saveInvoice(false,true)} className="ml-4 rounded-lg bg-[#c4aeec] px-4 py-2 font-semibold text-black disabled:opacity-50">{saving?"Saving…":"Issue invoice & lock details"}</button>{totals.errors.map(error=><p key={error} className="mt-2 text-amber-200">{error}</p>)}</div>}
      {invoiceData.lifecycle==="issued"&&<p className="border-b border-white/10 bg-emerald-400/10 px-6 py-3 text-sm text-emerald-100">Issued · {invoiceNumber} · Customer, tax and item details are locked. Payment records can still be updated with history.</p>}
      {libraryOpen && <SavedInvoiceLibrary onOpen={invoice => openSaved(invoice, false)} onDuplicate={invoice => openSaved(invoice, true)} onClose={() => setLibraryOpen(false)} />}

      {/* Editor & Preview Workspace */}
      <div className="mx-auto max-w-[1900px] grid grid-cols-1 xl:grid-cols-[560px_1fr] print:block">

        {/* Left Side: Editor Form Panel - Hidden during print */}
        <aside className="invoice-editor border-r border-white/10 bg-[#111215] p-5 lg:p-7 print:hidden"><fieldset disabled={saving||invoiceData.lifecycle==="issued"}><InvoiceEditor document={invoiceData} onChange={applyInvoice} /></fieldset>{invoiceData.lifecycle==="issued"&&<section className="invoice-card mt-5"><h2>Payment record</h2><label className="invoice-field mt-3"><span>Amount recorded received (₹)</span><input type="number" min="0" max={totals.grandTotal} step="0.01" value={options.amountReceived} onChange={e=>applyInvoice({...invoiceData,amountReceived:Number(e.target.value),showPaymentAmounts:true})}/></label><label className="mt-3 flex items-center gap-2 text-sm"><input type="checkbox" checked={showPaymentStatus} onChange={e=>setShowPaymentStatus(e.target.checked)}/>Show payment status</label><p className="mt-2 text-xs text-white/40">These are manual payment records, not bank verification. Choose Update saved invoice to record the change.</p></section>}{savedId&&<InvoiceHistory key={savedAt} id={savedId}/>}</aside>

        <section className="flex items-start justify-center bg-[#181818] p-8 min-h-[calc(100vh-69px)] overflow-y-auto overflow-x-auto w-full print:p-0 print:bg-white print:h-auto print:overflow-visible">

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
                    {sellerGstin && <p className="mt-1 font-semibold text-black">GSTIN: {sellerGstin}</p>}
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-block bg-black px-4 py-1.5 text-xs font-bold uppercase tracking-[0.15em] text-white">
                    INVOICE
                  </span>
                  <p className="mt-2 text-[10px] text-black/45">{invoiceData.lifecycle==="issued"?"Issued invoice":"DRAFT - not issued"}</p>
                  <div className="mt-4 space-y-1.5 text-xs md:text-sm">
                    <p className="text-black/50 text-[11px] uppercase tracking-wider font-semibold">Invoice No</p>
                    <p className="font-bold text-base text-black">{invoiceNumber || "—"}</p>
                    <p className="text-black/50 text-[11px] uppercase tracking-wider font-semibold mt-2">Date</p>
                    <p className="font-bold text-black">{invoiceDate ? new Date(invoiceDate).toLocaleDateString("en-IN") : "—"}</p>
                  </div>
                </div>
              </div>

              {/* Billing Info */}
              <div className="grid grid-cols-2 gap-8 py-8 border-b border-black/10">
                <div className="text-xs md:text-sm">
                  <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-black/45">Billed To</p>
                  <div className="mt-2.5 space-y-1 text-black/85">
                    <p className="font-bold text-base text-black">{buyerName || "—"}</p>
                    {buyerAddress && <p className="leading-relaxed whitespace-pre-line">{buyerAddress}</p>}
                    {buyerEmail && <p>Email: {buyerEmail}</p>}
                    {buyerPhone && <p>Phone: {buyerPhone}</p>}
                    {invoiceData.placeOfSupply&&<p>Place of supply: {invoiceData.placeOfSupply} ({invoiceData.placeOfSupplyCode})</p>}
                    {buyerGstin && <p className="font-semibold mt-1 text-black">GSTIN: {buyerGstin}</p>}
                  </div>
                </div>

                {showPaymentStatus && <div className="text-right text-xs md:text-sm">
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
                </div>}
              </div>

              {/* Line Items Table */}
              <div className="py-8">
                <table className="w-full text-left text-xs md:text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-black/15 text-[11px] font-bold uppercase tracking-[0.12em] text-black/45">
                      <th className="py-3 w-8">#</th>
                      <th className="py-3">Item Description</th>
                      <th className="py-3 text-right w-20">Price</th>
                      <th className="py-3 text-center w-14">Qty</th>
                      <th className="py-3 text-center w-14">GST %</th>
                      <th className="py-3 text-right w-28">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => {

                      return (
                        <tr key={item.id} className="border-b border-black/5">
                          <td className="py-4 text-black/40 font-medium">{index + 1}</td>
                          <td className="py-4 font-medium text-[15px] text-black">{item.name || "Untitled Item"}{item.hsnSac&&<span className="mt-1 block text-[10px] text-black/50">HSN/SAC: {item.hsnSac}</span>}<span className="mt-1 block text-[10px] text-black/50">Taxable: ₹{totals.lines[index].taxable.toFixed(2)}{totals.lines[index].discount>0?` · Discount: ₹${totals.lines[index].discount.toFixed(2)}`:""}</span></td>
                          <td className="py-4 text-right font-medium">₹{item.price.toFixed(2)}</td>
          <td className="py-4 text-center font-medium">{item.quantity}<span className="block text-[10px] text-black/45">{item.unit}</span></td>
                          <td className="py-4 text-center font-medium text-black/60">{totals.lines[index].rate}%</td>
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
                    <span>Taxable value</span>
                    <span className="font-semibold">₹{totals.subtotal.toFixed(2)}</span>
                  </div>
                  {totals.taxKind==="split"&&totals.totalGst>0&&<><div className="flex justify-between text-black/60"><span>CGST</span><span>₹{totals.cgst.toFixed(2)}</span></div><div className="flex justify-between text-black/60"><span>SGST</span><span>₹{totals.sgst.toFixed(2)}</span></div></>}
                  {totals.taxKind==="igst"&&totals.totalGst>0&&<div className="flex justify-between text-black/60"><span>IGST</span><span>₹{totals.igst.toFixed(2)}</span></div>}
                  {shippingFee > 0 && (
                    <div className="flex justify-between text-black/60">
                      <span>Shipping (included)</span>
                      <span className="font-semibold">₹{totals.shippingGross.toFixed(2)}</span>
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
        .invoice-card { border: 1px solid rgba(255,255,255,.10); border-radius: 16px; padding: 20px; background: rgba(255,255,255,.025); }
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
