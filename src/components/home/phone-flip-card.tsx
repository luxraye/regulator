"use client";

import { useEffect, useState } from "react";
import qrcode from "qrcode-generator";
import { Bell, FileBox, Home, Inbox, Megaphone, RotateCcw, ScanLine, Upload } from "lucide-react";
import { LogoMark } from "@/components/brand/logo";

/** A phone-sized card. The front shows the portal on a phone; it flips over to a QR code that opens registration. */
export function PhoneFlipCard() {
  const [flipped, setFlipped] = useState(false);
  const [url, setUrl] = useState("");

  useEffect(() => {
    const here = window.location.href.split(/[?#]/)[0].replace(/\/?$/, "/");
    setUrl(new URL("register?type=citizen", here).toString());
  }, []);

  return (
    <div className="flex flex-col items-center">
      <div className="[perspective:1800px]">
        <button
          type="button"
          onClick={() => setFlipped((f) => !f)}
          aria-label={flipped ? "Show the mobile screen" : "Show the QR code to install on your phone"}
          className="group relative block h-[560px] w-[272px] rounded-[46px] text-left focus:outline-none focus-visible:ring-4 focus-visible:ring-ceda-orange/40"
        >
          <div
            className="relative h-full w-full transition-transform duration-700 ease-[cubic-bezier(.2,.8,.2,1)] [transform-style:preserve-3d] motion-reduce:transition-none"
            style={{ transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
          >
            <PhoneShell className="[backface-visibility:hidden]">
              <AppScreen />
            </PhoneShell>
            <PhoneShell className="[backface-visibility:hidden] [transform:rotateY(180deg)]">
              <QrScreen url={url} />
            </PhoneShell>
          </div>
        </button>
      </div>
      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        className="mt-6 inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-medium text-ceda-ink shadow-sm transition-colors hover:border-ceda-orange hover:text-ceda-orange"
      >
        {flipped ? <RotateCcw className="h-4 w-4" /> : <ScanLine className="h-4 w-4" />}
        {flipped ? "Back to the mobile screen" : "Flip for the QR code"}
      </button>
    </div>
  );
}

function PhoneShell({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`absolute inset-0 ${className}`}>
      {/* Side buttons */}
      <span className="absolute -left-[3px] top-[118px] h-8 w-[3px] rounded-l bg-[#2a2f38]" aria-hidden />
      <span className="absolute -left-[3px] top-[164px] h-14 w-[3px] rounded-l bg-[#2a2f38]" aria-hidden />
      <span className="absolute -left-[3px] top-[228px] h-14 w-[3px] rounded-l bg-[#2a2f38]" aria-hidden />
      <span className="absolute -right-[3px] top-[180px] h-20 w-[3px] rounded-r bg-[#2a2f38]" aria-hidden />
      {/* Frame */}
      <div className="h-full w-full rounded-[46px] bg-gradient-to-br from-[#3a404b] via-[#1b1f26] to-[#2c313a] p-[3px] shadow-[0_30px_60px_-20px_rgba(58,42,36,0.35),0_12px_24px_-12px_rgba(0,0,0,0.35)]">
        <div className="h-full w-full rounded-[43px] bg-black p-[9px]">
          <div className="relative h-full w-full overflow-hidden rounded-[35px] bg-[#faf6f2]">
            {/* Dynamic island */}
            <span className="absolute left-1/2 top-[9px] z-20 h-[24px] w-[84px] -translate-x-1/2 rounded-full bg-black" aria-hidden />
            {children}
            {/* Home indicator */}
            <span className="absolute bottom-[7px] left-1/2 z-20 h-[4px] w-[96px] -translate-x-1/2 rounded-full bg-black/80" aria-hidden />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBar({ dark = false }: { dark?: boolean }) {
  const c = dark ? "text-white" : "text-black";
  return (
    <div className={`relative z-10 flex h-[44px] items-center justify-between px-6 pt-1 text-[12px] font-semibold ${c}`}>
      <span>9:41</span>
      <span className="flex items-center gap-1" aria-hidden>
        <svg width="16" height="10" viewBox="0 0 16 10" fill="currentColor"><rect x="0" y="7" width="3" height="3" rx="0.6" /><rect x="4.3" y="5" width="3" height="5" rx="0.6" /><rect x="8.6" y="2.5" width="3" height="7.5" rx="0.6" /><rect x="12.9" y="0" width="3" height="10" rx="0.6" /></svg>
        <svg width="14" height="10" viewBox="0 0 14 10" fill="currentColor"><path d="M7 2.2c2 0 3.8.8 5.1 2l1-1A8.6 8.6 0 0 0 7 .8 8.6 8.6 0 0 0 .9 3.2l1 1A7.2 7.2 0 0 1 7 2.2Zm0 2.9c1.2 0 2.3.5 3.1 1.2l1-1A5.7 5.7 0 0 0 7 3.7c-1.6 0-3 .6-4.1 1.6l1 1C4.7 5.6 5.8 5.1 7 5.1Zm0 2.8c.5 0 .9.2 1.2.5L7 9.6 5.8 8.4c.3-.3.7-.5 1.2-.5Z" /></svg>
        <svg width="24" height="11" viewBox="0 0 24 11" fill="none"><rect x="0.5" y="0.5" width="20" height="10" rx="3" stroke="currentColor" opacity="0.4" /><rect x="2" y="2" width="15" height="7" rx="1.6" fill="currentColor" /><rect x="21.5" y="3.5" width="1.6" height="4" rx="0.8" fill="currentColor" opacity="0.4" /></svg>
      </span>
    </div>
  );
}

const STAGES = ["Submitted", "Review", "Feedback", "Panel", "Award"];

function Tracker({ at }: { at: number }) {
  return (
    <div className="mt-2.5 flex items-center gap-1" aria-hidden>
      {STAGES.map((s, i) => (
        <span key={s} className={`h-1.5 flex-1 rounded-full ${i < at ? "bg-ceda-orange" : i === at ? "bg-ceda-amber" : "bg-slate-200"}`} />
      ))}
    </div>
  );
}

function AppScreen() {
  return (
    <div className="flex h-full flex-col">
      <StatusBar />
      <div className="flex items-center justify-between px-4 pb-2 pt-1">
        <span className="flex items-center gap-1.5">
          <LogoMark className="h-4 w-4" />
          <span className="text-[13px] font-bold text-ceda-ink">CEDA Ideas</span>
        </span>
        <span className="relative">
          <Bell className="h-[18px] w-[18px] text-ceda-ink" />
          <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-ceda-red text-[8px] font-bold text-white">2</span>
        </span>
      </div>

      <div className="flex-1 space-y-2.5 overflow-hidden px-4">
        <div>
          <p className="text-[17px] font-bold leading-tight text-ceda-ink">Dumela, Naledi</p>
          <p className="text-[11px] text-slate-600">1 idea needs your attention</p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-800">Changes requested</p>
          <p className="mt-0.5 text-[12px] font-semibold text-ceda-ink">Mokoro Stories, Okavango</p>
          <p className="mt-0.5 text-[11px] leading-snug text-slate-700">Add a budget breakdown and a letter of intent from a lodge.</p>
          <span className="mt-2 inline-flex items-center gap-1 rounded-lg bg-ceda-ink px-2.5 py-1.5 text-[11px] font-medium text-white">
            <Upload className="h-3 w-3" /> Upload documents
          </span>
        </div>

        <p className="pt-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600">My ideas</p>

        <div className="rounded-2xl bg-white p-3 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-semibold text-ceda-ink">Mokoro Stories</span>
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-semibold text-amber-800">Feedback</span>
          </div>
          <p className="text-[10px] text-slate-600">Creative Industries call · 4 days ago</p>
          <Tracker at={2} />
        </div>

        <div className="rounded-2xl bg-white p-3 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-semibold text-ceda-ink">Sefofu glass tiles</span>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-semibold text-emerald-800">Awarded</span>
          </div>
          <p className="text-[10px] text-slate-600">P320,000 asset finance</p>
          <Tracker at={5} />
        </div>
      </div>

      <nav className="grid grid-cols-4 border-t border-slate-200 bg-white/95 px-2 pb-6 pt-2 text-[9px] font-medium text-slate-600" aria-hidden>
        <span className="flex flex-col items-center gap-0.5 text-ceda-orange"><Home className="h-[18px] w-[18px]" />Home</span>
        <span className="flex flex-col items-center gap-0.5"><Megaphone className="h-[18px] w-[18px]" />Calls</span>
        <span className="flex flex-col items-center gap-0.5"><FileBox className="h-[18px] w-[18px]" />Ideas</span>
        <span className="flex flex-col items-center gap-0.5"><Inbox className="h-[18px] w-[18px]" />Inbox</span>
      </nav>
    </div>
  );
}

function QrScreen({ url }: { url: string }) {
  const [svg, setSvg] = useState("");
  useEffect(() => {
    if (!url) return;
    const qr = qrcode(0, "M");
    qr.addData(url);
    qr.make();
    setSvg(qr.createSvgTag({ cellSize: 5, margin: 0, scalable: true }));
  }, [url]);

  return (
    <div className="flex h-full flex-col bg-gradient-to-b from-ceda-ink via-ceda-brown to-[#221814] text-white">
      <StatusBar dark />
      <div className="flex flex-1 flex-col items-center justify-center px-6 pb-10 text-center">
        <LogoMark className="mb-3 h-7 w-7" />
        <p className="text-[18px] font-bold leading-tight">Scan to get started</p>
        <p className="mt-1 text-[12px] text-white/70">Point your phone camera at the code to create an account.</p>
        <div className="mt-5 rounded-2xl bg-white p-3.5 shadow-lg">
          {svg ? (
            <div className="h-[168px] w-[168px] [&>svg]:h-full [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: svg }} />
          ) : (
            <div className="h-[168px] w-[168px] animate-pulse rounded-lg bg-slate-100" />
          )}
        </div>
        <p className="mt-5 text-[11px] leading-snug text-white/70">
          Then tap <strong className="text-white">Share</strong> or <strong className="text-white">⋮</strong> and choose
          <br />
          <strong className="text-white">Add to Home Screen</strong>.
        </p>
      </div>
    </div>
  );
}
