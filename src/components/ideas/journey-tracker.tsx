import { Check, X } from "lucide-react";
import { JOURNEY } from "@/lib/labels";
import { cn } from "@/lib/utils";

/** Index of the journey stage an idea is in (0 Submission … 4 Award). */
export function stageIndex(status: string): number {
  const i = JOURNEY.findIndex((s) => (s.statuses as readonly string[]).includes(status));
  return i < 0 ? 0 : i;
}

/** Submission → Review → Feedback → Approval → Award, with the current stage lit. */
export function JourneyTracker({ status, compact = false }: { status: string; compact?: boolean }) {
  const current = stageIndex(status);
  const rejected = status === "REJECTED";
  const flagged = status === "FLAGGED";
  const done = status === "AWARDED";

  return (
    <ol className={cn("flex w-full items-start", compact ? "gap-1" : "gap-2")} aria-label="Application progress">
      {JOURNEY.map((stage, i) => {
        // Feedback is a detour: only lit when changes are requested.
        const skipped = stage.key === "feedback" && !flagged && current > i;
        const past = i < current && !skipped;
        const here = i === current;
        const tone = here
          ? rejected
            ? "bg-red-500 text-white"
            : flagged
              ? "bg-ceda-red text-white"
              : done
                ? "bg-ceda-amber text-ceda-ink"
                : "bg-ceda-orange text-white"
          : past
            ? "bg-ceda-green text-white"
            : "bg-gray-200 text-gray-500";
        return (
          <li key={stage.key} className="flex flex-1 flex-col items-center text-center">
            <div className="flex w-full items-center">
              <span className={cn("h-0.5 flex-1", i === 0 ? "opacity-0" : past || here ? "bg-ceda-green" : "bg-gray-200")} />
              <span
                className={cn(
                  "flex shrink-0 items-center justify-center rounded-full font-semibold",
                  compact ? "h-6 w-6 text-[10px]" : "h-8 w-8 text-xs",
                  tone,
                  here && !done && !rejected && "ring-4 ring-ceda-orange/15"
                )}
              >
                {past || (here && done) ? <Check size={compact ? 12 : 14} /> : here && rejected ? <X size={14} /> : i + 1}
              </span>
              <span className={cn("h-0.5 flex-1", i === JOURNEY.length - 1 ? "opacity-0" : past ? "bg-ceda-green" : "bg-gray-200")} />
            </div>
            {!compact && (
              <span className={cn("mt-1.5 text-[11px] sm:text-xs", here ? "font-semibold text-ceda-ink" : "text-muted-foreground", skipped && "line-through opacity-50")}>
                {here && rejected ? "Not selected" : stage.label}
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

/** One plain sentence on where the idea is and what happens next. */
export function statusExplainer(status: string): string {
  switch (status) {
    case "DRAFT": return "Not submitted yet. Finish the form and files, then sign and submit before the call closes.";
    case "SUBMITTED": return "Received. The CEDA programme team is checking eligibility and completeness.";
    case "UNDER_REVIEW": return "Passed screening. Independent evaluators are scoring it against the published criteria.";
    case "SHORTLISTED": return "Scored and shortlisted. The adjudication panel is deciding on funding.";
    case "FLAGGED": return "CEDA asked for changes. Read the note, update your idea and resubmit.";
    case "APPROVED": return "Approved by the panel. CEDA will confirm the award and next steps.";
    case "AWARDED": return "Awarded. A CEDA officer will contact you about disbursement and mentorship.";
    case "REJECTED": return "Not selected this round. Read the evaluator feedback; you can apply to the next call.";
    default: return "";
  }
}
