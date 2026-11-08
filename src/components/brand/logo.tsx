import { cn } from "@/lib/utils";

// CEDA brand colours, sampled from the logo on ceda.co.bw.
export const CEDA = { brown: "#604038", red: "#a02010", orange: "#f06020", amber: "#f8a018", yellow: "#f8c808" };

function ring(cx: number, cy: number, R: number, r: number) {
  return `M${cx - R} ${cy}A${R} ${R} 0 0 1 ${cx + R} ${cy}L${cx + r} ${cy}A${r} ${r} 0 0 0 ${cx - r} ${cy}Z`;
}

/** CEDA sunrise: a rising sun in bands of red, orange, amber and yellow. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 20" aria-hidden className={cn("h-6 w-[38px]", className)}>
      <defs>
        <linearGradient id="ceda-outer" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={CEDA.red} />
          <stop offset=".55" stopColor={CEDA.orange} />
          <stop offset="1" stopColor={CEDA.amber} />
        </linearGradient>
      </defs>
      <path d={ring(16, 19, 15, 11.2)} fill="url(#ceda-outer)" />
      <path d={ring(16, 19, 10.2, 6.9)} fill={CEDA.amber} />
      <path d="M10 19A6 6 0 0 1 22 19Z" fill={CEDA.yellow} />
    </svg>
  );
}

export function Logo({ className, tone = "dark", sub = true }: { className?: string; tone?: "dark" | "light"; sub?: boolean }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <LogoMark />
      <span className="leading-none">
        <span className={cn("block text-[17px] font-semibold tracking-[0.08em]", tone === "light" ? "text-white" : "text-ceda-brown")}>
          CEDA
        </span>
        {sub && (
          <span className={cn("mt-1 block text-[9px] font-medium uppercase tracking-[0.18em]", tone === "light" ? "text-white/60" : "text-muted-foreground")}>
            Innovation Portal
          </span>
        )}
      </span>
    </span>
  );
}
