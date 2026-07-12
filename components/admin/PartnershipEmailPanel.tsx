"use client";

import { useState, useEffect } from "react";
import { 
  Mail, 
  Send, 
  Store, 
  User, 
  MapPin, 
  FileText, 
  Check, 
  AlertCircle, 
  Sparkles, 
  Eye, 
  Loader2, 
  RefreshCw,
  Info
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { 
  buildPartnershipEmailHtml, 
  buildPartnershipEmailText 
} from "@/lib/email/partnership-template";

export function PartnershipEmailPanel() {
  // Recipient States
  const [toEmail, setToEmail] = useState("");
  const [recipientName, setRecipientName] = useState("Buyer");
  const [storeName, setStoreName] = useState("");
  const [location, setLocation] = useState("");

  // Sender States
  const [senderEmail, setSenderEmail] = useState("support@humefragrance.com");
  const [senderName, setSenderName] = useState("");
  const [senderTitle, setSenderTitle] = useState("");

  // Content Customization States
  const [subject, setSubject] = useState("Partnership Inquiry: HUME Fragrance x {Store Name}");
  const [introHook, setIntroHook] = useState("");
  const [uspParagraph, setUspParagraph] = useState("");
  const [cta, setCta] = useState("");

  // UI States
  const [previewTab, setPreviewTab] = useState<"html" | "text">("html");
  const [isSending, setIsSending] = useState(false);
  const [lastSentEventId, setLastSentEventId] = useState<string | null>(null);
  const [lastSentStatus, setLastSentStatus] = useState<string | null>(null);

  // Dynamic values binding helper
  const getSubjectText = () => {
    return subject.replace(/\{Store Name\}/g, storeName.trim() || "Your Store");
  };

  // Re-generate templates client-side for live preview
  const emailHtml = buildPartnershipEmailHtml({
    storeName: storeName.trim() || "[Store Name]",
    recipientName: recipientName.trim() || "[Recipient Name]",
    location: location.trim() || "[Location]",
    senderName: senderName.trim(),
    senderTitle: senderTitle.trim(),
    senderEmail: senderEmail.trim(),
    introHook: introHook.trim() || undefined,
    uspParagraph: uspParagraph.trim() || undefined,
    cta: cta.trim() || undefined,
  });

  const emailText = buildPartnershipEmailText({
    storeName: storeName.trim() || "[Store Name]",
    recipientName: recipientName.trim() || "[Recipient Name]",
    location: location.trim() || "[Location]",
    senderName: senderName.trim(),
    senderTitle: senderTitle.trim(),
    senderEmail: senderEmail.trim(),
    introHook: introHook.trim() || undefined,
    uspParagraph: uspParagraph.trim() || undefined,
    cta: cta.trim() || undefined,
  });

  const handleResetContent = () => {
    setIntroHook("");
    setUspParagraph("");
    setCta("");
    setSubject("Partnership Inquiry: HUME Fragrance x {Store Name}");
    toast({
      title: "Content Reset",
      description: "Custom content sections have been reset to default branding templates.",
    });
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!toEmail || !toEmail.includes("@")) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid recipient email address.",
        variant: "destructive",
      });
      return;
    }
    if (!storeName.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a store name.",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    setLastSentEventId(null);
    setLastSentStatus(null);

    try {
      const response = await fetch("/api/admin/send-partnership", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          toEmail,
          subject: getSubjectText(),
          senderEmail,
          senderName,
          senderTitle,
          storeName,
          recipientName,
          location,
          introHook: introHook.trim() || undefined,
          uspParagraph: uspParagraph.trim() || undefined,
          cta: cta.trim() || undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to dispatch email");
      }

      if (data.ok) {
        setLastSentEventId(data.eventId);
        setLastSentStatus(data.status);
        
        toast({
          title: "Pitch Sent Successfully",
          description: `Partnership proposal dispatched to ${toEmail}. Status: ${data.status}`,
        });
      } else {
        throw new Error(data.error || "Mail service failed to report successful delivery");
      }
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Delivery Failure",
        description: error.message || "Failed to submit partnership request.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
      {/* Editor Controls Form */}
      <form onSubmit={handleSend} className="space-y-6 lg:col-span-5">
        
        {/* Recipient Details Card */}
        <section className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 shadow-xl backdrop-blur-xl">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <Store className="h-4.5 w-4.5 text-primary/75" />
            <h2 className="text-sm font-semibold text-white">Target Retailer Details</h2>
          </div>
          <div className="mt-4 space-y-4">
            <label className="block space-y-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-white/40">Store Name *</span>
              <div className="relative">
                <Store className="absolute top-2.5 left-3 h-4 w-4 text-white/30" />
                <input
                  type="text"
                  required
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="e.g. Le Bon Marché, Harrods"
                  className="h-9 w-full rounded-lg border border-white/10 bg-black/30 pr-3 pl-10 text-sm text-white placeholder:text-white/20 outline-none transition focus:border-white/30 focus:bg-black/50"
                />
              </div>
            </label>

            <div className="grid grid-cols-2 gap-4">
              <label className="block space-y-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-white/40">Buyer/Contact Name</span>
                <div className="relative">
                  <User className="absolute top-2.5 left-3 h-4 w-4 text-white/30" />
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="e.g. Isabella Dupont"
                    className="h-9 w-full rounded-lg border border-white/10 bg-black/30 pr-3 pl-10 text-sm text-white placeholder:text-white/20 outline-none transition focus:border-white/30 focus:bg-black/50"
                  />
                </div>
              </label>

              <label className="block space-y-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-white/40">Location / Country</span>
                <div className="relative">
                  <MapPin className="absolute top-2.5 left-3 h-4 w-4 text-white/30" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Paris, France"
                    className="h-9 w-full rounded-lg border border-white/10 bg-black/30 pr-3 pl-10 text-sm text-white placeholder:text-white/20 outline-none transition focus:border-white/30 focus:bg-black/50"
                  />
                </div>
              </label>
            </div>

            <label className="block space-y-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-white/40">Recipient Email *</span>
              <div className="relative">
                <Mail className="absolute top-2.5 left-3 h-4 w-4 text-white/30" />
                <input
                  type="email"
                  required
                  value={toEmail}
                  onChange={(e) => setToEmail(e.target.value)}
                  placeholder="e.g. buyer@storename.com"
                  className="h-9 w-full rounded-lg border border-white/10 bg-black/30 pr-3 pl-10 text-sm text-white placeholder:text-white/20 outline-none transition focus:border-white/30 focus:bg-black/50"
                />
              </div>
            </label>
          </div>
        </section>

        {/* Sender Details Card */}
        <section className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 shadow-xl backdrop-blur-xl">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <User className="h-4.5 w-4.5 text-primary/75" />
            <h2 className="text-sm font-semibold text-white">Sender Information</h2>
          </div>
          <div className="mt-4 space-y-4">
            <label className="block space-y-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-white/40">Sender Email Account *</span>
              <div className="relative">
                <Mail className="absolute top-2.5 left-3 h-4 w-4 text-white/30" />
                <input
                  type="text"
                  required
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  placeholder="e.g. support@humefragrance.com"
                  className="h-9 w-full rounded-lg border border-white/10 bg-black/30 pr-3 pl-10 text-sm text-white placeholder:text-white/20 outline-none transition focus:border-white/30 focus:bg-black/50"
                />
              </div>
              <p className="flex items-start gap-1 text-[10px] leading-relaxed text-white/30">
                <Info className="mt-0.5 h-3 w-3 shrink-0 text-white/40" />
                <span>Must be verified in Resend. Supports display names like <em>Athens Dubey &lt;support@humefragrance.com&gt;</em>.</span>
              </p>
            </label>

            <div className="grid grid-cols-2 gap-4">
              <label className="block space-y-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-white/40">Sender Name</span>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="h-9 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white placeholder:text-white/20 outline-none transition focus:border-white/30 focus:bg-black/50"
                />
              </label>

              <label className="block space-y-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-white/40">Sender Title</span>
                <input
                  type="text"
                  value={senderTitle}
                  onChange={(e) => setSenderTitle(e.target.value)}
                  className="h-9 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white placeholder:text-white/20 outline-none transition focus:border-white/30 focus:bg-black/50"
                />
              </label>
            </div>
          </div>
        </section>

        {/* Content Configuration Card */}
        <section className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <FileText className="h-4.5 w-4.5 text-primary/75" />
              <h2 className="text-sm font-semibold text-white">Customize Pitch Copy</h2>
            </div>
            <button
              type="button"
              onClick={handleResetContent}
              className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-white/40 hover:text-white/70 transition"
            >
              <RefreshCw className="h-2.5 w-2.5" />
              Reset defaults
            </button>
          </div>
          <div className="mt-4 space-y-4">
            <label className="block space-y-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-white/40">Subject Line *</span>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Partnership Inquiry: HUME Fragrance x {Store Name}"
                className="h-9 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white placeholder:text-white/20 outline-none transition focus:border-white/30 focus:bg-black/50"
              />
              <span className="block text-[9px] text-white/25">Use <code className="text-primary/70">{`{Store Name}`}</code> for dynamic replacement.</span>
            </label>

            <label className="block space-y-1.5">
              <div className="flex justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-white/40">Introductory Hook</span>
                <span className="text-[9px] text-white/25">Supports store & location placeholders</span>
              </div>
              <textarea
                value={introHook}
                onChange={(e) => setIntroHook(e.target.value)}
                rows={3}
                placeholder={`I hope this email finds you well. I have been following ${storeName || "[Store Name]"}'s exceptional selection of niche luxury goods in ${location || "[Location]"}, and I believe our artisanal fragrance collection would be a magnificent fit...`}
                className="w-full rounded-lg border border-white/10 bg-black/30 p-3 text-sm text-white placeholder:text-white/20 outline-none transition focus:border-white/30 focus:bg-black/50 resize-none"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-white/40">Core Value Proposition / USP</span>
              <textarea
                value={uspParagraph}
                onChange={(e) => setUspParagraph(e.target.value)}
                rows={4}
                placeholder="HUME Fragrance is a modern haute perfumery. We formulate high-concentration extraits de parfum (30%+ oil concentration)..."
                className="w-full rounded-lg border border-white/10 bg-black/30 p-3 text-sm text-white placeholder:text-white/20 outline-none transition focus:border-white/30 focus:bg-black/50 resize-none"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-white/40">Call to Action (CTA) Text</span>
              <textarea
                value={cta}
                onChange={(e) => setCta(e.target.value)}
                rows={3}
                placeholder="We would love to send a complimentary Discovery Kit containing our signature scents directly to your curation team..."
                className="w-full rounded-lg border border-white/10 bg-black/30 p-3 text-sm text-white placeholder:text-white/20 outline-none transition focus:border-white/30 focus:bg-black/50 resize-none"
              />
            </label>
          </div>
        </section>

        {/* Action Button & Logs */}
        <section className="space-y-4">
          <button
            type="submit"
            disabled={isSending}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white font-bold text-black transition hover:bg-white/90 disabled:opacity-50"
          >
            {isSending ? (
              <>
                <Loader2 className="h-4.5 w-4.5 animate-spin" />
                <span>Sending Pitch Proposal...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>Send Partnership Pitch</span>
              </>
            )}
          </button>

          {lastSentStatus && (
            <div className={`flex items-start gap-2.5 rounded-xl border p-4 text-xs ${
              lastSentStatus === "failed" 
                ? "border-red-500/20 bg-red-500/5 text-red-300"
                : "border-emerald-500/20 bg-emerald-500/5 text-emerald-300"
            }`}>
              {lastSentStatus === "failed" ? (
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              ) : (
                <Check className="mt-0.5 h-4 w-4 shrink-0" />
              )}
              <div>
                <p className="font-semibold uppercase tracking-wider">
                  Last Send Status: {lastSentStatus === "dry_run" ? "Dry Run Success" : lastSentStatus.toUpperCase()}
                </p>
                <p className="mt-1 opacity-70">
                  {lastSentStatus === "dry_run" 
                    ? "Email logged as dry-run. RESEND_API_KEY is active, but simulated or dry-run configuration intercepted."
                    : `Dispatched successfully through Resend provider.`}
                </p>
                {lastSentEventId && (
                  <p className="mt-2 font-mono text-[10px] text-white/30">
                    Event ID: {lastSentEventId}
                  </p>
                )}
              </div>
            </div>
          )}
        </section>
      </form>

      {/* Live Preview Panel */}
      <div className="flex flex-col lg:col-span-7 h-full min-h-[600px]">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <Eye className="h-4.5 w-4.5 text-primary/75" />
            <h2 className="text-sm font-semibold text-white">Live Email Preview</h2>
          </div>
          
          <div className="flex rounded-lg border border-white/10 bg-white/[0.03] p-1">
            <button
              type="button"
              onClick={() => setPreviewTab("html")}
              className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                previewTab === "html"
                  ? "bg-white text-black"
                  : "text-white/50 hover:text-white"
              }`}
            >
              Rich HTML
            </button>
            <button
              type="button"
              onClick={() => setPreviewTab("text")}
              className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                previewTab === "text"
                  ? "bg-white text-black"
                  : "text-white/50 hover:text-white"
              }`}
            >
              Plain Text
            </button>
          </div>
        </div>

        {/* Render Subject and Header mockups */}
        <div className="mt-4 rounded-xl border border-white/10 bg-black/40 p-4 space-y-2">
          <div className="flex text-xs leading-relaxed">
            <span className="w-16 font-semibold text-white/40">From:</span>
            <span className="text-white/70 font-mono">{senderName} &lt;{senderEmail}&gt;</span>
          </div>
          <div className="flex text-xs leading-relaxed">
            <span className="w-16 font-semibold text-white/40">To:</span>
            <span className="text-white/70 font-mono">{toEmail || "[Recipient Email Address]"}</span>
          </div>
          <div className="flex text-xs leading-relaxed border-t border-white/5 pt-2 mt-2">
            <span className="w-16 font-semibold text-white/40">Subject:</span>
            <span className="font-semibold text-white">{getSubjectText()}</span>
          </div>
        </div>

        {/* Live Preview Pane */}
        <div className="mt-4 flex-1 flex flex-col">
          {previewTab === "html" ? (
            <div className="relative flex-1 rounded-2xl border border-white/10 bg-white overflow-hidden min-h-[600px] shadow-2xl">
              <iframe
                title="Email Preview Frame"
                srcDoc={emailHtml}
                className="w-full h-full border-none absolute inset-0 bg-white"
                sandbox="allow-popups allow-popups-to-escape-sandbox"
              />
            </div>
          ) : (
            <pre className="flex-1 max-h-[600px] overflow-auto whitespace-pre-wrap rounded-2xl border border-white/10 bg-[#070708] p-5 text-xs font-mono leading-relaxed text-white/70 shadow-inner min-h-[600px]">
              {emailText}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
