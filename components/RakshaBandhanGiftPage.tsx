"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Check, ChevronRight, Gift, Heart, PackageCheck, ShieldCheck, ShoppingBag, Sparkles } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatINR } from "@/lib/currency";

const rakhiStyles = [
  { id: "classic", name: "Classic Pearl", image: "/images/rakhi/floating-rakhi-3.png", fit: "object-contain" },
  { id: "royal", name: "Royal Festive", image: "/images/rakhi/floating-rakhi-1.png", fit: "object-contain" },
  { id: "minimal", name: "Minimal Thread", image: "/images/rakhi/floating-rakhi-2.png", fit: "object-contain" },
  { id: "handcrafted", name: "Handcrafted Pearl", image: "/images/occasions/rakhi.png", fit: "object-cover" },
] as const;

const boxes = [
  { id: "him-one", recipient: "Him", perfumeCount: 1, price: 1299, eyebrow: "A signature for him" },
  { id: "her-one", recipient: "Her", perfumeCount: 1, price: 1299, eyebrow: "A signature for her" },
  { id: "him-two", recipient: "Him", perfumeCount: 2, price: 1999, eyebrow: "His fragrance wardrobe" },
  { id: "her-two", recipient: "Her", perfumeCount: 2, price: 1999, eyebrow: "Her fragrance wardrobe" },
] as const;

