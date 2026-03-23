"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, BarChart3, AlertTriangle, CheckCircle2, TrendingUp, TrendingDown } from "lucide-react";

interface Instance {
  id: string;
  template: { name: string; code: string; schema: any };
  licensee: { name: string; organizationName: string };
  submittedAt: string;
  fields: { fieldKey: string; fieldValue: string }[];
  files: { fileName: string; fileExtension: string; fileSize: number; clientHash: string; serverHash: string }[];
}

function computeAnalysis(fields: Instance["fields"], schema: any) {
  const insights: { label: string; value: string; status: "good" | "warn" | "bad" }[] = [];

  const fieldMap: Record<string, string> = {};
  fields.forEach((f) => { fieldMap[f.fieldKey] = f.fieldValue; });

  if (fieldMap.complaints_received && fieldMap.complaints_resolved) {
    const rate = (Number(fieldMap.complaints_resolved) / Number(fieldMap.complaints_received)) * 100;
    insights.push({
      label: "Complaint Resolution Rate",
      value: `${rate.toFixed(1)}%`,
      status: rate >= 80 ? "good" : rate >= 50 ? "warn" : "bad",
    });
  }

  if (fieldMap.coverage_percentage) {
    const cov = Number(fieldMap.coverage_percentage);
    insights.push({
      label: "Coverage",
      value: `${cov}%`,
      status: cov >= 80 ? "good" : cov >= 50 ? "warn" : "bad",
    });
  }

  if (fieldMap.uptime_percentage || fieldMap.network_uptime) {
    const uptime = Number(fieldMap.uptime_percentage || fieldMap.network_uptime);
    insights.push({
      label: "Network Uptime",
      value: `${uptime}%`,
      status: uptime >= 99 ? "good" : uptime >= 95 ? "warn" : "bad",
    });
  }

  if (fieldMap.qos_score) {
    const qos = Number(fieldMap.qos_score);
    insights.push({
      label: "QoS Score",
      value: `${qos}/100`,
      status: qos >= 80 ? "good" : qos >= 60 ? "warn" : "bad",
    });
  }

  if (fieldMap.revenue_total || fieldMap.revenue_bwp) {
    const rev = Number(fieldMap.revenue_total || fieldMap.revenue_bwp);
    insights.push({
      label: "Revenue Reported",
      value: `BWP ${rev.toLocaleString()}`,
      status: "good",
    });
  }

  if (fieldMap.avg_resolution_days) {
    const days = Number(fieldMap.avg_resolution_days);
    insights.push({
      label: "Avg Resolution Time",
      value: `${days} days`,
      status: days <= 14 ? "good" : days <= 30 ? "warn" : "bad",
    });
  }

  return insights;
}

