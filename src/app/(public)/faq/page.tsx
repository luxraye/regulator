"use client";

import { useState } from "react";
import Link from "next/link";
import { HelpCircle, ChevronDown, ChevronUp, Search, ShieldCheck, LifeBuoy, FileText } from "lucide-react";

interface FaqItem {
  q: string;
  a: string;
  category: "eligibility" | "rules" | "evaluation" | "support" | "ip";
}

const FAQS: FaqItem[] = [
  {
    category: "eligibility",
    q: "Who is eligible to participate in the CEDA Innovation Portal challenges?",
    a: "Eligibility criteria are defined programmatically per Challenge Instance. For the Flagship CEDA Innovation Challenge 2026, registered businesses owned by citizen youth aged 18 to 35 with valid Omang identification and registered teams of 1 to 5 members are eligible. Partner instances may have tailored criteria specified in their rules schema.",
  },
  {
    category: "eligibility",
    q: "Do I need a registered company with CIPA before applying?",
    a: "For early idea stages, individual innovator accounts can be created with an Omang number. For formal commercial acceleration and flagship grant disbursements, valid CIPA registration and youth shareholding verification are enforced prior to shortlist adjudications.",
  },
  {
    category: "rules",
    q: "What file formats and size limits are accepted during submission pre-flight?",
    a: "The pre-emptive security guard allows PDF pitch decks and business plans (up to 25 MB) and ZIP source/prototype bundles (up to 50 MB). Executable files (.exe, .bat, .sh, .scr) and active macros are strictly blocked at upload time.",
  },
  {
    category: "rules",
    q: "What is the Rules Engine and Definition Hash?",
    a: "Every Instance's entire configuration—including eligibility gates, stage deadlines, submission templates, and rubric weights—is serialized and cryptographically hashed with SHA-256. This ensures complete immutability and fairness during competitive rounds.",
  },
  {
    category: "evaluation",
    q: "How does the evaluation and scoring process work?",
    a: "Submissions undergo automated pre-flight verification, followed by independent blind scoring by assigned evaluators based on the 100-point rubric. Evaluators then conduct collaborative consensus discussions. Shortlisted ventures advance to the Adjudication Panel, with select public-vote rounds where enabled.",
  },
  {
    category: "evaluation",
    q: "How are score ties broken on the leaderboard?",
    a: "The leaderboard calculation is fully reproducible and deterministic: ties are resolved first by total score, then by Innovation & Technical Feasibility, Commercial Viability, Economic Impact, Presentation, and finally submission timestamp.",
  },
  {
    category: "ip",
    q: "Who owns the Intellectual Property (IP) submitted through the portal?",
    a: "All intellectual property rights remain 100% with the submitting innovator or team. Evaluators and panel adjudicators are bound by statutory Non-Disclosure Agreements and conflict of interest declarations enforced on the platform.",
  },
  {
    category: "support",
    q: "What are the live chat operating hours for CEDA consultants?",
    a: "Live consultant chat is active from 09:00 to 16:00 CAT on official Botswana working days (Monday through Friday, excluding gazetted public holidays). Outside these hours, innovators can submit asynchronous inquiries or urgent support tickets.",
  },
  {
    category: "support",
    q: "What is the response time for technical faults and system outages?",
    a: "Our hosting SLA provides a 2-hour response and 8-hour target resolution for P1 critical outages, 4-hour response / 24-hour resolution for P2 degraded services, and 24-hour response / 3 working days for P3 general inquiries. Faults can be submitted 24/7 at /support.",
  },
];

const CATEGORIES = [
  { id: "all", label: "All Questions" },
  { id: "eligibility", label: "Eligibility & Teams" },
  { id: "rules", label: "Submissions & Rules" },
  { id: "evaluation", label: "Scoring & Panel" },
  { id: "ip", label: "IP & Confidentiality" },
  { id: "support", label: "Support & SLA" },
];

export default function FaqPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [openItems, setOpenItems] = useState<Record<number, boolean>>({ 0: true, 1: true });

  const toggle = (idx: number) => {
    setOpenItems((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const filteredFaqs = FAQS.filter((faq) => {
    const matchesCat = activeCategory === "all" || faq.category === activeCategory;
    const matchesSearch =
      faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.a.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-ceda-blue/10 text-ceda-blue dark:text-ceda-gold">
          <HelpCircle size={14} /> Knowledge Base & Assistance
        </span>
        <h1 className="text-3xl md:text-4xl font-black text-neutral-900 dark:text-white tracking-tight">
          Frequently Asked Questions
        </h1>
        <p className="text-sm md:text-base text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
          Clear answers on eligibility requirements, submission security, deterministic scoring, intellectual property rights, and support SLAs.
        </p>

        {/* Search Bar */}
        <div className="relative max-w-md mx-auto pt-4">
          <Search size={18} className="absolute left-3.5 top-7 text-neutral-400" />
          <input
            type="text"
            placeholder="Search questions by keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-neutral-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-ceda-blue"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeCategory === cat.id
                ? "bg-ceda-blue text-white shadow-sm"
                : "bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Accordion FAQ List */}
      <div className="space-y-3 max-w-3xl mx-auto">
        {filteredFaqs.length === 0 ? (
          <div className="p-8 text-center text-sm text-neutral-500 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700">
            No matching questions found for &ldquo;{searchQuery}&rdquo;.
          </div>
        ) : (
          filteredFaqs.map((faq, idx) => {
            const isOpen = !!openItems[idx];
            return (
              <div
                key={idx}
                className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 overflow-hidden shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-bold text-sm text-neutral-900 dark:text-white hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp size={18} className="text-neutral-400 shrink-0" />
                  ) : (
                    <ChevronDown size={18} className="text-neutral-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs md:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed border-t border-neutral-100 dark:border-neutral-700/60 bg-neutral-50/50 dark:bg-neutral-800/40">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
        <Link
          href="/support"
          className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:border-ceda-blue transition shadow-sm space-y-2 group"
        >
          <div className="flex items-center gap-2 text-ceda-blue dark:text-ceda-gold font-bold text-sm">
            <LifeBuoy size={18} />
            <span>Support & Ticket Desk</span>
          </div>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Submit hosting fault reports, track resolution SLAs, or consult technical support agents.
          </p>
        </Link>

        <Link
          href="/status"
          className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:border-ceda-blue transition shadow-sm space-y-2 group"
        >
          <div className="flex items-center gap-2 text-ceda-blue dark:text-ceda-gold font-bold text-sm">
            <ShieldCheck size={18} />
            <span>Infrastructure & Status</span>
          </div>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Review live health telemetry, regional cloud topology (us-east4), and monthly hosting economics.
          </p>
        </Link>

        <Link
          href="/instances"
          className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:border-ceda-blue transition shadow-sm space-y-2 group"
        >
          <div className="flex items-center gap-2 text-ceda-blue dark:text-ceda-gold font-bold text-sm">
            <FileText size={18} />
            <span>Active Challenges</span>
          </div>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Explore live challenge instances, submission guidelines, rubrics, and published leaderboards.
          </p>
        </Link>
      </div>
    </div>
  );
}
