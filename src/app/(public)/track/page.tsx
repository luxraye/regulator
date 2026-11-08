"use client";

import { useEffect, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";
import { JOURNEY } from "@/lib/labels";
import { cn, formatDate } from "@/lib/utils";

interface Result { referenceCode: string; call: string; status: string; stage: string; stageIndex: number; submittedAt: string; updatedAt: string }

export default function TrackPage() {
  const { t } = useLanguage();
  const [ref, setRef] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function track(code = ref) {
    if (!code.trim()) return;
    setBusy(true);
    setError(null);
    setResult(null);
    const res = await fetch(`/api/track?ref=${encodeURIComponent(code.trim())}`);
    setBusy(false);
    if (!res.ok) return setError(t("track.notfound"));
    setResult(await res.json());
  }

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("ref");
    if (q) { setRef(q); track(q); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex min-h-[70vh] items-start justify-center bg-ceda-light px-4 py-16">
      <div className="w-full max-w-xl">
        <h1 className="text-3xl font-bold text-ceda-navy">{t("track.title")}</h1>
        <p className="mb-6 mt-2 text-muted-foreground">{t("track.subtitle")}</p>
        <form onSubmit={(e) => { e.preventDefault(); track(); }} className="flex gap-2">
          <input
            value={ref}
            onChange={(e) => setRef(e.target.value.toUpperCase())}
            placeholder="CEDA-26-XXXX"
            aria-label="Reference"
            className="flex-1 rounded-lg border border-border bg-white px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ceda-blue"
          />
          <button disabled={busy} className="inline-flex items-center gap-2 rounded-lg bg-ceda-navy px-5 font-medium text-white disabled:opacity-50">
            {busy ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />} {t("track.button")}
          </button>
        </form>
        {error && <p className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {result && (
          <div className="mt-6 rounded-2xl border border-border bg-white p-6">
            <p className="font-mono text-xs text-muted-foreground">{result.referenceCode}</p>
            <p className="text-lg font-semibold text-ceda-navy">{result.status}</p>
            <p className="text-sm text-muted-foreground">{result.call}</p>
            <ol className="mt-6 space-y-3">
              {JOURNEY.map((s, i) => (
                <li key={s.key} className="flex items-center gap-3">
                  <span className={cn("flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold", i < result.stageIndex ? "bg-ceda-green text-white" : i === result.stageIndex ? "bg-ceda-blue text-white ring-4 ring-ceda-blue/15" : "bg-gray-200 text-gray-500")}>{i + 1}</span>
                  <span className={cn("text-sm", i === result.stageIndex ? "font-semibold text-ceda-navy" : "text-muted-foreground")}>{s.label}</span>
                </li>
              ))}
            </ol>
            <p className="mt-6 text-xs text-muted-foreground">Submitted {formatDate(result.submittedAt)} · last update {formatDate(result.updatedAt)}. Sign in to see feedback and messages.</p>
          </div>
        )}
      </div>
    </div>
  );
}
