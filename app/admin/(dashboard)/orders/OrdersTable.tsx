"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Order } from "@/db/schema";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { CheckCircle2, Copy, ExternalLink, MessageCircle, Package, Truck } from "lucide-react";
import { buildPublicTrackingUrl } from "@/lib/tracking-url";

export function formatINR(amount: number | string): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount));
}

function getOrderHost(order: Order) {
  if (!order.path) return "Unknown";
  try {
    return new URL(order.path).hostname.replace(/^www\./, "");
  } catch {
    return order.path.startsWith("/") ? "Legacy / unknown" : order.path;
  }
}

function getPaymentTrail(message: string | null) {
  if (!message) return null;
  const marker = "Razorpay webhook:";
  const start = message.indexOf(marker);
  if (start >= 0) return message.slice(start).trim();

  const paymentMarker = "Payment details:";
  const paymentStart = message.indexOf(paymentMarker);
  return paymentStart >= 0 ? message.slice(paymentStart).trim() : null;
}

function getTrackingUrl(order: Pick<Order, "trackingNumber" | "trackingUrl">) {
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  return buildPublicTrackingUrl(order.trackingNumber, origin) || order.trackingUrl || "";
}

function getCarrierLabel(carrier?: string | null) {
  if (!carrier) return "Speed Post";
  if (carrier === "speed_post") return "Speed Post";
  if (carrier === "delhivery") return "Delhivery";
  if (carrier === "bluedart") return "Blue Dart";
  return carrier;
}

function buildTrackingMessage(order: Order) {
  const trackingUrl = getTrackingUrl(order);
  return [
    `Hi ${order.fullName || "there"},`,
    "",
    `Your HUME order #${order.orderNumber} has been shipped.`,
    order.trackingNumber
      ? `Tracking ID: ${order.trackingNumber} (${getCarrierLabel(order.fulfillmentCarrier)})`
      : null,
    trackingUrl ? `Track here: ${trackingUrl}` : null,
    "",
    "Thank you for choosing HUME Fragrance.",
  ]
    .filter(Boolean)
    .join("\n");
}

function buildPackedMessage(order: Order) {
  return [
    `Hi ${order.fullName || "there"},`,
    "",
    `Your HUME order #${order.orderNumber} is packed and moving to dispatch.`,
    "We will share the tracking ID as soon as the parcel is handed over.",
    "",
    "Team HUME Fragrance",
  ].join("\n");
}

function buildDeliveredMessage(order: Order) {
  return [
    `Hi ${order.fullName || "there"},`,
    "",
    `Your HUME order #${order.orderNumber} shows as delivered.`,
    "We hope the fragrance feels perfect on skin. If anything needs attention, just reply here.",
    "",
    "Team HUME Fragrance",
  ].join("\n");
}

