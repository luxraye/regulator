"use client";

import React, { useState, useRef, useEffect } from "react";
import { Info, X, ExternalLink, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface InfoTipProps {
  /** One plain sentence explaining this element (written at a 12-year-old reading level) */
  plain: string;
  /** Optional technical line for judges (algorithm, formula, standard, hash method) */
  technical?: string;
  /** Optional documentation or deep-dive link */
  learnMoreUrl?: string;
  /** Optional label for the learn more link */
  learnMoreLabel?: string;
  /** Visual placement of the trigger button */
  className?: string;
  /** Optional custom accessible label */
  ariaLabel?: string;
  /** Size variant */
  size?: "sm" | "md";
}

/**
 * Reusable InfoTip component (Phase 12 Human UX requirement).
 * Positioned in the bottom-right corner of cards, badges, chips, and metrics.
 * Opens on hover or click/tap with full keyboard (Enter/Space/Escape) support.
 */
export function InfoTip({
  plain,
  technical,
  learnMoreUrl,
  learnMoreLabel = "Learn how this works",
  className,
  ariaLabel = "More information about this item",
  size = "sm",
}: InfoTipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showTechnical, setShowTechnical] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Handle escape key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      buttonRef.current?.focus();
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn("relative inline-flex items-center", className)}
      onKeyDown={handleKeyDown}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-label={ariaLabel}
        aria-expanded={isOpen}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        onMouseEnter={() => setIsOpen(true)}
        className={cn(
          "inline-flex items-center justify-center rounded-full text-ceda-slate hover:text-ceda-copper hover:bg-ceda-sand/60 transition-all focus:outline-none focus:ring-2 focus:ring-ceda-orange/40",
          size === "sm" ? "h-4 w-4 text-[10px]" : "h-5 w-5 text-xs"
        )}
      >
        <Info className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} />
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="false"
          className="absolute bottom-full right-0 mb-2 z-50 w-72 rounded-xl border border-ceda-copper/20 bg-white p-3.5 shadow-xl text-left text-xs animate-in fade-in zoom-in-95 duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header & close */}
          <div className="flex items-start justify-between gap-2 pb-1 border-b border-border/50">
            <span className="font-bold text-ceda-copper uppercase tracking-wider text-[10px] flex items-center gap-1">
              <span>Quick info</span>
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded p-0.5 text-ceda-slate hover:text-ceda-ink transition"
              aria-label="Close info"
            >
              <X size={12} />
            </button>
          </div>

          {/* Plain explanation */}
          <p className="mt-2 text-ceda-ink leading-relaxed font-normal">
            {plain}
          </p>

          {/* Optional "For technical judges" drawer */}
          {technical && (
            <div className="mt-2.5 pt-2 border-t border-border/60">
              <button
                type="button"
                onClick={() => setShowTechnical((prev) => !prev)}
                className="flex items-center gap-1 text-[10px] font-semibold text-ceda-copper hover:underline transition"
              >
                <ChevronRight
                  size={12}
                  className={cn("transition-transform duration-200", showTechnical ? "rotate-90" : "")}
                />
                <span>For technical judges</span>
              </button>

              {showTechnical && (
                <div className="mt-1.5 rounded-lg bg-slate-900 p-2 font-mono text-[10px] text-emerald-400 break-all leading-normal border border-slate-800">
                  {technical}
                </div>
              )}
            </div>
          )}

          {/* Optional deep link */}
          {learnMoreUrl && (
            <div className="mt-2 pt-2 border-t border-border/40 text-right">
              <a
                href={learnMoreUrl}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-ceda-copper hover:underline"
              >
                <span>{learnMoreLabel}</span>
                <ExternalLink size={10} />
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
