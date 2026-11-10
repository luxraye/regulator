import Link from "next/link";
import { Code2, Key, Webhook, FileText, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Partner API v1 Documentation | CEDA Innovation Portal",
  description: "Programmatic integration guide, OpenAPI specification, and outbound webhook reference for CEDA innovation partners.",
};

export default function ApiDocsPage() {
  return (
    <div className="bg-slate-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <div className="border-b border-border pb-6">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ceda-copper">
            <Code2 size={16} /> Developer Platform & Integrations
          </div>
          <h1 className="mt-2 text-3xl font-extrabold text-ceda-ink sm:text-4xl">
            CEDA Innovation Portal API v1
          </h1>
          <p className="mt-3 text-sm text-ceda-slate leading-relaxed">
            The CEDA Partner API allows innovation hubs, government ministries, and corporate partners to programmatically deploy competition instances, inspect participant dossiers, recompute leaderboards, and receive real-time cryptographic webhook events.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/api/v1/openapi.json"
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-lg bg-ceda-ink px-3 py-1.5 text-xs font-semibold text-white hover:bg-ceda-copper transition"
            >
              <FileText size={14} /> View raw OpenAPI JSON
            </Link>
          </div>
        </div>

        {/* Authentication */}
        <div className="rounded-xl border border-border bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5">
            <Key size={18} className="text-ceda-orange" />
            <h2 className="text-lg font-bold text-ceda-ink">Authentication & API Keys</h2>
          </div>
          <p className="text-xs text-ceda-slate leading-relaxed">
            Every request to API v1 requires a valid partner API key. API keys begin with the prefix <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-ceda-ink">ceda_live_</code>. Supply your key in the standard Authorization header:
          </p>

          <div className="rounded-lg bg-slate-900 p-3.5 text-xs font-mono text-emerald-400">
            Authorization: Bearer ceda_live_9a8b7c6d5e4f3a2b1c0d...
          </div>
          <p className="text-[11px] text-ceda-slate">
            Alternatively, pass the key via the <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-ceda-ink">x-api-key</code> HTTP header.
          </p>
        </div>

        {/* Endpoints Reference */}
        <div className="rounded-xl border border-border bg-white p-6 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-ceda-ink border-b border-border pb-3">
            Core Endpoints
          </h2>

          {/* GET /api/v1/instances */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800 uppercase">
                GET
              </span>
              <code className="text-xs font-bold font-mono text-ceda-ink">/api/v1/instances</code>
            </div>
            <p className="text-xs text-ceda-slate">
              Lists all competition instances created by or assigned to your Partner tenant.
            </p>
            <div className="rounded bg-slate-900 p-3 text-[11px] font-mono text-slate-200">
              curl -H &quot;Authorization: Bearer ceda_live_...&quot; https://ceda-portal.../api/v1/instances
            </div>
          </div>

          {/* POST /api/v1/instances */}
          <div className="space-y-2 border-t border-border pt-4">
            <div className="flex items-center gap-2">
              <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-800 uppercase">
                POST
              </span>
              <code className="text-xs font-bold font-mono text-ceda-ink">/api/v1/instances</code>
            </div>
            <p className="text-xs text-ceda-slate">
              Creates a new competition instance. You can instantiate from a certified blueprint (e.g. <code className="font-mono text-ceda-ink">flagship-hackathon</code>, <code className="font-mono text-ceda-ink">agritech-challenge</code>) or supply a complete custom 11-section JSON schema.
            </p>
            <div className="rounded bg-slate-900 p-3 text-[11px] font-mono text-slate-200">
              curl -X POST -H &quot;Content-Type: application/json&quot; \<br />
              &nbsp;&nbsp;-H &quot;Authorization: Bearer ceda_live_...&quot; \<br />
              &nbsp;&nbsp;-d &apos;&#123;&quot;blueprintKey&quot;: &quot;agritech-challenge&quot;&#125;&apos; \<br />
              &nbsp;&nbsp;https://ceda-portal.../api/v1/instances
            </div>
          </div>

          {/* POST /api/v1/instances/:id/clone */}
          <div className="space-y-2 border-t border-border pt-4">
            <div className="flex items-center gap-2">
              <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-800 uppercase">
                POST
              </span>
              <code className="text-xs font-bold font-mono text-ceda-ink">/api/v1/instances/:id/clone</code>
            </div>
            <p className="text-xs text-ceda-slate">
              Clones an existing instance into a fresh editable draft with new ruleset hash and independent configuration.
            </p>
          </div>

          {/* GET /api/v1/instances/:id/entries */}
          <div className="space-y-2 border-t border-border pt-4">
            <div className="flex items-center gap-2">
              <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800 uppercase">
                GET
              </span>
              <code className="text-xs font-bold font-mono text-ceda-ink">/api/v1/instances/:id/entries</code>
            </div>
            <p className="text-xs text-ceda-slate">
              Returns all submitted innovator entries, scoring statuses, and evaluation counts for an instance.
            </p>
          </div>

          {/* GET /api/v1/entries/:id */}
          <div className="space-y-2 border-t border-border pt-4">
            <div className="flex items-center gap-2">
              <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800 uppercase">
                GET
              </span>
              <code className="text-xs font-bold font-mono text-ceda-ink">/api/v1/entries/:id</code>
            </div>
            <p className="text-xs text-ceda-slate">
              Retrieves full dossier information for an individual entry, including pre-flight guard results, uploaded file hashes, and sealed JWT receipts.
            </p>
          </div>
        </div>

        {/* Outbound Webhooks */}
        <div className="rounded-xl border border-border bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5">
            <Webhook size={18} className="text-ceda-copper" />
            <h2 className="text-lg font-bold text-ceda-ink">HMAC-Signed Outbound Webhooks</h2>
          </div>
          <p className="text-xs text-ceda-slate leading-relaxed">
            The portal delivers real-time HTTP POST notifications when competition stages transition or final adjudication decisions are recorded. Every webhook payload is signed with HMAC-SHA256 using your partner webhook secret.
          </p>

          <div className="space-y-2">
            <h3 className="text-xs font-bold text-ceda-ink">Supported Events:</h3>
            <ul className="space-y-1.5 text-xs text-ceda-slate">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={13} className="text-emerald-600" />
                <code className="font-mono font-bold text-ceda-ink">stage.changed</code>: Fires when a competition stage transitions (e.g. from submission to scoring).
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={13} className="text-emerald-600" />
                <code className="font-mono font-bold text-ceda-ink">decision.recorded</code>: Fires when an entry is approved, awarded, or flagged by adjudicators.
              </li>
            </ul>
          </div>

          <div className="rounded-lg bg-slate-900 p-3.5 text-xs font-mono text-slate-200 space-y-1">
            <p className="text-slate-400"># Verification header:</p>
            <p className="text-emerald-400">X-CEDA-Signature: sha256=4f5d2e1a3b8c...</p>
            <p className="text-emerald-400">X-CEDA-Event: stage.changed</p>
          </div>
        </div>
      </div>
    </div>
  );
}
