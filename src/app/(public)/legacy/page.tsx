"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Newspaper,
  FileText,
  Briefcase,
  Scale,
  Users,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  ArrowLeft,
  Building2,
  Shield,
  Monitor,
  LandPlot,
  Landmark,
  Search,
} from "lucide-react";

const categories = [
  {
    id: "news",
    title: "News & Media",
    icon: <Newspaper className="w-5 h-5" />,
    color: "from-blue-500 to-blue-600",
    bg: "bg-blue-50",
    accent: "text-blue-600",
    border: "border-blue-200",
    items: [
      { label: "Latest News", desc: "Press releases, announcements and updates", url: "https://www.bocra.org.bw/news" },
      { label: "Events", desc: "Upcoming and past BOCRA events", url: "https://www.bocra.org.bw/events" },
      { label: "Speeches", desc: "Public addresses by BOCRA leadership", url: "https://www.bocra.org.bw/speeches" },
      { label: "Media Gallery", desc: "Photos and videos from BOCRA activities", url: "https://www.bocra.org.bw/media-gallery" },
    ],
  },
  {
    id: "tenders",
    title: "Tenders & Procurement",
    icon: <Briefcase className="w-5 h-5" />,
    color: "from-amber-500 to-amber-600",
    bg: "bg-amber-50",
    accent: "text-amber-600",
    border: "border-amber-200",
    items: [
      { label: "Open Tenders", desc: "Current procurement opportunities", url: "https://www.bocra.org.bw/tenders" },
      { label: "Closed Tenders", desc: "Previously awarded tenders", url: "https://www.bocra.org.bw/closed-tenders" },
      { label: "Expression of Interest", desc: "EOI notices from BOCRA", url: "https://www.bocra.org.bw/expression-of-interest" },
    ],
  },
  {
    id: "documents",
    title: "Documents & Publications",
    icon: <FileText className="w-5 h-5" />,
    color: "from-green-500 to-green-600",
    bg: "bg-green-50",
    accent: "text-green-600",
    border: "border-green-200",
    items: [
      { label: "Annual Reports", desc: "Yearly performance and financial reports", url: "https://www.bocra.org.bw/annual-reports" },
      { label: "Consultation Papers", desc: "Public consultation documents", url: "https://www.bocra.org.bw/consultation-papers" },
      { label: "Regulations & Guidelines", desc: "Regulatory instruments and frameworks", url: "https://www.bocra.org.bw/regulations-guidelines" },
      { label: "Market Research", desc: "Industry statistics and analysis", url: "https://www.bocra.org.bw/market-research" },
      { label: "Newsletters", desc: "BOCRA periodic newsletters", url: "https://www.bocra.org.bw/newsletters" },
    ],
  },
  {
    id: "legislation",
    title: "Legislation & Legal",
    icon: <Scale className="w-5 h-5" />,
    color: "from-purple-500 to-purple-600",
    bg: "bg-purple-50",
    accent: "text-purple-600",
    border: "border-purple-200",
    items: [
      { label: "CRA Act", desc: "Communications Regulatory Authority Act", url: "https://www.bocra.org.bw/cra-act" },
      { label: "Telecommunications Act", desc: "Regulation of telecommunications services", url: "https://www.bocra.org.bw/telecommunications-act" },
      { label: "Broadcasting Regulations", desc: "Rules governing broadcasting in Botswana", url: "https://www.bocra.org.bw/broadcasting-regulations" },
      { label: "Postal Services Act", desc: "Legislation governing postal services", url: "https://www.bocra.org.bw/postal-act" },
      { label: "Cybercrime Act", desc: "Cybercrime and Computer Related Crimes Act", url: "https://www.bocra.org.bw/cybercrime-act" },
    ],
  },
  {
    id: "about",
    title: "About BOCRA",
    icon: <Building2 className="w-5 h-5" />,
    color: "from-slate-500 to-slate-600",
    bg: "bg-slate-50",
    accent: "text-slate-600",
    border: "border-slate-200",
    items: [
      { label: "CEO's Message", desc: "Welcome message from the Chief Executive", url: "https://www.bocra.org.bw/ceo-message" },
      { label: "History", desc: "BOCRA's journey since establishment", url: "https://www.bocra.org.bw/history" },
      { label: "Board Members", desc: "Current Board of Directors", url: "https://www.bocra.org.bw/board-members" },
      { label: "Organogram", desc: "Organisational structure", url: "https://www.bocra.org.bw/organogram" },
      { label: "Strategic Plan", desc: "Vision, mission and strategic objectives", url: "https://www.bocra.org.bw/strategic-plan" },
    ],
  },
  {
    id: "projects",
    title: "Projects & Initiatives",
    icon: <LandPlot className="w-5 h-5" />,
    color: "from-teal-500 to-teal-600",
    bg: "bg-teal-50",
    accent: "text-teal-600",
    border: "border-teal-200",
    items: [
      { label: "Universal Access & Service", desc: "Bridging the digital divide", url: "https://www.bocra.org.bw/universal-access" },
      { label: "Smart Botswana", desc: "Digital transformation initiative", url: "https://www.bocra.org.bw/smart-botswana" },
      { label: "Consumer Education", desc: "Public awareness programmes", url: "https://www.bocra.org.bw/consumer-education" },
      { label: "Numbering Plan", desc: "National numbering plan administration", url: "https://www.bocra.org.bw/numbering-plan" },
    ],
  },
  {
    id: "careers",
    title: "Careers & Opportunities",
    icon: <Users className="w-5 h-5" />,
    color: "from-rose-500 to-rose-600",
    bg: "bg-rose-50",
    accent: "text-rose-600",
    border: "border-rose-200",
    items: [
      { label: "Current Vacancies", desc: "Open positions at BOCRA", url: "https://www.bocra.org.bw/vacancies" },
      { label: "Internships", desc: "Internship and attachment opportunities", url: "https://www.bocra.org.bw/internships" },
      { label: "Working at BOCRA", desc: "Employee benefits and culture", url: "https://www.bocra.org.bw/working-at-bocra" },
    ],
  },
  {
    id: "tools",
    title: "Online Tools & Portals",
    icon: <Monitor className="w-5 h-5" />,
    color: "from-indigo-500 to-indigo-600",
    bg: "bg-indigo-50",
    accent: "text-indigo-600",
    border: "border-indigo-200",
    items: [
      { label: "BOCRA Portal", desc: "Main regulatory services portal", url: "https://portal.bocra.org.bw" },
      { label: "QOS Monitoring", desc: "Quality of Service monitoring portal", url: "https://qos.bocra.org.bw" },
      { label: "Licensing Portal", desc: "Apply for and manage licences", url: "https://licensing.bocra.org.bw" },
      { label: "Type Approval", desc: "Equipment type approval system", url: "https://typeapproval.bocra.org.bw" },
      { label: "License Verification", desc: "Verify an operator's licence status", url: "https://licenseverification.bocra.org.bw" },
      { label: "Register .bw Domain", desc: "Register a Botswana domain name", url: "https://nic.net.bw" },
      { label: "Equipment Database", desc: "ASMS Equipment Database (WebCP)", url: "https://asms-webcp.bocra.org.bw" },
    ],
  },
  {
    id: "support",
    title: "Help & Support",
    icon: <HelpCircle className="w-5 h-5" />,
    color: "from-cyan-500 to-cyan-600",
    bg: "bg-cyan-50",
    accent: "text-cyan-600",
    border: "border-cyan-200",
    items: [
      { label: "FAQs", desc: "Frequently asked questions", url: "https://www.bocra.org.bw/faqs" },
      { label: "Tariff Information", desc: "Regulated service tariff details", url: "https://www.bocra.org.bw/tariffs" },
      { label: "File a Complaint", desc: "Submit a complaint against an operator", url: "/complaints" },
      { label: "Privacy Notice", desc: "How BOCRA handles your personal data", url: "https://www.bocra.org.bw/privacy-notice" },
      { label: "Contact Us", desc: "Get in touch with BOCRA", url: "https://www.bocra.org.bw/contact" },
    ],
  },
];

