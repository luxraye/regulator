import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, ShieldAlert, ShieldCheck, TrendingDown, TrendingUp, AlertTriangle, Info } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { fileMetaSelect, fieldsToRecord, schemaOf, checkIntegrity } from "@/lib/instances";
import { analyseFields } from "@/lib/analysis";
import { formatDate, relativeDeadline } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/status-badge";
import { FileList } from "@/components/dashboard/file-list";
import { ReceiptPanel } from "@/components/dashboard/receipt-panel";
import { ReviewActions } from "./review-actions";

export const dynamic = "force-dynamic";

export default async function AdminInstanceDetail({ params }: { params: { id: string } }) {
  const instance = await prisma.instance.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      status: true,
      deadline: true,
      createdAt: true,
      submittedAt: true,
      reviewedAt: true,
      reviewNotes: true,
      submissionJwt: true,
      dataHash: true,
      submissionCount: true,
      template: true,
      innovator: { select: { name: true, email: true, organizationName: true, licenseNumber: true } },
      reviewedBy: { select: { name: true } },
      fields: { select: { fieldKey: true, fieldValue: true } },
      files: { select: fileMetaSelect },
      audits: { orderBy: { createdAt: "desc" }, take: 20, include: { actor: { select: { name: true } } } },
    },
  });
  if (!instance) notFound();

  const schema = schemaOf(instance.template);
  const values = fieldsToRecord(instance.fields);
  const insights = analyseFields(values);
  const integrity = instance.submissionJwt ? await checkIntegrity(instance.id) : null;
  const fileLabels = Object.fromEntries(schema.required_files.map((rf) => [rf.key, rf.label]));
  const deadline = relativeDeadline(instance.deadline);
  const late = instance.submittedAt && new Date(instance.submittedAt) > new Date(instance.deadline);

  return (
    <div>
      <Link href="/dashboard/admin/instances" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-bocra-navy">
        <ArrowLeft size={14} /> All instances
      </Link>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-bocra-navy">{instance.template.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            <span className="font-mono">{instance.template.code}</span> · {instance.innovator.organizationName} (
            {instance.innovator.licenseNumber ?? "no licence #"})
          </p>
        </div>
        <StatusBadge status={instance.status} />
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Meta label="Deadline" value={formatDate(instance.deadline)} sub={instance.submittedAt ? (late ? "Submitted late" : "On time") : deadline.text} warn={!!late || (!instance.submittedAt && deadline.overdue)} />
        <Meta label="Submitted" value={formatDate(instance.submittedAt, true)} sub={instance.submissionCount > 1 ? `Submission #${instance.submissionCount}` : undefined} />
        <Meta label="Reviewed" value={formatDate(instance.reviewedAt)} sub={instance.reviewedBy?.name} />
        <Meta label="Contact" value={instance.innovator.name} sub={instance.innovator.email} />
      </div>

      {integrity && (
        <div className={`mb-6 flex items-start gap-3 rounded-xl border p-4 text-sm ${integrity.ok ? "border-green-200 bg-green-50 text-green-900" : "border-red-200 bg-red-50 text-red-900"}`}>
          {integrity.ok ? <ShieldCheck size={20} className="shrink-0" /> : <ShieldAlert size={20} className="shrink-0" />}
          <div>
            <p className="font-semibold">{integrity.ok ? "Integrity verified" : "Integrity check failed"}</p>
            <p className="text-xs opacity-80">
              {integrity.ok
                ? `Receipt signature valid, field data unchanged, ${integrity.files.length} file${integrity.files.length === 1 ? "" : "s"} match their hashes.`
                : [!integrity.receiptValid && "receipt signature invalid", !integrity.dataMatches && "field data changed after signing", ...integrity.files.filter((f) => !f.storedHashMatches || !f.inReceipt).map((f) => `${f.fileName} altered`)].filter(Boolean).join("; ")}
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          {instance.status === "SUBMITTED" && <ReviewActions instanceId={instance.id} />}

          {instance.reviewNotes && instance.status !== "SUBMITTED" && (
            <div className="rounded-xl border border-border bg-white p-5 text-sm">
              <p className="font-semibold text-bocra-navy">Review notes</p>
              <p className="mt-1 text-muted-foreground">{instance.reviewNotes}</p>
            </div>
          )}

          <div className="rounded-xl border border-border bg-white p-5">
            <h3 className="mb-3 font-semibold text-bocra-navy">Automated checks</h3>
            {insights.length === 0 ? (
              <p className="text-sm text-muted-foreground">No automated checks apply to this template. Review the raw data below.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {insights.map((a) => (
                  <div key={a.label} className="rounded-lg bg-bocra-light p-3">
                    <p className="text-xs text-muted-foreground">{a.label}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-lg font-bold text-bocra-navy">{a.value}</span>
                      {a.status === "good" && <TrendingUp size={16} className="text-bocra-green" />}
                      {a.status === "warn" && <AlertTriangle size={16} className="text-amber-600" />}
                      {a.status === "bad" && <TrendingDown size={16} className="text-red-600" />}
                      {a.status === "info" && <Info size={16} className="text-bocra-blue" />}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-border bg-white p-5">
            <h3 className="mb-3 font-semibold text-bocra-navy">Submitted data</h3>
            {instance.fields.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nothing entered yet.</p>
            ) : (
              <dl className="divide-y divide-border text-sm">
                {schema.fields.map((f) => (
                  <div key={f.key} className="flex justify-between gap-4 py-2">
                    <dt className="text-muted-foreground">{f.label}</dt>
                    <dd className="text-right font-mono font-medium">{values[f.key] || "—"}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <FileList instanceId={instance.id} files={instance.files} labels={fileLabels} />
          {instance.submissionJwt && (
            <ReceiptPanel instanceId={instance.id} submissionJwt={instance.submissionJwt} dataHash={instance.dataHash} />
          )}
          <div className="rounded-xl border border-border bg-white p-5">
            <h3 className="mb-3 font-semibold text-bocra-navy">History</h3>
            <ol className="space-y-3">
              {instance.audits.map((a) => (
                <li key={a.id} className="flex gap-2 text-sm">
                  <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{a.action.replace(/^INSTANCE_/, "").replace(/_/g, " ").toLowerCase()}</p>
                    <p className="text-xs text-muted-foreground">
                      {a.actor.name} · {formatDate(a.createdAt, true)}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

function Meta({ label, value, sub, warn }: { label: string; value: string; sub?: string | null; warn?: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-white p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-bocra-navy">{value}</p>
      {sub && <p className={`truncate text-xs ${warn ? "text-red-600" : "text-muted-foreground"}`}>{sub}</p>}
    </div>
  );
}
