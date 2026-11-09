import { redirect } from "next/navigation";
import Link from "next/link";
import { Download, ShieldCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function MyDataPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const p = await prisma.user.findUnique({ where: { id: user.id } });
  if (!p) redirect("/login");

  const maskedOmang = p.omang ? `${"•".repeat(5)}${p.omang.slice(-4)}` : "—";
  const rows: [string, string][] = [
    ["Name", p.name],
    ["Email", p.email],
    ["Phone", p.phone ?? "—"],
    ["Omang", maskedOmang],
    ["Date of birth", formatDate(p.dateOfBirth)],
    ["Gender", p.gender ?? "—"],
    ["District", p.district ?? "—"],
    ["Company", p.organizationName ?? "—"],
    ["CIPA number", p.licenseNumber ?? "—"],
    ["Youth shareholding", p.youthShareholding != null ? `${p.youthShareholding}%` : "—"],
  ];

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ceda-ink">My data</h1>
        <p className="mt-1 text-muted-foreground">What CEDA holds about you, and your rights under the Data Protection Act, 2024.</p>
      </div>

      <section className="mb-6 rounded-xl border border-border bg-white p-5">
        <dl className="divide-y divide-border text-sm">
          {rows.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 py-2">
              <dt className="text-muted-foreground">{k}</dt>
              <dd className="text-right font-medium">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-xs text-muted-foreground">
          You agreed to the privacy notice on {formatDate(p.consentAt, true)}. Your Omang is masked on screen and is only used to check citizenship and age.
        </p>
      </section>

      <section className="mb-6 rounded-xl border border-border bg-white p-5">
        <h2 className="mb-2 flex items-center gap-2 font-semibold text-ceda-ink"><ShieldCheck size={18} className="text-ceda-green" /> Your rights</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          <li><span className="text-foreground">Access:</span> download a copy of everything linked to your account below.</li>
          <li><span className="text-foreground">Correction:</span> message CEDA from any application to fix a detail.</li>
          <li><span className="text-foreground">Purpose:</span> your data is used only to assess and manage your applications.</li>
          <li><span className="text-foreground">Need to know:</span> evaluators see your idea, not your Omang, date of birth or contact details.</li>
          <li><span className="text-foreground">Retention and erasure:</span> ask CEDA to delete your account once no application is open.</li>
        </ul>
        <a href="/api/me" className="mt-4 inline-flex items-center gap-2 rounded-lg bg-ceda-ink px-4 py-2 text-sm font-medium text-white hover:bg-ceda-ink/90">
          <Download size={15} /> Download my data (JSON)
        </a>
      </section>

      <p className="text-sm text-muted-foreground">
        Read the full <Link href="/privacy" className="text-ceda-orange hover:underline">privacy notice</Link>.
      </p>
    </div>
  );
}
