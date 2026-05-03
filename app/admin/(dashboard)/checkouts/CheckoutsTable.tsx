"use client";

import { useMemo } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { CheckoutDraft } from "@/db/schema";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageCircle, Copy, Clock, Phone, AlertCircle, ShoppingCart } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { formatINR } from "@/lib/currency";

function getDraftValue(draft: CheckoutDraft): number {
  return Number.parseFloat(String(draft.grandTotal ?? "0") || "0");
}

function scoreCheckoutDraft(draft: CheckoutDraft): number {
  let score = 0;
  const value = getDraftValue(draft);

  if (value >= 2500) score += 40;
  else if (value >= 1500) score += 30;
  else if (value >= 1000) score += 20;
  else if (value >= 500) score += 10;

  if (draft.phone) score += 25;
  if (draft.fullName) score += 10;
  if (draft.email) score += 5;
  if (draft.city && draft.state) score += 10;
  if (draft.addressLine1) score += 10;
  if (draft.pincode) score += 5;
  if ((draft.cartSnapshot?.length || 0) >= 2) score += 5;
  if (draft.status === "complete") score += 10;
  if (draft.status === "whatsapp_initiated") score -= 20;

  const hoursSinceUpdate = (Date.now() - new Date(draft.updatedAt).getTime()) / (1000 * 60 * 60);
  if (hoursSinceUpdate <= 1) score += 15;
  else if (hoursSinceUpdate <= 24) score += 8;
  else if (hoursSinceUpdate <= 72) score += 3;

  return Math.max(0, Math.min(100, Math.round(score)));
}

function getLeadTemperature(score: number): "Hot" | "Warm" | "Cold" {
  if (score >= 70) return "Hot";
  if (score >= 40) return "Warm";
  return "Cold";
}

function buildRecoveryMessage(draft: CheckoutDraft): string {
  const cartSummary = (draft.cartSnapshot || [])
    .map((item) => `${item.name} x${item.quantity}`)
    .join(", ");
  const name = draft.fullName?.trim() || "there";
  const amount = getDraftValue(draft);

  return [
    `Hi ${name},`,
    "",
    "Your HUME order is still saved with us.",
    cartSummary ? `You were checking out: ${cartSummary}.` : null,
    amount > 0 ? `Order value: ${formatINR(amount)}.` : null,
    "If you'd like, we can help you complete it right away on WhatsApp.",
  ]
    .filter(Boolean)
    .join("\n");
}

function normalizeWhatsAppNumber(phone: string | null): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.length === 10) return `91${digits}`;
  return digits;
}

