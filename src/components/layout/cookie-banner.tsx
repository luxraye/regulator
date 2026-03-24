"use client";

import { useState, useEffect } from "react";
import { Cookie, X } from "lucide-react";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("bocra-cookie-consent");
    if (!consent) setVisible(true);
  }, []);

  function handleAccept() {
    localStorage.setItem("bocra-cookie-consent", "accepted");
    setVisible(false);
  }

  function handleReject() {
    localStorage.setItem("bocra-cookie-consent", "rejected");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[60] p-4 animate-in slide-in-from-bottom duration-300">
      <div className="max-w-4xl mx-auto bg-bocra-navy text-white rounded-2xl shadow-2xl border border-white/10 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Cookie className="w-8 h-8 text-bocra-amber shrink-0 hidden sm:block" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">We value your privacy</p>
          <p className="text-xs text-white/60 mt-1 leading-relaxed">
            This site uses cookies to enhance your experience, remember your preferences,
            and support platform functionality. You can choose to accept or reject non-essential cookies.
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
            className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-lg bg-bocra-blue hover:bg-bocra-blue/80 transition-colors"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
