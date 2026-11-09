"use client";

import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-lg py-12 text-center">
      <div className="rounded-2xl border border-border bg-white p-8 shadow-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-800">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-bold text-ceda-navy">Unable to load dashboard view</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          A temporary error occurred while loading this section. Please try again.
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
            <RotateCcw className="h-4 w-4" /> Retry
          </button>
          <Link href="/dashboard" className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-ceda-navy hover:bg-ceda-light">
            Dashboard home
          </Link>
        </div>
      </div>
    </div>
  );
}
