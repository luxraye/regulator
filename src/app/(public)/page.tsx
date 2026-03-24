import Link from "next/link";
import {
  Shield,
  FileSearch,
  BarChart3,
  Users,
  Phone,
  Radio,
  Mail,
  Globe,
  Download,
  Lock,
  Eye,
  FileCheck,
  ArrowRight,
  CheckCircle2,
  Fingerprint,
} from "lucide-react";
import { MandateSection } from "@/components/home/mandate-section";
import { InstanceDeepDive } from "@/components/home/instance-deep-dive";
import { PWAInstallSection } from "@/components/home/pwa-install-section";

const services = [
  {
    icon: <Shield className="w-8 h-8" />,
    title: "Licensing",
    description: "Apply for and manage telecommunications, broadcasting, and postal licenses.",
    href: "/licensing",
  },
  {
    icon: <FileSearch className="w-8 h-8" />,
    title: "Compliance",
    description: "Submit regulatory compliance data through secure digital Instances.",
    href: "/login",
  },
  {
    icon: <BarChart3 className="w-8 h-8" />,
    title: "Publications",
    description: "Access regulatory publications, reports, and industry statistics.",
    href: "/publications",
  },
  {
    icon: <Users className="w-8 h-8" />,
    title: "Consumer Protection",
    description: "File complaints and access consumer protection tools.",
    href: "/complaints",
  },
];

const sectors = [
  { icon: <Phone className="w-6 h-6" />, label: "Telecommunications" },
  { icon: <Radio className="w-6 h-6" />, label: "Broadcasting" },
  { icon: <Mail className="w-6 h-6" />, label: "Postal Services" },
  { icon: <Globe className="w-6 h-6" />, label: "Internet & ICT" },
];


