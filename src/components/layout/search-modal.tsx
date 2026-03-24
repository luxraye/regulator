"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  X,
  ExternalLink,
  ArrowRight,
  FileText,
  Shield,
  Globe,
  Users,
  Briefcase,
  Scale,
  HelpCircle,
  MessageSquareWarning,
  Phone,
  Command,
} from "lucide-react";
import { searchItems, type SearchItem } from "@/lib/search-index";

const categoryIcons: Record<string, React.ReactNode> = {
  Pages: <ArrowRight className="w-3.5 h-3.5" />,
  Mandate: <Shield className="w-3.5 h-3.5" />,
  Compliance: <FileText className="w-3.5 h-3.5" />,
  "News & Media": <Globe className="w-3.5 h-3.5" />,
  Documents: <FileText className="w-3.5 h-3.5" />,
  Legislation: <Scale className="w-3.5 h-3.5" />,
  Tenders: <Briefcase className="w-3.5 h-3.5" />,
  "About BOCRA": <Users className="w-3.5 h-3.5" />,
  Careers: <Users className="w-3.5 h-3.5" />,
  Projects: <Globe className="w-3.5 h-3.5" />,
  Portals: <Globe className="w-3.5 h-3.5" />,
  Help: <HelpCircle className="w-3.5 h-3.5" />,
  Providers: <MessageSquareWarning className="w-3.5 h-3.5" />,
};

const categoryColors: Record<string, string> = {
  Pages: "bg-bocra-blue/10 text-bocra-blue",
  Mandate: "bg-bocra-navy/10 text-bocra-navy",
  Compliance: "bg-green-50 text-green-600",
  "News & Media": "bg-blue-50 text-blue-600",
  Documents: "bg-green-50 text-green-600",
  Legislation: "bg-purple-50 text-purple-600",
  Tenders: "bg-amber-50 text-amber-600",
  "About BOCRA": "bg-slate-50 text-slate-600",
  Careers: "bg-rose-50 text-rose-600",
  Projects: "bg-teal-50 text-teal-600",
  Portals: "bg-indigo-50 text-indigo-600",
  Help: "bg-cyan-50 text-cyan-600",
  Providers: "bg-red-50 text-red-600",
};

const popularSearches = [
  "file complaint",
  "mascom",
  "licence",
  "tariff",
  "annual report",
  "tenders",
  "vacancies",
  ".bw domain",
];

export function SearchModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (open) {
      setQuery("");
      setResults([]);
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    const r = searchItems(query);
    setResults(r);
    setSelectedIndex(0);
  }, [query]);

  const navigate = useCallback(
    (item: SearchItem) => {
      onClose();
      if (item.external) {
        window.open(item.href, "_blank", "noopener,noreferrer");
      } else {
        router.push(item.href);
      }
    },
    [onClose, router]
  );

  useEffect(() => {
    if (!open) return;

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && results[selectedIndex]) {
        navigate(results[selectedIndex]);
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose, results, selectedIndex, navigate]);

  // Scroll selected into view
  useEffect(() => {
    const el = resultsRef.current?.querySelector(`[data-index="${selectedIndex}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  if (!open) return null;

  const grouped = results.reduce<Record<string, SearchItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  let flatIndex = -1;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative max-w-2xl mx-auto mt-[10vh] mx-4">
        <div className="bg-white rounded-2xl shadow-2xl border border-border overflow-hidden">
          {/* Search input */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
            <Search className="w-5 h-5 text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search BOCRA services, documents, legislation..."
              className="flex-1 text-base outline-none placeholder:text-muted-foreground/60"
              autoComplete="off"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="p-1 hover:bg-bocra-light rounded-md"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
            <kbd className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] text-muted-foreground bg-bocra-light rounded border border-border font-mono">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div
            ref={resultsRef}
            className="max-h-[60vh] overflow-y-auto"
          >
            {query.trim() === "" ? (
              <div className="p-5">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-3">
                  Popular Searches
                </p>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((term) => (
                    <button
                      key={term}
                      onClick={() => setQuery(term)}
                      className="px-3 py-1.5 bg-bocra-light text-bocra-navy text-sm rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
                <div className="mt-6 pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    Search across {70}+ pages, documents, legislation, portals, and services.
                    Use <kbd className="px-1 py-0.5 bg-bocra-light rounded text-[10px] font-mono">Ctrl+K</kbd> to
                    open search from anywhere.
                  </p>
                </div>
              </div>
            ) : results.length === 0 ? (
              <div className="p-10 text-center">
                <Search className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm font-medium text-bocra-navy">
                  No results for &ldquo;{query}&rdquo;
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Try a different search term or{" "}
                  <button
                    onClick={() => {
                      onClose();
                      router.push("/legacy");
                    }}
                    className="text-bocra-blue hover:underline"
                  >
                    browse Legacy Services
                  </button>
                </p>
              </div>
            ) : (
              <div className="py-2">
                {Object.entries(grouped).map(([category, items]) => (
                  <div key={category}>
                    <div className="px-5 py-2">
                      <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                        {category}
                      </p>
                    </div>
                    {items.map((item) => {
                      flatIndex++;
                      const idx = flatIndex;
                      const isSelected = idx === selectedIndex;
                      return (
                        <button
                          key={`${item.category}-${item.title}`}
                          data-index={idx}
                          onClick={() => navigate(item)}
                          onMouseEnter={() => setSelectedIndex(idx)}
                          className={`w-full flex items-center gap-3 px-5 py-2.5 text-left transition-colors ${
                            isSelected ? "bg-bocra-light" : "hover:bg-bocra-light/50"
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                              categoryColors[item.category] || "bg-gray-50 text-gray-500"
                            }`}
                          >
                            {categoryIcons[item.category] || <ArrowRight className="w-3.5 h-3.5" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-bocra-navy truncate">
                              {item.title}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {item.description}
                            </p>
                          </div>
                          {item.external ? (
                            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          ) : (
                            <ArrowRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}
                <div className="px-5 py-3 border-t border-border mt-1">
                  <p className="text-[10px] text-muted-foreground">
                    {results.length} result{results.length !== 1 ? "s" : ""} •
                    Use <kbd className="px-0.5 font-mono">↑</kbd> <kbd className="px-0.5 font-mono">↓</kbd> to
                    navigate, <kbd className="px-0.5 font-mono">Enter</kbd> to select
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function SearchTrigger() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm text-white/70"
        aria-label="Search"
      >
        <Search className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Search</span>
        <kbd className="hidden sm:flex items-center gap-0.5 px-1 py-0.5 text-[9px] text-white/40 bg-white/10 rounded font-mono ml-2">
          <Command className="w-2.5 h-2.5" />K
        </kbd>
      </button>
      <SearchModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
