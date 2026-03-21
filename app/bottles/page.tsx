import Image from "next/image";
import { getAllBottles } from "@/lib/db/bottles";
import { formatINR } from "@/lib/currency";

export const metadata = {
  title: "Beautiful Bottles | HUME Perfumes",
  description: "Choose from our curated collection of beautiful perfume bottles.",
};

export default async function BottlesPage() {
  const bottles = await getAllBottles();
  return (
    <div className="min-h-screen bg-background">
      <section className="px-6 md:px-10 lg:px-16 py-16">
        <div className="max-w-5xl mx-auto text-center mb-12">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Collection</p>
          <h1 className="font-serif text-4xl md:text-5xl mt-4">Beautiful Bottles</h1>
          <p className="text-body text-muted-foreground mt-4">
            Select the bottle that matches your mood. Manage bottle entries in the database.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bottles.map((bottle) => (
            <div
              key={bottle.id}
              className="border border-border/60 bg-secondary/10 p-4"
            >
              <Image
                src={bottle.imageUrl}
                alt={bottle.name}
                width={400}
                height={176}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="h-44 w-full object-cover bg-secondary"
              />
              <div className="mt-4 space-y-2">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Bottle {bottle.id}
                </p>
                <h3 className="font-serif text-lg">{bottle.name}</h3>
                <p className="text-sm text-muted-foreground">{formatINR(bottle.price)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
