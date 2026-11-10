import { FLAGSHIP_CEDA_HACKATHON_2026 } from "./flagship";
import type { InstanceDefinition } from "./types";

export interface BlueprintTemplate {
  id: string;
  key: string;
  name: string;
  category: string;
  description: string;
  partnerSlug: string;
  defaultPrizes: { rank: number; title: string; amountPula?: number; rewardText?: string }[];
  definition: InstanceDefinition;
}

export const AGRITECH_CHALLENGE_BLUEPRINT: InstanceDefinition = {
  meta: {
    name: "CEDA AgriTech Innovation Challenge 2026",
    slug: "ceda-agritech-2026",
    partnerSlug: "ceda",
    description: "Empowering citizen youth to revolutionize Botswana's food systems through smart solar irrigation, cold chain logistics, automated livestock tracking, and climate-resilient horticulture.",
    category: "AgriTech & Food Security",
    prizes: [
      { rank: 1, title: "Grand Champion", amountPula: 60000, rewardText: "P60,000 Grant + CEDA Agribusiness Pilot" },
      { rank: 2, title: "Runner-Up", amountPula: 40000, rewardText: "P40,000 + Agronomist Advisory" },
      { rank: 3, title: "Third Place", amountPula: 25000, rewardText: "P25,000 + Input Subsidy Support" },
      { rank: 4, title: "Regional Impact", amountPula: 15000, rewardText: "P15,000" },
      { rank: 5, title: "Innovation Merit", amountPula: 10000, rewardText: "P10,000" },
    ],
    bannerUrl: "/images/hero.jpg",
    contactEmail: "agritech@ceda.co.bw",
  },
  timeline: [
    {
      id: "stage-agri-reg",
      name: "Registration & Concept Note",
      kind: "registration",
      start: "2026-11-15T08:00:00Z",
      end: "2026-12-05T17:00:00Z",
      roles: ["INNOVATOR"],
      gate: "none",
      description: "Submit your team composition, farm location, target agricultural sector, and initial problem statement.",
    },
    {
      id: "stage-agri-elig",
      name: "Citizen & Land Eligibility Screening",
      kind: "eligibility_check",
      start: "2026-12-05T17:00:00Z",
      end: "2026-12-10T17:00:00Z",
      roles: ["ADMIN"],
      gate: "eligibility_passed",
      description: "Automated verification of Omang, majority youth shareholding, and agricultural land allocation / lease.",
    },
    {
      id: "stage-agri-detailed",
      name: "Detailed Technical & Field Pilot Submission",
      kind: "submission",
      start: "2026-12-10T17:00:00Z",
      end: "2026-12-31T23:59:00Z",
      roles: ["INNOVATOR"],
      gate: "screened",
      description: "Submit hardware schematics, water/yield projections, budget breakdown, and pilot site photos.",
    },
    {
      id: "stage-agri-eval",
      name: "Technical Expert Scoring",
      kind: "scoring_round",
      start: "2027-01-02T08:00:00Z",
      end: "2027-01-12T17:00:00Z",
      roles: ["EVALUATOR"],
      gate: "scoring_complete",
      description: "Blind independent peer evaluation by agronomy, mechanical engineering, and market access specialists.",
    },
    {
      id: "stage-agri-pitch",
      name: "Adjudication Panel & Demonstration",
      kind: "live_pitch",
      start: "2027-01-15T09:00:00Z",
      end: "2027-01-15T17:00:00Z",
      roles: ["ADJUDICATOR", "ADMIN"],
      gate: "shortlisted",
      description: "Top 10 finalists present live working prototypes to the CEDA Board and Ministry of Agriculture.",
    },
    {
      id: "stage-agri-award",
      name: "Grand Award Ceremony",
      kind: "award",
      start: "2027-01-20T10:00:00Z",
      end: "2027-01-20T16:00:00Z",
      roles: ["ADMIN"],
      gate: "awarded",
      description: "Disbursement of innovation capital vouchers, trophy handover, and incubator intake.",
    },
  ],
  eligibility: [
    { field: "age", op: "gte", value: 18, failureMessage: "Lead innovator must be at least 18 years old." },
    { field: "age", op: "lte", value: 35, failureMessage: "Lead innovator must not exceed 35 years of age (Youth Category)." },
    { field: "citizenship", op: "eq", value: "BW", failureMessage: "Applicant must be a citizen of Botswana with valid Omang." },
    { field: "youthShareholding", op: "gte", value: 60, failureMessage: "Agribusiness or cooperative must have at least 60% youth equity." },
    { field: "consentGiven", op: "eq", value: true, failureMessage: "You must consent to data processing under Botswana Data Protection Act 2024." },
  ],
  team: {
    minSize: 1,
    maxSize: 5,
    requiredMemberFields: ["name", "email", "phone", "omang", "roleInTeam", "shareholding"],
    requireLeadCitizen: true,
  },
  forms: [
    {
      stageId: "stage-agri-reg",
      title: "AgriTech Initial Concept Note",
      description: "Provide core details regarding your agricultural innovation and target district.",
      fields: [
        { label: "Project Title", key: "project_title", type: "text", required: true },
        { label: "District of Operation", key: "district", type: "select", required: true, options: ["Central", "Chobe", "Ghanzi", "Kgalagadi", "Kgatleng", "Kweneng", "North-East", "North-West (Ngamiland)", "South-East", "Southern"] },
        { label: "Sub-sector", key: "subsector", type: "select", required: true, options: ["Horticulture & Irrigation", "Livestock & Animal Health", "Cold Chain & Logistics", "Post-Harvest Processing", "Agri-Fintech"] },
        { label: "Problem Being Addressed", key: "problem", type: "textarea", required: true },
        { label: "Proposed Solution & Methodology", key: "solution", type: "textarea", required: true },
      ],
      fileSlots: [
        { label: "Concept Slide Deck (PDF)", key: "concept_deck", required: true, allowedTypes: [".pdf"], maxSizeMb: 10 },
      ],
    },
    {
      stageId: "stage-agri-detailed",
      title: "Full Feasibility & Budget Dossier",
      description: "Submit budget calculations, technical schematics, and projected local job creation.",
      fields: [
        { label: "Funding Requested (BWP)", key: "funding_requested", type: "number", required: true, validation: { min: 20000, max: 250000 } },
        { label: "Projected Citizen Jobs (12 Months)", key: "jobs_12m", type: "number", required: true, validation: { min: 1, max: 50 } },
        { label: "Water & Power Source Details", key: "water_power_source", type: "textarea", required: true },
      ],
      fileSlots: [
        { label: "Detailed Budget Spreadsheet", key: "budget_sheet", required: true, allowedTypes: [".xlsx", ".csv", ".pdf"], maxSizeMb: 5 },
        { label: "Engineering Schematics / Farm Plan", key: "farm_plan", required: false, allowedTypes: [".pdf", ".png", ".jpg"], maxSizeMb: 8 },
      ],
    },
  ],
  guards: {
    magicBytes: true,
    sizeCaps: true,
    archiveInspection: {
      enabled: true,
      maxRatio: 50,
      forbidZipSlip: true,
      maxDepth: 3,
    },
    duplicateDetection: true,
    pdfPageCountCap: 15,
    malwareScan: true,
    secretScanning: false,
    dependencyCheck: false,
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
      { key: "technical_merit", label: "Technical Innovation & Feasibility", weight: 30, guide: "Robustness of technology, suitability for Botswana climate/soil, and durability." },
      { key: "commercial_viability", label: "Commercial Viability & Market Traction", weight: 25, guide: "Clear path to revenue, farmer willingness to pay, and cost-benefit ratio." },
      { key: "food_security_impact", label: "Food Security & Citizen Job Creation", weight: 25, guide: "Direct contribution to import substitution, rural employment, and youth inclusion." },
      { key: "team_execution", label: "Team Execution Capacity", weight: 20, guide: "Complementary technical, agronomic, and operational execution capabilities." },
    ],
    reviewersPerEntry: 3,
    blind: true,
    disagreementThreshold: 20,
    consensusRequired: true,
    publicVoteWeight: 0,
  },
  workflow: {
    screeningRequired: true,
    blindScoring: true,
    conflictDeclarationRequired: true,
    adjudicationPanelRequired: true,
    consensusMeetingRequired: true,
    autoShortlistThreshold: 75,
  },
  privacy: {
    dpaConsentText: "In compliance with the Data Protection Act, 2024 of Botswana, CEDA collects and processes team and applicant information solely for the evaluation, adjudication, and administration of the 2026 AgriTech Innovation Challenge.",
    retentionMonths: 24,
    purpose: "AgriTech Challenge evaluation and CEDA grant due diligence.",
    regulatoryAuthority: "Information and Data Protection Commission, Botswana",
  },
  channels: {
    alertTypes: ["SMS", "EMAIL", "PORTAL"],
    faqs: [
      { q: "Do I need to own the farmland?", a: "No. You may provide a lease agreement, family permission letter, or tribal land allocation certificate.", category: "eligibility" },
      { q: "Can prototypes be hardware or software?", a: "Both are welcome. Pure software (e.g., market linkage apps) and hardware (smart valves, drone imaging) are equally eligible.", category: "submission" },
    ],
    supportContacts: [
      { name: "CEDA Agribusiness Directorate", role: "Programme Desk", email: "agritech@ceda.co.bw", phone: "+267 364 7000", turnaroundHours: 24 },
    ],
    liveChat: {
      enabled: true,
      operatingHours: "08:30 - 16:30 CAT",
      businessDaysOnly: true,
      agents: ["agri_desk@ceda.co.bw"],
      offlineMessage: "Our Agribusiness advisory desk is offline. Send queries to agritech@ceda.co.bw.",
    },
    observerAccess: true,
  },
};

