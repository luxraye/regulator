"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";
import { checkEligibility, MAX_AGE, MIN_AGE } from "@/lib/eligibility";
import { cn } from "@/lib/utils";

export default function EligibilityPage() {
  const [citizen, setCitizen] = useState<boolean | null>(null);
  const [dob, setDob] = useState("");
  const [company, setCompany] = useState<boolean | null>(null);
  const [share, setShare] = useState("");

  const answered = citizen !== null && dob && company !== null && share !== "";
  const result = useMemo(
    () => checkEligibility({ citizen, dateOfBirth: dob || null, hasCompany: company, youthShareholding: share === "" ? null : Number(share) }),
    [citizen, dob, company, share]
  );

  const yesNo = (value: boolean | null, set: (v: boolean) => void, name: string) => (
    <div className="flex gap-2">
      {[true, false].map((v) => (
        <button key={String(v)} type="button" onClick={() => set(v)} aria-pressed={value === v} name={name}
          className={cn("flex-1 rounded-lg border px-4 py-2 text-sm font-medium", value === v ? "border-ceda-orange bg-ceda-orange text-white" : "border-border bg-white hover:bg-ceda-sand")}>
          {v ? "Yes" : "No"}
        </button>
      ))}
    </div>
  );

  return (
    <div className="bg-ceda-sand px-4 py-14">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold text-ceda-ink">Am I eligible?</h1>
        <p className="mb-8 mt-2 text-muted-foreground">Four questions, based on the competition rules. Nothing you enter here is saved.</p>
        <div className="space-y-6 rounded-2xl border border-border bg-white p-6">
          <div><p className="mb-2 text-sm font-medium">Are you a citizen of Botswana with an Omang?</p>{yesNo(citizen, setCitizen, "citizen")}</div>
          <div>
            <label htmlFor="dob" className="mb-2 block text-sm font-medium">Your date of birth</label>
            <input id="dob" type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="w-full rounded-lg border border-border px-3 py-2 text-sm" />
            <p className="mt-1 text-xs text-muted-foreground">You must be {MIN_AGE} to {MAX_AGE}.</p>
          </div>
          <div><p className="mb-2 text-sm font-medium">Will you apply through a company registered with CIPA?</p>{yesNo(company, setCompany, "company")}</div>
          <div>
            <label htmlFor="share" className="mb-2 block text-sm font-medium">What percentage of the company do people aged {MIN_AGE}–{MAX_AGE} own?</label>
            <input id="share" type="number" min={0} max={100} value={share} onChange={(e) => setShare(e.target.value)} className="w-32 rounded-lg border border-border px-3 py-2 text-sm" /> <span className="text-sm">%</span>
          </div>
        </div>

        {answered && (
          <div className={cn("mt-6 rounded-2xl border p-6", result.eligible ? "border-green-200 bg-green-50" : "border-amber-200 bg-amber-50")} aria-live="polite">
            <p className="text-lg font-semibold text-ceda-ink">{result.eligible ? "You meet the rules. Go for it." : "Not yet eligible"}</p>
            <ul className="mt-3 space-y-2">
              {result.checks.map((c) => (
                <li key={c.key} className="flex items-start gap-2 text-sm">
                  {c.ok ? <CheckCircle2 size={16} className="mt-0.5 text-ceda-green" /> : <XCircle size={16} className="mt-0.5 text-red-500" />}
                  <span>{c.label}<span className="block text-xs text-muted-foreground">{c.detail}</span></span>
                </li>
              ))}
            </ul>
            {result.eligible ? (
              <Link href="/register" className="mt-5 inline-block rounded-lg bg-ceda-ink px-5 py-2.5 font-medium text-white">Create your account</Link>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">
                Not eligible for this challenge? CEDA and the Local Enterprise Authority run other programmes for citizen entrepreneurs.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
