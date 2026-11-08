export const SCALES = ["SCALE_1", "SCALE_2", "SCALE_3", "SCALE_4", "SCALE_5", "SCALE_6"] as const;
export const DATA_TYPES = ["TYPE_A", "TYPE_B", "TYPE_C", "TYPE_D", "TYPE_E", "TYPE_F"] as const;

export const scaleLabels: Record<string, string> = {
  SCALE_1: "1 · Major Telecom",
  SCALE_2: "2 · Large Operator",
  SCALE_3: "3 · Medium ISP/Broadcaster",
  SCALE_4: "4 · Small VANS/Courier",
  SCALE_5: "5 · Micro Operator",
  SCALE_6: "6 · Community/Rural",
};

export const typeLabels: Record<string, { short: string; full: string }> = {
  TYPE_A: { short: "A", full: "Financial (Mobile Money, Revenue)" },
  TYPE_B: { short: "B", full: "Technical (Spectrum, QoS)" },
  TYPE_C: { short: "C", full: "Public Service (Complaints, Coverage)" },
  TYPE_D: { short: "D", full: "Infrastructure (Towers, Fibre, Sites)" },
  TYPE_E: { short: "E", full: "Security (Cybersecurity, Data Protection)" },
  TYPE_F: { short: "F", full: "Governance (Licensing, HR, Training)" },
};

export const instanceStatusMeta: Record<string, { label: string; className: string }> = {
  DRAFT: { label: "Draft", className: "bg-gray-100 text-gray-600" },
  PENDING: { label: "Pending", className: "bg-amber-100 text-amber-800" },
  IN_PROGRESS: { label: "In progress", className: "bg-blue-100 text-blue-700" },
  SUBMITTED: { label: "Submitted", className: "bg-indigo-100 text-indigo-700" },
  APPROVED: { label: "Approved", className: "bg-green-100 text-green-700" },
  FLAGGED: { label: "Needs changes", className: "bg-orange-100 text-orange-700" },
  REJECTED: { label: "Rejected", className: "bg-red-100 text-red-700" },
};

export const complaintStatusMeta: Record<string, { label: string; className: string }> = {
  OPEN: { label: "Open", className: "bg-amber-100 text-amber-800" },
  UNDER_REVIEW: { label: "Under review", className: "bg-blue-100 text-blue-700" },
  RESOLVED: { label: "Resolved", className: "bg-green-100 text-green-700" },
  CLOSED: { label: "Closed", className: "bg-gray-100 text-gray-600" },
};

export const COMPLAINT_STATUSES = ["OPEN", "UNDER_REVIEW", "RESOLVED", "CLOSED"] as const;