export const CLEANTECH_CHALLENGE_BLUEPRINT: InstanceDefinition = {
  meta: {
    name: "CEDA CleanTech & Green Economy Accelerator 2026",
    slug: "ceda-cleantech-2026",
    partnerSlug: "ceda",
    description: "Accelerating renewable energy, waste-to-wealth recycling, eco-friendly construction, and circular economy innovations that decarbonize Botswana.",
    category: "Renewable Energy & Sustainability",
    prizes: [
      { rank: 1, title: "1st Prize", amountPula: 50000, rewardText: "P50,000 + Green Capital Matchmaking" },
      { rank: 2, title: "2nd Prize", amountPula: 30000, rewardText: "P30,000 + Environmental Advisory" },
      { rank: 3, title: "3rd Prize", amountPula: 20000, rewardText: "P20,000" },
    ],
    bannerUrl: "/images/hero.jpg",
    contactEmail: "cleantech@ceda.co.bw",
  },
  timeline: [
    {
      id: "stage-clean-sub",
      name: "Call for CleanTech Proposals",
      kind: "submission",
      start: "2026-11-20T08:00:00Z",
      end: "2026-12-18T17:00:00Z",
      roles: ["INNOVATOR"],
      gate: "none",
      description: "Submit pitch deck, carbon abatement calculation, and circular business model.",
    },
    {
      id: "stage-clean-eval",
      name: "Expert Technical Scoring",
      kind: "scoring_round",
      start: "2026-12-19T08:00:00Z",
      end: "2027-01-08T17:00:00Z",
      roles: ["EVALUATOR"],
      gate: "eligibility_passed",
      description: "Evaluated by green economy, energy engineering, and waste management evaluators.",
    },
    {
      id: "stage-clean-award",
      name: "Final Pitch & Green Award",
      kind: "award",
      start: "2027-01-15T10:00:00Z",
      end: "2027-01-15T16:00:00Z",
      roles: ["ADJUDICATOR", "ADMIN"],
      gate: "awarded",
      description: "Final awards presentation and incubation onboarding.",
    },
  ],
  eligibility: [
    { field: "age", op: "gte", value: 18, failureMessage: "Must be 18 years or older." },
    { field: "citizenship", op: "eq", value: "BW", failureMessage: "Must be a citizen of Botswana." },
    { field: "youthShareholding", op: "gte", value: 51, failureMessage: "At least 51% youth ownership is required." },
  ],
  team: {
    minSize: 1,
    maxSize: 4,
    requiredMemberFields: ["name", "email", "phone", "omang", "roleInTeam", "shareholding"],
    requireLeadCitizen: true,
  },
  forms: [
    {
      stageId: "stage-clean-sub",
      title: "CleanTech Proposal Application",
      description: "Detail your environmental approach and technological advantage.",
      fields: [
        { label: "Innovation Name", key: "innovation_name", type: "text", required: true },
        { label: "Environmental Problem Addressed", key: "problem", type: "textarea", required: true },
        { label: "Sustainable Solution", key: "solution", type: "textarea", required: true },
        { label: "Budget Request (BWP)", key: "funding_requested", type: "number", required: true },
      ],
      fileSlots: [
        { label: "CleanTech Pitch Presentation", key: "pitch_deck", required: true, allowedTypes: [".pdf"], maxSizeMb: 10 },
      ],
    },
  ],
  guards: {
    magicBytes: true,
    sizeCaps: true,
    archiveInspection: {
      enabled: true,
      maxRatio: 50,
      forbidZipSlip: true,
      maxDepth: 3,
    },
    duplicateDetection: true,
    pdfPageCountCap: 10,
    malwareScan: true,
    secretScanning: false,
    dependencyCheck: false,
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
      { key: "environmental_impact", label: "Environmental & Climate Impact", weight: 35, guide: "Measurable reduction in emissions, waste diverted from landfill, or renewable energy generated." },
      { key: "feasibility", label: "Technical Feasibility & Scalability", weight: 35, guide: "Practical engineering viability and operational readiness." },
      { key: "commercial_model", label: "Business Model & Financial Viability", weight: 30, guide: "Sustainable unit economics and local market demand." },
    ],
    reviewersPerEntry: 2,
    blind: true,
    disagreementThreshold: 25,
    consensusRequired: false,
    publicVoteWeight: 0,
  },
  workflow: {
    screeningRequired: true,
    blindScoring: true,
    conflictDeclarationRequired: true,
    adjudicationPanelRequired: false,
    consensusMeetingRequired: false,
    autoShortlistThreshold: 70,
  },
  privacy: {
    dpaConsentText: "In compliance with the Data Protection Act, 2024 of Botswana, CEDA collects and processes team and applicant information solely for the evaluation of the CleanTech Accelerator.",
    retentionMonths: 24,
    purpose: "CleanTech Accelerator evaluation.",
    regulatoryAuthority: "Information and Data Protection Commission, Botswana",
  },
  channels: {
    alertTypes: ["EMAIL", "PORTAL"],
    faqs: [
      { q: "Can we apply as an unregistered team?", a: "Yes, informal innovator teams may apply. If awarded, CEDA facilitates CIPA registration.", category: "eligibility" },
    ],
    supportContacts: [
      { name: "CEDA Sustainability Desk", role: "Programme Coordinator", email: "cleantech@ceda.co.bw", turnaroundHours: 24 },
    ],
    liveChat: {
      enabled: false,
      operatingHours: "09:00 - 16:00 CAT",
      businessDaysOnly: true,
      agents: [],
      offlineMessage: "Live chat is unavailable. Please reach out via email.",
    },
    observerAccess: false,
  },
};

