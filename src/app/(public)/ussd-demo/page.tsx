"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, MessageSquare, Phone, RotateCcw } from "lucide-react";
import { ageOn, MAX_AGE, MIN_AGE } from "@/lib/eligibility";
import { formatDate } from "@/lib/utils";

type Screen = { text: string; input?: boolean; end?: boolean };
type State = { step: string; data: Record<string, string> };

const MENU = "CEDA Ideas *161#\n1. Open calls\n2. Track my idea\n3. Am I eligible?\n4. Get help by SMS";

/** Feature-phone access for founders without data. Calls the same public APIs as the website. */
export default function USSDDemoPage() {
  const [state, setState] = useState<State>({ step: "menu", data: {} });
  const [screen, setScreen] = useState<Screen>({ text: MENU, input: true });
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [sms, setSms] = useState<string[]>([]);

  function reset() {
    setState({ step: "menu", data: {} });
    setScreen({ text: MENU, input: true });
    setValue("");
  }

  async function send() {
    const v = value.trim();
    setValue("");
    setBusy(true);
    try {
      await handle(v);
    } finally {
      setBusy(false);
    }
  }

  async function handle(v: string) {
    const { step, data } = state;
    const go = (next: string, s: Screen, extra: Record<string, string> = {}) => {
      setState({ step: next, data: { ...data, ...extra } });
      setScreen(s);
    };

    if (v === "0") return reset();

    if (step === "menu") {
      if (v === "1") {
        const calls: { code: string; name: string; closesAt: string }[] = await fetch("/api/calls").then((r) => r.json());
        const lines = calls.slice(0, 5).map((c, i) => `${i + 1}. ${c.name.slice(0, 26)} (closes ${formatDate(c.closesAt).replace(/ \d{4}$/, "")})`);
        return go("end", { text: `Open calls:\n${lines.join("\n")}\n\nApply at ceda-ideas portal or reply 0 for menu.`, input: true });
      }
      if (v === "2") return go("track", { text: "Enter your reference\n(e.g. CEDA-26-K7Q2):", input: true });
      if (v === "3") return go("elig_citizen", { text: "Are you a citizen of Botswana?\n1. Yes\n2. No", input: true });
      if (v === "4") {
        setSms((s) => [...s, "CEDA: A programme officer will call you within 2 working days. Ref HELP-" + Math.floor(1000 + Math.random() * 9000)]);
        return go("end", { text: "Request received. A CEDA officer will call you. You will get an SMS.\n\n0. Menu", input: true });
      }
      return setScreen({ text: `Invalid choice.\n\n${MENU}`, input: true });
    }

    if (step === "track") {
      const res = await fetch(`/api/track?ref=${encodeURIComponent(v)}`);
      if (!res.ok) return go("end", { text: "No idea found with that reference.\n\n0. Menu", input: true });
      const r = await res.json();
      setSms((s) => [...s, `CEDA: ${r.referenceCode} is now "${r.status}" (stage ${r.stageIndex + 1} of 5: ${r.stage}). We will SMS you when it changes.`]);
      return go("end", { text: `${r.referenceCode}\n${r.call.slice(0, 30)}\nStatus: ${r.status}\nStage ${r.stageIndex + 1}/5: ${r.stage}\nUpdated ${formatDate(r.updatedAt)}\n\nSMS sent. 0. Menu`, input: true });
    }

    if (step === "elig_citizen") {
      if (v !== "1") return go("end", { text: "This challenge is for citizens only.\n\n0. Menu", input: true });
      return go("elig_year", { text: "Enter your year of birth\n(e.g. 1999):", input: true });
    }
    if (step === "elig_year") {
      const year = Number(v);
      const age = ageOn(new Date(year, 6, 1));
      if (!year || age < MIN_AGE || age > MAX_AGE) return go("end", { text: `You need to be ${MIN_AGE}-${MAX_AGE}. Ask about other CEDA products: 4 from menu.\n\n0. Menu`, input: true });
      return go("elig_share", { text: "What % of your company is owned by people aged 18-35?", input: true }, { age: String(age) });
    }
    if (step === "elig_share") {
      const pct = Number(v);
      if (!(pct > 50 && pct <= 100)) return go("end", { text: "The company must be more than 50% youth-owned.\n\n0. Menu", input: true });
      setSms((s) => [...s, "CEDA: You meet the youth innovation challenge rules. Register with your Omang and CIPA number to apply."]);
      return go("end", { text: "You are eligible!\nRegister online, or visit any CEDA office with your Omang and CIPA certificate.\n\nSMS sent. 0. Menu", input: true });
    }

    reset();
  }

  return (
    <div className="bg-ceda-sand px-4 py-12">
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-ceda-ink"><ArrowLeft size={14} /> Home</Link>
        <h1 className="text-3xl font-bold text-ceda-ink">No data? Dial *161#</h1>
        <p className="mb-8 mt-2 max-w-2xl text-muted-foreground">
          Many young founders outside the main towns have a basic phone and no data bundle. The USSD service checks eligibility, lists open calls and tracks
          an application by reference, then confirms by SMS. This simulator uses the portal&apos;s live data. Try a reference from any receipt.
        </p>
        <div className="grid items-start gap-8 md:grid-cols-2">
          <div className="mx-auto w-72 rounded-[2.5rem] bg-gray-900 p-4 shadow-2xl">
            <div className="rounded-xl bg-[#c9d6a3] p-4 font-mono text-[13px] leading-snug text-gray-900" style={{ minHeight: 300 }}>
              <pre className="whitespace-pre-wrap font-mono">{busy ? "Please wait…" : screen.text}</pre>
            </div>
            {screen.input && (
              <form onSubmit={(e) => { e.preventDefault(); send(); }} className="mt-3 flex gap-2">
                <input value={value} onChange={(e) => setValue(e.target.value)} aria-label="Reply" className="min-w-0 flex-1 rounded-lg bg-gray-800 px-3 py-2 font-mono text-sm text-white outline-none" autoFocus />
                <button className="rounded-lg bg-ceda-green px-3 text-sm font-medium text-white">Send</button>
              </form>
            )}
            <div className="mt-3 flex justify-between text-xs text-gray-400">
              <span className="flex items-center gap-1"><Phone size={12} /> *161#</span>
              <button onClick={reset} className="flex items-center gap-1 hover:text-white"><RotateCcw size={12} /> Restart</button>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-white p-5">
            <h2 className="mb-3 flex items-center gap-2 font-semibold text-ceda-ink"><MessageSquare size={16} /> SMS inbox</h2>
            {sms.length === 0 ? (
              <p className="text-sm text-muted-foreground">Messages the service sends appear here.</p>
            ) : (
              <ul className="space-y-2">{sms.map((m, i) => <li key={i} className="rounded-lg bg-ceda-sand p-3 text-sm">{m}</li>)}</ul>
            )}
            <p className="mt-4 text-xs text-muted-foreground">
              In production the same endpoints (/api/track, /api/calls) sit behind a USSD gateway from a mobile network, and status changes trigger SMS through the same notification events the dashboard uses.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