export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-bocra-navy text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="max-w-3xl">
            <div className="flex gap-1.5 mb-6">
              <span className="w-4 h-4 rounded-full bg-bocra-blue" />
              <span className="w-4 h-4 rounded-full bg-bocra-green" />
              <span className="w-4 h-4 rounded-full bg-bocra-amber" />
              <span className="w-4 h-4 rounded-full bg-bocra-orange" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-6">
              Regulating Communications for the Public Interest
            </h1>
            <p className="text-lg text-white/80 mb-8 leading-relaxed">
              BOCRA is the converged regulatory authority for telecommunications,
              broadcasting, postal, and internet services in Botswana. Our new
              digital platform enables transparent, data-driven regulatory
              compliance through secure, tamper-proof <strong className="text-white">Instances</strong>.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="#how-instances-work"
                className="px-6 py-3 bg-bocra-blue rounded-lg font-medium hover:bg-bocra-blue/80 transition-colors"
              >
                How Instances Work
              </Link>
              <Link
                href="/login"
                className="px-6 py-3 bg-white/10 rounded-lg font-medium hover:bg-white/20 transition-colors"
              >
                Licensee Portal
              </Link>
              <Link
                href="/complaints"
                className="px-6 py-3 bg-white/10 rounded-lg font-medium hover:bg-white/20 transition-colors"
              >
                File a Complaint
              </Link>
              <Link
                href="/register"
                className="px-6 py-3 bg-white/10 rounded-lg font-medium hover:bg-white/20 transition-colors"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Sectors */}
      <section className="bg-bocra-light py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-8">
            {sectors.map((s) => (
              <div key={s.label} className="flex items-center gap-2 text-bocra-navy font-medium text-sm">
                {s.icon}
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== PROMINENT INSTANCE EXPLAINER ========== */}
      <section id="how-instances-work" className="py-20 lg:py-28 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 rounded-full bg-bocra-blue/10 text-bocra-blue text-sm font-medium mb-4">
              Core Innovation
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold text-bocra-navy mb-4">
              What is an Instance?
            </h2>
            <p className="text-muted-foreground max-w-3xl mx-auto text-lg leading-relaxed">
              Think of an Instance as a <strong className="text-bocra-navy">Digital Regulatory Vault</strong>. 
              Instead of asking companies to &ldquo;send us a report&rdquo; (which can be edited or fabricated), 
              BOCRA sends a secure digital container with all the rules, tools, and requirements 
              for a specific compliance task. Data is captured at the source.
            </p>
          </div>

          {/* Before vs After */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <h3 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-red-200 text-red-700 flex items-center justify-center text-xs font-bold">&#10005;</span>
                Traditional Reporting
              </h3>
              <ul className="space-y-2 text-sm text-red-700">
                <li>Companies create their own reports in PDF/Excel</li>
                <li>Data can be altered before submission</li>
                <li>Months of back-and-forth emails for corrections</li>
                <li>BOCRA staff manually reviews unstructured documents</li>
                <li>No real-time visibility into compliance status</li>
              </ul>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                Instance-Based Compliance
              </h3>
              <ul className="space-y-2 text-sm text-green-700">
                <li>BOCRA defines exactly what data is needed via schemas</li>
                <li>SHA-256 hashing ensures file integrity at the source</li>
                <li>Guided wizard UI eliminates guesswork and errors</li>
                <li>Automated validation and real-time analytics</li>
                <li>JWT-signed submissions create tamper-proof audit trails</li>
              </ul>
            </div>
          </div>

          {/* Collapsible deep-dive sections */}
          <InstanceDeepDive />

          {/* Download Sandbox + CTA */}
          <div className="mt-10" />
          <div className="bg-bocra-navy rounded-2xl p-8 text-white">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="max-w-2xl">
                <h3 className="text-2xl font-bold mb-3">Try It Yourself</h3>
                <p className="text-white/80 leading-relaxed">
                  Download our sandbox Instance template to understand the process before your first 
                  real submission. The sandbox includes sample fields, validation rules, and file 
                  requirements -- exactly like the real thing, in a safe environment.
                </p>
                <p className="text-white/60 text-sm mt-2">
                  Licensees can also access the <strong className="text-white/80">Instance Playground</strong> in 
                  their dashboard to test submissions without affecting live compliance data.
                </p>
              </div>
              <div className="flex flex-col gap-3 shrink-0">
                <a
                  href="/api/sandbox/download"
                  className="flex items-center gap-2 px-6 py-3 bg-bocra-blue rounded-lg font-medium hover:bg-bocra-blue/80 transition-colors text-center justify-center"
                >
                  <Download className="w-4 h-4" />
                  Download Sandbox Template
                </a>
                <Link
                  href="/login"
                  className="flex items-center gap-2 px-6 py-3 bg-white/10 rounded-lg font-medium hover:bg-white/20 transition-colors text-center justify-center"
                >
                  <FileCheck className="w-4 h-4" />
                  Open Instance Playground
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-16 lg:py-24 bg-bocra-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-bocra-navy mb-4">
              Our Digital Services
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Access regulatory services, submit compliance data, and engage
              with BOCRA through our modern digital platform.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service) => (
              <Link
                key={service.title}
                href={service.href}
                className="group p-6 rounded-xl border border-border bg-white hover:shadow-lg hover:border-bocra-blue/30 transition-all duration-200"
              >
                <div className="text-bocra-blue mb-4 group-hover:scale-110 transition-transform">
                  {service.icon}
                </div>
                <h3 className="font-semibold text-bocra-navy mb-2">
                  {service.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {service.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* BOCRA Mandate / Core Services */}
      <MandateSection />

      {/* PWA Install / Get the App */}
      <PWAInstallSection />

      {/* Legacy Portal CTA */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-bocra-navy to-bocra-blue p-8 text-white text-center">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
            <div className="relative z-10">
              <p className="text-white/70 text-sm font-medium uppercase tracking-wider mb-2">
                Smooth Transition
              </p>
              <h2 className="text-2xl lg:text-3xl font-bold mb-4">
                Your BOCRA Essentials, Still Safe
              </h2>
              <p className="text-white/80 max-w-2xl mx-auto mb-6 leading-relaxed">
                BOCRA is transitioning to a modern platform to serve you better. But everything you
                relied on &mdash; news, tenders, documents, careers, legislation, tools &mdash; is
                still here. Access all legacy services in one organized view.
              </p>
              <Link
                href="/legacy"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-bocra-navy rounded-lg font-semibold hover:bg-white/90 transition-colors"
              >
                Access Legacy Services
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Security Pillars */}
      <section className="bg-bocra-navy text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-3">
            Trust the Process, Not the Person
          </h2>
          <p className="text-white/70 max-w-2xl mx-auto mb-10">
            Since compliance data is self-reported, our entire security model ensures integrity at every step.
            BOCRA can now focus on <strong className="text-white">verification and validation</strong> instead of data collection.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            <div className="bg-white/5 rounded-xl p-5 border border-white/10">
              <Lock className="w-6 h-6 text-bocra-amber mb-3" />
              <h4 className="font-semibold mb-1">Zero-Trust Files</h4>
              <p className="text-sm text-white/60">SHA-256 hashing on client and server. Altered files are rejected immediately.</p>
            </div>
            <div className="bg-white/5 rounded-xl p-5 border border-white/10">
              <Fingerprint className="w-6 h-6 text-bocra-green mb-3" />
              <h4 className="font-semibold mb-1">Digital Signatures</h4>
              <p className="text-sm text-white/60">JWT-signed receipts cryptographically bind each submission to the licensee.</p>
            </div>
            <div className="bg-white/5 rounded-xl p-5 border border-white/10">
              <Eye className="w-6 h-6 text-bocra-blue mb-3" />
              <h4 className="font-semibold mb-1">Real-time Oversight</h4>
              <p className="text-sm text-white/60">Dashboards update the moment data is submitted. No more waiting months.</p>
            </div>
            <div className="bg-white/5 rounded-xl p-5 border border-white/10">
              <FileCheck className="w-6 h-6 text-bocra-orange mb-3" />
              <h4 className="font-semibold mb-1">Immutable Vault</h4>
              <p className="text-sm text-white/60">Submitted data cannot be altered. Full audit trail for every action.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
