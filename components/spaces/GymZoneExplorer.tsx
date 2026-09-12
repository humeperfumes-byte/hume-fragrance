"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUpRight, Check, Dumbbell, Wind } from "lucide-react";

export const gymZones = [
  {
    id: "workout-floors",
    tabLabel: "WORKOUT FLOORS · COLD-AIR MACHINES",
    title: "Workout & Cardio Floors",
    subtitle: "High-airflow dry mist diffusion that neutralises sweat odor without wet residue.",
    coverage: "Up to 1,500 sq ft per unit",
    recommendedMachine: "HUME Pro Commercial Tower Scent Machine",
    recommendedImage: "/images/spaces/commercial-diffuser.png",
    scentNotes: "Eucalyptus · Crisp Citrus · Mineral Sage",
    benefits: [
      "Waterless dry mist ensures zero moisture on gym floor or equipment",
      "Calibrated continuous diffusion for peak morning & evening hours",
      "Active odor-binding molecules eliminate sweat odors instantly",
    ],
  },
  {
    id: "locker-rooms",
    tabLabel: "LOCKER ROOMS · NEBULIZING DIFFUSERS",
    title: "Locker Rooms & Washrooms",
    subtitle: "Continuous, high-intensity ambient fresh air for enclosed high-humidity zones.",
    coverage: "Up to 600 sq ft per unit",
    recommendedMachine: "HUME Ambient Aroma Diffuser",
    recommendedImage: "/images/spaces/aroma-diffuser.png",
    scentNotes: "Peppermint · White Tea · Bergamot",
    benefits: [
      "Constant air refresh in high-humidity shower and locker areas",
      "Combats humidity and stagnant air with clean botanical top notes",
      "Discreet sleek vessel design matching luxury gym aesthetic",
    ],
  },
  {
    id: "studios",
    tabLabel: "MINDFULNESS & YOGA · DECORATIVE REEDS",
    title: "Yoga, Pilates & Recovery Studios",
    subtitle: "Restorative, passive scenting designed for deep breathing and mental clarity.",
    coverage: "Up to 400 sq ft per vessel",
    recommendedMachine: "HUME Luxury Reed Diffuser",
    recommendedImage: "/images/spaces/decorative-diffuser.png",
    scentNotes: "Australian Sandalwood · Tuscan Iris · Cedar",
    benefits: [
      "Silent, flameless passive diffusion ideal for meditation and yoga",
      "Calming grounding scents that aid breathing rituals and focus",
      "Elegant ceramic vessel acts as a quiet interior accent",
    ],
  },
  {
    id: "hvac-whole-building",
    tabLabel: "HVAC INTEGRATION · WHOLE BUILDING",
    title: "Whole-Facility Central Ducting",
    subtitle: "Discreet spatial scenting integrated into central AHU air conditioning systems.",
    coverage: "Up to 5,000 sq ft",
    recommendedMachine: "HUME HVAC Scenting Integration System",
    recommendedImage: "/images/spaces/hvac-diffuser-v2.png",
    scentNotes: "Italian Bergamot · Coastal Air · Pale Woods",
    benefits: [
      "Invisible spatial scenting directly through central AC supply ducts",
      "Uniform distribution across multi-floor fitness clubs & wellness spas",
      "App-programmable multi-zone timing and intensity controls",
    ],
  },
];

