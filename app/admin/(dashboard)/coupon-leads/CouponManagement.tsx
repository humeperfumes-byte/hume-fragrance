"use client";

import { FormEvent, useMemo, useState } from "react";
import { ChevronDown, Loader2, Pencil, Search, Ticket, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { CreateCouponDialog } from "./CreateCouponDialog";

type CouponRow = {
  id: string; code: string; title: string; description: string; type: string; value: string; minSubtotal: string;
  active: boolean; displayInCart: boolean; welcomeBackMode: string; archivedAt: string | null; createdAt: string; updatedAt: string;
  metrics: { claims: number; uniqueClaimants: number; emailClaims: number; whatsappClaims: number; checkoutStarts: number; redemptions: number; conversionRate: number; discountGranted: number; revenue: number };
  claimants: Array<{ id: string; destination: string | null; channel: string; createdAt: string; hasCheckout: boolean; hasOrder: boolean }>;
  redeemedOrders: Array<{ id: string; orderNumber: string; fullName: string | null; grandTotal: number; status: string; createdAt: string }>;
};

const inputClass = "h-11 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-white outline-none focus:border-[#c9b3ff]/50";

export function CouponManagement({ initialCoupons }: { initialCoupons: CouponRow[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("updated");
  const [editing, setEditing] = useState<CouponRow | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Record<string, string | boolean>>({});
  const [managementOpen, setManagementOpen] = useState(false);

  const rows = useMemo(() => initialCoupons.filter((coupon) => {
    const matchesQuery = `${coupon.code} ${coupon.title}`.toLowerCase().includes(query.trim().toLowerCase());
    const status = coupon.archivedAt ? "archived" : coupon.active ? "active" : "inactive";
    return matchesQuery && (filter === "all" || filter === status);
  }).sort((a, b) => sort === "claims" ? b.metrics.claims - a.metrics.claims : sort === "revenue" ? b.metrics.revenue - a.metrics.revenue : sort === "code" ? a.code.localeCompare(b.code) : +new Date(b.updatedAt) - +new Date(a.updatedAt)), [filter, initialCoupons, query, sort]);

  const openEdit = (coupon: CouponRow) => {
    setEditing(coupon);
    setForm({ code: coupon.code, title: coupon.title, description: coupon.description, type: coupon.type, value: coupon.value, minSubtotal: coupon.minSubtotal, active: coupon.active, displayInCart: coupon.displayInCart, welcomeBackMode: coupon.welcomeBackMode });
  };

  const save = async (event: FormEvent) => {
    event.preventDefault(); if (!editing) return; setSaving(true);
    try {
      const response = await fetch(`/api/admin/coupons/${editing.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, value: Number(form.value), minSubtotal: Number(form.minSubtotal) }) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error || "Could not update coupon");
      toast({ title: `${data.coupon.code} updated` }); setEditing(null); router.refresh();
    } catch (error) { toast({ title: error instanceof Error ? error.message : "Could not update coupon", variant: "destructive" }); }
    finally { setSaving(false); }
  };

  const remove = async (coupon: CouponRow) => {
    if (!confirm(`${coupon.metrics.claims || coupon.metrics.redemptions ? "Archive" : "Delete"} ${coupon.code}?`)) return;
    const response = await fetch(`/api/admin/coupons/${coupon.id}`, { method: "DELETE" }); const data = await response.json();
    if (!response.ok) return toast({ title: data.error || "Could not remove coupon", variant: "destructive" });
    toast({ title: data.action === "archived" ? `${coupon.code} archived` : `${coupon.code} deleted` }); router.refresh();
  };

  return <section className="space-y-4 rounded-3xl border border-white/[0.07] bg-white/[0.025] p-4 sm:p-5">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <button type="button" onClick={()=>setManagementOpen((open)=>!open)} aria-expanded={managementOpen} className="group flex min-w-0 flex-1 items-center justify-between gap-4 rounded-2xl p-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9b3ff]/50">
        <div><h2 className="text-lg font-semibold text-white">Coupon management</h2><p className="text-xs text-white/35">{managementOpen ? "Manage offers and compare claims with actual redemptions." : `${initialCoupons.length} coupons · Tap to manage`}</p></div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/55 transition group-hover:border-[#c9b3ff]/30 group-hover:text-[#d9ccff]"><ChevronDown className={`h-5 w-5 transition-transform ${managementOpen?"rotate-180":""}`}/></span>
      </button>
      <div className="shrink-0"><CreateCouponDialog /></div>
    </div>
    {managementOpen ? <>
    <div className="grid gap-2 border-t border-white/[0.06] pt-4 sm:grid-cols-3"><label className="relative"><Search className="absolute left-3 top-3.5 h-4 w-4 text-white/25"/><input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search coupons" className={`${inputClass} pl-9`}/></label><select value={filter} onChange={(e)=>setFilter(e.target.value)} className={inputClass}><option value="all">All statuses</option><option value="active">Active</option><option value="inactive">Inactive</option><option value="archived">Archived</option></select><select value={sort} onChange={(e)=>setSort(e.target.value)} className={inputClass}><option value="updated">Recently updated</option><option value="claims">Most claimed</option><option value="revenue">Highest revenue</option><option value="code">Code A–Z</option></select></div>
    <div className="grid gap-3 md:grid-cols-2">{rows.map((coupon) => <article key={coupon.id} className="rounded-2xl border border-white/[0.07] bg-black/20 p-4">
      <div className="flex items-start justify-between gap-3"><div><div className="flex flex-wrap items-center gap-2"><span className="font-mono text-sm font-bold tracking-wider text-[#d9ccff]">{coupon.code}</span><span className={`rounded-full px-2 py-0.5 text-[9px] uppercase ${coupon.archivedAt ? "bg-white/8 text-white/35" : coupon.active ? "bg-emerald-400/10 text-emerald-200" : "bg-amber-400/10 text-amber-200"}`}>{coupon.archivedAt ? "Archived" : coupon.active ? "Active" : "Inactive"}</span></div><p className="mt-1 text-sm text-white/70">{coupon.title}</p><p className="mt-1 text-xs text-white/30">{coupon.type === "percent" ? `${Number(coupon.value)}% off` : `₹${Number(coupon.value).toLocaleString("en-IN")} off`} above ₹{Number(coupon.minSubtotal).toLocaleString("en-IN")}</p></div><div className="flex gap-1"><Button size="icon" variant="ghost" onClick={()=>openEdit(coupon)} disabled={Boolean(coupon.archivedAt)}><Pencil className="h-4 w-4"/></Button><Button size="icon" variant="ghost" onClick={()=>remove(coupon)}><Trash2 className="h-4 w-4 text-rose-300"/></Button></div></div>
      <div className="mt-4 grid grid-cols-4 gap-2">{[["Claims",coupon.metrics.claims],["Redeemed",coupon.metrics.redemptions],["Conversion",`${coupon.metrics.conversionRate}%`],["Revenue",`₹${coupon.metrics.revenue.toLocaleString("en-IN")}`]].map(([label,value])=><div key={label} className="rounded-xl bg-white/[0.035] p-2"><p className="text-[8px] uppercase text-white/25">{label}</p><p className="mt-1 text-xs font-semibold text-white/70">{value}</p></div>)}</div>
      <button onClick={()=>setExpanded(expanded===coupon.id?null:coupon.id)} className="mt-3 flex w-full items-center justify-between border-t border-white/[0.06] pt-3 text-xs text-white/40"><span>Claimants, orders and savings</span><ChevronDown className={`h-4 w-4 transition ${expanded===coupon.id?"rotate-180":""}`}/></button>
      {expanded===coupon.id?<div className="mt-3 grid gap-3 text-xs sm:grid-cols-2"><div><p className="mb-2 font-semibold text-white/50">Claimed by ({coupon.metrics.uniqueClaimants})</p>{coupon.claimants.length?coupon.claimants.map(c=><div key={c.id} className="mb-1 rounded-lg bg-white/[0.03] p-2 text-white/40"><p className="truncate">{c.destination||"Anonymous session"}</p><p className="text-[9px] uppercase text-white/20">{c.channel}{c.hasOrder?" · ordered":c.hasCheckout?" · checkout":""}</p></div>):<p className="text-white/25">No claims in this period.</p>}</div><div><p className="mb-2 font-semibold text-white/50">Redeemed orders ({coupon.metrics.redemptions})</p>{coupon.redeemedOrders.length?coupon.redeemedOrders.map(o=><div key={o.id} className="mb-1 flex justify-between rounded-lg bg-white/[0.03] p-2 text-white/40"><span>{o.orderNumber} · {o.fullName||"Guest"}</span><span>₹{o.grandTotal.toLocaleString("en-IN")}</span></div>):<p className="text-white/25">No redemptions in this period.</p>}<p className="mt-2 text-white/30">Discount granted: ₹{coupon.metrics.discountGranted.toLocaleString("en-IN")}</p></div></div>:null}
    </article>)}</div>{!rows.length?<div className="py-10 text-center text-sm text-white/30">No coupons match these filters.</div>:null}
    </> : null}
    <Dialog open={Boolean(editing)} onOpenChange={(open)=>!open&&setEditing(null)}><DialogContent className="max-w-xl border-white/10 bg-[#17171a] text-white"><DialogHeader><DialogTitle>Edit coupon</DialogTitle></DialogHeader><form onSubmit={save} className="space-y-4"><div className="grid gap-3 sm:grid-cols-2"><input required value={String(form.code||"")} onChange={e=>setForm({...form,code:e.target.value.toUpperCase()})} placeholder="Code" className={inputClass}/><select value={String(form.type||"fixed")} onChange={e=>setForm({...form,type:e.target.value})} className={inputClass}><option value="fixed">Fixed amount</option><option value="percent">Percentage</option></select><input required value={String(form.title||"")} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Title" className={inputClass}/><input type="number" min="0.01" step="0.01" required value={String(form.value||"")} onChange={e=>setForm({...form,value:e.target.value})} placeholder="Value" className={inputClass}/><input type="number" min="0" step="1" required value={String(form.minSubtotal||"")} onChange={e=>setForm({...form,minSubtotal:e.target.value})} placeholder="Minimum subtotal" className={inputClass}/><select value={String(form.welcomeBackMode||"allow")} onChange={e=>setForm({...form,welcomeBackMode:e.target.value})} className={inputClass}><option value="allow">Allow welcome reward</option><option value="cap_5">Cap welcome reward at 5%</option><option value="disable">Disable welcome reward</option></select></div><textarea value={String(form.description||"")} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Description" className={`${inputClass} min-h-24 py-3`}/><div className="flex gap-4 text-sm text-white/55"><label><input type="checkbox" checked={Boolean(form.active)} onChange={e=>setForm({...form,active:e.target.checked})}/> <span className="ml-1">Active</span></label><label><input type="checkbox" checked={Boolean(form.displayInCart)} onChange={e=>setForm({...form,displayInCart:e.target.checked})}/> <span className="ml-1">Show in cart</span></label></div><Button type="submit" disabled={saving} className="w-full">{saving?<Loader2 className="mr-2 h-4 w-4 animate-spin"/>:<Ticket className="mr-2 h-4 w-4"/>}Save coupon</Button></form></DialogContent></Dialog>
  </section>;
}
