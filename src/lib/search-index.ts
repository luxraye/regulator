export interface SearchItem {
  title: string;
  description: string;
  category: string;
  href: string;
  external?: boolean;
  tags?: string[];
}

export const searchIndex: SearchItem[] = [
  // ===== Pages =====
  { title: "Home", description: "BOCRA digital regulatory platform homepage", category: "Pages", href: "/", tags: ["main", "landing", "bocra"] },
  { title: "File a Complaint", description: "Report an issue with a telecommunications, broadcasting, postal, or internet service provider", category: "Pages", href: "/complaints", tags: ["consumer", "report", "issue", "anonymous"] },
  { title: "Track a Complaint", description: "Check the status of an existing complaint using your tracking code", category: "Pages", href: "/complaints", tags: ["status", "tracking code", "progress"] },
  { title: "Legacy Services", description: "Access all existing BOCRA website content — news, tenders, documents, careers", category: "Pages", href: "/legacy", tags: ["old website", "archive", "transition"] },
  { title: "USSD Complaint Service", description: "File complaints from any phone by dialing *123# — no smartphone or data needed", category: "Pages", href: "/ussd-demo", tags: ["rural", "feature phone", "offline", "sms", "dial"] },
  { title: "Register", description: "Create a citizen or licensee account on the BOCRA platform", category: "Pages", href: "/register", tags: ["sign up", "create account", "new user"] },
  { title: "Sign In", description: "Log in to your BOCRA dashboard", category: "Pages", href: "/login", tags: ["login", "access", "portal"] },
  { title: "About BOCRA", description: "Learn about the Botswana Communications Regulatory Authority", category: "Pages", href: "/about", tags: ["mandate", "mission", "history"] },
  { title: "Licensing", description: "Information about telecommunications, broadcasting, and postal licences", category: "Pages", href: "/licensing", tags: ["licence", "apply", "operator"] },

  // ===== Sectors / Mandate =====
  { title: "Telecommunications", description: "Regulation of mobile, fixed-line, and internet service providers including Mascom, Orange, BTC", category: "Mandate", href: "/#mandate", tags: ["mobile", "phone", "mascom", "orange", "btc", "spectrum"] },
  { title: "Broadcasting", description: "Regulation of radio and TV broadcasting including Yarona FM, Duma FM, Gabz FM, eBotswana", category: "Mandate", href: "/#mandate", tags: ["radio", "television", "tv", "yarona", "duma", "gabz"] },
  { title: "Postal Services", description: "Supervision of postal and courier services in Botswana including BotswanaPost", category: "Mandate", href: "/#mandate", tags: ["post", "courier", "mail", "delivery", "botswanapost"] },
  { title: "Internet & ICT", description: "Management of .bw domain, cybersecurity, and electronic communications", category: "Mandate", href: "/#mandate", tags: ["domain", "cyber", "ict", "digital", "cirt", "nic.net.bw"] },
  { title: "Type Approval", description: "Equipment certification and type approval for telecommunications devices", category: "Mandate", href: "https://typeapproval.bocra.org.bw/", external: true, tags: ["equipment", "certification", "device"] },
  { title: "Radio Spectrum Planning", description: "Allocation and management of the radio frequency spectrum", category: "Mandate", href: "/#mandate", tags: ["frequency", "allocation", "radio"] },
  { title: "The Numbering Plan", description: "National telecommunications numbering administration", category: "Mandate", href: "/#mandate", tags: ["phone numbers", "national plan"] },

  // ===== Instances / Compliance =====
  { title: "What is an Instance?", description: "A secure digital container for regulatory compliance — replaces PDF/email reporting", category: "Compliance", href: "/#how-instances-work", tags: ["vault", "container", "schema", "reporting"] },
  { title: "Classification Matrix", description: "6×6 matrix of DataType (A-F) × Scale (1-6) defining 36 compliance contexts", category: "Compliance", href: "/#how-instances-work", tags: ["matrix", "scale", "data type", "template"] },
  { title: "File Integrity (SHA-256)", description: "Every uploaded file is hashed client-side and server-side to detect tampering", category: "Compliance", href: "/#how-instances-work", tags: ["hash", "security", "verification", "tamper"] },
  { title: "Digital Signatures (JWT)", description: "Submissions are cryptographically signed to create tamper-proof audit trails", category: "Compliance", href: "/#how-instances-work", tags: ["jwt", "receipt", "signing", "audit"] },
  { title: "Instance Playground", description: "Sandbox environment for licensees to test Instance submissions safely", category: "Compliance", href: "/login", tags: ["sandbox", "test", "demo", "practice"] },

  // ===== Legacy Services: News & Media =====
  { title: "Latest News", description: "Press releases, announcements and updates from BOCRA", category: "News & Media", href: "https://www.bocra.org.bw/news", external: true, tags: ["press", "announcement"] },
  { title: "Events", description: "Upcoming and past BOCRA events", category: "News & Media", href: "https://www.bocra.org.bw/events", external: true, tags: ["calendar", "conference", "workshop"] },
  { title: "Speeches", description: "Public addresses by BOCRA leadership", category: "News & Media", href: "https://www.bocra.org.bw/speeches", external: true },
  { title: "Media Gallery", description: "Photos and videos from BOCRA activities", category: "News & Media", href: "https://www.bocra.org.bw/media-gallery", external: true, tags: ["photos", "videos", "gallery"] },

  // ===== Legacy Services: Documents =====
  { title: "Annual Reports", description: "Yearly performance and financial reports", category: "Documents", href: "https://www.bocra.org.bw/annual-reports", external: true, tags: ["financial", "yearly", "performance"] },
  { title: "Consultation Papers", description: "Public consultation documents for stakeholder input", category: "Documents", href: "https://www.bocra.org.bw/consultation-papers", external: true, tags: ["stakeholder", "input", "public"] },
  { title: "Regulations & Guidelines", description: "Regulatory instruments and frameworks", category: "Documents", href: "https://www.bocra.org.bw/regulations-guidelines", external: true, tags: ["rules", "framework", "instrument"] },
  { title: "Market Research", description: "Industry statistics and market analysis reports", category: "Documents", href: "https://www.bocra.org.bw/market-research", external: true, tags: ["statistics", "data", "industry", "analysis"] },
  { title: "Newsletters", description: "BOCRA periodic newsletters", category: "Documents", href: "https://www.bocra.org.bw/newsletters", external: true },

  // ===== Legacy Services: Legislation =====
  { title: "CRA Act", description: "Communications Regulatory Authority Act — founding legislation", category: "Legislation", href: "https://www.bocra.org.bw/cra-act", external: true, tags: ["law", "act", "parliament"] },
  { title: "Telecommunications Act", description: "Regulation of telecommunications services in Botswana", category: "Legislation", href: "https://www.bocra.org.bw/telecommunications-act", external: true, tags: ["law", "telecom"] },
  { title: "Broadcasting Regulations", description: "Rules governing broadcasting activities in Botswana", category: "Legislation", href: "https://www.bocra.org.bw/broadcasting-regulations", external: true, tags: ["law", "broadcast", "radio", "tv"] },
  { title: "Postal Services Act", description: "Legislation governing postal and courier services", category: "Legislation", href: "https://www.bocra.org.bw/postal-act", external: true, tags: ["law", "post"] },
  { title: "Cybercrime Act", description: "Cybercrime and Computer Related Crimes Act", category: "Legislation", href: "https://www.bocra.org.bw/cybercrime-act", external: true, tags: ["law", "cyber", "crime", "computer"] },

  // ===== Legacy Services: Tenders =====
  { title: "Open Tenders", description: "Current procurement opportunities at BOCRA", category: "Tenders", href: "https://www.bocra.org.bw/tenders", external: true, tags: ["procurement", "bid", "supply"] },
  { title: "Closed Tenders", description: "Previously awarded tenders", category: "Tenders", href: "https://www.bocra.org.bw/closed-tenders", external: true },
  { title: "Expression of Interest", description: "EOI notices from BOCRA", category: "Tenders", href: "https://www.bocra.org.bw/expression-of-interest", external: true, tags: ["eoi"] },

  // ===== Legacy Services: About =====
  { title: "CEO's Message", description: "Welcome message from the Chief Executive Officer", category: "About BOCRA", href: "https://www.bocra.org.bw/ceo-message", external: true },
  { title: "History of BOCRA", description: "BOCRA's journey from BTA to the converged regulator", category: "About BOCRA", href: "https://www.bocra.org.bw/history", external: true, tags: ["bta", "transition"] },
  { title: "Board Members", description: "Current Board of Directors", category: "About BOCRA", href: "https://www.bocra.org.bw/board-members", external: true, tags: ["directors", "governance"] },
  { title: "Strategic Plan", description: "Vision, mission and strategic objectives", category: "About BOCRA", href: "https://www.bocra.org.bw/strategic-plan", external: true, tags: ["vision", "mission"] },

  // ===== Legacy Services: Careers =====
  { title: "Current Vacancies", description: "Open positions at BOCRA", category: "Careers", href: "https://www.bocra.org.bw/vacancies", external: true, tags: ["jobs", "hiring", "employment", "work"] },
  { title: "Internships", description: "Internship and attachment opportunities at BOCRA", category: "Careers", href: "https://www.bocra.org.bw/internships", external: true, tags: ["intern", "attachment", "student"] },

  // ===== Legacy Services: Projects =====
  { title: "Universal Access & Service", description: "Bridging the digital divide in Botswana", category: "Projects", href: "https://www.bocra.org.bw/universal-access", external: true, tags: ["rural", "digital divide", "connectivity"] },
  { title: "Smart Botswana", description: "National digital transformation initiative", category: "Projects", href: "https://www.bocra.org.bw/smart-botswana", external: true, tags: ["digital", "transformation"] },
  { title: "Consumer Education", description: "Public awareness programmes for communications consumers", category: "Projects", href: "https://www.bocra.org.bw/consumer-education", external: true, tags: ["awareness", "education", "public"] },

  // ===== Online Portals =====
  { title: "BOCRA Portal", description: "Main regulatory services portal for licensees", category: "Portals", href: "https://portal.bocra.org.bw", external: true },
  { title: "QOS Monitoring", description: "Quality of Service monitoring for network operators", category: "Portals", href: "https://qos.bocra.org.bw", external: true, tags: ["quality", "network", "monitoring"] },
  { title: "Licensing Portal", description: "Apply for and manage licences online", category: "Portals", href: "https://licensing.bocra.org.bw", external: true, tags: ["apply", "manage", "licence"] },
  { title: "License Verification", description: "Verify an operator's licence status online", category: "Portals", href: "https://licenseverification.bocra.org.bw", external: true, tags: ["check", "verify", "valid"] },
  { title: "Register .bw Domain", description: "Register a Botswana country code domain name", category: "Portals", href: "https://nic.net.bw", external: true, tags: ["domain", "website", ".bw"] },
  { title: "Equipment Database", description: "ASMS Equipment Database (WebCP)", category: "Portals", href: "https://asms-webcp.bocra.org.bw", external: true, tags: ["asms", "equipment"] },

  // ===== Help & Support =====
  { title: "FAQs", description: "Frequently asked questions about BOCRA services", category: "Help", href: "https://www.bocra.org.bw/faqs", external: true, tags: ["questions", "help", "answers"] },
  { title: "Tariff Information", description: "Regulated service tariff details and pricing", category: "Help", href: "https://www.bocra.org.bw/tariffs", external: true, tags: ["price", "cost", "rate", "tariff"] },
  { title: "Privacy Notice", description: "How BOCRA handles your personal data", category: "Help", href: "https://www.bocra.org.bw/privacy-notice", external: true, tags: ["data", "privacy", "gdpr", "personal"] },
  { title: "Contact BOCRA", description: "Phone: +267 395 7755 | Email: info@bocra.org.bw | Plot 206/207, Independence Ave, Gaborone", category: "Help", href: "https://www.bocra.org.bw/contact", external: true, tags: ["phone", "email", "address", "gaborone"] },

  // ===== Service Providers (for complaint context) =====
  { title: "Mascom Wireless", description: "Mobile network operator — file a complaint about Mascom services", category: "Providers", href: "/complaints", tags: ["mascom", "mobile", "network"] },
  { title: "Orange Botswana", description: "Mobile network operator — file a complaint about Orange services", category: "Providers", href: "/complaints", tags: ["orange", "mobile", "network"] },
  { title: "BTC", description: "Botswana Telecommunications Corporation — file a complaint about BTC services", category: "Providers", href: "/complaints", tags: ["btc", "fixed line", "internet"] },
  { title: "BotswanaPost", description: "National postal service — file a complaint about postal services", category: "Providers", href: "/complaints", tags: ["post", "mail", "courier", "delivery"] },
];

export function searchItems(query: string): SearchItem[] {
  if (!query.trim()) return [];

  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);

  const scored = searchIndex.map((item) => {
    const haystack = [
      item.title,
      item.description,
      item.category,
      ...(item.tags || []),
    ]
      .join(" ")
      .toLowerCase();

    let score = 0;
    for (const term of terms) {
      if (item.title.toLowerCase().includes(term)) score += 10;
      if (item.category.toLowerCase().includes(term)) score += 5;
      if (item.description.toLowerCase().includes(term)) score += 3;
      if (item.tags?.some((t) => t.includes(term))) score += 4;
    }

    const allMatch = terms.every((term) => haystack.includes(term));
    if (!allMatch) score = 0;

    return { item, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((s) => s.item);
}
