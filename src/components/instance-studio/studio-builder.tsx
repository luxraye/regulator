"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Save,
  Send,
  Code2,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Play,
  Plus,
  Trash2,
  Calendar,
  Shield,
  FileText,
  Users,
  Award,
  Lock,
  MessageSquare,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { InfoTip } from "@/components/ui/info-tip";
import { validateInstanceDefinition } from "@/lib/instance-engine/validator";
import { computeRulesHash } from "@/lib/instance-engine/canonical";
import { BLUEPRINT_CATALOG } from "@/lib/instance-engine/blueprints";
import { FLAGSHIP_CEDA_HACKATHON_2026 } from "@/lib/instance-engine/flagship";
import type { InstanceDefinition, StageDefinition, RubricCriterion, RuleExpression, FaqItem } from "@/lib/instance-engine/types";

interface StudioBuilderProps {
  initialDefinition?: InstanceDefinition;
  instanceId?: string;
  isExisting?: boolean;
  status?: string;
  currentRulesHash?: string | null;
  version?: number;
}

const BASIC_SECTIONS = [
  { id: "meta", label: "1. Basics & Prizes", icon: FileText, tip: "Challenge name, description, sector, and prize structure." },
  { id: "timeline", label: "2. Dates & Stages", icon: Calendar, tip: "When entry opens, closes, and when judging takes place." },
  { id: "eligibility", label: "3. Who Can Enter", icon: Shield, tip: "Citizen requirements, youth shareholding, and team size." },
  { id: "rubric", label: "4. How It's Judged", icon: Award, tip: "Scoring criteria summing to 100%, and review rules." },
];

const ADVANCED_SECTIONS = [
  { id: "meta", label: "1. Metadata", icon: FileText },
  { id: "timeline", label: "2. Timeline & Stages", icon: Calendar },
  { id: "eligibility", label: "3. Eligibility Rules", icon: Shield },
  { id: "team", label: "4. Team Policy", icon: Users },
  { id: "forms", label: "5. Form Builder", icon: FileText },
  { id: "guards", label: "6. Security Guards", icon: Lock },
  { id: "faithfulness", label: "7. Faithfulness & Hashing", icon: CheckCircle2 },
  { id: "rubric", label: "8. Scoring Rubric", icon: Award },
  { id: "workflow", label: "9. Workflow & Gates", icon: Sliders },
  { id: "privacy", label: "10. Privacy (DPA 2024)", icon: Lock },
  { id: "channels", label: "11. Support & Chat", icon: MessageSquare },
];

