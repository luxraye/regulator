import { z } from "zod";

export const StageKindSchema = z.enum([
  "registration",
  "eligibility_check",
  "briefing",
  "build_window",
  "submission",
  "screening",
  "scoring_round",
  "shortlist",
  "clarification",
  "live_pitch",
  "public_vote",
  "award",
]);

export const StageGateSchema = z.enum([
  "none",
  "eligibility_passed",
  "screened",
  "scoring_complete",
  "shortlisted",
  "top5",
  "awarded",
]);

export const StageDefinitionSchema = z.object({
  id: z.string().min(1, "Stage ID is required"),
  name: z.string().min(1, "Stage name is required"),
  kind: StageKindSchema,
  start: z.string().datetime({ message: "Start date must be an ISO datetime string" }),
  end: z.string().datetime({ message: "End date must be an ISO datetime string" }),
  roles: z.array(z.string()).min(1, "At least one role must be assigned to each stage"),
  gate: StageGateSchema.default("none"),
  description: z.string().optional(),
});

export const RuleOpSchema = z.enum([
  "eq",
  "neq",
  "gt",
  "gte",
  "lt",
  "lte",
  "between",
  "in",
  "not_in",
  "contains",
]);

export const AtomicRuleSchema = z.object({
  field: z.string().min(1, "Field name is required"),
  op: RuleOpSchema,
  value: z.union([z.string(), z.number(), z.boolean(), z.array(z.union([z.string(), z.number()]))]),
  label: z.string().optional(),
  failureMessage: z.string().optional(),
});

export const RuleExpressionSchema: z.ZodType<any> = z.lazy(() =>
  z.union([
    AtomicRuleSchema,
    z.object({
      all: z.array(RuleExpressionSchema).optional(),
      any: z.array(RuleExpressionSchema).optional(),
      not: RuleExpressionSchema.optional(),
      label: z.string().optional(),
      failureMessage: z.string().optional(),
    }),
  ])
);

export const TeamRequirementsSchema = z.object({
  minSize: z.number().int().min(1, "Minimum team size must be at least 1").default(1),
  maxSize: z.number().int().min(1, "Maximum team size must be at least 1").max(20).default(5),
  requiredMemberFields: z
    .array(z.enum(["name", "email", "phone", "omang", "roleInTeam", "shareholding"]))
    .default(["name", "email", "omang"]),
  requireLeadCitizen: z.boolean().default(true),
});

export const FormFieldDefinitionSchema = z.object({
  key: z.string().min(1, "Field key is required").regex(/^[a-z0-9_]+$/, "Field key must be snake_case"),
  label: z.string().min(1, "Field label is required"),
  type: z.enum(["text", "textarea", "number", "select", "radio", "checkbox", "date", "url"]),
  required: z.boolean().default(true),
  naAllowed: z.boolean().default(false),
  hint: z.string().optional(),
  options: z.array(z.string()).optional(),
  validation: z
    .object({
      min: z.number().optional(),
      max: z.number().optional(),
      pattern: z.string().optional(),
    })
    .optional(),
});

export const FileSlotDefinitionSchema = z.object({
  key: z.string().min(1, "Slot key is required").regex(/^[a-z0-9_]+$/, "Slot key must be snake_case"),
  label: z.string().min(1, "Slot label is required"),
  description: z.string().optional(),
  required: z.boolean().default(true),
  allowedTypes: z.array(z.string().startsWith(".", "Allowed types must start with a dot, e.g. .pdf")).min(1),
  maxSizeMb: z.number().positive("Maximum size must be positive").default(50),
  maxPages: z.number().int().positive().optional(),
});

export const FormStageDefinitionSchema = z.object({
  stageId: z.string().min(1, "Stage ID is required"),
  title: z.string().min(1, "Form title is required"),
  description: z.string().optional(),
  fields: z.array(FormFieldDefinitionSchema).default([]),
  fileSlots: z.array(FileSlotDefinitionSchema).default([]),
});

export const GuardSettingsSchema = z.object({
  magicBytes: z.boolean().default(true),
  sizeCaps: z.boolean().default(true),
  archiveInspection: z
    .object({
      enabled: z.boolean().default(true),
      maxRatio: z.number().optional().default(100),
      forbidZipSlip: z.boolean().default(true),
      maxDepth: z.number().optional().default(3),
    })
    .default({ enabled: true, maxRatio: 100, forbidZipSlip: true, maxDepth: 3 }),
  duplicateDetection: z.boolean().default(true),
  pdfPageCountCap: z.number().int().positive().optional(),
  malwareScan: z.boolean().default(true),
  secretScanning: z.boolean().default(true),
  dependencyCheck: z.boolean().default(true),
  linkReachable: z.boolean().default(true),
});

