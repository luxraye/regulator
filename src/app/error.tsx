"use client";

import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center bg-ceda-light px-4 py-16 text-center">
      <div className="max-w-md rounded-2xl border border-border bg-white p-8 shadow-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-800">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold text-ceda-navy">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We couldn&apos;t load this page right now. Your saved application data is safe.
        </p>
        {error?.digest && (
          <p className="mt-2 font-mono text-xs text-muted-foreground">Ref: {error.digest}</p>
        )}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-ceda-navy px-4 py-2 text-sm font-medium text-white hover:bg-ceda-navy/90"
          >
            <RotateCcw className="h-4 w-4" /> Try again
          </button>
          <Link href="/" className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-ceda-navy hover:bg-ceda-light">
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
