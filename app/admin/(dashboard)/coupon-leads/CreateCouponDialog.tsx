"use client";

import { FormEvent, useMemo, useState } from "react";
import { BadgePercent, Check, Loader2, Plus, Sparkles, Ticket } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

type CouponForm = {
  code: string;
  title: string;
  description: string;
  type: "fixed" | "percent";
  value: string;
  minSubtotal: string;
  active: boolean;
  displayInCart: boolean;
};

const INITIAL_FORM: CouponForm = {
  code: "",
  title: "",
  description: "",
  type: "fixed",
  value: "100",
  minSubtotal: "999",
  active: true,
  displayInCart: false,
};

const fieldClass =
  "h-11 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-white outline-none transition placeholder:text-white/22 focus:border-[#c9b3ff]/55 focus:ring-2 focus:ring-[#c9b3ff]/10";

export function CreateCouponDialog() {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<CouponForm>(INITIAL_FORM);

  const preview = useMemo(() => {
    const value = Number(form.value || 0);
    return form.type === "percent"
      ? `${value || 0}% OFF`
      : `₹${(value || 0).toLocaleString("en-IN")} OFF`;
  }, [form.type, form.value]);

  function update<K extends keyof CouponForm>(key: K, value: CouponForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          value: Number(form.value),
          minSubtotal: Number(form.minSubtotal || 0),
          welcomeBackMode: "allow",
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not create coupon");

      toast({ title: `${data.coupon.code} coupon created` });
      setForm(INITIAL_FORM);
      setOpen(false);
    } catch (error) {
      toast({
        title: error instanceof Error ? error.message : "Could not create coupon",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="group inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#c9b3ff]/25 bg-[linear-gradient(135deg,#d9ccff,#b99ef7)] px-4 text-sm font-bold text-[#17121f] shadow-[0_12px_35px_rgba(180,151,246,.2)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_42px_rgba(180,151,246,.28)]"
        >
          <Plus className="h-4 w-4 transition group-hover:rotate-90" />
          Create new coupon
        </button>
      </DialogTrigger>

      <DialogContent className="custom-scrollbar max-h-[92vh] w-[calc(100%-1.5rem)] max-w-2xl overflow-y-auto rounded-[26px] border-white/10 bg-[radial-gradient(circle_at_90%_0%,rgba(201,179,255,.13),transparent_30%),#151518] p-0 text-white shadow-2xl sm:w-full">
        <DialogHeader className="border-b border-white/[0.08] p-5 pr-14 text-left sm:p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#c9b3ff]/20 bg-[#c9b3ff]/10 text-[#d9cbff]">
              <Ticket className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[.2em] text-[#c9b3ff]/60">Coupon studio</p>
              <DialogTitle className="mt-1 text-xl font-semibold tracking-tight">Create a new coupon</DialogTitle>
            </div>
          </div>
          <DialogDescription className="mt-3 text-sm leading-6 text-white/38">
            The coupon becomes available immediately when it is created as active.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-5 p-5 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-[1fr_.72fr]">
            <label className="space-y-2">
              <span className="text-[9px] font-bold uppercase tracking-[.17em] text-white/35">Coupon code</span>
              <input
                required
                value={form.code}
                onChange={(event) => update("code", event.target.value.toUpperCase().replace(/\s+/g, ""))}
                placeholder="HUME200"
                maxLength={32}
                className={`${fieldClass} font-mono font-bold uppercase tracking-[.12em]`}
              />
            </label>
            <label className="space-y-2">
              <span className="text-[9px] font-bold uppercase tracking-[.17em] text-white/35">Discount type</span>
              <select
                value={form.type}
                onChange={(event) => update("type", event.target.value as CouponForm["type"])}
                className={fieldClass}
              >
                <option value="fixed">Fixed amount</option>
                <option value="percent">Percentage</option>
              </select>
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-[9px] font-bold uppercase tracking-[.17em] text-white/35">{form.type === "percent" ? "Discount percentage" : "Discount amount"}</span>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-white/35">{form.type === "percent" ? "%" : "₹"}</span>
                <input
                  required
                  type="number"
                  min="0.01"
                  max={form.type === "percent" ? "100" : undefined}
                  step="0.01"
                  value={form.value}
                  onChange={(event) => update("value", event.target.value)}
                  className={`${fieldClass} pl-8`}
                />
              </div>
            </label>
            <label className="space-y-2">
              <span className="text-[9px] font-bold uppercase tracking-[.17em] text-white/35">Minimum order value</span>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-white/35">₹</span>
                <input
                  required
                  type="number"
                  min="0"
                  step="1"
                  value={form.minSubtotal}
                  onChange={(event) => update("minSubtotal", event.target.value)}
                  className={`${fieldClass} pl-8`}
                />
              </div>
            </label>
          </div>

          <label className="block space-y-2">
            <span className="text-[9px] font-bold uppercase tracking-[.17em] text-white/35">Customer-facing title</span>
            <input
              required
              value={form.title}
              onChange={(event) => update("title", event.target.value)}
              placeholder="Flat ₹200 off"
              maxLength={120}
              className={fieldClass}
            />
          </label>

          <label className="block space-y-2">
            <span className="text-[9px] font-bold uppercase tracking-[.17em] text-white/35">Description <span className="text-white/18">optional</span></span>
            <textarea
              value={form.description}
              onChange={(event) => update("description", event.target.value)}
              placeholder="₹200 off on orders above ₹1,499"
              maxLength={400}
              rows={3}
              className="w-full resize-none rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none transition placeholder:text-white/22 focus:border-[#c9b3ff]/55 focus:ring-2 focus:ring-[#c9b3ff]/10"
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => update("active", !form.active)}
              className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition ${form.active ? "border-emerald-300/20 bg-emerald-300/[0.055]" : "border-white/8 bg-white/[0.025]"}`}
            >
              <span className={`flex h-7 w-7 items-center justify-center rounded-lg border ${form.active ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-200" : "border-white/10 text-white/20"}`}>{form.active ? <Check className="h-4 w-4" /> : null}</span>
              <span><span className="block text-sm font-semibold text-white">Active immediately</span><span className="mt-1 block text-[10px] text-white/30">Customers can apply the code</span></span>
            </button>
            <button
              type="button"
              onClick={() => update("displayInCart", !form.displayInCart)}
              className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition ${form.displayInCart ? "border-[#c9b3ff]/20 bg-[#c9b3ff]/[0.055]" : "border-white/8 bg-white/[0.025]"}`}
            >
              <span className={`flex h-7 w-7 items-center justify-center rounded-lg border ${form.displayInCart ? "border-[#c9b3ff]/20 bg-[#c9b3ff]/10 text-[#dbcfff]" : "border-white/10 text-white/20"}`}>{form.displayInCart ? <Check className="h-4 w-4" /> : null}</span>
              <span><span className="block text-sm font-semibold text-white">Show in cart</span><span className="mt-1 block text-[10px] text-white/30">Display as an available offer</span></span>
            </button>
          </div>

          <div className="flex items-center justify-between gap-4 rounded-2xl border border-[#c9b3ff]/12 bg-[#c9b3ff]/[0.035] p-4">
            <div className="min-w-0"><p className="text-[9px] font-bold uppercase tracking-[.17em] text-white/30">Preview</p><p className="mt-1 truncate font-mono text-sm font-bold tracking-[.12em] text-[#dacdff]">{form.code || "YOURCODE"}</p></div>
            <div className="flex items-center gap-2 rounded-xl border border-white/8 bg-black/20 px-3 py-2 text-sm font-bold text-white"><BadgePercent className="h-4 w-4 text-[#c9b3ff]" />{preview}</div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-white/[0.07] pt-5 sm:flex-row sm:justify-end">
            <button type="button" onClick={() => setOpen(false)} className="h-11 rounded-xl border border-white/10 px-5 text-sm font-semibold text-white/55 transition hover:bg-white/[0.05] hover:text-white">Cancel</button>
            <button type="submit" disabled={saving} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-bold text-black transition hover:bg-[#ddd2ff] disabled:cursor-not-allowed disabled:opacity-50">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {saving ? "Creating coupon…" : "Create coupon"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
