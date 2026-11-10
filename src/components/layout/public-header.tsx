"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Menu,
  X,
  Globe2,
  ChevronDown,
  Trophy,
  Sparkles,
  BookOpen,
  Building2,
  Compass,
  ArrowRight,
  CheckCircle2,
  Users,
  Search,
  Layers,
  HelpCircle,
  FileCheck2,
  Radio,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useLanguage } from "@/components/providers/language-provider";
import { Logo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";
import { SearchModal } from "@/components/layout/search-modal";

interface NavItem {
  title: string;
  desc: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

interface NavGroup {
  id: string;
  title: string;
  icon: React.ElementType;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    id: "compete",
    title: "Compete",
    icon: Trophy,
    items: [
      {
        title: "Instances (All Competitions)",
        desc: "Browse CEDA competitions, each with locked, checkable rules",
        href: "/instances",
        icon: Layers,
        badge: "Core",
      },
      {
        title: "Open Calls",
        desc: "Active funding opportunities accepting applications right now",
        href: "/calls",
        icon: Radio,
      },
      {
        title: "Am I Eligible?",
        desc: "30-second citizen youth eligibility checker for 18–35 Batswana",
        href: "/eligibility",
        icon: CheckCircle2,
      },
      {
        title: "Track My Application",
        desc: "Follow your application status with your secret tracking code",
        href: "/track",
        icon: Compass,
      },
    ],
  },
  {
    id: "showcase",
    title: "Showcase",
    icon: Sparkles,
    items: [
      {
        title: "Funded Innovators",
        desc: "Discover verified citizen businesses awarded CEDA funding",
        href: "/funded",
        icon: Trophy,
      },
      {
        title: "Community Forum",
        desc: "Connect, share ideas, and find co-founders across Botswana",
        href: "/community",
        icon: Users,
      },
    ],
  },
  {
    id: "learn",
    title: "Learn",
    icon: BookOpen,
    items: [
      {
        title: "How It Works",
        desc: "The 3 simple steps: Check, Apply, and Follow",
        href: "/#how-it-works",
        icon: CheckCircle2,
      },
      {
        title: "Follow an Idea's Journey",
        desc: "See a living idea go through every step in the platform",
        href: "/journey",
        icon: Compass,
        badge: "New",
      },
      {
        title: "About the Portal",
        desc: "CEDA mandate, judging standards, and economic efficiency",
        href: "/about",
        icon: BookOpen,
      },
      {
        title: "Help, FAQ & Support",
        desc: "Talk with live consultants and browse common questions",
        href: "/support",
        icon: HelpCircle,
      },
    ],
  },
  {
    id: "partners",
    title: "Partners",
    icon: Building2,
    items: [
      {
        title: "Partner Spaces",
        desc: "Explore tailored innovation challenges from BDIH and BTC",
        href: "/instances",
        icon: Building2,
      },
      {
        title: "Run a Competition with CEDA",
        desc: "How enterprises and government launch co-branded calls",
        href: "/support",
        icon: FileCheck2,
      },
    ],
  },
];

export function PublicHeader() {
  const { data: session } = useSession();
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const [expandedMobileGroup, setExpandedMobileGroup] = useState<string | null>("compete");
  const [hidden, setHidden] = useState<boolean>(false);
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const { locale, setLocale } = useLanguage();
  const navRef = useRef<HTMLDivElement>(null);
  const dashboardHref = session?.user ? "/dashboard" : "/login";

  // Hide on scroll down, show on scroll up
  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const currentY = window.scrollY;
      if (currentY < 48) {
        setHidden(false);
      } else if (currentY > lastY + 8) {
        setHidden(true);
        setActiveGroup(null);
      } else if (currentY < lastY - 8) {
        setHidden(false);
      }
      lastY = currentY;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setActiveGroup(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard shortcut Ctrl/Cmd+K to open search
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setActiveGroup(null);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 bg-ceda-ink/95 text-white backdrop-blur transition-transform duration-300 ease-in-out border-b border-white/10",
          hidden && !mobileOpen ? "-translate-y-full" : "translate-y-0"
        )}
      >
        {/* Top utility strip */}
        <div className="border-b border-white/10 bg-black/20 text-[11px] text-white/70">
          <div className="mx-auto flex h-7 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <span className="truncate">
              Citizen Entrepreneurial Development Agency · Republic of Botswana
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setLocale(locale === "en" ? "tn" : "en")}
                className="flex items-center gap-1 font-medium transition-colors hover:text-white"
                aria-label="Toggle Setswana / English language"
              >
                <Globe2 className="h-3 w-3 text-ceda-copper" />
                <span>{locale === "en" ? "Setswana" : "English"}</span>
              </button>
              <span className="hidden text-white/20 sm:inline">|</span>
              <Link
                href="/ussd-demo"
                className="hidden transition-colors hover:text-white sm:inline text-ceda-sand"
              >
                No data? Dial *161#
              </Link>
            </div>
          </div>
        </div>

        {/* Main Navbar Bar */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Left: Brand Logo */}
            <div className="flex items-center gap-6">
              <Link href="/" aria-label="CEDA Innovation Portal Home">
                <Logo tone="light" sub={false} />
              </Link>

              {/* Center: 4 Grouped Menu Cards (Desktop) */}
              <nav ref={navRef} className="hidden lg:flex items-center gap-2" aria-label="Main Navigation">
                {NAV_GROUPS.map((group) => {
                  const Icon = group.icon;
                  const isActive = activeGroup === group.id;

                  return (
                    <div key={group.id} className="relative">
                      <button
                        type="button"
                        onClick={() => setActiveGroup(isActive ? null : group.id)}
                        onMouseEnter={() => setActiveGroup(group.id)}
                        className={cn(
                          "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold tracking-wide transition-all",
                          isActive
                            ? "bg-white text-ceda-ink shadow-md"
                            : "bg-white/5 text-white/90 hover:bg-white/15 hover:text-white"
                        )}
                        aria-expanded={isActive}
                        aria-haspopup="true"
                      >
                        <Icon size={14} className={isActive ? "text-ceda-copper" : "text-white/70"} />
                        <span>{group.title}</span>
                        <ChevronDown
                          size={12}
                          className={cn("transition-transform duration-200 opacity-60", isActive && "rotate-180")}
                        />
                      </button>

                      {/* Dropdown Card */}
                      {isActive && (
                        <div
                          onMouseLeave={() => setActiveGroup(null)}
                          className="absolute left-0 top-full mt-2 w-80 rounded-2xl border border-white/10 bg-white p-2.5 text-ceda-ink shadow-2xl animate-in fade-in zoom-in-95 duration-150 z-50"
                        >
                          <div className="space-y-1">
                            {group.items.map((item) => {
                              const ItemIcon = item.icon;
                              return (
                                <Link
                                  key={item.href + item.title}
                                  href={item.href}
                                  onClick={() => setActiveGroup(null)}
                                  className="group flex items-start gap-3 rounded-xl p-2.5 transition hover:bg-ceda-sand/50"
                                >
                                  <div className="mt-0.5 rounded-lg bg-ceda-sand p-2 text-ceda-copper transition group-hover:bg-ceda-orange group-hover:text-white">
                                    <ItemIcon size={16} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-xs text-ceda-ink group-hover:text-ceda-copper transition">
                                        {item.title}
                                      </span>
                                      {item.badge && (
                                        <span className="rounded-full bg-ceda-copper/10 px-1.5 py-0.2 text-[9px] font-bold text-ceda-copper uppercase tracking-wider">
                                          {item.badge}
                                        </span>
                                      )}
                                    </div>
                                    <p className="mt-0.5 text-[11px] text-ceda-slate leading-normal">
                                      {item.desc}
                                    </p>
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </nav>
            </div>

            {/* Right side controls */}
            <div className="hidden lg:flex items-center gap-2.5">
              {/* Explore / Command Palette Trigger */}
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/80 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-ceda-orange"
                aria-label="Search or explore (Ctrl+K)"
              >
                <Search size={14} className="text-ceda-copper" />
                <span>Search</span>
                <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-mono text-white/60">
                  ⌘K
                </kbd>
              </button>

              {/* Judges' Guided Tour Highlight Chip */}
              <Link
                href="/judges"
                className="flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-gradient-to-r from-amber-500/20 to-orange-500/20 px-3.5 py-1.5 text-xs font-bold text-amber-200 transition hover:bg-amber-400/30 hover:text-white shadow-sm"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
                </span>
                <span>5-Min Judges&apos; Tour</span>
              </Link>

              {/* Sign in / Dashboard CTA */}
              <Link
                href={dashboardHref}
                className="rounded-full bg-ceda-orange px-4 py-1.5 text-xs font-bold text-white shadow transition hover:bg-ceda-copper"
              >
                {session ? "Dashboard" : "Sign in"}
              </Link>
            </div>

            {/* Mobile Hamburger Button */}
            <div className="flex items-center gap-2 lg:hidden">
              <button
                onClick={() => setSearchOpen(true)}
                className="rounded-full p-2 text-white/80 hover:bg-white/10"
                aria-label="Open search"
              >
                <Search size={18} />
              </button>

              <Link
                href="/judges"
                className="rounded-full bg-amber-500/20 border border-amber-400/30 px-2.5 py-1 text-[11px] font-bold text-amber-200"
              >
                Tour
              </Link>

              <button
                className="rounded-lg p-2 text-white hover:bg-white/10"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle mobile menu"
                aria-expanded={mobileOpen}
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Full-Screen Navigation Sheet */}
        {mobileOpen && (
          <div className="lg:hidden fixed inset-x-0 top-[92px] bottom-0 z-50 bg-ceda-ink overflow-y-auto px-4 py-6 border-t border-white/10 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="space-y-3">
              {NAV_GROUPS.map((group) => {
                const Icon = group.icon;
                const isExpanded = expandedMobileGroup === group.id;

                return (
                  <div key={group.id} className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setExpandedMobileGroup(isExpanded ? null : group.id)}
                      className="flex w-full items-center justify-between p-4 text-left font-bold text-sm text-white"
                      aria-expanded={isExpanded}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="rounded-lg bg-ceda-orange/20 p-2 text-ceda-orange">
                          <Icon size={18} />
                        </div>
                        <span>{group.title}</span>
                      </div>
                      <ChevronDown
                        size={16}
                        className={cn("transition-transform duration-200 text-white/60", isExpanded && "rotate-180")}
                      />
                    </button>

                    {isExpanded && (
                      <div className="border-t border-white/10 bg-black/20 p-2 space-y-1">
                        {group.items.map((item) => (
                          <Link
                            key={item.href + item.title}
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            className="flex items-center justify-between rounded-xl p-3 hover:bg-white/10 transition"
                          >
                            <div>
                              <span className="block font-semibold text-xs text-white">{item.title}</span>
                              <span className="block text-[11px] text-white/60 mt-0.5">{item.desc}</span>
                            </div>
                            <ArrowRight size={14} className="text-ceda-copper shrink-0 ml-2" />
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Mobile Actions */}
            <div className="pt-4 space-y-2 border-t border-white/10">
              <Link
                href="/judges"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 rounded-xl border border-amber-400/40 bg-amber-500/20 p-3 text-xs font-bold text-amber-200"
              >
                <span>Take the 3-Minute Judges&apos; Tour</span>
                <ArrowRight size={14} />
              </Link>

              <Link
                href={dashboardHref}
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center rounded-xl bg-ceda-orange p-3 text-xs font-bold text-white shadow"
              >
                {session ? "Open My Dashboard" : "Sign In to Existing Dossier"}
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Global Command Palette / Search Modal */}
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
