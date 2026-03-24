"use client";

import Link from "next/link";
import { useLanguage } from "@/components/providers/language-provider";
import { CheckCircle2, Download, ArrowRight } from "lucide-react";
import { InstanceDeepDive } from "./instance-deep-dive";

export function TranslatedInstanceSection() {
  const { t } = useLanguage();

  const oldItems = [
    t("instance.old.1"),
    t("instance.old.2"),
    t("instance.old.3"),
    t("instance.old.4"),
    t("instance.old.5"),
  ];

  const newItems = [
    t("instance.new.1"),
    t("instance.new.2"),
    t("instance.new.3"),
    t("instance.new.4"),
    t("instance.new.5"),
  ];

  return (
    <section id="how-instances-work" className="py-20 lg:py-28 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block px-3 py-1 rounded-full bg-bocra-blue/10 text-bocra-blue text-sm font-medium mb-4">
            {t("instance.badge")}
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-bocra-navy mb-4">
            {t("instance.title")}
          </h2>
          <p className="text-muted-foreground max-w-3xl mx-auto text-lg leading-relaxed">
            {t("instance.desc")}
          </p>
        </div>

        {/* Before vs After */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <h3 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-red-200 text-red-700 flex items-center justify-center text-xs font-bold">
                &#10005;
              </span>
              {t("instance.old.title")}
            </h3>
            <ul className="space-y-2 text-sm text-red-700">
              {oldItems.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              {t("instance.new.title")}
            </h3>
            <ul className="space-y-2 text-sm text-green-700">
              {newItems.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <InstanceDeepDive />

        <div className="mt-10" />
        <div className="bg-bocra-navy rounded-2xl p-8 text-white">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="max-w-2xl">
              <h3 className="text-2xl font-bold mb-3">Try It Yourself</h3>
              <p className="text-white/80 leading-relaxed">
                Download our sandbox Instance template to understand the process
                before your first real submission. The sandbox includes sample
                fields, validation rules, and file requirements — exactly like
                the real thing, in a safe environment.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Link
                href="/api/sandbox/download"
                className="inline-flex items-center gap-2 px-5 py-3 bg-white text-bocra-navy rounded-lg font-medium hover:bg-white/90 transition-colors text-center justify-center"
              >
                <Download className="w-4 h-4" />
                Download Sandbox
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-5 py-3 bg-bocra-blue rounded-lg font-medium hover:bg-bocra-blue/80 transition-colors text-center justify-center"
              >
                Licensee Portal
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
