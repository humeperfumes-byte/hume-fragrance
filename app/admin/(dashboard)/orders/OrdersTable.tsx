"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { format } from "date-fns";
import Image from "next/image";
import type { Order, Product } from "@/db/schema";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { CheckCircle2, Clock3, Copy, ExternalLink, History, MessageCircle, Package, Plus, RefreshCw, ShoppingCart, Trash2, Truck, Undo2, WalletCards } from "lucide-react";
import { buildPublicTrackingUrl } from "@/lib/tracking-url";
import { displayPhoneNumber } from "@/lib/phone";
import { toast } from "@/hooks/use-toast";
import { withCloudinaryTransforms } from "@/lib/cloudinary";

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
type OrderEditForm = Partial<Order> & { editReason?: string };

type CustomerActivity = {
  id: string;
  type: "order" | "checkout";
  reference: string;
  status: string;
  amount: number;
  itemCount: number;
  itemNames: string[];
  path: string | null;
  occurredAt: string;
};
type OrderAudit = { id: string; changeType: string; reason: string | null; actor: string; beforeSnapshot: Record<string, unknown>; afterSnapshot: Record<string, unknown>; createdAt: string };

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

function isPartialCodOrder(order: Pick<Order, "paymentMethod">) {
  return Boolean(order.paymentMethod?.includes("Prepaid") && order.paymentMethod.includes("Cash on Delivery"));
}

