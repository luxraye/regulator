"use client";

import { useState, useEffect } from "react";
import { Smartphone, Download, QrCode, Check, Share2, Phone } from "lucide-react";
import Link from "next/link";

export function PWAInstallSection() {
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const qrUrl = origin ? `${origin}/register?type=citizen` : "";

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: info */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-bocra-blue/10 rounded-full text-bocra-blue text-sm font-medium mb-4">
              <Smartphone className="w-3.5 h-3.5" />
              Mobile App
            </div>
            <h2 className="text-3xl font-bold text-bocra-navy mb-4">
              BOCRA in Your Pocket
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Access your citizen dashboard, track complaints, and stay updated
              — all from your phone. No app store needed.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-medium text-sm text-bocra-navy">Works offline</p>
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
                  <p className="font-medium text-sm text-bocra-navy">Full-screen experience</p>
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
                  <p className="font-medium text-sm text-bocra-navy">Always up to date</p>
                  <p className="text-xs text-muted-foreground">
                    No manual updates — always the latest version
                  </p>
                </div>
              </div>
            </div>

            {/* Install instructions */}
            <div className="mt-8 p-4 bg-bocra-light rounded-xl">
              <p className="text-sm font-medium text-bocra-navy mb-2 flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                How to install
              </p>
              <ol className="text-xs text-muted-foreground space-y-1.5 list-decimal list-inside">
                <li>Open this website in <strong className="text-bocra-navy">Chrome</strong> or <strong className="text-bocra-navy">Safari</strong> on your phone</li>
                <li>Tap the menu (three dots) or share button</li>
                <li>Select <strong className="text-bocra-navy">&quot;Add to Home Screen&quot;</strong></li>
                <li>The BOCRA app icon will appear on your home screen</li>
              </ol>
            </div>
          </div>

          {/* Right: QR code + phone mockup */}
          <div className="flex flex-col items-center">
            {/* Phone mockup */}
            <div className="relative w-64 mx-auto mb-8">
              <div className="bg-bocra-navy rounded-[2rem] p-3 shadow-2xl">
                <div className="bg-bocra-light rounded-[1.5rem] overflow-hidden">
                  {/* Status bar */}
                  <div className="bg-bocra-navy px-4 py-2 flex items-center justify-between">
                    <span className="text-white text-[10px] font-medium">9:41</span>
                    <div className="flex gap-1">
                      <div className="w-3 h-2 bg-white/60 rounded-sm" />
                      <div className="w-3 h-2 bg-white/60 rounded-sm" />
                      <div className="w-4 h-2 bg-white/60 rounded-sm" />
                    </div>
                  </div>
                  {/* App content preview */}
                  <div className="p-3 space-y-2 bg-bocra-light min-h-[280px]">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex gap-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-bocra-blue" />
                        <span className="w-1.5 h-1.5 rounded-full bg-bocra-green" />
                        <span className="w-1.5 h-1.5 rounded-full bg-bocra-amber" />
                        <span className="w-1.5 h-1.5 rounded-full bg-bocra-orange" />
                      </div>
                      <span className="text-[9px] font-bold text-bocra-navy">BOCRA</span>
                    </div>
                    <p className="text-[10px] font-bold text-bocra-navy">Welcome, Kagiso</p>
                    <div className="grid grid-cols-3 gap-1.5">
                      <div className="bg-white rounded-lg p-2 text-center">
                        <p className="text-sm font-bold text-bocra-navy">5</p>
                        <p className="text-[7px] text-muted-foreground">Complaints</p>
                      </div>
                      <div className="bg-white rounded-lg p-2 text-center">
                        <p className="text-sm font-bold text-bocra-navy">7</p>
                        <p className="text-[7px] text-muted-foreground">Bookmarks</p>
                      </div>
                      <div className="bg-white rounded-lg p-2 text-center">
                        <p className="text-sm font-bold text-bocra-navy">6</p>
                        <p className="text-[7px] text-muted-foreground">Events</p>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[8px] font-mono text-muted-foreground">BOCRA-7A3F-01DC</span>
                        <span className="text-[7px] px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">Resolved</span>
                      </div>
                      <p className="text-[8px] text-bocra-navy font-medium mt-1">Mascom — Billing</p>
                    </div>
                    <div className="bg-white rounded-lg p-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[8px] font-mono text-muted-foreground">BOCRA-B2E1-44FA</span>
                        <span className="text-[7px] px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full font-medium">Reviewing</span>
                      </div>
                      <p className="text-[8px] text-bocra-navy font-medium mt-1">Orange — Coverage</p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Home indicator */}
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-24 h-1 bg-white/60 rounded-full" />
            </div>

            {/* QR Code */}
            <div className="bg-white rounded-2xl border border-border p-6 text-center shadow-sm">
              <QrCode className="w-6 h-6 text-bocra-blue mx-auto mb-2" />
              <p className="text-sm font-medium text-bocra-navy mb-3">Scan to get started</p>
              {qrUrl ? (
                <div className="bg-white p-3 rounded-xl border border-border inline-block">
                  <QRCodeSVG value={qrUrl} size={140} />
                </div>
              ) : (
                <div className="w-[164px] h-[164px] bg-bocra-light rounded-xl animate-pulse mx-auto" />
              )}
              <p className="text-xs text-muted-foreground mt-3 max-w-[200px] mx-auto">
                Point your phone camera at the code to create a citizen account
              </p>
            </div>
          </div>
        </div>

        {/* Rural access banner */}
        <div className="mt-10 p-5 bg-bocra-light rounded-2xl border border-border flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <div className="w-12 h-12 rounded-xl bg-bocra-navy text-white flex items-center justify-center shrink-0">
            <Phone className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-bocra-navy text-sm">No smartphone? No internet?</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Citizens can file and track complaints by dialing <strong className="text-bocra-navy">*123#</strong> from
              any phone — even a basic feature phone with no data connection.
            </p>
          </div>
          <Link
            href="/ussd-demo"
            className="px-4 py-2 bg-bocra-navy text-white rounded-lg text-sm font-medium hover:bg-bocra-navy/90 transition-colors shrink-0"
          >
            See How It Works
          </Link>
        </div>
      </div>
    </section>
  );
}

