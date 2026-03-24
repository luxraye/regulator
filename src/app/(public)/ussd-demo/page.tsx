"use client";

import { useState, useRef, useEffect } from "react";
import { Phone, RotateCcw, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface USSDScreen {
  title: string;
  body: string;
  options?: { key: string; label: string; next: string }[];
  input?: { placeholder: string; next: string };
  final?: boolean;
}

const screens: Record<string, USSDScreen> = {
  home: {
    title: "BOCRA Services",
    body: "Welcome to BOCRA\n*123#\n\nSelect an option:",
    options: [
      { key: "1", label: "File a Complaint", next: "provider" },
      { key: "2", label: "Track Complaint", next: "track_input" },
      { key: "3", label: "BOCRA Info", next: "info" },
      { key: "4", label: "Contact Us", next: "contact" },
    ],
  },
  provider: {
    title: "Select Provider",
    body: "Select your service provider:",
    options: [
      { key: "1", label: "Mascom Wireless", next: "category" },
      { key: "2", label: "Orange Botswana", next: "category" },
      { key: "3", label: "BTC", next: "category" },
      { key: "4", label: "BotswanaPost", next: "category" },
      { key: "5", label: "Other", next: "category" },
    ],
  },
  category: {
    title: "Complaint Category",
    body: "What is your complaint about?",
    options: [
      { key: "1", label: "Billing / Charges", next: "describe" },
      { key: "2", label: "Network / Coverage", next: "describe" },
      { key: "3", label: "Service Quality", next: "describe" },
      { key: "4", label: "Privacy / Data", next: "describe" },
      { key: "5", label: "Other", next: "describe" },
    ],
  },
  describe: {
    title: "Describe Issue",
    body: "Briefly describe your complaint:\n(Type your message below)",
    input: { placeholder: "e.g. Charged P50 for unused data", next: "anonymous_choice" },
  },
  anonymous_choice: {
    title: "Identity",
    body: "Would you like to file anonymously?",
    options: [
      { key: "1", label: "Yes, keep me anonymous", next: "confirm" },
      { key: "2", label: "No, include my number", next: "confirm" },
    ],
  },
  confirm: {
    title: "Confirm",
    body: "Your complaint has been recorded.\n\nTracking Code:\nBOCRA-7F2A-91DC\n\nYou will receive an SMS confirmation shortly.\n\nReply 0 for Main Menu.",
    final: true,
  },
  track_input: {
    title: "Track Complaint",
    body: "Enter your tracking code:",
    input: { placeholder: "e.g. BOCRA-7F2A-91DC", next: "track_result" },
  },
  track_result: {
    title: "Complaint Status",
    body: "Tracking: BOCRA-7F2A-91DC\n\nStatus: UNDER REVIEW\nProvider: Mascom Wireless\nCategory: Billing / Charges\nFiled: 20 March 2026\n\nBOCRA is investigating your complaint. Expected response within 14 working days.\n\nReply 0 for Main Menu.",
    final: true,
  },
  info: {
    title: "BOCRA Info",
    body: "BOCRA regulates:\n\n1. Telecommunications\n2. Broadcasting\n3. Postal Services\n4. Internet & ICT\n\nVisit www.bocra.org.bw for more.\n\nReply 0 for Main Menu.",
    final: true,
  },
  contact: {
    title: "Contact BOCRA",
    body: "BOCRA Contact Details:\n\nPhone: +267 395 7755\nEmail: info@bocra.org.bw\nAddress: Plot 206/207\nIndependence Ave, Gaborone\n\nOffice Hours:\nMon-Fri 07:30-16:30\n\nReply 0 for Main Menu.",
    final: true,
  },
};

export default function USSDDemoPage() {
  const [history, setHistory] = useState<string[]>(["home"]);
  const [inputValue, setInputValue] = useState("");
  const [userInputs, setUserInputs] = useState<Record<string, string>>({});
  const inputRef = useRef<HTMLInputElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);

  const currentId = history[history.length - 1];
  const screen = screens[currentId] || screens.home;

  useEffect(() => {
    inputRef.current?.focus();
    screenRef.current?.scrollTo({ top: 0 });
  }, [currentId]);

  function handleSend() {
    const val = inputValue.trim();
    if (!val) return;

    if (val === "0" && screen.final) {
      setHistory(["home"]);
      setInputValue("");
      setUserInputs({});
      return;
    }

    if (screen.options) {
      const match = screen.options.find((o) => o.key === val);
      if (match) {
        setHistory((h) => [...h, match.next]);
        setUserInputs((u) => ({ ...u, [currentId]: match.label }));
      }
    } else if (screen.input) {
      setHistory((h) => [...h, screen.input!.next]);
      setUserInputs((u) => ({ ...u, [currentId]: val }));
    }

    setInputValue("");
  }

  function handleBack() {
    if (history.length > 1) {
      setHistory((h) => h.slice(0, -1));
      setInputValue("");
    }
  }

  function handleReset() {
    setHistory(["home"]);
    setInputValue("");
    setUserInputs({});
  }

  return (
    <div className="min-h-[80vh] bg-bocra-light py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-bocra-navy/10 rounded-full text-bocra-navy text-sm font-medium mb-4">
            <Phone className="w-3.5 h-3.5" />
            Rural Access Concept
          </span>
          <h1 className="text-3xl font-bold text-bocra-navy mb-3">
            USSD Complaint Service
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Not everyone has a smartphone or reliable internet. This concept
            demonstrates how citizens could file and track complaints by simply
            dialing <strong className="text-bocra-navy">*123#</strong> from any
            phone — even a basic feature phone with no data connection.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          {/* Phone simulator */}
          <div className="flex justify-center">
            <div className="w-[280px]">
              {/* Phone frame */}
              <div className="bg-gray-800 rounded-[2.5rem] p-3 shadow-2xl">
                <div className="bg-gray-900 rounded-[2rem] overflow-hidden">
                  {/* Status bar */}
                  <div className="bg-gray-900 px-5 pt-3 pb-1 flex items-center justify-between">
                    <span className="text-white text-[11px]">9:41</span>
                    <div className="flex gap-1 items-center">
                      <div className="w-4 h-2.5 border border-white/40 rounded-sm">
                        <div className="w-2/3 h-full bg-white/40 rounded-sm" />
                      </div>
                    </div>
                  </div>

                  {/* USSD dialog */}
                  <div className="bg-white mx-3 mt-2 rounded-xl overflow-hidden shadow-lg">
                    {/* Header */}
                    <div className="bg-bocra-navy px-4 py-2.5 flex items-center gap-2">
                      {history.length > 1 && (
                        <button onClick={handleBack} className="text-white/70 hover:text-white">
                          <ArrowLeft className="w-4 h-4" />
                        </button>
                      )}
                      <span className="text-white text-xs font-medium flex-1">{screen.title}</span>
                      <button onClick={handleReset} className="text-white/50 hover:text-white">
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Body */}
                    <div ref={screenRef} className="p-4 min-h-[260px] max-h-[300px] overflow-y-auto">
                      <pre className="text-[12px] text-gray-800 font-sans whitespace-pre-wrap leading-relaxed">
                        {screen.body}
                      </pre>

                      {screen.options && (
                        <div className="mt-3 space-y-1">
                          {screen.options.map((opt) => (
                            <button
                              key={opt.key}
                              onClick={() => {
                                setInputValue(opt.key);
                                setTimeout(() => handleSend(), 0);
                              }}
                              className="w-full text-left px-3 py-2 rounded-lg text-[12px] hover:bg-bocra-light active:bg-bocra-light/80 transition-colors flex items-center gap-2"
                            >
                              <span className="w-5 h-5 rounded-full bg-bocra-navy text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                                {opt.key}
                              </span>
                              <span className="text-gray-700">{opt.label}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {screen.final && (
                        <button
                          onClick={handleReset}
                          className="mt-4 w-full py-2 bg-bocra-navy text-white rounded-lg text-[11px] font-medium"
                        >
                          Main Menu (0)
                        </button>
                      )}
                    </div>

                    {/* Input */}
                    {!screen.final && (
                      <div className="border-t border-gray-200 px-3 py-2 flex gap-2">
                        <input
                          ref={inputRef}
                          type="text"
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleSend()}
                          placeholder={screen.input?.placeholder || "Enter option..."}
                          className="flex-1 text-[12px] px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:border-bocra-blue"
                        />
                        <button
                          onClick={handleSend}
                          className="px-3 py-1.5 bg-bocra-blue text-white text-[11px] font-medium rounded-lg"
                        >
                          Send
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Phone bottom space */}
                  <div className="h-8 bg-gray-900 flex items-center justify-center">
                    <div className="w-20 h-1 bg-white/20 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Explanation */}
          <div>
            <h2 className="text-xl font-bold text-bocra-navy mb-4">
              How It Would Work
            </h2>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-bocra-blue text-white flex items-center justify-center text-sm font-bold shrink-0">
                  1
                </div>
                <div>
                  <p className="font-medium text-bocra-navy text-sm">Citizen dials *123#</p>
                  <p className="text-xs text-muted-foreground">
                    Works on any phone — no smartphone, no data, no app needed.
                    The USSD session runs over the cellular network itself.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-bocra-blue text-white flex items-center justify-center text-sm font-bold shrink-0">
                  2
                </div>
                <div>
                  <p className="font-medium text-bocra-navy text-sm">Navigate the menu</p>
                  <p className="text-xs text-muted-foreground">
                    Simple numbered menus guide the user through filing or
                    tracking a complaint. No typing URLs or downloading apps.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-bocra-blue text-white flex items-center justify-center text-sm font-bold shrink-0">
                  3
                </div>
                <div>
                  <p className="font-medium text-bocra-navy text-sm">Describe the issue</p>
                  <p className="text-xs text-muted-foreground">
                    The citizen selects the provider, category, and types a
                    brief description — all via the USSD text interface.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-bocra-green text-white flex items-center justify-center text-sm font-bold shrink-0">
                  4
                </div>
                <div>
                  <p className="font-medium text-bocra-navy text-sm">Receive tracking code via SMS</p>
                  <p className="text-xs text-muted-foreground">
                    A unique tracking code is sent by SMS. The citizen can
                    check status anytime by dialing *123# again and selecting
                    &quot;Track Complaint.&quot;
                  </p>
                </div>
              </div>
            </div>

            {/* Tech note */}
            <div className="mt-8 p-4 bg-white rounded-xl border border-border">
              <h3 className="text-sm font-semibold text-bocra-navy mb-2">
                Technical Architecture
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                In production, this would integrate with a USSD gateway provider
                (e.g., Africa&apos;s Talking, Infobip, or direct MNO
                integration with Mascom/Orange/BTC). The gateway sends HTTP
                callbacks to our API, which processes the session state and
                feeds complaints into the same database used by the web
                platform. SMS confirmations are sent via the same gateway.
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed mt-2">
                This means a complaint filed via USSD from a village in
                Kgalagadi appears in the same BOCRA admin dashboard as one
                filed online from Gaborone — <strong className="text-bocra-navy">one system, equal access</strong>.
              </p>
            </div>

            {/* Links */}
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/complaints"
                className="px-4 py-2 bg-bocra-navy text-white rounded-lg text-sm font-medium hover:bg-bocra-navy/90 transition-colors"
              >
                File a Complaint Online
              </Link>
              <Link
                href="/"
                className="px-4 py-2 bg-bocra-light text-bocra-navy rounded-lg text-sm font-medium hover:bg-bocra-light/80 border border-border transition-colors"
              >
                Back to Homepage
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