export function ReviewClient({ instances }: { instances: Instance[] }) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"data" | "files" | "analysis">("data");

  const selected = instances.find((i) => i.id === selectedId);
  const analysis = selected ? computeAnalysis(selected.fields, selected.template.schema) : [];

  async function handleReview(action: "APPROVED" | "FLAGGED" | "REJECTED") {
    if (!selectedId) return;
    setLoading(true);

    await fetch(`/api/instances/${selectedId}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: action, reviewNotes: notes }),
    });

    setLoading(false);
    setSelectedId(null);
    setNotes("");
    setTab("data");
    router.refresh();
  }

  if (instances.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-border px-6 py-12 text-center text-muted-foreground">
        No submissions awaiting review.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 bg-white rounded-xl border border-border">
        <div className="px-4 py-3 border-b border-border">
          <p className="text-sm font-medium text-muted-foreground">Submissions ({instances.length})</p>
        </div>
        <div className="divide-y divide-border max-h-[70vh] overflow-y-auto">
          {instances.map((inst) => (
            <button
              key={inst.id}
              onClick={() => { setSelectedId(inst.id); setTab("data"); }}
              className={`w-full text-left px-4 py-3 hover:bg-bocra-light/50 transition-colors ${
                selectedId === inst.id ? "bg-bocra-light" : ""
              }`}
            >
              <p className="font-medium text-sm">{inst.template.name}</p>
              <p className="text-xs text-muted-foreground">
                {inst.licensee.organizationName} &middot; {new Date(inst.submittedAt).toLocaleDateString()}
              </p>
              <div className="flex gap-1 mt-1">
                <span className="text-xs bg-gray-100 rounded px-1.5 py-0.5">{inst.fields.length} fields</span>
                <span className="text-xs bg-gray-100 rounded px-1.5 py-0.5">{inst.files.length} files</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="lg:col-span-2">
        {selected ? (
          <div className="bg-white rounded-xl border border-border p-6 space-y-6">
            <div>
              <h3 className="font-semibold text-bocra-navy">{selected.template.name}</h3>
              <p className="text-sm text-muted-foreground">
                {selected.licensee.organizationName} &middot; {selected.template.code} &middot;
                Submitted {new Date(selected.submittedAt).toLocaleDateString()}
              </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-border">
              {[
                { key: "data", label: "Raw Data", icon: <FileText size={14} /> },
                { key: "files", label: "Files", icon: <FileText size={14} /> },
                { key: "analysis", label: "Analysis", icon: <BarChart3 size={14} /> },
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key as any)}
                  className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    tab === t.key
                      ? "border-bocra-blue text-bocra-blue"
                      : "border-transparent text-muted-foreground hover:text-bocra-navy"
                  }`}
                >
                  {t.icon} {t.label}
                </button>
              ))}
            </div>

            {/* Raw Data Tab */}
            {tab === "data" && (
              <div className="space-y-2">
                {selected.fields.length > 0 ? (
                  selected.fields.map((f) => (
                    <div key={f.fieldKey} className="flex justify-between text-sm py-2 border-b border-border last:border-0">
                      <span className="text-muted-foreground">{f.fieldKey}</span>
                      <span className="font-medium font-mono">{f.fieldValue}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No field data submitted.</p>
                )}
              </div>
            )}

            {/* Files Tab */}
            {tab === "files" && (
              <div className="space-y-3">
                {selected.files.length > 0 ? (
                  selected.files.map((f) => (
                    <div key={f.fileName} className="bg-bocra-light rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-sm">{f.fileName}</p>
                        <span className="text-xs text-muted-foreground">{(f.fileSize / 1024).toFixed(1)} KB</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">Client Hash: </span>
                          <span className="font-mono">{f.clientHash?.slice(0, 24)}...</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Server Hash: </span>
                          <span className="font-mono">{f.serverHash?.slice(0, 24)}...</span>
                        </div>
                      </div>
                      <div className="mt-2">
                        {f.clientHash === f.serverHash ? (
                          <span className="flex items-center gap-1 text-xs text-green-700">
                            <CheckCircle2 size={12} /> Integrity verified
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-red-700">
                            <AlertTriangle size={12} /> Hash mismatch detected
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No files uploaded.</p>
                )}
              </div>
            )}

            {/* Analysis Tab */}
            {tab === "analysis" && (
              <div className="space-y-4">
                {analysis.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {analysis.map((a) => (
                      <div key={a.label} className="bg-bocra-light rounded-lg p-4">
                        <p className="text-xs text-muted-foreground mb-1">{a.label}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold text-bocra-navy">{a.value}</span>
                          {a.status === "good" && <TrendingUp size={16} className="text-bocra-green" />}
                          {a.status === "warn" && <AlertTriangle size={16} className="text-bocra-amber" />}
                          {a.status === "bad" && <TrendingDown size={16} className="text-red-500" />}
                        </div>
                        <span className={`text-xs font-medium ${
                          a.status === "good" ? "text-bocra-green" : a.status === "warn" ? "text-bocra-amber" : "text-red-500"
                        }`}>
                          {a.status === "good" ? "Within threshold" : a.status === "warn" ? "Needs attention" : "Below threshold"}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-bocra-light rounded-lg p-4 text-sm text-muted-foreground">
                    No automated analysis available for this submission type. Review raw data manually.
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1.5">Review Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-bocra-blue"
                placeholder="Add notes about this submission..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleReview("APPROVED")}
                disabled={loading}
                className="px-4 py-2 bg-bocra-green text-white rounded-lg text-sm font-medium hover:bg-bocra-green/80 transition-colors disabled:opacity-50"
              >
                Approve
              </button>
              <button
                onClick={() => handleReview("FLAGGED")}
                disabled={loading}
                className="px-4 py-2 bg-bocra-orange text-white rounded-lg text-sm font-medium hover:bg-bocra-orange/80 transition-colors disabled:opacity-50"
              >
                Flag
              </button>
              <button
                onClick={() => handleReview("REJECTED")}
                disabled={loading}
                className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-500/80 transition-colors disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-border px-6 py-12 text-center text-muted-foreground">
            Select a submission to review
          </div>
        )}
      </div>
    </div>
  );
}
