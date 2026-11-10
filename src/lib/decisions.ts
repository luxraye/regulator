import type { EntryStatus, Role } from "@prisma/client";

/**
 * Every decision an idea can receive, who may take it, and from which status.
 * Screening is done by programme admins; final decisions by the adjudication panel.
 */
export const ACTIONS: Record<
  string,
  { to: EntryStatus; from: EntryStatus[]; roles: Role[]; needsNotes: boolean; verb: string }
> = {
  REQUEST_CHANGES: {
    to: "FLAGGED",
    from: ["SUBMITTED", "UNDER_REVIEW", "SHORTLISTED"],
    roles: ["ADMIN", "SUPERADMIN", "ADJUDICATOR"],
    needsNotes: true,
    verb: "needs changes",
  },
  SEND_TO_PANEL: {
    to: "SHORTLISTED",
    from: ["UNDER_REVIEW"],
    roles: ["ADMIN", "SUPERADMIN"],
    needsNotes: false,
    verb: "has been sent to the adjudication panel",
  },
  APPROVE: {
    to: "APPROVED",
    from: ["SHORTLISTED"],
    roles: ["ADJUDICATOR", "SUPERADMIN"],
    needsNotes: true,
    verb: "has been approved",
  },
  AWARD: {
    to: "AWARDED",
    from: ["SHORTLISTED", "APPROVED"],
    roles: ["ADJUDICATOR", "SUPERADMIN"],
    needsNotes: true,
    verb: "has won an award",
  },
  REJECT: {
    to: "REJECTED",
    from: ["SUBMITTED", "UNDER_REVIEW", "SHORTLISTED"],
    roles: ["ADMIN", "SUPERADMIN", "ADJUDICATOR"],
    needsNotes: true,
    verb: "was not selected",
  },
};

export const ACTION_LABELS: Record<string, { label: string; tone: string; hint: string }> = {
  SEND_TO_PANEL: { label: "Send to panel", tone: "bg-purple-600 text-white", hint: "Skip waiting for remaining evaluators and pass the idea to adjudication." },
  APPROVE: { label: "Approve", tone: "bg-ceda-green text-white", hint: "Approve in principle; the award amount can be confirmed later." },
  AWARD: { label: "Award funding", tone: "bg-ceda-amber text-ceda-ink", hint: "Confirm the award and amount. The innovator is notified straight away." },
  REQUEST_CHANGES: { label: "Request changes", tone: "bg-ceda-orange text-white", hint: "Send it back to the innovator with what to fix. They can resubmit." },
  REJECT: { label: "Not selected", tone: "bg-red-600 text-white", hint: "Close the application with a reason the innovator can learn from." },
};

/** Decisions this role can take on an idea in this status, in display order. */
export function availableActions(role: string, status: string): string[] {
  return ["SEND_TO_PANEL", "APPROVE", "AWARD", "REQUEST_CHANGES", "REJECT"].filter((k) => {
    const a = ACTIONS[k];
    return a.roles.includes(role as Role) && a.from.includes(status as EntryStatus);
  });
}
