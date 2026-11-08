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

        <p className="rounded-xl bg-ceda-light p-4 text-sm text-muted-foreground">
          This is a hackathon prototype built for CEDA&apos;s Innovation Portal challenge. It is not an official CEDA service, and demo data is fictional.
        </p>
      </div>
    </div>
  );
}
