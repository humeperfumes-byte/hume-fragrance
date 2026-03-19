"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
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
  const mediaItems: GalleryItem[] = [
    ...videos.map((src) => ({ type: "video" as const, src })),
    ...images.map((src) => ({ type: "image" as const, src })),
  ];

  const [api, setApi] = useState<CarouselApi | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const blurDataURL =
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iNDIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjQyIiBmaWxsPSIjZWVlY2VjIi8+PC9zdmc+";

  useEffect(() => {
    if (!api) {
      return;
    }

    const handleSelect = () => {
      setSelectedIndex(api.selectedScrollSnap());
    };

    api.on("select", handleSelect);
    api.on("reInit", handleSelect);
    handleSelect();

    const interval = setInterval(() => {
      api.scrollNext();
    }, 3000);

    return () => {
      api.off("select", handleSelect);
      api.off("reInit", handleSelect);
      clearInterval(interval);
    };
  }, [api]);

  return (
    <div className="space-y-4">
      <Carousel
        setApi={setApi}
        opts={{ loop: true }}
        className="w-full"
      >
        <CarouselContent className="-ml-0">
          {mediaItems.map((item, index) => (
            <CarouselItem key={`${item.src}-${index}`} className="pl-0 basis-full">
              <div className="aspect-[3/4] lg:aspect-square bg-secondary overflow-hidden relative">
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
                ) : (
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
                  />
                )}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
        {mediaItems.map((item, index) => (
          <button
            key={index}
            onClick={() => api?.scrollTo(index)}
            className={`relative shrink-0 h-20 w-20 sm:h-24 sm:w-24 bg-secondary/70 p-1 border transition-all duration-200 ${
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
              ) : (
                <Image
                  src={withCloudinaryTransforms(item.src, { width: 120 })}
                  alt={`${name} thumbnail ${index + 1}`}
                  fill
                  sizes="96px"
                  className="object-contain"
                  placeholder="blur"
                  blurDataURL={blurDataURL}
                />
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProductImageGallery;
