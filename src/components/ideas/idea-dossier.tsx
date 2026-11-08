import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertTriangle, ArrowLeft, CheckCircle2, Info, Lock, ShieldAlert, ShieldCheck, TrendingDown, TrendingUp, UserX,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { fieldsToRecord, schemaOf, integrityOf } from "@/lib/instances";
import { screeningInsights } from "@/lib/analysis";
import { summarise } from "@/lib/scoring";
import { availableActions } from "@/lib/decisions";
import { actionLabel, sectorName, stageName } from "@/lib/labels";
import { ageOn } from "@/lib/eligibility";
import { cn, formatDate, formatPula } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/status-badge";
import { FileList } from "@/components/dashboard/file-list";
import { ReceiptPanel } from "@/components/dashboard/receipt-panel";
import { JourneyTracker } from "@/components/ideas/journey-tracker";
import { MessageThread } from "@/components/ideas/message-thread";
import { DecisionPanel } from "@/components/ideas/decision-panel";
import { AssignEvaluators } from "@/components/ideas/assign-evaluators";
import type { SessionUser } from "@/lib/session";

/**
 * Everything CEDA knows about one idea, for programme admins (screening view)
 * and the adjudication panel (scores first).
 */
export async function IdeaDossier({ id, user, mode }: { id: string; user: SessionUser; mode: "admin" | "panel" }) {
  const instance = await prisma.instance.findUnique({
    where: { id },
    include: {
      template: true,
      innovator: {
        select: {
          name: true, email: true, phone: true, organizationName: true, licenseNumber: true, district: true, gender: true,
          omang: true, dateOfBirth: true, youthShareholding: true,
        },
      },
      reviewedBy: { select: { name: true } },
      fields: true,
      files: true,
      evaluations: { include: { evaluator: { select: { name: true, expertise: true } } }, orderBy: { assignedAt: "asc" } },
      audits: { orderBy: { createdAt: "desc" }, take: 25, include: { actor: { select: { name: true } } } },
    },
  });
  if (!instance || instance.status === "DRAFT") notFound();

  const schema = schemaOf(instance.template);
  const values = fieldsToRecord(instance.fields);
  const insights = screeningInsights(values, schema, instance.innovator);
  const integrity = integrityOf(instance);
  const summary = summarise(schema.criteria, instance.evaluations);
  const actions = availableActions(user.role, instance.status);
  const fileLabels = Object.fromEntries(schema.required_files.map((rf) => [rf.key, rf.label]));
  const files = instance.files.map(({ content: _c, ...f }) => f);
  const requested = Number(values.funding_requested) || null;
  const isStaff = user.role === "ADMIN" || user.role === "SUPERADMIN";
  const canAssign = isStaff && ["SUBMITTED", "UNDER_REVIEW"].includes(instance.status);

  const evaluatorOptions = canAssign
    ? await prisma.user.findMany({
        where: { role: "EVALUATOR" },
        select: { id: true, name: true, expertise: true, evaluations: { where: { submittedAt: null, conflict: { not: true } }, select: { id: true } } },
        orderBy: { name: "asc" },
      })
    : [];
  const assignedIds = new Set(instance.evaluations.map((e) => e.evaluatorId));

  const back = mode === "panel" ? { href: "/dashboard/panel", label: "Panel shortlist" } : { href: "/dashboard/admin/instances", label: "Ideas & screening" };
  const age = instance.innovator.dateOfBirth ? ageOn(instance.innovator.dateOfBirth) : null;

  const evaluationsBlock = (
    <section className="rounded-xl border border-border bg-white p-5">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-semibold text-ceda-navy">Evaluator scores</h3>
        {summary.mean !== null && (
          <p className="text-sm text-muted-foreground">
            Mean <span className="text-lg font-bold text-ceda-navy">{summary.mean}</span>/100 · range {summary.min}–{summary.max}
            {summary.disagreement && <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">Evaluators disagree</span>}
          </p>
        )}
      </div>
      {instance.evaluations.length === 0 ? (
        <p className="text-sm text-muted-foreground">No evaluators assigned yet.</p>
      ) : (
        <>
          <div className="-mx-5 overflow-x-auto px-5">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="py-2 pr-3 font-medium">Criterion</th>
                  {instance.evaluations.map((e) => (
                    <th key={e.id} className="px-2 py-2 text-center font-medium">{e.evaluator.name.split(" ").slice(-1)[0]}</th>
                  ))}
                  <th className="py-2 pl-2 text-center font-medium">Mean</th>
                </tr>
              </thead>
              <tbody>
                {schema.criteria.map((c) => {
                  const vals = instance.evaluations.map((e) => (e.submittedAt ? (e.scores as Record<string, number> | null)?.[c.key] : undefined));
                  const nums = vals.filter((v): v is number => typeof v === "number");
                  const wide = nums.length > 1 && Math.max(...nums) - Math.min(...nums) >= 2;
                  return (
                    <tr key={c.key} className="border-b border-border/60">
                      <td className="py-2 pr-3">{c.label} <span className="text-xs text-muted-foreground">{c.weight}%</span></td>
                      {vals.map((v, i) => (
                        <td key={i} className={cn("px-2 py-2 text-center font-medium", wide && "bg-amber-50")}>{v ?? "·"}</td>
                      ))}
                      <td className="py-2 pl-2 text-center font-semibold text-ceda-navy">{summary.perCriterion[c.key] ?? "—"}</td>
                    </tr>
                  );
                })}
                <tr>
                  <td className="py-2 pr-3 font-semibold">Total /100</td>
                  {instance.evaluations.map((e) => (
                    <td key={e.id} className="px-2 py-2 text-center font-bold text-ceda-navy">
                      {e.conflict ? <UserX size={14} className="mx-auto text-gray-400" /> : e.submittedAt ? e.total : <span className="text-xs font-normal text-muted-foreground">pending</span>}
                    </td>
                  ))}
                  <td className="py-2 pl-2 text-center font-bold text-ceda-blue">{summary.mean ?? "—"}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <ul className="mt-4 space-y-3">
            {instance.evaluations.map((e) => (
              <li key={e.id} className="rounded-lg bg-ceda-light p-3 text-sm">
                <p className="mb-1 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{e.evaluator.name}</span>
                  <span>
                    {e.conflict
                      ? "Stepped aside: conflict of interest"
                      : e.submittedAt
                        ? `Submitted ${formatDate(e.submittedAt)}`
                        : e.conflict === null
                          ? `Not yet declared · due ${formatDate(e.dueAt)}`
                          : `Scoring · due ${formatDate(e.dueAt)}`}
                  </span>
                </p>
                {e.conflict && e.conflictNote && <p className="italic text-muted-foreground">{e.conflictNote}</p>}
                {e.submittedAt && e.feedback && <p className="whitespace-pre-wrap">{e.feedback}</p>}
                {e.submittedAt && e.privateNote && (
                  <p className="mt-2 rounded border border-dashed border-amber-300 bg-amber-50 p-2 text-xs">
                    <Lock size={10} className="mr-1 inline" /> To the panel: {e.privateNote}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );

  return (
    <div>
      <Link href={back.href} className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-ceda-navy">
        <ArrowLeft size={14} /> {back.label}
      </Link>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-xs text-muted-foreground">{instance.referenceCode}</p>
          <h1 className="text-2xl font-bold text-ceda-navy">{instance.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {instance.innovator.organizationName ?? instance.innovator.name} · {instance.template.name} · {sectorName(instance.template.dataType)},{" "}
            {stageName(instance.template.scale)} stage
          </p>
        </div>
        <StatusBadge status={instance.status} />
      </div>

      <div className="mb-6 rounded-xl border border-border bg-white px-3 py-4 sm:px-6">
        <JourneyTracker status={instance.status} />
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Meta label="Panel score" value={summary.mean !== null ? `${summary.mean}/100` : "—"} sub={`${summary.count} of ${instance.evaluations.filter((e) => !e.conflict).length || instance.template.reviewersPerIdea} scores in`} />
        <Meta label="Funding requested" value={formatPula(requested)} sub={instance.status === "AWARDED" ? `Awarded ${formatPula(instance.awardAmount)}` : undefined} />
        <Meta label="Submitted" value={formatDate(instance.submittedAt, true)} sub={instance.submissionCount > 1 ? `Resubmission #${instance.submissionCount}` : undefined} />
        <Meta
          label="Applicant"
          value={instance.innovator.name}
          sub={[age !== null ? `age ${age}` : null, instance.innovator.gender, instance.innovator.district].filter(Boolean).join(" · ")}
        />
      </div>

      {integrity && (
        <div className={cn("mb-6 flex items-start gap-3 rounded-xl border p-4 text-sm", integrity.ok ? "border-green-200 bg-green-50 text-green-900" : "border-red-200 bg-red-50 text-red-900")}>
          {integrity.ok ? <ShieldCheck size={20} className="shrink-0" /> : <ShieldAlert size={20} className="shrink-0" />}
          <div>
            <p className="font-semibold">{integrity.ok ? "Submission integrity verified" : "Integrity check failed"}</p>
            <p className="text-xs opacity-80">
              {integrity.ok
                ? `Signed receipt valid, answers unchanged since signing, ${integrity.files.length} document${integrity.files.length === 1 ? "" : "s"} match their SHA-256 hashes.`
                : [
                    !integrity.receiptValid && "receipt signature invalid",
                    !integrity.dataMatches && "answers changed after signing",
                    ...integrity.files.filter((f) => !f.storedHashMatches || !f.inReceipt).map((f) => `${f.fileName} altered`),
                  ].filter(Boolean).join("; ")}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          <DecisionPanel
            instanceId={instance.id}
            actions={actions}
            suggestedAward={requested}
            title={mode === "panel" ? "Panel decision" : instance.status === "SUBMITTED" ? "Screening decision" : "Decision"}
          />

          {instance.reviewNotes && (
            <div className="rounded-xl border border-border bg-white p-5 text-sm">
              <p className="font-semibold text-ceda-navy">Latest decision note</p>
              <p className="mt-1 text-muted-foreground">{instance.reviewNotes}</p>
              {instance.reviewedBy && <p className="mt-1 text-xs text-muted-foreground">{instance.reviewedBy.name} · {formatDate(instance.reviewedAt, true)}</p>}
            </div>
          )}

          {mode === "panel" && evaluationsBlock}

          {canAssign && (
            <AssignEvaluators
              instanceId={instance.id}
              suggested={instance.template.reviewersPerIdea}
              evaluators={evaluatorOptions.map((e) => ({ id: e.id, name: e.name, expertise: e.expertise, open: e.evaluations.length, assigned: assignedIds.has(e.id) }))}
            />
          )}

          <section className="rounded-xl border border-border bg-white p-5">
            <h3 className="mb-3 font-semibold text-ceda-navy">Screening checks</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {insights.map((a) => (
                <div key={a.label} className="rounded-lg bg-ceda-light p-3">
                  <p className="text-xs text-muted-foreground">{a.label}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="font-bold text-ceda-navy">{a.value}</span>
                    {a.status === "good" && <TrendingUp size={16} className="text-ceda-green" />}
                    {a.status === "warn" && <AlertTriangle size={16} className="text-amber-600" />}
                    {a.status === "bad" && <TrendingDown size={16} className="text-red-600" />}
                    {a.status === "info" && <Info size={16} className="text-ceda-blue" />}
                  </div>
                  {a.note && <p className="mt-1 text-[11px] text-muted-foreground">{a.note}</p>}
                </div>
              ))}
            </div>
          </section>

          {mode === "admin" && evaluationsBlock}

          <section className="rounded-xl border border-border bg-white p-5">
            <h3 className="mb-2 font-semibold text-ceda-navy">Application</h3>
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
        </div>

        <div className="space-y-6 lg:col-span-2">
          <MessageThread instanceId={instance.id} staff title="Messages with the innovator" />
          <FileList instanceId={instance.id} files={files} labels={fileLabels} />
          {instance.submissionJwt && <ReceiptPanel instanceId={instance.id} submissionJwt={instance.submissionJwt} dataHash={instance.dataHash} />}
          <section className="rounded-xl border border-border bg-white p-5">
            <h3 className="mb-1 font-semibold text-ceda-navy">Applicant</h3>
            <p className="mb-3 text-xs text-muted-foreground">Hidden from evaluators.</p>
            <dl className="space-y-1 text-sm">
              <Row k="Email" v={instance.innovator.email} />
              <Row k="Phone" v={instance.innovator.phone} />
              <Row k="CIPA number" v={instance.innovator.licenseNumber} />
              <Row k="Youth shareholding" v={instance.innovator.youthShareholding != null ? `${instance.innovator.youthShareholding}%` : null} />
              <Row k="Omang" v={instance.innovator.omang ? `•••••${instance.innovator.omang.slice(-4)}` : null} />
            </dl>
          </section>
          <section className="rounded-xl border border-border bg-white p-5">
            <h3 className="mb-3 font-semibold text-ceda-navy">History</h3>
            <ol className="space-y-3">
              {instance.audits.map((a) => (
                <li key={a.id} className="flex gap-2 text-sm">
                  <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{actionLabel(a.action)}</p>
                    <p className="text-xs text-muted-foreground">{a.actor.name} · {formatDate(a.createdAt, true)}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string | null | undefined }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="truncate text-right font-medium">{v || "—"}</dd>
    </div>
  );
}

function Meta({ label, value, sub }: { label: string; value: string; sub?: string | null }) {
  return (
    <div className="rounded-xl border border-border bg-white p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 truncate text-sm font-semibold text-ceda-navy">{value}</p>
      {sub && <p className="truncate text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}