export const FaithfulnessSettingsSchema = z.object({
  allQuestionsAnsweredOrNA: z.boolean().default(true),
  noEditsAfterDeadline: z.boolean().default(true),
  affiliationsDeclared: z.boolean().default(true),
  consentsRecorded: z.boolean().default(true),
  duplicateSubmissionForbidden: z.boolean().default(true),
});

export const RubricCriterionSchema = z.object({
  key: z.string().min(1, "Criterion key is required"),
  label: z.string().min(1, "Criterion label is required"),
  weight: z.number().min(1, "Criterion weight must be at least 1").max(100, "Criterion weight cannot exceed 100"),
  guide: z.string().optional(),
  subcriteria: z
    .array(
      z.object({
        key: z.string(),
        label: z.string(),
        weight: z.number(),
        guide: z.string().optional(),
      })
    )
    .optional(),
});

export const RubricSettingsSchema = z.object({
  criteria: z.array(RubricCriterionSchema).min(1, "At least one evaluation criterion is required"),
  reviewersPerEntry: z.number().int().min(1).max(10).default(2),
  blind: z.boolean().default(true),
  disagreementThreshold: z.number().min(5).max(50).default(20),
  consensusRequired: z.boolean().default(false),
  publicVoteWeight: z.number().min(0).max(100).optional().default(0),
});

export const WorkflowSettingsSchema = z.object({
  screeningRequired: z.boolean().default(true),
  blindScoring: z.boolean().default(true),
  conflictDeclarationRequired: z.boolean().default(true),
  adjudicationPanelRequired: z.boolean().default(true),
  consensusMeetingRequired: z.boolean().default(false),
  autoShortlistThreshold: z.number().optional(),
});

export const PrivacySettingsSchema = z.object({
  dpaConsentText: z.string().min(10, "Data Protection Act notice is required"),
  retentionMonths: z.number().int().min(1).default(36),
  purpose: z.string().min(5, "Processing purpose is required"),
  regulatoryAuthority: z.string().default("Information and Data Protection Commission, Botswana"),
});

export const FaqItemSchema = z.object({
  q: z.string().min(1, "Question is required"),
  a: z.string().min(1, "Answer is required"),
  category: z.string().optional(),
});

export const SupportContactSchema = z.object({
  name: z.string().min(1, "Contact name is required"),
  role: z.string().min(1, "Role is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().optional(),
  turnaroundHours: z.number().int().min(1).default(24),
});

export const LiveChatSettingsSchema = z.object({
  enabled: z.boolean().default(true),
  operatingHours: z.string().default("09:00 - 16:00 CAT"),
  businessDaysOnly: z.boolean().default(true),
  agents: z.array(z.string()).default([]),
  offlineMessage: z.string().default("CEDA consultants are available Monday to Friday, 09:00 to 16:00 CAT."),
});

export const ChannelSettingsSchema = z.object({
  alertTypes: z.array(z.enum(["SMS", "EMAIL", "PORTAL"])).default(["EMAIL", "PORTAL"]),
  faqs: z.array(FaqItemSchema).default([]),
  supportContacts: z.array(SupportContactSchema).default([]),
  liveChat: LiveChatSettingsSchema,
  observerAccess: z.boolean().default(true),
});

export const PrizeItemSchema = z.object({
  rank: z.number().int().min(1),
  title: z.string().min(1, "Prize title is required"),
  amountPula: z.number().min(0).optional(),
  rewardText: z.string().optional(),
});

export const MetaSettingsSchema = z.object({
  name: z.string().min(3, "Competition name must be at least 3 characters"),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase alphanumeric characters and hyphens"),
  partnerSlug: z.string().min(2, "Organiser partner slug is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().optional(),
  prizes: z.array(PrizeItemSchema).default([]),
  bannerUrl: z.string().optional(),
  contactEmail: z.string().email().optional(),
});

/**
 * Root schema for all 11 sections of a programmable Instance definition.
 */
export const InstanceDefinitionSchema = z.object({
  meta: MetaSettingsSchema,
  timeline: z.array(StageDefinitionSchema).min(1, "At least one timeline stage is required"),
  eligibility: z.array(RuleExpressionSchema).default([]),
  team: TeamRequirementsSchema,
  forms: z.array(FormStageDefinitionSchema).default([]),
  guards: GuardSettingsSchema,
  faithfulness: FaithfulnessSettingsSchema,
  rubric: RubricSettingsSchema,
  workflow: WorkflowSettingsSchema,
  privacy: PrivacySettingsSchema,
  channels: ChannelSettingsSchema,
});
