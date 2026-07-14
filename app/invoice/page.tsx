"use client";

import { useState, useMemo, useEffect } from "react";
import { 
  Plus, 
  Trash2, 
  Download, 
  FileText, 
  ArrowLeft,
  Building,
  User,
  Settings,
  Coins,
  Copy,
  Check
} from "lucide-react";
import Link from "next/link";
import { toast } from "@/hooks/use-toast";

interface InvoiceItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  gstPercent: number;
}

export default function InvoicePage() {
  const [copying, setCopying] = useState(false);
  const [copied, setCopied] = useState(false);

  // 1. Seller Information (preset with HUME details)
  const [sellerName, setSellerName] = useState("HUME FRAGRANCE");
  const [sellerAddress, setSellerAddress] = useState("house no 8, Pansarian Area, Kannauj, Uttar Pradesh - 209725");
  const [sellerEmail, setSellerEmail] = useState("support@humefragrance.com");
  const [sellerPhone, setSellerPhone] = useState("+91 95590 24822");
  const [sellerGstin, setSellerGstin] = useState("09AABCH1234F1Z5"); // Placeholder GSTIN

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

  // 4. Line Items
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: "1", name: "Creed Aventus Inspired Perfume (50ml)", quantity: 1, price: 999, gstPercent: 18 }
  ]);

  // 5. Additional Settings
  const [targetGrandTotal, setTargetGrandTotal] = useState<string>("");
  const [shippingFee, setShippingFee] = useState<number>(0);
  const [bankDetails, setBankDetails] = useState("");
  const [terms, setTerms] = useState("1. Goods once sold will not be taken back.\n2. Interest @ 18% per annum will be charged if payment is not received within due date.\n3. Subject to Kannauj jurisdiction only.");
  const [notes, setNotes] = useState("Thank you for your business with HUME Fragrance!");

  // Set default dates on client mount (using local timezone offsets)
  useEffect(() => {
    const today = new Date();
    const offset = today.getTimezoneOffset();
    const localToday = new Date(today.getTime() - offset * 60 * 1000);
    const formattedToday = localToday.toISOString().split("T")[0];
    setInvoiceDate(formattedToday);

    // Generate random invoice number: HF-YYYY-XXXX
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    setInvoiceNumber(`HF-${today.getFullYear()}-${randomNum}`);
  }, []);


  // Handlers for Items
  const handleAddItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      name: "",
      quantity: 1,
      price: 0,
      gstPercent: 18
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const handleUpdateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  // Calculations (where item.price is inclusive of GST)
  const totals = useMemo(() => {
    let rawSubtotalInclusive = 0;
    let rawSubtotalExclusive = 0;
    let rawTotalGst = 0;

    items.forEach(item => {
      const itemSubtotalInclusive = item.quantity * item.price;
      const itemSubtotalExclusive = itemSubtotalInclusive / (1 + item.gstPercent / 100);
      const gstAmount = itemSubtotalInclusive - itemSubtotalExclusive;
      
      rawSubtotalInclusive += itemSubtotalInclusive;
      rawSubtotalExclusive += itemSubtotalExclusive;
      rawTotalGst += gstAmount;
    });

    const parsedTargetTotal = parseFloat(targetGrandTotal);
    const discountAmount = Number.isFinite(parsedTargetTotal) && parsedTargetTotal > 0
      ? Math.max(0, rawSubtotalInclusive + shippingFee - parsedTargetTotal)
      : 0;

    const discountRatio = rawSubtotalInclusive > 0 
      ? Math.max(0, rawSubtotalInclusive - discountAmount) / rawSubtotalInclusive 
      : 1;

    const subtotal = rawSubtotalExclusive * discountRatio;
    const totalGst = rawTotalGst * discountRatio;
    const grandTotal = Math.max(0, subtotal + totalGst + shippingFee);

    const discountPercent = rawSubtotalInclusive > 0 
      ? (discountAmount / rawSubtotalInclusive) * 100 
      : 0;

    return {
      subtotal,
      totalGst,
      grandTotal,
      rawSubtotalInclusive,
      discountPercent,
      discountAmount
    };
  }, [items, targetGrandTotal, shippingFee]);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyImage = async () => {
    const container = document.querySelector(".print-container");
    if (!container) return;

    setCopying(true);

    // Find and temporarily disable cross-origin stylesheets to prevent html-to-image CORS/SecurityErrors
    const crossOriginLinks = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).filter(link => {
      try {
        const href = (link as HTMLLinkElement).href;
        return href && !href.startsWith(window.location.origin);
      } catch {
        return false;
      }
    }) as HTMLLinkElement[];

    crossOriginLinks.forEach(link => {
      link.disabled = true;
    });

    try {
      const { toBlob } = await import("html-to-image");
      const blob = await toBlob(container as HTMLElement, {
        pixelRatio: 2.5, // Crisp high resolution
        backgroundColor: "#ffffff",
        skipFonts: true, // Skip processing web fonts to prevent CORS/SecurityErrors
        style: {
          transform: "none",
          transformOrigin: "top center",
          margin: "0",
          width: "800px",
          height: "1130px",
          boxShadow: "none",
        }
      });

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
      // Re-enable all cross-origin stylesheets
      crossOriginLinks.forEach(link => {
        link.disabled = false;
      });
      setCopying(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0d0d0d] text-white/90 print:bg-white print:text-black">
      {/* Top Header - Hidden during print */}
      <header className="border-b border-white/10 bg-[#141414] px-6 py-4 print:hidden flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/dashboard" className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] transition hover:bg-white/[0.08]">
            <ArrowLeft className="h-4 w-4 text-white/65" />
          </Link>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">HUME Fragrance</h1>
            <p className="text-xs text-white/35">Invoice Engine</p>
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
            onClick={handlePrint}
            className="flex items-center gap-2 border border-white/20 bg-white/[0.04] px-4 py-2 text-xs font-semibold tracking-[0.05em] text-white transition hover:bg-white/[0.08] rounded-none shadow-sm"
          >
            <Download className="h-4 w-4" />
            DOWNLOAD PDF
          </button>
        </div>
      </header>

      {/* Editor & Preview Workspace */}
      <div className="mx-auto max-w-[1600px] grid grid-cols-1 xl:grid-cols-[450px_1fr] print:block">
        
        {/* Left Side: Editor Form Panel - Hidden during print */}
        <aside className="border-r border-white/10 bg-[#121212] p-6 space-y-6 h-[calc(100vh-69px)] overflow-y-auto print:hidden">
          
          {/* Invoice Meta */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-white/35 border-b border-white/5 pb-2">
              <FileText className="h-4 w-4" />
              Invoice Info
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-white/50">Invoice Number</label>
                <input
                  type="text"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/10 p-2 text-sm text-white focus:outline-none focus:border-white/30"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-white/50">Payment Status</label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/10 p-2 text-sm text-white focus:outline-none focus:border-white/30"
                >
                  <option value="Paid" className="bg-[#121212]">Paid</option>
                  <option value="Unpaid" className="bg-[#121212]">Unpaid</option>
                  <option value="Partially Paid" className="bg-[#121212]">Partially Paid</option>
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-white/50">Invoice Date</label>
              <input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/10 p-2 text-sm text-white focus:outline-none focus:border-white/30"
              />
            </div>
          </section>

          {/* Seller / Billing From */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-white/35 border-b border-white/5 pb-2">
              <Building className="h-4 w-4" />
              Seller Details
            </div>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-white/50">Seller Name</label>
                <input
                  type="text"
                  value={sellerName}
                  onChange={(e) => setSellerName(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/10 p-2 text-sm text-white focus:outline-none focus:border-white/30"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-white/50">GSTIN / Tax ID</label>
                <input
                  type="text"
                  value={sellerGstin}
                  onChange={(e) => setSellerGstin(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/10 p-2 text-sm text-white focus:outline-none focus:border-white/30"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-white/50">Address</label>
                <textarea
                  value={sellerAddress}
                  onChange={(e) => setSellerAddress(e.target.value)}
                  rows={2}
                  className="w-full bg-white/[0.04] border border-white/10 p-2 text-sm text-white focus:outline-none focus:border-white/30 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-white/50">Email</label>
                  <input
                    type="email"
                    value={sellerEmail}
                    onChange={(e) => setSellerEmail(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/10 p-2 text-sm text-white focus:outline-none focus:border-white/30"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-white/50">Phone</label>
                  <input
                    type="text"
                    value={sellerPhone}
                    onChange={(e) => setSellerPhone(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/10 p-2 text-sm text-white focus:outline-none focus:border-white/30"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Buyer Details */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-white/35 border-b border-white/5 pb-2">
              <User className="h-4 w-4" />
              Buyer Details
            </div>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-white/50">Buyer Name</label>
                <input
                  type="text"
                  placeholder="Enter name"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/10 p-2 text-sm text-white focus:outline-none focus:border-white/30"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-white/50">GSTIN / Tax ID</label>
                <input
                  type="text"
                  placeholder="Enter GSTIN (optional)"
                  value={buyerGstin}
                  onChange={(e) => setBuyerGstin(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/10 p-2 text-sm text-white focus:outline-none focus:border-white/30"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-white/50">Address</label>
                <textarea
                  value={buyerAddress}
                  placeholder="Enter billing address"
                  onChange={(e) => setBuyerAddress(e.target.value)}
                  rows={2}
                  className="w-full bg-white/[0.04] border border-white/10 p-2 text-sm text-white focus:outline-none focus:border-white/30 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-white/50">Email</label>
                  <input
                    type="email"
                    placeholder="Enter email"
                    value={buyerEmail}
                    onChange={(e) => setBuyerEmail(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/10 p-2 text-sm text-white focus:outline-none focus:border-white/30"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-white/50">Phone</label>
                  <input
                    type="text"
                    placeholder="Enter phone"
                    value={buyerPhone}
                    onChange={(e) => setBuyerPhone(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/10 p-2 text-sm text-white focus:outline-none focus:border-white/30"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Line Items Manager */}
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-white/35">
                <Settings className="h-4 w-4" />
                Line Items
              </div>
              <button
                onClick={handleAddItem}
                className="flex items-center gap-1 text-[11px] font-semibold text-white bg-white/[0.06] px-2 py-1 transition hover:bg-white/[0.1]"
              >
                <Plus className="h-3 w-3" /> ADD
              </button>
            </div>

            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={item.id} className="p-3 bg-white/[0.02] border border-white/5 space-y-3 relative">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-semibold tracking-wider text-white/25">ITEM #{index + 1}</span>
                    {items.length > 1 && (
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-white/40 hover:text-red-400 transition"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-medium text-white/40">Product Name</label>
                    <input
                      type="text"
                      value={item.name}
                      placeholder="e.g. Creed Aventus"
                      onChange={(e) => handleUpdateItem(item.id, "name", e.target.value)}
                      className="w-full bg-white/[0.04] border border-white/10 p-1.5 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-medium text-white/40">Qty</label>
                      <input
                        type="number"
                        value={item.quantity}
                        min={1}
                        onChange={(e) => handleUpdateItem(item.id, "quantity", parseInt(e.target.value) || 0)}
                        className="w-full bg-white/[0.04] border border-white/10 p-1.5 text-xs text-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-medium text-white/40">Rate</label>
                      <input
                        type="number"
                        value={item.price}
                        min={0}
                        onChange={(e) => handleUpdateItem(item.id, "price", parseFloat(e.target.value) || 0)}
                        className="w-full bg-white/[0.04] border border-white/10 p-1.5 text-xs text-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-medium text-white/40">GST %</label>
                      <input
                        type="number"
                        value={item.gstPercent}
                        min={0}
                        onChange={(e) => handleUpdateItem(item.id, "gstPercent", parseFloat(e.target.value) || 0)}
                        className="w-full bg-white/[0.04] border border-white/10 p-1.5 text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Adjustments (Discount, Shipping) */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-white/35 border-b border-white/5 pb-2">
              <Coins className="h-4 w-4" />
              Adjustments
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-white/50">Target Grand Total (₹)</label>
                <input
                  type="text"
                  placeholder="e.g. 1600"
                  value={targetGrandTotal}
                  onChange={(e) => setTargetGrandTotal(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/10 p-2 text-sm text-white focus:outline-none focus:border-white/30"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-white/50">Shipping Fee (₹)</label>
                <input
                  type="number"
                  value={shippingFee}
                  min={0}
                  onChange={(e) => setShippingFee(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white/[0.04] border border-white/10 p-2 text-sm text-white focus:outline-none focus:border-white/30"
                />
              </div>
            </div>
          </section>

        </aside>

        <section className="flex justify-center bg-[#181818] p-8 min-h-[calc(100vh-69px)] overflow-y-auto overflow-x-hidden w-full print:p-0 print:bg-white print:h-auto print:overflow-visible">
          
          {/* Printable Invoice Page Container */}
          <div className="print-container w-[800px] min-h-[1130px] flex-shrink-0 bg-white text-black p-12 font-sans shadow-2xl relative flex flex-col justify-between print:shadow-none print:w-full print:min-h-0 print:h-auto" style={{ fontFamily: 'var(--font-sans), sans-serif' }}>
            
            <div>
              {/* Invoice Header */}
              <div className="flex justify-between items-start border-b border-black/10 pb-8">
                <div>
                  <img src="/images/logo/brown cursive hf png.png" alt="HUME Logo" className="h-16 w-auto object-contain" />
                  <p className="text-sm font-bold tracking-[0.15em] text-black uppercase mt-2">HUME FRAGRANCE</p>
                  <div className="text-xs md:text-sm leading-relaxed text-black/75 mt-4 max-w-[320px]">
                    <p className="font-semibold text-black">{sellerName}</p>
                    <p className="mt-0.5">{sellerAddress}</p>
                    <p className="mt-1">Email: {sellerEmail}</p>
                    <p>Phone: {sellerPhone}</p>
                    {sellerGstin && <p className="mt-1 font-semibold text-black">GSTIN: {sellerGstin}</p>}
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-block bg-black px-4 py-1.5 text-xs font-bold uppercase tracking-[0.15em] text-white">
                    Tax Invoice
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
              <div className="grid grid-cols-2 gap-8 py-8 border-b border-black/10">
                <div className="text-xs md:text-sm">
                  <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-black/45">Billed To</p>
                  <div className="mt-2.5 space-y-1 text-black/85">
                    <p className="font-bold text-base text-black">{buyerName || "—"}</p>
                    {buyerAddress && <p className="leading-relaxed whitespace-pre-line">{buyerAddress}</p>}
                    {buyerEmail && <p>Email: {buyerEmail}</p>}
                    {buyerPhone && <p>Phone: {buyerPhone}</p>}
                    {buyerGstin && <p className="font-semibold mt-1 text-black">GSTIN: {buyerGstin}</p>}
                  </div>
                </div>

                <div className="text-right text-xs md:text-sm">
                  <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-black/45">Payment Details</p>
                  <div className="mt-2.5 space-y-1 text-black/85">
                    <p className="font-semibold">Status: <span className={`font-bold text-xs md:text-sm uppercase tracking-wider ml-1 ${
                      paymentStatus === "Paid" 
                        ? "text-emerald-600 print:text-emerald-700" 
                        : paymentStatus === "Unpaid"
                        ? "text-rose-600 print:text-rose-700"
                        : "text-amber-500 print:text-amber-600"
                    }`}>{paymentStatus}</span></p>
                    {bankDetails.trim() && (
                      <>
                        <p className="text-black/45 font-semibold text-[11px] uppercase tracking-wider mt-3">Bank Details</p>
                        <p className="leading-relaxed font-medium">{bankDetails}</p>
                      </>
                    )}
                  </div>
                </div>
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
                      const itemTotal = item.quantity * item.price;
                      return (
                        <tr key={item.id} className="border-b border-black/5">
                          <td className="py-4 text-black/40 font-medium">{index + 1}</td>
                          <td className="py-4 font-medium text-[15px] text-black">{item.name || "Untitled Item"}</td>
                          <td className="py-4 text-right font-medium">₹{item.price.toFixed(2)}</td>
                          <td className="py-4 text-center font-medium">{item.quantity}</td>
                          <td className="py-4 text-center font-medium text-black/60">{item.gstPercent}%</td>
                          <td className="py-4 text-right font-bold">₹{itemTotal.toFixed(2)}</td>
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
                </div>

                <div className="text-xs md:text-sm space-y-2.5">
                  <div className="flex justify-between text-black/60">
                    <span>Subtotal (Excl. Tax)</span>
                    <span className="font-semibold">₹{totals.subtotal.toFixed(2)}</span>
                  </div>
                  {totals.totalGst > 0 && (
                    <div className="flex justify-between text-black/60">
                      <span>Total GST (Included)</span>
                      <span className="font-semibold">₹{totals.totalGst.toFixed(2)}</span>
                    </div>
                  )}
                  {shippingFee > 0 && (
                    <div className="flex justify-between text-black/60">
                      <span>Shipping Fee</span>
                      <span className="font-semibold">₹{shippingFee.toFixed(2)}</span>
                    </div>
                  )}
                  {totals.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-bold">
                      <span>Discount ({totals.discountPercent.toFixed(2).replace(/\.00$/, "")}%)</span>
                      <span>-₹{totals.discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-bold border-t border-black/10 pt-3 text-black">
                    <span>Grand Total</span>
                    <span>₹{totals.grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Signature Area */}
            <div className="flex justify-between items-end border-t border-black/5 pt-10 mt-16 text-xs md:text-[13px]">
              <div className="text-xs text-black/50">
                <p>This is a computer-generated invoice and does not require a physical signature.</p>
                <p className="mt-0.5">Thank you for choosing HUME Fragrance.</p>
              </div>
              <div className="text-right w-56 border-t border-black/25 pt-2">
                <p className="font-bold text-sm text-black">Authorized Signatory</p>
                <p className="text-xs text-black/50 mt-0.5">{sellerName}</p>
              </div>
            </div>

          </div>
        </section>

      </div>

      <style jsx global>{`
        @media screen and (max-width: 840px) {
          .print-container {
            transform: scale(calc((100vw - 32px) / 800)) !important;
            transform-origin: top center !important;
            margin-bottom: calc(-1130px * (1 - (100vw - 32px) / 800)) !important;
            width: 800px !important;
            min-height: 1130px !important;
            box-shadow: none !important;
          }
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
