"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ArrowRight,
  Layers,
  ClipboardCheck,
  Fingerprint,
  Lock,
  Eye,
} from "lucide-react";

const lifecycleSteps = [
  {
    number: "01",
    title: "Provisioning",
    description:
      "BOCRA Admin selects a template from the Classification Matrix and assigns it to your organization with a deadline.",
    icon: <Layers className="w-5 h-5" />,
    color: "bg-bocra-blue",
  },
  {
    number: "02",
    title: "Guided Data Entry",
    description:
      "The Instance Runner presents a schema-driven wizard. Every field, file requirement, and validation rule is defined upfront — no guesswork.",
    icon: <ClipboardCheck className="w-5 h-5" />,
    color: "bg-bocra-green",
  },
  {
    number: "03",
    title: "Integrity Verification",
    description:
      "Files are SHA-256 hashed on upload. The system verifies nothing was altered in transit. Data is validated against the schema in real-time.",
    icon: <Fingerprint className="w-5 h-5" />,
    color: "bg-bocra-amber",
  },
  {
    number: "04",
    title: "Sign & Submit",
    description:
      "A JWT-signed digital receipt is generated, cryptographically binding the submission to your identity. Data moves to the immutable Compliance Vault.",
    icon: <Lock className="w-5 h-5" />,
    color: "bg-bocra-orange",
  },
  {
    number: "05",
    title: "Review & Analysis",
    description:
      "BOCRA reviews submissions with full raw data, file access, and automated analytics. Approve, flag, or request corrections.",
    icon: <Eye className="w-5 h-5" />,
    color: "bg-bocra-blue",
  },
];

const matrixSample = [
  { code: "A1", label: "Financial — Major Telecom", example: "Mobile money audit for Mascom" },
  { code: "B3", label: "Technical — ISP", example: "Spectrum usage report for a mid-size ISP" },
  { code: "D5", label: "Infrastructure — Small Operator", example: "Tower site compliance for a rural provider" },
  { code: "F6", label: "Consumer — Courier", example: "Complaint handling summary for a local courier" },
];

function Collapsible({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-border rounded-2xl overflow-hidden bg-white transition-all">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-6 text-left hover:bg-bocra-light/50 transition-colors"
      >
        <div>
          <h3 className="text-lg font-bold text-bocra-navy">{title}</h3>
          <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
        </div>
        <div
          className={`w-10 h-10 rounded-full bg-bocra-blue/10 flex items-center justify-center shrink-0 transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        >
          <ChevronDown className="w-5 h-5 text-bocra-blue" />
        </div>
      </button>
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="px-6 pb-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function InstanceDeepDive() {
  return (
    <div className="space-y-4 mt-10">
      {/* Lifecycle collapsible */}
      <Collapsible
        title="The Instance Lifecycle"
        subtitle="5 steps from provisioning to review — click to explore"
      >
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {lifecycleSteps.map((step, i) => (
            <div key={step.number} className="relative">
              <div className="bg-bocra-light border border-border rounded-xl p-5 h-full">
                <div
                  className={`w-10 h-10 rounded-lg ${step.color} text-white flex items-center justify-center mb-3`}
                >
                  {step.icon}
                </div>
                <div className="text-xs font-mono text-muted-foreground mb-1">
                  Step {step.number}
                </div>
                <h4 className="font-semibold text-bocra-navy text-sm mb-2">
                  {step.title}
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
              {i < lifecycleSteps.length - 1 && (
                <div className="hidden md:flex absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                  <ArrowRight className="w-4 h-4 text-gray-300" />
                </div>
              )}
            </div>
          ))}
        </div>
      </Collapsible>

      {/* Classification Matrix collapsible */}
      <Collapsible
        title="Classification Matrix"
        subtitle="6 data types × 6 operator scales = 36 tailored compliance contexts"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          {matrixSample.map((m) => (
            <div key={m.code} className="bg-bocra-light rounded-lg p-4 border border-border">
              <span className="inline-block font-mono font-bold text-bocra-blue text-lg">
                {m.code}
              </span>
              <p className="text-sm font-medium text-bocra-navy mt-1">{m.label}</p>
              <p className="text-xs text-muted-foreground mt-1">{m.example}</p>
            </div>
          ))}
        </div>
        <Link
          href="/login"
          className="text-sm text-bocra-blue hover:underline font-medium inline-flex items-center gap-1"
        >
          View full matrix <ArrowRight className="w-3 h-3" />
        </Link>
      </Collapsible>
    </div>
  );
}