export function StudioBuilder({
  initialDefinition,
  instanceId,
  isExisting = false,
  status = "DRAFT",
  currentRulesHash: _currentRulesHash,
  version = 1,
}: StudioBuilderProps) {
  const router = useRouter();
  const [definition, setDefinition] = useState<InstanceDefinition>(
    initialDefinition ? JSON.parse(JSON.stringify(initialDefinition)) : JSON.parse(JSON.stringify(FLAGSHIP_CEDA_HACKATHON_2026))
  );

  const [activeSection, setActiveSection] = useState<string>("meta");
  const [studioMode, setStudioMode] = useState<"basic" | "advanced">("basic");
  const [viewMode, setViewMode] = useState<"visual" | "json">("visual");
  const [jsonText, setJsonText] = useState<string>(() => JSON.stringify(definition, null, 2));
  const [jsonError, setJsonError] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Modals
  const [showBlueprints, setShowBlueprints] = useState(false);
  const [showSimulate, setShowSimulate] = useState(false);
  const [showPublish, setShowPublish] = useState(false);
  const [showUpdateReason, setShowUpdateReason] = useState(false);
  const [auditReason, setAuditReason] = useState("");

  // Simulation state
  const [simulating, setSimulating] = useState(false);
  const [simulationResults, setSimulationResults] = useState<any[] | null>(null);

  // Synchronize JSON view with visual edits
  useEffect(() => {
    if (viewMode === "visual") {
      setJsonText(JSON.stringify(definition, null, 2));
      setJsonError(null);
    }
  }, [definition, viewMode]);

  // Handle JSON Text edits
  const handleJsonChange = (val: string) => {
    setJsonText(val);
    try {
      const parsed = JSON.parse(val);
      setDefinition(parsed);
      setJsonError(null);
    } catch (err: any) {
      setJsonError(err.message || "Invalid JSON syntax");
    }
  };

  // Live validation
  const validation = useMemo(() => {
    return validateInstanceDefinition(definition);
  }, [definition]);

  // Rubric Running Total
  const totalRubricWeight = useMemo(() => {
    return (definition.rubric?.criteria ?? []).reduce((sum, c) => sum + (Number(c.weight) || 0), 0);
  }, [definition.rubric?.criteria]);

  // Computed Rules Hash
  const liveRulesHash = useMemo(() => {
    try {
      return computeRulesHash(definition);
    } catch {
      return null;
    }
  }, [definition]);

  // Apply Blueprint
  const applyBlueprint = (bpDef: InstanceDefinition) => {
    const clone = JSON.parse(JSON.stringify(bpDef));
    if (isExisting && definition.meta?.slug) {
      clone.meta.slug = definition.meta.slug;
    }
    setDefinition(clone);
    setJsonText(JSON.stringify(clone, null, 2));
    setShowBlueprints(false);
    setSaveSuccess("Blueprint loaded into studio");
    setTimeout(() => setSaveSuccess(null), 3000);
  };

  // Run Simulation Dry Run
  const runSimulation = async () => {
    setSimulating(true);
    try {
      const res = await fetch("/api/instances-engine/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ definition }),
      });
      if (res.ok) {
        const data = await res.json();
        setSimulationResults(data.candidateResults || []);
      }
    } catch (err) {
      console.error("Simulation error:", err);
    } finally {
      setSimulating(false);
    }
  };

  // Save Draft
  const handleSave = async () => {
    setSaving(true);
    setErrorMsg(null);
    try {
      if (isExisting && instanceId) {
        if (status !== "DRAFT") {
          setShowUpdateReason(true);
          setSaving(false);
          return;
        }

        const res = await fetch(`/api/instances-engine/${instanceId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ definition }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to update instance draft");
        }
        setSaveSuccess("Draft saved successfully.");
        setTimeout(() => setSaveSuccess(null), 3000);
      } else {
        // Create new draft
        const res = await fetch("/api/instances-engine", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ customDefinition: definition }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to create instance");
        }

        const data = await res.json();
        setSaveSuccess("Instance created successfully.");
        setTimeout(() => {
          router.push(`/dashboard/instances/${data.instance.id}/edit`);
        }, 1000);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  // Save Live Update with Audit Reason
  const handleLiveUpdateWithReason = async () => {
    if (!auditReason.trim()) {
      setErrorMsg("An audit reason is required when modifying a published instance.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/instances-engine/${instanceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ definition, reason: auditReason }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update live instance");
      }

      setShowUpdateReason(false);
      setAuditReason("");
      setSaveSuccess("Version bumped and instance updated successfully.");
      setTimeout(() => setSaveSuccess(null), 3000);
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  // Publish / Seal Instance
  const handlePublish = async () => {
    if (!validation.valid) {
      setErrorMsg("Cannot publish an instance with validation errors.");
      return;
    }

    setSaving(true);
    try {
      let targetId = instanceId;
      if (!isExisting || !instanceId) {
        // Save first
        const saveRes = await fetch("/api/instances-engine", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ customDefinition: definition }),
        });
        if (!saveRes.ok) {
          const sData = await saveRes.json();
          throw new Error(sData.error || "Failed to save instance before publish");
        }
        const sData = await saveRes.json();
        targetId = sData.instance.id;
      }

      const pubRes = await fetch(`/api/instances-engine/${targetId}/publish`, {
        method: "POST",
      });

      if (!pubRes.ok) {
        const pData = await pubRes.json();
        throw new Error(pData.error || "Publish failed");
      }

      setShowPublish(false);
      setSaveSuccess("Instance published & sealed with rules fingerprint!");
      setTimeout(() => {
        router.push(`/dashboard/instances/${targetId}`);
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || "Publish failed");
    } finally {
      setSaving(false);
    }
  };

  // Section mutators
  const updateMeta = (patch: Partial<InstanceDefinition["meta"]>) => {
    setDefinition((prev) => ({ ...prev, meta: { ...prev.meta, ...patch } }));
  };

  const updateTeam = (patch: Partial<InstanceDefinition["team"]>) => {
    setDefinition((prev) => ({ ...prev, team: { ...prev.team, ...patch } }));
  };

  const updateRubric = (patch: Partial<InstanceDefinition["rubric"]>) => {
    setDefinition((prev) => ({ ...prev, rubric: { ...prev.rubric, ...patch } }));
  };

  const updateGuards = (patch: Partial<InstanceDefinition["guards"]>) => {
    setDefinition((prev) => ({ ...prev, guards: { ...prev.guards, ...patch } }));
  };

  const updateFaithfulness = (patch: Partial<InstanceDefinition["faithfulness"]>) => {
    setDefinition((prev) => ({ ...prev, faithfulness: { ...prev.faithfulness, ...patch } }));
  };

  const updateWorkflow = (patch: Partial<InstanceDefinition["workflow"]>) => {
    setDefinition((prev) => ({ ...prev, workflow: { ...prev.workflow, ...patch } }));
  };

  const updatePrivacy = (patch: Partial<InstanceDefinition["privacy"]>) => {
    setDefinition((prev) => ({ ...prev, privacy: { ...prev.privacy, ...patch } }));
  };

  const updateChannels = (patch: Partial<InstanceDefinition["channels"]>) => {
    setDefinition((prev) => ({ ...prev, channels: { ...prev.channels, ...patch } }));
  };

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/instances"
              className="text-xs font-medium text-ceda-slate hover:text-ceda-ink transition"
            >
              ← Back to Instances
            </Link>
            <span className="text-xs text-border">•</span>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider",
                status === "LIVE" && "bg-emerald-100 text-emerald-800",
                status === "PUBLISHED" && "bg-blue-100 text-blue-800",
                status === "DRAFT" && "bg-amber-100 text-amber-800",
                status === "CLOSED" && "bg-slate-100 text-slate-800"
              )}
            >
              {status} {isExisting ? `v${version}` : "NEW"}
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-ceda-ink sm:text-3xl">
            {isExisting ? `Instance Studio: ${definition.meta?.name || "Edit Instance"}` : "Instance Studio: New Competition"}
          </h1>
          <p className="text-xs text-ceda-slate">
            {studioMode === "basic"
              ? "Simple 4-step setup for challenge administrators. Switch to Advanced mode anytime for JSON code and security guards."
              : "Advanced 11-section engine with JSON synchronization, custom forms, security guards, and automated stage gates."}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Mode Switcher: Simple vs Advanced */}
          <div className="flex rounded-lg border border-border bg-slate-100 p-0.5">
            <button
              type="button"
              onClick={() => {
                setStudioMode("basic");
                if (!["meta", "timeline", "eligibility", "rubric"].includes(activeSection)) {
                  setActiveSection("meta");
                }
              }}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition",
                studioMode === "basic"
                  ? "bg-ceda-orange text-white shadow-sm"
                  : "text-ceda-slate hover:text-ceda-ink"
              )}
            >
              <Sparkles size={13} />
              Simple (4 Steps)
            </button>
            <button
              type="button"
              onClick={() => setStudioMode("advanced")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition",
                studioMode === "advanced"
                  ? "bg-ceda-ink text-white shadow-sm"
                  : "text-ceda-slate hover:text-ceda-ink"
              )}
            >
              <Sliders size={13} />
              Advanced (11 Steps)
            </button>
          </div>

          {/* Blueprint selector */}
          <button
            type="button"
            onClick={() => setShowBlueprints(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-2 text-xs font-semibold text-ceda-ink hover:bg-slate-50 transition"
          >
            <Sparkles size={14} className="text-ceda-orange" />
            Blueprints
          </button>

          {/* Simulate Button */}
          <button
            type="button"
            onClick={() => {
              setShowSimulate(true);
              runSimulation();
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-ceda-copper bg-ceda-sand px-3 py-2 text-xs font-semibold text-ceda-copper hover:bg-ceda-sand/70 transition"
          >
            <Play size={14} />
            Simulate (Dry Run)
          </button>

          {/* View mode toggle: Only shown or unlocked in Advanced mode */}
          {studioMode === "advanced" ? (
            <div className="flex rounded-lg border border-border bg-slate-100 p-0.5">
              <button
                type="button"
                onClick={() => setViewMode("visual")}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition",
                  viewMode === "visual" ? "bg-white text-ceda-ink shadow-sm" : "text-ceda-slate hover:text-ceda-ink"
                )}
              >
                <Sliders size={13} />
                Visual
              </button>
              <button
                type="button"
                onClick={() => setViewMode("json")}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition",
                  viewMode === "json" ? "bg-white text-ceda-ink shadow-sm" : "text-ceda-slate hover:text-ceda-ink"
                )}
              >
                <Code2 size={13} />
                JSON Code
              </button>
            </div>
          ) : null}

          {/* Save Button */}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-3.5 py-2 text-xs font-semibold text-ceda-ink hover:bg-slate-50 disabled:opacity-50 transition"
          >
            {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
            {status === "DRAFT" ? "Save Draft" : "Save Changes"}
          </button>

          {/* Publish Button */}
          <button
            type="button"
            onClick={() => setShowPublish(true)}
            disabled={saving || !validation.valid}
            className="inline-flex items-center gap-1.5 rounded-lg bg-ceda-orange px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-ceda-copper disabled:opacity-50 transition"
          >
            <Send size={14} />
            Publish & Seal
          </button>
        </div>
      </div>

      {/* Notifications / Alerts */}
      {saveSuccess && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-xs font-medium text-emerald-800 border border-emerald-200">
          <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
          <span>{saveSuccess}</span>
        </div>
      )}
      {errorMsg && (
        <div className="flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-xs font-medium text-rose-800 border border-rose-200">
          <XCircle size={16} className="text-rose-600 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Status & Fingerprint Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-white p-3 shadow-sm text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-ceda-ink">Status:</span>
            <span className="font-bold text-ceda-orange">{status}</span>
          </div>
          <div className="text-border">|</div>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-ceda-ink">Rubric Total:</span>
            <span
              className={cn(
                "rounded px-1.5 py-0.5 font-bold",
                Math.abs(totalRubricWeight - 100) < 0.001
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-rose-100 text-rose-800"
              )}
            >
              {totalRubricWeight}% {Math.abs(totalRubricWeight - 100) < 0.001 ? "✔" : "≠ 100%"}
            </span>
          </div>
          <div className="text-border">|</div>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-ceda-ink">Validation:</span>
            {validation.valid ? (
              <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                <CheckCircle2 size={13} /> 0 Errors
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-rose-700 font-medium">
                <AlertTriangle size={13} /> {validation.errors.length} Error(s)
              </span>
            )}
          </div>
        </div>

        {liveRulesHash && (
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
            <Shield size={13} className="text-emerald-600" />
            <span className="font-medium text-ceda-slate">Rules Fingerprint:</span>
            <code className="font-mono text-ceda-ink">{liveRulesHash.slice(0, 10)}...{liveRulesHash.slice(-6)}</code>
          </div>
        )}
      </div>

      {/* Main Studio Work Area */}
      {viewMode === "json" ? (
        /* JSON Code View */
        <div className="space-y-3 rounded-xl border border-border bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code2 size={16} className="text-ceda-orange" />
              <h2 className="text-sm font-bold text-ceda-ink">JSON Definition Editor</h2>
              <span className="text-xs text-ceda-slate">(Bi-directional live sync)</span>
            </div>
            {jsonError ? (
              <span className="text-xs font-semibold text-rose-600 flex items-center gap-1">
                <XCircle size={13} /> {jsonError}
              </span>
            ) : (
              <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                <CheckCircle2 size={13} /> Valid JSON Syntax
              </span>
            )}
          </div>
          <textarea
            value={jsonText}
            onChange={(e) => handleJsonChange(e.target.value)}
            rows={28}
            className="w-full rounded-lg border border-border bg-slate-900 p-4 font-mono text-xs text-emerald-400 focus:border-ceda-orange focus:outline-none focus:ring-1 focus:ring-ceda-orange"
            spellCheck={false}
          />
        </div>
      ) : (
        /* Visual Multi-Section Builder */
        <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
          {/* Section Navigation Tabs */}
          <div className="md:col-span-3 space-y-3">
            <div className="rounded-xl border border-border bg-white p-2 shadow-sm space-y-1">
              <div className="flex items-center justify-between px-3 py-2 text-xs font-bold uppercase tracking-wider text-ceda-slate">
                <span>{studioMode === "basic" ? "4 Core Steps" : "11 Sections"}</span>
                <span className="text-[10px] text-ceda-copper font-mono">
                  {studioMode === "basic" ? "Simple Mode" : "Engine Mode"}
                </span>
              </div>
              {(studioMode === "basic" ? BASIC_SECTIONS : ADVANCED_SECTIONS).map((sec) => {
                const Icon = sec.icon;
                const hasErrors = validation.errors.some((e) => e.section === sec.id);

                return (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => setActiveSection(sec.id)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-xs font-medium transition text-left",
                      activeSection === sec.id
                        ? "bg-ceda-orange text-white"
                        : "text-ceda-ink hover:bg-slate-100"
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon size={14} className={activeSection === sec.id ? "text-white" : "text-ceda-orange"} />
                      <span className="truncate">{sec.label}</span>
                    </div>
                    {hasErrors && (
                      <span
                        className={cn(
                          "rounded-full px-1.5 py-0.2 text-[10px] font-bold flex-shrink-0",
                          activeSection === sec.id ? "bg-white text-rose-700" : "bg-rose-100 text-rose-700"
                        )}
                        title="This section contains validation errors"
                      >
                        !
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* In Basic Mode: Quick Switcher Promo to Advanced */}
            {studioMode === "basic" && (
              <div className="rounded-xl border border-dashed border-ceda-copper/30 bg-ceda-sand/40 p-3.5 text-xs space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-ceda-ink">
                  <Sliders size={13} className="text-ceda-orange" />
                  <span>Looking for custom forms?</span>
                </div>
                <p className="text-[11px] text-ceda-slate leading-relaxed">
                  Switch to Advanced Engine to configure custom questionnaires, binary file filters, automated progression gates, and raw JSON.
                </p>
                <button
                  type="button"
                  onClick={() => setStudioMode("advanced")}
                  className="w-full rounded-lg bg-white border border-border px-2.5 py-1.5 text-[11px] font-bold text-ceda-copper hover:bg-slate-50 transition shadow-sm text-center"
                >
                  Unlock Advanced Engine (11 Steps) →
                </button>
              </div>
            )}

            {/* Validation Errors Box */}
            {validation.errors.length > 0 && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-900 shadow-sm space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-rose-800">
                  <AlertTriangle size={14} /> Validation Diagnostics ({validation.errors.length})
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                  {validation.errors.map((err, i) => (
                    <div
                      key={i}
                      onClick={() => setActiveSection(err.section)}
                      className="cursor-pointer rounded bg-white/80 p-1.5 text-[11px] hover:bg-white transition"
                    >
                      <span className="font-semibold text-rose-700">[{err.section}]</span> {err.message}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Active Section Form Area */}
          <div className="md:col-span-9 rounded-xl border border-border bg-white p-6 shadow-sm space-y-6">
            {/* Section 1: Metadata */}
            {activeSection === "meta" && (
              <div className="space-y-4">
                <div className="border-b border-border pb-3">
                  <h2 className="text-lg font-bold text-ceda-ink">
                    {studioMode === "basic" ? "Step 1: Basics & Prizes" : "Section 1: Competition Metadata"}
                  </h2>
                  <p className="text-xs text-ceda-slate">
                    {studioMode === "basic"
                      ? "Give your competition a name, category, partner identity, and prize pool."
                      : "General titles, partner identity, categories, and prize tiers."}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <label className="text-xs font-semibold text-ceda-ink">Competition Title *</label>
                      <InfoTip
                        plain="The public name innovators and evaluators will see across the portal."
                        technical="definition.meta.name. Canonicalized into rules hash."
                      />
                    </div>
                    <input
                      type="text"
                      value={definition.meta.name}
                      onChange={(e) => updateMeta({ name: e.target.value })}
                      className="w-full rounded-lg border border-border p-2 text-sm text-ceda-ink focus:border-ceda-orange focus:outline-none"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <label className="text-xs font-semibold text-ceda-ink">Unique Web Address Slug *</label>
                      <InfoTip
                        plain="The clean URL path for the competition (e.g. /instances/bdih-leap-2026)."
                        technical="definition.meta.slug. Must be URL-safe lowercase with dashes."
                      />
                    </div>
                    <input
                      type="text"
                      value={definition.meta.slug}
                      onChange={(e) => updateMeta({ slug: e.target.value })}
                      className="w-full rounded-lg border border-border p-2 text-sm font-mono text-ceda-ink focus:border-ceda-orange focus:outline-none"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <label className="text-xs font-semibold text-ceda-ink">Host Partner</label>
                      <InfoTip
                        plain="The official institution hosting or sponsoring the challenge."
                        technical="definition.meta.partnerSlug. Mapped to database Partner record."
                      />
                    </div>
                    <input
                      type="text"
                      value={definition.meta.partnerSlug}
                      onChange={(e) => updateMeta({ partnerSlug: e.target.value })}
                      className="w-full rounded-lg border border-border p-2 text-sm text-ceda-ink focus:border-ceda-orange focus:outline-none"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <label className="text-xs font-semibold text-ceda-ink">Category / Sector</label>
                      <InfoTip
                        plain="Priority national development sector (e.g. Agribusiness, HealthTech, AI)."
                        technical="definition.meta.category. Used for portal filter chips and badges."
                      />
                    </div>
                    <input
                      type="text"
                      value={definition.meta.category || ""}
                      onChange={(e) => updateMeta({ category: e.target.value })}
                      className="w-full rounded-lg border border-border p-2 text-sm text-ceda-ink focus:border-ceda-orange focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <label className="text-xs font-semibold text-ceda-ink">Challenge Description *</label>
                    <InfoTip
                      plain="Plain description of what innovators will build and why it matters."
                      technical="definition.meta.description. Rendered in hero header and meta tags."
                    />
                  </div>
                  <textarea
                    rows={3}
                    value={definition.meta.description}
                    onChange={(e) => updateMeta({ description: e.target.value })}
                    className="w-full rounded-lg border border-border p-2 text-sm text-ceda-ink focus:border-ceda-orange focus:outline-none"
                  />
                </div>

                {/* Prize Tiers */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-ceda-ink">Prize Structure</h3>
                      <InfoTip
                        plain="Direct grants or cash prizes in Botswana Pula awarded to top placed teams."
                        technical="definition.meta.prizes[]. Summed for total prize pool badges."
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newRank = definition.meta.prizes.length + 1;
                        updateMeta({
                          prizes: [
                            ...definition.meta.prizes,
                            { rank: newRank, title: `${newRank}th Prize`, amountPula: 5000, rewardText: "" },
                          ],
                        });
                      }}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-ceda-orange hover:text-ceda-copper"
                    >
                      <Plus size={13} /> Add Prize Tier
                    </button>
                  </div>

                  <div className="space-y-2">
                    {definition.meta.prizes.map((pz, idx) => (
                      <div key={idx} className="flex items-center gap-2 rounded-lg bg-slate-50 p-2.5 border border-slate-200">
                        <span className="w-8 text-center font-bold text-ceda-slate text-xs">#{pz.rank}</span>
                        <input
                          type="text"
                          placeholder="Tier Title"
                          value={pz.title}
                          onChange={(e) => {
                            const prizes = [...definition.meta.prizes];
                            prizes[idx].title = e.target.value;
                            updateMeta({ prizes });
                          }}
                          className="w-1/3 rounded border border-border p-1.5 text-xs text-ceda-ink"
                        />
                        <input
                          type="number"
                          placeholder="Amount (BWP)"
                          value={pz.amountPula ?? ""}
                          onChange={(e) => {
                            const prizes = [...definition.meta.prizes];
                            prizes[idx].amountPula = Number(e.target.value);
                            updateMeta({ prizes });
                          }}
                          className="w-28 rounded border border-border p-1.5 text-xs text-ceda-ink"
                        />
                        <input
                          type="text"
                          placeholder="Reward Perk Description"
                          value={pz.rewardText || ""}
                          onChange={(e) => {
                            const prizes = [...definition.meta.prizes];
                            prizes[idx].rewardText = e.target.value;
                            updateMeta({ prizes });
                          }}
                          className="flex-1 rounded border border-border p-1.5 text-xs text-ceda-ink"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const prizes = definition.meta.prizes.filter((_, i) => i !== idx);
                            updateMeta({ prizes });
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 transition"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Section 2: Timeline & Stages */}
            {activeSection === "timeline" && (
              <div className="space-y-4">
                <div className="border-b border-border pb-3 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-ceda-ink">
                        {studioMode === "basic" ? "Step 2: Dates & Stages" : "Section 2: Stage Timeline"}
                      </h2>
                      <InfoTip
                        plain="Controls the competition progression lifecycle. When a stage ends, the next opens automatically."
                        technical="definition.timeline[]. Compiled into time-deterministic state machine."
                      />
                    </div>
                    <p className="text-xs text-ceda-slate">
                      {studioMode === "basic"
                        ? "Schedule the start and end dates for applications, review rounds, and announcements."
                        : "Define sequentially ordered competition stages and progression gates."}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newId = `stage-${Date.now().toString(36)}`;
                      const newStage: StageDefinition = {
                        id: newId,
                        name: "New Milestone Stage",
                        kind: "scoring_round",
                        start: new Date().toISOString(),
                        end: new Date(Date.now() + 7 * 86400000).toISOString(),
                        roles: ["EVALUATOR"],
                        gate: "none",
                      };
                      setDefinition((prev) => ({ ...prev, timeline: [...prev.timeline, newStage] }));
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-ceda-orange px-3 py-1.5 text-xs font-semibold text-white hover:bg-ceda-copper transition"
                  >
                    <Plus size={13} /> Add Stage
                  </button>
                </div>

                <div className="space-y-3">
                  {definition.timeline.map((stg, i) => (
                    <div key={stg.id || i} className="rounded-xl border border-border bg-slate-50 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-ceda-ink px-2 py-0.5 text-[10px] font-bold text-white">
                            Stage {i + 1}
                          </span>
                          <input
                            type="text"
                            value={stg.name}
                            onChange={(e) => {
                              const timeline = [...definition.timeline];
                              timeline[i].name = e.target.value;
                              setDefinition((prev) => ({ ...prev, timeline }));
                            }}
                            className="font-bold text-sm text-ceda-ink bg-transparent border-b border-dashed border-slate-300 focus:border-ceda-orange focus:outline-none"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <select
                            value={stg.kind}
                            onChange={(e) => {
                              const timeline = [...definition.timeline];
                              timeline[i].kind = e.target.value as any;
                              setDefinition((prev) => ({ ...prev, timeline }));
                            }}
                            className="rounded border border-border bg-white px-2 py-1 text-xs text-ceda-ink"
                          >
                            <option value="registration">Registration</option>
                            <option value="eligibility_check">Eligibility Check</option>
                            <option value="briefing">Briefing</option>
                            <option value="build_window">Build Window</option>
                            <option value="submission">Submission</option>
                            <option value="screening">Screening</option>
                            <option value="scoring_round">Scoring Round</option>
                            <option value="shortlist">Shortlist</option>
                            <option value="live_pitch">Live Pitch</option>
                            <option value="public_vote">Public Vote</option>
                            <option value="award">Award</option>
                          </select>
                          <button
                            type="button"
                            onClick={() => {
                              const timeline = definition.timeline.filter((_, idx) => idx !== i);
                              setDefinition((prev) => ({ ...prev, timeline }));
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 transition"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-xs">
                        <div>
                          <label className="block font-semibold text-ceda-slate mb-1">Start Date / Time (UTC)</label>
                          <input
                            type="text"
                            value={stg.start}
                            onChange={(e) => {
                              const timeline = [...definition.timeline];
                              timeline[i].start = e.target.value;
                              setDefinition((prev) => ({ ...prev, timeline }));
                            }}
                            className="w-full rounded border border-border p-1.5 font-mono text-ceda-ink bg-white"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-ceda-slate mb-1">End Date / Time (UTC)</label>
                          <input
                            type="text"
                            value={stg.end}
                            onChange={(e) => {
                              const timeline = [...definition.timeline];
                              timeline[i].end = e.target.value;
                              setDefinition((prev) => ({ ...prev, timeline }));
                            }}
                            className="w-full rounded border border-border p-1.5 font-mono text-ceda-ink bg-white"
                          />
                        </div>
                      </div>

                      <div className="text-xs">
                        <label className="block font-semibold text-ceda-slate mb-1">Stage Description & Instructions</label>
                        <input
                          type="text"
                          value={stg.description || ""}
                          onChange={(e) => {
                            const timeline = [...definition.timeline];
                            timeline[i].description = e.target.value;
                            setDefinition((prev) => ({ ...prev, timeline }));
                          }}
                          placeholder="Describe what happens in this stage..."
                          className="w-full rounded border border-border p-1.5 text-ceda-ink bg-white"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section 3: Eligibility Rules */}
            {activeSection === "eligibility" && (
              <div className="space-y-4">
                <div className="border-b border-border pb-3 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-ceda-ink">
                        {studioMode === "basic" ? "Step 3: Who Can Enter & Team Policy" : "Section 3: Eligibility Rules"}
                      </h2>
                      <InfoTip
                        plain="Automated checks that verify citizen standing, youth shareholding, or company registration before entry is permitted."
                        technical="definition.eligibility[]. Evaluated against applicant dossier on pre-flight check."
                      />
                    </div>
                    <p className="text-xs text-ceda-slate">
                      {studioMode === "basic"
                        ? "Define statutory citizen eligibility criteria, youth shareholding thresholds, and team composition."
                        : "Deterministic statutory rules evaluated on dossier ingress."}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newRule: RuleExpression = {
                        field: "customField",
                        op: "eq",
                        value: true,
                        failureMessage: "This requirement was not satisfied.",
                      };
                      setDefinition((prev) => ({ ...prev, eligibility: [...prev.eligibility, newRule] }));
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-ceda-orange px-3 py-1.5 text-xs font-semibold text-white hover:bg-ceda-copper transition"
                  >
                    <Plus size={13} /> Add Rule
                  </button>
                </div>

                <div className="space-y-2.5">
                  {definition.eligibility.map((r: any, idx) => (
                    <div key={idx} className="flex flex-col gap-2 rounded-xl border border-border bg-slate-50 p-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Field (e.g. age, citizenship, youthShareholding)"
                          value={r.field || ""}
                          onChange={(e) => {
                            const eligibility = [...definition.eligibility];
                            (eligibility[idx] as any).field = e.target.value;
                            setDefinition((prev) => ({ ...prev, eligibility }));
                          }}
                          className="w-1/3 rounded border border-border bg-white p-1.5 text-xs font-mono text-ceda-ink"
                        />
                        <select
                          value={r.op || "eq"}
                          onChange={(e) => {
                            const eligibility = [...definition.eligibility];
                            (eligibility[idx] as any).op = e.target.value;
                            setDefinition((prev) => ({ ...prev, eligibility }));
                          }}
                          className="rounded border border-border bg-white p-1.5 text-xs font-mono text-ceda-ink"
                        >
                          <option value="eq">== (eq)</option>
                          <option value="neq">!= (neq)</option>
                          <option value="gte">&gt;= (gte)</option>
                          <option value="gt">&gt; (gt)</option>
                          <option value="lte">&lt;= (lte)</option>
                          <option value="lt">&lt; (lt)</option>
                          <option value="in">in (list)</option>
                        </select>
                        <input
                          type="text"
                          placeholder="Expected Value"
                          value={typeof r.value === "object" ? JSON.stringify(r.value) : String(r.value ?? "")}
                          onChange={(e) => {
                            const eligibility = [...definition.eligibility];
                            let val: any = e.target.value;
                            if (val === "true") val = true;
                            else if (val === "false") val = false;
                            else if (!isNaN(Number(val)) && val.trim() !== "") val = Number(val);
                            (eligibility[idx] as any).value = val;
                            setDefinition((prev) => ({ ...prev, eligibility }));
                          }}
                          className="w-1/4 rounded border border-border bg-white p-1.5 text-xs font-mono text-ceda-ink"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const eligibility = definition.eligibility.filter((_, i) => i !== idx);
                            setDefinition((prev) => ({ ...prev, eligibility }));
                          }}
                          className="ml-auto p-1 text-slate-400 hover:text-rose-600 transition"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                      <input
                        type="text"
                        placeholder="Human-readable failure message shown to applicant..."
                        value={r.failureMessage || ""}
                        onChange={(e) => {
                          const eligibility = [...definition.eligibility];
                          (eligibility[idx] as any).failureMessage = e.target.value;
                          setDefinition((prev) => ({ ...prev, eligibility }));
                        }}
                        className="w-full rounded border border-border bg-white p-1.5 text-xs text-ceda-ink"
                      />
                    </div>
                  ))}
                </div>

                {/* Embedded Team Policy in Basic Mode */}
                {studioMode === "basic" && (
                  <div className="rounded-xl border border-border bg-slate-50 p-4 space-y-4 pt-4 mt-6">
                    <div className="flex items-center justify-between border-b border-border pb-2">
                      <div className="flex items-center gap-2">
                        <Users size={16} className="text-ceda-orange" />
                        <h3 className="text-sm font-bold text-ceda-ink">Team Size & Leadership Policy</h3>
                      </div>
                      <InfoTip
                        plain="Specify how many innovators can collaborate together in a team dossier."
                        technical="definition.team. Enforced at dossier submission time."
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-semibold text-ceda-ink mb-1">Minimum Team Size</label>
                        <input
                          type="number"
                          min={1}
                          max={10}
                          value={definition.team.minSize}
                          onChange={(e) => updateTeam({ minSize: Number(e.target.value) })}
                          className="w-full rounded-lg border border-border p-2 text-sm text-ceda-ink bg-white focus:border-ceda-orange focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-ceda-ink mb-1">Maximum Team Size</label>
                        <input
                          type="number"
                          min={1}
                          max={20}
                          value={definition.team.maxSize}
                          onChange={(e) => updateTeam({ maxSize: Number(e.target.value) })}
                          className="w-full rounded-lg border border-border p-2 text-sm text-ceda-ink bg-white focus:border-ceda-orange focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-2 pt-1">
                      <label className="flex items-center gap-2 text-xs font-medium text-ceda-ink">
                        <input
                          type="checkbox"
                          checked={definition.team.requireLeadCitizen}
                          onChange={(e) => updateTeam({ requireLeadCitizen: e.target.checked })}
                          className="rounded border-border text-ceda-orange focus:ring-ceda-orange"
                        />
                        Require lead applicant to be a verified Botswana Citizen (Omang verified)
                      </label>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Section 4: Team Policy */}
            {activeSection === "team" && (
              <div className="space-y-4">
                <div className="border-b border-border pb-3">
                  <h2 className="text-lg font-bold text-ceda-ink">Section 4: Team Requirements</h2>
                  <p className="text-xs text-ceda-slate">Team sizing, Omang verification, and citizen lead requirement.</p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-ceda-ink mb-1">Minimum Team Size</label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={definition.team.minSize}
                      onChange={(e) => updateTeam({ minSize: Number(e.target.value) })}
                      className="w-full rounded-lg border border-border p-2 text-sm text-ceda-ink focus:border-ceda-orange focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-ceda-ink mb-1">Maximum Team Size</label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={definition.team.maxSize}
                      onChange={(e) => updateTeam({ maxSize: Number(e.target.value) })}
                      className="w-full rounded-lg border border-border p-2 text-sm text-ceda-ink focus:border-ceda-orange focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <label className="flex items-center gap-2 text-xs font-medium text-ceda-ink">
                    <input
                      type="checkbox"
                      checked={definition.team.requireLeadCitizen}
                      onChange={(e) => updateTeam({ requireLeadCitizen: e.target.checked })}
                      className="rounded border-border text-ceda-orange focus:ring-ceda-orange"
                    />
                    Require lead applicant to be a verified Botswana Citizen
                  </label>

                  <div>
                    <label className="block text-xs font-semibold text-ceda-ink mb-1.5">
                      Required Team Member Fields
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {(["name", "email", "phone", "omang", "roleInTeam", "shareholding"] as const).map((field) => {
                        const isChecked = definition.team.requiredMemberFields?.includes(field) ?? false;
                        return (
                          <label key={field} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-slate-50 px-2.5 py-1 text-xs font-mono text-ceda-ink cursor-pointer hover:bg-slate-100">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                const current = definition.team.requiredMemberFields || [];
                                const next = e.target.checked
                                  ? [...current, field]
                                  : current.filter((f) => f !== field);
                                updateTeam({ requiredMemberFields: next });
                              }}
                              className="rounded border-border text-ceda-orange focus:ring-ceda-orange"
                            />
                            {field}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Section 5: Form Builder */}
            {activeSection === "forms" && (
              <div className="space-y-4">
                <div className="border-b border-border pb-3">
                  <h2 className="text-lg font-bold text-ceda-ink">Section 5: Dynamic Form Builder</h2>
                  <p className="text-xs text-ceda-slate">Per-stage submission questionnaires and required file attachments.</p>
                </div>

                <div className="space-y-4">
                  {definition.forms.map((form, fIdx) => (
                    <div key={form.stageId || fIdx} className="rounded-xl border border-border bg-slate-50 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-bold text-sm text-ceda-ink">{form.title}</h3>
                          <p className="text-xs text-ceda-slate font-mono">Stage: {form.stageId}</p>
                        </div>
                        <span className="rounded bg-ceda-sand px-2 py-0.5 text-[11px] font-semibold text-ceda-copper">
                          {form.fields.length} field(s), {form.fileSlots?.length || 0} file slot(s)
                        </span>
                      </div>

                      <div className="space-y-2">
                        {form.fields.map((fld, idx) => (
                          <div key={fld.key || idx} className="flex items-center gap-2 rounded bg-white p-2 border border-slate-200 text-xs">
                            <span className="font-mono text-[11px] text-ceda-slate w-28 truncate">{fld.key}</span>
                            <span className="font-medium text-ceda-ink flex-1 truncate">{fld.label}</span>
                            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] uppercase font-mono text-slate-600">
                              {fld.type}
                            </span>
                            {fld.required && <span className="text-[10px] font-bold text-rose-600">Required</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section 6: Security Guards */}
            {activeSection === "guards" && (
              <div className="space-y-4">
                <div className="border-b border-border pb-3">
                  <h2 className="text-lg font-bold text-ceda-ink">Section 6: Pre-Flight Security Guards</h2>
                  <p className="text-xs text-ceda-slate">Magic byte inspection, archive explosion controls, and signature scanning.</p>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-xs font-medium text-ceda-ink">
                    <input
                      type="checkbox"
                      checked={definition.guards.magicBytes}
                      onChange={(e) => updateGuards({ magicBytes: e.target.checked })}
                      className="rounded border-border text-ceda-orange focus:ring-ceda-orange"
                    />
                    Enforce Magic Bytes binary MIME inspection (reject spoofed file extensions)
                  </label>
                  <label className="flex items-center gap-2 text-xs font-medium text-ceda-ink">
                    <input
                      type="checkbox"
                      checked={definition.guards.malwareScan}
                      onChange={(e) => updateGuards({ malwareScan: e.target.checked })}
                      className="rounded border-border text-ceda-orange focus:ring-ceda-orange"
                    />
                    Scan for malware / EICAR test signatures on upload
                  </label>
                  <label className="flex items-center gap-2 text-xs font-medium text-ceda-ink">
                    <input
                      type="checkbox"
                      checked={definition.guards.archiveInspection?.enabled ?? true}
                      onChange={(e) =>
                        updateGuards({
                          archiveInspection: {
                            ...definition.guards.archiveInspection,
                            enabled: e.target.checked,
                          },
                        })
                      }
                      className="rounded border-border text-ceda-orange focus:ring-ceda-orange"
                    />
                    Enable archive inspection (zip slip & explosion protection)
                  </label>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2">
                    <div>
                      <label className="block text-xs font-semibold text-ceda-ink mb-1">Max Archive Compression Ratio</label>
                      <input
                        type="number"
                        value={definition.guards.archiveInspection?.maxRatio ?? 50}
                        onChange={(e) =>
                          updateGuards({
                            archiveInspection: {
                              ...definition.guards.archiveInspection,
                              maxRatio: Number(e.target.value),
                            },
                          })
                        }
                        className="w-full rounded border border-border p-2 text-xs text-ceda-ink"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-ceda-ink mb-1">PDF Page Count Cap</label>
                      <input
                        type="number"
                        value={definition.guards.pdfPageCountCap ?? 10}
                        onChange={(e) => updateGuards({ pdfPageCountCap: Number(e.target.value) })}
                        className="w-full rounded border border-border p-2 text-xs text-ceda-ink"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Section 7: Faithfulness */}
            {activeSection === "faithfulness" && (
              <div className="space-y-4">
                <div className="border-b border-border pb-3">
                  <h2 className="text-lg font-bold text-ceda-ink">Section 7: Faithfulness & Audit Hashing</h2>
                  <p className="text-xs text-ceda-slate">Cryptographic integrity, DPA consent, and non-repudiation.</p>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-xs font-medium text-ceda-ink">
                    <input
                      type="checkbox"
                      checked={definition.faithfulness.allQuestionsAnsweredOrNA}
                      onChange={(e) => updateFaithfulness({ allQuestionsAnsweredOrNA: e.target.checked })}
                      className="rounded border-border text-ceda-orange focus:ring-ceda-orange"
                    />
                    Require all questions answered or explicitly marked N/A
                  </label>
                  <label className="flex items-center gap-2 text-xs font-medium text-ceda-ink">
                    <input
                      type="checkbox"
                      checked={definition.faithfulness.noEditsAfterDeadline}
                      onChange={(e) => updateFaithfulness({ noEditsAfterDeadline: e.target.checked })}
                      className="rounded border-border text-ceda-orange focus:ring-ceda-orange"
                    />
                    Strictly prohibit edits after stage deadline
                  </label>
                  <label className="flex items-center gap-2 text-xs font-medium text-ceda-ink">
                    <input
                      type="checkbox"
                      checked={definition.faithfulness.affiliationsDeclared}
                      onChange={(e) => updateFaithfulness({ affiliationsDeclared: e.target.checked })}
                      className="rounded border-border text-ceda-orange focus:ring-ceda-orange"
                    />
                    Require affiliations and conflicts of interest declared
                  </label>
                  <label className="flex items-center gap-2 text-xs font-medium text-ceda-ink">
                    <input
                      type="checkbox"
                      checked={definition.faithfulness.consentsRecorded}
                      onChange={(e) => updateFaithfulness({ consentsRecorded: e.target.checked })}
                      className="rounded border-border text-ceda-orange focus:ring-ceda-orange"
                    />
                    Record Botswana Data Protection Act 2024 consent on ledger
                  </label>
                  <label className="flex items-center gap-2 text-xs font-medium text-ceda-ink">
                    <input
                      type="checkbox"
                      checked={definition.faithfulness.duplicateSubmissionForbidden}
                      onChange={(e) => updateFaithfulness({ duplicateSubmissionForbidden: e.target.checked })}
                      className="rounded border-border text-ceda-orange focus:ring-ceda-orange"
                    />
                    Forbid duplicate submissions across instances
                  </label>
                </div>
              </div>
            )}

            {/* Section 8: Rubric Editor (Running total 100%) */}
            {activeSection === "rubric" && (
              <div className="space-y-4">
                <div className="border-b border-border pb-3 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-ceda-ink">
                        {studioMode === "basic" ? "Step 4: How It's Judged (Scoring Rubric)" : "Section 8: Scoring Rubric"}
                      </h2>
                      <InfoTip
                        plain="Each evaluator scores submissions according to these weighted criteria. The total must equal 100%."
                        technical="definition.rubric.criteria[]. Validated by validateInstanceDefinition before publishing."
                      />
                    </div>
                    <p className="text-xs text-ceda-slate">
                      {studioMode === "basic"
                        ? "Set scoring criteria and percentage weights. Running total must equal exactly 100%."
                        : "Evaluation criteria weights. Total weight must sum to exactly 100%."}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-bold transition",
                        Math.abs(totalRubricWeight - 100) < 0.001
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-rose-100 text-rose-800"
                      )}
                    >
                      Running Total: {totalRubricWeight}% {Math.abs(totalRubricWeight - 100) < 0.001 ? "✔ Exact" : "(Must be 100%)"}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const newCrit: RubricCriterion = {
                          key: `criterion_${Date.now().toString(36)}`,
                          label: "New Scoring Criterion",
                          weight: 10,
                          guide: "Scoring guidance for evaluators...",
                        };
                        updateRubric({ criteria: [...definition.rubric.criteria, newCrit] });
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-ceda-orange px-3 py-1 text-xs font-semibold text-white hover:bg-ceda-copper transition"
                    >
                      <Plus size={13} /> Add Criterion
                    </button>
                  </div>
                </div>

                {/* Criteria items */}
                <div className="space-y-3">
                  {definition.rubric.criteria.map((crit, idx) => (
                    <div key={crit.key || idx} className="rounded-xl border border-border bg-slate-50 p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={crit.label}
                          onChange={(e) => {
                            const criteria = [...definition.rubric.criteria];
                            criteria[idx].label = e.target.value;
                            updateRubric({ criteria });
                          }}
                          className="flex-1 rounded border border-border bg-white p-1.5 text-xs font-bold text-ceda-ink"
                        />
                        <div className="flex items-center gap-1">
                          <label className="text-[11px] font-semibold text-ceda-slate">Weight (%):</label>
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={crit.weight}
                            onChange={(e) => {
                              const criteria = [...definition.rubric.criteria];
                              criteria[idx].weight = Number(e.target.value);
                              updateRubric({ criteria });
                            }}
                            className="w-16 rounded border border-border bg-white p-1.5 text-xs font-bold text-ceda-ink text-center"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const criteria = definition.rubric.criteria.filter((_, i) => i !== idx);
                            updateRubric({ criteria });
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 transition"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                      <input
                        type="text"
                        placeholder="Evaluation guidance notes for judges..."
                        value={crit.guide || ""}
                        onChange={(e) => {
                          const criteria = [...definition.rubric.criteria];
                          criteria[idx].guide = e.target.value;
                          updateRubric({ criteria });
                        }}
                        className="w-full rounded border border-border bg-white p-1.5 text-xs text-ceda-slate"
                      />
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 pt-3 border-t border-border text-xs">
                  <div>
                    <label className="block font-semibold text-ceda-ink mb-1">Reviewers Per Entry</label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={definition.rubric.reviewersPerEntry}
                      onChange={(e) => updateRubric({ reviewersPerEntry: Number(e.target.value) })}
                      className="w-full rounded border border-border p-1.5 text-xs text-ceda-ink"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-ceda-ink mb-1">Variance Threshold (Std Dev)</label>
                    <input
                      type="number"
                      step={0.5}
                      value={definition.rubric.disagreementThreshold}
                      onChange={(e) => updateRubric({ disagreementThreshold: Number(e.target.value) })}
                      className="w-full rounded border border-border p-1.5 text-xs text-ceda-ink"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-4">
                    <input
                      type="checkbox"
                      id="blindEval"
                      checked={definition.rubric.blind}
                      onChange={(e) => updateRubric({ blind: e.target.checked })}
                      className="rounded border-border text-ceda-orange focus:ring-ceda-orange"
                    />
                    <label htmlFor="blindEval" className="font-semibold text-ceda-ink">Blind Evaluation</label>
                  </div>
                </div>
              </div>
            )}

            {/* Section 9: Workflow */}
            {activeSection === "workflow" && (
              <div className="space-y-4">
                <div className="border-b border-border pb-3">
                  <h2 className="text-lg font-bold text-ceda-ink">Section 9: Workflow & Stage Gates</h2>
                  <p className="text-xs text-ceda-slate">Screening mandates, consensus requirements, and shortlist sizes.</p>
                </div>

                <div className="space-y-2.5 text-xs">
                  <label className="flex items-center gap-2 font-medium text-ceda-ink">
                    <input
                      type="checkbox"
                      checked={definition.workflow.screeningRequired}
                      onChange={(e) => updateWorkflow({ screeningRequired: e.target.checked })}
                      className="rounded border-border text-ceda-orange focus:ring-ceda-orange"
                    />
                    Screening stage required prior to scoring round
                  </label>
                  <label className="flex items-center gap-2 font-medium text-ceda-ink">
                    <input
                      type="checkbox"
                      checked={definition.workflow.conflictDeclarationRequired}
                      onChange={(e) => updateWorkflow({ conflictDeclarationRequired: e.target.checked })}
                      className="rounded border-border text-ceda-orange focus:ring-ceda-orange"
                    />
                    Evaluators must sign conflict-of-interest declarations
                  </label>
                  <label className="flex items-center gap-2 font-medium text-ceda-ink">
                    <input
                      type="checkbox"
                      checked={definition.workflow.adjudicationPanelRequired}
                      onChange={(e) => updateWorkflow({ adjudicationPanelRequired: e.target.checked })}
                      className="rounded border-border text-ceda-orange focus:ring-ceda-orange"
                    />
                    Formal adjudication panel required for top shortlist
                  </label>
                  <label className="flex items-center gap-2 font-medium text-ceda-ink">
                    <input
                      type="checkbox"
                      checked={definition.workflow.consensusMeetingRequired}
                      onChange={(e) => updateWorkflow({ consensusMeetingRequired: e.target.checked })}
                      className="rounded border-border text-ceda-orange focus:ring-ceda-orange"
                    />
                    Flagged score discrepancies require consensus meeting
                  </label>
                </div>
              </div>
            )}

            {/* Section 10: Privacy */}
            {activeSection === "privacy" && (
              <div className="space-y-4">
                <div className="border-b border-border pb-3">
                  <h2 className="text-lg font-bold text-ceda-ink">Section 10: Data Protection Act 2024</h2>
                  <p className="text-xs text-ceda-slate">Statutory privacy declarations, data retention, and PII masking.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ceda-ink mb-1">DPA Statutory Consent Notice</label>
                  <textarea
                    rows={4}
                    value={definition.privacy.dpaConsentText}
                    onChange={(e) => updatePrivacy({ dpaConsentText: e.target.value })}
                    className="w-full rounded border border-border p-2 text-xs text-ceda-ink"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
                  <div>
                    <label className="block font-semibold text-ceda-ink mb-1">Retention Window (Months)</label>
                    <input
                      type="number"
                      value={definition.privacy.retentionMonths}
                      onChange={(e) => updatePrivacy({ retentionMonths: Number(e.target.value) })}
                      className="w-full rounded border border-border p-2 text-xs text-ceda-ink"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-ceda-ink mb-1">Regulatory Authority</label>
                    <input
                      type="text"
                      value={definition.privacy.regulatoryAuthority}
                      onChange={(e) => updatePrivacy({ regulatoryAuthority: e.target.value })}
                      className="w-full rounded border border-border p-2 text-xs text-ceda-ink"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Section 11: Channels & Support */}
            {activeSection === "channels" && (
              <div className="space-y-4">
                <div className="border-b border-border pb-3">
                  <h2 className="text-lg font-bold text-ceda-ink">Section 11: Channels, FAQ & Live Chat</h2>
                  <p className="text-xs text-ceda-slate">Public FAQ accordions, direct helpline directory, and live chat advisor settings.</p>
                </div>

                {/* FAQ list */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-ceda-ink">Frequently Asked Questions</h3>
                    <button
                      type="button"
                      onClick={() => {
                        const newFaq: FaqItem = { q: "New Question?", a: "Answer text here..." };
                        updateChannels({ faqs: [...definition.channels.faqs, newFaq] });
                      }}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-ceda-orange hover:text-ceda-copper"
                    >
                      <Plus size={13} /> Add FAQ
                    </button>
                  </div>

                  <div className="space-y-2">
                    {definition.channels.faqs.map((faq, idx) => (
                      <div key={idx} className="rounded-lg border border-border bg-slate-50 p-2.5 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between gap-2">
                          <input
                            type="text"
                            placeholder="Question"
                            value={faq.q}
                            onChange={(e) => {
                              const faqs = [...definition.channels.faqs];
                              faqs[idx].q = e.target.value;
                              updateChannels({ faqs });
                            }}
                            className="flex-1 font-bold rounded border border-border bg-white p-1.5 text-ceda-ink"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const faqs = definition.channels.faqs.filter((_, i) => i !== idx);
                              updateChannels({ faqs });
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 transition"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                        <textarea
                          rows={2}
                          placeholder="Answer"
                          value={faq.a}
                          onChange={(e) => {
                            const faqs = [...definition.channels.faqs];
                            faqs[idx].a = e.target.value;
                            updateChannels({ faqs });
                          }}
                          className="w-full rounded border border-border bg-white p-1.5 text-ceda-slate"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Live Chat Settings */}
                <div className="space-y-2 pt-3 border-t border-border text-xs">
                  <h3 className="font-bold text-ceda-ink">Live Advisor Chat</h3>
                  <label className="flex items-center gap-2 font-medium text-ceda-ink">
                    <input
                      type="checkbox"
                      checked={definition.channels.liveChat.enabled}
                      onChange={(e) =>
                        updateChannels({
                          liveChat: { ...definition.channels.liveChat, enabled: e.target.checked },
                        })
                      }
                      className="rounded border-border text-ceda-orange focus:ring-ceda-orange"
                    />
                    Enable real-time consultant chat widget on challenge pages
                  </label>
                  <input
                    type="text"
                    placeholder="Operating hours (e.g. 09:00 - 16:00 CAT)"
                    value={definition.channels.liveChat.operatingHours}
                    onChange={(e) =>
                      updateChannels({
                        liveChat: { ...definition.channels.liveChat, operatingHours: e.target.value },
                      })
                    }
                    className="w-full sm:w-80 rounded border border-border p-1.5 text-xs text-ceda-ink"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Blueprint Picker Modal */}
      {showBlueprints && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-border bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-ceda-orange" />
                <h3 className="text-lg font-bold text-ceda-ink">Choose a Competition Blueprint</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowBlueprints(false)}
                className="text-slate-400 hover:text-ceda-ink"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-ceda-slate">
              Select a pre-built blueprint to populate all 11 sections with tested rules, timelines, and rubrics.
            </p>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {BLUEPRINT_CATALOG.map((bp) => (
                <div
                  key={bp.id}
                  className="rounded-xl border border-border bg-slate-50 p-4 hover:border-ceda-orange hover:bg-white transition flex flex-col justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-ceda-orange uppercase">{bp.category}</span>
                      <span className="text-xs font-mono text-ceda-slate">{bp.definition.timeline.length} stages</span>
                    </div>
                    <h4 className="text-base font-bold text-ceda-ink mt-0.5">{bp.name}</h4>
                    <p className="text-xs text-ceda-slate mt-1">{bp.description}</p>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-200 pt-2 text-xs">
                    <span className="font-semibold text-ceda-copper">
                      Prizes: P{bp.defaultPrizes.reduce((sum, p) => sum + (p.amountPula || 0), 0).toLocaleString()} Pool
                    </span>
                    <button
                      type="button"
                      onClick={() => applyBlueprint(bp.definition)}
                      className="rounded-lg bg-ceda-orange px-3 py-1.5 font-semibold text-white hover:bg-ceda-copper transition"
                    >
                      Use Blueprint
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Simulate Modal */}
      {showSimulate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-3xl rounded-2xl border border-border bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Play size={18} className="text-ceda-orange" />
                <h3 className="text-lg font-bold text-ceda-ink">Simulate (Dry Run Evaluation)</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSimulate(false)}
                className="text-slate-400 hover:text-ceda-ink"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-ceda-slate">
              Evaluating sample candidate teams against your live ruleset, guard checks, and scoring criteria.
            </p>

            {simulating ? (
              <div className="py-12 text-center text-xs text-ceda-slate">
                <RefreshCw size={24} className="animate-spin text-ceda-orange mx-auto mb-2" />
                Evaluating candidates across rule engine...
              </div>
            ) : simulationResults ? (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {simulationResults.map((cand: any, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "rounded-xl border p-4 text-xs space-y-2",
                      cand.eligible ? "border-emerald-200 bg-emerald-50/50" : "border-rose-200 bg-rose-50/50"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {cand.eligible ? (
                          <CheckCircle2 size={16} className="text-emerald-600" />
                        ) : (
                          <XCircle size={16} className="text-rose-600" />
                        )}
                        <span className="font-bold text-sm text-ceda-ink">{cand.name}</span>
                      </div>
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase",
                          cand.eligible ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                        )}
                      >
                        {cand.verdict} ({cand.scorePercentage}%)
                      </span>
                    </div>

                    <p className="text-ceda-slate">{cand.scenario}</p>
                    <p className="font-medium text-ceda-ink">{cand.summaryExplanation}</p>
                  </div>
                ))}
              </div>
            ) : null}

            <div className="flex justify-end pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setShowSimulate(false)}
                className="rounded-lg bg-ceda-ink px-4 py-2 text-xs font-semibold text-white hover:bg-ceda-copper transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Publish Confirmation Modal */}
      {showPublish && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-border bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-ceda-orange">
              <Shield size={20} />
              <h3 className="text-lg font-bold text-ceda-ink">Publish & Seal Competition</h3>
            </div>

            <p className="text-xs text-ceda-slate">
              Publishing will compute the cryptographic rules fingerprint and seal this instance. Any subsequent changes will require an audit reason and increment the version number.
            </p>

            {liveRulesHash && (
              <div className="rounded-lg bg-slate-50 p-3 border border-slate-200 space-y-1">
                <span className="text-[11px] font-semibold text-ceda-slate uppercase">Deterministic Rules Fingerprint</span>
                <code className="block font-mono text-xs text-ceda-ink break-all">{liveRulesHash}</code>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setShowPublish(false)}
                className="rounded-lg border border-border px-3.5 py-2 text-xs font-semibold text-ceda-ink hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePublish}
                disabled={saving}
                className="rounded-lg bg-ceda-orange px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-ceda-copper disabled:opacity-50 transition"
              >
                {saving ? "Publishing..." : "Confirm & Seal"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Update Reason Modal */}
      {showUpdateReason && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-border bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-amber-600">
              <AlertTriangle size={20} />
              <h3 className="text-lg font-bold text-ceda-ink">Published Instance Modification</h3>
            </div>

            <p className="text-xs text-ceda-slate">
              This competition instance is live. To ensure complete auditability, you must provide a reason for modifying the rules. A new version will be created (v{version + 1}) and the rules fingerprint will be re-sealed.
            </p>

            <div>
              <label className="block text-xs font-semibold text-ceda-ink mb-1">Reason for Modification *</label>
              <textarea
                rows={3}
                placeholder="e.g. Extended submission deadline by 48 hours per CEDA Board resolution..."
                value={auditReason}
                onChange={(e) => setAuditReason(e.target.value)}
                className="w-full rounded border border-border p-2 text-xs text-ceda-ink focus:border-ceda-orange focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setShowUpdateReason(false)}
                className="rounded-lg border border-border px-3.5 py-2 text-xs font-semibold text-ceda-ink hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLiveUpdateWithReason}
                disabled={saving || !auditReason.trim()}
                className="rounded-lg bg-ceda-orange px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-ceda-copper disabled:opacity-50 transition"
              >
                {saving ? "Updating..." : "Bump Version & Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
