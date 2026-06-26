"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { DISCOVERY_SET_PATH, DISCOVERY_SET_PRICE } from "@/lib/discovery-set";
import { formatINR } from "@/lib/currency";

const KIT_IMAGES = [
  "/images/15ml/image2.png",
  "/images/15ml/image1.png",
  "/images/15ml/image3.png",
  "/images/15ml/image4.png",
  "/images/15ml/image5.png",
];

const DISCOVERY_IMAGES = [
  "/images/bg/tester2.png",
  "/images/bg/tester_box1.png",
  "/images/bg/tester_box.png",
  "/images/bg/tester3.png",
  "/images/bg/tester4.png",
  "/images/bg/tester1.png",
];

function ImageGalleryTeaser({
  images,
  title,
  href,
}: {
  images: string[];
  title: string;
  href: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = images[activeIndex] ?? images[0];

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % images.length);
    }, 3200);

    return () => window.clearInterval(interval);
  }, [images.length]);

  return (
    <div>
      <Link
        href={href}
        aria-label={title}
        className="relative block aspect-[1.08] overflow-hidden border border-border bg-secondary shadow-[0_18px_48px_rgba(12,14,18,0.08)] min-[400px]:aspect-square"
      >
        <Image
          src={activeImage}
          alt={title}
          fill
          sizes="(max-width: 768px) 92vw, 42vw"
          className="object-cover transition duration-500"
        />
      </Link>

      <div className="mt-2.5 flex gap-1.5 overflow-x-auto pb-1 scrollbar-none min-[400px]:mt-3 min-[400px]:gap-2">
        {images.map((image, index) => (
          <button
            key={image}
            type="button"
            aria-label={`Show ${title} image ${index + 1}`}
            onClick={() => setActiveIndex(index)}
            className={`relative h-11 w-11 shrink-0 overflow-hidden border bg-secondary transition min-[400px]:h-14 min-[400px]:w-14 sm:h-16 sm:w-16 ${
              activeIndex === index
                ? "border-foreground opacity-100 shadow-[0_10px_24px_rgba(12,14,18,0.1)]"
                : "border-border opacity-55 hover:opacity-100"
            }`}
          >
            <Image
              src={image}
              alt={`${title} thumbnail ${index + 1}`}
              fill
              sizes="64px"
              className="object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}

export default function HomeKitDiscoveryTeasers() {
  return (
    <section className="bg-[#f8f7f4] py-10 text-foreground min-[400px]:py-14 md:py-20">
      <div className="mx-auto flex w-full max-w-[620px] flex-col items-center px-4 min-[400px]:px-5 sm:px-8 lg:px-10">
        {/* 15 ml kit hidden for now
        <article className="flex flex-col">
          <Link href="/kit-pack" className="group block">
            <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-[#8d6b32] min-[400px]:text-[10px] min-[400px]:tracking-[0.34em]">
              15 ml perfume rotation
            </p>
            <h2 className="mt-3 font-serif text-[2.55rem] font-light leading-[0.92] tracking-tight min-[400px]:mt-4 min-[400px]:text-[3.1rem] sm:text-[4.3rem]">
              15 ml kit
            </h2>
          </Link>

          <div className="mt-5 min-[400px]:mt-6">
            <ImageGalleryTeaser images={KIT_IMAGES} title="15 ml kit" href="/kit-pack" />
          </div>

          <div className="mt-6 flex flex-wrap items-end gap-x-4 gap-y-3 min-[400px]:mt-7 min-[400px]:gap-x-5">
            <div>
              <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-zinc-500 min-[400px]:text-[9px] min-[400px]:tracking-[0.24em]">
                Kit price
              </p>
              <p className="mt-1 text-2xl font-semibold min-[400px]:text-3xl">{formatINR(999)}</p>
            </div>
            <div className="h-9 w-px bg-zinc-300 min-[400px]:h-10" aria-hidden="true" />
            <div>
              <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-zinc-500 min-[400px]:text-[9px] min-[400px]:tracking-[0.24em]">
                Includes
              </p>
              <p className="mt-1 text-base font-semibold min-[400px]:text-lg">5 x 15ml</p>
            </div>
          </div>

          <Link
            href="/kit-pack"
            className="mt-7 inline-flex h-11 w-fit items-center justify-center bg-[#151515] px-6 text-[9px] font-bold uppercase tracking-[0.18em] text-white transition hover:bg-black min-[400px]:mt-8 min-[400px]:h-12 min-[400px]:px-7 min-[400px]:text-[10px] min-[400px]:tracking-[0.2em]"
          >
            Start building
          </Link>
        </article>
        */}

        <article className="flex flex-col items-center text-center">
          <Link href={DISCOVERY_SET_PATH} className="group block">
            <h2 className="font-serif text-[2.55rem] font-light leading-[0.92] tracking-tight min-[400px]:text-[3.1rem] sm:text-[4.3rem]">
              HUME Discovery Set
            </h2>
          </Link>

          <div className="mt-5 min-[400px]:mt-6 w-full">
            <ImageGalleryTeaser
              images={DISCOVERY_IMAGES}
              title="HUME Discovery Set"
              href={DISCOVERY_SET_PATH}
            />
          </div>

          <p className="mt-6 max-w-[36rem] text-sm leading-6 text-zinc-600 min-[400px]:mt-7 min-[400px]:text-base min-[400px]:leading-7 sm:text-lg">
            A 10-piece tester box for finding the scent that actually works on your skin before
            committing to a full bottle.
          </p>

          <div className="mt-6 flex flex-wrap items-end justify-center gap-x-4 gap-y-3 min-[400px]:mt-7 min-[400px]:gap-x-5">
            <div>
              <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-zinc-500 min-[400px]:text-[9px] min-[400px]:tracking-[0.24em]">
                Launch price
              </p>
              <p className="mt-1 text-2xl font-semibold min-[400px]:text-3xl">{formatINR(DISCOVERY_SET_PRICE)}</p>
            </div>
            <div className="h-9 w-px bg-zinc-300 min-[400px]:h-10" aria-hidden="true" />
            <div>
              <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-zinc-500 min-[400px]:text-[9px] min-[400px]:tracking-[0.24em]">
                Includes
              </p>
              <p className="mt-1 text-base font-semibold min-[400px]:text-lg">10 x 3ml</p>
            </div>
          </div>

          <Link
            href={DISCOVERY_SET_PATH}
            className="mt-7 inline-flex h-11 w-fit items-center justify-center bg-[#151515] px-6 text-[9px] font-bold uppercase tracking-[0.18em] text-white transition hover:bg-black min-[400px]:mt-8 min-[400px]:h-12 min-[400px]:px-7 min-[400px]:text-[10px] min-[400px]:tracking-[0.2em]"
          >
            Choose testers
          </Link>
        </article>
      </div>
    </section>
  );
}
