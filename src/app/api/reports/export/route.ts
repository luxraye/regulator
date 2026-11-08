import { NextRequest, NextResponse } from "next/server";
import { requireUser, PANEL_ROLES } from "@/lib/session";
import { ideaRows } from "@/lib/reports";
import { audit } from "@/lib/audit";

export const dynamic = "force-dynamic";

const cell = (v: unknown) => {
  const s = v == null ? "" : v instanceof Date ? v.toISOString() : String(v);
  // Quote everything; neutralise spreadsheet formulas.
  return `"${(/^[=+\-@]/.test(s) ? `'${s}` : s).replace(/"/g, '""')}"`;
};

/** CSV of every submitted idea for the panel or programme team. No Omang, phone or email. */
export async function GET(req: NextRequest) {
  const { user, error } = await requireUser(PANEL_ROLES);
  if (error) return error;
  const call = req.nextUrl.searchParams.get("call") ?? undefined;
  const rows = await ideaRows(call);

  const cols: [string, (r: (typeof rows)[number]) => unknown][] = [
    ["Reference", (r) => r.reference],
    ["Title", (r) => r.title],
    ["Call", (r) => r.call],
    ["Sector", (r) => r.sector],
    ["Stage", (r) => r.stage],
    ["Company", (r) => r.company],
    ["District", (r) => r.district],
    ["Gender", (r) => r.gender],
    ["Age band", (r) => r.ageBand],
    ["Youth shareholding %", (r) => r.youthShareholding],
    ["Status", (r) => r.statusLabel],
    ["Submitted", (r) => r.submittedAt],
    ["Resubmissions", (r) => r.resubmissions],
    ["Funding requested (P)", (r) => r.fundingRequested],
    ["Jobs in 12 months", (r) => r.jobs],
    ["Mean score /100", (r) => r.meanScore],
    ["Scores in", (r) => r.scores],
    ["Evaluators disagree", (r) => (r.disagreement ? "yes" : "")],
    ["Award (P)", (r) => r.awardAmount],
    ["Days to screening", (r) => r.daysToScreening],
    ["Days to decision", (r) => r.daysToDecision],
  ];
  const csv = [cols.map(([h]) => cell(h)).join(","), ...rows.map((r) => cols.map(([, f]) => cell(f(r))).join(","))].join("\r\n");
  await audit(user.id, "REPORT_EXPORTED", { metadata: { call: call ?? "all", rows: rows.length } });

  return new NextResponse("﻿" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="ceda-ideas-${call ?? "all"}-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
