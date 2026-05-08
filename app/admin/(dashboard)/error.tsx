"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin panel error:", error);
  }, [error]);

  const isDbError =
    error.message?.includes("does not exist") ||
    error.message?.includes("Failed query") ||
    error.message?.includes("NeonDbError") ||
    error.message?.includes("connection");

  return (
    <div className="mx-auto max-w-2xl px-6 py-20">
      <div className="rounded-3xl border border-red-500/20 bg-red-500/[0.04] p-10 text-center backdrop-blur-xl">
        <AlertTriangle className="mx-auto h-10 w-10 text-red-400" />
        <h2 className="mt-6 text-xl font-semibold text-white">
          {isDbError ? "Database Schema Out of Sync" : "Something went wrong"}
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-white/50">
          {isDbError ? (
            <>
              Your local code expects database columns that don&apos;t exist yet in Neon.
              Open your terminal and run:{" "}
              <code className="inline-block mt-2 rounded bg-white/10 px-3 py-1.5 text-xs text-white font-mono">
                npm run db:push
              </code>
              <br />
              Then click the button below to retry.
            </>
          ) : (
            <>
              An unexpected error occurred while loading this page.
              <br />
              <span className="mt-2 inline-block text-xs text-white/30 font-mono break-all">
                {error.message?.slice(0, 200)}
              </span>
            </>
          )}
        </p>
        <button
          onClick={reset}
          className="mt-8 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white/[0.1]"
        >
          <RefreshCcw className="h-4 w-4" />
          Try Again
        </button>
      </div>
    </div>
  );
}
