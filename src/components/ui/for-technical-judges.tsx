"use client";

import React, { useState } from "react";
import { ChevronDown, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ForTechnicalJudgesProps {
  /** Optional summary label */
  title?: string;
  /** Content to display inside the collapsed technical drawer */
  children: React.ReactNode;
  /** Optional className */
  className?: string;
  /** Default open state */
  defaultOpen?: boolean;
}

/**
 * Collapsible technical details drawer (Phase 12 Human UX requirement).
 * Keeps deep mathematical, cryptographic, AST, or schema details accessible
 * to technical judges without overwhelming everyday visitors.
 */
export function ForTechnicalJudges({
  title = "For technical judges",
  children,
  className,
  defaultOpen = false,
}: ForTechnicalJudgesProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div
      className={cn(
        "rounded-xl border border-dashed border-ceda-copper/30 bg-slate-50/70 p-3 transition",
        isOpen && "border-solid border-ceda-copper/40 bg-slate-50",
        className
      )}
    >
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-2 text-left text-xs font-semibold text-ceda-ink hover:text-ceda-copper transition"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-1.5">
          <Terminal size={14} className="text-ceda-copper" />
          <span className="font-bold">{title}</span>
          <span className="rounded bg-ceda-sand px-1.5 py-0.2 text-[10px] font-medium text-ceda-copper uppercase tracking-wider">
            Technical verification
          </span>
        </span>
        <ChevronDown
          size={14}
          className={cn("text-ceda-slate transition-transform duration-200", isOpen && "rotate-180")}
        />
      </button>

      {isOpen && (
        <div className="mt-3 space-y-2 pt-2 border-t border-border/60 text-xs text-ceda-slate animate-in fade-in duration-150">
          {children}
        </div>
      )}
    </div>
  );
}