export default function LegacyPortalPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const filtered = searchQuery.trim()
    ? categories
        .map((cat) => ({
          ...cat,
          items: cat.items.filter(
            (item) =>
              item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
              item.desc.toLowerCase().includes(searchQuery.toLowerCase())
          ),
        }))
        .filter((cat) => cat.items.length > 0)
    : categories;

  return (
    <>
      {/* Header Banner */}
      <section className="bg-gradient-to-br from-bocra-navy via-bocra-navy to-bocra-blue py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to New Platform
          </Link>
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-white/80 text-xs font-medium mb-4">
              <Landmark className="w-3 h-3" />
              Legacy Services Directory
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              BOCRA Services Archive
            </h1>
            <p className="text-white/70 text-lg leading-relaxed">
              All the services, documents, and tools you&apos;ve relied on from the original
              BOCRA website &mdash; organized and accessible. As we transition to the new
              compliance platform, nothing gets left behind.
            </p>
          </div>
        </div>
      </section>

      {/* Search + Quick Stats */}
      <section className="bg-white border-b border-border sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search legacy services..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-bocra-light text-sm focus:outline-none focus:ring-2 focus:ring-bocra-blue/20 focus:border-bocra-blue"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{categories.length} categories</span>
              <span className="text-border">|</span>
              <span>{categories.reduce((a, c) => a + c.items.length, 0)} services</span>
            </div>
          </div>
        </div>
      </section>

      {/* Cards Grid */}
      <section className="py-12 bg-bocra-light min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <Search className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium text-bocra-navy">No services found</p>
              <p className="text-sm text-muted-foreground mt-1">
                Try a different search term
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((cat) => {
                const isExpanded = expandedCard === cat.id;
                const visibleItems = isExpanded ? cat.items : cat.items.slice(0, 3);
                return (
                  <div
                    key={cat.id}
                    className={`rounded-2xl border bg-white overflow-hidden transition-all duration-300 ${
                      isExpanded ? "md:col-span-2 lg:col-span-2 shadow-lg" : "shadow-sm hover:shadow-md"
                    } ${cat.border}`}
                  >
                    {/* Card header */}
                    <div className={`bg-gradient-to-r ${cat.color} p-5`}>
                      <div className="flex items-center gap-3 text-white">
                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                          {cat.icon}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">{cat.title}</h3>
                          <p className="text-white/70 text-xs">{cat.items.length} services</p>
                        </div>
                      </div>
                    </div>

                    {/* Card items */}
                    <div className="p-4 space-y-2">
                      {visibleItems.map((item) => {
                        const isExternal =
                          item.url.startsWith("http") || item.url.startsWith("//");
                        const Comp = isExternal ? "a" : Link;
                        const props = isExternal
                          ? { href: item.url, target: "_blank", rel: "noopener noreferrer" }
                          : { href: item.url };
                        return (
                          <Comp
                            key={item.label}
                            {...(props as any)}
                            className={`flex items-center gap-3 p-3 rounded-xl ${cat.bg} hover:brightness-95 transition-all group`}
                          >
                            <div className="flex-1 min-w-0">
                              <p className={`font-medium text-sm ${cat.accent} group-hover:underline`}>
                                {item.label}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {item.desc}
                              </p>
                            </div>
                            {isExternal ? (
                              <ExternalLink className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                            )}
                          </Comp>
                        );
                      })}
                    </div>

                    {/* Expand toggle */}
                    {cat.items.length > 3 && (
                      <div className="px-4 pb-4">
                        <button
                          onClick={() =>
                            setExpandedCard(isExpanded ? null : cat.id)
                          }
                          className={`w-full text-center text-xs font-medium py-2 rounded-lg transition-colors ${cat.bg} ${cat.accent} hover:brightness-95`}
                        >
                          {isExpanded
                            ? "Show less"
                            : `+ ${cat.items.length - 3} more`}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Back to new platform CTA */}
          <div className="mt-16 text-center">
            <div className="inline-flex flex-col items-center gap-3 p-8 bg-white rounded-2xl border border-border shadow-sm max-w-lg">
              <Shield className="w-8 h-8 text-bocra-blue" />
              <h3 className="text-lg font-bold text-bocra-navy">
                Ready for the New Platform?
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The new BOCRA digital compliance platform brings secure,
                schema-driven Instances for streamlined regulatory reporting.
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-bocra-navy text-white rounded-lg font-medium text-sm hover:bg-bocra-navy/90 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Return to New Platform
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
