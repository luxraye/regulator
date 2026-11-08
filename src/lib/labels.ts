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

export const stageName = (scale: string) => scaleLabels[scale]?.split(" · ")[1] ?? scale;

/** Sector: the columns of the classification matrix. */
export const typeLabels: Record<string, { short: string; full: string; photo: string }> = {
  TYPE_A: { short: "A", full: "Agriculture & Agro-processing", photo: "/photos/farmer-field.webp" },
  TYPE_B: { short: "B", full: "Digital & Technology", photo: "/photos/engineer.webp" },
  TYPE_C: { short: "C", full: "Manufacturing & Mining Services", photo: "/photos/maker-sewing.webp" },
  TYPE_D: { short: "D", full: "Tourism & Creative Industries", photo: "/photos/elephants.webp" },
  TYPE_E: { short: "E", full: "Green Energy & Water", photo: "/photos/solar-rural.webp" },
  TYPE_F: { short: "F", full: "Health, Education & Social", photo: "/photos/founder-macbook.webp" },
};

export const sectorName = (dataType: string) => typeLabels[dataType]?.full ?? dataType;

export const instanceStatusMeta: Record<string, { label: string; className: string }> = {
  DRAFT: { label: "Draft", className: "bg-gray-100 text-gray-600" },
  SUBMITTED: { label: "Screening", className: "bg-indigo-100 text-indigo-700" },
  UNDER_REVIEW: { label: "Under evaluation", className: "bg-blue-100 text-blue-700" },
  SHORTLISTED: { label: "With panel", className: "bg-purple-100 text-purple-700" },
  FLAGGED: { label: "Changes requested", className: "bg-orange-100 text-orange-700" },
  APPROVED: { label: "Approved", className: "bg-green-100 text-green-700" },
  AWARDED: { label: "Awarded", className: "bg-amber-100 text-amber-800" },
  REJECTED: { label: "Not selected", className: "bg-red-100 text-red-700" },
};

export const roleLabels: Record<string, string> = {
  INNOVATOR: "Innovator",
  EVALUATOR: "Evaluator",
  ADJUDICATOR: "Adjudicator",
  ADMIN: "Programme admin",
  SUPERADMIN: "Super admin",
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
