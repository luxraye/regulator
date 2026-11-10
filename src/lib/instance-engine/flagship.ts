import type { InstanceDefinition } from "./types";
import type { PrismaClient } from "@prisma/client";

/**
 * Flagship CEDA Hackathon 2026 Instance Definition
 * Built strictly according to official competition specifications.
 */
export const FLAGSHIP_CEDA_HACKATHON_2026: InstanceDefinition = {
  meta: {
    name: "CEDA Innovation Management Portal Hackathon 2026",
    slug: "ceda-hackathon-2026",
    partnerSlug: "ceda",
    description:
      "Design, build and deploy the next-generation CEDA Innovation Management Portal. Open to citizen youth innovators and software companies to deliver an end-to-end, tamper-evident portal for competitions, ideas scoring, and fund disbursement.",
    category: "Software Engineering & Digital Transformation",
    prizes: [
      { rank: 1, title: "1st Prize", amountPula: 40000, rewardText: "P40,000 + Incubation & Pilot Deployment Contract" },
      { rank: 2, title: "2nd Prize", amountPula: 25000, rewardText: "P25,000 + CEDA Mentorship" },
      { rank: 3, title: "3rd Prize", amountPula: 15000, rewardText: "P15,000 + Tech Advisory" },
      { rank: 4, title: "4th Prize", amountPula: 10000, rewardText: "P10,000" },
      { rank: 5, title: "5th Prize", amountPula: 5000, rewardText: "P5,000" },
    ],
    bannerUrl: "/images/hero.jpg",
    contactEmail: "hackathon@ceda.co.bw",
  },
  timeline: [
    {
      id: "stage-reg",
      name: "Registration & Team Formation",
      kind: "registration",
      start: "2026-11-09T08:00:00Z",
      end: "2026-11-12T23:59:59Z",
      roles: ["INNOVATOR"],
      gate: "none",
      description: "Teams self-register, declare citizen ownership, verify Omang IDs, and assemble 1 to 5 members.",
    },
    {
      id: "stage-brief",
      name: "Official Briefing Session",
      kind: "briefing",
      start: "2026-11-13T13:00:00Z",
      end: "2026-11-13T15:00:00Z",
      roles: ["INNOVATOR", "ORGANISER"],
      gate: "eligibility_passed",
      description: "Briefing on competition architecture, judging criteria, and live Q&A.",
    },
    {
      id: "stage-build",
      name: "Build Window & Sprints",
      kind: "build_window",
      start: "2026-11-13T06:00:00Z", // 08:00 CAT is 06:00 UTC
      end: "2026-11-23T15:00:00Z", // 17:00 CAT is 15:00 UTC
      roles: ["INNOVATOR"],
      gate: "eligibility_passed",
      description: "Intense 11-day development window. Direct consultant live chat available 09:00–16:00 on business days.",
    },
    {
      id: "stage-clarify",
      name: "Clarification Checkpoints",
      kind: "clarification",
      start: "2026-11-16T08:00:00Z",
      end: "2026-11-20T17:00:00Z",
      roles: ["INNOVATOR", "CONSULTANT"],
      gate: "eligibility_passed",
      description: "Scheduled clarification meetings on 16 and 20 November.",
    },
    {
      id: "stage-submit",
      name: "Final Submission & Integrity Seal",
      kind: "submission",
      start: "2026-11-20T00:00:00Z",
      end: "2026-11-23T15:00:00Z", // strict server deadline, no extra time
      roles: ["INNOVATOR"],
      gate: "eligibility_passed",
      description: "Pre-flight checks run. Teams submit proposal (<=10 pages), live URL, walkthrough video, source code, manual, and README.",
    },
    {
      id: "stage-screen",
      name: "Administrative & Pre-flight Screening",
      kind: "screening",
      start: "2026-11-23T16:00:00Z",
      end: "2026-11-24T23:59:59Z",
      roles: ["ORGANISER"],
      gate: "screened",
      description: "Automated guards and administrative review confirm file sizes, magic bytes, and compliance declarations.",
    },
    {
      id: "stage-scoring",
      name: "Independent Blind Scoring",
      kind: "scoring_round",
      start: "2026-11-25T08:00:00Z",
      end: "2026-11-30T17:00:00Z",
      roles: ["EVALUATOR"],
      gate: "scoring_complete",
      description: "Evaluators declare conflicts before blind scoring against 100-point rubric. Disagreements >20 flagged.",
    },
    {
      id: "stage-shortlist",
      name: "Top 5 Shortlist Announcement",
      kind: "shortlist",
      start: "2026-11-30T18:00:00Z",
      end: "2026-12-01T12:00:00Z",
      roles: ["ORGANISER", "ADJUDICATOR"],
      gate: "top5",
      description: "Consensus meeting ratifies top 5 teams based on mean evaluation scores.",
    },
    {
      id: "stage-pitch",
      name: "Top 5 In-Person Pitch & Prize-Giving",
      kind: "live_pitch",
      start: "2026-12-03T07:00:00Z",
      end: "2026-12-03T16:00:00Z",
      roles: ["INNOVATOR", "ADJUDICATOR", "ORGANISER"],
      gate: "top5",
      description: "Live pitch at CEDA Head Office, Gaborone. Public vote counts for 10%.",
    },
    {
      id: "stage-award",
      name: "Award Ceremony & Disbursement",
      kind: "award",
      start: "2026-12-03T16:00:00Z",
      end: "2026-12-03T18:00:00Z",
      roles: ["ORGANISER", "ADJUDICATOR"],
      gate: "awarded",
      description: "Cryptographic award certificates generated with verifiable QR codes and public ledger update.",
    },
  ],
  eligibility: [
    {
      field: "age",
      op: "between",
      value: [18, 35],
      label: "Youth Age Requirement",
      failureMessage: "Lead innovator and youth co-founders must be aged between 18 and 35.",
    },
    {
      field: "youthShareholding",
      op: "gt",
      value: 50,
      label: "Citizen Youth Shareholding",
      failureMessage: "Company must have more than 50% equity held by Botswana citizens aged 18–35.",
    },
    {
      field: "hasCompany",
      op: "eq",
      value: true,
      label: "Registered Entity (CIPA)",
      failureMessage: "Applicant must be registered with the Companies and Intellectual Property Authority (CIPA).",
    },
    {
      field: "affiliationDeclared",
      op: "eq",
      value: true,
      label: "Affiliation Declaration",
      failureMessage: "Applicant must complete the conflicts and affiliations declaration.",
    },
    {
      field: "consentGiven",
      op: "eq",
      value: true,
      label: "Data Protection Act Consent",
      failureMessage: "Consent under Botswana Data Protection Act 2024 must be acknowledged.",
    },
  ],
  team: {
    minSize: 1,
    maxSize: 5,
    requiredMemberFields: ["name", "email", "phone", "omang", "roleInTeam", "shareholding"],
    requireLeadCitizen: true,
  },
  forms: [
    {
      stageId: "stage-submit",
      title: "Technical Submission Dossier",
      description: "All submission files and links required for technical evaluation.",
      fields: [
        {
          key: "live_url",
          label: "Live Working Portal URL (HTTPS)",
          type: "url",
          required: true,
          hint: "The accessible public URL where CEDA judges can test the deployed application.",
        },
        {
          key: "video_url",
          label: "Video Walkthrough URL",
          type: "url",
          required: true,
          hint: "YouTube, Vimeo or Loom link showing end-to-end features under 5 minutes.",
        },
        {
          key: "repo_url",
          label: "Source Code Repository URL",
          type: "url",
          required: true,
          hint: "GitHub, GitLab, or Bitbucket URL containing portal source code.",
        },
        {
          key: "cloud_provider",
          label: "Cloud Hosting Provider & Region",
          type: "text",
          required: true,
          hint: "e.g. Firebase App Hosting (europe-west1 / southafrica-north) with storage breakdown.",
        },
        {
          key: "tech_stack_summary",
          label: "Architecture & Stack Summary",
          type: "textarea",
          required: true,
          hint: "Frameworks, databases, security measures, and caching layers used.",
        },
      ],
      fileSlots: [
        {
          key: "proposal_pdf",
          label: "Technical Proposal (Max 10 Pages)",
          description: "Architecture, data models, security controls, and maintenance plan.",
          required: true,
          allowedTypes: [".pdf"],
          maxSizeMb: 25,
          maxPages: 10,
        },
        {
          key: "source_code_archive",
          label: "Full Source Code Archive (.zip)",
          description: "Clean codebase archive without node_modules or binary build files.",
          required: true,
          allowedTypes: [".zip"],
          maxSizeMb: 150,
        },
        {
          key: "user_manual_pdf",
          label: "User Manual & Administration Guide",
          description: "Step-by-step documentation for Innovators, Evaluators, Adjudicators, and Admins.",
          required: true,
          allowedTypes: [".pdf"],
          maxSizeMb: 25,
        },
        {
          key: "readme_doc",
          label: "README & Deployment Instructions",
          description: "Setup commands, environment variables reference, and local launch instructions.",
          required: true,
          allowedTypes: [".pdf", ".csv"],
          maxSizeMb: 10,
        },
      ],
    },
  ],
  guards: {
    magicBytes: true,
    sizeCaps: true,
    archiveInspection: {
      enabled: true,
      maxRatio: 100,
      forbidZipSlip: true,
      maxDepth: 3,
    },
    duplicateDetection: true,
    pdfPageCountCap: 10,
    malwareScan: true,
    secretScanning: true,
    dependencyCheck: true,
    linkReachable: true,
  },
  faithfulness: {
    allQuestionsAnsweredOrNA: true,
    noEditsAfterDeadline: true,
    affiliationsDeclared: true,
    consentsRecorded: true,
    duplicateSubmissionForbidden: true,
  },
  rubric: {
    criteria: [
      {
        key: "technical",
        label: "Technical Architecture & Security",
        weight: 25,
        guide: "Role-based access, audit trails, responsiveness, cybersecurity, data privacy, and scalability.",
      },
      {
        key: "functionality",
        label: "Portal Functionality & Workflows",
        weight: 20,
        guide: "Programmable instances, collaborative scoring, live chat, FAQs, alert subscriptions, and support details.",
      },
      {
        key: "general",
        label: "General Platform & Cloud Hosting",
        weight: 15,
        guide: "CEDA layout & typography, browser execution, OTP/password authentication, cloud-hosting disclosure, and 24/7 availability.",
      },
      {
        key: "ux_design",
        label: "UX, Accessibility & Design",
        weight: 15,
        guide: "Intuitive navigation, clear labels, attractive visual hierarchy, and mobile responsiveness.",
      },
      {
        key: "presentation",
        label: "Pitch Presentation & Documentation",
        weight: 15,
        guide: "Quality of proposal (<=10 pages), video demo, user manual, and team communication.",
      },
      {
        key: "innovation",
        label: "Innovation & Distinctive Capabilities",
        weight: 10,
        guide: "Programmable competition instances engine, tamper-evident hash chaining, and multi-tenant partner spaces.",
      },
    ],
    reviewersPerEntry: 2,
    blind: true,
    disagreementThreshold: 20,
    consensusRequired: true,
    publicVoteWeight: 10,
  },
  workflow: {
    screeningRequired: true,
    blindScoring: true,
    conflictDeclarationRequired: true,
    adjudicationPanelRequired: true,
    consensusMeetingRequired: true,
    autoShortlistThreshold: 70,
  },
  privacy: {
    dpaConsentText:
      "In compliance with the Data Protection Act, 2024 of Botswana, CEDA collects and processes team and applicant information solely for the evaluation, adjudication, and administration of the 2026 Innovation Hackathon. Data will not be shared with unauthorised third parties without written consent.",
    retentionMonths: 36,
    purpose: "Hackathon submission evaluation, eligibility audit, and award disbursement.",
    regulatoryAuthority: "Information and Data Protection Commission, Botswana",
  },
  channels: {
    alertTypes: ["EMAIL", "PORTAL", "SMS"],
    faqs: [
      {
        q: "Who is eligible to participate?",
        a: "Citizen youth aged 18 to 35 with a registered Botswana company owned more than 50% by citizen youth.",
        category: "eligibility",
      },
      {
        q: "What is the team size limit?",
        a: "Teams can have between 1 and 5 members.",
        category: "teams",
      },
      {
        q: "What is the maximum proposal length?",
        a: "Technical proposals must not exceed 10 pages in PDF format.",
        category: "submissions",
      },
    ],
    supportContacts: [
      {
        name: "CEDA Innovation Desk",
        role: "Organising Committee",
        email: "innovation@ceda.co.bw",
        phone: "+267 317 0895",
        turnaroundHours: 12,
      },
      {
        name: "Technical Support Sidecar",
        role: "Hosting & Fault Resolution",
        email: "tech-support@ceda.co.bw",
        turnaroundHours: 4,
      },
    ],
    liveChat: {
      enabled: true,
      operatingHours: "09:00 - 16:00 CAT",
      businessDaysOnly: true,
      agents: ["tebogo", "gofaone"],
      offlineMessage: "CEDA advisors are available Monday to Friday from 09:00 to 16:00 CAT. Please leave a message.",
    },
    observerAccess: true,
  },
};

