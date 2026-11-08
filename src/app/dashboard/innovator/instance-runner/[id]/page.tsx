import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { fileMetaSelect, schemaOf } from "@/lib/instances";
import { summarise } from "@/lib/scoring";
import { InstanceRunnerClient } from "./runner-client";

export const dynamic = "force-dynamic";

/** Evaluator feedback is shared with the innovator, anonymously, once CEDA has made a decision. */
const FEEDBACK_VISIBLE = ["FLAGGED", "APPROVED", "AWARDED", "REJECTED"];

export default async function InstanceRunnerPage({ params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const instance = await prisma.instance.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      title: true,
      referenceCode: true,
      status: true,
      deadline: true,
      reviewNotes: true,
      reviewedAt: true,
      submittedAt: true,
      submissionJwt: true,
      dataHash: true,
      submissionCount: true,
      awardAmount: true,
      innovatorId: true,
      template: true,
      fields: { select: { fieldKey: true, fieldValue: true } },
      files: { select: fileMetaSelect },
      evaluations: { select: { feedback: true, total: true, scores: true, submittedAt: true, conflict: true } },
    },
  });

  if (!instance || instance.innovatorId !== user.id) notFound();

  const schema = schemaOf(instance.template);
  const showFeedback = FEEDBACK_VISIBLE.includes(instance.status) && instance.submissionCount > 0;
  const done = instance.evaluations.filter((e) => e.submittedAt && e.conflict === false);
  const summary = summarise(schema.criteria, instance.evaluations);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { template, evaluations, innovatorId, ...rest } = instance;
  return (
    <InstanceRunnerClient
      instance={JSON.parse(
        JSON.stringify({
          ...rest,
          template: {
            name: template.name,
            code: template.code,
            description: template.description,
            closesAt: template.closesAt,
            fundingSummary: template.fundingSummary,
            schema,
          },
          feedback: showFeedback
            ? {
                average: summary.mean,
                perCriterion: summary.perCriterion,
                comments: done.map((e) => e.feedback).filter(Boolean),
              }
            : null,
        })
      )}
    />
  );
}
