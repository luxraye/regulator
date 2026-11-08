import { cn } from "@/lib/utils";

/** Three rising bars: growing citizen-owned ventures. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={cn("h-6 w-6", className)}>
      <rect x="2" y="13" width="5" height="9" rx="1.5" className="fill-ceda-green" />
      <rect x="9.5" y="8" width="5" height="14" rx="1.5" className="fill-ceda-amber" />
      <rect x="17" y="2" width="5" height="20" rx="1.5" className="fill-ceda-blue" />
    </svg>
  );
}

export function Logo({ className, tone = "dark", sub = true }: { className?: string; tone?: "dark" | "light"; sub?: boolean }) {
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <LogoMark />
      <span className="leading-tight">
        <span className={cn("block text-sm font-bold tracking-tight", tone === "light" ? "text-white" : "text-ceda-navy")}>
          CEDA Innovation Portal
        </span>
        {sub && (
          <span className={cn("block text-[10px]", tone === "light" ? "text-white/60" : "text-muted-foreground")}>
            Citizen Entrepreneurial Development Agency
          </span>
        )}
      </span>
    </span>
  );
}
