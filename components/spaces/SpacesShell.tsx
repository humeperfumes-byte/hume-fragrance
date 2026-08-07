import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ArrowUpRight } from "lucide-react";

export function SpacesShell({ children }: { children: React.ReactNode }) {
  return <main className="min-h-screen bg-[#f2efe8] text-[#171713]"><Header />{children}<Footer /></main>;
}

export function SpacesCta({ compact = false }: { compact?: boolean }) {
  return (
    <section className={compact ? "px-5 py-16 md:px-10" : "px-5 py-24 md:px-10 md:py-32"}>
      <div className="mx-auto max-w-7xl bg-[#19231e] px-6 py-14 text-[#f4f0e6] md:px-16 md:py-20">
        <p className="mb-5 text-[10px] uppercase tracking-[.35em] text-[#b9c6bb]">Begin with the space</p>
        <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
          <h2 className="max-w-3xl font-serif text-4xl font-light leading-[.98] md:text-6xl">Tell us what the room should feel like.</h2>
          <Link href="/spaces/selector" className="inline-flex items-center justify-center gap-4 border border-[#d7d1c5]/40 px-6 py-4 text-xs uppercase tracking-[.2em] hover:bg-[#f4f0e6] hover:text-[#19231e]">Plan my space <ArrowUpRight size={15}/></Link>
        </div>
      </div>
    </section>
  );
}