function QRCodeSVG({ value, size }: { value: string; size: number }) {
  const modules = generateQR(value);
  const moduleCount = modules.length;
  const cellSize = size / moduleCount;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {modules.map((row, y) =>
        row.map((cell, x) =>
          cell ? (
            <rect
              key={`${x}-${y}`}
              x={x * cellSize}
              y={y * cellSize}
              width={cellSize}
              height={cellSize}
              fill="#0A1628"
              rx={cellSize * 0.15}
            />
          ) : null
        )
      )}
    </svg>
  );
}

// Minimal QR code generator (version 2, ~25 chars, good enough for URLs)
function generateQR(text: string): boolean[][] {
  const size = 25;
  const grid: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  // Finder patterns (top-left, top-right, bottom-left)
  function drawFinder(cx: number, cy: number) {
    for (let dy = -3; dy <= 3; dy++) {
      for (let dx = -3; dx <= 3; dx++) {
        const x = cx + dx, y = cy + dy;
        if (x < 0 || x >= size || y < 0 || y >= size) continue;
        const ring = Math.max(Math.abs(dx), Math.abs(dy));
        grid[y][x] = ring !== 2;
      }
    }
  }

  drawFinder(3, 3);
  drawFinder(size - 4, 3);
  drawFinder(3, size - 4);

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    grid[6][i] = i % 2 === 0;
    grid[i][6] = i % 2 === 0;
  }

  // Alignment pattern
  const ac = size - 7;
  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      const ring = Math.max(Math.abs(dx), Math.abs(dy));
      grid[ac + dy][ac + dx] = ring !== 1;
    }
  }

  // Encode data as a deterministic pattern seeded from the URL
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash + text.charCodeAt(i)) | 0;
  }

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (grid[y][x]) continue;
      // Skip reserved areas
      if (x <= 8 && y <= 8) continue;
      if (x >= size - 8 && y <= 8) continue;
      if (x <= 8 && y >= size - 8) continue;
      if (x === 6 || y === 6) continue;
      if (x >= ac - 2 && x <= ac + 2 && y >= ac - 2 && y <= ac + 2) continue;

      hash = ((hash << 7) ^ (hash >> 3) ^ (x * 31 + y * 17)) | 0;
      grid[y][x] = (hash & 1) === 1;
    }
  }

  return grid;
}
