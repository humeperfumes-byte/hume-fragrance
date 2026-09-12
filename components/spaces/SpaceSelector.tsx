"use client";

import { FormEvent, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Building, Home, Hotel, Store, Sparkles, ShieldCheck } from "lucide-react";

type FormState = {
  propertyType: string;
  area: string;
  ceiling: string;
  hvac: string;
  zones: string;
  model: string;
  scentFamily: string;
  city: string;
  name: string;
  phone: string;
  email: string;
  notes: string;
};

const initial: FormState = {
  propertyType: "",
  area: "",
  ceiling: "",
  hvac: "",
  zones: "",
  model: "",
  scentFamily: "",
  city: "",
  name: "",
  phone: "",
  email: "",
  notes: "",
};

const propertyTypes = [
  { label: "Luxury Home / Residence", icon: Home, desc: "Apartments, villas, master suites & private foyer" },
  { label: "Hotel & Hospitality", icon: Hotel, desc: "Lobbies, reception, suites & guest corridors" },
  { label: "Corporate Office", icon: Building, desc: "Boardrooms, client lounges & executive cabins" },
  { label: "Retail & Showroom", icon: Store, desc: "Fashion boutiques, galleries & vehicle showrooms" },
];

const field = "w-full border border-black/20 bg-white/50 px-4 py-3 text-sm outline-none focus:border-black transition-colors";