export function CheckoutsTable({ initialDrafts }: { initialDrafts: CheckoutDraft[] }) {
  const scoredDrafts = useMemo(() => {
    return initialDrafts
      .filter((d) => d.status !== "promoted")
      .map((draft) => {
        const leadScore = scoreCheckoutDraft(draft);
        return {
          ...draft,
          leadScore,
          leadTemperature: getLeadTemperature(leadScore),
        };
      })
      .sort((a, b) => b.leadScore - a.leadScore || new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [initialDrafts]);

  const handleCopyRecoveryMessage = async (draft: CheckoutDraft) => {
    try {
      await navigator.clipboard.writeText(buildRecoveryMessage(draft));
      toast({ title: "Message Copied", description: "Recovery message is ready to paste." });
    } catch (error) {
      toast({ title: "Copy Failed", variant: "destructive" });
    }
  };

  const handleWhatsAppRecovery = (draft: CheckoutDraft) => {
    const phone = normalizeWhatsAppNumber(draft.phone);
    const message = encodeURIComponent(buildRecoveryMessage(draft));
    const url = phone ? `https://wa.me/${phone}?text=${message}` : `https://wa.me/?text=${message}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handlePromoteToOrder = async (draft: CheckoutDraft) => {
    if (!confirm(`Are you sure you want to convert this checkout from ${draft.fullName || "Unknown"} into an official Order?`)) return;
    
    try {
      const res = await fetch("/api/admin/convert-to-order", {
        method: "POST",
        body: JSON.stringify({ draftId: draft.id }),
      });
      const data = await res.json();
      if (data.ok) {
        toast({ title: "Order Created", description: `Order ${data.orderNumber} has been generated successfully.` });
        window.location.reload(); // Refresh to update lists
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({ title: "Promotion Failed", description: String(error), variant: "destructive" });
    }
  };

  const getTemperatureBadge = (temp: string) => {
    switch (temp) {
      case "Hot": return <Badge className="bg-red-500/10 text-red-600 hover:bg-red-500/20 border-none shadow-none">🔥 Hot</Badge>;
      case "Warm": return <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-none shadow-none">🟡 Warm</Badge>;
      case "Cold": return <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-none shadow-none">❄️ Cold</Badge>;
      default: return null;
    }
  };

  return (
    <div className="rounded-3xl border border-white/5 bg-white/[0.02] shadow-2xl backdrop-blur-md overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-white/[0.03]">
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="font-bold text-[10px] uppercase tracking-[0.2em] text-white/30 w-[120px] py-5 px-6">Score</TableHead>
              <TableHead className="font-bold text-[10px] uppercase tracking-[0.2em] text-white/30 py-5">Customer Lead</TableHead>
              <TableHead className="font-bold text-[10px] uppercase tracking-[0.2em] text-white/30 py-5">Abandoned Cart</TableHead>
              <TableHead className="font-bold text-[10px] uppercase tracking-[0.2em] text-white/30 py-5">Last Active</TableHead>
              <TableHead className="font-bold text-[10px] uppercase tracking-[0.2em] text-white/30 py-5 text-right px-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {scoredDrafts.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={5} className="h-[400px] text-center">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="rounded-full bg-white/[0.03] p-6 border border-white/5 shadow-2xl">
                      <ShoppingCart className="h-8 w-8 text-white/20" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xl font-serif text-white/40">No abandoned checkouts</p>
                      <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-bold">System is monitoring live traffic</p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              scoredDrafts.map((draft) => {
                const isRecoverable = !!draft.phone;
                
                return (
                  <TableRow key={draft.id} className="border-white/5 hover:bg-white/[0.02] transition-all duration-300 group">
                    <TableCell className="px-6">
                      <div className="flex flex-col gap-2 items-start py-4">
                        <div className="flex items-center gap-2">
                          {getTemperatureBadge(draft.leadTemperature)}
                          <Badge variant="secondary" className="text-[9px] px-2 py-0 h-4 border-white/10 font-bold uppercase tracking-tighter bg-white/5 text-white/60">
                            {draft.status.replace("_", " ")}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1.5 ml-1">
                          <span className="text-[9px] text-white/20 uppercase tracking-[0.15em] font-bold">Score</span>
                          <span className="text-[11px] font-bold text-primary/80">{draft.leadScore}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 py-4">
                        <p className="font-serif text-xl tracking-tight text-white group-hover:text-primary transition-colors">
                          {draft.fullName || <span className="italic text-white/20 font-normal">Unknown Guest</span>}
                        </p>
                        <div className="flex flex-col text-[12px] text-white/40 space-y-1">
                          {draft.phone && (
                            <div className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer group/item">
                              <Phone className="h-2.5 w-2.5 opacity-30 group-hover/item:opacity-100 transition-opacity" />
                              <span className="font-medium tracking-tight tracking-wide">{draft.phone}</span>
                            </div>
                          )}
                          {draft.email && (
                            <div className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer group/item">
                              <span className="opacity-30 group-hover/item:opacity-100 transition-opacity">@</span>
                              <span className="font-medium tracking-tight break-all max-w-[180px] truncate">{draft.email}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-2 py-4">
                        <p className="font-serif text-lg text-white font-medium">{formatINR(getDraftValue(draft))}</p>
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {draft.cartSnapshot?.map((item: any, i: number) => (
                            <Badge key={i} variant="outline" className="text-[10px] py-0 h-4 px-2 border-white/5 text-white/40 font-medium bg-white/[0.02]">
                              {item.name} {item.quantity > 1 && `(x${item.quantity})`}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 py-4">
                        <div className="flex items-center gap-2 text-white/30">
                          <Clock className="h-3 w-3 opacity-30" />
                          <span className="text-[11px] font-medium tracking-tight italic">
                            {formatDistanceToNow(new Date(draft.updatedAt), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-[9px] uppercase tracking-[0.15em] text-white/10 font-bold ml-5">
                          {format(new Date(draft.updatedAt), "MMM d, h:mm a")}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right px-6">
                      <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-10 w-10 rounded-2xl border-white/5 bg-white/[0.02] hover:bg-white/5 transition-all shadow-2xl"
                          onClick={() => handleCopyRecoveryMessage(draft)}
                        >
                          <Copy className="h-4 w-4 text-white/40" />
                        </Button>
                        <Button 
                          onClick={() => handleWhatsAppRecovery(draft)}
                          disabled={!isRecoverable}
                          className="h-10 px-6 rounded-2xl bg-[#25D366] hover:bg-[#128C7E] text-white font-bold text-[10px] uppercase tracking-widest shadow-2xl shadow-green-500/20 transition-all duration-300 disabled:opacity-20 disabled:grayscale"
                        >
                          RECOVER
                        </Button>
                        <Button 
                          onClick={() => handlePromoteToOrder(draft)}
                          variant="secondary"
                          className="h-10 px-6 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold text-[10px] uppercase tracking-widest transition-all duration-300 border border-white/10 shadow-2xl"
                        >
                          PROMOTE
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
