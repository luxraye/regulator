export const dynamic = "force-dynamic";

import { FileSearch, ShieldCheck, ExternalLink, Database } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { HashVerifier, ReceiptInspector } from "./verify-tools";

export default async function VerificationToolsPage() {
  const [totalInstances, submittedCount, flaggedCount, auditCount] = await Promise.all([
    prisma.entry.count(),
    prisma.entry.count({ where: { status: "SUBMITTED" } }),
    prisma.entry.count({ where: { status: { in: ["FLAGGED", "REJECTED"] } } }),
    prisma.auditLog.count(),
  ]);

  const externalLinks = [
    { icon: <ShieldCheck className="h-5 w-5" />, title: "CIPA company registry", description: "Confirm the applicant company is registered and check its shareholders for the youth-ownership rule.", url: "https://www.cipa.co.bw/" },
    { icon: <FileSearch className="h-5 w-5" />, title: "BURS tax clearance", description: "Check tax good standing before an award is disbursed.", url: "https://www.burs.org.bw/" },
    { icon: <Database className="h-5 w-5" />, title: "CEDA", description: "CEDA's own loan and grant records, to spot duplicate funding.", url: "https://www.ceda.co.bw/" },
    { icon: <ExternalLink className="h-5 w-5" />, title: "Local Enterprise Authority", description: "Mentorship and incubation partners for awarded innovators.", url: "https://www.lea.co.bw/" },
    { icon: <ExternalLink className="h-5 w-5" />, title: "Botswana Innovation Hub", description: "Technology incubation and IP support for digital ventures.", url: "https://www.bih.co.bw/" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-ceda-ink">Verification</h1>
        <p className="text-muted-foreground mt-1">
          Prove a pitch deck or certificate is the one the innovator submitted, check a receipt is genuine,
          and cross-check applicants against national registries before money moves.
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-border p-4 text-center">
          <p className="text-2xl font-bold text-ceda-ink">{totalInstances}</p>
          <p className="text-xs text-muted-foreground">Ideas</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-4 text-center">
          <p className="text-2xl font-bold text-ceda-amber">{submittedCount}</p>
          <p className="text-xs text-muted-foreground">To screen</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-4 text-center">
          <p className="text-2xl font-bold text-red-500">{flaggedCount}</p>
          <p className="text-xs text-muted-foreground">Changes / not selected</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-4 text-center">
          <p className="text-2xl font-bold text-ceda-green">{auditCount}</p>
          <p className="text-xs text-muted-foreground">Audit entries</p>
        </div>
      </div>

      <div className="mb-10 grid gap-6 lg:grid-cols-2">
        <HashVerifier />
        <ReceiptInspector />
      </div>

      <div className="mb-10 flex flex-wrap gap-3 text-sm">
        <Link href="/dashboard/admin/instances?filter=screening" className="rounded-lg border border-border bg-white px-4 py-2 font-medium hover:bg-ceda-sand">Screening queue →</Link>
        <Link href="/dashboard/superadmin/audit" className="rounded-lg border border-border bg-white px-4 py-2 font-medium hover:bg-ceda-sand">Audit trail →</Link>
        <Link href="/dashboard/admin/instances?filter=changes" className="rounded-lg border border-border bg-white px-4 py-2 font-medium hover:bg-ceda-sand">Changes requested ({flaggedCount}) →</Link>
      </div>

      {/* External links */}
      <h2 className="text-lg font-semibold text-ceda-ink mb-4">External checks</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {externalLinks.map((link) => (
          <a
            key={link.title}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-white rounded-xl border border-border p-5 hover:shadow-md hover:border-ceda-orange/30 transition-all"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="text-ceda-orange">{link.icon}</div>
              <h3 className="font-semibold text-ceda-ink text-sm">{link.title}</h3>
              <ExternalLink size={12} className="text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{link.description}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
