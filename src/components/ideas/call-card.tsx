import Image from "next/image";
import { CalendarClock, Coins } from "lucide-react";
import { sectorName, stageName, typeLabels } from "@/lib/labels";
import { cn, formatDate, relativeDeadline } from "@/lib/utils";

export interface CallSummary {
  code: string;
  name: string;
  description: string | null;
  dataType?: string | null;
  scale?: string | null;
  closesAt: Date | string;
  fundingSummary: string | null;
}

/** Card for a funding call, with its sector photo. The action slot holds a button or link. */
export function CallCard({ call, action, footer }: { call: CallSummary; action?: React.ReactNode; footer?: React.ReactNode }) {
  const closes = relativeDeadline(call.closesAt);
  const photo = (call.dataType && typeLabels[call.dataType]?.photo) ?? "/images/hero.jpg";
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
      <div className="relative h-36">
        <Image src={photo} alt="" fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ceda-ink/80 to-transparent" />
        <div className="absolute bottom-3 left-4 right-4 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-medium text-ceda-ink">{sectorName(call.dataType ?? "")}</span>
          <span className="rounded-full bg-ceda-amber px-2 py-0.5 text-[11px] font-medium text-ceda-ink">{stageName(call.scale ?? "")} stage</span>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="font-mono text-[11px] text-muted-foreground">{call.code}</p>
        <h3 className="font-semibold text-ceda-ink">{call.name}</h3>
        {call.description && <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">{call.description}</p>}
        <dl className="mt-3 space-y-1.5 text-sm">
          {call.fundingSummary && (
            <div className="flex gap-2">
              <Coins size={15} className="mt-0.5 shrink-0 text-ceda-green" />
              <dd>{call.fundingSummary}</dd>
            </div>
          )}
          <div className="flex gap-2">
            <CalendarClock size={15} className="mt-0.5 shrink-0 text-ceda-orange" />
            <dd>
              Closes {formatDate(call.closesAt)}{" "}
              <span className={cn("text-muted-foreground", closes.soon && "text-amber-700")}>
                ({closes.overdue ? "closed" : closes.text.replace("due ", "")})
              </span>
            </dd>
          </div>
        </dl>
        {footer}
        {action && <div className="mt-auto pt-4">{action}</div>}
      </div>
    </article>
  );
}
