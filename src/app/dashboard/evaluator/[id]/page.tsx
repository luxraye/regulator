import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, EyeOff } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { fileMetaSelect, fieldsToRecord, schemaOf } from "@/lib/instances";
import { sectorName, stageName } from "@/lib/labels";
import { FileList } from "@/components/dashboard/file-list";
import { formatDate } from "@/lib/utils";
import { ConflictDeclaration, Scorecard, SteppedAsideCard } from "./scorecard";

export const dynamic = "force-dynamic";

export default async function EvaluatePage({ params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const ev = await prisma.evaluation.findUnique({
    where: { id: params.id },
    include: {
      instance: {
        include: {
          template: true,
          innovator: { select: { organizationName: true } },
          fields: { select: { fieldKey: true, fieldValue: true } },
          files: { select: fileMetaSelect },
        },
      },
    },
  });
  if (!ev || ev.evaluatorId !== user.id) notFound();

  const { instance } = ev;
  const schema = schemaOf(instance.template);
  const values = fieldsToRecord(instance.fields);
  const canSee = ev.conflict === false;
  const locked = !!ev.submittedAt || instance.status !== "UNDER_REVIEW";

  return (
    <div>
      <Link href="/dashboard/evaluator" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-ceda-navy">
        <ArrowLeft size={14} /> My assignments
      </Link>
      <div className="mb-6">
        <p className="font-mono text-xs text-muted-foreground">{instance.referenceCode}</p>
        <h1 className="text-2xl font-bold text-ceda-navy">{instance.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {instance.template.name} · {sectorName(instance.template.dataType)} · {stageName(instance.template.scale)} stage · score by {formatDate(ev.dueAt)}
        </p>
      </div>

      {ev.conflict === null && (
        <ConflictDeclaration evaluationId={ev.id} company={instance.innovator.organizationName ?? "—"} title={instance.title} />
      )}

      {ev.conflict === true && (
        <SteppedAsideCard evaluationId={ev.id} conflictNote={ev.conflictNote} />
      )}

      {canSee && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="space-y-6 lg:col-span-3">
            <div className="flex items-center gap-2 rounded-lg bg-ceda-light px-3 py-2 text-xs text-muted-foreground">
              <EyeOff size={14} /> Blind review: the applicant&apos;s name, Omang, age and contact details are hidden from you.
            </div>
            <section className="rounded-xl border border-border bg-white p-5">
              <h2 className="mb-2 font-semibold text-ceda-navy">The idea</h2>
              <dl className="divide-y divide-border text-sm">
                {schema.fields.map((f) =>
                  f.type === "textarea" ? (
                    <div key={f.key} className="py-3">
                      <dt className="font-medium text-ceda-navy">{f.label}</dt>
                      <dd className="mt-1 whitespace-pre-wrap text-muted-foreground">{values[f.key] || "—"}</dd>
                    </div>
                  ) : (
                    <div key={f.key} className="flex justify-between gap-4 py-2">
                      <dt className="text-muted-foreground">{f.label}</dt>
                      <dd className="text-right font-medium">{values[f.key] || "—"}</dd>
                    </div>
                  )
                )}
              </dl>
            </section>
            <FileList instanceId={instance.id} files={instance.files} labels={Object.fromEntries(schema.required_files.map((r) => [r.key, r.label]))} />
          </div>
          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-20">
              <Scorecard
                evaluationId={ev.id}
                criteria={schema.criteria}
                initial={{
                  scores: (ev.scores as Record<string, number>) ?? {},
                  feedback: ev.feedback ?? "",
                  privateNote: ev.privateNote ?? "",
                }}
                locked={locked}
                submittedAt={ev.submittedAt?.toISOString() ?? null}
                total={ev.total}
                canReopen={["UNDER_REVIEW", "SHORTLISTED"].includes(instance.status)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
