export default function Loading() {
  return (
    <main className="min-h-[70vh] bg-background px-6 py-24 text-center" aria-busy="true">
      <div className="mx-auto mb-6 h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-foreground" aria-hidden="true" />
      <p role="status" className="text-lg">Loading your page…</p>
      <p className="mt-3 text-sm text-muted-foreground">Please wait a moment.</p>
    </main>
  );
}
