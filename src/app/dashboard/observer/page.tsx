"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Eye,
  RefreshCw,
  ChevronRight,
} from "lucide-react";

interface ObserverInstance {
  id: string;
  slug: string;
  name: string;
  partnerName: string;
  status: string;
  currentStageName?: string;
  updatedAt: string;
  metrics: {
    totalEntries: number;
    submittedEntries: number;
    evaluatedEntries: number;
    consensusEntries: number;
    shortlistedEntries: number;
  };
  entries: Array<{
    id: string;
    referenceCode: string;
    title: string;
    status: string;
    score: number | null;
    consensusScore: number | null;
    evaluationsCount: number;
    evaluationsCompleted: number;
  }>;
}

export default function CommitteeObserverPage() {
  const [instances, setInstances] = useState<ObserverInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(null);

  const fetchTelemetry = async () => {
    try {
      const res = await fetch("/api/observer");
      if (res.ok) {
        const data = await res.json();
        setInstances(data.instances || []);
        if (!selectedInstanceId && data.instances?.length > 0) {
          setSelectedInstanceId(data.instances[0].id);
        }
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
    // 15-second polling interval required by Directive
    const interval = setInterval(fetchTelemetry, 15000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selected = instances.find((i) => i.id === selectedInstanceId) || instances[0];

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-6">
      {/* Top Banner: Observer Confidentiality Notice */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-neutral-900 text-white shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-ceda-gold/20 text-ceda-gold flex items-center justify-center shrink-0">
            <Eye size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold">Committee Observer Console</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider bg-ceda-gold text-neutral-950 uppercase">
                Read-Only Audit Mode
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Live non-interfering statutory oversight. Automatic 15-second telemetry polling active.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-xs text-neutral-400 font-mono">
              Live sync {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={() => {
              setRefreshing(true);
              fetchTelemetry();
            }}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-200 transition"
          >
            <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
            <span>Poll Now</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-sm text-neutral-500">Connecting to live observer telemetry feed...</div>
      ) : instances.length === 0 ? (
        <div className="p-12 text-center text-sm text-neutral-500 bg-white rounded-xl border border-border">
          No active challenge instances currently published.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Instance Selector */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-ceda-copper">
              Active Challenge Instances ({instances.length})
            </h2>

            <div className="space-y-2">
              {instances.map((inst) => {
                const isCurrent = inst.id === selected?.id;
                return (
                  <button
                    key={inst.id}
                    onClick={() => setSelectedInstanceId(inst.id)}
                    className={`w-full text-left p-4 rounded-xl border transition shadow-sm ${
                      isCurrent
                        ? "bg-white border-ceda-blue ring-2 ring-ceda-blue/20"
                        : "bg-neutral-50/70 border-border hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-neutral-200 text-neutral-700">
                        {inst.partnerName}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-600 uppercase">
                        {inst.status}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-ceda-ink mt-2 line-clamp-1">{inst.name}</h3>

                    <div className="flex items-center justify-between text-xs text-ceda-slate mt-2 pt-2 border-t border-border/60">
                      <span>{inst.metrics.submittedEntries} Submissions</span>
                      <span>{inst.metrics.consensusEntries} Consensus</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Detailed Progress & Entry Overview */}
          <div className="lg:col-span-2 space-y-6">
            {selected && (
              <>
                {/* Instance Progress Card */}
                <div className="p-6 rounded-2xl border border-border bg-white shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-ceda-copper tracking-wider">
                        {selected.partnerName} Challenge
                      </span>
                      <h2 className="text-xl font-black text-ceda-ink">{selected.name}</h2>
                    </div>

                    <Link
                      href={`/instances/${selected.slug}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 text-xs font-bold text-ceda-blue hover:underline"
                    >
                      View Public Directory <ChevronRight size={14} />
                    </Link>
                  </div>

                  {/* Metrics KPI Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div className="p-3 rounded-xl bg-neutral-50 border border-border">
                      <p className="text-[10px] uppercase font-bold text-ceda-slate">Total Entries</p>
                      <p className="text-xl font-black text-ceda-ink font-mono">{selected.metrics.totalEntries}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200">
                      <p className="text-[10px] uppercase font-bold text-blue-700">Screened</p>
                      <p className="text-xl font-black text-blue-900 font-mono">{selected.metrics.submittedEntries}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200">
                      <p className="text-[10px] uppercase font-bold text-amber-700">Blind Evaluated</p>
                      <p className="text-xl font-black text-amber-900 font-mono">{selected.metrics.evaluatedEntries}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200">
                      <p className="text-[10px] uppercase font-bold text-emerald-700">Consensus Agreed</p>
                      <p className="text-xl font-black text-emerald-900 font-mono">{selected.metrics.consensusEntries}</p>
                    </div>
                  </div>
                </div>

                {/* Submissions & Evaluation Progression Table */}
                <div className="rounded-2xl border border-border bg-white overflow-hidden shadow-sm">
                  <div className="px-5 py-4 border-b border-border bg-neutral-50/60 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-ceda-ink">Ventures Progression & Scoring Oversight</h3>
                    <span className="text-xs text-ceda-slate">{selected.entries.length} entries registered</span>
                  </div>

                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-border text-ceda-slate font-bold uppercase tracking-wider bg-neutral-50">
                        <th className="py-2.5 px-4">Ref Code / Venture</th>
                        <th className="py-2.5 px-4">Lifecycle Status</th>
                        <th className="py-2.5 px-4 text-center">Evaluators</th>
                        <th className="py-2.5 px-4 text-right">Blind Score</th>
                        <th className="py-2.5 px-4 text-right">Consensus</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border text-ceda-ink">
                      {selected.entries.map((entry) => (
                        <tr key={entry.id} className="hover:bg-neutral-50/50">
                          <td className="py-3 px-4">
                            <span className="font-mono text-[10px] text-ceda-slate block">{entry.referenceCode}</span>
                            <span className="font-bold">{entry.title}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-neutral-100 text-neutral-700">
                              {entry.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center font-mono">
                            {entry.evaluationsCompleted} / {entry.evaluationsCount}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-semibold">
                            {entry.score !== null ? `${entry.score.toFixed(1)}/100` : "—"}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                            {entry.consensusScore !== null ? `${entry.consensusScore.toFixed(1)}/100` : "Pending"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
