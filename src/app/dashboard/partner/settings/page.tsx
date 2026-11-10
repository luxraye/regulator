"use client";

import { useEffect, useState } from "react";
import { Palette, ShieldCheck, CheckCircle2, Eye, Sparkles, Loader2, ArrowRight } from "lucide-react";

interface PartnerData {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  status: string;
  _count?: {
    instances: number;
    users: number;
    apiKeys: number;
  };
}

export default function PartnerSettingsPage() {
  const [partner, setPartner] = useState<PartnerData | null>(null);
  const [name, setName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#004b87");
  const [secondaryColor, setSecondaryColor] = useState("#00a3e0");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    async function loadPartner() {
      try {
        const res = await fetch("/api/partner");
        if (res.ok) {
          const data = await res.json();
          if (data.partner) {
            setPartner(data.partner);
            setName(data.partner.name || "");
            setLogoUrl(data.partner.logoUrl || "");
            setPrimaryColor(data.partner.primaryColor || "#004b87");
            setSecondaryColor(data.partner.secondaryColor || "#00a3e0");
          }
        }
      } catch (err) {
        console.error("Failed to load partner:", err);
      } finally {
        setLoading(false);
      }
    }
    loadPartner();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);
    try {
      const res = await fetch("/api/partner", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          logoUrl,
          primaryColor,
          secondaryColor,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setPartner(data.partner);
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 4000);
      }
    } catch (err) {
      console.error("Failed to save branding:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-ceda-orange" size={28} />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="border-b border-border pb-5">
        <div className="flex items-center gap-2 text-xs text-ceda-slate">
          <span>Partner Workspace</span>
          <span>•</span>
          <span className="font-semibold text-ceda-copper">{partner?.slug?.toUpperCase() || "SPACE"}</span>
        </div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-ceda-ink sm:text-3xl">
          Branded Partner Space
        </h1>
        <p className="mt-1 text-sm text-ceda-slate">
          Customize your partner organization&apos;s identity, visual branding, primary colors, and logo. All public instances and applicant dashboards will inherit this theme.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left: Branding Form */}
        <form onSubmit={handleSave} className="lg:col-span-7 space-y-6 rounded-2xl border border-border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <Palette size={18} className="text-ceda-orange" />
              <h2 className="font-bold text-ceda-ink">Organization & Brand Identity</h2>
            </div>
            {savedSuccess && (
              <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 animate-fadeIn">
                <CheckCircle2 size={14} /> Saved & Applied
              </span>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-ceda-slate mb-1">
              Organization Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-border px-3.5 py-2.5 text-sm text-ceda-ink focus:outline-none focus:ring-2 focus:ring-ceda-orange"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-ceda-slate mb-1">
              Logo Asset URL
            </label>
            <input
              type="text"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="/brand/bdih-logo.svg or https://..."
              className="w-full rounded-xl border border-border px-3.5 py-2.5 text-sm font-mono text-ceda-ink focus:outline-none focus:ring-2 focus:ring-ceda-orange"
            />
            <p className="text-[11px] text-ceda-slate mt-1">SVG, PNG, or WebP logo mark rendered on competition headers and certificates.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ceda-slate mb-1">
                Primary Brand Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="h-10 w-12 cursor-pointer rounded-lg border border-border bg-transparent p-1"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-full rounded-xl border border-border px-3 py-2 text-sm font-mono uppercase text-ceda-ink"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ceda-slate mb-1">
                Secondary / Accent Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="h-10 w-12 cursor-pointer rounded-lg border border-border bg-transparent p-1"
                />
                <input
                  type="text"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-full rounded-xl border border-border px-3 py-2 text-sm font-mono uppercase text-ceda-ink"
                />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-ceda-ink px-6 py-2.5 text-sm font-bold text-white shadow hover:bg-black transition disabled:opacity-60"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              <span>{saving ? "Updating..." : "Save Brand Settings"}</span>
            </button>
          </div>
        </form>

        {/* Right: Live Brand Preview Simulator */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ceda-slate">
            <Eye size={16} className="text-ceda-copper" />
            Live Space Preview
          </div>

          <div className="rounded-2xl border border-border bg-white p-5 shadow-sm space-y-4 overflow-hidden">
            {/* Branded Header Simulation */}
            <div
              className="rounded-xl p-5 text-white transition-all shadow-inner"
              style={{ backgroundColor: primaryColor }}
            >
              <div className="flex items-center justify-between mb-3">
                <span
                  className="rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-white shadow-sm"
                  style={{ backgroundColor: secondaryColor }}
                >
                  Partner Challenge
                </span>
                <span className="text-[11px] opacity-80">{partner?.slug?.toUpperCase()}</span>
              </div>
              <h3 className="text-base font-extrabold">{name || "Partner Organization"}</h3>
              <p className="text-xs opacity-90 mt-1 leading-relaxed">
                National scale innovation challenge powered by CEDA ecosystem.
              </p>
              <div className="mt-4 flex items-center gap-2">
                <div
                  className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold text-white shadow"
                  style={{ backgroundColor: secondaryColor }}
                >
                  <span>Apply Now</span>
                  <ArrowRight size={12} />
                </div>
              </div>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
              <div className="rounded-lg bg-slate-50 p-2.5 border border-border">
                <span className="block text-base font-bold text-ceda-ink">{partner?._count?.instances ?? 0}</span>
                <span className="text-[11px] text-ceda-slate">Instances</span>
              </div>
              <div className="rounded-lg bg-slate-50 p-2.5 border border-border">
                <span className="block text-base font-bold text-ceda-ink">{partner?._count?.users ?? 0}</span>
                <span className="text-[11px] text-ceda-slate">Team</span>
              </div>
              <div className="rounded-lg bg-slate-50 p-2.5 border border-border">
                <span className="block text-base font-bold text-ceda-ink">{partner?._count?.apiKeys ?? 0}</span>
                <span className="text-[11px] text-ceda-slate">API Keys</span>
              </div>
            </div>

            <div className="rounded-lg bg-slate-50 p-3 text-xs text-ceda-slate border border-border space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-ceda-ink">
                <ShieldCheck size={14} className="text-emerald-600" />
                <span>Isolated Multi-Tenant Governance</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Admins and evaluators in your organization only access challenges, proposals, and audit records belonging to {name || "your partner space"}.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