export default function GymZoneExplorer() {
  const [activeZoneIndex, setActiveZoneIndex] = useState(0);
  const activeZone = gymZones[activeZoneIndex];

  return (
    <>
      {/* SECTION 1: DARK SPECIFICATION & ZONE SELECTOR TABS (Matching User Mockup) */}
      <section className="bg-[#121A16] pt-28 pb-4 text-[#F4F0E6] border-b border-white/10">
        <div className="mx-auto max-w-7xl px-5 md:px-10">
          <div className="flex items-center gap-6 overflow-x-auto pb-2 scrollbar-none">
            {gymZones.map((zone, idx) => {
              const isActive = activeZoneIndex === idx;
              return (
                <button
                  key={zone.id}
                  onClick={() => setActiveZoneIndex(idx)}
                  className={`inline-flex items-center gap-2 whitespace-nowrap text-[11px] sm:text-xs font-normal uppercase tracking-[0.2em] transition-all pb-3 border-b-2 ${
                    isActive
                      ? "text-white border-amber-400"
                      : "text-white/50 border-transparent hover:text-white/80"
                  }`}
                >
                  {isActive && <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />}
                  {zone.tabLabel}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 2: HERO IMAGE CARD WITH OVERLAY (Matching User Mockup Image) */}
      <section className="bg-[#121A16] px-5 py-6 md:px-10 md:py-8 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="relative aspect-[4/5] sm:aspect-[16/9] w-full overflow-hidden rounded-2xl border border-white/15 bg-black/40 shadow-2xl">
            <Image
              src="/images/spaces/gyms-app.png"
              alt="HUME Spaces Gym & Fitness Scenting"
              fill
              priority
              sizes="100vw"
              className="object-cover object-center brightness-[0.9] transition-transform duration-1000 hover:scale-105"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none" />

            {/* Bottom-Left White Typography Overlay (Matching user reference image media_1789206431621) */}
            <div className="absolute bottom-6 left-6 right-6 md:bottom-10 md:left-10 md:right-10 z-10 max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-md backdrop-blur-md bg-white/10 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-amber-300 border border-white/20 mb-3">
                <Dumbbell size={12} /> GYMS &amp; FITNESS STUDIOS
              </span>

              <h1 className="text-sm sm:text-base md:text-lg font-light uppercase tracking-[0.22em] text-white/95 leading-relaxed">
                AN ENDURING GESTURE FOR HIGH-PERFORMANCE FITNESS SPACES
              </h1>

              <p className="mt-2 max-w-xl text-xs sm:text-sm font-light text-white/70 leading-relaxed hidden sm:block">
                Odor-neutralising micro-nebulization engineered for workout floors, locker rooms, and wellness studios.
              </p>
            </div>

            {/* Bottom Right Floating Badge */}
            <div className="absolute bottom-6 right-6 z-10 hidden md:flex items-center gap-2 rounded-full border border-white/30 bg-black/60 px-4 py-2 text-[10px] font-light uppercase tracking-[0.18em] text-white backdrop-blur-md">
              <Wind size={12} className="text-amber-300" /> Active Air Refresh
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: INTERACTIVE ZONE EXPLORER */}
      <section className="bg-[#FAF8F5] px-5 py-16 md:px-10 md:py-24 border-b border-black/10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10">
            <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#8C7654]">
              SPATIAL CALIBRATION
            </span>
            <h2 className="mt-3 font-serif text-3xl sm:text-5xl font-light text-[#171713]">
              Tailored Scenting by Gym Zone
            </h2>
          </div>

          <div className="grid gap-10 lg:grid-cols-12 items-center bg-white border border-black/10 p-6 sm:p-10 rounded-2xl shadow-sm">
            <div className="lg:col-span-7">
              <span className="inline-block text-[10px] font-mono text-[#8C7654] font-semibold uppercase tracking-[0.2em] mb-2">
                ZONE 0{activeZoneIndex + 1} · {activeZone.coverage}
              </span>
              <h3 className="font-serif text-3xl sm:text-4xl font-light text-[#171713]">
                {activeZone.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-black/70">
                {activeZone.subtitle}
              </p>

              <div className="mt-6 border-t border-black/10 pt-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-black/50">
                  Recommended Fragrance Profile
                </p>
                <p className="mt-1 font-serif text-lg text-[#171713]">
                  {activeZone.scentNotes}
                </p>
              </div>

              <div className="mt-6 space-y-3">
                {activeZone.benefits.map((b) => (
                  <div key={b} className="flex items-start gap-3 text-xs font-medium text-black/80">
                    <Check size={16} className="text-emerald-700 shrink-0 mt-0.5" />
                    <span>{b}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex items-center gap-4">
                <Link
                  href="#gym-products"
                  className="inline-flex items-center gap-2 bg-[#19231E] px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-white hover:bg-black transition-colors rounded-sm"
                >
                  View Equipment <ArrowDown size={14} />
                </Link>
                <Link
                  href="/spaces/selector"
                  className="inline-flex items-center gap-2 border border-black/30 px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#171713] hover:bg-[#171713] hover:text-white transition-colors rounded-sm"
                >
                  Get Custom Recommendation <ArrowUpRight size={14} />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-[#F2EFE8] border border-black/10">
                <Image
                  src={activeZone.recommendedImage}
                  alt={activeZone.recommendedMachine}
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover object-center p-6"
                />
                <div className="absolute bottom-4 left-4 right-4 bg-black/80 backdrop-blur-md p-3 rounded-lg text-white">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-amber-300 font-semibold">Recommended Hardware</p>
                  <p className="text-xs font-serif font-light text-white mt-0.5">{activeZone.recommendedMachine}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
