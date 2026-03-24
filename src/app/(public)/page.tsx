import Link from "next/link";
import {
  Shield,
  FileSearch,
  BarChart3,
  Users,
  Lock,
  Eye,
  FileCheck,
  ArrowRight,
  Fingerprint,
} from "lucide-react";
import { MandateSection } from "@/components/home/mandate-section";
import { PWAInstallSection } from "@/components/home/pwa-install-section";
import { TranslatedHero } from "@/components/home/translated-hero";
import { TranslatedInstanceSection } from "@/components/home/translated-instance-section";

const services = [
  {
    icon: <Shield className="w-8 h-8" />,
    title: "Licensing",
    description: "Apply for and manage telecommunications, broadcasting, and postal licenses.",
    href: "/licensing",
    image: "/images/service-licensing.jpg",
  },
  {
    icon: <FileSearch className="w-8 h-8" />,
    title: "Compliance",
    description: "Submit regulatory compliance data through secure digital Instances.",
    href: "/login",
    image: "/images/service-compliance.jpg",
  },
  {
    icon: <BarChart3 className="w-8 h-8" />,
    title: "Publications",
    description: "Access regulatory publications, reports, and industry statistics.",
    href: "/publications",
    image: "/images/service-publications.jpg",
  },
  {
    icon: <Users className="w-8 h-8" />,
    title: "Consumer Protection",
    description: "File complaints and access consumer protection tools.",
    href: "/complaints",
    image: "/images/service-consumer.jpg",
  },
];

export default function HomePage() {
  return (
    <>
      {/* Translated Hero + Sectors */}
      <TranslatedHero />

      {/* Translated Instance Explainer */}
      <TranslatedInstanceSection />

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
                className="group rounded-xl border border-border bg-white hover:shadow-lg hover:border-bocra-blue/30 transition-all duration-200 overflow-hidden"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-32 object-cover bg-bocra-light"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                <div className="p-5">
                  <div className="text-bocra-blue mb-3 group-hover:scale-110 transition-transform inline-block">
                    {service.icon}
                  </div>
                  <h3 className="font-semibold text-bocra-navy mb-2">
                    {service.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {service.description}
                  </p>
                </div>
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
          <p className="text-bocra-amber text-xs font-semibold uppercase tracking-widest mb-3">
            The Umpire of Botswana&apos;s Communications Industry
          </p>
          <h2 className="text-3xl font-bold mb-3">
            Trust the Process, Not the Person
          </h2>
          <p className="text-white/70 max-w-2xl mx-auto mb-10">
            Like an umpire ensures fair play on the field, BOCRA ensures the communications
            industry operates within clear rules. Since compliance data is self-reported, our security
            model ensures integrity at every step — so BOCRA can focus on{" "}
            <strong className="text-white">verification and validation</strong>, not data collection.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            <div className="bg-white/5 rounded-xl p-5 border border-bocra-blue/30">
              <div className="w-10 h-10 rounded-lg bg-bocra-blue/20 flex items-center justify-center mb-3">
                <Lock className="w-5 h-5 text-bocra-blue" />
              </div>
              <h4 className="font-semibold mb-1">Zero-Trust Files</h4>
              <p className="text-sm text-white/60">SHA-256 hashing on client and server. Altered files are rejected immediately.</p>
            </div>
            <div className="bg-white/5 rounded-xl p-5 border border-bocra-green/30">
              <div className="w-10 h-10 rounded-lg bg-bocra-green/20 flex items-center justify-center mb-3">
                <Fingerprint className="w-5 h-5 text-bocra-green" />
              </div>
              <h4 className="font-semibold mb-1">Digital Signatures</h4>
              <p className="text-sm text-white/60">JWT-signed receipts cryptographically bind each submission to the licensee.</p>
            </div>
            <div className="bg-white/5 rounded-xl p-5 border border-bocra-amber/30">
              <div className="w-10 h-10 rounded-lg bg-bocra-amber/20 flex items-center justify-center mb-3">
                <Eye className="w-5 h-5 text-bocra-amber" />
              </div>
              <h4 className="font-semibold mb-1">Real-time Oversight</h4>
              <p className="text-sm text-white/60">Dashboards update the moment data is submitted. No more waiting months.</p>
            </div>
            <div className="bg-white/5 rounded-xl p-5 border border-bocra-orange/30">
              <div className="w-10 h-10 rounded-lg bg-bocra-orange/20 flex items-center justify-center mb-3">
                <FileCheck className="w-5 h-5 text-bocra-orange" />
              </div>
              <h4 className="font-semibold mb-1">Immutable Vault</h4>
              <p className="text-sm text-white/60">Submitted data cannot be altered. Full audit trail for every action.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
