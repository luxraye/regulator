import React from "react";
import { Info } from "lucide-react";

export function DemoDataBanner({
  message = "Demo data: fictional teams for illustration",
  className = "",
}: {
  message?: string;
  className?: string;
}) {
  return (
    <aside
      role="note"
      aria-label="Demo data disclosure"
      className={`rounded-xl border border-amber-200 bg-amber-50/90 px-4 py-2 text-xs font-medium text-amber-900 flex items-center gap-2 shadow-sm ${className}`}
    >
      <Info size={15} className="text-amber-600 shrink-0" />
      <span>
        <strong className="font-bold">Demo Data:</strong> {message.replace(/^Demo data:\s*/i, "")}
      </span>
    </aside>
  );
}
