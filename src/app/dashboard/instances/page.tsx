"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Layers,
  Plus,
  Search,
  ShieldCheck,
  Calendar,
  Users,
  Copy,
  ExternalLink,
  Sliders,
  BarChart2,
  CheckCircle2,
  FileCode,
  Clock,
  RefreshCw,
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";

interface InstanceItem {
  id: string;
  name: string;
  slug: string;
  status: "DRAFT" | "PUBLISHED" | "LIVE" | "CLOSED" | "ARCHIVED";
  rulesHash: string | null;
  opensAt: string;
  closesAt: string;
  partner?: { id: string; name: string; slug: string; logoUrl?: string | null } | null;
  versions?: { version: number; rulesHash: string; createdAt: string }[];
  _count?: { entries: number; roles: number };
}

export default function InstancesDashboardPage() {
  const [instances, setInstances] = useState<InstanceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [cloningId, setCloningId] = useState<string | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const fetchInstances = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/instances-engine");
      if (res.ok) {
        const data = await res.json();
        setInstances(data.instances || []);
      }
    } catch (e) {
      console.error("Error loading instances:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstances();
  }, []);

  const handleClone = async (id: string) => {
    setCloningId(id);
    try {
      const res = await fetch(`/api/instances-engine/${id}/clone`, { method: "POST" });
      if (res.ok) {
        await fetchInstances();
      }
    } catch (e) {
      console.error("Clone failed:", e);
    } finally {
      setCloningId(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(text);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const filteredInstances = instances.filter((inst) => {
    const matchesFilter = filter === "ALL" || inst.status === filter;
    const matchesSearch =
      !search ||
      inst.name.toLowerCase().includes(search.toLowerCase()) ||
      inst.slug.toLowerCase().includes(search.toLowerCase()) ||
      (inst.partner?.name && inst.partner.name.toLowerCase().includes(search.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const liveCount = instances.filter((i) => i.status === "LIVE" || i.status === "PUBLISHED").length;
  const draftCount = instances.filter((i) => i.status === "DRAFT").length;
  const totalEntries = instances.reduce((sum, i) => sum + (i._count?.entries ?? 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ceda-ink sm:text-3xl">Competition Instances</h1>
          <p className="mt-1 text-sm text-ceda-slate">
            Programmable competition engines, rulesets, and tamper-evident evaluation workflows.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchInstances}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-2 text-sm font-medium text-ceda-ink hover:bg-slate-50 transition"
            title="Refresh instances list"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          <Link
            href="/dashboard/instances/new"
            className="inline-flex items-center gap-2 rounded-lg bg-ceda-orange px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-ceda-copper transition"
          >
            <Plus size={16} />
            New Instance
          </Link>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-medium text-ceda-slate">
            <Layers size={14} className="text-ceda-orange" />
            Total Instances
          </div>
          <div className="mt-2 text-2xl font-bold text-ceda-ink">{instances.length}</div>
        </div>
        <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-medium text-ceda-slate">
            <CheckCircle2 size={14} className="text-emerald-600" />
            Live & Published
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-700">{liveCount}</div>
        </div>
        <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-medium text-ceda-slate">
            <FileCode size={14} className="text-amber-600" />
            Drafts in Studio
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-700">{draftCount}</div>
        </div>
        <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-medium text-ceda-slate">
            <Users size={14} className="text-ceda-copper" />
            Enrolled Dossiers
          </div>
          <div className="mt-2 text-2xl font-bold text-ceda-ink">{totalEntries}</div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-border bg-white p-1">
          {["ALL", "LIVE", "PUBLISHED", "DRAFT", "CLOSED"].map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition",
                filter === st ? "bg-ceda-orange text-white" : "text-ceda-slate hover:bg-slate-100 hover:text-ceda-ink"
              )}
            >
              {st === "ALL" ? "All Instances" : st}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ceda-slate" />
          <input
            type="text"
            placeholder="Search by title, partner, slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border bg-white py-1.5 pl-9 pr-3 text-sm text-ceda-ink placeholder:text-muted-foreground focus:border-ceda-orange focus:outline-none focus:ring-1 focus:ring-ceda-orange"
          />
        </div>
      </div>

      {/* Instance Cards */}
      {loading ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-white/50 py-16 text-center">
          <RefreshCw size={24} className="animate-spin text-ceda-orange" />
          <p className="mt-3 text-sm font-medium text-ceda-slate">Loading competition instances...</p>
        </div>
      ) : filteredInstances.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-white py-16 text-center">
          <Layers size={36} className="text-ceda-slate/40" />
          <h3 className="mt-3 text-base font-semibold text-ceda-ink">No instances match your filter</h3>
          <p className="mt-1 text-sm text-ceda-slate">Create your first competition instance or start from a pre-built blueprint.</p>
          <Link
            href="/dashboard/instances/new"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-ceda-orange px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-ceda-copper transition"
          >
            <Plus size={16} />
            Open Instance Studio
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {filteredInstances.map((inst) => {
            const versionNum = inst.versions?.[0]?.version ?? 1;

            return (
              <div
                key={inst.id}
                className="flex flex-col justify-between rounded-xl border border-border bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <div className="space-y-3">
                  {/* Top line badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-ceda-sand px-2.5 py-0.5 text-xs font-medium text-ceda-copper">
                      {inst.partner?.name ?? "CEDA"}
                    </span>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider",
                          inst.status === "LIVE" && "bg-emerald-100 text-emerald-800",
                          inst.status === "PUBLISHED" && "bg-blue-100 text-blue-800",
                          inst.status === "DRAFT" && "bg-amber-100 text-amber-800",
                          inst.status === "CLOSED" && "bg-slate-100 text-slate-800",
                          inst.status === "ARCHIVED" && "bg-gray-100 text-gray-600"
                        )}
                      >
                        {inst.status}
                      </span>
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-mono text-ceda-slate">
                        v{versionNum}
                      </span>
                    </div>
                  </div>

                  {/* Title & Slug */}
                  <div>
                    <h2 className="text-lg font-bold text-ceda-ink line-clamp-1">{inst.name}</h2>
                    <p className="font-mono text-xs text-ceda-slate">/instances/{inst.slug}</p>
                  </div>

                  {/* Timeline & Entries count */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-ceda-slate">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={13} className="text-ceda-orange" />
                      <span>Closes: {formatDate(inst.closesAt)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users size={13} className="text-ceda-copper" />
                      <span>{inst._count?.entries ?? 0} Dossiers Enrolled</span>
                    </div>
                  </div>

                  {/* Rules Hash Fingerprint */}
                  {inst.rulesHash ? (
                    <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-xs">
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck size={14} className="text-emerald-600" />
                        <span className="font-medium text-ceda-ink">Rules Fingerprint:</span>
                        <code className="font-mono text-slate-600" title={inst.rulesHash}>
                          {inst.rulesHash.slice(0, 10)}...{inst.rulesHash.slice(-6)}
                        </code>
                      </div>
                      <button
                        onClick={() => copyToClipboard(inst.rulesHash!)}
                        className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-ceda-ink transition"
                        title="Copy full SHA-256 fingerprint"
                      >
                        {copiedHash === inst.rulesHash ? (
                          <span className="text-[10px] font-semibold text-emerald-600">Copied!</span>
                        ) : (
                          <Copy size={13} />
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
                      <Clock size={14} />
                      <span>Draft ruleset unsealed. Fingerprint computed on publish.</span>
                    </div>
                  )}
                </div>

                {/* Actions Bottom Bar */}
                <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/instances/${inst.id}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-semibold text-ceda-ink hover:bg-slate-50 transition"
                    >
                      <BarChart2 size={13} className="text-ceda-orange" />
                      Console
                    </Link>
                    <Link
                      href={`/dashboard/instances/${inst.id}/edit`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-semibold text-ceda-ink hover:bg-slate-50 transition"
                    >
                      <Sliders size={13} className="text-ceda-copper" />
                      Studio
                    </Link>
                    <button
                      onClick={() => handleClone(inst.id)}
                      disabled={cloningId === inst.id}
                      className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-ceda-slate hover:bg-slate-100 hover:text-ceda-ink transition"
                      title="Clone this instance into a new draft"
                    >
                      <Copy size={12} />
                      {cloningId === inst.id ? "Cloning..." : "Clone"}
                    </button>
                  </div>

                  <Link
                    href={`/instances/${inst.slug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1 text-xs font-medium text-ceda-orange hover:text-ceda-copper transition"
                  >
                    <span>Public View</span>
                    <ExternalLink size={12} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
