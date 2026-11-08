"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Upload,
  ArrowRight,
  ArrowLeft,
  Send,
  Shield,
  FlaskConical,
  Download,
  RotateCcw,
} from "lucide-react";

const SANDBOX_SCHEMA = {
  fields: [
    { key: "company_name", label: "Company Name", type: "text", required: true },
    { key: "reporting_period", label: "Reporting Period", type: "text", required: true, validation: { pattern: "^Q[1-4] \\d{4}$" } },
    { key: "total_customers", label: "Total Active Customers", type: "number", required: true, validation: { min: 0 } },
    { key: "revenue_bwp", label: "Quarterly Revenue (BWP)", type: "number", required: true, validation: { min: 0 } },
    { key: "complaints_received", label: "Complaints Received", type: "number", required: true, validation: { min: 0 } },
    { key: "complaints_resolved", label: "Complaints Resolved", type: "number", required: true, validation: { min: 0 } },
    { key: "avg_resolution_days", label: "Avg. Resolution Time (Days)", type: "number", required: true, validation: { min: 0, max: 365 } },
    { key: "network_uptime", label: "Network Uptime (%)", type: "number", required: false, validation: { min: 0, max: 100 } },
    { key: "notes", label: "Additional Notes", type: "textarea", required: false },
  ],
  required_files: [
    { key: "sample_report", label: "Sample Quarterly Report", extensions: [".pdf", ".xlsx", ".csv"], maxSizeMB: 10 },
    { key: "customer_data", label: "Customer Summary Data", extensions: [".csv", ".json"], maxSizeMB: 5 },
  ],
};

type SchemaField = typeof SANDBOX_SCHEMA.fields[number];

