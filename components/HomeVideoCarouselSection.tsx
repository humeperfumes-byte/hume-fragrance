"use client";

import type { PointerEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const videos = [
  {
    title: "Packing",
    caption: "Packed with care before dispatch",
    src: "/videos/packing.mp4",
    poster: "/images/perfume-packaging.png",
  },
  {
    title: "Perfume Unboxing",
    caption: "The first look at your HUME box",
    src: "/videos/perfume%20unboxing.mp4",
    poster: "/images/collection-hero.png",
  },
  {
    title: "Whole Unboxing",
    caption: "From seal to bottle in one ritual",
    src: "/videos/whole_unboxing.mp4",
    poster: "/images/black-perfume.png",
  },
];

export default function HomeVideoCarouselSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isInView, setIsInView] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);
  const swipeStartXRef = useRef<number | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { rootMargin: "240px 0px" },
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (!video) return;
      if (index === activeIndex && isInView) {
        video.currentTime = 0;
        setProgress(0);
        void video.play().catch(() => undefined);
      } else {
        video.pause();
        video.currentTime = 0;
      }
    });
  }, [activeIndex, isInView]);

  const goTo = (index: number) => {
    const nextIndex = (index + videos.length) % videos.length;
    setActiveIndex(nextIndex);
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    swipeStartXRef.current = event.clientX;
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const startX = swipeStartXRef.current;
    swipeStartXRef.current = null;
    if (startX === null) return;

    const deltaX = event.clientX - startX;
    if (Math.abs(deltaX) < 42) return;

    if (deltaX < 0) {
      goTo(activeIndex + 1);
    } else {
      goTo(activeIndex - 1);
    }
  };

  const getRelativeSlot = (index: number) => {
    const total = videos.length;
    const forward = (index - activeIndex + total) % total;
    if (forward === 0) return "active";
    if (forward === 1) return "right";
    if (forward === total - 1) return "left";
    return "hidden";
  };

  const handleTimeUpdate = (index: number) => {
    if (index !== activeIndex || !isInView) return;

    const video = videoRefs.current[index];
    if (!video || !Number.isFinite(video.duration) || video.duration <= 0) return;

    setProgress(Math.min(1, video.currentTime / video.duration));
  };

  return (
    <section
      ref={sectionRef}
      className="overflow-hidden bg-[#080709] py-12 text-white md:py-16"
    >
      <div className="container-luxury">
        <div className="mx-auto mb-8 max-w-3xl text-center md:mb-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-white/45">
            HUME In Motion
          </p>
          <h2 className="mt-4 font-serif text-4xl font-light leading-none tracking-wide md:text-6xl">
            See The Ritual
          </h2>
        </div>

        <div
          className="relative mx-auto flex min-h-[570px] max-w-6xl touch-pan-y select-none items-center justify-center md:min-h-[690px]"
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerCancel={() => {
            swipeStartXRef.current = null;
          }}
        >
          <div className="pointer-events-none absolute inset-x-0 top-1/2 h-[68%] -translate-y-1/2 bg-[radial-gradient(circle_at_50%_35%,rgba(255,255,255,0.13),transparent_35%),linear-gradient(90deg,transparent,rgba(255,255,255,0.04),transparent)]" />
          <div className="pointer-events-none absolute inset-x-6 top-1/2 h-px -translate-y-1/2 bg-white/10" />

          <div className="absolute left-0 top-1/2 z-40 hidden -translate-y-1/2 md:block">
            <button
              type="button"
              onClick={() => goTo(activeIndex - 1)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/[0.08] text-white backdrop-blur-md transition-colors hover:bg-white hover:text-black"
              aria-label="Previous video"
            >
              <ChevronLeft size={18} />
            </button>
          </div>
          <div className="absolute right-0 top-1/2 z-40 hidden -translate-y-1/2 md:block">
            <button
              type="button"
              onClick={() => goTo(activeIndex + 1)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/[0.08] text-white backdrop-blur-md transition-colors hover:bg-white hover:text-black"
              aria-label="Next video"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {videos.map((video, index) => {
            const slot = getRelativeSlot(index);
            const isActive = slot === "active";
            const isSide = slot === "left" || slot === "right";
            const positionClass =
              slot === "active"
                ? "z-30 translate-x-0 scale-100 opacity-100 blur-0"
                : slot === "left"
                  ? "z-20 -translate-x-[106%] scale-[0.98] opacity-70 blur-[1px] md:-translate-x-[52%] md:scale-[0.88] md:opacity-55 md:blur-[3px]"
                  : slot === "right"
                    ? "z-20 translate-x-[106%] scale-[0.98] opacity-70 blur-[1px] md:translate-x-[52%] md:scale-[0.88] md:opacity-55 md:blur-[3px]"
                    : "pointer-events-none z-0 translate-x-0 scale-75 opacity-0 blur-md";

            return (
              <button
                key={`${video.title}-${index}`}
                type="button"
                onClick={() => (isSide ? setActiveIndex(index) : undefined)}
                className={`absolute top-1/2 h-[min(540px,80vh)] w-[min(74vw,300px)] -translate-y-1/2 overflow-hidden rounded-[2rem] border bg-black text-left shadow-[0_35px_90px_rgba(0,0,0,0.55)] transition-all duration-700 ease-out sm:h-[540px] sm:w-[315px] md:h-[590px] md:w-[360px] md:rounded-[2.25rem] ${
                  isActive
                    ? "border-white/45"
                    : "border-white/12"
                } ${positionClass}`}
                aria-label={`${isActive ? "Viewing" : "Open"} ${video.title}`}
                tabIndex={slot === "hidden" ? -1 : 0}
              >
                <video
                  ref={(node) => {
                    videoRefs.current[index] = node;
                  }}
                  className="h-full w-full object-cover"
                  src={video.src}
                  poster={isInView ? video.poster : undefined}
                  muted
                  playsInline
                  autoPlay={isActive && isInView}
                  preload={isActive && isInView ? "metadata" : "none"}
                  onLoadedMetadata={() => handleTimeUpdate(index)}
                  onTimeUpdate={() => handleTimeUpdate(index)}
                  onEnded={() => {
                    if (index === activeIndex && isInView) {
                      goTo(activeIndex + 1);
                    }
                  }}
                />
                <div className="absolute inset-x-0 bottom-0 p-6 [background:linear-gradient(to_top,rgba(0,0,0,0.72),rgba(0,0,0,0))]">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/48">
                    0{index + 1}
                  </p>
                  <h3 className="mt-2 font-serif text-2xl font-light leading-tight text-white md:text-3xl">
                    {video.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-white/68">
                    {video.caption}
                  </p>
                </div>
                {isActive ? (
                  <span className="absolute inset-x-10 bottom-5 h-px overflow-hidden rounded-full bg-white/18">
                    <span
                      className="block h-full origin-left bg-white/80"
                      style={{ transform: `scaleX(${progress})` }}
                    />
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        <div className="mt-2 flex justify-center gap-2 md:mt-0">
          {videos.map((video, index) => (
            <button
              key={video.title}
              type="button"
              onClick={() => goTo(index)}
              className={`h-1.5 rounded-full transition-all ${
                index === activeIndex ? "w-7 bg-white" : "w-1.5 bg-white/25"
              }`}
              aria-label={`Go to video ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