export function OrdersTable({ initialOrders }: { initialOrders: Order[] }) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Order>>({});

  // Status badge coloring
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "delivered":
      case "complete":
        return <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-none font-bold uppercase tracking-tighter text-[10px]">Delivered</Badge>;
      case "shipped":
        return <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-none font-bold uppercase tracking-tighter text-[10px]">Shipped</Badge>;
      case "processing":
        return <Badge className="bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20 border-none font-bold uppercase tracking-tighter text-[10px]">Processing</Badge>;
      case "payment_pending":
        return <Badge className="bg-sky-500/10 text-sky-600 hover:bg-sky-500/20 border-none font-bold uppercase tracking-tighter text-[10px]">Payment Pending</Badge>;
      case "payment_authorized":
        return <Badge className="bg-violet-500/10 text-violet-600 hover:bg-violet-500/20 border-none font-bold uppercase tracking-tighter text-[10px]">Payment Authorized</Badge>;
      case "payment_failed":
        return <Badge className="bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 border-none font-bold uppercase tracking-tighter text-[10px]">Payment Failed</Badge>;
      case "refund_initiated":
        return <Badge className="bg-cyan-500/10 text-cyan-600 hover:bg-cyan-500/20 border-none font-bold uppercase tracking-tighter text-[10px]">Refund Started</Badge>;
      case "partially_refunded":
        return <Badge className="bg-teal-500/10 text-teal-600 hover:bg-teal-500/20 border-none font-bold uppercase tracking-tighter text-[10px]">Part Refund</Badge>;
      case "refunded":
        return <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-none font-bold uppercase tracking-tighter text-[10px]">Refunded</Badge>;
      case "refund_failed":
        return <Badge className="bg-red-500/10 text-red-600 hover:bg-red-500/20 border-none font-bold uppercase tracking-tighter text-[10px]">Refund Failed</Badge>;
      case "payment_disputed":
        return <Badge className="bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 border-none font-bold uppercase tracking-tighter text-[10px]">Disputed</Badge>;
      case "dispute_action_required":
        return <Badge className="bg-red-500/10 text-red-600 hover:bg-red-500/20 border-none font-bold uppercase tracking-tighter text-[10px]">Action Required</Badge>;
      case "dispute_under_review":
        return <Badge className="bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20 border-none font-bold uppercase tracking-tighter text-[10px]">Under Review</Badge>;
      case "dispute_won":
        return <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-none font-bold uppercase tracking-tighter text-[10px]">Dispute Won</Badge>;
      case "dispute_lost":
        return <Badge className="bg-red-500/10 text-red-600 hover:bg-red-500/20 border-none font-bold uppercase tracking-tighter text-[10px]">Dispute Lost</Badge>;
      case "dispute_closed":
        return <Badge className="bg-slate-500/10 text-slate-400 hover:bg-slate-500/20 border-none font-bold uppercase tracking-tighter text-[10px]">Dispute Closed</Badge>;
      case "cancelled":
        return <Badge className="bg-red-500/10 text-red-600 hover:bg-red-500/20 border-none font-bold uppercase tracking-tighter text-[10px]">Cancelled</Badge>;
      case "whatsapp_initiated":
        return <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-none font-bold uppercase tracking-tighter text-[10px]">Pending WhatsApp</Badge>;
      default:
        return <Badge variant="secondary" className="capitalize border-none text-[10px]">{status.replace("_", " ")}</Badge>;
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      
      // Update local state if needed or just reload
      window.location.reload();
    } catch (error) {
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  const openWhatsApp = (order: Order) => {
    if (!order.phone) return;
    const phone = order.phone.replace(/\D/g, "");
    const waPhone = phone.length === 10 ? `91${phone}` : phone;
    const message = encodeURIComponent(`Hi ${order.fullName}, we received your order #${order.orderNumber} for ${formatINR(Number(order.grandTotal))}. Let us know if you need any help!`);
    window.open(`https://wa.me/${waPhone}?text=${message}`, "_blank");
  };

  const copyText = async (text: string) => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
  };

  const openWhatsAppWithMessage = (order: Order, message: string) => {
    const phone = order.phone?.replace(/\D/g, "");
    const waPhone = phone && phone.length === 10 ? `91${phone}` : phone;
    const encodedMessage = encodeURIComponent(message);
    window.open(
      waPhone ? `https://wa.me/${waPhone}?text=${encodedMessage}` : `https://wa.me/?text=${encodedMessage}`,
      "_blank",
    );
  };

  const handleSaveEdit = async () => {
    if (!selectedOrder) return;
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${selectedOrder.id}`, {
        method: "PATCH",
        body: JSON.stringify(editForm),
      });
      if (!res.ok) throw new Error("Failed to update order");
      window.location.reload();
    } catch (error) {
      console.error(error);
    } finally {
      setIsUpdating(false);
      setIsEditing(false);
    }
  };

  const handleSaveTracking = async () => {
    if (!selectedOrder) return;
    const trackingNumber = String(editForm.trackingNumber || "").trim().toUpperCase();
    const fulfillmentCarrier = String(editForm.fulfillmentCarrier || "speed_post").trim();
    const trackingUrl = buildPublicTrackingUrl(trackingNumber, window.location.origin);

    setIsUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${selectedOrder.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          fulfillmentCarrier,
          trackingNumber,
          trackingUrl,
        }),
      });
      if (!res.ok) throw new Error("Failed to update tracking");
      window.location.reload();
    } catch (error) {
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="rounded-3xl border border-white/5 bg-white/[0.02] shadow-2xl backdrop-blur-md overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-white/[0.03]">
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="w-[120px] font-bold text-[10px] uppercase tracking-[0.2em] text-white/30 py-5 px-6">Order ID</TableHead>
              <TableHead className="font-bold text-[10px] uppercase tracking-[0.2em] text-white/30 py-5">Date</TableHead>
              <TableHead className="font-bold text-[10px] uppercase tracking-[0.2em] text-white/30 py-5">Customer</TableHead>
              <TableHead className="font-bold text-[10px] uppercase tracking-[0.2em] text-white/30 py-5">Site</TableHead>
              <TableHead className="font-bold text-[10px] uppercase tracking-[0.2em] text-white/30 py-5">Items</TableHead>
              <TableHead className="font-bold text-[10px] uppercase tracking-[0.2em] text-white/30 py-5">Tracking</TableHead>
              <TableHead className="text-right font-bold text-[10px] uppercase tracking-[0.2em] text-white/30 py-5 px-6">Total</TableHead>
              <TableHead className="text-center font-bold text-[10px] uppercase tracking-[0.2em] text-white/30 py-5 px-6">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialOrders.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={8} className="h-[400px] text-center">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="rounded-full bg-white/[0.03] p-6 border border-white/5 shadow-2xl">
                      <Package className="h-8 w-8 text-white/20" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xl text-white/40">No confirmed orders</p>
                      <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-bold">System is ready for new orders</p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              initialOrders.map((order) => {
                const totalItems = order.cartSnapshot?.reduce((acc: number, item: { quantity: number }) => acc + item.quantity, 0) || 0;
                
                return (
                  <TableRow 
                    key={order.id} 
                    className="cursor-pointer hover:bg-white/[0.02] transition-all duration-300 border-white/5 group"
                    onClick={() => {
                      setSelectedOrder(order);
                      setEditForm(order);
                    }}
                  >
                    <TableCell className="px-6 py-5 font-mono text-[10px] text-white/40 font-bold tracking-widest">{order.orderNumber}</TableCell>
                    <TableCell className="text-[12px] text-white/40 font-medium italic">
                      {format(new Date(order.createdAt), "MMM d, h:mm a")}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-lg text-white group-hover:text-primary transition-colors">{order.fullName || "Guest"}</span>
                        <span className="text-[11px] text-white/30 font-medium tracking-tight">{order.phone || order.email || "No contact"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="border-white/10 bg-white/[0.04] text-white/55 shadow-none hover:bg-white/[0.04]">
                        {getOrderHost(order)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[12px] text-white/40 font-medium">{totalItems} items</TableCell>
                    <TableCell>
                      {order.trackingNumber ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-blue-400/20 bg-blue-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-blue-200">
                          <Truck className="h-3 w-3" />
                          {order.trackingNumber}
                        </span>
                      ) : (
                        <span className="text-[11px] text-white/25">Not added</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-lg text-white px-6">
                      {formatINR(Number(order.grandTotal))}
                    </TableCell>
                    <TableCell className="text-center px-6">
                      {getStatusBadge(order.status)}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Sheet open={!!selectedOrder} onOpenChange={(open) => {
        if (!open) {
          setSelectedOrder(null);
          setIsEditing(false);
        }
      }}>
        <SheetContent className="sm:max-w-md w-full overflow-y-auto bg-[#0a0a0a] border-l border-white/5 text-white font-sans">
          {selectedOrder && (
            <>
              <SheetHeader className="mb-8 mt-4">
                <div className="flex items-center justify-between">
                  <SheetTitle className="text-xl font-semibold text-white">Order #{selectedOrder.orderNumber}</SheetTitle>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setIsEditing(!isEditing)}
                    className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary hover:text-primary/80 hover:bg-primary/5"
                  >
                    {isEditing ? "CANCEL EDIT" : "EDIT INFO"}
                  </Button>
                </div>
                <SheetDescription className="text-white/40 font-medium">
                  Placed on {format(new Date(selectedOrder.createdAt), "MMMM d, yyyy 'at' h:mm a")}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-8">
                <div className="flex items-center justify-between border-b border-white/5 pb-6">
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Current Status</div>
                  {getStatusBadge(selectedOrder.status)}
                </div>

                <div className="space-y-3 rounded-2xl border border-white/5 bg-white/[0.02] p-4 sm:rounded-3xl sm:p-6">
                  <h4 className="font-bold text-[10px] uppercase tracking-[0.2em] text-white/30">Checkout Origin</h4>
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between gap-4">
                      <span className="text-white/40">Site</span>
                      <span className="font-medium text-white">{getOrderHost(selectedOrder)}</span>
                    </div>
                    <div className="break-all text-xs text-white/35">{selectedOrder.path || "No path captured"}</div>
                  </div>
                </div>

                {isEditing ? (
                  <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="space-y-5 rounded-2xl border border-primary/20 bg-primary/[0.03] p-4 sm:rounded-3xl sm:p-6">
                      <h4 className="font-bold text-[10px] uppercase tracking-[0.2em] text-primary/60">Modify Logistics</h4>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[9px] uppercase font-bold text-white/30 ml-1 tracking-widest">Full Name</label>
                          <input 
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40 text-white placeholder:text-white/20"
                            value={editForm.fullName || ""}
                            onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                          />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <label className="text-[9px] uppercase font-bold text-white/30 ml-1 tracking-widest">Phone</label>
                            <input 
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40 text-white"
                              value={editForm.phone || ""}
                              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[9px] uppercase font-bold text-white/30 ml-1 tracking-widest">Email</label>
                            <input 
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40 text-white"
                              value={editForm.email || ""}
                              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] uppercase font-bold text-white/30 ml-1 tracking-widest">Address Details</label>
                          <input 
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40 text-white"
                            value={editForm.addressLine1 || ""}
                            placeholder="Street Address"
                            onChange={(e) => setEditForm({ ...editForm, addressLine1: e.target.value })}
                          />
                        </div>
                      </div>
                      <Button onClick={handleSaveEdit} disabled={isUpdating} className="w-full rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground h-12 font-bold text-[11px] tracking-[0.2em] uppercase shadow-lg shadow-primary/10">
                        CONFIRM CHANGES
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="space-y-5 rounded-2xl border border-white/5 bg-white/[0.02] p-4 sm:rounded-3xl sm:p-6">
                      <h4 className="font-bold text-[10px] uppercase tracking-[0.2em] text-white/30">Customer Profile</h4>
                      <div className="text-sm space-y-3">
                        <div className="flex justify-between items-center"><span className="text-white/40">Full Name</span> <span className="font-medium text-white">{selectedOrder.fullName || "N/A"}</span></div>
                        <div className="flex justify-between items-center"><span className="text-white/40">Email</span> <span className="font-medium text-white">{selectedOrder.email || "N/A"}</span></div>
                        <div className="flex justify-between items-center"><span className="text-white/40">WhatsApp</span> <span className="font-medium text-white">{selectedOrder.phone || "N/A"}</span></div>
                      </div>
                    </div>

                    <div className="space-y-4 rounded-2xl border border-white/5 bg-white/[0.02] p-4 sm:rounded-3xl sm:p-6">
                      <h4 className="font-bold text-[10px] uppercase tracking-[0.2em] text-white/30">Logistics Destination</h4>
                      <div className="text-sm space-y-1 text-white/80 leading-relaxed">
                        <p className="text-white font-medium">{selectedOrder.addressLine1}</p>
                        {selectedOrder.addressLine2 && <p>{selectedOrder.addressLine2}</p>}
                        <p>{selectedOrder.city}, {selectedOrder.state} {selectedOrder.pincode}</p>
                        <p className="text-white/40 uppercase text-[10px] mt-2 font-bold tracking-widest">India</p>
                      </div>
                    </div>

                    <div className="space-y-4 rounded-2xl border border-emerald-400/10 bg-emerald-400/[0.035] p-4 sm:rounded-3xl sm:p-6">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h4 className="font-bold text-[10px] uppercase tracking-[0.2em] text-emerald-200/55">Shipping Desk</h4>
                          <p className="mt-1 text-xs text-white/35">Save tracking once the parcel is booked.</p>
                        </div>
                        {selectedOrder.trackingNumber ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-300" />
                        ) : (
                          <Truck className="h-5 w-5 text-white/35" />
                        )}
                      </div>

                      <div className="grid gap-3 sm:grid-cols-[0.8fr_1.2fr]">
                        <div className="space-y-2">
                          <label className="ml-1 text-[9px] font-bold uppercase tracking-widest text-white/30">
                            Carrier
                          </label>
                          <select
                            value={editForm.fulfillmentCarrier || "speed_post"}
                            onChange={(event) =>
                              setEditForm({ ...editForm, fulfillmentCarrier: event.target.value })
                            }
                            className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white outline-none focus:border-emerald-300/50"
                          >
                            <option className="bg-[#111]" value="speed_post">Speed Post</option>
                            <option className="bg-[#111]" value="delhivery">Delhivery</option>
                            <option className="bg-[#111]" value="bluedart">Blue Dart</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="ml-1 text-[9px] font-bold uppercase tracking-widest text-white/30">
                            Tracking ID
                          </label>
                          <input
                            className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm uppercase text-white placeholder:text-white/20 outline-none focus:border-emerald-300/50"
                            value={editForm.trackingNumber || ""}
                            placeholder="EU916101205IN"
                            onChange={(event) =>
                              setEditForm({ ...editForm, trackingNumber: event.target.value.toUpperCase() })
                            }
                          />
                        </div>
                      </div>

                      <div className="grid gap-2 sm:grid-cols-2">
                        <Button
                          type="button"
                          onClick={handleSaveTracking}
                          disabled={isUpdating}
                          className="rounded-xl bg-emerald-500 text-black hover:bg-emerald-400"
                        >
                          Save Tracking
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          disabled={!editForm.trackingNumber}
                          onClick={() =>
                            copyText(
                              buildPublicTrackingUrl(
                                String(editForm.trackingNumber || "").trim().toUpperCase(),
                                window.location.origin,
                              ),
                            )
                          }
                          className="rounded-xl border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.07]"
                        >
                          <Copy className="mr-2 h-4 w-4" /> Copy Link
                        </Button>
                      </div>

                      {selectedOrder.trackingNumber && (
                        <div className="grid gap-2 sm:grid-cols-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => window.open(getTrackingUrl(selectedOrder), "_blank")}
                            className="rounded-xl border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.07]"
                          >
                            <ExternalLink className="mr-2 h-4 w-4" /> Open Tracking
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => openWhatsAppWithMessage(selectedOrder, buildTrackingMessage(selectedOrder))}
                            className="rounded-xl border-[#25D366]/30 bg-[#25D366]/10 text-[#8ff0b0] hover:bg-[#25D366]/15"
                          >
                            <MessageCircle className="mr-2 h-4 w-4" /> Send Update
                          </Button>
                        </div>
                      )}
                    </div>

                    {getPaymentTrail(selectedOrder.whatsappMessage) && (
                      <div className="space-y-4 rounded-2xl border border-emerald-400/10 bg-emerald-400/[0.03] p-4 sm:rounded-3xl sm:p-6">
                        <h4 className="font-bold text-[10px] uppercase tracking-[0.2em] text-emerald-200/45">Payment Timeline</h4>
                        <pre className="max-h-56 overflow-y-auto whitespace-pre-wrap break-words rounded-2xl bg-black/25 p-4 text-[11px] leading-relaxed text-white/65">
                          {getPaymentTrail(selectedOrder.whatsappMessage)}
                        </pre>
                      </div>
                    )}
                  </>
                )}

                <div className="rounded-xl border border-border/50 bg-secondary/10 p-5 space-y-4">
                  <h4 className="font-semibold text-sm uppercase tracking-widest text-muted-foreground">Order Items</h4>
                  <div className="space-y-4">
                    {selectedOrder.cartSnapshot?.map((item: { name: string; quantity: number; price: number; size?: string }, i: number) => (
                      <div key={i} className="flex justify-between text-sm items-start">
                        <div>
                          <p className="font-medium">{item.name} <span className="text-muted-foreground text-xs ml-1">x{item.quantity}</span></p>
                          {item.size && <p className="text-xs text-muted-foreground mt-0.5">{item.size}</p>}
                        </div>
                        <p className="font-medium">{formatINR(item.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>
                  <div className="pt-4 border-t border-border/50 space-y-2">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Subtotal</span>
                      <span>{formatINR(Number(selectedOrder.subtotal))}</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Shipping Fee</span>
                      <span>{Number(selectedOrder.shippingFee) === 0 ? "Free" : formatINR(Number(selectedOrder.shippingFee))}</span>
                    </div>
                    <div className="flex justify-between font-semibold pt-2 text-base">
                      <span>Grand Total</span>
                      <span>{formatINR(Number(selectedOrder.grandTotal))}</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-border/50 bg-secondary/10 p-5 space-y-4">
                  <h4 className="font-semibold text-sm uppercase tracking-widest text-muted-foreground">Order Management</h4>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {selectedOrder.status !== "shipped" && selectedOrder.status !== "delivered" && selectedOrder.status !== "cancelled" && (
                      <Button 
                        onClick={() => handleUpdateStatus(selectedOrder.id, "shipped")} 
                        disabled={isUpdating}
                        className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] tracking-widest uppercase h-10 shadow-md"
                      >
                        MARK SHIPPED
                      </Button>
                    )}
                    {selectedOrder.status !== "delivered" && selectedOrder.status !== "cancelled" && (
                      <Button 
                        onClick={() => handleUpdateStatus(selectedOrder.id, "delivered")} 
                        disabled={isUpdating}
                        className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] tracking-widest uppercase h-10 shadow-md"
                      >
                        FULFILL ORDER
                      </Button>
                    )}
                    {selectedOrder.status !== "cancelled" && (
                      <Button 
                        onClick={() => handleUpdateStatus(selectedOrder.id, "cancelled")} 
                        disabled={isUpdating}
                        variant="outline"
                        className="rounded-xl border-red-500/30 text-red-600 hover:bg-red-500/10 font-bold text-[10px] tracking-widest uppercase h-10 col-span-2 mt-2"
                      >
                        CANCEL ORDER
                      </Button>
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 space-y-4">
                  <h4 className="text-sm font-semibold uppercase tracking-widest text-white/45">Customer Updates</h4>
                  <div className="grid gap-2 sm:grid-cols-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => copyText(buildPackedMessage(selectedOrder))}
                      className="rounded-xl border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.07]"
                    >
                      <Copy className="mr-2 h-4 w-4" /> Packed
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => copyText(buildTrackingMessage(selectedOrder))}
                      className="rounded-xl border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.07]"
                    >
                      <Copy className="mr-2 h-4 w-4" /> Shipped
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => copyText(buildDeliveredMessage(selectedOrder))}
                      className="rounded-xl border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.07]"
                    >
                      <Copy className="mr-2 h-4 w-4" /> Delivered
                    </Button>
                  </div>
                </div>

                {selectedOrder.phone && (
                  <Button onClick={() => openWhatsApp(selectedOrder)} className="w-full rounded-xl bg-[#25D366] hover:bg-[#128C7E] text-white h-12 shadow-md">
                    <MessageCircle className="mr-2 h-5 w-5" /> Message via WhatsApp
                  </Button>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