/**
 * Ensures the flagship Hackathon 2026 instance exists in the database.
 */
/**
 * Makes sure the flagship Instance exists. Safe to call from any page:
 * it creates the CEDA partner if missing and never throws, so a seeding
 * problem can't take the home page down.
 */
export async function ensureFlagshipInstance(prismaClient: PrismaClient) {
  try {
    const existing = await prismaClient.instance.findUnique({
      where: { slug: "ceda-hackathon-2026" },
    });
    if (existing) return existing;

    const partner = await prismaClient.partner.upsert({
      where: { slug: "ceda" },
      update: {},
      create: { name: "Citizen Entrepreneurial Development Agency", slug: "ceda", primaryColor: "#d94914" },
    });

    const author =
      (await prismaClient.user.findFirst({ where: { role: "SUPERADMIN" } })) ??
      (await prismaClient.user.findFirst({ where: { role: "ADMIN" } }));

    const { computeRulesHash, canonicalizeJson } = await import("./canonical");
    const rulesHash = computeRulesHash(FLAGSHIP_CEDA_HACKATHON_2026);
    const canonJson = JSON.parse(canonicalizeJson(FLAGSHIP_CEDA_HACKATHON_2026));

    const timeline = FLAGSHIP_CEDA_HACKATHON_2026.timeline;
    const opensAt = new Date(timeline[0].start);
    const closesAt = new Date(timeline[timeline.length - 1].end);

    return await prismaClient.instance.create({
      data: {
        partnerId: partner.id,
        name: FLAGSHIP_CEDA_HACKATHON_2026.meta.name,
        slug: "ceda-hackathon-2026",
        description: FLAGSHIP_CEDA_HACKATHON_2026.meta.description,
        definition: canonJson,
        rulesHash,
        status: "LIVE",
        opensAt,
        closesAt,
        ...(author
          ? {
              versions: {
                create: {
                  version: 1,
                  reason: "Initial publication of official flagship Hackathon 2026 competition definition.",
                  definition: canonJson,
                  rulesHash,
                  diff: { initial: true },
                  createdById: author.id,
                },
              },
            }
          : {}),
      },
    });
  } catch (err) {
    console.error("ensureFlagshipInstance failed", err);
    return null;
  }
}
