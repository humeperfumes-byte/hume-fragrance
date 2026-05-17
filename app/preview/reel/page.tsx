import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Reel Mockup Preview | HUME",
  robots: {
    index: false,
    follow: false,
  },
};

const REEL_PREVIEW_VIDEO = "/videos/whole_unboxing.mp4";

export default function ReelMockupPreviewPage() {
  return (
    <main className="min-h-screen bg-[#f4f0ea] px-4 py-8 text-foreground">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-8 lg:flex-row lg:items-center lg:justify-center">
        <section className="max-w-sm text-center lg:text-left">
          <p className="mb-3 text-[10px] uppercase tracking-[0.26em] text-muted-foreground">
            Preview Lab
          </p>
          <h1 className="font-serif text-4xl font-light leading-tight md:text-5xl">
            iPhone Reel Mockup
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            This preview uses the uploaded iPhone reel frame with real HUME
            unboxing footage placed behind the transparent screen.
          </p>
        </section>

        <section className="relative w-full max-w-[340px] sm:max-w-[390px] lg:max-w-[430px]">
          <div className="relative aspect-[1024/1536]">
            <div className="absolute left-[9.2%] top-[2.2%] h-[95.5%] w-[81.6%] overflow-hidden rounded-[7%] bg-black">
              <video
                className="h-full w-full object-cover"
                src={REEL_PREVIEW_VIDEO}
                muted
                loop
                autoPlay
                playsInline
                preload="metadata"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.15),transparent_35%,rgba(0,0,0,0.25))]" />
            </div>

            <Image
              src="/images/mockup/iphone_reel_mockup.png"
              alt="iPhone reel mockup"
              fill
              priority
              sizes="(max-width: 640px) 90vw, 430px"
              className="pointer-events-none object-contain"
            />
          </div>
        </section>
      </div>
    </main>
  );
}
