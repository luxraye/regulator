import { prisma } from "@/lib/prisma";
import { certificateCode } from "@/lib/certificate";

/** Awards the founders agreed to show publicly. Only the title and headline numbers, never the application. */
export async function fundedShowcase(take?: number) {
  const rows = await prisma.entry.findMany({
    where: { status: "AWARDED", showcase: true },
    orderBy: { reviewedAt: "desc" },
    take,
    select: {
      referenceCode: true,
      title: true,
      awardAmount: true,
      reviewedAt: true,
      template: { select: { name: true, dataType: true, scale: true } },
      innovator: { select: { organizationName: true, district: true } },
      fields: { where: { fieldKey: "jobs_12m" }, select: { fieldValue: true } },
    },
  });
  return rows.map((r) => ({
    ...r,
    jobs: Number(r.fields[0]?.fieldValue) || null,
    code: certificateCode({ referenceCode: r.referenceCode, awardAmount: r.awardAmount, reviewedAt: r.reviewedAt, organizationName: r.innovator.organizationName }),
  }));
}

export type FundedItem = Awaited<ReturnType<typeof fundedShowcase>>[number];
