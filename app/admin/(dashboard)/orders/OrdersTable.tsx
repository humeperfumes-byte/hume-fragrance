"use client";

import { useRef, useState } from "react";
import { format } from "date-fns";
import type { Order, Product } from "@/db/schema";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { CheckCircle2, Copy, ExternalLink, MessageCircle, Package, Trash2, Truck } from "lucide-react";
import { buildPublicTrackingUrl } from "@/lib/tracking-url";
import { displayPhoneNumber } from "@/lib/phone";
import { toast } from "@/hooks/use-toast";

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

type OrderCartItem = Order["cartSnapshot"][number];

function toOrderMoney(value: unknown): number {
  const parsed = Number.parseFloat(String(value ?? "0"));
  return Number.isFinite(parsed) ? parsed : 0;
}

function getOrderItemQuantity(item: OrderCartItem): number {
  const quantity = Number(item.quantity ?? 0);
  return Number.isFinite(quantity) ? quantity : 0;
}

function getOrderItemLineTotal(item: OrderCartItem): number {
  return toOrderMoney(item.price) * getOrderItemQuantity(item);
}

function getOrderPriceBreakdown(order: Order) {
  const items = order.cartSnapshot || [];
  const paidItems = items.filter((item) => !item.isGift);
  const itemTotal = paidItems.reduce((sum, item) => sum + getOrderItemLineTotal(item), 0);
  const storedSubtotal = toOrderMoney(order.subtotal);
  const subtotal = storedSubtotal > 0 ? storedSubtotal : itemTotal;
  const shippingFee = toOrderMoney(order.shippingFee);
  const grandTotal = toOrderMoney(order.grandTotal);
  const discount = Math.max(0, subtotal + shippingFee - grandTotal);

  return {
    items,
    itemTotal,
    subtotal,
    shippingFee,
    grandTotal,
    discount,
  };
}

function getSavedCheckoutPricingLines(message: string | null) {
  if (!message) return [];

  return message
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) =>
      /^(Subtotal|Coupon Discount|Welcome Back|Delivery|Grand Total|Offer Codes):/i.test(line),
    );
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

function onlyDigits(value: string | null | undefined) {
  return value?.replace(/\D/g, "") || "";
}

function CopyableOrderValue({
  label,
  value,
  copyValue,
  onCopy,
  className = "",
}: {
  label: string;
  value: string | null | undefined;
  copyValue?: string | null;
  onCopy: (text: string, label?: string) => void;
  className?: string;
}) {
  const displayValue = value?.trim() || "N/A";
  const finalCopyValue = (copyValue ?? value ?? "").trim();
  const canCopy = Boolean(finalCopyValue && displayValue !== "N/A");

  if (!canCopy) {
    return <span className={className}>{displayValue}</span>;
  }

  return (
    <button
      type="button"
      onClick={() => onCopy(finalCopyValue, `${label} copied`)}
      className={`cursor-copy rounded-md px-1.5 py-0.5 text-right transition hover:bg-white/10 hover:text-emerald-100 focus:outline-none focus:ring-1 focus:ring-emerald-300/40 ${className}`}
      title={`Copy ${label}`}
    >
      {displayValue}
    </button>
  );
}

function getProductOptionLabel(product: Product) {
  const status = product.badges?.soldOut
    ? " - Sold out"
    : product.badges?.comingSoon
      ? " - Coming soon"
      : "";
  return `${product.name} - Inspired by ${product.inspiration} - ${formatINR(product.price)}${status}`;
}

function canReplaceOrderItem(item: OrderCartItem) {
  return !item.isGift && !item.kitSelections?.length && !item.sampleSelections?.length;
}