function FloatingRakhis() {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) return null;

  const floatingRakhis = [
    { src: "/images/rakhi/floating-rakhi-1.png", duration: 21, delay: 0, width: "w-[25rem] md:w-[38rem]" },
    { src: "/images/rakhi/floating-rakhi-2.png", duration: 25, delay: 7, width: "w-[22rem] md:w-[34rem]" },
    { src: "/images/rakhi/floating-rakhi-3.png", duration: 23, delay: 14, width: "w-[24rem] md:w-[36rem]" },
  ];

  return (
    <div className="pointer-events-none fixed inset-0 z-30 overflow-hidden" aria-hidden="true">
      {floatingRakhis.map((rakhi, index) => (
        <motion.div
          key={rakhi.src}
          className="absolute left-0 top-0"
          initial={{ x: "115vw", y: `${-22 - index * 8}vh`, rotate: -12 + index * 10, opacity: 0 }}
          animate={{
            x: ["115vw", "82vw", "52vw", "18vw", "-48vw"],
            y: [`${-22 - index * 8}vh`, "8vh", "42vh", "70vh", `${112 + index * 7}vh`],
            rotate: [-12 + index * 10, 7, -8, 12, -5],
            scale: [0.82, 1, 0.93, 1.04, 0.86],
            opacity: [0, 0.68, 0.62, 0.7, 0],
          }}
          transition={{
            duration: rakhi.duration,
            delay: rakhi.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <Image
            src={rakhi.src}
            alt=""
            width={1536}
            height={1024}
            sizes="(max-width: 768px) 400px, 610px"
            className={`${rakhi.width} h-auto object-contain drop-shadow-[0_12px_18px_rgba(67,14,25,.18)]`}
          />
        </motion.div>
      ))}
    </div>
  );
}

export default function RakshaBandhanGiftPage() {
  const { addItem, setIsCartOpen } = useCart();
  const [selectedRakhi, setSelectedRakhi] = useState<(typeof rakhiStyles)[number]>(rakhiStyles[0]);
  const [addedId, setAddedId] = useState<string | null>(null);

  const addBox = (box: (typeof boxes)[number]) => {
    addItem({
      id: `raksha-bandhan-${box.id}-${selectedRakhi.id}`,
      name: `Raksha Bandhan Box for ${box.recipient}`,
      inspiration: `${box.perfumeCount} curated perfume${box.perfumeCount > 1 ? "s" : ""} + Gulab Jal + ${selectedRakhi.name} Rakhi`,
      category: "raksha-bandhan-gift",
      image: "/images/occasions/rakhi.png",
      price: box.price,
      size: box.perfumeCount === 1 ? "Essential Gift Box" : "Grand Gift Box",
      kitSelections: [
        ...Array.from({ length: box.perfumeCount }, (_, index) => ({
          id: `${box.id}-perfume-${index + 1}`,
          name: `HUME curated perfume ${index + 1} for ${box.recipient.toLowerCase()}`,
        })),
        { id: "pure-gulab-jal", name: "HUME Pure Gulab Jal" },
        { id: `rakhi-${selectedRakhi.id}`, name: `${selectedRakhi.name} Rakhi` },
      ],
    });
    setAddedId(box.id);
    window.setTimeout(() => setAddedId(null), 1800);
    setIsCartOpen(true);
  };

  return (
    <>
      <FloatingRakhis />
      <section className="relative min-h-[760px] overflow-hidden bg-[#711d2a] text-[#fff8ed] md:min-h-[820px]">
        <video autoPlay muted loop playsInline preload="metadata" poster="/images/occasions/rakhi.png" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover object-center opacity-65">
          <source src="/videos/raksha-bandhan-hero.mp4?v=final-18" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(69,11,23,.94)_0%,rgba(88,15,29,.76)_43%,rgba(88,15,29,.12)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#fff9f0] to-transparent" />
        <div className="relative mx-auto flex min-h-[760px] max-w-7xl items-center px-5 pb-24 pt-36 sm:px-8 md:min-h-[820px] md:pt-44 lg:px-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 border border-[#f5d69b]/35 bg-black/10 px-4 py-2 text-[10px] font-semibold uppercase tracking-[.3em] text-[#f8d998] backdrop-blur-sm">
              <Sparkles size={13} /> Raksha Bandhan Edit
            </div>
            <h1 className="mt-7 font-serif text-6xl font-light leading-[.88] sm:text-7xl lg:text-[6.8rem]">
              A thread of love.<br /><em className="text-[#f2d08f]">A scent to remember.</em>
            </h1>
            <p className="mt-7 max-w-xl text-sm leading-7 text-white/75 sm:text-base">
              Gift a HUME perfume ritual with pure Gulab Jal and a Rakhi chosen by you—beautifully brought together for him or for her.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a href="#gift-boxes" className="inline-flex items-center gap-3 bg-[#fff8ed] px-6 py-4 text-xs font-bold uppercase tracking-[.18em] text-[#651724] transition-transform hover:-translate-y-0.5">
                Choose a box <ChevronRight size={15} />
              </a>
              <span className="px-2 text-xs text-white/65">Gift boxes from {formatINR(1299)}</span>
            </div>
            <div className="mt-10 grid max-w-xl grid-cols-3 gap-3 border-t border-white/20 pt-5 text-[10px] uppercase tracking-[.16em] text-white/60">
              <span>Him & Her edits</span><span>Rakhi of your choice</span><span>Gift-ready box</span>
            </div>
          </div>
        </div>
      </section>

      <section id="gift-boxes" className="scroll-mt-24 bg-[#f3e7d7] px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {rakhiStyles.map((rakhi) => {
              const selected = selectedRakhi.id === rakhi.id;
              return <button key={rakhi.id} type="button" aria-label={`Choose ${rakhi.name} Rakhi`} onClick={() => setSelectedRakhi(rakhi)} className={`relative aspect-square overflow-hidden border bg-white transition-all ${selected ? "border-[#711d2a] shadow-[0_12px_30px_rgba(85,25,35,.12)]" : "border-[#7d2634]/15 opacity-80 hover:border-[#711d2a]/60 hover:opacity-100"}`}>
                <Image src={rakhi.image} alt="" fill sizes="(max-width: 768px) 50vw, 25vw" className={`${rakhi.fit} p-2`} />
                {selected ? <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[#711d2a] text-white"><Check size={12}/></span> : null}
              </button>;
            })}
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-2">
            {boxes.map((box) => <article key={box.id} className="group overflow-hidden border border-[#7d2634]/15 bg-[#fffaf3]">
              <div className={`relative aspect-square overflow-hidden ${box.recipient === "Him" ? "bg-[#1f3738]" : "bg-[#7c3348]"}`}>
                <Image src={box.recipient === "Him" ? "/images/perfume-4.jpg" : "/images/perfume-2.jpg"} alt={`Raksha Bandhan fragrance gift box for ${box.recipient.toLowerCase()}`} fill sizes="(max-width:768px) 100vw,50vw" className="object-cover opacity-55 transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                <div className="absolute bottom-5 left-5 text-white"><p className="text-[9px] uppercase tracking-[.28em] text-white/65">{box.eyebrow}</p><h3 className="mt-2 font-serif text-4xl font-light">For {box.recipient}</h3></div>
                <span className="absolute right-4 top-4 border border-white/25 bg-black/20 px-3 py-2 text-[10px] font-semibold uppercase tracking-[.18em] text-white backdrop-blur-md">{box.perfumeCount === 1 ? "Essential" : "Grand"} box</span>
              </div>
              <div className="p-6 sm:p-7">
                <ul className="space-y-3 text-sm text-[#60494c]">
                  <li className="flex gap-3"><Check size={16} className="mt-0.5 shrink-0 text-[#9d3141]"/> {box.perfumeCount} HUME-curated full-size perfume{box.perfumeCount > 1 ? "s" : ""} for {box.recipient.toLowerCase()}</li>
                  <li className="flex gap-3"><Check size={16} className="mt-0.5 shrink-0 text-[#9d3141]"/> HUME Pure Gulab Jal</li>
                  <li className="flex gap-3"><Check size={16} className="mt-0.5 shrink-0 text-[#9d3141]"/> {selectedRakhi.name} Rakhi</li>
                  <li className="flex gap-3"><Check size={16} className="mt-0.5 shrink-0 text-[#9d3141]"/> Raksha Bandhan gift presentation</li>
                </ul>
                <div className="mt-7 flex items-center justify-between border-t border-[#7d2634]/15 pt-5"><div><p className="text-[9px] uppercase tracking-[.2em] text-[#806b6d]">Box price</p><p className="mt-1 font-serif text-3xl text-[#361319]">{formatINR(box.price)}</p></div><button type="button" onClick={() => addBox(box)} className="inline-flex items-center gap-2 bg-[#711d2a] px-5 py-3.5 text-[10px] font-bold uppercase tracking-[.16em] text-white hover:bg-[#58131f]">{addedId === box.id ? <><Check size={14}/> Added</> : <><ShoppingBag size={14}/> Add box</>}</button></div>
              </div>
            </article>)}
          </div>
          <p className="mt-5 text-xs leading-6 text-[#806b6d]">The final HUME perfume lineup for each Him and Her edit will be confirmed by HUME before fulfilment. Product imagery is representative.</p>
        </div>
      </section>

      <section className="bg-[#fff9f0] px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-[.9fr_1.1fr] lg:gap-20">
            <div className="relative aspect-[4/5] overflow-hidden bg-[#ead6c5]">
              <Image src="/images/perfume-packaging.png" alt="HUME perfume gift packaging" fill sizes="(max-width:1024px) 100vw,45vw" className="object-cover" />
              <div className="absolute bottom-5 left-5 right-5 border border-white/30 bg-[#5b1723]/90 p-5 text-white backdrop-blur-md">
                <p className="text-[10px] uppercase tracking-[.28em] text-[#f1d09a]">Inside every box</p>
                <p className="mt-2 font-serif text-2xl">Perfume · Gulab Jal · Rakhi</p>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.32em] text-[#9a6a28]">Three rituals, one gift</p>
              <h2 className="mt-5 font-serif text-5xl font-light leading-[.95] text-[#361319] sm:text-6xl">More personal than another ordinary gift.</h2>
              <p className="mt-6 max-w-xl text-sm leading-7 text-[#624a4d]">A fragrance chosen around him or her, pure rose water for a refreshing everyday ritual, and a Rakhi that carries the emotion of the festival.</p>
              <div className="mt-9 grid gap-3 sm:grid-cols-3">
                {[[Gift,"Curated perfume","Selected by HUME for the recipient"],[Heart,"Pure Gulab Jal","A refreshing rose-water ritual"],[Sparkles,"Chosen Rakhi","Pick the style that feels right"]].map(([Icon,title,copy]) => {
                  const IconComponent = Icon as typeof Gift;
                  return <article key={String(title)} className="border border-[#7d2634]/15 bg-white p-5"><IconComponent size={20} className="text-[#9d3141]"/><h3 className="mt-4 text-sm font-semibold text-[#361319]">{String(title)}</h3><p className="mt-2 text-xs leading-5 text-[#765f62]">{String(copy)}</p></article>;
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#42121b] px-5 py-20 text-[#fff8ed] sm:px-8 lg:px-10 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_.8fr] lg:items-center">
          <div><p className="text-[10px] uppercase tracking-[.3em] text-[#e9c783]">Made for the moment</p><h2 className="mt-5 max-w-3xl font-serif text-5xl font-light leading-[.95] sm:text-6xl">Wrapped beautifully. Remembered long after Rakhi.</h2></div>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">{[[PackageCheck,"Gift-ready presentation"],[ShieldCheck,"Secure HUME checkout"],[Heart,"Chosen with intention"]].map(([Icon,label]) => { const I=Icon as typeof Gift; return <div key={String(label)} className="flex items-center gap-3 border border-white/15 p-4 text-sm text-white/75"><I size={18} className="text-[#e9c783]"/>{String(label)}</div>; })}</div>
        </div>
      </section>

      <section className="bg-[#fff9f0] px-5 py-20 sm:px-8 lg:px-10 lg:py-24">
        <div className="mx-auto max-w-4xl"><p className="text-center text-[10px] font-bold uppercase tracking-[.32em] text-[#9a6a28]">Questions, answered</p><h2 className="mt-4 text-center font-serif text-5xl font-light text-[#361319]">Raksha Bandhan gifting FAQ</h2><div className="mt-9 space-y-3">{[
          ["What are the four gift box options?","Choose an Essential box for Him or Her with one perfume at INR 1,299, or a Grand box for Him or Her with two perfumes at INR 1,999. Every box also includes HUME Pure Gulab Jal and your chosen Rakhi."],
          ["Can I choose the Rakhi?","Yes. Select one of the available Rakhi styles before adding a Him or Her box to your bag. Your selection is saved with the gift box."],
          ["Can I choose the perfumes?","The Him and Her fragrance edits are curated by HUME. The final perfume lineup will be confirmed before fulfilment; the page does not currently offer individual fragrance selection."],
          ["Is the box ready for gifting?","Yes. Each set is positioned as a Raksha Bandhan gift presentation, bringing the perfume, Gulab Jal and Rakhi together in one box."],
        ].map(([q,a]) => <details key={q} className="border border-[#7d2634]/15 bg-white p-5"><summary className="cursor-pointer font-semibold text-[#361319]">{q}</summary><p className="mt-3 text-sm leading-7 text-[#715b5e]">{a}</p></details>)}</div><div className="mt-10 text-center"><Link href="/contact" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[.17em] text-[#711d2a] underline underline-offset-8">Need help choosing? Contact HUME <ChevronRight size={14}/></Link></div></div>
      </section>
    </>
  );
}
