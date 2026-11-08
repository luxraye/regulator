"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, HelpCircle, Search, X } from "lucide-react";

interface Item { title: string; description: string; href: string; tags: string[]; kind: "Page" | "Help" }

const ITEMS: Item[] = [
  { kind: "Page", title: "Open calls", description: "Funding calls you can apply to now", href: "/calls", tags: ["apply", "funding", "grant", "call", "challenge"] },
  { kind: "Page", title: "Am I eligible?", description: "Check the age, citizenship and ownership rules", href: "/eligibility", tags: ["eligible", "age", "youth", "omang", "shareholding", "35"] },
  { kind: "Page", title: "Track my idea", description: "See where an application is, using its reference", href: "/track", tags: ["status", "reference", "track", "progress"] },
  { kind: "Page", title: "Create an account", description: "Register as an innovator", href: "/register", tags: ["register", "sign up", "account"] },
  { kind: "Page", title: "Sign in", description: "Innovators, evaluators, panel and CEDA staff", href: "/login", tags: ["login", "sign in", "password"] },
  { kind: "Page", title: "Privacy notice", description: "How your data is used under the Data Protection Act 2024", href: "/privacy", tags: ["privacy", "data", "protection", "consent", "dpa"] },
  { kind: "Page", title: "About the portal", description: "CEDA's innovation programme and how judging works", href: "/about", tags: ["about", "ceda", "judging", "criteria"] },
  { kind: "Page", title: "USSD and SMS", description: "Check status without data on *161#", href: "/ussd-demo", tags: ["ussd", "sms", "offline", "rural", "no data"] },
  { kind: "Help", title: "How are ideas scored?", description: "Independent evaluators score 1–5 on weighted criteria, shown on every call", href: "/about#judging", tags: ["score", "criteria", "weight", "evaluator"] },
  { kind: "Help", title: "What documents do I need?", description: "A pitch deck and your CIPA certificate; a budget is optional", href: "/calls", tags: ["documents", "cipa", "pitch deck", "budget", "upload"] },
  { kind: "Help", title: "Can I change my idea after submitting?", description: "Only if CEDA asks for changes; then you edit and resubmit", href: "/#how-it-works", tags: ["edit", "change", "resubmit", "feedback"] },
  { kind: "Help", title: "What is the receipt?", description: "A signed record of exactly what you submitted, and when", href: "/about#integrity", tags: ["receipt", "proof", "hash", "signature"] },
];

function search(q: string) {
  const s = q.trim().toLowerCase();
  if (!s) return ITEMS.filter((i) => i.kind === "Page").slice(0, 6);
  return ITEMS.filter((i) => [i.title, i.description, ...i.tags].join(" ").toLowerCase().includes(s));
}

export function SearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [sel, setSel] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const results = useMemo(() => search(query), [query]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);
  useEffect(() => setSel(0), [query]);

  function go(i: Item) {
    onClose();
    router.push(i.href);
  }

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center bg-black/50 p-4 pt-[12vh]" onClick={onClose}>
      <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-white text-foreground shadow-2xl" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Search">
        <div className="flex items-center gap-3 border-b border-border px-4">
          <Search size={18} className="text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") onClose();
              if (e.key === "ArrowDown") { e.preventDefault(); setSel((x) => Math.min(x + 1, results.length - 1)); }
              if (e.key === "ArrowUp") { e.preventDefault(); setSel((x) => Math.max(x - 1, 0)); }
              if (e.key === "Enter" && results[sel]) go(results[sel]);
            }}
            placeholder="Search calls, eligibility, help…"
            className="h-14 flex-1 bg-transparent text-sm outline-none"
          />
          <button onClick={onClose} aria-label="Close search"><X size={18} className="text-muted-foreground" /></button>
        </div>
        <ul className="max-h-[50vh] overflow-y-auto p-2">
          {results.length === 0 && <li className="px-3 py-8 text-center text-sm text-muted-foreground">Nothing found for &ldquo;{query}&rdquo;</li>}
          {results.map((r, i) => (
            <li key={r.title}>
              <button onMouseEnter={() => setSel(i)} onClick={() => go(r)} className={`flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left ${i === sel ? "bg-ceda-sand" : ""}`}>
                {r.kind === "Help" ? <HelpCircle size={16} className="mt-0.5 text-ceda-green" /> : <ArrowRight size={16} className="mt-0.5 text-ceda-orange" />}
                <span>
                  <span className="block text-sm font-medium text-ceda-ink">{r.title}</span>
                  <span className="block text-xs text-muted-foreground">{r.description}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function SearchTrigger() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return (
    <>
      <button onClick={() => setOpen(true)} className="rounded-md p-2 transition-colors hover:bg-white/10" aria-label="Search">
        <Search size={18} />
      </button>
      <SearchModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
