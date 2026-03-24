"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Menu, X, ChevronDown, ExternalLink, Landmark, Globe2, Search } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/components/providers/language-provider";
import { SearchTrigger } from "@/components/layout/search-modal";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About BOCRA" },
  { href: "/licensing", label: "Licensing" },
  { href: "/publications", label: "Publications" },
  { href: "/complaints", label: "Complaints" },
];

const portalLinks = [
  { label: "BOCRA Portal", url: "https://portal.bocra.org.bw" },
  { label: "QOS Monitoring", url: "https://qos.bocra.org.bw" },
  { label: "Licensing Portal", url: "https://licensing.bocra.org.bw" },
  { label: "Type Approval", url: "https://typeapproval.bocra.org.bw" },
  { label: "License Verification", url: "https://licenseverification.bocra.org.bw" },
  { label: "Register .bw", url: "https://nic.net.bw" },
];

export function PublicHeader() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [portalsOpen, setPortalsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { locale, setLocale, t } = useLanguage();

  const dashboardHref = session?.user?.role === "LICENSEE"
    ? "/dashboard/licensee"
    : session?.user?.role === "ADMIN"
    ? "/dashboard/admin"
    : session?.user?.role === "SUPERADMIN"
    ? "/dashboard/superadmin"
    : "/login";

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setPortalsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="bg-bocra-navy text-white sticky top-0 z-50">
      {/* Top utility bar */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-8">
          <span className="text-xs text-white/50">
            Botswana Communications Regulatory Authority
          </span>
          <div className="flex items-center gap-3 text-xs text-white/50">
            <button
              onClick={() => setLocale(locale === "en" ? "tn" : "en")}
              className="flex items-center gap-1 hover:text-white transition-colors font-medium"
              aria-label="Toggle language"
            >
              <Globe2 className="w-3 h-3" />
              {t("nav.language")}
            </button>
            <span className="text-white/20 hidden sm:inline">|</span>
            <a href="tel:+2673957755" className="hover:text-white transition-colors hidden sm:inline">
              +267 395 7755
            </a>
            <span className="text-white/20 hidden sm:inline">|</span>
            <a href="mailto:info@bocra.org.bw" className="hover:text-white transition-colors hidden sm:inline">
              info@bocra.org.bw
            </a>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex gap-1">
              <span className="w-3 h-3 rounded-full bg-bocra-blue" />
              <span className="w-3 h-3 rounded-full bg-bocra-green" />
              <span className="w-3 h-3 rounded-full bg-bocra-amber" />
              <span className="w-3 h-3 rounded-full bg-bocra-orange" />
            </div>
            <span className="font-bold text-lg tracking-tight">BOCRA</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 rounded-md text-sm font-medium hover:bg-white/10 transition-colors"
              >
                {link.label}
              </Link>
            ))}

            {/* Legacy portal link */}
            <Link
              href="/legacy"
              className="px-3 py-2 rounded-md text-sm font-medium hover:bg-white/10 transition-colors flex items-center gap-1.5"
            >
              <Landmark className="w-3.5 h-3.5" />
              Legacy Services
            </Link>

            {/* External portals dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setPortalsOpen(!portalsOpen)}
                className="px-3 py-2 rounded-md text-sm font-medium hover:bg-white/10 transition-colors flex items-center gap-1"
              >
                Portals
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${portalsOpen ? "rotate-180" : ""}`} />
              </button>
              {portalsOpen && (
                <div className="absolute top-full right-0 mt-1 w-56 bg-white text-bocra-navy rounded-lg shadow-xl border border-border overflow-hidden z-50">
                  {portalLinks.map((p) => (
                    <a
                      key={p.label}
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between px-4 py-2.5 text-sm hover:bg-bocra-light transition-colors"
                    >
                      {p.label}
                      <ExternalLink className="w-3 h-3 text-muted-foreground" />
                    </a>
                  ))}
                </div>
              )}
            </div>

            <SearchTrigger />

            <Link
              href={dashboardHref}
              className="ml-2 px-4 py-2 bg-bocra-blue rounded-md text-sm font-medium hover:bg-bocra-blue/80 transition-colors"
            >
              {session ? "Dashboard" : "Sign In"}
            </Link>
          </nav>

          <div className="lg:hidden flex items-center gap-1">
            <SearchTrigger />
            <button
              className="p-2 rounded-md hover:bg-white/10"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <nav className="lg:hidden pb-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-white/10"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/legacy"
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium hover:bg-white/10"
              onClick={() => setMobileOpen(false)}
            >
              <Landmark className="w-3.5 h-3.5" />
              Legacy Services
            </Link>
            <div className="border-t border-white/10 pt-2 mt-2">
              <p className="px-3 py-1 text-xs text-white/40 uppercase tracking-wider">
                External Portals
              </p>
              {portalLinks.map((p) => (
                <a
                  key={p.label}
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium hover:bg-white/10"
                  onClick={() => setMobileOpen(false)}
                >
                  {p.label}
                  <ExternalLink className="w-3 h-3 text-white/40" />
                </a>
              ))}
            </div>
            <Link
              href={dashboardHref}
              className="block px-3 py-2 bg-bocra-blue rounded-md text-sm font-medium mt-2"
              onClick={() => setMobileOpen(false)}
            >
              {session ? "Dashboard" : "Sign In"}
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
