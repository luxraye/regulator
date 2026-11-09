"use client";

import { useState, useEffect } from "react";
import { Cookie } from "lucide-react";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("ceda-cookie-consent");
    if (!consent) setVisible(true);
  }, []);

  function handleAccept() {
    localStorage.setItem("ceda-cookie-consent", "accepted");
    setVisible(false);
  }

  function handleReject() {
    localStorage.setItem("ceda-cookie-consent", "rejected");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-[60] p-4 animate-in slide-in-from-bottom duration-300 md:left-64">
      <div className="pointer-events-auto mx-auto flex max-w-4xl flex-col items-start gap-4 rounded-2xl border border-white/10 bg-ceda-ink p-5 text-white shadow-2xl sm:flex-row sm:items-center">
        <Cookie className="w-8 h-8 text-ceda-amber shrink-0 hidden sm:block" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">We value your privacy</p>
          <p className="text-xs text-white/70 mt-1 leading-relaxed">
            This site uses cookies to enhance your experience, remember your preferences,
            and support platform functionality under Botswana Data Protection Act 2024.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
          <button
            onClick={handleReject}
            className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-lg border border-white/20 hover:bg-white/10 transition-colors"
          >
            Reject All
          </button>
          <button
            onClick={handleAccept}
            className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-lg bg-ceda-orange hover:bg-ceda-orange/90 transition-colors"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
