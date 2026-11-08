"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileCheck2,
  Loader2,
  Save,
  Send,
  Shield,
  Upload,
} from "lucide-react";
import {
  effectiveMaxMB,
  formatBytes,
  isEditable,
  validateField,
  validateFields,
  validateFile,
  type InstanceSchema,
  type SchemaField,
} from "@/lib/instance-schema";
import { hashFileClient } from "@/lib/hash-client";
import { cn, formatDate, relativeDeadline } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/status-badge";
import { ReceiptPanel } from "@/components/dashboard/receipt-panel";
import { FileList, type StoredFile } from "@/components/dashboard/file-list";

interface RunnerInstance {
  id: string;
  status: string;
  deadline: string;
  reviewNotes: string | null;
  reviewedAt: string | null;
  submittedAt: string | null;
  submissionJwt: string | null;
  dataHash: string | null;
  submissionCount: number;
  template: { name: string; code: string; description: string | null; schema: InstanceSchema };
  fields: { fieldKey: string; fieldValue: string }[];
  files: StoredFile[];
}

type UploadState = { status: "hashing" | "uploading" } | { status: "error"; message: string };

const STEPS = ["Data entry", "Files", "Review & submit"];

export function InstanceRunnerClient({ instance }: { instance: RunnerInstance }) {
  const router = useRouter();
  const schema = instance.template.schema;
  const editable = isEditable(instance.status);

  const [step, setStep] = useState(0);
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(instance.fields.map((f) => [f.fieldKey, f.fieldValue]))
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<Record<string, StoredFile>>(() =>
    Object.fromEntries(instance.files.map((f) => [f.fileKey, f]))
  );
  const [uploads, setUploads] = useState<Record<string, UploadState>>({});
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [banner, setBanner] = useState<{ text: string; items?: string[] } | null>(null);

  const deadline = relativeDeadline(instance.deadline);
  const labels = useMemo(() => Object.fromEntries(schema.fields.map((f) => [f.key, f.label])), [schema]);
  const missingFiles = schema.required_files.filter((rf) => !rf.optional && !files[rf.key]);
  const busyUploading = Object.values(uploads).some((u) => u.status !== "error");

  function setValue(key: string, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
    if (errors[key]) setErrors(({ [key]: _removed, ...rest }) => rest);
  }

  async function saveDraft(): Promise<boolean> {
    const partialErrors = validateFields(schema.fields, values, { partial: true });
    if (Object.keys(partialErrors).length) {
      setErrors(partialErrors);
      setStep(0);
      setBanner({ text: "Fix the highlighted fields before saving." });
      return false;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/instances/${instance.id}/fields`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fields: values }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.fieldErrors) setErrors(data.fieldErrors);
        setBanner({ text: data.error || "Could not save" });
        return false;
      }
      setDirty(false);
      setSavedAt(new Date().toISOString());
      return true;
    } catch {
      setBanner({ text: "You appear to be offline. Your entries are still on this page." });
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function next() {
    setBanner(null);
    if (step === 0) {
      const all = validateFields(schema.fields, values);
      setErrors(all);
      if (Object.keys(all).length) return;
      if (dirty && !(await saveDraft())) return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  async function upload(key: string, file: File) {
    const rf = schema.required_files.find((r) => r.key === key)!;
    const problem = validateFile(rf, file.name, file.size);
    if (problem) {
      setUploads((u) => ({ ...u, [key]: { status: "error", message: problem } }));
      return;
    }
    setUploads((u) => ({ ...u, [key]: { status: "hashing" } }));
    try {
      const clientHash = await hashFileClient(file);
      setUploads((u) => ({ ...u, [key]: { status: "uploading" } }));
      const form = new FormData();
      form.append("file", file);
      form.append("fileKey", key);
      form.append("clientHash", clientHash);
      const res = await fetch(`/api/instances/${instance.id}/upload`, { method: "POST", body: form });
      const data = await res.json().catch(() => ({ error: `Upload failed (${res.status})` }));
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setFiles((f) => ({
        ...f,
        [key]: {
          id: data.id,
          fileKey: key,
          fileName: data.fileName,
          fileSize: data.fileSize,
          serverHash: data.serverHash,
        },
      }));
      setUploads(({ [key]: _done, ...rest }) => rest);
    } catch (e) {
      setUploads((u) => ({ ...u, [key]: { status: "error", message: (e as Error).message } }));
    }
  }

  async function submit() {
    setBanner(null);
    const all = validateFields(schema.fields, values);
    if (Object.keys(all).length) {
      setErrors(all);
      setStep(0);
      return;
    }
    if (missingFiles.length) {
      setStep(1);
      setBanner({ text: "Upload the required files first.", items: missingFiles.map((f) => f.label) });
      return;
    }
    setSubmitting(true);
    if (dirty && !(await saveDraft())) {
      setSubmitting(false);
      return;
    }
    try {
      const res = await fetch(`/api/instances/${instance.id}/submit`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        if (data.fieldErrors) setErrors(data.fieldErrors);
        setBanner({
          text: data.error || "Submission failed",
          items: [
            ...Object.entries(data.fieldErrors ?? {}).map(([k, v]) => `${labels[k] ?? k}: ${v}`),
            ...(data.missingFiles ?? []).map((f: string) => `Missing file: ${f}`),
          ],
        });
        setSubmitting(false);
        return;
      }
      router.refresh();
    } catch {
      setBanner({ text: "You appear to be offline. Nothing was submitted." });
      setSubmitting(false);
    }
  }

  const header = (
    <div className="mb-6">
      <Link
        href="/dashboard/licensee/instances"
        className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-bocra-navy"
      >
        <ArrowLeft size={14} /> My instances
      </Link>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-bocra-navy">{instance.template.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            <span className="font-mono">{instance.template.code}</span> · Due {formatDate(instance.deadline)}
            {editable && (
              <span className={cn("ml-1", deadline.overdue ? "text-red-600" : deadline.soon ? "text-amber-700" : "")}>
                ({deadline.text})
              </span>
            )}
          </p>
          {instance.template.description && (
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{instance.template.description}</p>
          )}
        </div>
        <StatusBadge status={instance.status} />
      </div>
    </div>
  );

  const reviewNote = instance.reviewNotes && (
    <div
      className={cn(
        "mb-6 flex gap-3 rounded-xl border p-4",
        instance.status === "APPROVED" ? "border-green-200 bg-green-50" : "border-amber-200 bg-amber-50"
      )}
    >
      <AlertTriangle size={18} className={cn("shrink-0", instance.status === "APPROVED" ? "text-green-700" : "text-amber-700")} />
      <div className="text-sm">
        <p className="font-medium text-bocra-navy">
          {instance.status === "FLAGGED" ? "BOCRA asked for changes" : "Reviewer notes"}
          {instance.reviewedAt && <span className="font-normal text-muted-foreground"> · {formatDate(instance.reviewedAt)}</span>}
        </p>
        <p className="mt-1 text-muted-foreground">{instance.reviewNotes}</p>
        {instance.status === "FLAGGED" && (
          <p className="mt-2 text-xs text-amber-800">Update the data or files below, then resubmit.</p>
        )}
      </div>
    </div>
  );

  // ---------- Locked (submitted / reviewed) view ----------
  if (!editable) {
    return (
      <div>
        {header}
        {reviewNote}
        {instance.status === "SUBMITTED" && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-900">
            <CheckCircle2 size={18} className="shrink-0" />
            Submitted {formatDate(instance.submittedAt, true)}. The data is locked while BOCRA reviews it.
          </div>
        )}
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <DataList schema={schema} values={values} />
          </div>
          <div className="space-y-6 lg:col-span-2">
            <FileList instanceId={instance.id} files={Object.values(files)} />
            {instance.submissionJwt && (
              <ReceiptPanel instanceId={instance.id} submissionJwt={instance.submissionJwt} dataHash={instance.dataHash} />
            )}
          </div>
        </div>
      </div>
    );
  }

  // ---------- Editable wizard ----------
  return (
    <div>
      {header}
      {reviewNote}

      <ol className="mb-6 flex flex-wrap items-center gap-2">
        {STEPS.map((label, i) => (
          <li key={label} className="flex items-center gap-2">
            <button
              onClick={() => i < step && setStep(i)}
              disabled={i > step}
              className="flex items-center gap-2 disabled:cursor-default"
            >
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium",
                  i < step ? "bg-bocra-green text-white" : i === step ? "bg-bocra-blue text-white" : "bg-gray-200 text-gray-500"
                )}
              >
                {i < step ? <CheckCircle2 size={16} /> : i + 1}
              </span>
              <span className={cn("text-sm", i <= step ? "font-medium text-bocra-navy" : "text-muted-foreground")}>
                {label}
              </span>
            </button>
            {i < STEPS.length - 1 && <span className="mx-1 h-px w-6 bg-gray-300 sm:w-10" />}
          </li>
        ))}
      </ol>

      {banner && (
        <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <p className="font-medium">{banner.text}</p>
          {banner.items && banner.items.length > 0 && (
            <ul className="mt-1 list-disc pl-5">
              {banner.items.map((it) => (
                <li key={it}>{it}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="rounded-xl border border-border bg-white p-5 sm:p-6">
        {step === 0 && (
          <div className="grid gap-5 sm:grid-cols-2">
            {schema.fields.map((field) => (
              <FieldInput
                key={field.key}
                field={field}
                value={values[field.key] ?? ""}
                error={errors[field.key]}
                onChange={(v) => setValue(field.key, v)}
                onBlur={() => {
                  const value = values[field.key] ?? "";
                  const err = value.trim() ? validateField(field, value) : null;
                  if (err) setErrors((e) => ({ ...e, [field.key]: err }));
                }}
              />
            ))}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            {schema.required_files.length === 0 && (
              <p className="text-sm text-muted-foreground">This template doesn&apos;t need any files.</p>
            )}
            {schema.required_files.map((rf) => {
              const stored = files[rf.key];
              const state = uploads[rf.key];
              const busy = !!state && state.status !== "error";
              return (
                <div key={rf.key} className="rounded-lg border border-border p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">
                        {rf.label}
                        {rf.optional && <span className="ml-1 font-normal text-muted-foreground">(optional)</span>}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {rf.extensions.join(", ")} · up to {effectiveMaxMB(rf)} MB
                      </p>
                    </div>
                    <label
                      className={cn(
                        "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors focus-within:ring-2 focus-within:ring-bocra-blue",
                        stored
                          ? "border-border hover:bg-bocra-light"
                          : "border-bocra-blue bg-bocra-blue text-white hover:bg-bocra-blue/90",
                        busy && "pointer-events-none opacity-70"
                      )}
                    >
                      {busy ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
                      {state?.status === "hashing"
                        ? "Hashing…"
                        : state?.status === "uploading"
                          ? "Uploading…"
                          : stored
                            ? "Replace"
                            : "Choose file"}
                      <input
                        type="file"
                        className="sr-only"
                        accept={rf.extensions.join(",")}
                        disabled={busy}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          e.target.value = "";
                          if (file) upload(rf.key, file);
                        }}
                      />
                    </label>
                  </div>
                  {stored && (
                    <div className="mt-3 flex items-start gap-2 rounded-lg bg-green-50 p-3 text-xs text-green-800">
                      <FileCheck2 size={16} className="shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium">
                          {stored.fileName} · {formatBytes(stored.fileSize)}
                        </p>
                        <p className="break-all font-mono text-[11px] opacity-80">SHA-256 {stored.serverHash}</p>
                        <p className="mt-0.5">Your browser&apos;s hash matched the server&apos;s.</p>
                      </div>
                    </div>
                  )}
                  {state?.status === "error" && <p className="mt-2 text-xs text-red-600">{state.message}</p>}
                </div>
              );
            })}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <DataList schema={schema} values={values} />
            <div className="rounded-lg bg-bocra-light p-4">
              <h4 className="mb-2 text-sm font-medium">Files</h4>
              {schema.required_files.length === 0 && <p className="text-sm text-muted-foreground">None required.</p>}
              {schema.required_files.map((rf) => (
                <div key={rf.key} className="flex justify-between gap-4 py-1 text-sm">
                  <span className="text-muted-foreground">{rf.label}</span>
                  <span className={cn("font-medium", !files[rf.key] && !rf.optional && "text-red-600")}>
                    {files[rf.key]?.fileName ?? (rf.optional ? "Not provided" : "Missing")}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
              <Shield size={20} className="shrink-0" />
              <p>
                Submitting locks this instance. You&apos;ll get a signed receipt covering the data above and the SHA-256
                hash of every file, so neither side can change them afterwards without it showing.
              </p>
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <button
            onClick={() => setStep((s) => Math.max(s - 1, 0))}
            disabled={step === 0}
            className="flex items-center gap-2 px-2 py-2 text-sm font-medium text-muted-foreground hover:text-bocra-navy disabled:opacity-30"
          >
            <ArrowLeft size={16} /> Back
          </button>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-muted-foreground sm:inline" aria-live="polite">
              {saving ? "Saving…" : dirty ? "Unsaved changes" : savedAt ? `Saved ${formatDate(savedAt, true)}` : ""}
            </span>
            <button
              onClick={saveDraft}
              disabled={saving || !dirty}
              className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-bocra-light disabled:opacity-40"
            >
              <Save size={15} /> Save draft
            </button>
            {step < STEPS.length - 1 ? (
              <button
                onClick={next}
                disabled={saving || (step === 1 && busyUploading)}
                className="flex items-center gap-2 rounded-lg bg-bocra-blue px-4 py-2 text-sm font-medium text-white hover:bg-bocra-blue/90 disabled:opacity-50"
              >
                Next <ArrowRight size={16} />
              </button>
            ) : (
              <button
                onClick={submit}
                disabled={submitting}
                className="flex items-center gap-2 rounded-lg bg-bocra-green px-5 py-2 text-sm font-medium text-white hover:bg-bocra-green/90 disabled:opacity-50"
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                {submitting ? "Signing…" : instance.status === "FLAGGED" ? "Sign & resubmit" : "Sign & submit"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DataList({ schema, values }: { schema: InstanceSchema; values: Record<string, string> }) {
  return (
    <div className="rounded-xl border border-border bg-white p-5">
      <h3 className="mb-3 font-semibold text-bocra-navy">Data</h3>
      <dl className="divide-y divide-border text-sm">
        {schema.fields.map((f) => (
          <div key={f.key} className="flex justify-between gap-4 py-2">
            <dt className="text-muted-foreground">{f.label}</dt>
            <dd className="text-right font-medium">{values[f.key] || "—"}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function FieldInput({
  field,
  value,
  error,
  onChange,
  onBlur,
}: {
  field: SchemaField;
  value: string;
  error?: string;
  onChange: (v: string) => void;
  onBlur: () => void;
}) {
  const id = `field-${field.key}`;
  const base = cn(
    "w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-bocra-blue",
    error ? "border-red-400" : "border-border"
  );
  const range = [
    field.validation?.min !== undefined ? `min ${field.validation.min}` : null,
    field.validation?.max !== undefined ? `max ${field.validation.max}` : null,
  ]
    .filter(Boolean)
    .join(" · ");
  const help = [field.hint, range].filter(Boolean).join(" · ");

  return (
    <div className={field.type === "textarea" ? "sm:col-span-2" : ""}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {field.label}
        {field.required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {field.type === "textarea" ? (
        <textarea id={id} value={value} rows={3} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} className={base} />
      ) : field.type === "select" && field.options ? (
        <select id={id} value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} className={cn(base, "bg-white")}>
          <option value="">Choose…</option>
          {field.options.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
          inputMode={field.type === "number" ? "decimal" : undefined}
          step="any"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          aria-invalid={!!error}
          className={base}
        />
      )}
      {error ? (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      ) : (
        help && <p className="mt-1 text-xs text-muted-foreground">{help}</p>
      )}
    </div>
  );
}
