import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
      <section className="max-w-md text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
          Page Not Found
        </p>
        <h1 className="mt-4 font-serif text-4xl font-light md:text-5xl">
          This scent trail faded.
        </h1>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          The page you opened is no longer available. Continue shopping from the
          current HUME collection.
        </p>
        <Link
          href="/shop"
          className="mt-8 inline-flex h-11 items-center justify-center rounded-full bg-foreground px-6 text-sm font-semibold text-background transition-opacity hover:opacity-85"
        >
          Shop Perfumes
        </Link>
      </section>
    </main>
  );
}
