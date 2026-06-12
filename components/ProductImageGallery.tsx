"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { X, ZoomIn, ZoomOut } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";
import { withCloudinaryTransforms } from "@/lib/cloudinary";

interface ProductImageGalleryProps {
  images: string[];
  videos?: string[];
  name: string;
}

type GalleryItem =
  | { type: "video"; src: string }
  | { type: "image"; src: string };

const ProductImageGallery = ({ images, videos = [], name }: ProductImageGalleryProps) => {
  const mediaItems: GalleryItem[] = useMemo(
    () => [
      ...videos.map((src) => ({ type: "video" as const, src })),
      ...images.map((src) => ({ type: "image" as const, src })),
    ],
    [images, videos],
  );

  const [api, setApi] = useState<CarouselApi | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedIndexRef = useRef(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const carouselOptions = useMemo(() => ({ loop: true }), []);
  const blurDataURL =
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iNDIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjQyIiBmaWxsPSIjZmZmZmZmIi8+PC9zdmc+";

  useEffect(() => {
    if (!api) {
      return;
    }

    const handleSelect = () => {
      const nextIndex = api.selectedScrollSnap();
      if (selectedIndexRef.current === nextIndex) return;
      selectedIndexRef.current = nextIndex;
      setSelectedIndex(nextIndex);
    };

    api.on("select", handleSelect);
    api.on("reInit", handleSelect);
    handleSelect();

    return () => {
      api.off("select", handleSelect);
      api.off("reInit", handleSelect);
    };
  }, [api]);

  useEffect(() => {
    if (!api || mediaItems.length <= 1 || lightboxIndex !== null) {
      return;
    }

    const intervalId = window.setInterval(() => {
      if (document.visibilityState !== "visible") {
        return;
      }

      api.scrollNext();
    }, 3000);

    return () => window.clearInterval(intervalId);
  }, [api, mediaItems.length, lightboxIndex]);

  const markImageFailed = (src: string) => {
    setFailedImages((current) => {
      const next = new Set(current);
      next.add(src);
      return next;
    });
  };

  const openLightbox = (index: number) => {
    if (mediaItems[index]?.type !== "image") return;
    setLightboxIndex(index);
    setIsZoomed(false);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
    setIsZoomed(false);
  };

  useEffect(() => {
    if (lightboxIndex === null) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeLightbox();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [lightboxIndex]);

  const fallbackImage = (
    <div className="flex h-full w-full items-center justify-center bg-secondary text-center text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
      HUME
    </div>
  );

  const lightboxItem =
    lightboxIndex !== null && mediaItems[lightboxIndex]?.type === "image"
      ? mediaItems[lightboxIndex]
      : null;

  return (
    <div className="space-y-4">
      <Carousel
        setApi={setApi}
        opts={carouselOptions}
        className="w-full"
      >
        <CarouselContent className="-ml-0">
          {mediaItems.map((item, index) => (
            <CarouselItem key={`${item.src}-${index}`} className="pl-0 basis-full">
              <div className="aspect-[3/4] lg:aspect-square bg-background overflow-hidden relative">
                {item.type === "video" ? (
                  <video
                    src={item.src}
                    className="w-full h-full object-cover"
                    controls
                    autoPlay
                    muted
                    loop
                    playsInline
                  />
                ) : failedImages.has(item.src) ? (
                  fallbackImage
                ) : (
                  <button
                    type="button"
                    onClick={() => openLightbox(index)}
                    className="relative h-full w-full cursor-zoom-in"
                    aria-label={`Open ${name} image ${index + 1}`}
                  >
                    <Image
                      src={withCloudinaryTransforms(item.src, { width: 800 })}
                      alt={`${name} - Image ${index + 1}`}
                      fill
                      sizes="(min-width: 1024px) 50vw, 100vw"
                      priority={index === 0}
                      fetchPriority={index === 0 ? "high" : "auto"}
                      className="object-contain"
                      placeholder="blur"
                      blurDataURL={blurDataURL}
                      onError={() => markImageFailed(item.src)}
                    />
                  </button>
                )}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none sm:gap-3">
        {mediaItems.map((item, index) => (
          <button
            key={index}
            onClick={() => api?.scrollTo(index)}
            className={`relative aspect-square w-[calc((100%_-_2rem)/5)] shrink-0 bg-secondary/70 p-1 border transition-all duration-200 sm:h-24 sm:w-24 ${
              selectedIndex === index
                ? "border-foreground"
                : "border-border/60 hover:border-foreground/40"
            }`}
          >
            <div className="relative h-full w-full overflow-hidden border border-border/30">
              {item.type === "video" ? (
                <video
                  src={item.src}
                  className="w-full h-full object-cover"
                  muted
                  playsInline
                />
              ) : failedImages.has(item.src) ? (
                fallbackImage
              ) : (
                <Image
                  src={withCloudinaryTransforms(item.src, { width: 120 })}
                  alt={`${name} thumbnail ${index + 1}`}
                  fill
                  sizes="96px"
                  className="object-contain"
                  placeholder="blur"
                  blurDataURL={blurDataURL}
                  onError={() => markImageFailed(item.src)}
                />
              )}
            </div>
          </button>
        ))}
      </div>

      {lightboxItem ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-3 backdrop-blur-sm md:p-6"
          onClick={closeLightbox}
        >
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              closeLightbox();
            }}
            className="absolute right-3 top-3 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/12 text-white backdrop-blur-md transition hover:bg-white/20 md:right-5 md:top-5"
            aria-label="Close image preview"
          >
            <X size={18} />
          </button>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setIsZoomed((current) => !current);
            }}
            className="absolute left-3 top-3 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/12 text-white backdrop-blur-md transition hover:bg-white/20 md:left-5 md:top-5"
            aria-label={isZoomed ? "Zoom out" : "Zoom in"}
          >
            {isZoomed ? <ZoomOut size={18} /> : <ZoomIn size={18} />}
          </button>

          <div className="h-full w-full overflow-auto" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              onClick={() => setIsZoomed((current) => !current)}
              className={`relative mx-auto block transition-all duration-300 ${
                isZoomed
                  ? "h-[145vh] w-[145vw] cursor-zoom-out"
                  : "h-full max-h-[88vh] w-full max-w-6xl cursor-zoom-in"
              }`}
              aria-label={isZoomed ? "Zoom out image" : "Zoom in image"}
            >
              <Image
                src={withCloudinaryTransforms(lightboxItem.src, {
                  width: isZoomed ? 1800 : 1200,
                })}
                alt={`${name} enlarged image`}
                fill
                sizes={isZoomed ? "145vw" : "100vw"}
                className="object-contain"
                placeholder="blur"
                blurDataURL={blurDataURL}
                priority
                onError={() => markImageFailed(lightboxItem.src)}
              />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ProductImageGallery;
