import type { Metadata } from "next";
import Image from "next/image";
import { Beaker, Clock3, Droplets, Moon, Sparkles, ThermometerSun } from "lucide-react";
import { SITE_URL } from "@/lib/site";
import { PERFUME_MATURATION_PATH } from "@/lib/perfume-maturation";

export const metadata: Metadata = {
  title: "Why Fresh Perfume Needs 2-4 Weeks | HUME Fragrance",
  description:
    "A simple guide to why freshly made perfume can smell sharp after delivery and why resting the bottle for 2-4 weeks helps it settle and last better.",
  alternates: { canonical: `${SITE_URL}${PERFUME_MATURATION_PATH}` },
};

const maturationSteps = [
  {
    week: "Day 1",
    title: "Freshly made",
    body: "Your perfume is new. The perfume oil and alcohol are together, but the bottle has not had much quiet time to settle.",
    icon: Beaker,
  },
  {
    week: "After delivery",
    title: "The bottle has travelled",
    body: "During delivery, the bottle moves, shakes, and sits in different temperatures. This can make the smell feel sharp, flat, or weaker at first.",
    icon: Droplets,
  },
  {
    week: "Weeks 2-3",
    title: "The liquid settles",
    body: "When the bottle rests, the perfume oil and alcohol become more even again. The smell starts feeling smoother and more natural.",
    icon: Sparkles,
  },
  {
    week: "Weeks 3-4",
    title: "It holds better",
    body: "After enough rest, the perfume usually feels deeper, cleaner, and lasts better on skin than it did when it first arrived.",
    icon: Clock3,
  },
];

const careRules = [
  {
    title: "Keep it cool",
    body: "Do not keep it near sunlight, heat, or a window. A drawer or cupboard is perfect.",
    icon: ThermometerSun,
  },
  {
    title: "Keep it dark",
    body: "Keep the bottle inside its box if you can. Darkness helps the perfume stay stable.",
    icon: Moon,
  },
  {
    title: "Let it rest",
    body: "You can test a few sprays, but then close the cap and leave the bottle alone for a couple of weeks.",
    icon: Clock3,
  },
];

export default function PerfumeMaturationPage() {
  return (
    <main className="min-h-screen bg-[#f7f2ec] text-[#17120e]">
      <section className="relative min-h-[92vh] overflow-hidden bg-[#130f0b] text-white">
        <Image
          src="/images/hero-perfume.jpg"
          alt="HUME perfume bottle resting before maturation"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-72"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,8,6,0.92),rgba(11,8,6,0.62)_42%,rgba(11,8,6,0.18))]" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#f7f2ec] to-transparent" />

        <div className="relative mx-auto flex min-h-[92vh] max-w-7xl flex-col justify-end px-5 pb-20 pt-36 sm:px-8 lg:px-12">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.42em] text-[#d9b56b]">
            Freshly Made Perfume
          </p>
          <h1 className="mt-5 max-w-4xl font-serif text-[3.25rem] leading-[0.94] text-white sm:text-[4.8rem] lg:text-[6.2rem]">
            Why your perfume gets better after resting
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-white/72 sm:text-lg">
            A fresh perfume can smell different when it first reaches you. It has just been made, packed, shipped, and shaken during delivery. Let the bottle rest for 2-4 weeks, and the perfume usually becomes smoother, deeper, and longer lasting.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-14 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:px-12 lg:py-20">
        <div>
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.35em] text-[#8d6a2f]">
            Simple explanation
          </p>
          <h2 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">
            Perfume needs rest after travel.
          </h2>
        </div>
        <div className="space-y-5 text-[1.02rem] leading-8 text-[#4a4038]">
          <p>
            Perfume is made from perfume oil and alcohol. When it is fresh, these parts may not feel fully settled yet.
          </p>
          <p>
            Then the bottle travels. It moves in trucks, gets shaken in bags, and goes through heat and cold. Because of this, the perfume can smell a little sharp or weak when it first arrives.
          </p>
          <p className="border-l-2 border-[#b88a3a] pl-5 font-medium text-[#201812]">
            If your new bottle does not last well on day one, do not judge it immediately. It may simply need rest.
          </p>
        </div>
      </section>

      <section className="bg-[#17120e] px-5 py-16 text-white sm:px-8 lg:px-12 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.35em] text-[#d9b56b]">
                2-4 week change
              </p>
              <h2 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">What changes with time</h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-white/52">
              Most fresh perfumes improve after quiet storage. The change is not magic. The liquid simply gets time to settle after being made and delivered.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {maturationSteps.map((step) => (
              <article key={step.week} className="border border-white/10 bg-white/[0.035] p-5">
                <div className="flex items-center justify-between">
                  <span className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-[#d9b56b]">
                    {step.week}
                  </span>
                  <step.icon className="h-5 w-5 text-white/45" />
                </div>
                <h3 className="mt-6 font-serif text-2xl leading-none">{step.title}</h3>
                <p className="mt-4 text-sm leading-6 text-white/58">{step.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[1fr_0.92fr] lg:px-12 lg:py-20">
        <div className="relative min-h-[430px] overflow-hidden bg-[#241a12]">
          <Image
            src="/images/perfume-packaging.png"
            alt="HUME perfume packaging kept for resting"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <p className="absolute bottom-5 left-5 right-5 text-[0.75rem] uppercase tracking-[0.28em] text-white/78">
            Rest the bottle inside the box
          </p>
        </div>

        <div className="flex flex-col justify-center">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.35em] text-[#8d6a2f]">
            First bottle care
          </p>
          <h2 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">What to do when it arrives</h2>
          <div className="mt-8 space-y-4">
            {careRules.map((rule) => (
              <article key={rule.title} className="grid grid-cols-[42px_1fr] gap-4 border-t border-black/10 pt-4">
                <rule.icon className="mt-1 h-5 w-5 text-[#9a7031]" />
                <div>
                  <h3 className="font-semibold text-[#17120e]">{rule.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-[#5b4d42]">{rule.body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-black/10 bg-[#efe4d6] px-5 py-12 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.35em] text-[#8d6a2f]">
              Simple promise
            </p>
            <h2 className="mt-3 font-serif text-4xl leading-tight">Fresh today. Better after rest.</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {["Less sharp smell", "Smoother perfume", "Better lasting"].map((point) => (
              <div key={point} className="border border-black/10 bg-white/45 p-4">
                <p className="text-sm font-medium text-[#211811]">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
