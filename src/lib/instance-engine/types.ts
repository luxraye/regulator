/**
 * Instance Engine Type Definitions
 * Represents the 11 programmable sections of a competition Instance.
 */

export type StageKind =
  | "registration"
  | "eligibility_check"
  | "briefing"
  | "build_window"
  | "submission"
  | "screening"
  | "scoring_round"
  | "shortlist"
  | "clarification"
  | "live_pitch"
  | "public_vote"
  | "award";

export type StageGate =
  | "none"
  | "eligibility_passed"
  | "screened"
  | "scoring_complete"
  | "shortlisted"
  | "top5"
  | "awarded";

export interface StageDefinition {
  id: string;
  name: string;
  kind: StageKind;
  start: string; // ISO 8601
  end: string;   // ISO 8601
  roles: string[]; // e.g. ["INNOVATOR"], ["EVALUATOR"], ["ADJUDICATOR", "ADMIN"]
  gate: StageGate;
  description?: string;
}

export type RuleOp =
  | "eq"
  | "neq"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "between"
  | "in"
  | "not_in"
  | "contains";

export interface AtomicRule {
  field: string;
  op: RuleOp;
  value: string | number | boolean | (string | number)[];
  label?: string;
  failureMessage?: string;
}

export interface CompoundRule {
  all?: RuleExpression[];
  any?: RuleExpression[];
  not?: RuleExpression;
  label?: string;
  failureMessage?: string;
}

export type RuleExpression = AtomicRule | CompoundRule;

export interface TeamRequirements {
  minSize: number;
  maxSize: number;
  requiredMemberFields: ("name" | "email" | "phone" | "omang" | "roleInTeam" | "shareholding")[];
  requireLeadCitizen: boolean;
}

export type FormFieldType =
  | "text"
  | "textarea"
  | "number"
  | "select"
  | "radio"
  | "checkbox"
  | "date"
  | "url";

export interface FormFieldDefinition {
  key: string;
  label: string;
  type: FormFieldType;
  required: boolean;
  naAllowed?: boolean;
  hint?: string;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface FileSlotDefinition {
  key: string;
  label: string;
  description?: string;
  required: boolean;
  allowedTypes: string[]; // e.g. [".pdf", ".png", ".jpg", ".zip", ".pptx", ".xlsx", ".csv"]
  maxSizeMb: number;
  maxPages?: number; // For PDF proposals
}

export interface FormStageDefinition {
  stageId: string;
  title: string;
  description?: string;
  fields: FormFieldDefinition[];
  fileSlots: FileSlotDefinition[];
}

export interface GuardSettings {
  magicBytes: boolean;
  sizeCaps: boolean;
  archiveInspection: {
    enabled: boolean;
    maxRatio?: number;
    forbidZipSlip?: boolean;
    maxDepth?: number;
  };
  duplicateDetection: boolean;
  pdfPageCountCap?: number;
  malwareScan: boolean;
  secretScanning: boolean;
  dependencyCheck: boolean;
  linkReachable: boolean;
}

export interface FaithfulnessSettings {
  allQuestionsAnsweredOrNA: boolean;
  noEditsAfterDeadline: boolean;
  affiliationsDeclared: boolean;
  consentsRecorded: boolean;
  duplicateSubmissionForbidden: boolean;
}

export interface RubricCriterion {
  key: string;
  label: string;
  weight: number; // percentage (0 - 100), sum of all criteria must equal 100
  guide?: string;
  subcriteria?: {
    key: string;
    label: string;
    weight: number;
    guide?: string;
  }[];
}

export interface RubricSettings {
  criteria: RubricCriterion[];
  reviewersPerEntry: number;
  blind: boolean;
  disagreementThreshold: number; // point difference triggering variance flag (e.g. 20)
  consensusRequired: boolean;
  publicVoteWeight?: number; // 0 to 100 percentage (e.g. 10%)
}

export interface WorkflowSettings {
  screeningRequired: boolean;
  blindScoring: boolean;
  conflictDeclarationRequired: boolean;
  adjudicationPanelRequired: boolean;
  consensusMeetingRequired: boolean;
  autoShortlistThreshold?: number; // min score to auto-shortlist
}

export interface PrivacySettings {
  dpaConsentText: string;
  retentionMonths: number;
  purpose: string;
  regulatoryAuthority: string; // e.g. "Information and Data Protection Commission, Botswana"
}

export interface FaqItem {
  q: string;
  a: string;
  category?: string;
}

export interface SupportContact {
  name: string;
  role: string;
  email: string;
  phone?: string;
  turnaroundHours: number;
}

export interface LiveChatSettings {
  enabled: boolean;
  operatingHours: string; // e.g. "09:00 - 16:00 CAT"
  businessDaysOnly: boolean;
  agents: string[]; // user IDs or email handles
  offlineMessage: string;
}

export interface ChannelSettings {
  alertTypes: ("SMS" | "EMAIL" | "PORTAL")[];
  faqs: FaqItem[];
  supportContacts: SupportContact[];
  liveChat: LiveChatSettings;
  observerAccess: boolean;
}

export interface PrizeItem {
  rank: number;
  title: string;
  amountPula?: number;
  rewardText?: string;
}

export interface MetaSettings {
  name: string;
  slug: string;
  partnerSlug: string;
  description: string;
  category?: string;
  prizes: PrizeItem[];
  bannerUrl?: string;
  contactEmail?: string;
}

/** The 11 sections of a complete programmable Instance definition */
export interface InstanceDefinition {
  meta: MetaSettings;
  timeline: StageDefinition[];
  eligibility: RuleExpression[];
  team: TeamRequirements;
  forms: FormStageDefinition[];
  guards: GuardSettings;
  faithfulness: FaithfulnessSettings;
  rubric: RubricSettings;
  workflow: WorkflowSettings;
  privacy: PrivacySettings;
  channels: ChannelSettings;
}
