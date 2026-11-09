import Link from "next/link";
import { BadgeCheck, Briefcase, MapPin } from "lucide-react";
import { formatDate, formatPula } from "@/lib/utils";
import { sectorName } from "@/lib/labels";
import { verifyPath } from "@/lib/certificate";
import type { FundedItem } from "@/lib/funded";

export function FundedCard({ f }: { f: FundedItem }) {
  return (
    <article className="flex flex-col rounded-2xl border border-border bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-3 flex items-start justify-between gap-3">
        <span className="rounded-full bg-ceda-orange/10 px-2.5 py-1 text-xs font-medium text-ceda-orange">{sectorName(f.template?.dataType ?? "")}</span>
        <span className="text-lg font-bold text-ceda-green">{formatPula(f.awardAmount)}</span>
      </div>
      <h3 className="mb-1 font-semibold leading-snug text-ceda-ink">{f.title}</h3>
      <p className="mb-4 text-sm text-muted-foreground">{f.innovator.organizationName ?? "Youth-owned company"}</p>
      <div className="mt-auto space-y-1.5 text-sm text-muted-foreground">
        {f.innovator.district && (
          <p className="flex items-center gap-2"><MapPin className="h-4 w-4 shrink-0" /> {f.innovator.district}</p>
        )}
        {f.jobs && (
          <p className="flex items-center gap-2"><Briefcase className="h-4 w-4 shrink-0" /> {f.jobs} jobs planned in 12 months</p>
        )}
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs">
        <span className="text-muted-foreground">{(f.template?.name ?? "CEDA Innovation Call")} · {formatDate(f.reviewedAt)}</span>
        <Link href={verifyPath(f.referenceCode, f.code)} className="inline-flex items-center gap-1 font-medium text-ceda-orange hover:underline">
          <BadgeCheck className="h-3.5 w-3.5" /> Verified
        </Link>
      </div>
    </article>
  );
}
