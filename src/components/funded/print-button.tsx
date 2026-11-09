"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 rounded-lg bg-ceda-ink px-4 py-2.5 text-sm font-medium text-white hover:bg-ceda-ink/90"
    >
      <Printer className="h-4 w-4" /> Print or save as PDF
    </button>
  );
}
