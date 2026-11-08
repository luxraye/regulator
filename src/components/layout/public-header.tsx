"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Menu, X, Globe2 } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/components/providers/language-provider";
import { SearchTrigger } from "@/components/layout/search-modal";
import { Logo } from "@/components/brand/logo";
import type { TranslationKey } from "@/lib/translations";

const navLinks: { href: string; key: TranslationKey }[] = [
  { href: "/calls", key: "nav.calls" },
  { href: "/#how-it-works", key: "nav.how" },
  { href: "/eligibility", key: "nav.eligibility" },
  { href: "/track", key: "nav.track" },
  { href: "/about", key: "nav.about" },
];

export function PublicHeader() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { locale, setLocale, t } = useLanguage();
  const dashboardHref = session?.user ? "/dashboard" : "/login";

  return (
    <header className="fold-bottom sticky top-0 z-50 bg-ceda-navy/95 text-white backdrop-blur">
      <div className="border-b border-white/10">
        <div className="mx-auto flex h-8 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <span className="truncate text-xs text-white/50">Citizen Entrepreneurial Development Agency · Botswana</span>
          <div className="flex items-center gap-3 text-xs text-white/50">
            <button
              onClick={() => setLocale(locale === "en" ? "tn" : "en")}
              className="flex items-center gap-1 font-medium transition-colors hover:text-white"
              aria-label="Toggle language"
            >
              <Globe2 className="h-3 w-3" />
              {t("nav.language")}
            </button>
            <span className="hidden text-white/20 sm:inline">|</span>
            <Link href="/ussd-demo" className="hidden transition-colors hover:text-white sm:inline">No data? Dial *161#</Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <Link href="/" aria-label="CEDA Innovation Portal home">
            <Logo tone="light" sub={false} />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-white/10">
                {t(link.key)}
              </Link>
            ))}
            <SearchTrigger />
            <Link href={dashboardHref} className="ml-2 rounded-md bg-ceda-blue px-4 py-2 text-sm font-medium transition-colors hover:bg-ceda-blue/80">
              {session ? t("nav.dashboard") : t("nav.signin")}
            </Link>
          </nav>

          <div className="flex items-center gap-1 lg:hidden">
            <SearchTrigger />
            <button className="rounded-md p-2 hover:bg-white/10" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu" aria-expanded={mobileOpen}>
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <nav className="space-y-1 pb-4 lg:hidden">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-white/10" onClick={() => setMobileOpen(false)}>
                {t(link.key)}
              </Link>
            ))}
            <Link href={dashboardHref} className="mt-2 block rounded-md bg-ceda-blue px-3 py-2 text-sm font-medium" onClick={() => setMobileOpen(false)}>
              {session ? t("nav.dashboard") : t("nav.signin")}
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
