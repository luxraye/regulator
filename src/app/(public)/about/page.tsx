import Image from "next/image";
import Link from "next/link";

export const metadata = { title: "About · CEDA Innovation Portal" };

export default function AboutPage() {
  return (
    <div>
      <section className="relative h-72">
        <Image src="/photos/okavango.webp" alt="" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-ceda-navy/70" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-4xl px-4 pb-10 text-white sm:px-6">
          <h1 className="text-3xl font-bold sm:text-4xl">About the CEDA Innovation Portal</h1>
          <p className="mt-2 max-w-2xl text-white/80">A single, fair and transparent way for young Batswana to bring ideas to CEDA, and for CEDA to fund the best of them.</p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl space-y-12 px-4 py-12 sm:px-6">
        <section>
          <h2 className="mb-3 text-2xl font-semibold text-ceda-navy">Why it exists</h2>
          <p className="leading-relaxed text-muted-foreground">
            The Citizen Entrepreneurial Development Agency (CEDA) funds and mentors citizen-owned businesses. Its innovation challenge invites youth
            to propose ideas that support economic diversification, digital advancement and sustainable development. Until now, ideas arrived by
            email and paper, evaluators scored in spreadsheets, and applicants rarely knew where they stood. This portal replaces that with one
            flow that every applicant, evaluator and panel member can follow.
          </p>
        </section>

        <section id="judging" className="scroll-mt-24">
          <h2 className="mb-3 text-2xl font-semibold text-ceda-navy">How judging works</h2>
          <ol className="list-decimal space-y-2 pl-5 text-muted-foreground">
            <li><span className="text-foreground">Screening.</span> CEDA checks eligibility and completeness. The portal pre-checks age, citizenship, youth shareholding, funding against the call ceiling and cost per job.</li>
            <li><span className="text-foreground">Independent scoring.</span> Each idea goes to two or more evaluators. Each declares any conflict of interest, then scores 1 to 5 on the call&apos;s published, weighted criteria and writes feedback.</li>
            <li><span className="text-foreground">Shortlist.</span> When every score is in, the idea moves to the adjudication panel automatically. The panel sees a ranked list, every scorecard side by side, and a warning where evaluators disagree by more than 20 points.</li>
            <li><span className="text-foreground">Decision.</span> The panel approves, awards with an amount, asks for changes, or declines with a reason. The innovator is notified at once.</li>
            <li><span className="text-foreground">Feedback.</span> Every applicant sees their average score per criterion and the evaluators&apos; comments, anonymously.</li>
          </ol>
        </section>

        <section id="integrity" className="scroll-mt-24">
          <h2 className="mb-3 text-2xl font-semibold text-ceda-navy">Fairness and integrity</h2>
          <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
            <li>Each document is fingerprinted with SHA-256 in your browser and again on the server. If they differ, the upload is refused.</li>
            <li>On submission you get a digitally signed receipt covering your answers and every document fingerprint. If anything changes later, verification fails.</li>
            <li>Role-based access: innovators, evaluators, adjudicators and programme admins each see only what their role needs, enforced on the server.</li>
            <li>An append-only audit trail records every submission, assignment, declaration, score, decision and download.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-semibold text-ceda-navy">Reaching every district</h2>
          <p className="leading-relaxed text-muted-foreground">
            The portal installs on a phone, works on slow connections, offers Setswana, and has a <Link href="/ussd-demo" className="text-ceda-blue hover:underline">USSD service</Link> so
            founders without data can check eligibility and track applications. Reports break participation down by district, gender and age so CEDA can see who it is not yet reaching.
          </p>
        </section>

        <section id="how-to-judge" className="scroll-mt-24 rounded-2xl border border-border bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-ceda-blue">Walkthrough guide</p>
              <h2 className="mt-1 text-2xl font-semibold text-ceda-navy">How to judge this portal</h2>
            </div>
            <Link href="/login" className="rounded-lg bg-ceda-navy px-4 py-2 text-sm font-medium text-white hover:bg-ceda-navy/90">
              Open one-click demo logins →
            </Link>
          </div>
          <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
            Each demo account on <Link href="/login" className="text-ceda-blue hover:underline">/login</Link> (password <code className="rounded bg-ceda-light px-1.5 py-0.5 font-semibold text-ceda-navy">CedaDemo2026!</code>) is pre-loaded with live applications so you can test all six challenge requirements—<strong>submission</strong>, <strong>multi-level evaluation</strong>, <strong>feedback</strong>, <strong>resubmission</strong>, <strong>approval</strong>, and <strong>recognition</strong>—in about two minutes per role:
          </p>
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-ceda-light/60 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-semibold text-ceda-navy">1. Innovator — Naledi Molefe (<code>innovator@demo.ceda.bw</code>)</h3>
                <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">Submission · Feedback · Resubmission · Recognition</span>
              </div>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Open <strong>Mokoro Stories</strong> (status: <em>Changes requested</em>) to read evaluator scores, programme feedback and message history, upload a supporting document (SHA-256 verified in browser &amp; server), and click <strong>Sign &amp; resubmit</strong> to receive a fresh cryptographic JWT receipt. Then open <strong>Sefofu: recycled-glass tiles made in Maun</strong> (status: <em>Awarded</em>) and click <strong>Award certificate</strong> to inspect the printable award certificate and scan/follow its public <Link href="/verify" className="text-ceda-blue hover:underline">QR verification link</Link>.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-ceda-light/60 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-semibold text-ceda-navy">2. Evaluator — Dr Keabetswe Ntshole (<code>evaluator@demo.ceda.bw</code>)</h3>
                <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800">Multi-level evaluation · Blind review · Feedback</span>
              </div>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Open <strong>Pula Pumps</strong> in your queue. Notice that personal identifiers (Omang, phone, email) are hidden for blind review. Declare <strong>No conflict of interest</strong>, score the five weighted criteria (1–5 sliders with live weighted total out of 100), write constructive applicant feedback plus an optional private note for the panel, and submit the scorecard. Once the second evaluator&apos;s score is in, the idea automatically advances to the adjudication shortlist.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-ceda-light/60 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-semibold text-ceda-navy">3. Adjudicator — Mma Dineo Seabo (<code>panel@demo.ceda.bw</code>)</h3>
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">Multi-level evaluation · Approval · Recognition</span>
              </div>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Review the ranked shortlist by call. Open <strong>Spaza Ledger</strong>, where the portal flags a <strong>score spread warning (&gt;20 pts)</strong> between evaluators so the panel can inspect side-by-side scorecards and private evaluator notes. Record a panel decision—<strong>Award funding</strong> (with Pula amount), <strong>Approve</strong>, <strong>Request changes</strong>, or <strong>Decline</strong>—which immediately notifies the innovator and updates the public <Link href="/funded" className="text-ceda-blue hover:underline">Funded ideas showcase</Link>.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-ceda-light/60 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-semibold text-ceda-navy">4. Programme Admin — Tebogo Ramasedi (<code>admin@demo.ceda.bw</code>)</h3>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">Screening · Call management · Inclusion reports</span>
              </div>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Open <strong>Kgomo Tag</strong> (status: <em>Screening</em>) to inspect automated eligibility checks (age 18–35, citizenship/Omang, youth shareholding ≥51%, call ceiling, cost per job) and assign two or more evaluators. Visit <strong>Calls</strong> to configure weighted criteria or launch a new call, and open <strong>Reports</strong> to view inclusion breakdowns by Botswana district, gender, age group, and stage—or export an anonymised CSV.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-ceda-light/60 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-semibold text-ceda-navy">5. Super Admin — Kgosi Mothibi (<code>super@demo.ceda.bw</code>)</h3>
                <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-800">Audit trail · Cryptographic verification · Demo reset</span>
              </div>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Inspect the append-only <strong>Audit log</strong> recording every submission, conflict declaration, scorecard, file download and panel decision. Use <strong>Verify &amp; hash</strong> to validate any applicant&apos;s signed submission receipt or SHA-256 document hash, manage evaluator/panel roles in <strong>People</strong>, or use <strong>Settings → Reset demo data</strong> to restore the database to a clean baseline at any time.
              </p>
            </div>
          </div>
        </section>

        <p className="rounded-xl bg-ceda-light p-4 text-sm text-muted-foreground">
          Built for the CEDA Innovation Portal challenge. Demo accounts and applications use illustrative data for evaluation.
        </p>
      </div>
    </div>
  );
}