function buildTrackingMessage(order: Order) {
  const trackingUrl = getTrackingUrl(order);
  return [
    `Hi ${order.fullName || "there"}, your order tracking link is here`,
    "",
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

function buildOrderSuccessMessage(order: Order) {
  const itemLines = (order.cartSnapshot || [])
    .filter((item) => !item.isGift)
    .slice(0, 4)
    .map((item) => `- ${item.name}${item.size ? ` (${item.size})` : ""} x${item.quantity}`);

  return [
    `Hi ${order.fullName || "there"},`,
    "",
    "Order Success",
    `Your HUME Fragrance order #${order.orderNumber} has been placed successfully.`,
    "",
    order.grandTotal ? `Order total: ${formatINR(Number(order.grandTotal))}` : null,
    "",
    itemLines.length ? "Items:" : null,
    ...itemLines,
    "",
    "We will start preparing your order and share the tracking details once it is dispatched.",
    "Team HUME Fragrance",
  ]
    .filter(Boolean)
    .join("\n");
}

export function OrdersTable({
  initialOrders,
  productOptions = [],
}: {
  initialOrders: Order[];
  productOptions?: Product[];
}) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Order>>({});
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [replacementSelections, setReplacementSelections] = useState<Record<number, string>>({});
  const longPressTimerRef = useRef<number | null>(null);
  const longPressTriggeredRef = useRef(false);

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
    const message = encodeURIComponent(buildOrderSuccessMessage(order));
    window.open(`https://wa.me/${waPhone}?text=${message}`, "_blank");
  };

  const copyText = async (text: string, label = "Copied") => {
    if (!text) return;
    await navigator.clipboard.writeText(text.trim());
    toast({ title: label });
  };

  const clearLongPressTimer = () => {
    if (longPressTimerRef.current) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrderIds((current) =>
      current.includes(orderId)
        ? current.filter((id) => id !== orderId)
        : [...current, orderId],
    );
  };

  const beginOrderSelection = (orderId: string) => {
    longPressTriggeredRef.current = true;
    setIsSelectionMode(true);
    setSelectedOrderIds((current) => (current.includes(orderId) ? current : [...current, orderId]));
  };

  const cancelOrderSelection = () => {
    clearLongPressTimer();
    setIsSelectionMode(false);
    setSelectedOrderIds([]);
  };

  const openOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setEditForm({
      ...order,
      fulfillmentCarrier: order.fulfillmentCarrier || "shiprocket",
    });
    setReplacementSelections({});
  };

  const handleOrderRowClick = (order: Order) => {
    if (longPressTriggeredRef.current) {
      longPressTriggeredRef.current = false;
      return;
    }

    if (isSelectionMode) {
      toggleOrderSelection(order.id);
      return;
    }

    openOrderDetails(order);
  };

  const handleBulkRemoveOrders = async () => {
    if (!selectedOrderIds.length) return;
    const confirmed = window.confirm(
      `Remove ${selectedOrderIds.length} selected order${selectedOrderIds.length === 1 ? "" : "s"}? This deletes the order records from admin.`,
    );
    if (!confirmed) return;

    setIsUpdating(true);
    try {
      const responses = await Promise.all(
        selectedOrderIds.map((orderId) =>
          fetch(`/api/admin/orders/${orderId}`, {
            method: "DELETE",
          }),
        ),
      );
      const failed = responses.find((response) => !response.ok);
      if (failed) throw new Error("Failed to remove selected orders");

      toast({ title: "Selected orders removed" });
      window.location.reload();
    } catch (error) {
      console.error(error);
      toast({ title: "Bulk delete failed", variant: "destructive" });
    } finally {
      setIsUpdating(false);
    }
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
    const fulfillmentCarrier = String(editForm.fulfillmentCarrier || "shiprocket").trim();
    const trackingUrl = buildPublicTrackingUrl(trackingNumber, window.location.origin);

    const payload: Record<string, any> = {
      fulfillmentCarrier,
      trackingNumber,
      trackingUrl,
    };

    if (trackingNumber) {
      payload.status = "shipped";
      payload.shippedAt = new Date().toISOString();
    }

    setIsUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${selectedOrder.id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to update tracking");
      window.location.reload();
    } catch (error) {
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReplaceOrderItem = async (itemIndex: number) => {
    if (!selectedOrder) return;
    const replacementId = replacementSelections[itemIndex];
    const replacement = productOptions.find((product) => product.id === replacementId);
    const currentItem = selectedOrder.cartSnapshot?.[itemIndex];

    if (!replacement || !currentItem) {
      toast({ title: "Choose a replacement product", variant: "destructive" });
      return;
    }

    if (!canReplaceOrderItem(currentItem)) {
      toast({ title: "This item cannot be replaced here", variant: "destructive" });
      return;
    }

    const nextItem: OrderCartItem = {
      ...currentItem,
      id: replacement.id,
      name: replacement.name,
      inspiration: replacement.inspiration,
      size: replacement.size,
      price: toOrderMoney(replacement.price),
    };
    const nextItems = selectedOrder.cartSnapshot.map((item, index) => (index === itemIndex ? nextItem : item));
    const oldLineTotal = getOrderItemLineTotal(currentItem);
    const nextLineTotal = getOrderItemLineTotal(nextItem);
    const priceDelta = nextLineTotal - oldLineTotal;
    const priceBreakdown = getOrderPriceBreakdown(selectedOrder);
    const nextSubtotal = Math.max(0, priceBreakdown.subtotal + priceDelta);
    const nextGrandTotal = Math.max(0, priceBreakdown.grandTotal + priceDelta);

    setIsUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${selectedOrder.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          cartSnapshot: nextItems,
          subtotal: nextSubtotal.toFixed(2),
          grandTotal: nextGrandTotal.toFixed(2),
        }),
      });
      if (!res.ok) throw new Error("Failed to replace order item");

      toast({ title: `${currentItem.name} replaced with ${replacement.name}` });
      window.location.reload();
    } catch (error) {
      console.error(error);
      toast({ title: "Replacement failed", variant: "destructive" });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveOrder = async () => {
    if (!selectedOrder) return;
    const confirmed = window.confirm(
      `Remove order ${selectedOrder.orderNumber}? This is useful for flow tests, but it will delete the order record from admin.`,
    );
    if (!confirmed) return;

    setIsUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${selectedOrder.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to remove order");
      window.location.reload();
    } catch (error) {
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Calculate earnings stats
  const paidStatuses = new Set(["processing", "shipped", "delivered", "complete", "payment_authorized"]);
  const paidOrders = initialOrders.filter((o) => paidStatuses.has(o.status));
  const totalEarnings = paidOrders.reduce((sum, o) => sum + Number(o.grandTotal || 0), 0);
  const totalCount = paidOrders.length;
  const aov = totalCount > 0 ? totalEarnings / totalCount : 0;

  // Pending checkout count
  const pendingOrders = initialOrders.filter((o) => ["whatsapp_initiated", "payment_pending"].includes(o.status));
  const pendingCount = pendingOrders.length;

  return (
    <div className="space-y-6">
      {/* Top Stats Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {/* Total Earnings */}
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 sm:p-5 shadow-lg backdrop-blur-md">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Total Earnings</p>
          <p className="mt-2 text-xl sm:text-2xl font-semibold text-white">{formatINR(totalEarnings)}</p>
          <p className="mt-1 text-xs text-emerald-400 font-medium">From {totalCount} paid orders</p>
        </div>

        {/* Paid Orders */}
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 sm:p-5 shadow-lg backdrop-blur-md">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Paid Orders</p>
          <p className="mt-2 text-xl sm:text-2xl font-semibold text-white">{totalCount}</p>
          <p className="mt-1 text-xs text-white/35">Successfully processed</p>
        </div>

        {/* Average Order Value */}
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 sm:p-5 shadow-lg backdrop-blur-md">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Avg. Order Value</p>
          <p className="mt-2 text-xl sm:text-2xl font-semibold text-white">{formatINR(aov)}</p>
          <p className="mt-1 text-xs text-white/35">Average basket size</p>
        </div>

        {/* Pending Checkout */}
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 sm:p-5 shadow-lg backdrop-blur-md">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Pending Checkout</p>
          <p className="mt-2 text-xl sm:text-2xl font-semibold text-white">{pendingCount}</p>
          <p className="mt-1 text-xs text-amber-400/90 font-medium">Abandoned/Initiated intents</p>
        </div>
      </div>

      <div className="rounded-3xl border border-white/5 bg-white/[0.02] shadow-2xl backdrop-blur-md overflow-hidden">
      {isSelectionMode ? (
        <div className="flex flex-col gap-3 border-b border-white/10 bg-white/[0.04] px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="text-sm font-semibold text-white">{selectedOrderIds.length} selected</p>
            <p className="text-xs text-white/35">Tap more rows to add or remove them from this batch.</p>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={cancelOrderSelection}
              disabled={isUpdating}
              className="rounded-xl border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.07]"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleBulkRemoveOrders}
              disabled={isUpdating || selectedOrderIds.length === 0}
              className="rounded-xl bg-red-500 text-white hover:bg-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Selected
            </Button>
          </div>
        </div>
      ) : null}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-white/[0.03]">
            <TableRow className="border-white/5 hover:bg-transparent">
              {isSelectionMode ? (
                <TableHead className="w-12 px-6 py-5">
                  <span className="sr-only">Selected</span>
                </TableHead>
              ) : null}
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
                <TableCell colSpan={isSelectionMode ? 9 : 8} className="h-[400px] text-center">
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
                const isSelected = selectedOrderIds.includes(order.id);
                
                return (
                  <TableRow 
                    key={order.id} 
                    className={`cursor-pointer transition-all duration-300 border-white/5 group ${
                      isSelected ? "bg-emerald-400/[0.08] hover:bg-emerald-400/[0.1]" : "hover:bg-white/[0.02]"
                    }`}
                    onPointerDown={(event) => {
                      if (event.button !== 0 || isSelectionMode) return;
                      longPressTriggeredRef.current = false;
                      clearLongPressTimer();
                      longPressTimerRef.current = window.setTimeout(() => beginOrderSelection(order.id), 520);
                    }}
                    onPointerUp={clearLongPressTimer}
                    onPointerCancel={clearLongPressTimer}
                    onPointerLeave={clearLongPressTimer}
                    onContextMenu={(event) => {
                      event.preventDefault();
                      beginOrderSelection(order.id);
                    }}
                    onClick={() => handleOrderRowClick(order)}
                  >
                    {isSelectionMode ? (
                      <TableCell className="px-6 py-5">
                        <span
                          className={`flex h-5 w-5 items-center justify-center rounded-md border text-[11px] font-bold ${
                            isSelected
                              ? "border-emerald-300 bg-emerald-300 text-black"
                              : "border-white/20 bg-white/[0.03] text-transparent"
                          }`}
                        >
                          {isSelected ? <CheckCircle2 className="h-3.5 w-3.5" /> : null}
                        </span>
                      </TableCell>
                    ) : null}
                    <TableCell className="px-6 py-5 font-mono text-[10px] text-white/40 font-bold tracking-widest">{order.orderNumber}</TableCell>
                    <TableCell className="text-[12px] text-white/40 font-medium italic">
                      {format(new Date(order.createdAt), "MMM d, h:mm a")}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-lg text-white group-hover:text-primary transition-colors">{order.fullName || "Guest"}</span>
                        <span className="text-[11px] text-white/30 font-medium tracking-tight">{displayPhoneNumber(order.phone) || order.email || "No contact"}</span>
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
          setReplacementSelections({});
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
                            <label className="text-[9px] uppercase font-bold text-white/30 ml-1 tracking-widest">Primary Phone</label>
                            <input 
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40 text-white"
                              value={displayPhoneNumber(editForm.phone)}
                              onChange={(e) => setEditForm({ ...editForm, phone: displayPhoneNumber(e.target.value) })}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[9px] uppercase font-bold text-white/30 ml-1 tracking-widest">Alternate Phone</label>
                            <input
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40 text-white"
                              value={displayPhoneNumber(editForm.alternatePhone)}
                              placeholder="Optional"
                              onChange={(e) => setEditForm({ ...editForm, alternatePhone: displayPhoneNumber(e.target.value) })}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] uppercase font-bold text-white/30 ml-1 tracking-widest">Email</label>
                          <input
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40 text-white"
                            value={editForm.email || ""}
                            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] uppercase font-bold text-white/30 ml-1 tracking-widest">Address Line 1</label>
                          <input
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40 text-white"
                            value={editForm.addressLine1 || ""}
                            placeholder="House / street / area"
                            onChange={(e) => setEditForm({ ...editForm, addressLine1: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] uppercase font-bold text-white/30 ml-1 tracking-widest">Address Line 2</label>
                          <input
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40 text-white"
                            value={editForm.addressLine2 || ""}
                            placeholder="Landmark / apartment / optional"
                            onChange={(e) => setEditForm({ ...editForm, addressLine2: e.target.value })}
                          />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-3">
                          <div className="space-y-2">
                            <label className="text-[9px] uppercase font-bold text-white/30 ml-1 tracking-widest">City</label>
                            <input
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40 text-white"
                              value={editForm.city || ""}
                              onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[9px] uppercase font-bold text-white/30 ml-1 tracking-widest">State</label>
                            <input
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40 text-white"
                              value={editForm.state || ""}
                              onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[9px] uppercase font-bold text-white/30 ml-1 tracking-widest">Pincode</label>
                            <input
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40 text-white"
                              value={editForm.pincode || ""}
                              onChange={(e) => setEditForm({ ...editForm, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) })}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] uppercase font-bold text-white/30 ml-1 tracking-widest">Order Notes</label>
                          <textarea
                            className="min-h-24 w-full resize-y bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40 text-white placeholder:text-white/20"
                            value={editForm.notes || ""}
                            placeholder="Delivery instruction or customer change request"
                            onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
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
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-white/40">Full Name</span>
                          <CopyableOrderValue label="name" value={selectedOrder.fullName} onCopy={copyText} className="font-medium text-white" />
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-white/40">Email</span>
                          <CopyableOrderValue label="email" value={selectedOrder.email} onCopy={copyText} className="font-medium text-white" />
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-white/40">WhatsApp</span>
                          <CopyableOrderValue
                            label="WhatsApp"
                            value={displayPhoneNumber(selectedOrder.phone)}
                            copyValue={onlyDigits(selectedOrder.phone)}
                            onCopy={copyText}
                            className="font-medium text-white"
                          />
                        </div>
                        {selectedOrder.alternatePhone ? (
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-white/40">Alternate</span>
                            <CopyableOrderValue
                              label="alternate phone"
                              value={displayPhoneNumber(selectedOrder.alternatePhone)}
                              copyValue={onlyDigits(selectedOrder.alternatePhone)}
                              onCopy={copyText}
                              className="font-medium text-white"
                            />
                          </div>
                        ) : null}
                      </div>
                    </div>

                    {(() => {
                      const fullAddressParts = [
                        selectedOrder.addressLine1?.trim(),
                        selectedOrder.addressLine2?.trim(),
                        [selectedOrder.city?.trim(), selectedOrder.state?.trim(), selectedOrder.pincode?.trim()].filter(Boolean).join(", ")
                      ].filter(Boolean);
                      const fullAddress = fullAddressParts.join("\n");

                      return (
                        <div className="space-y-4 rounded-2xl border border-white/5 bg-white/[0.02] p-4 sm:rounded-3xl sm:p-6">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-[10px] uppercase tracking-[0.2em] text-white/30">Logistics Destination</h4>
                            {fullAddressParts.length > 0 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => copyText(fullAddress, "Full address copied")}
                                className="h-7 px-2 text-[10px] font-bold text-emerald-400 hover:text-emerald-300 hover:bg-white/5 flex items-center gap-1.5"
                              >
                                <Copy className="h-3 w-3" />
                                COPY FULL ADDRESS
                              </Button>
                            )}
                          </div>
                          {fullAddressParts.length > 0 ? (
                            <button
                              type="button"
                              onClick={() => copyText(fullAddress, "Full address copied")}
                              className="group w-full text-left rounded-xl bg-black/20 hover:bg-white/5 border border-white/5 p-4 transition-all duration-300 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
                              title="Click to copy full address"
                            >
                              <div className="text-sm font-medium text-white whitespace-pre-wrap leading-relaxed text-left">
                                {fullAddress}
                              </div>
                              <div className="mt-3 flex items-center gap-1.5 text-[10px] text-white/20 group-hover:text-emerald-400 transition-colors">
                                <Copy className="h-3 w-3" />
                                <span>Click anywhere in this block to copy address</span>
                              </div>
                            </button>
                          ) : (
                            <p className="text-sm text-white/40 italic">No destination address added</p>
                          )}
                          {selectedOrder.notes ? (
                            <div className="mt-2 text-xs text-white/45 bg-amber-500/[0.02] border border-amber-500/5 rounded-xl p-3">
                              <span className="font-bold text-[9px] uppercase tracking-widest text-amber-300/80 block mb-1">Order Notes:</span>
                              <p>{selectedOrder.notes}</p>
                            </div>
                          ) : null}
                        </div>
                      );
                    })()}

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
                            value={editForm.fulfillmentCarrier || "shiprocket"}
                            onChange={(event) =>
                              setEditForm({ ...editForm, fulfillmentCarrier: event.target.value })
                            }
                            className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white outline-none focus:border-emerald-300/50"
                          >
                            <option className="bg-[#111]" value="shiprocket">Shiprocket</option>
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

                {(() => {
                  const priceBreakdown = getOrderPriceBreakdown(selectedOrder);
                  const savedPricingLines = getSavedCheckoutPricingLines(selectedOrder.whatsappMessage);
                  const discountLabel = selectedOrder.appliedCouponCode
                    ? `Discount / offer (${selectedOrder.appliedCouponCode})`
                    : "Discount / offer adjustment";

                  return (
                    <div className="rounded-xl border border-border/50 bg-secondary/10 p-5 space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="font-semibold text-sm uppercase tracking-widest text-muted-foreground">Order Items</h4>
                          <p className="mt-1 text-xs text-muted-foreground/80">Full saved price calculation for this order.</p>
                        </div>
                        {selectedOrder.appliedCouponCode ? (
                          <span className="rounded-md border border-emerald-400/20 bg-emerald-400/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-200">
                            {selectedOrder.appliedCouponCode}
                          </span>
                        ) : null}
                      </div>

                      <div className="space-y-4">
                        {priceBreakdown.items.length > 0 ? (
                          priceBreakdown.items.map((item, i) => (
                            <div key={`${item.id}-${i}`} className="flex justify-between text-sm items-start gap-4">
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="font-medium text-white">{item.isGift ? `Gift ${i + 1}` : item.name}</p>
                                  {item.isGift ? (
                                    <span className="rounded bg-emerald-400/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-emerald-200">
                                      Free
                                    </span>
                                  ) : null}
                                </div>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  Qty {getOrderItemQuantity(item)}
                                  {item.size ? ` · ${item.size}` : ""}
                                  {!item.isGift ? ` · ${formatINR(toOrderMoney(item.price))} each` : ""}
                                </p>
                                {item.sampleSelections?.length ? (
                                  <div className="mt-2 flex flex-wrap gap-1.5">
                                    {item.sampleSelections.map((selection) => (
                                      <span key={selection.id} className="rounded bg-emerald-400/[0.08] px-2 py-1 text-xs text-emerald-100/65">
                                        {selection.name}
                                      </span>
                                    ))}
                                  </div>
                                ) : null}
                                {canReplaceOrderItem(item) && productOptions.length > 0 ? (
                                  <div className="mt-3 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
                                    <select
                                      value={replacementSelections[i] || ""}
                                      onChange={(event) =>
                                        setReplacementSelections((current) => ({
                                          ...current,
                                          [i]: event.target.value,
                                        }))
                                      }
                                      className="h-10 min-w-0 rounded-xl border border-white/10 bg-black/30 px-3 text-xs text-white outline-none focus:border-emerald-300/50"
                                    >
                                      <option className="bg-[#111]" value="">
                                        Replace this product
                                      </option>
                                      {productOptions.map((product) => (
                                        <option
                                          key={product.id}
                                          className="bg-[#111]"
                                          value={product.id}
                                          disabled={product.id === item.id || product.badges?.soldOut || product.badges?.comingSoon}
                                        >
                                          {getProductOptionLabel(product)}
                                        </option>
                                      ))}
                                    </select>
                                    <Button
                                      type="button"
                                      onClick={() => handleReplaceOrderItem(i)}
                                      disabled={isUpdating || !replacementSelections[i]}
                                      className="h-10 rounded-xl bg-white text-black hover:bg-white/90"
                                    >
                                      Replace
                                    </Button>
                                  </div>
                                ) : null}
                              </div>
                              <p className={item.isGift ? "font-medium text-emerald-300" : "font-medium text-white"}>
                                {item.isGift ? "Free" : formatINR(getOrderItemLineTotal(item))}
                              </p>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">No cart snapshot saved.</p>
                        )}
                      </div>

                      <div className="pt-4 border-t border-border/50 space-y-2">
                        {priceBreakdown.itemTotal > 0 && priceBreakdown.itemTotal !== priceBreakdown.subtotal ? (
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>Item line total</span>
                            <span>{formatINR(priceBreakdown.itemTotal)}</span>
                          </div>
                        ) : null}
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Subtotal</span>
                          <span>{formatINR(priceBreakdown.subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Shipping Fee</span>
                          <span>{priceBreakdown.shippingFee === 0 ? "Free" : formatINR(priceBreakdown.shippingFee)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{discountLabel}</span>
                          <span className={priceBreakdown.discount > 0 ? "font-medium text-emerald-300" : "text-muted-foreground"}>
                            {priceBreakdown.discount > 0 ? `-${formatINR(priceBreakdown.discount)}` : formatINR(0)}
                          </span>
                        </div>
                        {priceBreakdown.discount > 0 ? (
                          <div className="rounded-lg border border-amber-400/15 bg-amber-400/[0.04] px-3 py-2 text-[11px] leading-relaxed text-amber-100/60">
                            This discount is calculated from saved order totals: subtotal + shipping - grand total.
                          </div>
                        ) : null}
                        {savedPricingLines.length > 0 ? (
                          <div className="rounded-lg border border-white/10 bg-black/25 p-3">
                            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/30">
                              Exact checkout message pricing
                            </p>
                            <div className="mt-2 space-y-1.5">
                              {savedPricingLines.map((line) => {
                                const [label, ...rest] = line.split(":");
                                const value = rest.join(":").trim();
                                const isDiscount = /^Coupon Discount|^Welcome Back/i.test(label);
                                const isTotal = /^Grand Total/i.test(label);

                                return (
                                  <div
                                    key={line}
                                    className={`flex justify-between gap-4 text-xs ${isTotal ? "font-semibold text-white" : "text-muted-foreground"}`}
                                  >
                                    <span>{label}</span>
                                    <span className={isDiscount ? "text-emerald-300" : "text-right"}>{value}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ) : null}
                        <div className="flex justify-between font-semibold pt-3 text-base border-t border-border/50">
                          <span>Grand Total</span>
                          <span>{formatINR(priceBreakdown.grandTotal)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                <div className="rounded-xl border border-border/50 bg-secondary/10 p-5 space-y-4">
                  <h4 className="font-semibold text-sm uppercase tracking-widest text-muted-foreground">Order Management</h4>
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    {/* Confirm Order / Processing */}
                    <Button 
                      onClick={() => handleUpdateStatus(selectedOrder.id, "processing")} 
                      disabled={isUpdating || selectedOrder.status === "processing"}
                      className={`rounded-xl font-bold text-[10px] tracking-widest uppercase h-10 shadow-md ${
                        selectedOrder.status === "processing"
                          ? "bg-indigo-600/30 text-indigo-300 border border-indigo-500/20 cursor-default"
                          : "bg-indigo-650 hover:bg-indigo-700 text-white"
                      }`}
                    >
                      {selectedOrder.status === "processing" ? "Confirmed" : "CONFIRM ORDER"}
                    </Button>

                    {/* Mark Shipped */}
                    <Button 
                      onClick={() => handleUpdateStatus(selectedOrder.id, "shipped")} 
                      disabled={isUpdating || selectedOrder.status === "shipped"}
                      className={`rounded-xl font-bold text-[10px] tracking-widest uppercase h-10 shadow-md ${
                        selectedOrder.status === "shipped"
                          ? "bg-blue-600/30 text-blue-300 border border-blue-500/20 cursor-default"
                          : "bg-blue-600 hover:bg-blue-700 text-white"
                      }`}
                    >
                      {selectedOrder.status === "shipped" ? "Shipped" : "MARK SHIPPED"}
                    </Button>

                    {/* Fulfill Order / Delivered */}
                    <Button 
                      onClick={() => handleUpdateStatus(selectedOrder.id, "delivered")} 
                      disabled={isUpdating || selectedOrder.status === "delivered"}
                      className={`rounded-xl font-bold text-[10px] tracking-widest uppercase h-10 shadow-md ${
                        selectedOrder.status === "delivered"
                          ? "bg-emerald-600/30 text-emerald-300 border border-emerald-500/20 cursor-default"
                          : "bg-emerald-600 hover:bg-emerald-700 text-white"
                      }`}
                    >
                      {selectedOrder.status === "delivered" ? "Delivered" : "FULFILL ORDER"}
                    </Button>

                    {/* Cancel Order */}
                    <Button 
                      onClick={() => handleUpdateStatus(selectedOrder.id, "cancelled")} 
                      disabled={isUpdating || selectedOrder.status === "cancelled"}
                      className={`rounded-xl font-bold text-[10px] tracking-widest uppercase h-10 shadow-md ${
                        selectedOrder.status === "cancelled"
                          ? "bg-red-950/30 text-red-400 border border-red-900/30 cursor-default"
                          : "bg-red-650 hover:bg-red-700 text-white"
                      }`}
                    >
                      {selectedOrder.status === "cancelled" ? "Cancelled" : "CANCEL ORDER"}
                    </Button>

                    <Button
                      type="button"
                      onClick={handleRemoveOrder}
                      disabled={isUpdating}
                      variant="outline"
                      className="col-span-2 rounded-xl border-red-500/40 bg-red-500/[0.04] text-red-300 hover:bg-red-500/10 font-bold text-[10px] tracking-widest uppercase h-10 mt-2"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      REMOVE TEST ORDER
                    </Button>
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 space-y-4">
                  <h4 className="text-sm font-semibold uppercase tracking-widest text-white/45">Customer Updates</h4>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => copyText(buildOrderSuccessMessage(selectedOrder))}
                      className="rounded-xl border-emerald-400/20 bg-emerald-400/[0.06] text-emerald-100 hover:bg-emerald-400/[0.1]"
                    >
                      <Copy className="mr-2 h-4 w-4" /> Order Success
                    </Button>
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
    </div>
  );
}
