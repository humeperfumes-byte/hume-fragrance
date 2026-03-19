"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";
import { detectGeoRegionClient, getGeoExperience } from "@/lib/geo";
import { withCloudinaryTransforms } from "@/lib/cloudinary";

const fallbackSlides = [
  { url: "/images/collection-hero.jpg", label: "HUME collection", link: "/shop" },
  { url: "/images/hero-perfume.jpg", label: "HUME luxury perfume", link: "/shop" },
  { url: "/images/hero-perfume.jpg", label: "HUME offers", link: "/shop" },
];
const Hero = () => {
  const geoCopy = getGeoExperience(detectGeoRegionClient());
  const rotatingOffers = geoCopy.offers;
  const [api, setApi] = useState<CarouselApi | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [slideCount, setSlideCount] = useState(fallbackSlides.length);
  const [slides, setSlides] = useState(fallbackSlides);
  const [offerIndex, setOfferIndex] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }

    setSlideCount(api.scrollSnapList().length);
    setSelectedIndex(api.selectedScrollSnap());

    const handleSelect = () => {
      setSelectedIndex(api.selectedScrollSnap());
    };

    api.on("select", handleSelect);
    api.on("reInit", handleSelect);

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
    let active = true;
    const loadSlides = async () => {
      try {
        const response = await fetch("/api/images?usage=hero");
        if (!response.ok) {
          throw new Error("Failed to load hero slides");
        }
        const data = (await response.json()) as { url: string; label: string; link?: string }[];
        if (active && Array.isArray(data) && data.length > 0) {
          const mapped = data.map((item) => ({
            url: item.url,
            label: item.label ?? "HUME offer",
            link: item.link ?? "/shop",
          }));
          setSlides(mapped);
          setSlideCount(mapped.length);
        }
      } catch (error) {
        console.error("Failed to load hero slides:", error);
      }
    };

    loadSlides();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setOfferIndex((current) => (current + 1) % rotatingOffers.length);
    }, 2600);
    return () => clearInterval(interval);
  }, [rotatingOffers.length]);

  return (
    <section className="min-h-screen flex items-center pt-24">
      <div className="container-luxury w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="order-2 lg:order-1 text-center"
          >
            <p className="text-caption text-muted-foreground/80 mb-4 tracking-[0.28em] uppercase">
              The Art of Impression
            </p>
            <h1 className="font-serif text-[3.2rem] leading-[0.95] md:text-[5.1rem] md:leading-[0.92] mb-8">
              Luxury
              <br />
              <span className="italic font-light">Reimagined</span>
            </h1>
            <p className="hidden md:block mt-7 text-body text-muted-foreground max-w-lg mx-auto">
              {geoCopy.heroBody}
            </p>

            <div className="mx-auto max-w-lg border border-border/70 bg-background/90 px-6 py-6 shadow-[0_10px_24px_rgba(0,0,0,0.08)]">
              <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground mb-3">
                Limited Edition
              </p>
              <div className="mb-5 min-h-[3.9rem] md:min-h-[4.5rem]">
                <motion.p
                  key={offerIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                  className="font-serif italic text-[1.85rem] leading-tight md:text-[2.25rem]"
                >
                  {rotatingOffers[offerIndex]}
                </motion.p>
              </div>
              <Link
                href="/shop"
                className="inline-flex w-full items-center justify-center bg-foreground px-8 py-3.5 text-[11px] uppercase tracking-[0.28em] text-background hover:opacity-90 transition-opacity"
              >
                Shop The Collection
              </Link>
            </div>

            
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="order-1 lg:order-2 -mx-6 sm:mx-0"
          >
            <Carousel
              setApi={setApi}
              opts={{ loop: true }}
              className="w-screen sm:w-full"
            >
              <CarouselContent className="-ml-0">
                {slides.map((slide, index) => {
                  const isLcpCandidate = index === 0 || slide.url.includes("collection-hero.jpg");
                  const optimizedSlideUrl = withCloudinaryTransforms(slide.url, { width: 900 });
                  return (
                    <CarouselItem key={`${slide.url}-${index}`} className="pl-0">
                      <div className="relative w-full aspect-square">
                        {slide.link?.startsWith("http") ? (
                          <a href={slide.link} className="block w-full h-full" target="_blank" rel="noreferrer">
                            <Image
                              src={optimizedSlideUrl}
                              alt={slide.label}
                              fill
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 50vw"
                              className="object-cover"
                              loading={isLcpCandidate ? "eager" : "lazy"}
                              fetchPriority={isLcpCandidate ? "high" : "auto"}
                              priority={isLcpCandidate}
                              quality={60}
                            />
                          </a>
                        ) : (
                          <Link href={slide.link ?? "/shop"} className="block w-full h-full">
                            <Image
                              src={optimizedSlideUrl}
                              alt={slide.label}
                              fill
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 50vw"
                              className="object-cover"
                              loading={isLcpCandidate ? "eager" : "lazy"}
                              fetchPriority={isLcpCandidate ? "high" : "auto"}
                              priority={isLcpCandidate}
                              quality={60}
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
