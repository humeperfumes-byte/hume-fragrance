"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, Copy, Check, ShoppingBag, Truck, Lock, Unlock, Zap, RotateCcw } from "lucide-react";
import type { CityFlyerConfig } from "@/lib/flyer-cities";

interface FlyerHeroBannerProps {
  config: CityFlyerConfig;
  mode: "perfumes" | "discovery-set";
}

// Antigravity Spectrum Confetti Particle
interface ConfettiParticle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  vx: number;
  vy: number;
  rotation: number;
  isCircle?: boolean;
}

export default function FlyerHeroBanner({ config, mode }: FlyerHeroBannerProps) {
  const [copied, setCopied] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [unlockStep, setUnlockStep] = useState<1 | 2 | 3>(1);
  const [progress, setProgress] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [particles, setParticles] = useState<ConfettiParticle[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if user already unlocked voucher in this session
    const alreadyUnlocked = sessionStorage.getItem(`hume_unlocked_${config.slug}`);
    if (alreadyUnlocked === "true") {
      setIsUnlocked(true);
    }

    const urlParams = new URLSearchParams(window.location.search);
    const qrId = urlParams.get("qr_id");

    // Store city attribution in sessionStorage for funnel tracking
    sessionStorage.setItem("hume_flyer_city", config.slug);
    sessionStorage.setItem("hume_flyer_target", mode);
    sessionStorage.setItem("hume_flyer_coupon", config.couponCode);
    if (qrId) {
      sessionStorage.setItem("hume_flyer_qr_id", qrId);
    }

    let sessionId = sessionStorage.getItem("hume_session_id");
    if (!sessionId) {
      sessionId = `sess-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      sessionStorage.setItem("hume_session_id", sessionId);
    }

    // Log QR scan event to backend API
    fetch("/api/analytics/flyers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        city: config.slug,
        targetPage: mode,
        eventType: "qr_scan",
        couponCode: config.couponCode,
        sessionId,
        qrId: qrId || undefined,
      }),
    }).catch(() => {});
  }, [config.slug, config.couponCode, mode]);

  // MASSIVE Antigravity Spectrum Rainbow Confetti Explosion 🎉 (125+ Particles)
  const triggerConfettiExplosion = () => {
    const antigravityColors = [
      "#EF4444", // Red
      "#F97316", // Orange
      "#10B981", // Emerald Green
      "#06B6D4", // Cyan
      "#3B82F6", // Electric Blue
      "#8B5CF6", // Purple
      "#EC4899", // Magenta/Pink
      "#F43F5E", // Rose
      "#18181B", // Dark Obsidian
      "#FFFFFF"  // Pure White
    ];
    const newParticles: ConfettiParticle[] = [];

    // Wave 1: 80 high-speed 360-degree particles
    for (let i = 0; i < 80; i++) {
      const angle = (Math.PI * 2 * i) / 80 + (Math.random() - 0.5);
      const speed = Math.random() * 16 + 8;
      newParticles.push({
        id: i,
        x: (Math.random() - 0.5) * 40,
        y: (Math.random() - 0.5) * 20,
        size: Math.random() * 9 + 5,
        color: antigravityColors[Math.floor(Math.random() * antigravityColors.length)],
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 5,
        rotation: Math.random() * 360,
        isCircle: i % 3 === 0,
      });
    }

    // Wave 2: 45 secondary floating particles
    for (let i = 80; i < 125; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 10 + 4;
      newParticles.push({
        id: i,
        x: (Math.random() - 0.5) * 60,
        y: (Math.random() - 0.5) * 30,
        size: Math.random() * 7 + 4,
        color: antigravityColors[Math.floor(Math.random() * antigravityColors.length)],
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        rotation: Math.random() * 360,
        isCircle: i % 2 === 0,
      });
    }

    setParticles(newParticles);
    setShowConfetti(true);

    setTimeout(() => {
      setShowConfetti(false);
    }, 4000);
  };

  const handleResetUnlock = () => {
    setIsUnlocked(false);
    setIsUnlocking(false);
    setProgress(0);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(`hume_unlocked_${config.slug}`);
    }
  };

  // 3-SECOND Multi-Step Tap-to-Unlock Sequence
  const handleStartUnlockSequence = () => {
    if (isUnlocking || isUnlocked) return;

    setIsUnlocking(true);
    setUnlockStep(1);
    setProgress(20);

    // Step 1 (0s - 1.0s): Verifying Physical Flyer QR Code
    const timer1 = setTimeout(() => {
      setUnlockStep(2);
      setProgress(65);
    }, 1000);

    // Step 2 (1.0s - 2.2s): Allocating City Exclusive Voucher
    const timer2 = setTimeout(() => {
      setUnlockStep(3);
      setProgress(92);
    }, 2200);

    // Step 3 (2.2s - 2.8s): Activating Cart Savings
    const timer3 = setTimeout(() => {
      setProgress(100);
    }, 2800);

    // Step 4 (3.0s): MASSIVE POP CELEBRATION 🎉 & REVEAL FLIP
    const timer4 = setTimeout(() => {
      setIsUnlocking(false);
      setIsUnlocked(true);
      triggerConfettiExplosion();

      if (typeof window !== "undefined") {
        sessionStorage.setItem(`hume_unlocked_${config.slug}`, "true");
      }
    }, 3000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(config.couponCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);

      const sessionId = typeof window !== "undefined" ? sessionStorage.getItem("hume_session_id") : null;

      // Log coupon copy event to backend API
      fetch("/api/analytics/flyers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city: config.slug,
          targetPage: mode,
          eventType: "coupon_copy",
          couponCode: config.couponCode,
          sessionId,
        }),
      }).catch(() => {});
    } catch {
      // Fallback
    }
  };

  return (
    <section className="relative overflow-hidden border-b border-white/10 bg-stone-950 pt-28 md:pt-36 pb-12 md:pb-16 text-foreground">
      {/* Subtle Antigravity Multi-color Background Spectrum Glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/15 via-purple-900/10 to-transparent opacity-60" />

      {/* MASSIVE POP CELEBRATION MULTI-COLOR SPECTRUM CONFETTI OVERLAY */}
      {showConfetti && (
        <div className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center overflow-hidden">
          {particles.map((p) => (
            <div
              key={p.id}
              className={`absolute animate-confetti-pop ${p.isCircle ? "rounded-full" : "rounded-sm"}`}
              style={{
                width: `${p.size}px`,
                height: `${p.isCircle ? p.size : p.size * 1.5}px`,
                backgroundColor: p.color,
                boxShadow: `0 0 12px ${p.color}`,
                transform: `translate(${p.vx * 22}px, ${p.vy * 22}px) rotate(${p.rotation}deg)`,
                opacity: 0.95,
              }}
            />
          ))}
        </div>
      )}

      <div className="container relative mx-auto px-4 md:px-6">
        <div className="mx-auto max-w-4xl text-center space-y-6">
          
          {/* Partner Delivery Badge (Sleek Frosted Pill) */}
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-stone-300 backdrop-blur-md">
            <Truck className="h-3.5 w-3.5 text-cyan-400" />
            <span>Blinkit & Zepto Order Partner Offer</span>
          </div>

          {/* Localized City Greeting - Signature Serif Typography */}
          <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-5xl lg:text-6xl font-serif">
            {config.greeting}
          </h1>

          {/* Subheading */}
          {Boolean(config.tagline?.trim()) && (
            <p className="text-base text-stone-300 md:text-lg max-w-2xl mx-auto leading-relaxed font-sans">
              {config.tagline}
            </p>
          )}

          {/* ULTRA-LIGHT & MODERN GLASSMORPHIC TAP-TO-UNLOCK VOUCHER PILL (RESPONSIVE MOBILE REFACTOR) */}
          <div className="pt-2">
            <div className="relative flex w-full max-w-[94vw] sm:max-w-md items-center justify-center rounded-full bg-white/95 p-1.5 sm:p-2 shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-2xl border border-white/80 mx-auto text-stone-900 transition-all duration-500">
              
              {/* STATE 1: UNLOCKED STATE (REVEAL ANIMATION) */}
              {isUnlocked ? (
                <div className="flex items-center justify-between w-full gap-2 sm:gap-3 pl-2 sm:pl-3 pr-1 py-0.5 animate-reveal-pop">
                  <div className="flex items-center gap-2 sm:gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white shrink-0 shadow-md animate-bounce">
                      <Unlock className="h-3.5 w-3.5" />
                    </div>
                    <div className="text-left">
                      <span className="text-[9px] sm:text-[10px] uppercase font-mono tracking-wider text-emerald-600 font-bold block whitespace-nowrap">
                        ✓ Unlocked
                      </span>
                      <span className="font-mono text-xs sm:text-sm font-extrabold text-stone-950 tracking-wider whitespace-nowrap">
                        {config.couponCode}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="inline-flex items-center gap-1 rounded-full bg-stone-950 px-3.5 py-1.5 text-[11px] sm:text-xs font-bold text-white transition-all hover:bg-stone-800 active:scale-95 shadow-md whitespace-nowrap"
                      title="Copy coupon code"
                    >
                      {copied ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5 text-white" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleResetUnlock}
                      className="p-1.5 rounded-full bg-stone-100 text-stone-500 hover:text-stone-950 hover:bg-stone-200 transition-all shrink-0"
                      title="Replay 3-second unlock animation"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ) : isUnlocking ? (
                /* STATE 2: 3-SECOND FAST MULTI-STEP UNLOCKING PROGRESS */
                <div className="w-full space-y-1.5 px-3 sm:px-4 py-1 text-left">
                  <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-semibold">
                    <div className="flex items-center gap-1.5 truncate pr-2">
                      <Zap className="h-3.5 w-3.5 text-cyan-600 animate-spin shrink-0" />
                      <span className="text-stone-700 font-mono text-[10px] sm:text-[11px] truncate">
                        {unlockStep === 1 && "Verifying QR..."}
                        {unlockStep === 2 && `Allocating ${config.cityName} Discount...`}
                        {unlockStep === 3 && "Activating ₹100 Off..."}
                      </span>
                    </div>
                    <span className="font-mono text-cyan-600 font-extrabold shrink-0">{progress}%</span>
                  </div>

                  {/* Sleek Modern Luxury Progress Bar */}
                  <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden border border-stone-200">
                    <div
                      className="bg-stone-950 h-full rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              ) : (
                /* STATE 3: INITIAL RESPONSIVE MOBILE & DESKTOP UNLOCK BUTTON */
                <div className="flex items-center justify-between w-full gap-2 sm:gap-3 pl-2 sm:pl-3 pr-1 py-0.5">
                  <div className="flex items-center gap-2 sm:gap-2.5 text-left shrink-0">
                    <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 shrink-0 shadow-sm animate-pulse">
                      <Lock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </div>
                    <div className="flex flex-col justify-center">
                      <span className="text-xs sm:text-xs font-extrabold text-stone-950 block tracking-tight whitespace-nowrap">
                        Flat ₹100 OFF
                      </span>
                      <span className="text-[9px] sm:text-[10px] font-medium text-stone-500 block whitespace-nowrap">
                        Flyer Reward
                      </span>
                    </div>
                  </div>

                  {/* Masterpiece Tap to Unlock Button (Mobile Optimized Sizing) */}
                  <button
                    type="button"
                    onClick={handleStartUnlockSequence}
                    className="relative overflow-hidden inline-flex items-center gap-1.5 sm:gap-2.5 rounded-full bg-stone-950 px-3.5 py-2 sm:px-5 sm:py-2.5 text-xs font-extrabold text-white shadow-[0_0_20px_rgba(16,185,129,0.35)] ring-2 ring-emerald-500/40 transition-all duration-300 hover:bg-stone-900 hover:scale-105 active:scale-95 border border-emerald-500/30 shrink-0 animate-button-breathe cursor-pointer group"
                  >
                    {/* Multi-angle glossy sheen sweep */}
                    <span className="absolute inset-0 -translate-x-full animate-sheen-sweep bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

                    {/* Pulsing emerald sparkle badge */}
                    <div className="flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 shadow-inner group-hover:scale-110 transition-transform shrink-0">
                      <Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-emerald-300 animate-pulse" />
                    </div>

                    <span className="tracking-wider uppercase text-[10px] sm:text-[11px] font-extrabold text-white whitespace-nowrap">
                      Tap to Unlock
                    </span>
                  </button>
                </div>
              )}

            </div>
          </div>

          {/* Action Buttons - HUME Luxury Monochrome Styling */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-4">
            <Link
              href={`/flyers/${config.slug}/perfumes`}
              className={`inline-flex items-center gap-2 rounded-full px-6 py-3 text-xs md:text-sm font-semibold tracking-wide transition-all shadow-lg ${
                mode === "perfumes"
                  ? "bg-white text-stone-950 hover:bg-stone-200"
                  : "border border-white/20 bg-stone-900/60 text-stone-200 hover:bg-stone-800 hover:text-white hover:border-white/40"
              }`}
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Shop All Perfumes</span>
            </Link>

            <Link
              href={`/flyers/${config.slug}/discovery-set`}
              className={`inline-flex items-center gap-2 rounded-full px-6 py-3 text-xs md:text-sm font-semibold tracking-wide transition-all shadow-lg ${
                mode === "discovery-set"
                  ? "bg-white text-stone-950 hover:bg-stone-200"
                  : "border border-white/20 bg-stone-900/60 text-stone-200 hover:bg-stone-800 hover:text-white hover:border-white/40"
              }`}
            >
              <Sparkles className="h-4 w-4" />
              <span>Try Discovery Set (Sample Kit)</span>
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}
