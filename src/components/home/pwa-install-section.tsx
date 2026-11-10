"use client";

import { Smartphone, Check, Share2, Phone } from "lucide-react";
import { PhoneFlipCard } from "@/components/home/phone-flip-card";
import Link from "next/link";

export function PWAInstallSection() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: info */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-ceda-orange/10 rounded-full text-ceda-orange text-sm font-medium mb-4">
              <Smartphone className="w-3.5 h-3.5" />
              Mobile App
            </div>
            <h2 className="text-3xl font-bold text-ceda-ink mb-4">
              Apply from your phone
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Most young Batswana are online on a phone, not a laptop. Install the portal to draft your idea,
              upload your pitch deck and get status alerts. No app store and little data needed.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-medium text-sm text-ceda-ink">Works offline</p>
                  <p className="text-xs text-muted-foreground">
                    The app shell loads instantly, even on slow connections
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-medium text-sm text-ceda-ink">Full-screen experience</p>
                  <p className="text-xs text-muted-foreground">
                    Opens like a native app — no browser toolbar
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-medium text-sm text-ceda-ink">Always up to date</p>
                  <p className="text-xs text-muted-foreground">
                    No manual updates — always the latest version
                  </p>
                </div>
              </div>
            </div>

            {/* Install instructions */}
            <div className="mt-8 p-4 bg-ceda-sand rounded-xl">
              <p className="text-sm font-medium text-ceda-ink mb-2 flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                How to install
              </p>
              <ol className="text-xs text-muted-foreground space-y-1.5 list-decimal list-inside">
                <li>Open this website in <strong className="text-ceda-ink">Chrome</strong> or <strong className="text-ceda-ink">Safari</strong> on your phone</li>
                <li>Tap the menu (three dots) or share button</li>
                <li>Select <strong className="text-ceda-ink">&quot;Add to Home Screen&quot;</strong></li>
                <li>The CEDA Ideas icon will appear on your home screen</li>
              </ol>
            </div>
          </div>

          {/* Right: phone that flips over to the QR code */}
          <PhoneFlipCard />
        </div>

        {/* Rural access banner */}
        <div className="mt-10 p-5 bg-ceda-sand rounded-2xl border border-border flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <div className="w-12 h-12 rounded-xl bg-ceda-ink text-white flex items-center justify-center shrink-0">
            <Phone className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-ceda-ink text-sm">No smartphone? No internet?</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Dial <strong className="text-ceda-ink">*161#</strong> from any phone to check eligibility, hear about open calls and track
              an application by reference, with SMS alerts at every stage. Works on a basic phone with no data.
            </p>
          </div>
          <Link
            href="/ussd-demo"
            className="px-4 py-2 bg-ceda-ink text-white rounded-lg text-sm font-medium hover:bg-ceda-ink/90 transition-colors shrink-0"
          >
            See How It Works
          </Link>
        </div>
      </div>
    </section>
  );
}
