import type { Entry, EntryStatus, Template, User, Instance, Partner, Blueprint, CheckResult, InstanceRole } from "@prisma/client";

export { EntryStatus };
export type InstanceStatus = EntryStatus;
export const InstanceStatus = {
  DRAFT: "DRAFT" as EntryStatus,
  SUBMITTED: "SUBMITTED" as EntryStatus,
  UNDER_REVIEW: "UNDER_REVIEW" as EntryStatus,
  SHORTLISTED: "SHORTLISTED" as EntryStatus,
  FLAGGED: "FLAGGED" as EntryStatus,
  APPROVED: "APPROVED" as EntryStatus,
  AWARDED: "AWARDED" as EntryStatus,
  REJECTED: "REJECTED" as EntryStatus,
} as const;

export type { Entry, Template, User, Instance, Partner, Blueprint, CheckResult, InstanceRole };