function getPartialCodBreakdown(order: Pick<Order, "paymentMethod" | "grandTotal" | "status">) {
  if (!isPartialCodOrder(order)) return null;
  const total = toOrderMoney(order.grandTotal);
  const savedPercent = Number(order.paymentMethod?.match(/(\d+)%\s*Prepaid/i)?.[1] ?? 20);
  const prepaidPercent = Number.isFinite(savedPercent) ? savedPercent : 20;
  const codPercent = Math.max(0, 100 - prepaidPercent);
  const prepaid = Math.max(0, Math.round(total * (prepaidPercent / 100)));
  const codBalance = Math.max(0, total - prepaid);
  const advanceReceived = ["processing", "packed", "shipped", "delivered", "complete", "payment_authorized"].includes(order.status);
  const codCollected = ["delivered", "complete"].includes(order.status);
  return { total, prepaid, codBalance, prepaidPercent, codPercent, advanceReceived, codCollected };
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

function getOrderRowTone(status: string) {
  switch (status) {
    case "processing":
      return "border-l-[3px] border-l-violet-300";
    case "packed":
      return "border-l-[3px] border-l-fuchsia-300";
    case "shipped":
      return "border-l-[3px] border-l-sky-300";
    case "delivered":
    case "complete":
      return "border-l-[3px] border-l-emerald-300";
    case "cancelled":
      return "border-l-[3px] border-l-rose-300";
    case "payment_pending":
    case "whatsapp_initiated":
      return "border-l-[3px] border-l-amber-300";
    case "payment_authorized":
      return "border-l-[3px] border-l-indigo-300";
    case "payment_failed":
    case "refund_failed":
    case "payment_disputed":
    case "dispute_action_required":
      return "border-l-[3px] border-l-red-300";
    case "refund_initiated":
    case "partially_refunded":
      return "border-l-[3px] border-l-cyan-300";
    case "refunded":
      return "border-l-[3px] border-l-teal-300";
    default:
      return "border-l-[3px] border-l-white/20";
  }
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
function buildPendingPaymentFollowupMessage(order: Order) {
  const itemNames = (order.cartSnapshot || [])
    .filter((item) => !item.isGift)
    .map((item) => item.name)
    .slice(0, 3)
    .join(", ");

  return [
    `Hi ${order.fullName || "there"},`,
    "",
    `Your HUME Fragrance order #${order.orderNumber} is pending payment confirmation.`,
    itemNames ? `Items: ${itemNames}` : null,
    order.grandTotal ? `Pending Amount: ${formatINR(Number(order.grandTotal))}` : null,
    "",
    "Would you like us to re-send the payment link or help you complete it via UPI or Cash on Delivery?",
    "Reply to this message and we will assist you immediately!",
    "",
    "Team HUME Fragrance",
  ]
    .filter(Boolean)
    .join("\n");
}

export function OrdersTable({
  initialOrders,
  productOptions = [],
  capturedAmounts = {},
}: {
  initialOrders: Order[];
  productOptions?: Product[];
  capturedAmounts?: Record<string, number>;
}) {
  const [orderRows, setOrderRows] = useState(initialOrders);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<OrderEditForm>({});
  const [addProductId, setAddProductId] = useState("");
  const [previewImage, setPreviewImage] = useState<{ url: string; name: string } | null>(null);

  useEffect(() => {
    if (!previewImage) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPreviewImage(null);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [previewImage]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [customerActivity, setCustomerActivity] = useState<CustomerActivity[]>([]);
  const [orderAudits, setOrderAudits] = useState<OrderAudit[]>([]);
  const [isActivityLoading, setIsActivityLoading] = useState(false);
  const [activityError, setActivityError] = useState("");
  const longPressTimerRef = useRef<number | null>(null);
  const longPressTriggeredRef = useRef(false);
  const activityRequestRef = useRef(0);

  // Status badge coloring
  const getStatusBadge = (status: string) => {
    const badgeBase = "rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] shadow-none";
    switch (status) {
      case "delivered":
      case "complete":
        return <Badge className={`${badgeBase} border-emerald-400/25 bg-emerald-400/10 text-emerald-200 hover:bg-emerald-400/15`}>Delivered</Badge>;
      case "shipped":
        return <Badge className={`${badgeBase} border-sky-400/25 bg-sky-400/10 text-sky-200 hover:bg-sky-400/15`}>Shipped</Badge>;
      case "processing":
        return <Badge className={`${badgeBase} border-[#c5a9ff]/25 bg-[#c5a9ff]/10 text-[#d9c8ff] hover:bg-[#c5a9ff]/15`}>Confirmed</Badge>;
      case "packed":
        return <Badge className={`${badgeBase} border-violet-400/25 bg-violet-400/10 text-violet-200 hover:bg-violet-400/15`}>Packed</Badge>;
      case "payment_pending":
        return <Badge className={`${badgeBase} border-amber-400/25 bg-amber-400/10 text-amber-200 hover:bg-amber-400/15`}>Payment Pending</Badge>;
      case "payment_authorized":
        return <Badge className={`${badgeBase} border-violet-400/25 bg-violet-400/10 text-violet-200 hover:bg-violet-400/15`}>Payment Authorized</Badge>;
      case "payment_failed":
        return <Badge className={`${badgeBase} border-rose-400/25 bg-rose-400/10 text-rose-200 hover:bg-rose-400/15`}>Payment Failed</Badge>;
      case "refund_initiated":
        return <Badge className={`${badgeBase} border-cyan-400/25 bg-cyan-400/10 text-cyan-200 hover:bg-cyan-400/15`}>Refund Started</Badge>;
      case "partially_refunded":
        return <Badge className={`${badgeBase} border-teal-400/25 bg-teal-400/10 text-teal-200 hover:bg-teal-400/15`}>Part Refund</Badge>;
      case "refunded":
        return <Badge className={`${badgeBase} border-emerald-400/25 bg-emerald-400/10 text-emerald-200 hover:bg-emerald-400/15`}>Refunded</Badge>;
      case "refund_failed":
        return <Badge className={`${badgeBase} border-red-400/25 bg-red-400/10 text-red-200 hover:bg-red-400/15`}>Refund Failed</Badge>;
      case "payment_disputed":
        return <Badge className={`${badgeBase} border-orange-400/25 bg-orange-400/10 text-orange-200 hover:bg-orange-400/15`}>Disputed</Badge>;
      case "dispute_action_required":
        return <Badge className={`${badgeBase} border-red-400/25 bg-red-400/10 text-red-200 hover:bg-red-400/15`}>Action Required</Badge>;
      case "dispute_under_review":
        return <Badge className={`${badgeBase} border-yellow-400/25 bg-yellow-400/10 text-yellow-200 hover:bg-yellow-400/15`}>Under Review</Badge>;
      case "dispute_won":
        return <Badge className={`${badgeBase} border-emerald-400/25 bg-emerald-400/10 text-emerald-200 hover:bg-emerald-400/15`}>Dispute Won</Badge>;
      case "dispute_lost":
        return <Badge className={`${badgeBase} border-red-400/25 bg-red-400/10 text-red-200 hover:bg-red-400/15`}>Dispute Lost</Badge>;
      case "dispute_closed":
        return <Badge className={`${badgeBase} border-slate-400/20 bg-slate-400/10 text-slate-300 hover:bg-slate-400/15`}>Dispute Closed</Badge>;
      case "cancelled":
        return <Badge className={`${badgeBase} border-red-400/25 bg-red-400/10 text-red-200 hover:bg-red-400/15`}>Cancelled</Badge>;
      case "whatsapp_initiated":
        return <Badge className={`${badgeBase} border-amber-400/25 bg-amber-400/10 text-amber-200 hover:bg-amber-400/15`}>Pending WhatsApp</Badge>;
      default:
        return <Badge variant="secondary" className={`${badgeBase} border-white/15 bg-white/[0.06] capitalize text-white/65`}>{status.replace("_", " ")}</Badge>;
    }
  };

  const getOrderStatusBadge = (order: Order) => {
    const partialCod = getPartialCodBreakdown(order);
    if (partialCod && partialCod.advanceReceived && !partialCod.codCollected) {
      return <Badge className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-emerald-200 shadow-none hover:bg-emerald-400/15">{partialCod.prepaidPercent}% Paid + COD</Badge>;
    }
    return getStatusBadge(order.status);
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string, reason?: string) => {
    if (!reason && !window.confirm(`Change this order to ${newStatus.replaceAll("_", " ")}?`)) return;
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, reason }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      const data = await res.json() as { order: Order };
      setOrderRows((current) => current.map((order) => order.id === orderId ? data.order : order));
      setSelectedOrder(data.order);
      setEditForm((current) => ({ ...current, status: data.order.status }));
      await loadCustomerActivity(orderId);
      toast({ title: reason ? "Status change reverted" : "Order status updated" });
    } catch (error) {
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReconcilePayment = async (orderId: string) => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/reconcile-payment`, { method: "POST" });
      const data = await response.json() as { error?: string; order?: Order; capturedAmount?: number; syncStatus?: string; providerOrders?: number };
      if (!response.ok || !data.order) throw new Error(data.error || "Payment reconciliation failed");
      setOrderRows((current) => current.map((order) => order.id === orderId ? data.order! : order));
      setSelectedOrder(data.order);
      setEditForm((current) => ({ ...current, status: data.order!.status }));
      await loadCustomerActivity(orderId);
      toast({ title: data.capturedAmount ? `Payment verified: ${formatINR(data.capturedAmount)}` : "No captured payment found", description: `${data.providerOrders ?? 0} Razorpay attempt(s) checked · ${data.syncStatus ?? "unknown"}` });
    } catch (error) {
      toast({ title: error instanceof Error ? error.message : "Payment reconciliation failed", variant: "destructive" });
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

  const loadCustomerActivity = async (orderId: string) => {
    const requestId = ++activityRequestRef.current;
    setCustomerActivity([]);
    setOrderAudits([]);
    setActivityError("");
    setIsActivityLoading(true);

    try {
      const response = await fetch(`/api/admin/orders/${orderId}/activity`, { cache: "no-store" });
      if (!response.ok) throw new Error("Unable to load recent activity");
      const data = (await response.json()) as { activity?: CustomerActivity[]; audits?: OrderAudit[] };
      if (requestId === activityRequestRef.current) { setCustomerActivity(data.activity ?? []); setOrderAudits(data.audits ?? []); }
    } catch (error) {
      console.error(error);
      if (requestId === activityRequestRef.current) setActivityError("Recent activity could not be loaded.");
    } finally {
      if (requestId === activityRequestRef.current) setIsActivityLoading(false);
    }
  };

  const openOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setEditForm({
      ...order,
      fulfillmentCarrier: order.fulfillmentCarrier || "shiprocket",
    });
    void loadCustomerActivity(order.id);
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
    const payload = {
      fullName: editForm.fullName || "", phone: editForm.phone || "", alternatePhone: editForm.alternatePhone || "", email: editForm.email || "",
      addressLine1: editForm.addressLine1 || "", addressLine2: editForm.addressLine2 || "", city: editForm.city || "", state: editForm.state || "", pincode: editForm.pincode || "", notes: editForm.notes || "",
      cartSnapshot: editForm.cartSnapshot || [], appliedCouponCode: editForm.appliedCouponCode || "", shippingFee: Number(editForm.shippingFee || 0), manualAdjustment: Number(editForm.manualAdjustment || 0), adjustmentReason: editForm.adjustmentReason || "", editReason: editForm.editReason || "",
      shippingMethod: editForm.shippingMethod || "", paymentMethod: editForm.paymentMethod || "", fulfillmentCarrier: editForm.fulfillmentCarrier || "", trackingNumber: editForm.trackingNumber || "", trackingUrl: editForm.trackingUrl || "", trackingStatus: editForm.trackingStatus || "", status: editForm.status,
    };
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${selectedOrder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update order");
      setSelectedOrder(data.order);
      setOrderRows((current) => current.map((order) => order.id === data.order.id ? data.order : order));
      setEditForm({ ...data.order, fulfillmentCarrier: data.order.fulfillmentCarrier || "shiprocket" });
      toast({ title: "Order updated", description: data.reconciliation?.capturedAmount ? `Payment difference: ${formatINR(data.reconciliation.difference)}` : undefined });
      void loadCustomerActivity(data.order.id);
    } catch (error) {
      console.error(error); toast({ title: error instanceof Error ? error.message : "Could not update order", variant: "destructive" });
    } finally {
      setIsUpdating(false);
      setIsEditing(false);
    }
  };

  const updateEditItem = (index: number, patch: Partial<OrderCartItem>) => {
    setEditForm((current) => ({ ...current, cartSnapshot: (current.cartSnapshot || []).map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item) }));
  };

  const removeEditItem = (index: number) => {
    setEditForm((current) => ({ ...current, cartSnapshot: (current.cartSnapshot || []).filter((_, itemIndex) => itemIndex !== index) }));
  };

  const addEditProduct = () => {
    const product = productOptions.find((item) => item.id === addProductId); if (!product) return;
    setEditForm((current) => ({ ...current, cartSnapshot: [...(current.cartSnapshot || []), { id: product.id, name: product.name, inspiration: product.inspiration, image: product.images?.[0], size: product.size, price: Number(product.price), quantity: 1 }] }));
    setAddProductId("");
  };

  const handleSaveTracking = async () => {
    if (!selectedOrder) return;
    const trackingNumber = String(editForm.trackingNumber || "").trim().toUpperCase();
    const fulfillmentCarrier = String(editForm.fulfillmentCarrier || "shiprocket").trim();
    const trackingUrl = buildPublicTrackingUrl(trackingNumber, window.location.origin);

    const payload: Record<string, unknown> = {
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
  const paidStatuses = new Set(["processing", "packed", "shipped", "delivered", "complete", "payment_authorized"]);
  const paidOrders = orderRows.filter((o) => paidStatuses.has(o.status));
  const totalEarnings = paidOrders.reduce((sum, order) => {
    const partialCod = getPartialCodBreakdown(order);
    if (!partialCod) return sum + Number(order.grandTotal || 0);
    return sum + (partialCod.codCollected ? partialCod.total : partialCod.prepaid);
  }, 0);
  const totalCount = paidOrders.length;
  const aov = totalCount > 0 ? totalEarnings / totalCount : 0;

  // Pending checkout count
  const pendingOrders = orderRows.filter((o) => ["whatsapp_initiated", "payment_pending"].includes(o.status));
  const pendingCount = pendingOrders.length;
  const partialCodOrders = orderRows.filter((order) => isPartialCodOrder(order));
  const outstandingCod = partialCodOrders.reduce((sum, order) => {
    const breakdown = getPartialCodBreakdown(order);
    return sum + (breakdown && breakdown.advanceReceived && !breakdown.codCollected ? breakdown.codBalance : 0);
  }, 0);
  const latestRevertibleStatusAudit = selectedOrder
    ? orderAudits.find((audit) => {
        const beforeStatus = audit.beforeSnapshot?.status;
        const afterStatus = audit.afterSnapshot?.status;
        return (
          ["status", "status_reversal"].includes(audit.changeType) &&
          typeof beforeStatus === "string" &&
          beforeStatus !== afterStatus &&
          afterStatus === selectedOrder.status
        );
      })
    : undefined;
  const previousOrderStatus = typeof latestRevertibleStatusAudit?.beforeSnapshot?.status === "string"
    ? latestRevertibleStatusAudit.beforeSnapshot.status
    : null;

  return (
    <div className="space-y-6">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {/* Total Earnings */}
        <div className="relative overflow-hidden rounded-[20px] border border-[#b9f6ce]/15 bg-[#19191c] p-4 shadow-[inset_0_1px_rgba(255,255,255,.04)] sm:p-5">
          <div className="absolute -right-5 -top-8 h-24 w-24 rounded-full bg-emerald-400/10 blur-2xl" />
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Total Earnings</p>
          <p className="mt-2 text-xl sm:text-2xl font-semibold text-white">{formatINR(totalEarnings)}</p>
          <p className="mt-1 text-xs text-emerald-400 font-medium">From {totalCount} paid orders</p>
        </div>

        <div className="relative overflow-hidden rounded-[20px] border border-emerald-400/15 bg-[#19191c] p-4 shadow-[inset_0_1px_rgba(255,255,255,.04)] sm:p-5">
          <div className="absolute -right-5 -top-8 h-24 w-24 rounded-full bg-emerald-400/10 blur-2xl" />
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-200/45">Partial COD</p>
          <p className="mt-2 text-xl font-semibold text-white sm:text-2xl">{partialCodOrders.length}</p>
          <p className="mt-1 text-xs font-medium text-amber-300/90">{formatINR(outstandingCod)} COD outstanding</p>
        </div>

        {/* Paid Orders */}
        <div className="relative overflow-hidden rounded-[20px] border border-[#c5a9ff]/15 bg-[#19191c] p-4 shadow-[inset_0_1px_rgba(255,255,255,.04)] sm:p-5">
          <div className="absolute -right-5 -top-8 h-24 w-24 rounded-full bg-[#c5a9ff]/10 blur-2xl" />
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Paid Orders</p>
          <p className="mt-2 text-xl sm:text-2xl font-semibold text-white">{totalCount}</p>
          <p className="mt-1 text-xs text-white/35">Successfully processed</p>
        </div>

        {/* Average Order Value */}
        <div className="relative overflow-hidden rounded-[20px] border border-[#70d6ff]/15 bg-[#19191c] p-4 shadow-[inset_0_1px_rgba(255,255,255,.04)] sm:p-5">
          <div className="absolute -right-5 -top-8 h-24 w-24 rounded-full bg-sky-400/10 blur-2xl" />
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Avg. Order Value</p>
          <p className="mt-2 text-xl sm:text-2xl font-semibold text-white">{formatINR(aov)}</p>
          <p className="mt-1 text-xs text-white/35">Average basket size</p>
        </div>

        {/* Pending Checkout */}
        <div className="relative overflow-hidden rounded-[20px] border border-[#f2d56b]/15 bg-[#19191c] p-4 shadow-[inset_0_1px_rgba(255,255,255,.04)] sm:p-5">
          <div className="absolute -right-5 -top-8 h-24 w-24 rounded-full bg-amber-400/10 blur-2xl" />
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Pending Checkout</p>
          <p className="mt-2 text-xl sm:text-2xl font-semibold text-white">{pendingCount}</p>
          <p className="mt-1 text-xs text-amber-400/90 font-medium">Abandoned/Initiated intents</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-[22px] border border-white/10 bg-[#19191c] shadow-[inset_0_1px_rgba(255,255,255,.04),0_24px_55px_rgba(0,0,0,.16)]">
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
      <div className="space-y-3 p-3 md:hidden">
        {orderRows.length === 0 ? (
          <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-white/[0.07] bg-[#171719] px-6 text-center">
            <div className="rounded-full border border-white/[0.07] bg-white/[0.035] p-5">
              <Package className="h-7 w-7 text-white/25" />
            </div>
            <p className="mt-4 text-base font-semibold text-white/55">No confirmed orders</p>
            <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.18em] text-white/25">System is ready for new orders</p>
          </div>
        ) : orderRows.map((order) => {
          const isSelected = selectedOrderIds.includes(order.id);

          return (
            <article
              key={order.id}
              className={`relative cursor-pointer overflow-hidden rounded-2xl border p-4 shadow-[inset_0_1px_rgba(255,255,255,.04),0_12px_28px_rgba(0,0,0,.14)] transition active:scale-[0.99] ${
                isSelected
                  ? "border-emerald-300/35 bg-emerald-400/[0.09]"
                  : "border-white/[0.08] bg-[linear-gradient(145deg,rgba(197,169,255,.055),rgba(24,24,27,.98)_42%)]"
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
              <div className="flex min-w-0 items-start justify-between gap-3">
                <div className="min-w-0">
                  <span className="inline-flex max-w-full break-all rounded-lg border border-white/10 bg-black/20 px-2.5 py-1.5 font-mono text-[10px] font-bold tracking-[0.1em] text-white/65">{order.orderNumber}</span>
                  <p className="mt-2 text-[10px] font-medium text-white/35">{format(new Date(order.createdAt), "MMM d, yyyy · h:mm a")}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {isSelectionMode ? (
                    <span className={`flex h-6 w-6 items-center justify-center rounded-md border ${isSelected ? "border-emerald-300 bg-emerald-300 text-black" : "border-white/20 bg-white/[0.03] text-transparent"}`}>
                      {isSelected ? <CheckCircle2 className="h-4 w-4" /> : null}
                    </span>
                  ) : null}
                  {getOrderStatusBadge(order)}
                </div>
              </div>

              <div className="mt-4 border-t border-white/[0.07] pt-4">
                <p className="break-words text-lg font-semibold leading-6 text-white">{order.fullName || "Guest"}</p>
                <p className="mt-0.5 break-all text-[11px] font-medium text-white/40">{displayPhoneNumber(order.phone) || order.email || "No contact"}</p>
              </div>

              <div className="mt-4 flex min-w-0 items-end justify-between gap-3 border-t border-white/[0.07] pt-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-white/25">Tracking</p>
                  {order.trackingNumber ? <p className="mt-1.5 break-all text-[10px] font-bold leading-4 text-sky-200"><Truck className="mr-1 inline h-3 w-3" />{order.trackingNumber}</p> : <p className="mt-1.5 text-[11px] text-white/35">Not added</p>}
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-white/25">Total</p>
                  <p className="mt-1 text-xl font-semibold tracking-tight text-white">{formatINR(Number(order.grandTotal))}</p>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="hidden overflow-x-auto bg-[#121214] px-3 pb-3 md:block">
        <Table className="border-separate border-spacing-y-3">
          <TableHeader className="bg-transparent">
            <TableRow className="border-0 bg-[#202023] shadow-[inset_0_1px_rgba(255,255,255,.035)] hover:bg-[#202023] [&>th:first-child]:rounded-l-xl [&>th:last-child]:rounded-r-xl">
              {isSelectionMode ? (
                <TableHead className="w-12 px-6 py-5">
                  <span className="sr-only">Selected</span>
                </TableHead>
              ) : null}
              <TableHead className="w-[120px] px-6 py-5 text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">Order ID</TableHead>
              <TableHead className="py-5 text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">Date</TableHead>
              <TableHead className="py-5 text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">Customer</TableHead>
              <TableHead className="py-5 text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">Tracking</TableHead>
              <TableHead className="px-6 py-5 text-right text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">Total</TableHead>
              <TableHead className="py-5 text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">Payment</TableHead>
              <TableHead className="px-6 py-5 text-center text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orderRows.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={isSelectionMode ? 8 : 7} className="h-[400px] text-center">
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
              orderRows.map((order) => {
                const isSelected = selectedOrderIds.includes(order.id);
                const partialCod = getPartialCodBreakdown(order);
                
                return (
                  <TableRow 
                    key={order.id} 
                    className={`group cursor-pointer overflow-hidden rounded-2xl border-y border-white/[0.075] bg-[linear-gradient(145deg,rgba(197,169,255,.055),rgba(24,24,27,.98)_38%)] shadow-[inset_0_1px_rgba(255,255,255,.045),0_10px_24px_rgba(0,0,0,.15)] outline outline-1 outline-white/[0.035] transition-[transform,filter,box-shadow] duration-200 hover:-translate-y-px hover:brightness-110 hover:shadow-[inset_0_1px_rgba(255,255,255,.065),0_15px_32px_rgba(0,0,0,.22)] [&>td:first-child]:rounded-l-2xl [&>td:last-child]:rounded-r-2xl ${
                      isSelected ? "border-l-2 border-l-emerald-300 bg-emerald-400/[0.10] hover:bg-emerald-400/[0.13]" : getOrderRowTone(order.status)
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
                    <TableCell className="px-6 py-6"><span className="inline-flex rounded-lg border border-white/10 bg-black/20 px-2.5 py-1.5 font-mono text-[10px] font-bold tracking-wider text-white/65">{order.orderNumber}</span></TableCell>
                    <TableCell className="text-[12px] font-medium text-white/55">
                      {format(new Date(order.createdAt), "MMM d, h:mm a")}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-base font-semibold text-white transition-colors group-hover:text-[#d9c8ff]">{order.fullName || "Guest"}</span>
                        <span className="text-[11px] font-medium tracking-tight text-white/45">{displayPhoneNumber(order.phone) || order.email || "No contact"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {order.trackingNumber ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-blue-400/20 bg-blue-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-blue-200">
                          <Truck className="h-3 w-3" />
                          {order.trackingNumber}
                        </span>
                      ) : (
                        <span className="text-[11px] text-white/40">Not added</span>
                      )}
                    </TableCell>
                    <TableCell className="px-6 text-right text-lg font-semibold tracking-tight text-white">
                      {formatINR(Number(order.grandTotal))}
                    </TableCell>
                    <TableCell>
                      {partialCod ? (
                        <div className="min-w-[125px] text-[10px] leading-5">
                          <p className={partialCod.advanceReceived ? "font-semibold text-emerald-300" : "font-semibold text-amber-300"}>{partialCod.advanceReceived ? `${formatINR(partialCod.prepaid)} received` : `${formatINR(partialCod.prepaid)} pending`}</p>
                          <p className="text-white/35">{formatINR(partialCod.codBalance)} on delivery</p>
                        </div>
                      ) : (
                        <span className="text-[11px] font-medium text-white/50">{order.paymentMethod || "Not selected"}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center px-6">
                      {getOrderStatusBadge(order)}
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
          activityRequestRef.current += 1;
          setSelectedOrder(null);
          setIsEditing(false);
          setCustomerActivity([]);
          setOrderAudits([]);
          setActivityError("");
          setIsActivityLoading(false);
        }
      }}>
        <SheetContent className="w-full overflow-y-auto border-l border-white/[0.08] bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,.10),transparent_28%),linear-gradient(180deg,#17171a_0%,#111113_100%)] p-0 text-white shadow-[-36px_0_100px_rgba(0,0,0,.58)] sm:max-w-2xl lg:max-w-3xl [&>button]:right-5 [&>button]:top-5 [&>button]:z-30 [&>button]:rounded-full [&>button]:border [&>button]:border-white/25 [&>button]:bg-[#29292e] [&>button]:p-3 [&>button]:text-white [&>button]:opacity-100 [&>button]:shadow-[0_8px_24px_rgba(0,0,0,.45)] [&>button]:backdrop-blur-xl [&>button]:transition [&>button]:hover:border-[#c5a9ff]/45 [&>button]:hover:bg-[#3a3545] [&>button]:hover:text-white [&>button>svg]:h-5 [&>button>svg]:w-5 [&>button>svg]:stroke-[2.5]">
          {selectedOrder && (
            <>
              <SheetHeader className="border-b border-white/[0.07] bg-[#151518]/90 px-4 py-4 pr-16 text-left sm:px-6 sm:py-5 sm:pr-20">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="mb-2 flex items-center gap-2 text-[8px] font-bold uppercase tracking-[0.22em] text-[#c9b3ff]/65">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#b99cff] shadow-[0_0_12px_rgba(185,156,255,.8)]" />
                      Order workspace
                    </div>
                    <div className="flex flex-wrap items-center gap-2.5">
                      <SheetTitle className="font-sans text-xl font-semibold tracking-[-0.025em] text-white sm:text-2xl">#{selectedOrder.orderNumber}</SheetTitle>
                      {getOrderStatusBadge(selectedOrder)}
                    </div>
                    <SheetDescription className="mt-1.5 text-[11px] font-medium text-white/35">
                      Placed {format(new Date(selectedOrder.createdAt), "MMMM d, yyyy 'at' h:mm a")}
                    </SheetDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg border border-white/[0.07] bg-white/[0.035] px-3 py-1.5 text-right">
                      <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-white/30">Order value</p>
                      <p className="text-sm font-semibold text-white">{formatINR(Number(selectedOrder.grandTotal || 0))}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(!isEditing)}
                      className={`h-10 rounded-lg px-3.5 text-[9px] font-bold uppercase tracking-[0.15em] transition ${isEditing ? "border-white/10 bg-white/[0.04] text-white/60 hover:bg-white/[0.08] hover:text-white" : "border-[#c9b3ff]/25 bg-[#c9b3ff]/10 text-[#ddceff] hover:bg-[#c9b3ff]/15 hover:text-white"}`}
                    >
                      {isEditing ? "Cancel edit" : "Edit order"}
                    </Button>
                  </div>
                </div>
              </SheetHeader>

              <div className="space-y-5 px-4 py-5 sm:px-7 sm:py-7">
                {(() => {
                  const partialCod = getPartialCodBreakdown(selectedOrder);
                  if (!partialCod) return null;
                  return (
                    <div className="rounded-3xl border border-emerald-400/20 bg-[linear-gradient(135deg,rgba(16,185,129,.10),rgba(245,158,11,.05))] p-5">
                      <div className="flex items-center justify-between gap-3">
                        <div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-200/55">{partialCod.prepaidPercent}% Prepaid + {partialCod.codPercent}% COD</p><p className="mt-1 text-xs text-white/40">{partialCod.advanceReceived ? "Advance payment confirmed" : "Advance payment is still pending"}</p></div>
                        <WalletCards className="h-5 w-5 text-emerald-300" />
                      </div>
                      <div className="mt-4 grid grid-cols-3 gap-2">
                        <div className="rounded-xl bg-black/20 p-3"><p className="text-[9px] uppercase tracking-wider text-white/30">Order total</p><p className="mt-1 text-sm font-semibold text-white">{formatINR(partialCod.total)}</p></div>
                        <div className="rounded-xl bg-black/20 p-3"><p className="text-[9px] uppercase tracking-wider text-white/30">{partialCod.prepaidPercent}% prepaid</p><p className={`mt-1 text-sm font-semibold ${partialCod.advanceReceived ? "text-emerald-300" : "text-amber-300"}`}>{formatINR(partialCod.prepaid)}</p></div>
                        <div className="rounded-xl bg-black/20 p-3"><p className="text-[9px] uppercase tracking-wider text-white/30">COD balance</p><p className="mt-1 text-sm font-semibold text-amber-200">{partialCod.codCollected ? "Collected" : formatINR(partialCod.codBalance)}</p></div>
                      </div>
                    </div>
                  );
                })()}

                <div className="space-y-3 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 sm:p-5">
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
                        <div className="space-y-3 border-t border-white/10 pt-5">
                          <div><h5 className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary/60">Order items</h5><p className="mt-1 text-xs text-white/30">Prices and discounts are recalculated from the current catalogue when saved.</p></div>
                          {(editForm.cartSnapshot || []).map((item, index) => (
                            <div key={`${item.id}-${index}`} className="grid grid-cols-[1fr_72px_38px] items-center gap-2 rounded-xl border border-white/8 bg-black/20 p-2.5">
                              <div className="min-w-0"><p className="truncate text-xs font-medium text-white">{item.name}</p><p className="mt-0.5 text-[10px] text-white/30">{item.isGift ? "Complimentary gift" : `${formatINR(item.price)} each`}</p></div>
                              <input type="number" min="1" max="100" value={item.quantity} onChange={(event) => updateEditItem(index, { quantity: Math.max(1, Number(event.target.value) || 1) })} disabled={item.isGift} aria-label={`Quantity for ${item.name}`} className="h-9 rounded-lg border border-white/10 bg-white/5 px-2 text-center text-xs text-white outline-none" />
                              <Button type="button" size="icon" variant="ghost" onClick={() => removeEditItem(index)} disabled={(editForm.cartSnapshot || []).length <= 1} aria-label={`Remove ${item.name}`} className="h-9 w-9 text-rose-300"><Trash2 className="h-4 w-4" /></Button>
                            </div>
                          ))}
                          <div className="grid gap-2 sm:grid-cols-[1fr_auto]"><select value={addProductId} onChange={(event) => setAddProductId(event.target.value)} className="h-10 min-w-0 rounded-xl border border-white/10 bg-black/30 px-3 text-xs text-white outline-none"><option value="">Add a product</option>{productOptions.filter((product) => !product.badges?.soldOut && !product.badges?.comingSoon).map((product) => <option key={product.id} value={product.id}>{getProductOptionLabel(product)}</option>)}</select><Button type="button" onClick={addEditProduct} disabled={!addProductId} className="h-10 bg-white text-black hover:bg-white/90"><Plus className="mr-1 h-4 w-4" /> Add</Button></div>
                        </div>
                        <div className="grid gap-4 border-t border-white/10 pt-5 sm:grid-cols-2">
                          <label className="space-y-2"><span className="text-[9px] font-bold uppercase tracking-widest text-white/30">Coupon code</span><input value={editForm.appliedCouponCode || ""} onChange={(e) => setEditForm({ ...editForm, appliedCouponCode: e.target.value.toUpperCase() })} placeholder="No coupon" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" /></label>
                          <label className="space-y-2"><span className="text-[9px] font-bold uppercase tracking-widest text-white/30">Shipping fee</span><input type="number" min="0" step="0.01" value={editForm.shippingFee || "0"} onChange={(e) => setEditForm({ ...editForm, shippingFee: e.target.value })} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" /></label>
                          <label className="space-y-2"><span className="text-[9px] font-bold uppercase tracking-widest text-white/30">Shipping method</span><input value={editForm.shippingMethod || ""} onChange={(e) => setEditForm({ ...editForm, shippingMethod: e.target.value })} placeholder="Standard delivery" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" /></label>
                          <label className="space-y-2"><span className="text-[9px] font-bold uppercase tracking-widest text-white/30">Payment method</span><input value={editForm.paymentMethod || ""} onChange={(e) => setEditForm({ ...editForm, paymentMethod: e.target.value })} placeholder="Payment method" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" /></label>
                          <label className="space-y-2"><span className="text-[9px] font-bold uppercase tracking-widest text-white/30">Status</span><select value={editForm.status || "whatsapp_initiated"} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })} className="w-full rounded-xl border border-white/10 bg-[#1c1c20] px-4 py-3 text-sm text-white outline-none"><option value="whatsapp_initiated">WhatsApp initiated</option><option value="payment_pending">Payment pending</option><option value="payment_authorized">Payment authorized</option><option value="processing">Confirmed</option><option value="packed">Packed</option><option value="shipped">Shipped</option><option value="delivered">Delivered</option><option value="cancelled">Cancelled</option></select></label>
                          <label className="space-y-2"><span className="text-[9px] font-bold uppercase tracking-widest text-white/30">Manual adjustment</span><input type="number" step="0.01" value={editForm.manualAdjustment || "0"} onChange={(e) => setEditForm({ ...editForm, manualAdjustment: e.target.value })} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" /></label>
                        </div>
                        {Number(editForm.manualAdjustment || 0) !== 0 ? <label className="block space-y-2"><span className="text-[9px] font-bold uppercase tracking-widest text-white/30">Adjustment reason</span><input required value={editForm.adjustmentReason || ""} onChange={(e) => setEditForm({ ...editForm, adjustmentReason: e.target.value })} placeholder="Why is this adjustment needed?" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" /></label> : null}
                        {capturedAmounts[selectedOrder.id] > 0 ? <div className="rounded-xl border border-amber-400/20 bg-amber-400/[0.05] p-4 text-xs text-amber-100/70"><p className="font-semibold text-amber-200">Paid order reconciliation</p><div className="mt-2 flex justify-between"><span>Captured payment</span><span>{formatINR(capturedAmounts[selectedOrder.id])}</span></div><div className="mt-1 flex justify-between"><span>Current order total</span><span>{formatINR(Number(selectedOrder.grandTotal || 0))}</span></div><p className="mt-2 text-[10px] text-amber-100/45">Saving does not refund or collect money automatically.</p></div> : null}
                        <label className="block space-y-2"><span className="text-[9px] font-bold uppercase tracking-widest text-white/30">Reason for change</span><textarea value={editForm.editReason || ""} onChange={(e) => setEditForm({ ...editForm, editReason: e.target.value })} placeholder="Required for financial changes to paid orders" className="min-h-20 w-full resize-y rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" /></label>
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

                    {isActivityLoading || activityError || customerActivity.length > 0 ? (
                    <div className="overflow-hidden rounded-2xl border border-[#c5a9ff]/15 bg-[linear-gradient(145deg,rgba(197,169,255,.075),rgba(255,255,255,.018))] sm:rounded-3xl">
                      <div className="flex items-start justify-between gap-4 border-b border-white/[0.06] p-4 sm:p-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#c5a9ff]/20 bg-[#c5a9ff]/10 text-[#d7c5ff]">
                            <History className="h-4 w-4" />
                          </div>
                          <div>
                            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#d7c5ff]/75">Recent customer activity</h4>
                            <p className="mt-1 text-xs text-white/35">Previous checkout attempts and orders from this customer.</p>
                          </div>
                        </div>
                        {!isActivityLoading && !activityError ? (
                          <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-semibold text-white/50">
                            {customerActivity.length}
                          </span>
                        ) : null}
                      </div>

                      <div className="p-3 sm:p-4">
                        {isActivityLoading ? (
                          <div className="space-y-2">
                            {[0, 1, 2].map((item) => (
                              <div key={item} className="h-20 animate-pulse rounded-2xl border border-white/[0.05] bg-white/[0.035]" />
                            ))}
                          </div>
                        ) : activityError ? (
                          <div className="rounded-2xl border border-rose-400/15 bg-rose-400/[0.05] p-4 text-center">
                            <p className="text-xs text-rose-100/65">{activityError}</p>
                            <button type="button" onClick={() => void loadCustomerActivity(selectedOrder.id)} className="mt-3 rounded-lg border border-rose-300/20 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-rose-200 transition hover:bg-rose-300/10">Try again</button>
                          </div>
                        ) : customerActivity.length ? (
                          <div className="space-y-2">
                            {customerActivity.map((activity) => {
                              const isOrder = activity.type === "order";
                              const ActivityIcon = isOrder ? Package : ShoppingCart;
                              const itemSummary = activity.itemNames.length
                                ? `${activity.itemNames.join(", ")}${activity.itemCount > activity.itemNames.length ? ` +${activity.itemCount - activity.itemNames.length} more` : ""}`
                                : "No products captured";

                              return (
                                <div key={`${activity.type}-${activity.id}`} className="group rounded-2xl border border-white/[0.065] bg-black/15 p-3.5 transition hover:border-[#c5a9ff]/20 hover:bg-white/[0.035]">
                                  <div className="flex items-start gap-3">
                                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${isOrder ? "border-emerald-400/15 bg-emerald-400/[0.07] text-emerald-200" : "border-sky-400/15 bg-sky-400/[0.07] text-sky-200"}`}>
                                      <ActivityIcon className="h-4 w-4" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                          <p className="truncate text-sm font-semibold text-white">{activity.reference}</p>
                                          <div className="mt-1 flex items-center gap-1.5 text-[10px] text-white/35">
                                            <Clock3 className="h-3 w-3" />
                                            {format(new Date(activity.occurredAt), "dd MMM yyyy, h:mm a")}
                                          </div>
                                        </div>
                                        <div className="shrink-0 text-right">
                                          {activity.amount > 0 ? <p className="text-xs font-semibold text-white">{formatINR(activity.amount)}</p> : null}
                                          <span className={`mt-1 inline-flex rounded-full border px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.1em] ${isOrder ? "border-emerald-400/15 bg-emerald-400/[0.07] text-emerald-200/75" : "border-sky-400/15 bg-sky-400/[0.07] text-sky-200/75"}`}>
                                            {activity.status.replaceAll("_", " ")}
                                          </span>
                                        </div>
                                      </div>
                                      <p className="mt-2 line-clamp-2 text-[11px] leading-5 text-white/38">{itemSummary}</p>
                                      <div className="mt-2 flex items-center justify-between gap-3 text-[9px] uppercase tracking-[0.12em] text-white/25">
                                        <span>{isOrder ? "Previous order" : "Checkout activity"}</span>
                                        <span>{activity.itemCount} item{activity.itemCount === 1 ? "" : "s"}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : null}
                      </div>
                    </div>
                    ) : null}

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
                    {selectedOrder.checkoutChannel === "razorpay" ? (
                      <div className="space-y-4 rounded-2xl border border-sky-400/15 bg-sky-400/[0.035] p-4 sm:rounded-3xl sm:p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div><h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-200/65">Razorpay reconciliation</h4><p className="mt-1 text-xs text-white/35">Provider payment status is checked independently of the customer browser.</p></div>
                          <span className={`rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider ${selectedOrder.paymentSyncStatus === "captured" ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-200" : selectedOrder.paymentSyncStatus?.includes("mismatch") || selectedOrder.paymentSyncStatus === "multiple_captures" ? "border-rose-400/25 bg-rose-400/10 text-rose-200" : "border-amber-400/20 bg-amber-400/10 text-amber-200"}`}>{selectedOrder.paymentSyncStatus?.replaceAll("_", " ") || "Not checked"}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                          <div className="rounded-xl bg-black/20 p-3"><p className="text-[8px] uppercase tracking-wider text-white/25">Captured</p><p className="mt-1 font-semibold text-white">{selectedOrder.capturedPaymentAmount ? formatINR(Number(selectedOrder.capturedPaymentAmount)) : "—"}</p></div>
                          <div className="rounded-xl bg-black/20 p-3"><p className="text-[8px] uppercase tracking-wider text-white/25">Attempts</p><p className="mt-1 font-semibold text-white">{selectedOrder.paymentAttemptCount ?? "—"}</p></div>
                          <div className="rounded-xl bg-black/20 p-3"><p className="text-[8px] uppercase tracking-wider text-white/25">Order ID</p><p className="mt-1 truncate font-mono text-[10px] text-white/65">{selectedOrder.razorpayOrderId || "—"}</p></div>
                          <div className="rounded-xl bg-black/20 p-3"><p className="text-[8px] uppercase tracking-wider text-white/25">Payment ID</p><p className="mt-1 truncate font-mono text-[10px] text-white/65">{selectedOrder.razorpayPaymentId || "—"}</p></div>
                        </div>
                        <Button type="button" variant="outline" disabled={isUpdating} onClick={() => void handleReconcilePayment(selectedOrder.id)} className="h-11 w-full rounded-xl border-sky-300/25 bg-sky-300/[0.07] text-[10px] font-bold uppercase tracking-[0.13em] text-sky-100 hover:bg-sky-300/[0.13]">
                          <RefreshCw className={`mr-2 h-4 w-4 ${isUpdating ? "animate-spin" : ""}`} /> Check Razorpay payment
                        </Button>
                        {selectedOrder.paymentReconciledAt ? <p className="text-center text-[9px] text-white/25">Last checked {format(new Date(selectedOrder.paymentReconciledAt), "dd MMM, h:mm a")}</p> : null}
                      </div>
                    ) : null}
                  </>
                )}

                {(() => {
                  const priceBreakdown = getOrderPriceBreakdown(selectedOrder);
                  const discountLabel = selectedOrder.appliedCouponCode
                    ? `Discount / offer (${selectedOrder.appliedCouponCode})`
                    : "Discount / offer adjustment";

                  return (
                    <div className="space-y-5 rounded-2xl border border-white/[0.07] bg-[linear-gradient(145deg,rgba(197,169,255,.055),rgba(255,255,255,.018))] p-4 shadow-[inset_0_1px_rgba(255,255,255,.03)] sm:p-6">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#c5a9ff]/20 bg-[#c5a9ff]/10 text-[#d8c8ff]"><ShoppingCart className="h-4 w-4" /></span>
                          <div>
                          <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#d7c5ff]/75">Order items</h4>
                          </div>
                        </div>
                        {selectedOrder.appliedCouponCode ? (
                          <span className="rounded-full border border-[#c5a9ff]/20 bg-[#c5a9ff]/10 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-[#ddceff]">
                            {selectedOrder.appliedCouponCode}
                          </span>
                        ) : null}
                      </div>

                      <div className="space-y-3">
                        {priceBreakdown.items.length > 0 ? (
                          priceBreakdown.items.map((item, i) => (
                            <div key={`${item.id}-${i}`} className="relative rounded-2xl border border-white/[0.065] bg-black/20 p-4">
                              <div>
                              <div className="min-w-0 w-full">
                                {!item.sampleSelections?.length && !item.kitSelections?.length && !item.isGift ? (
                                  <div className="grid grid-cols-[72px_minmax(0,1fr)] items-center gap-3 sm:grid-cols-[82px_minmax(0,1fr)] sm:gap-4">
                                    <button type="button" disabled={!item.image && !productOptions.find((product) => product.id === item.id)?.images?.[0]} onClick={() => { const url = item.image || productOptions.find((product) => product.id === item.id)?.images?.[0]; if (url) setPreviewImage({ url, name: item.name }); }} className="group/image relative h-[72px] w-[72px] overflow-hidden rounded-xl border border-[#c5a9ff]/15 bg-[#c5a9ff]/[0.055] shadow-[inset_0_1px_rgba(255,255,255,.04)] transition hover:border-[#c5a9ff]/45 hover:shadow-[0_0_20px_rgba(197,169,255,.12)] disabled:cursor-default sm:h-[82px] sm:w-[82px]" aria-label={`View larger image of ${item.name}`}>
                                      {item.image || productOptions.find((product) => product.id === item.id)?.images?.[0] ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={withCloudinaryTransforms(item.image || productOptions.find((product) => product.id === item.id)!.images[0])} alt={item.name} loading="lazy" className="h-full w-full object-cover transition duration-300 group-hover/image:scale-105" /> : <div className="flex h-full w-full items-center justify-center text-[9px] font-bold uppercase tracking-wider text-[#d8c8ff]/35">No image</div>}
                                      {(item.image || productOptions.find((product) => product.id === item.id)?.images?.[0]) ? <span className="absolute inset-x-1.5 bottom-1.5 rounded-md bg-black/65 px-1 py-0.5 text-[7px] font-bold uppercase tracking-wider text-white/70 opacity-0 backdrop-blur-sm transition group-hover/image:opacity-100">View</span> : null}
                                    </button>
                                    <div className="min-w-0">
                                      <div className="flex items-start justify-between gap-3"><p className="min-w-0 text-sm font-semibold leading-5 text-white sm:text-base">{item.name}</p><p className="shrink-0 text-sm font-semibold text-[#e3d8ff]">{formatINR(getOrderItemLineTotal(item))}</p></div>
                                      {item.inspiration ? <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-[#c5a9ff]/50">Inspired by {item.inspiration}</p> : null}
                                      <div className="mt-2 flex flex-wrap gap-1.5"><span className="rounded-md border border-white/[0.07] bg-white/[0.035] px-2 py-1 text-[9px] font-semibold text-white/35">Qty {getOrderItemQuantity(item)}</span>{item.size ? <span className="rounded-md border border-white/[0.07] bg-white/[0.035] px-2 py-1 text-[9px] font-semibold text-white/35">{item.size}</span> : null}</div>
                                    </div>
                                  </div>
                                ) : <>
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="pr-20 text-sm font-semibold leading-5 text-white">{item.isGift ? `Gift ${i + 1}` : item.name}</p>
                                  {item.isGift ? (
                                    <span className="rounded bg-emerald-400/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-emerald-200">
                                      Free
                                    </span>
                                  ) : null}
                                </div>
                                <p className="mt-1 text-[11px] text-white/30">
                                  Qty {getOrderItemQuantity(item)}
                                  {item.size ? ` · ${item.size}` : ""}
                                  {!item.isGift ? ` · ${formatINR(toOrderMoney(item.price))} each` : ""}
                                </p>
                                </>}
                                {item.sampleSelections?.length ? (
                                  <div className="mt-4 overflow-hidden rounded-2xl border border-[#c5a9ff]/15 bg-[linear-gradient(145deg,rgba(197,169,255,.065),rgba(0,0,0,.12))] shadow-[inset_0_1px_rgba(255,255,255,.035)]">
                                    {item.sampleSelections.map((selection, selectionIndex) => (
                                      <label key={`${selection.id}-${selectionIndex}`} className="group flex min-h-11 cursor-pointer items-center gap-3 border-b border-white/[0.055] px-3.5 py-2.5 transition hover:bg-[#c5a9ff]/[0.065] last:border-b-0">
                                        <input type="checkbox" className="peer sr-only" aria-label={`Mark ${selection.name} as packed`} />
                                        <span className="relative flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-white/20 bg-black/25 text-[12px] font-bold text-white opacity-80 transition after:content-['✓'] after:scale-75 after:opacity-0 after:transition peer-checked:border-[#b99cff] peer-checked:bg-[#a786ee] peer-checked:shadow-[0_0_14px_rgba(185,156,255,.35)] peer-checked:after:scale-100 peer-checked:after:opacity-100 group-hover:border-[#c5a9ff]/45" />
                                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-[#c5a9ff]/10 bg-[#c5a9ff]/[0.07] text-[9px] font-bold text-[#d8c8ff]/55 transition peer-checked:border-emerald-300/15 peer-checked:bg-emerald-300/[0.08] peer-checked:text-emerald-200/70">{selectionIndex + 1}</span>
                                        <span className="min-w-0 flex-1 whitespace-normal break-words text-xs font-semibold leading-5 text-[#ded2fb]/80 transition peer-checked:text-white/35 peer-checked:line-through">{selection.name}</span>
                                      </label>
                                    ))}
                                  </div>
                                ) : null}
                              </div>
                              {item.sampleSelections?.length || item.kitSelections?.length || item.isGift ? <p className={`absolute right-4 top-4 ${item.isGift ? "text-sm font-semibold text-emerald-300" : "text-sm font-semibold text-[#e3d8ff]"}`}>{item.isGift ? "Free" : formatINR(getOrderItemLineTotal(item))}</p> : null}
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">No cart snapshot saved.</p>
                        )}
                      </div>

                      <div className="space-y-2 rounded-2xl border border-white/[0.065] bg-black/20 p-4 sm:p-5">
                        {priceBreakdown.itemTotal > 0 && priceBreakdown.itemTotal !== priceBreakdown.subtotal ? (
                          <div className="flex justify-between text-xs text-white/40">
                            <span>Item line total</span>
                            <span>{formatINR(priceBreakdown.itemTotal)}</span>
                          </div>
                        ) : null}
                        <div className="flex justify-between text-xs text-white/40">
                          <span>Subtotal</span>
                          <span>{formatINR(priceBreakdown.subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-xs text-white/40">
                          <span>Shipping Fee</span>
                          <span>{priceBreakdown.shippingFee === 0 ? "Free" : formatINR(priceBreakdown.shippingFee)}</span>
                        </div>
                        <div className="flex justify-between gap-4 text-xs">
                          <span className="text-white/40">{discountLabel}</span>
                          <span className={priceBreakdown.discount > 0 ? "font-semibold text-emerald-300" : "text-white/40"}>
                            {priceBreakdown.discount > 0 ? `-${formatINR(priceBreakdown.discount)}` : formatINR(0)}
                          </span>
                        </div>
                        <div className="mt-3 flex items-end justify-between border-t border-white/[0.08] pt-4">
                          <div><p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/30">Grand total</p><p className="mt-1 text-[10px] text-white/20">Final saved order value</p></div>
                          <span className="text-xl font-semibold tracking-tight text-[#e3d8ff]">{formatINR(priceBreakdown.grandTotal)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {orderAudits.length ? <div className="rounded-2xl border border-[#c5a9ff]/15 bg-[linear-gradient(145deg,rgba(197,169,255,.065),rgba(255,255,255,.018))] p-5 sm:p-6"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#c5a9ff]/20 bg-[#c5a9ff]/10"><History className="h-4 w-4 text-[#d7c5ff]"/></div><div><h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#d7c5ff]/75">Admin edit history</h4><p className="mt-1 text-xs text-white/30">A permanent record of changes to this order.</p></div></div><div className="mt-4 space-y-2">{orderAudits.map((audit)=><div key={audit.id} className="rounded-xl border border-white/[0.06] bg-black/15 p-3.5"><div className="flex justify-between gap-3 text-[9px] font-bold uppercase tracking-[0.14em] text-white/28"><span>{audit.changeType.replaceAll("_"," ")}</span><span>{format(new Date(audit.createdAt), "dd MMM, h:mm a")}</span></div><p className="mt-1.5 text-xs leading-5 text-white/55">{audit.reason || "Operational update"}</p></div>)}</div></div> : null}

                <div className="space-y-4 rounded-2xl border border-white/[0.07] bg-[linear-gradient(145deg,rgba(197,169,255,.045),rgba(255,255,255,.018))] p-5 shadow-[inset_0_1px_rgba(255,255,255,.03)] sm:p-6">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#d7c5ff]/75">Order management</h4>
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    {/* Confirm Order / Processing */}
                    <Button 
                      onClick={() => handleUpdateStatus(selectedOrder.id, "processing")} 
                      disabled={isUpdating || selectedOrder.status === "processing"}
                      className={`h-11 w-full min-w-0 overflow-hidden whitespace-nowrap rounded-xl border px-2 text-[9px] font-bold uppercase tracking-[0.12em] transition sm:text-[10px] ${
                        selectedOrder.status === "processing"
                          ? "cursor-default border-[#c5a9ff]/20 bg-[#c5a9ff]/10 text-[#d7c5ff]/65"
                          : "border-[#c5a9ff]/25 bg-[#c5a9ff]/[0.07] text-[#ddceff] hover:border-[#c5a9ff]/45 hover:bg-[#c5a9ff]/[0.13]"
                      }`}
                    >
                      {selectedOrder.status === "processing" ? <span className="mr-2 h-1.5 w-1.5 rounded-full bg-[#d7c5ff] shadow-[0_0_8px_rgba(215,197,255,.8)]" /> : null}
                      {selectedOrder.status === "processing" ? "Confirmed" : "CONFIRM ORDER"}
                    </Button>

                    {/* Mark Shipped */}
                    <Button 
                      onClick={() => handleUpdateStatus(selectedOrder.id, "shipped")} 
                      disabled={isUpdating || selectedOrder.status === "shipped"}
                      className={`h-11 w-full min-w-0 overflow-hidden whitespace-nowrap rounded-xl border px-2 text-[9px] font-bold uppercase tracking-[0.12em] transition sm:text-[10px] ${
                        selectedOrder.status === "shipped"
                          ? "cursor-default border-sky-400/20 bg-sky-400/10 text-sky-200/65"
                          : "border-sky-400/20 bg-sky-400/[0.06] text-sky-200 hover:border-sky-400/40 hover:bg-sky-400/[0.12]"
                      }`}
                    >
                      {selectedOrder.status === "shipped" ? <span className="mr-2 h-1.5 w-1.5 rounded-full bg-sky-200 shadow-[0_0_8px_rgba(186,230,253,.8)]" /> : null}
                      {selectedOrder.status === "shipped" ? "Shipped" : "MARK SHIPPED"}
                    </Button>

                    {/* Fulfill Order / Delivered */}
                    <Button 
                      onClick={() => handleUpdateStatus(selectedOrder.id, "delivered")} 
                      disabled={isUpdating || selectedOrder.status === "delivered"}
                      className={`h-11 w-full min-w-0 overflow-hidden whitespace-nowrap rounded-xl border px-2 text-[9px] font-bold uppercase tracking-[0.12em] transition sm:text-[10px] ${
                        selectedOrder.status === "delivered"
                          ? "cursor-default border-emerald-400/20 bg-emerald-400/10 text-emerald-200/65"
                          : "border-emerald-400/20 bg-emerald-400/[0.06] text-emerald-200 hover:border-emerald-400/40 hover:bg-emerald-400/[0.12]"
                      }`}
                    >
                      {selectedOrder.status === "delivered" ? <span className="mr-2 h-1.5 w-1.5 rounded-full bg-emerald-200 shadow-[0_0_8px_rgba(167,243,208,.8)]" /> : null}
                      {selectedOrder.status === "delivered" ? "Delivered" : "FULFILL ORDER"}
                    </Button>

                    {/* Cancel Order */}
                    <Button 
                      onClick={() => handleUpdateStatus(selectedOrder.id, "cancelled")} 
                      disabled={isUpdating || selectedOrder.status === "cancelled"}
                      className={`h-11 w-full min-w-0 overflow-hidden whitespace-nowrap rounded-xl border px-2 text-[9px] font-bold uppercase tracking-[0.12em] transition sm:text-[10px] ${
                        selectedOrder.status === "cancelled"
                          ? "cursor-default border-rose-400/20 bg-rose-400/10 text-rose-200/65"
                          : "border-rose-400/15 bg-rose-400/[0.035] text-rose-200/80 hover:border-rose-400/35 hover:bg-rose-400/[0.09]"
                      }`}
                    >
                      {selectedOrder.status === "cancelled" ? <span className="mr-2 h-1.5 w-1.5 rounded-full bg-rose-200 shadow-[0_0_8px_rgba(254,205,211,.8)]" /> : null}
                      {selectedOrder.status === "cancelled" ? "Cancelled" : "CANCEL ORDER"}
                    </Button>

                    <Button
                      type="button"
                      onClick={() => handleUpdateStatus(selectedOrder.id, "packed")}
                      disabled={isUpdating || selectedOrder.status === "packed"}
                      className={`h-11 w-full min-w-0 overflow-hidden whitespace-nowrap rounded-xl border px-2 text-[9px] font-bold uppercase tracking-[0.12em] transition sm:text-[10px] ${selectedOrder.status === "packed" ? "cursor-default border-violet-400/20 bg-violet-400/10 text-violet-200/65" : "border-violet-400/20 bg-violet-400/[0.055] text-violet-200 hover:border-violet-400/40 hover:bg-violet-400/[0.12]"}`}
                    >
                      {selectedOrder.status === "packed" ? <span className="mr-2 h-1.5 w-1.5 rounded-full bg-violet-200 shadow-[0_0_8px_rgba(221,214,254,.8)]" /> : null}
                      {selectedOrder.status === "packed" ? "Packed" : "MARK PACKED"}
                    </Button>

                    <Button
                      type="button"
                      onClick={handleRemoveOrder}
                      disabled={isUpdating}
                      variant="outline"
                      className="h-11 w-full min-w-0 overflow-hidden whitespace-nowrap rounded-xl border-rose-400/20 bg-transparent px-2 text-[9px] font-bold uppercase tracking-[0.12em] text-rose-200/70 hover:border-rose-400/40 hover:bg-rose-400/[0.07] hover:text-rose-100 sm:text-[10px]"
                    >
                      REMOVE TEST ORDER
                    </Button>
                  </div>
                  {previousOrderStatus ? (
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isUpdating}
                      onClick={() => {
                        const currentLabel = selectedOrder.status.replaceAll("_", " ");
                        const previousLabel = previousOrderStatus.replaceAll("_", " ");
                        if (!window.confirm(`Revert this order from ${currentLabel} back to ${previousLabel}?`)) return;
                        void handleUpdateStatus(selectedOrder.id, previousOrderStatus, `Reverted accidental status change from ${selectedOrder.status} to ${previousOrderStatus}`);
                      }}
                      className="h-11 w-full rounded-xl border-amber-300/25 bg-amber-300/[0.06] text-[9px] font-bold uppercase tracking-[0.12em] text-amber-100 hover:border-amber-300/45 hover:bg-amber-300/[0.12] sm:text-[10px]"
                    >
                      <Undo2 className="mr-2 h-4 w-4" /> Revert to {previousOrderStatus.replaceAll("_", " ")}
                    </Button>
                  ) : null}
                </div>

                <div className="space-y-4 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 sm:p-6">
                  <div><h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">Customer updates</h4><p className="mt-1 text-xs text-white/30">Copy a ready-to-send update for this customer.</p></div>
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
                  <Button onClick={() => openWhatsApp(selectedOrder)} className="h-13 w-full rounded-2xl border border-emerald-300/20 bg-[linear-gradient(135deg,#25D366,#17a653)] font-semibold text-white shadow-[0_14px_32px_rgba(37,211,102,.16)] hover:brightness-105">
                    <MessageCircle className="mr-2 h-5 w-5" /> Message via WhatsApp
                  </Button>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
      {previewImage ? createPortal(
        <div role="dialog" aria-modal="true" aria-label={`${previewImage.name} image preview`} className="pointer-events-auto fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md" onClick={() => setPreviewImage(null)}>
          <div className="relative w-full max-w-3xl" onClick={(event) => event.stopPropagation()}>
            <div className="relative aspect-square max-h-[82vh] w-full overflow-hidden rounded-3xl border border-white/15 bg-[#111113] shadow-[0_30px_100px_rgba(0,0,0,.7)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={withCloudinaryTransforms(previewImage.url)} alt={previewImage.name} className="h-full w-full object-contain" />
            </div>
            <div className="mt-3 flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#19191c] px-4 py-3">
              <p className="truncate text-sm font-semibold text-white">{previewImage.name}</p>
              <button type="button" onClick={() => setPreviewImage(null)} className="shrink-0 rounded-xl border border-white/15 bg-white/[0.06] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-white/[0.12]">Close</button>
            </div>
          </div>
        </div>,
        document.body,
      ) : null}
      </div>
    </div>
  );
}