export const BLUEPRINT_CATALOG: BlueprintTemplate[] = [
  {
    id: "bp-flagship-hackathon",
    key: "flagship-hackathon",
    name: "CEDA Innovation Management Portal Hackathon",
    category: "Software & Digital Systems",
    description: "Official 7-stage hackathon with multi-reviewer blind scoring, automated guard pre-flight inspection, and P95,000 prize pool.",
    partnerSlug: "ceda",
    defaultPrizes: FLAGSHIP_CEDA_HACKATHON_2026.meta.prizes,
    definition: FLAGSHIP_CEDA_HACKATHON_2026,
  },
  {
    id: "bp-agritech-challenge",
    key: "agritech-challenge",
    name: "AgriTech & Food Security Challenge",
    category: "AgriTech & Manufacturing",
    description: "Multi-stage agriculture challenge focusing on solar irrigation, cold-chain, livestock tracking, and 60%+ youth ownership.",
    partnerSlug: "ceda",
    defaultPrizes: AGRITECH_CHALLENGE_BLUEPRINT.meta.prizes,
    definition: AGRITECH_CHALLENGE_BLUEPRINT,
  },
  {
    id: "bp-cleantech-accelerator",
    key: "cleantech-accelerator",
    name: "CleanTech & Green Economy Accelerator",
    category: "Renewable Energy & Circular Economy",
    description: "Accelerating waste recycling, solar innovations, and carbon abatement with environmental metrics and 51% youth ownership.",
    partnerSlug: "ceda",
    defaultPrizes: CLEANTECH_CHALLENGE_BLUEPRINT.meta.prizes,
    definition: CLEANTECH_CHALLENGE_BLUEPRINT,
  },
];
