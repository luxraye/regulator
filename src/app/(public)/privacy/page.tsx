export const metadata = { title: "Privacy notice · CEDA Innovation Portal" };

const SECTIONS: [string, string[]][] = [
  ["What we collect", [
    "Account: name, email, mobile number, password (stored only as a one-way hash).",
    "Eligibility: Omang number, date of birth, company name, CIPA number and youth shareholding.",
    "Optional: gender and district, used only in aggregate to measure inclusion.",
    "Your applications: answers, documents, messages with CEDA, and decisions.",
  ]],
  ["Why we collect it", [
    "To confirm you meet the competition rules, assess your ideas, tell you the outcome, and manage any award.",
    "Aggregated, anonymised statistics help CEDA report on participation. Reports never include Omang, phone or email.",
  ]],
  ["Who can see it", [
    "Evaluators see your idea and documents only, never your Omang, age, gender or contact details, and only after declaring no conflict of interest.",
    "The adjudication panel and CEDA programme staff see your full application to make and record decisions.",
    "We do not sell or share your data with third parties for marketing.",
  ]],
  ["How it is protected", [
    "Encrypted connections, role-based access checked on the server for every request, and an audit trail of every access to your documents.",
    "Your Omang is masked on screen wherever it is shown.",
  ]],
  ["Your rights under the Data Protection Act, 2024", [
    "Access: download everything held about you from \"My data\" in your dashboard.",
    "Correction: ask CEDA to fix inaccurate details through the messages on any application.",
    "Objection and erasure: ask CEDA to delete your account when no application is open. Records of awards may be kept as long as the law requires.",
    "Complaints: you may complain to the Information and Data Protection Commission.",
  ]],
  ["How long we keep it", [
    "Unsuccessful applications: for the life of the programme plus two years, so you can be considered again and CEDA can answer audits.",
    "Awarded applications: as long as financial and audit rules require.",
  ]],
];

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-ceda-ink">Privacy notice</h1>
      <p className="mb-8 mt-2 text-muted-foreground">How the CEDA Innovation Portal handles your personal data, in line with Botswana&apos;s Data Protection Act, 2024.</p>
      <div className="space-y-8">
        {SECTIONS.map(([h, items]) => (
          <section key={h}>
            <h2 className="mb-2 text-xl font-semibold text-ceda-ink">{h}</h2>
            <ul className="list-disc space-y-1.5 pl-5 text-muted-foreground">{items.map((i) => <li key={i}>{i}</li>)}</ul>
          </section>
        ))}
      </div>
      <p className="mt-10 rounded-xl bg-ceda-sand p-4 text-sm text-muted-foreground">Retention periods and contact points are aligned with the Data Protection Act, 2024 and CEDA&apos;s data protection office.</p>
    </div>
  );
}
