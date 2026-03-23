"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Upload, ArrowRight, ArrowLeft, Send, Shield } from "lucide-react";

interface SchemaField {
  key: string;
  label: string;
  type: string;
  required: boolean;
  validation?: { min?: number; max?: number; pattern?: string };
}

interface RequiredFile {
  key: string;
  label: string;
  extensions: string[];
  maxSizeMB: number;
}

interface Instance {
  id: string;
  status: string;
  deadline: string;
  reviewNotes: string | null;
  template: {
    name: string;
    code: string;
    schema: {
      fields: SchemaField[];
      required_files: RequiredFile[];
    };
  };
  fields: { fieldKey: string; fieldValue: string }[];
  files: { fileName: string; fileExtension: string; fileSize: number; clientHash: string }[];
}

export function InstanceRunnerClient({ instance }: { instance: Instance }) {
  const router = useRouter();
  const schema = instance.template.schema;
  const isReadOnly = !["PENDING", "IN_PROGRESS"].includes(instance.status);

  const [step, setStep] = useState(0);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    instance.fields.forEach((f) => {
      initial[f.fieldKey] = f.fieldValue;
    });
    return initial;
  });
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File>>({});
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const totalSteps = 3;
  const stepLabels = ["Data Entry", "File Upload", "Review & Submit"];

  function validateField(field: SchemaField, value: string): string | null {
    if (field.required && !value.trim()) return `${field.label} is required`;
    if (field.type === "number" && value) {
      const num = Number(value);
      if (isNaN(num)) return "Must be a number";
      if (field.validation?.min !== undefined && num < field.validation.min)
        return `Minimum value is ${field.validation.min}`;
      if (field.validation?.max !== undefined && num > field.validation.max)
        return `Maximum value is ${field.validation.max}`;
    }
    return null;
  }

  function validateStep0(): boolean {
    const newErrors: Record<string, string> = {};
    schema.fields.forEach((field) => {
      const err = validateField(field, fieldValues[field.key] || "");
      if (err) newErrors[field.key] = err;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleNext() {
    if (step === 0 && !validateStep0()) return;
    setStep((s) => Math.min(s + 1, totalSteps - 1));
  }

  async function handleFileUpload(key: string, file: File) {
    setUploadedFiles((prev) => ({ ...prev, [key]: file }));
  }

  async function handleSubmit() {
    if (isReadOnly) return;
    setSubmitting(true);

    try {
      await fetch(`/api/instances/${instance.id}/fields`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fields: fieldValues }),
      });

      for (const [key, file] of Object.entries(uploadedFiles)) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("fileKey", key);
        await fetch(`/api/instances/${instance.id}/upload`, {
          method: "POST",
          body: formData,
        });
      }

      await fetch(`/api/instances/${instance.id}/submit`, { method: "POST" });

      router.push("/dashboard/licensee/instances");
      router.refresh();
    } catch {
      setSubmitting(false);
    }
  }

  if (isReadOnly) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-bocra-navy">{instance.template.name}</h1>
          <p className="text-muted-foreground mt-1">{instance.template.code} &middot; {instance.status}</p>
        </div>

        {instance.reviewNotes && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <p className="text-sm font-medium text-amber-800">Review Notes</p>
            <p className="text-sm text-amber-700 mt-1">{instance.reviewNotes}</p>
          </div>
        )}

        <div className="bg-white rounded-xl border border-border p-6 space-y-4">
          <h3 className="font-semibold">Submitted Data</h3>
          {instance.fields.map((f) => (
            <div key={f.fieldKey} className="flex justify-between text-sm border-b border-border pb-2">
              <span className="text-muted-foreground">{f.fieldKey}</span>
              <span className="font-medium">{f.fieldValue}</span>
            </div>
          ))}
          {instance.files.length > 0 && (
            <>
              <h3 className="font-semibold pt-2">Uploaded Files</h3>
              {instance.files.map((f) => (
                <div key={f.fileName} className="text-sm bg-bocra-light rounded-lg p-3">
                  {f.fileName} ({(f.fileSize / 1024).toFixed(1)} KB)
                  <span className="text-xs text-muted-foreground ml-2">SHA-256: {f.clientHash.slice(0, 16)}...</span>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-bocra-navy">{instance.template.name}</h1>
        <p className="text-muted-foreground mt-1">
          {instance.template.code} &middot; Due {new Date(instance.deadline).toLocaleDateString()}
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {stepLabels.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                i <= step
                  ? "bg-bocra-blue text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {i < step ? <CheckCircle2 size={16} /> : i + 1}
            </div>
            <span className={`text-sm ${i <= step ? "text-bocra-navy font-medium" : "text-muted-foreground"}`}>
              {label}
            </span>
            {i < totalSteps - 1 && <div className="w-8 h-px bg-gray-300 mx-1" />}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-border p-6">
        {/* Step 0: Data Entry */}
        {step === 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-bocra-navy mb-4">Enter Compliance Data</h3>
            {schema.fields.map((field) => (
              <div key={field.key}>
                <label className="block text-sm font-medium mb-1.5">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {field.type === "textarea" ? (
                  <textarea
                    value={fieldValues[field.key] || ""}
                    onChange={(e) =>
                      setFieldValues((prev) => ({ ...prev, [field.key]: e.target.value }))
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-bocra-blue"
                  />
                ) : (
                  <input
                    type={field.type === "number" ? "number" : "text"}
                    value={fieldValues[field.key] || ""}
                    onChange={(e) =>
                      setFieldValues((prev) => ({ ...prev, [field.key]: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-bocra-blue"
                  />
                )}
                {field.validation && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {field.validation.min !== undefined && `Min: ${field.validation.min}`}
                    {field.validation.min !== undefined && field.validation.max !== undefined && " | "}
                    {field.validation.max !== undefined && `Max: ${field.validation.max}`}
                  </p>
                )}
                {errors[field.key] && (
                  <p className="text-xs text-red-500 mt-1">{errors[field.key]}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Step 1: File Upload */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-bocra-navy mb-4">Upload Required Files</h3>
            {schema.required_files.map((rf) => (
              <div key={rf.key} className="border border-border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-sm">{rf.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Accepted: {rf.extensions.join(", ")} &middot; Max: {rf.maxSizeMB}MB
                    </p>
                  </div>
                  {uploadedFiles[rf.key] && (
                    <CheckCircle2 size={20} className="text-bocra-green" />
                  )}
                </div>
                <div className="mt-3">
                  <label className="flex items-center gap-2 cursor-pointer text-bocra-blue hover:underline text-sm">
                    <Upload size={16} />
                    {uploadedFiles[rf.key] ? uploadedFiles[rf.key].name : "Choose file"}
                    <input
                      type="file"
                      className="hidden"
                      accept={rf.extensions.join(",")}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(rf.key, file);
                      }}
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Step 2: Review & Submit */}
        {step === 2 && (
          <div className="space-y-6">
            <h3 className="font-semibold text-bocra-navy">Review Your Submission</h3>

            <div className="bg-bocra-light rounded-lg p-4">
              <h4 className="text-sm font-medium mb-2">Data Fields</h4>
              {schema.fields.map((field) => (
                <div key={field.key} className="flex justify-between text-sm py-1">
                  <span className="text-muted-foreground">{field.label}</span>
                  <span className="font-medium">{fieldValues[field.key] || "—"}</span>
                </div>
              ))}
            </div>

            <div className="bg-bocra-light rounded-lg p-4">
              <h4 className="text-sm font-medium mb-2">Files</h4>
              {schema.required_files.map((rf) => (
                <div key={rf.key} className="flex justify-between text-sm py-1">
                  <span className="text-muted-foreground">{rf.label}</span>
                  <span className="font-medium">
                    {uploadedFiles[rf.key]?.name || "Not uploaded"}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
              <Shield size={20} />
              <p>
                Files will be SHA-256 hashed for integrity verification. Your submission 
                will be digitally signed and stored in the immutable Compliance Vault.
              </p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-4 border-t border-border">
          <button
            onClick={() => setStep((s) => Math.max(s - 1, 0))}
            disabled={step === 0}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-bocra-navy disabled:opacity-30 transition-colors"
          >
            <ArrowLeft size={16} /> Previous
          </button>

          {step < totalSteps - 1 ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-4 py-2 bg-bocra-blue text-white rounded-lg text-sm font-medium hover:bg-bocra-blue/80 transition-colors"
            >
              Next <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2 bg-bocra-green text-white rounded-lg text-sm font-medium hover:bg-bocra-green/80 transition-colors disabled:opacity-50"
            >
              <Send size={16} />
              {submitting ? "Submitting..." : "Sign & Submit"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
