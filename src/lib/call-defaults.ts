import type { Criterion, InstanceSchema } from "@/lib/instance-schema";

export const DEFAULT_CRITERIA: Criterion[] = [
  { key: "innovation", label: "Innovation & originality", weight: 25, guide: "Is this new for Botswana? Does it solve the problem in a better way?" },
  { key: "market", label: "Market potential", weight: 20, guide: "Real customers, willingness to pay, room to grow beyond the first market." },
  { key: "feasibility", label: "Feasibility & team", weight: 20, guide: "Can this team build and run it with the money asked for?" },
  { key: "impact", label: "Impact & jobs", weight: 20, guide: "Citizen jobs, inclusion, rural reach, environmental benefit." },
  { key: "alignment", label: "Fit with CEDA priorities", weight: 15, guide: "Economic diversification, digital advancement, sustainable development." },
];

/** The standard CEDA application form. Calls can add their own questions on top. */
export const DEFAULT_FORM: Omit<InstanceSchema, "criteria"> = {
  fields: [
    { key: "problem", label: "What problem are you solving?", type: "textarea", required: true, hint: "Who has this problem and how do you know?" },
    { key: "solution", label: "Your solution", type: "textarea", required: true },
    { key: "novelty", label: "What makes it new or better?", type: "textarea", required: true },
    { key: "customers", label: "Who will pay for it?", type: "textarea", required: true },
    { key: "team", label: "Your team and their skills", type: "textarea", required: true },
    { key: "funding_requested", label: "Funding requested (Pula)", type: "number", required: true, validation: { min: 0, max: 500000 } },
    { key: "jobs_12m", label: "Citizen jobs created in 12 months", type: "number", required: true, validation: { min: 0, max: 500 } },
    { key: "impact", label: "How does this support Botswana's development goals?", type: "textarea", required: true },
  ],
  required_files: [
    { key: "pitch_deck", label: "Pitch deck", extensions: [".pdf", ".pptx"], maxSizeMB: 4 },
    { key: "cipa_certificate", label: "CIPA registration certificate", extensions: [".pdf", ".jpg", ".png"], maxSizeMB: 4 },
    { key: "budget", label: "Budget breakdown", extensions: [".xlsx", ".csv", ".pdf"], maxSizeMB: 4, optional: true },
  ],
};
