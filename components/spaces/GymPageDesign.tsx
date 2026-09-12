"use client";

import { useState } from "react";
import Image from "next/image";
import {
  ArrowRight,
  Check,
  Dumbbell,
  Droplet,
  Leaf,
  Sliders,
  VolumeX,
  Wind,
  Zap,
  X,
} from "lucide-react";
import SpacesProductCard from "@/components/spaces/SpacesProductCard";
import { SPACES_PRODUCTS } from "@/lib/spaces";

const gymScents = [
  {
    name: "CITRUS",
    tags: "Fresh · Energising",
    description: "Invigorating Sicilian bergamot and grapefruit notes.",
    image: "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "OCEAN",
    tags: "Cool · Crisp",
    description: "Crisp marine ozone and pale driftwood accord.",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "MINT",
    tags: "Cool · Clean",
    description: "Crushed peppermint and eucalyptus leaves.",
    image: "https://images.unsplash.com/photo-1628556270448-4d4e4148e1b1?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "LAVENDER",
    tags: "Calm · Balanced",
    description: "Soft French lavender for recovery and mindfulness.",
    image: "https://images.unsplash.com/photo-1528183429752-a97d0bf99b5a?auto=format&fit=crop&w=600&q=80",
  },
];

const gymAreas = [
  {
    title: "RECEPTION & LOBBY",
    subtitle: "First Impressions",
    description: "Instant luxury scenting upon arrival.",
    image: "/images/spaces/receptions-app.jpg",
  },
  {
    title: "WORKOUT FLOOR",
    subtitle: "Cardio & Weights",
    description: "Dry mist eliminating sweat odor without wet residue.",
    image: "/images/spaces/gyms-app.png",
  },
  {
    title: "CHANGING ROOMS",
    subtitle: "Lockers & Showers",
    description: "Continuous fresh air refresh for high-moisture zones.",
    image: "/images/spaces/bathrooms-app.png",
  },
  {
    title: "STUDIO & FUNCTIONAL",
    subtitle: "Yoga & Pilates",
    description: "Botanical scenting for deep breathing & recovery.",
    image: "/images/spaces/rooms-app.png",
  },
];

