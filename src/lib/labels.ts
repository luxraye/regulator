export const SCALES = ["SCALE_1", "SCALE_2", "SCALE_3", "SCALE_4", "SCALE_5", "SCALE_6"] as const;
export const DATA_TYPES = ["TYPE_A", "TYPE_B", "TYPE_C", "TYPE_D", "TYPE_E", "TYPE_F"] as const;

/** Venture stage: the rows of the classification matrix. */
export const scaleLabels: Record<string, string> = {
  SCALE_1: "1 · Idea",
  SCALE_2: "2 · Prototype",
  SCALE_3: "3 · Pilot / MVP",
  SCALE_4: "4 · Early revenue",
  SCALE_5: "5 · Growth",
  SCALE_6: "6 · Scale-up & export",
};

export const stageName = (scale: string | null | undefined) => (scale ? scaleLabels[scale]?.split(" · ")[1] ?? scale : "All stages");

/** Sector: the columns of the classification matrix. */
export const typeLabels: Record<string, { short: string; full: string; photo: string }> = {
  TYPE_A: { short: "A", full: "Agriculture & Agro-processing", photo: "/photos/farmer-field.webp" },
  TYPE_B: { short: "B", full: "Digital & Technology", photo: "/photos/engineer.webp" },
  TYPE_C: { short: "C", full: "Manufacturing & Mining Services", photo: "/photos/maker-sewing.webp" },
  TYPE_D: { short: "D", full: "Tourism & Creative Industries", photo: "/photos/elephants.webp" },
  TYPE_E: { short: "E", full: "Green Energy & Water", photo: "/photos/solar-rural.webp" },
  TYPE_F: { short: "F", full: "Health, Education & Social", photo: "/photos/founder-macbook.webp" },
};

export const sectorName = (dataType: string | null | undefined) => (dataType ? typeLabels[dataType]?.full ?? dataType : "General Innovation");

export const entryStatusMeta: Record<string, { label: string; className: string }> = {
  DRAFT: { label: "Draft", className: "bg-gray-100 text-gray-600" },
  SUBMITTED: { label: "Screening", className: "bg-stone-100 text-stone-700" },
  UNDER_REVIEW: { label: "Under evaluation", className: "bg-amber-100 text-amber-800" },
  SHORTLISTED: { label: "With panel", className: "bg-purple-100 text-purple-700" },
  FLAGGED: { label: "Changes requested", className: "bg-orange-100 text-orange-700" },
  APPROVED: { label: "Approved", className: "bg-green-100 text-green-700" },
  AWARDED: { label: "Awarded", className: "bg-amber-200 text-amber-900" },
  REJECTED: { label: "Not selected", className: "bg-red-100 text-red-700" },
};

export const instanceStatusMeta = entryStatusMeta;

export const roleLabels: Record<string, string> = {
  INNOVATOR: "Innovator",
  EVALUATOR: "Evaluator",
  ADJUDICATOR: "Adjudicator",
  ADMIN: "Programme admin",
  SUPERADMIN: "Super admin",
  PARTNER_ADMIN: "Partner admin",
  COMMITTEE_OBSERVER: "Committee observer",
  CONSULTANT: "Consultant",
};

/** The five stages the brief names, and which statuses sit in each. */
export const JOURNEY = [
  { key: "submission", label: "Submission", statuses: ["DRAFT", "SUBMITTED"] },
  { key: "review", label: "Review", statuses: ["UNDER_REVIEW", "SHORTLISTED"] },
  { key: "feedback", label: "Feedback", statuses: ["FLAGGED"] },
  { key: "approval", label: "Approval", statuses: ["APPROVED", "REJECTED"] },
  { key: "award", label: "Award", statuses: ["AWARDED"] },
] as const;

export const BOTSWANA_DISTRICTS = [
  "Gaborone",
  "Francistown",
  "Maun",
  "Lobatse",
  "Selebi-Phikwe",
  "Jwaneng",
  "Orapa",
  "Sowa Town",
  "Central",
  "Ghanzi",
  "Kgalagadi",
  "Kgatleng",
  "Kweneng",
  "North-East",
  "North-West",
  "South-East",
  "Southern",
  "Chobe",
];

export const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  PITCH_DECK: "Pitch deck (presentation)",
  BUSINESS_PLAN: "Business plan / Executive summary",
  FINANCIAL_PROJECTIONS: "Financial projections / Budget",
  PROTOTYPE_DEMO: "Prototype demo / Walkthrough video",
  COMPANY_REGISTRATION: "CIPA company registration certificate",
  OMANG_COPIES: "Certified Omang copies (all founders)",
  SHAREHOLDER_CERT: "Shareholder certificate / Register of members",
  OTHER: "Supporting document",
};

export const QUESTION_TYPE_LABELS: Record<string, string> = {
  TEXT: "Short text",
  TEXTAREA: "Long text",
  NUMBER: "Number",
  CURRENCY: "Pula amount (BWP)",
  SELECT: "Single choice",
  MULTI_SELECT: "Multiple choice",
  FILE: "File upload",
  BOOLEAN: "Yes / No",
  DATE: "Date",
};

/** Plain-language names for audit actions, as an innovator would read them. */
export const auditActionLabels: Record<string, string> = {
  IDEA_STARTED: "Application started",
  IDEA_SUBMITTED: "Signed and submitted",
  IDEA_RESUBMITTED: "Resubmitted after feedback",
  EVALUATORS_ASSIGNED: "Passed screening; evaluators assigned",
  EVALUATION_SUBMITTED: "Evaluator scorecard submitted",
  IDEA_SHORTLISTED: "Shortlisted for the panel",
  IDEA_FLAGGED: "Changes requested",
  IDEA_APPROVED: "Approved by the panel",
  IDEA_AWARDED: "Award confirmed",
  IDEA_REJECTED: "Not selected",
  FILE_DOWNLOADED: "Document opened",
  CONFLICT_DECLARED: "Evaluator declared a conflict",
  NO_CONFLICT_DECLARED: "Evaluator declared no conflict",
  DATA_EXPORTED: "Personal data exported",
  CALL_CREATED: "Call created",
  CALL_UPDATED: "Call updated",
  REPORT_EXPORTED: "Report exported",
  USER_CREATED: "Staff account created",
  USER_ROLE_CHANGED: "Role changed",
  INSTANCE_CREATED: "Instance created",
  INSTANCE_PUBLISHED: "Instance sealed and published",
  INSTANCE_VERSION_BUMP: "Instance version updated",
};

export const actionLabel = (a: string) => auditActionLabels[a] ?? a.toLowerCase().replace(/_/g, " ");
