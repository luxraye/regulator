"use client";

import { useEffect, useState } from "react";
import qrcode from "qrcode-generator";

/** A QR code that opens an app path on whatever site is serving the page. */
export function QrToPath({ path, className = "" }: { path: string; className?: string }) {
  const [svg, setSvg] = useState("");
  const [url, setUrl] = useState("");
  useEffect(() => {
    const base = process.env.__NEXT_ROUTER_BASEPATH || "";
    const full = window.location.origin + base + path;
    const qr = qrcode(0, "M");
    qr.addData(full);
    qr.make();
    setUrl(full);
    setSvg(qr.createSvgTag({ cellSize: 4, margin: 0, scalable: true }));
  }, [path]);
  return svg ? (
    <div className={`[&>svg]:h-full [&>svg]:w-full ${className}`} title={url} dangerouslySetInnerHTML={{ __html: svg }} />
  ) : (
    <div className={`animate-pulse rounded bg-slate-100 ${className}`} />
  );
}
