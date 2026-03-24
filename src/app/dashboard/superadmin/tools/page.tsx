export const dynamic = "force-dynamic";

import {
  Fingerprint,
  FileSearch,
  ShieldCheck,
  BarChart3,
  ExternalLink,
  Database,
  Eye,
  Lock,
  Activity,
  FileWarning,
} from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function VerificationToolsPage() {
  const [totalInstances, submittedCount, flaggedCount, auditCount] = await Promise.all([
    prisma.instance.count(),
    prisma.instance.count({ where: { status: "SUBMITTED" } }),
    prisma.instance.count({ where: { status: { in: ["FLAGGED", "REJECTED"] } } }),
    prisma.auditLog.count(),
  ]);

  const internalTools = [
    {
      icon: <Eye className="w-6 h-6" />,
      title: "Review Queue",
      description: "Review submitted instances with raw data, file integrity checks, and automated analysis.",
      href: "/dashboard/admin/review",
      color: "text-bocra-blue bg-bocra-blue/10",
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Analytics Dashboard",
      description: "Compliance rates, sector breakdowns, submission timelines, and trend analysis.",
      href: "/dashboard/admin/analytics",
      color: "text-bocra-green bg-bocra-green/10",
    },
    {
      icon: <Activity className="w-6 h-6" />,
      title: "Audit Trail",
      description: "Immutable log of every action: provisions, submissions, reviews, and status changes.",
      href: "/dashboard/superadmin/audit",
      color: "text-bocra-amber bg-bocra-amber/10",
    },
    {
      icon: <Fingerprint className="w-6 h-6" />,
      title: "Hash Verifier",
      description: "Verify the SHA-256 integrity of any submitted file against the stored hash.",
      href: "/dashboard/superadmin/verify-hash",
      color: "text-bocra-orange bg-bocra-orange/10",
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: "JWT Inspector",
      description: "Decode and verify submission receipts to confirm authenticity and tamper-proof status.",
      href: "/dashboard/superadmin/verify-jwt",
      color: "text-purple-600 bg-purple-100",
    },
    {
      icon: <FileWarning className="w-6 h-6" />,
      title: "Flagged Submissions",
      description: `${flaggedCount} submissions flagged or rejected. Review corrective actions and follow-ups.`,
      href: "/dashboard/admin/instances",
      color: "text-red-600 bg-red-100",
    },
  ];

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

      {/* Internal tools */}
      <h2 className="text-lg font-semibold text-bocra-navy mb-4">Platform Tools</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {internalTools.map((tool) => (
          <Link
            key={tool.title}
            href={tool.href}
            className="group bg-white rounded-xl border border-border p-5 hover:shadow-md hover:border-bocra-blue/30 transition-all"
          >
            <div className={`w-10 h-10 rounded-lg ${tool.color} flex items-center justify-center mb-3`}>
              {tool.icon}
            </div>
            <h3 className="font-semibold text-bocra-navy text-sm mb-1">{tool.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{tool.description}</p>
          </Link>
        ))}
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
