"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { detectGeoRegionClient, getGeoExperience } from "@/lib/geo";
import { withCloudinaryTransforms } from "@/lib/cloudinary";
import type { HeroSlide } from "@/lib/db/images";
import { useSiteControls } from "@/hooks/use-site-controls";

const fallbackSlides = [
  {
    url: "/images/collection-hero.png",
    label: "HUME collection",
    link: "/shop",
  },
  {
    url: "/images/hero-perfume.jpg",
    label: "HUME luxury perfume",
    link: "/shop",
  },
  { url: "/images/hero-perfume.jpg", label: "HUME offers", link: "/shop" },
];

const trustPoints = [
  "24h dispatch",
  "Free delivery over INR 500",
  "UPI/cards",
  "WhatsApp support",
];

const Hero = ({
  initialSlides = fallbackSlides,
}: {
  initialSlides?: HeroSlide[];
}) => {
  const geoCopy = getGeoExperience(detectGeoRegionClient());
  const settings = useSiteControls();
  const rotatingOffers = geoCopy.offers;
  const [api, setApi] = useState<CarouselApi | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [slides] = useState(
    initialSlides.length > 0 ? initialSlides : fallbackSlides,
  );
  const [offerIndex, setOfferIndex] = useState(0);
  const slideCount = slides.length;

  useEffect(() => {
    if (!api) {
      return;
    }

    const handleSelect = () => {
      setSelectedIndex(api.selectedScrollSnap());
    };

    api.on("select", handleSelect);
    api.on("reInit", handleSelect);
    requestAnimationFrame(handleSelect);

    const interval = setInterval(() => {
      api.scrollNext();
    }, 3000);

    return () => {
      api.off("select", handleSelect);
      api.off("reInit", handleSelect);
      clearInterval(interval);
    };
  }, [api]);

  useEffect(() => {
    const interval = setInterval(() => {
      setOfferIndex((current) => (current + 1) % rotatingOffers.length);
    }, 2600);
    return () => clearInterval(interval);
  }, [rotatingOffers.length]);

  return (
    <section className="min-h-screen flex items-center pt-20 md:pt-36">
      <div className="container-luxury w-full">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="order-2 text-center lg:order-1 lg:text-left"
          >
            <p className="text-caption text-muted-foreground/80 mb-4 tracking-[0.28em] uppercase">
              Luxury-inspired perfumes
            </p>
            <h1 className="font-serif text-[3rem] leading-[0.98] md:text-[4.8rem] md:leading-[0.94] mb-6">
              Smell premium
              <br />
              <span className="italic font-light">without designer prices</span>
            </h1>
            <p className="mx-auto max-w-xl text-body leading-relaxed text-muted-foreground lg:mx-0">
              Long-lasting EDPs inspired by iconic fragrance profiles, made for
              daily wear, gifting, dates, office, and compliments.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Link
                href="/bestseller"
                className="inline-flex items-center justify-center bg-foreground px-8 py-4 text-[11px] uppercase tracking-[0.24em] text-background transition-opacity hover:opacity-90"
              >
                Shop Best Sellers
              </Link>
              <Link
                href="/shop"
                className="inline-flex items-center justify-center border border-foreground px-8 py-4 text-[11px] uppercase tracking-[0.24em] text-foreground transition-colors hover:bg-foreground hover:text-background"
              >
                Shop All Perfumes
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground lg:justify-start">
              {trustPoints.map((point, index) => (
                <span key={point} className="inline-flex items-center gap-3">
                  {index > 0 && (
                    <span
                      className="hidden h-1 w-1 rounded-full bg-border sm:inline-block"
                      aria-hidden="true"
                    />
                  )}
                  <span>{point}</span>
                </span>
              ))}
            </div>

            <div className="mt-6 max-w-xl border border-border/70 bg-secondary/20 px-5 py-4 text-center shadow-[0_10px_24px_rgba(0,0,0,0.06)] lg:text-left">
              <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                Live offer
              </p>
              <motion.p
                key={offerIndex}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="mt-2 font-serif text-[1.45rem] leading-tight md:text-[1.75rem]"
              >
                {rotatingOffers[offerIndex]}
              </motion.p>
              <p className="mt-2 text-sm text-muted-foreground">
                {settings.heroOfferText}
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="order-1 -mx-6 sm:mx-0 lg:order-2"
          >
            <Carousel
              setApi={setApi}
              opts={{ loop: true }}
              className="w-screen sm:w-full"
            >
              <CarouselContent className="-ml-0">
                {slides.map((slide, index) => {
                  const isLcpCandidate = index === 0;
                  const optimizedSlideUrl = withCloudinaryTransforms(
                    slide.url,
                    {
                      width: isLcpCandidate ? 760 : 680,
                    },
                  );
                  return (
                    <CarouselItem
                      key={`${slide.url}-${index}`}
                      className="pl-0"
                    >
                      <div className="relative w-full aspect-square">
                        {slide.link?.startsWith("http") ? (
                          <a
                            href={slide.link}
                            className="block w-full h-full"
                            target="_blank"
                            rel="noreferrer"
                          >
                            <Image
                              src={optimizedSlideUrl}
                              alt={slide.label}
                              fill
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 50vw"
                              className="object-cover"
                              loading={isLcpCandidate ? "eager" : "lazy"}
                              fetchPriority={isLcpCandidate ? "high" : "auto"}
                              priority={isLcpCandidate}
                              quality={55}
                            />
                          </a>
                        ) : (
                          <Link
                            href={slide.link ?? "/shop"}
                            className="block w-full h-full"
                          >
                            <Image
                              src={optimizedSlideUrl}
                              alt={slide.label}
                              fill
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 50vw"
                              className="object-cover"
                              loading={isLcpCandidate ? "eager" : "lazy"}
                              fetchPriority={isLcpCandidate ? "high" : "auto"}
                              priority={isLcpCandidate}
                              quality={55}
                            />
                          </Link>
                        )}
                      </div>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
            </Carousel>
            <div className="mt-4 flex items-center justify-center gap-3 sm:justify-center">
              {Array.from({ length: slideCount }).map((_, index) => (
                <button
                  key={`hero-dot-${index}`}
                  type="button"
                  aria-label={`Go to slide ${index + 1}`}
                  aria-current={selectedIndex === index}
                  onClick={() => api?.scrollTo(index)}
                  className="group flex items-center"
                >
                  <span className="relative h-px w-10 overflow-hidden bg-foreground/20">
                    <span
                      className={`absolute inset-0 origin-left bg-foreground transition-transform duration-[2000ms] ${
                        selectedIndex === index ? "scale-x-100" : "scale-x-0"
                      }`}
                    />
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
