export const dynamic = "force-dynamic";

import { FileSearch, ShieldCheck, ExternalLink, Database } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { HashVerifier, ReceiptInspector } from "./verify-tools";

export default async function VerificationToolsPage() {
  const [totalInstances, submittedCount, flaggedCount, auditCount] = await Promise.all([
    prisma.instance.count(),
    prisma.instance.count({ where: { status: "SUBMITTED" } }),
    prisma.instance.count({ where: { status: { in: ["FLAGGED", "REJECTED"] } } }),
    prisma.auditLog.count(),
  ]);

  const externalLinks = [
    {
      icon: <ShieldCheck className="w-5 h-5" />,
      title: "BOCRA Licensing Portal",
      description: "Cross-reference licensee registration and license validity.",
      url: "https://www.bocra.org.bw/licensing",
    },
    {
      icon: <FileSearch className="w-5 h-5" />,
      title: "QoS Monitoring",
      description: "External quality of service metrics dashboard.",
      url: "https://dqos.bocra.org.bw/",
    },
    {
      icon: <Database className="w-5 h-5" />,
      title: "BOCRA Operations Portal",
      description: "Internal operations and case management system.",
      url: "https://op-web.bocra.org.bw/",
    },
    {
      icon: <ExternalLink className="w-5 h-5" />,
      title: "ITU Statistics",
      description: "International Telecommunication Union benchmark data for Botswana.",
      url: "https://datahub.itu.int/data/?e=072",
    },
    {
      icon: <ExternalLink className="w-5 h-5" />,
      title: "CIPA Company Registry",
      description: "Verify company registration status at CIPA.",
      url: "https://www.cipa.co.bw/",
    },
    {
      icon: <ExternalLink className="w-5 h-5" />,
      title: "BURS Tax Clearance",
      description: "Botswana Unified Revenue Services for tax compliance verification.",
      url: "https://www.burs.org.bw/",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-bocra-navy">Verification & Validation Tools</h1>
        <p className="text-muted-foreground mt-1">
          With self-reported compliance data, BOCRA&apos;s focus shifts to verification. 
          These tools help validate submissions and cross-reference external data sources.
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-border p-4 text-center">
          <p className="text-2xl font-bold text-bocra-navy">{totalInstances}</p>
          <p className="text-xs text-muted-foreground">Total Instances</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-4 text-center">
          <p className="text-2xl font-bold text-bocra-amber">{submittedCount}</p>
          <p className="text-xs text-muted-foreground">Awaiting Review</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-4 text-center">
          <p className="text-2xl font-bold text-red-500">{flaggedCount}</p>
          <p className="text-xs text-muted-foreground">Flagged / Rejected</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-4 text-center">
          <p className="text-2xl font-bold text-bocra-green">{auditCount}</p>
          <p className="text-xs text-muted-foreground">Audit Log Entries</p>
        </div>
      </div>

      <div className="mb-10 grid gap-6 lg:grid-cols-2">
        <HashVerifier />
        <ReceiptInspector />
      </div>

      <div className="mb-10 flex flex-wrap gap-3 text-sm">
        <Link href="/dashboard/admin/review" className="rounded-lg border border-border bg-white px-4 py-2 font-medium hover:bg-bocra-light">Review queue →</Link>
        <Link href="/dashboard/superadmin/audit" className="rounded-lg border border-border bg-white px-4 py-2 font-medium hover:bg-bocra-light">Audit trail →</Link>
        <Link href="/dashboard/admin/instances?filter=flagged" className="rounded-lg border border-border bg-white px-4 py-2 font-medium hover:bg-bocra-light">Flagged submissions ({flaggedCount}) →</Link>
      </div>

      {/* External links */}
      <h2 className="text-lg font-semibold text-bocra-navy mb-4">External Verification Sources</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {externalLinks.map((link) => (
          <a
            key={link.title}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-white rounded-xl border border-border p-5 hover:shadow-md hover:border-bocra-blue/30 transition-all"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="text-bocra-blue">{link.icon}</div>
              <h3 className="font-semibold text-bocra-navy text-sm">{link.title}</h3>
              <ExternalLink size={12} className="text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{link.description}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
