"use client";

import { useEffect, useState } from "react";
import { BarChart3, Clock, CheckCircle2, Users, RefreshCw, Loader2, Headset } from "lucide-react";

interface AnalyticsData {
  summary: {
    totalSessions: number;
    waitingSessions: number;
    activeSessions: number;
    resolvedSessions: number;
    resolutionRate: number;
    avgResponseTimeMinutes: number;
  };
  busiestHours: { hour: string; sessions: number }[];
  perAgent: { id: string; name: string; email: string; handledCount: number; avgFirstResponseMin: number }[];
}

export default function ConsultantAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/chat/analytics");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Failed to load analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-ceda-orange" size={28} />
      </div>
    );
  }

  const s = data?.summary;
  const maxHourSessions = data?.busiestHours ? Math.max(...data.busiestHours.map((h) => h.sessions), 1) : 1;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-ceda-slate">
            <span>Consultant Operations</span>
            <span>•</span>
            <span className="font-semibold text-ceda-copper">Service Level Metrics</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-ceda-ink sm:text-3xl">
            Live Chat Performance & Analytics Report
          </h1>
          <p className="mt-1 text-xs text-ceda-slate sm:text-sm">
            Operational KPIs across inquiry volume, first response times, case resolution, and peak advisory hours.
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-white px-3.5 py-2 text-xs font-semibold text-ceda-ink hover:bg-slate-50 transition"
        >
          <RefreshCw size={14} className="text-ceda-slate" />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-medium text-ceda-slate">
            <Users size={14} className="text-ceda-copper" />
            Total Inquiries
          </div>
          <div className="mt-2 text-2xl font-bold text-ceda-ink">{s?.totalSessions ?? 0}</div>
          <div className="mt-1 text-[11px] text-ceda-slate">
            {s?.activeSessions ?? 0} active • {s?.waitingSessions ?? 0} in queue
          </div>
        </div>

        <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-medium text-ceda-slate">
            <Clock size={14} className="text-ceda-orange" />
            Avg First Response
          </div>
          <div className="mt-2 text-2xl font-bold text-ceda-ink">
            {s?.avgResponseTimeMinutes ?? 0} min
          </div>
          <div className="mt-1 text-[11px] text-ceda-slate">Target: &lt; 5 minutes</div>
        </div>

        <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-medium text-ceda-slate">
            <CheckCircle2 size={14} className="text-emerald-600" />
            Resolution Rate
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-700">
            {s?.resolutionRate ?? 100}%
          </div>
          <div className="mt-1 text-[11px] text-ceda-slate">{s?.resolvedSessions ?? 0} cases resolved</div>
        </div>

        <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-medium text-ceda-slate">
            <Headset size={14} className="text-ceda-copper" />
            Active Consultants
          </div>
          <div className="mt-2 text-2xl font-bold text-ceda-ink">{data?.perAgent.length ?? 1}</div>
          <div className="mt-1 text-[11px] text-ceda-slate">Operating 09:00 - 16:00 CAT</div>
        </div>
      </div>

      {/* Hourly Volume Distribution (09:00 - 16:00 CAT) */}
      <div className="rounded-xl border border-border bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <BarChart3 size={16} className="text-ceda-orange" />
            <h2 className="text-base font-bold text-ceda-ink">
              Hourly Advisory Volume Distribution (CAT)
            </h2>
          </div>
          <span className="text-xs text-ceda-slate">Standard Operating Hours</span>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 pt-2">
          {data?.busiestHours.map((h) => {
            const pct = Math.round((h.sessions / maxHourSessions) * 100);
            return (
              <div key={h.hour} className="flex flex-col items-center gap-2 text-center">
                <span className="text-[11px] font-bold text-ceda-ink">{h.sessions}</span>
                <div className="w-full bg-slate-100 rounded-lg h-24 flex items-end p-1">
                  <div
                    className="w-full rounded-md bg-ceda-orange transition-all duration-300"
                    style={{ height: `${Math.max(8, pct)}%` }}
                  />
                </div>
                <span className="text-[10px] text-ceda-slate font-mono">{h.hour}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Per-Agent Performance Table */}
      <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="text-sm font-bold text-ceda-ink">Consultant Agent Performance</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-ceda-slate border-b border-border">
              <tr>
                <th className="px-5 py-3 font-semibold">Consultant Agent</th>
                <th className="px-5 py-3 font-semibold text-center">Handled Inquiries</th>
                <th className="px-5 py-3 font-semibold text-right">Avg Response Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data?.perAgent.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-5 py-6 text-center text-ceda-slate">
                    No individual agent sessions recorded yet.
                  </td>
                </tr>
              ) : (
                data?.perAgent.map((agent) => (
                  <tr key={agent.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-5 py-3.5">
                      <span className="font-bold text-ceda-ink text-sm block">{agent.name}</span>
                      <span className="text-[11px] text-muted-foreground">{agent.email}</span>
                    </td>
                    <td className="px-5 py-3.5 text-center font-bold text-ceda-ink">
                      {agent.handledCount}
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono text-ceda-copper font-semibold">
                      {agent.avgFirstResponseMin} min
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