export default function SpaceSelector() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initial);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const set = (key: keyof FormState, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const result = useMemo(() => {
    const area = Number(form.area || 0);
    const isSmall = area > 0 && area <= 300;
    const isLarge = area > 2000 || form.hvac === "Central HVAC";

    if (isSmall) {
      return {
        title: "Santal Residence 150ml Reed Diffuser or Ivory Lobby Room Mist",
        detail: "A decorative passive reed diffuser is perfect for this intimate room. Pair with an ambient room spray for instant evening refresh.",
        suggestedCategory: "Reed Diffusers & Room Fresheners",
      };
    }
    if (isLarge) {
      return {
        title: "HUME Pro Smart Waterless Scent Machine or HVAC Integration",
        detail: "Larger properties benefit from cold-air micro-nebulization. HUME will design a custom multi-zone or HVAC diffusion plan.",
        suggestedCategory: "Waterless Machines & Commercial Plan",
      };
    }
    return {
      title: "Verdant Courtyard 300ml Statement Reed + HUME Pro Compact",
      detail: "A hybrid scenting plan: 300ml statement reed vessels for foyer entryways, and a compact waterless machine for open living areas.",
      suggestedCategory: "Hybrid Residential System",
    };
  }, [form]);

  const canContinue =
    step === 0
      ? !!form.propertyType
      : step === 1
      ? !!form.area && !!form.ceiling && !!form.hvac
      : true;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      const r = await fetch("/api/spaces-consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!r.ok) throw new Error();
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="py-20 text-center">
        <CheckCircle2 className="mx-auto text-emerald-800" size={48} />
        <h2 className="mt-6 font-serif text-4xl text-[#171713]">Your Space Brief is On Our Desk.</h2>
        <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-black/65">
          HUME Spaces has received your property details. Our spatial scent specialists will review your volume & airflow brief and contact you within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-4xl min-h-[580px] bg-white/60 border border-black/10 p-6 md:p-12 shadow-[0_18px_48px_rgba(0,0,0,0.04)]">
      {/* Progress Bar */}
      <div className="mb-10 flex items-center justify-between gap-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex flex-1 flex-col gap-1.5">
            <span className={`h-1.5 rounded-full transition-colors ${i <= step ? "bg-[#19231E]" : "bg-black/10"}`} />
            <span className="text-[9px] uppercase tracking-[0.2em] text-black/40 hidden sm:block">
              {i === 0 ? "Property" : i === 1 ? "Airflow" : i === 2 ? "Recommendation" : "Consultation"}
            </span>
          </div>
        ))}
      </div>

      {/* Step 1: Property Type */}
      {step === 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-[0.35em] text-black/45">Step 01 · Property Selection</p>
          <h2 className="mt-3 font-serif text-4xl text-[#171713]">What space are we scenting?</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {propertyTypes.map((pt) => {
              const Icon = pt.icon;
              const isSelected = form.propertyType === pt.label;
              return (
                <button
                  type="button"
                  key={pt.label}
                  onClick={() => set("propertyType", pt.label)}
                  className={`group relative flex flex-col p-6 text-left transition-all ${
                    isSelected
                      ? "border-2 border-[#19231E] bg-[#19231E] text-white shadow-md"
                      : "border border-black/15 bg-white hover:border-black/50 hover:bg-[#FAF8F5]"
                  }`}
                >
                  <Icon size={24} className={isSelected ? "text-amber-300" : "text-black/60"} />
                  <span className="mt-4 font-serif text-xl font-medium">{pt.label}</span>
                  <span className={`mt-1 text-xs ${isSelected ? "text-white/80" : "text-black/55"}`}>
                    {pt.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 2: Volume & Airflow */}
      {step === 1 && (
        <div>
          <p className="text-[10px] uppercase tracking-[0.35em] text-black/45">Step 02 · Volume & Airflow</p>
          <h2 className="mt-3 font-serif text-4xl text-[#171713]">Tell us about the air & room dimensions.</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <label className="text-xs font-medium uppercase tracking-[0.12em] text-black/70">
              Approximate Area (sq ft)
              <input
                type="number"
                min="20"
                placeholder="e.g. 450"
                value={form.area}
                onChange={(e) => set("area", e.target.value)}
                className={`${field} mt-2`}
              />
            </label>

            <label className="text-xs font-medium uppercase tracking-[0.12em] text-black/70">
              Ceiling Height
              <select
                value={form.ceiling}
                onChange={(e) => set("ceiling", e.target.value)}
                className={`${field} mt-2`}
              >
                <option value="">Select Ceiling Height</option>
                <option>Standard (Under 10 ft)</option>
                <option>High Ceiling (10–15 ft)</option>
                <option>Double Height / Atrium (Over 15 ft)</option>
              </select>
            </label>

            <label className="text-xs font-medium uppercase tracking-[0.12em] text-black/70">
              Air Conditioning Type
              <select
                value={form.hvac}
                onChange={(e) => set("hvac", e.target.value)}
                className={`${field} mt-2`}
              >
                <option value="">Select Air System</option>
                <option>Split / Standalone AC</option>
                <option>Central HVAC / Ducting</option>
                <option>Naturally Ventilated / Open-Air</option>
              </select>
            </label>

            <label className="text-xs font-medium uppercase tracking-[0.12em] text-black/70">
              Number of Scent Zones
              <input
                value={form.zones}
                onChange={(e) => set("zones", e.target.value)}
                className={`${field} mt-2`}
                placeholder="e.g. Foyer + Living Room + Suite"
              />
            </label>
          </div>
        </div>
      )}

      {/* Step 3: Recommendation Match */}
      {step === 2 && (
        <div>
          <p className="text-[10px] uppercase tracking-[0.35em] text-black/45">Step 03 · Automated Recommendation</p>

          <div className="mt-4 border border-[#8C7654]/30 bg-[#FAF7F2] p-6">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-semibold text-[#8C7654]">
              <Sparkles size={14} /> HUME Spaces System Match
            </div>
            <h3 className="mt-3 font-serif text-3xl text-[#171713]">{result.title}</h3>
            <p className="mt-3 text-sm leading-6 text-black/70">{result.detail}</p>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            <label className="text-xs font-medium uppercase tracking-[0.12em] text-black/70">
              Preferred Format
              <select
                value={form.model}
                onChange={(e) => set("model", e.target.value)}
                className={`${field} mt-2`}
              >
                <option value="">Let HUME Recommend</option>
                <option>Reed Diffusers & Room Mists</option>
                <option>Waterless Scent Machine Purchase</option>
                <option>Managed Monthly Scenting Plan</option>
                <option>Bespoke Signature Scent Design</option>
              </select>
            </label>

            <label className="text-xs font-medium uppercase tracking-[0.12em] text-black/70">
              Preferred Scent Family
              <select
                value={form.scentFamily}
                onChange={(e) => set("scentFamily", e.target.value)}
                className={`${field} mt-2`}
              >
                <option value="">Open to Recommendation</option>
                <option>Ivory Lobby (Tea & Citrus)</option>
                <option>Santal Residence (Sandalwood & Iris)</option>
                <option>Verdant Courtyard (Neroli & Fig)</option>
                <option>Midnight Suite (Rosewood & Saffron)</option>
                <option>Coastal Gallery (Mineral Air & Sage)</option>
              </select>
            </label>

            <label className="text-xs font-medium uppercase tracking-[0.12em] text-black/70 sm:col-span-2">
              City / Location
              <input
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
                className={`${field} mt-2`}
                placeholder="e.g. Mumbai, New Delhi, Bengaluru"
              />
            </label>
          </div>
        </div>
      )}

      {/* Step 4: Contact & Submission */}
      {step === 3 && (
        <div>
          <p className="text-[10px] uppercase tracking-[0.35em] text-black/45">Step 04 · Consultation & Details</p>
          <h2 className="mt-3 font-serif text-4xl text-[#171713]">Where should we send your spatial plan?</h2>

          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            <label className="text-xs font-medium uppercase tracking-[0.12em] text-black/70">
              Full Name *
              <input
                required
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                className={`${field} mt-2`}
                placeholder="Your Name"
              />
            </label>

            <label className="text-xs font-medium uppercase tracking-[0.12em] text-black/70">
              Phone / WhatsApp *
              <input
                required
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                className={`${field} mt-2`}
                placeholder="+91 98765 43210"
              />
            </label>

            <label className="text-xs font-medium uppercase tracking-[0.12em] text-black/70 sm:col-span-2">
              Email Address *
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                className={`${field} mt-2`}
                placeholder="your@email.com"
              />
            </label>

            <label className="text-xs font-medium uppercase tracking-[0.12em] text-black/70 sm:col-span-2">
              Additional Notes or Interior Details
              <input
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
                className={`${field} mt-2`}
                placeholder="e.g. Modern minimalist villa with double-height staircase"
              />
            </label>
          </div>

          {status === "error" && (
            <p className="mt-4 text-xs font-semibold text-red-700">
              Failed to send consultation request. Please check your network or reach out via WhatsApp.
            </p>
          )}

          <div className="mt-6 flex items-center gap-2 text-xs text-black/50">
            <ShieldCheck size={16} /> Privacy Guaranteed · HUME Spaces customizes every spatial fragrance proposal.
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="mt-12 flex items-center justify-between border-t border-black/15 pt-6">
        {step > 0 ? (
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-medium hover:text-black"
          >
            <ArrowLeft size={14} /> Back
          </button>
        ) : (
          <span />
        )}

        {step < 3 ? (
          <button
            disabled={!canContinue}
            type="button"
            onClick={() => setStep((s) => s + 1)}
            className="inline-flex items-center gap-2 bg-[#19231E] px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-90 disabled:opacity-30"
          >
            Continue <ArrowRight size={14} />
          </button>
        ) : (
          <button
            disabled={status === "sending"}
            type="submit"
            className="inline-flex items-center gap-2 bg-[#19231E] px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {status === "sending" ? "Sending Plan..." : "Request Consultation"}
          </button>
        )}
      </div>
    </form>
  );
}