export default function GymPageDesign() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    gymName: "",
    phone: "",
    email: "",
    city: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setIsModalOpen(false);
    }, 2500);
  };

  return (
    <div className="w-full bg-[#0D110F] text-[#F4F0E6]">
      {/* SECTION 1: HERO */}
      <section className="relative bg-[#0D110F] pt-24 pb-12 sm:pt-36 sm:pb-20 border-b border-white/10 overflow-hidden">
        {/* Subtle Background Glow */}
        <div className="absolute top-1/4 right-0 w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] bg-emerald-950/20 blur-[100px] rounded-full pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <div className="grid gap-8 lg:grid-cols-12 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2.5 mb-4 sm:mb-6">
                <span className="text-[9px] sm:text-xs font-medium uppercase tracking-[0.26em] text-[#A2B5A7]">
                  GYM FRAGRANCE SOLUTIONS
                </span>
                <span className="h-px w-8 sm:w-10 bg-[#A2B5A7]/40" />
              </div>

              <h1 className="font-serif text-3xl sm:text-5xl lg:text-7xl font-light text-white leading-[1.1] tracking-tight">
                Fresh Energy. <br className="hidden sm:inline" />
                Every Workout.
              </h1>

              <p className="mt-4 sm:mt-6 max-w-xl text-xs sm:text-base leading-relaxed text-[#C5D0C8] font-light">
                Specially designed aroma diffusers for gyms &amp; fitness centres. Keep your space fresh, motivating and inviting — every day, at every hour.
              </p>

              <div className="mt-6 sm:mt-8">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center justify-center gap-2.5 rounded-full bg-white px-6 sm:px-7 py-3.5 sm:py-4 text-[11px] sm:text-xs font-semibold uppercase tracking-[0.18em] text-[#0D110F] transition-all hover:bg-stone-200 w-full sm:w-auto"
                >
                  Get a Scenting Consultation <ArrowRight size={14} />
                </button>
              </div>
            </div>

            {/* Right Product Showcase Render */}
            <div className="lg:col-span-5">
              <div className="relative aspect-[4/3] sm:aspect-[3/4] w-full overflow-hidden rounded-xl sm:rounded-2xl border border-white/15 bg-stone-900/60 shadow-xl">
                <Image
                  src="/images/spaces/commercial-diffuser.png"
                  alt="HUME Commercial Gym Diffuser"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover object-center p-4 sm:p-8 brightness-[0.95]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-3 left-3 right-3 sm:bottom-6 sm:left-6 sm:right-6 backdrop-blur-md bg-black/60 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-white/10">
                  <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.18em] text-amber-300 font-medium">HUME Commercial Tower</p>
                  <p className="text-[11px] sm:text-xs text-white/90 font-serif font-light mt-0.5">Cold-Air Micro-Nebulizer · Up to 1,500 sq ft</p>
                </div>
              </div>
            </div>
          </div>

          {/* 4 Feature Badges (Mobile Swipeable Row / Desktop Grid) */}
          <div className="mt-10 sm:mt-16 pt-8 sm:pt-12 border-t border-white/10">
            <div className="flex overflow-x-auto sm:grid sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 pb-2 scrollbar-none">
              {[
                { icon: Dumbbell, title: "Boosts Member Experience" },
                { icon: Wind, title: "Eliminates Odours" },
                { icon: Zap, title: "Creates Fresh Atmosphere" },
                { icon: Leaf, title: "Automated & Hassle-free" },
              ].map((badge) => (
                <div
                  key={badge.title}
                  className="flex items-center gap-3 shrink-0 bg-white/5 sm:bg-transparent border border-white/10 sm:border-0 px-4 py-2.5 sm:p-0 rounded-full sm:rounded-none"
                >
                  <div className="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/5 text-amber-300">
                    <badge.icon size={15} className="sm:h-4 sm:w-4" />
                  </div>
                  <span className="text-[11px] sm:text-xs font-medium text-white/90 whitespace-nowrap sm:whitespace-normal leading-snug">
                    {badge.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: THE GYM DIFFERENCE */}
      <section className="bg-[#F8F7F4] text-[#171713] px-4 sm:px-6 lg:px-10 py-12 sm:py-20 border-b border-black/10">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-12 items-center mb-10 sm:mb-14">
            <div className="lg:col-span-6">
              <div className="inline-flex items-center gap-2.5 mb-3 sm:mb-4">
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.26em] text-[#8C7654]">
                  THE GYM DIFFERENCE
                </span>
                <span className="h-px w-8 sm:w-10 bg-[#8C7654]/40" />
              </div>

              <h2 className="font-serif text-2xl sm:text-4xl md:text-5xl font-light leading-tight text-[#171713]">
                Why Choose HUME Gym Aroma Diffusers?
              </h2>

              <p className="mt-3 text-xs sm:text-base leading-relaxed text-[#55524B] font-normal">
                Our commercial-grade aroma diffusers are built for high-traffic spaces, delivering consistent fragrance with powerful coverage and seamless operation.
              </p>

              <div className="mt-5 sm:mt-8">
                <a
                  href="#gym-diffusers"
                  className="inline-flex items-center gap-2 border border-[#171713] px-5 sm:px-6 py-3 text-[11px] sm:text-xs font-semibold uppercase tracking-[0.18em] text-[#171713] transition-colors hover:bg-[#171713] hover:text-white rounded-sm w-full sm:w-auto justify-center"
                >
                  Explore Diffusers <ArrowRight size={14} />
                </a>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl sm:rounded-2xl bg-[#EFECE6] border border-black/10 shadow-sm">
                <Image
                  src="/images/spaces/gyms-app.png"
                  alt="HUME Gym Aroma Diffuser System"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover object-center"
                />
              </div>
            </div>
          </div>

          {/* 4 Feature Cards Grid (Clean 2-Col Mobile Grid) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {[
              {
                icon: Wind,
                title: "Powerful Coverage",
                desc: "Built for large high-traffic areas.",
              },
              {
                icon: Droplet,
                title: "Long-Lasting Scent",
                desc: "Continuous, uniform fragrance.",
              },
              {
                icon: Sliders,
                title: "Smart Controls",
                desc: "Schedules & intensity timers.",
              },
              {
                icon: VolumeX,
                title: "Quiet Operation",
                desc: "Silent background misting.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex flex-col justify-between rounded-lg sm:rounded-xl border border-black/10 bg-white p-4 sm:p-6 shadow-sm transition-all hover:border-black/25"
              >
                <div>
                  <div className="flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full border border-black/10 bg-[#FAF8F5] text-[#171713] mb-3">
                    <item.icon size={16} className="sm:h-5 sm:w-5" />
                  </div>
                  <h3 className="font-serif text-base sm:text-xl font-light text-[#171713]">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-[11px] sm:text-xs leading-relaxed text-[#66635B]">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: DESIGNED FOR FITNESS SPACES */}
      <section className="bg-[#0D110F] text-white px-4 sm:px-6 lg:px-10 py-12 sm:py-20 border-b border-white/10">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-12 items-center mb-10 sm:mb-14">
            <div className="lg:col-span-6">
              <div className="inline-flex items-center gap-2.5 mb-3 sm:mb-4">
                <span className="text-[9px] sm:text-[10px] font-medium uppercase tracking-[0.26em] text-[#A2B5A7]">
                  DESIGNED FOR FITNESS SPACES
                </span>
                <span className="h-px w-8 sm:w-10 bg-[#A2B5A7]/40" />
              </div>

              <h2 className="font-serif text-2xl sm:text-4xl md:text-5xl font-light leading-tight text-white">
                Perfect for Every Area of Your Gym
              </h2>

              <p className="mt-3 text-xs sm:text-base leading-relaxed text-[#C5D0C8] font-light">
                From reception to workout floor, our aroma diffusers ensure a fresh atmosphere throughout your facility.
              </p>

              <div className="mt-5 sm:mt-8">
                <a
                  href="#gym-products"
                  className="inline-flex items-center gap-2 border border-white/40 px-5 sm:px-6 py-3 text-[11px] sm:text-xs font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:bg-white hover:text-black rounded-sm w-full sm:w-auto justify-center"
                >
                  View Gym Spaces <ArrowRight size={14} />
                </a>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl sm:rounded-2xl border border-white/15 bg-stone-900 shadow-lg">
                <Image
                  src="/images/spaces/gyms-app.png"
                  alt="Modern Fitness Studio Scenting"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover object-center brightness-90"
                />
              </div>
            </div>
          </div>

          {/* 4 Area Cards (Horizontal Swipeable Carousel on Mobile) */}
          <div className="flex overflow-x-auto snap-x snap-mandatory sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 pb-2 scrollbar-none">
            {gymAreas.map((area) => (
              <div
                key={area.title}
                className="w-[72vw] sm:w-auto snap-start shrink-0 group relative overflow-hidden rounded-lg sm:rounded-xl border border-white/15 bg-stone-900 transition-all hover:border-amber-400/50"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-black">
                  <Image
                    src={area.image}
                    alt={area.title}
                    fill
                    sizes="(max-width: 640px) 75vw, 25vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105 opacity-85"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                </div>
                <div className="p-3.5 sm:p-5">
                  <p className="text-[9px] uppercase tracking-[0.16em] text-amber-300 font-medium">{area.subtitle}</p>
                  <h3 className="font-serif text-sm sm:text-lg font-light text-white mt-0.5 leading-snug">
                    {area.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: OUR GYM FRAGRANCES */}
      <section className="bg-[#F8F7F4] text-[#171713] px-4 sm:px-6 lg:px-10 py-12 sm:py-20 border-b border-black/10">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-12 items-center mb-10 sm:mb-14">
            <div className="lg:col-span-5">
              <div className="inline-flex items-center gap-2.5 mb-3 sm:mb-4">
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.26em] text-[#8C7654]">
                  OUR GYM FRAGRANCES
                </span>
                <span className="h-px w-8 sm:w-10 bg-[#8C7654]/40" />
              </div>

              <h2 className="font-serif text-2xl sm:text-4xl md:text-5xl font-light leading-tight text-[#171713]">
                Energising Scents for Active Spaces
              </h2>

              <p className="mt-3 text-xs sm:text-base leading-relaxed text-[#55524B] font-normal">
                Choose from our curated range of fresh, clean and invigorating fragrances for your brand.
              </p>

              <div className="mt-5 sm:mt-8">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center gap-2 border border-[#171713] px-5 sm:px-6 py-3 text-[11px] sm:text-xs font-semibold uppercase tracking-[0.18em] text-[#171713] transition-colors hover:bg-[#171713] hover:text-white rounded-sm w-full sm:w-auto justify-center"
                >
                  Explore Fragrances <ArrowRight size={14} />
                </button>
              </div>
            </div>

            <div className="lg:col-span-7">
              {/* 4 Scent Cards (Horizontal Swipeable Carousel on Mobile) */}
              <div className="flex overflow-x-auto snap-x snap-mandatory sm:grid sm:grid-cols-4 gap-3 sm:gap-4 pb-2 scrollbar-none">
                {gymScents.map((scent) => (
                  <div
                    key={scent.name}
                    className="w-[45vw] sm:w-auto snap-start shrink-0 flex flex-col overflow-hidden rounded-lg sm:rounded-xl border border-black/10 bg-white shadow-sm transition-all hover:border-black/30"
                  >
                    <div className="relative aspect-square w-full overflow-hidden bg-[#EFECE6]">
                      <Image
                        src={scent.image}
                        alt={scent.name}
                        fill
                        sizes="(max-width: 640px) 45vw, 25vw"
                        className="object-cover"
                      />
                    </div>
                    <div className="p-3 sm:p-4 flex flex-1 flex-col justify-between">
                      <div>
                        <h3 className="font-serif text-base sm:text-lg font-light text-[#171713]">
                          {scent.name}
                        </h3>
                        <p className="mt-0.5 text-[9px] sm:text-[10px] uppercase tracking-[0.12em] text-[#8C7654] font-medium">
                          {scent.tags}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: HOW IT WORKS & FINAL CTA */}
      <section className="bg-[#0D110F] text-white px-4 sm:px-6 lg:px-10 py-12 sm:py-20">
        <div className="mx-auto max-w-7xl">
          {/* How It Works Sub-Section */}
          <div className="grid gap-8 lg:grid-cols-12 items-center pb-12 sm:pb-16 border-b border-white/10">
            <div className="hidden lg:block lg:col-span-4">
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl border border-white/15 bg-stone-900 shadow-md">
                <Image
                  src="/images/spaces/commercial-diffuser.png"
                  alt="HUME Scent Machine Setup"
                  fill
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  className="object-cover p-6"
                />
              </div>
            </div>

            <div className="lg:col-span-8">
              <div className="inline-flex items-center gap-2.5 mb-3 sm:mb-4">
                <span className="text-[9px] sm:text-[10px] font-medium uppercase tracking-[0.26em] text-[#A2B5A7]">
                  SIMPLE PROCESS
                </span>
                <span className="h-px w-8 sm:w-10 bg-[#A2B5A7]/40" />
              </div>

              <h2 className="font-serif text-2xl sm:text-4xl font-light text-white">
                How It Works
              </h2>

              <p className="mt-2 text-xs sm:text-sm text-[#C5D0C8]">
                We handle the setup, you focus on your members.
              </p>

              {/* 4 Process Steps (2x2 Grid on Mobile) */}
              <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {[
                  { step: "01", title: "Consultation", desc: "Understand goals & preferences." },
                  { step: "02", title: "Design", desc: "Select optimal gym diffuser system." },
                  { step: "03", title: "Installation", desc: "Quick & professional setup." },
                  { step: "04", title: "Support", desc: "Refills, care & continuous guidance." },
                ].map((s) => (
                  <div key={s.step} className="border-t border-white/20 pt-3">
                    <span className="text-[10px] sm:text-xs font-mono text-amber-300 font-semibold">{s.step}</span>
                    <h3 className="font-serif text-sm sm:text-lg font-light text-white mt-1">{s.title}</h3>
                    <p className="mt-1 text-[11px] sm:text-xs text-white/70 leading-snug">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Final Call to Action Banner */}
          <div className="pt-12 sm:pt-16 text-center max-w-3xl mx-auto">
            <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.3em] text-[#A2B5A7] font-medium">
              LET&apos;S CREATE A FRESHER, STRONGER SPACE
            </span>

            <h2 className="mt-3 font-serif text-3xl sm:text-5xl font-light text-white leading-tight">
              Ready to Elevate Your Gym Experience?
            </h2>

            <p className="mt-3 text-xs sm:text-sm text-white/70 max-w-md mx-auto">
              Get a free consultation and discover the perfect fragrance solution for your space.
            </p>

            <div className="mt-6 sm:mt-8 flex justify-center">
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2.5 rounded-full bg-white px-7 py-3.5 text-[11px] sm:text-xs font-semibold uppercase tracking-[0.18em] text-[#0D110F] hover:bg-stone-200 transition-all shadow-lg w-full sm:w-auto justify-center"
              >
                Get a Free Consultation <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* PRODUCTS CATALOG SECTION */}
      <section id="gym-diffusers" className="bg-[#FAF7F2] text-[#171713] py-16 sm:py-24 border-t border-black/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <div className="mb-8 sm:mb-12 text-center max-w-2xl mx-auto">
            <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.3em] text-black/50">HUME Gym Hardware</p>
            <h2 className="mt-2 font-serif text-2xl sm:text-4xl font-light text-[#171713]">
              Featured Scent Machines &amp; Diffusers
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 max-w-3xl mx-auto">
            {SPACES_PRODUCTS.filter(
              (product) =>
                product.category !== "reed-diffuser" &&
                product.id !== "hume-pro-commercial-tower" &&
                product.id !== "hume-hvac-scenting-system"
            ).map((product) => (
              <SpacesProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* CONSULTATION POPUP MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-2xl bg-[#19231E] border border-white/20 p-5 sm:p-8 text-white shadow-2xl">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-white/60 hover:text-white"
            >
              <X size={20} />
            </button>

            {submitted ? (
              <div className="py-10 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-800 text-white mb-3">
                  <Check size={24} />
                </div>
                <h3 className="font-serif text-2xl font-light">Consultation Requested</h3>
                <p className="mt-2 text-xs text-white/70">Our gym scenting specialist will reach out within 2 hours.</p>
              </div>
            ) : (
              <div>
                <span className="text-[9px] uppercase tracking-[0.2em] text-amber-300 font-medium">HUME Gym Scenting</span>
                <h3 className="mt-1.5 font-serif text-2xl sm:text-3xl font-light">Get a Scenting Consultation</h3>
                <p className="mt-1 text-xs text-white/70">Enter your details and our team will recommend the ideal setup.</p>

                <form onSubmit={handleSubmit} className="mt-5 space-y-3.5">
                  <div>
                    <label className="block text-[9px] uppercase tracking-[0.16em] text-white/60 mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Vikram Sharma"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full rounded-md border border-white/20 bg-white/5 px-3.5 py-2 text-xs text-white placeholder:text-white/30 focus:border-amber-300 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase tracking-[0.16em] text-white/60 mb-1">Gym / Fitness Center Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Gold's Gym / Cult Fitness"
                      value={formData.gymName}
                      onChange={(e) => setFormData({ ...formData, gymName: e.target.value })}
                      className="w-full rounded-md border border-white/20 bg-white/5 px-3.5 py-2 text-xs text-white placeholder:text-white/30 focus:border-amber-300 focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] uppercase tracking-[0.16em] text-white/60 mb-1">Phone Number</label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full rounded-md border border-white/20 bg-white/5 px-3.5 py-2 text-xs text-white placeholder:text-white/30 focus:border-amber-300 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] uppercase tracking-[0.16em] text-white/60 mb-1">City</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Mumbai"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full rounded-md border border-white/20 bg-white/5 px-3.5 py-2 text-xs text-white placeholder:text-white/30 focus:border-amber-300 focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="mt-3 w-full rounded-md bg-white py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#19231E] transition-colors hover:bg-stone-200"
                  >
                    Submit Request &rarr;
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