export default function PlaygroundPage() {
  const [step, setStep] = useState(0);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const totalSteps = 3;
  const stepLabels = ["Data Entry", "File Upload", "Review & Submit"];

  function validateField(field: SchemaField, value: string): string | null {
    if (field.required && !value.trim()) return `${field.label} is required`;
    if (field.type === "number" && value) {
      const num = Number(value);
      if (isNaN(num)) return "Must be a number";
      const v = field.validation as { min?: number; max?: number; pattern?: string } | undefined;
      if (v?.min !== undefined && num < v.min) return `Minimum value is ${v.min}`;
      if (v?.max !== undefined && num > v.max) return `Maximum value is ${v.max}`;
    }
    if (field.type === "text" && value && field.validation) {
      const v = field.validation as { pattern?: string };
      if (v.pattern && !new RegExp(v.pattern).test(value)) return `Must match format (e.g. Q1 2026)`;
    }
    return null;
  }

  function validateStep0(): boolean {
    const newErrors: Record<string, string> = {};
    SANDBOX_SCHEMA.fields.forEach((field) => {
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

  function handleReset() {
    setStep(0);
    setFieldValues({});
    setUploadedFiles({});
    setErrors({});
    setSubmitted(false);
  }

  if (submitted) {
    const resolutionRate = fieldValues.complaints_received && fieldValues.complaints_resolved
      ? ((Number(fieldValues.complaints_resolved) / Number(fieldValues.complaints_received)) * 100).toFixed(1)
      : "N/A";

    return (
      <div>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-bocra-navy flex items-center gap-2">
              <FlaskConical className="w-6 h-6 text-bocra-blue" />
              Instance Playground
            </h1>
            <p className="text-muted-foreground mt-1">Sandbox submission result (not recorded)</p>
          </div>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 bg-bocra-navy text-white rounded-lg text-sm font-medium hover:bg-bocra-navy/90 transition-colors"
          >
            <RotateCcw className="w-4 h-4" /> Try Again
          </button>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-green-800">Sandbox Submission Complete</h3>
          </div>
          <p className="text-sm text-green-700">
            This is what BOCRA would see when reviewing your submission. In production, this data
            would be signed with a JWT and stored in the immutable Compliance Vault.
          </p>
        </div>

        {/* Simulated analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl border border-border p-6">
            <h3 className="font-semibold text-bocra-navy mb-4">Raw Submitted Data</h3>
            <div className="space-y-2">
              {SANDBOX_SCHEMA.fields.map((field) => (
                <div key={field.key} className="flex justify-between text-sm py-1.5 border-b border-border last:border-0">
                  <span className="text-muted-foreground">{field.label}</span>
                  <span className="font-medium">{fieldValues[field.key] || "—"}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-border p-6">
            <h3 className="font-semibold text-bocra-navy mb-4">Automated Analysis</h3>
            <div className="space-y-3">
              <div className="bg-bocra-light rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Complaint Resolution Rate</p>
                <p className="text-2xl font-bold text-bocra-navy">{resolutionRate}%</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {Number(resolutionRate) >= 80 ? "Above regulatory threshold (80%)" : "Below regulatory threshold (80%) -- may be flagged"}
                </p>
              </div>
              <div className="bg-bocra-light rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Revenue per Customer</p>
                <p className="text-2xl font-bold text-bocra-navy">
                  BWP {fieldValues.total_customers && fieldValues.revenue_bwp
                    ? (Number(fieldValues.revenue_bwp) / Number(fieldValues.total_customers)).toFixed(2)
                    : "N/A"}
                </p>
              </div>
              <div className="bg-bocra-light rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Network Uptime</p>
                <p className="text-2xl font-bold text-bocra-navy">{fieldValues.network_uptime || "Not reported"}%</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {fieldValues.network_uptime && Number(fieldValues.network_uptime) >= 99
                    ? "Meets SLA target (99%)"
                    : "Below SLA target (99%) -- may require explanation"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border p-6">
          <h3 className="font-semibold text-bocra-navy mb-4">Uploaded Files</h3>
          {Object.entries(uploadedFiles).length > 0 ? (
            <div className="space-y-2">
              {Object.entries(uploadedFiles).map(([key, file]) => (
                <div key={key} className="flex items-center justify-between bg-bocra-light rounded-lg p-3 text-sm">
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <span className="text-xs font-mono text-muted-foreground">
                    SHA-256 would be computed here
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No files uploaded in this sandbox run.</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-bocra-navy flex items-center gap-2">
            <FlaskConical className="w-6 h-6 text-bocra-blue" />
            Instance Playground
          </h1>
          <p className="text-muted-foreground mt-1">
            Practice with a sandbox Instance &mdash; nothing is recorded
          </p>
        </div>
        <a
          href="/api/sandbox/download"
          className="flex items-center gap-2 px-4 py-2 text-bocra-blue border border-bocra-blue/30 rounded-lg text-sm font-medium hover:bg-bocra-blue/5 transition-colors"
        >
          <Download className="w-4 h-4" /> Download Template
        </a>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-sm text-blue-800 flex items-start gap-2">
        <Shield className="w-5 h-5 shrink-0 mt-0.5" />
        <div>
          <p className="font-medium">Sandbox Mode</p>
          <p>This playground simulates the full Instance Runner experience. Data entered here is not saved to
          the database and does not affect your compliance record. Use it to familiarize your team with the process.</p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {stepLabels.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                i <= step ? "bg-bocra-blue text-white" : "bg-gray-200 text-gray-500"
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
        {step === 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-bocra-navy mb-4">Enter Sample Compliance Data</h3>
            {SANDBOX_SCHEMA.fields.map((field) => (
              <div key={field.key}>
                <label className="block text-sm font-medium mb-1.5">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {field.type === "textarea" ? (
                  <textarea
                    value={fieldValues[field.key] || ""}
                    onChange={(e) => setFieldValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-bocra-blue"
                  />
                ) : (
                  <input
                    type={field.type === "number" ? "number" : "text"}
                    value={fieldValues[field.key] || ""}
                    onChange={(e) => setFieldValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-bocra-blue"
                    placeholder={field.validation && "pattern" in field.validation ? "e.g. Q1 2026" : ""}
                  />
                )}
                {errors[field.key] && <p className="text-xs text-red-500 mt-1">{errors[field.key]}</p>}
              </div>
            ))}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-bocra-navy mb-4">Upload Sample Files (Optional)</h3>
            <p className="text-sm text-muted-foreground mb-4">
              File uploads are optional in the playground. In production, all required files must be provided.
            </p>
            {SANDBOX_SCHEMA.required_files.map((rf) => (
              <div key={rf.key} className="border border-border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-sm">{rf.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Accepted: {rf.extensions.join(", ")} &middot; Max: {rf.maxSizeMB}MB
                    </p>
                  </div>
                  {uploadedFiles[rf.key] && <CheckCircle2 size={20} className="text-bocra-green" />}
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
                        if (file) setUploadedFiles((prev) => ({ ...prev, [rf.key]: file }));
                      }}
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h3 className="font-semibold text-bocra-navy">Review Your Sandbox Submission</h3>
            <div className="bg-bocra-light rounded-lg p-4">
              <h4 className="text-sm font-medium mb-2">Data Fields</h4>
              {SANDBOX_SCHEMA.fields.map((field) => (
                <div key={field.key} className="flex justify-between text-sm py-1">
                  <span className="text-muted-foreground">{field.label}</span>
                  <span className="font-medium">{fieldValues[field.key] || "—"}</span>
                </div>
              ))}
            </div>
            <div className="bg-bocra-light rounded-lg p-4">
              <h4 className="text-sm font-medium mb-2">Files</h4>
              {SANDBOX_SCHEMA.required_files.map((rf) => (
                <div key={rf.key} className="flex justify-between text-sm py-1">
                  <span className="text-muted-foreground">{rf.label}</span>
                  <span className="font-medium">{uploadedFiles[rf.key]?.name || "Not uploaded"}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
              <FlaskConical size={20} />
              <p>This is a sandbox submission. No data will be saved or signed.</p>
            </div>
          </div>
        )}

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
              onClick={() => setSubmitted(true)}
              className="flex items-center gap-2 px-6 py-2 bg-bocra-green text-white rounded-lg text-sm font-medium hover:bg-bocra-green/80 transition-colors"
            >
              <Send size={16} /> Submit (Sandbox)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
