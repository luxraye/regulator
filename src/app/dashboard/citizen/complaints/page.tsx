"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageSquareWarning, Plus, Clock, CheckCircle2, Search as SearchIcon, AlertCircle } from "lucide-react";

interface Complaint {
  id: string;
  trackingCode: string;
  provider: string;
  category: string;
  description: string;
  status: string;
  isAnonymous: boolean;
  createdAt: string;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  OPEN: { label: "Open", color: "bg-blue-100 text-blue-700", icon: <Clock className="w-3.5 h-3.5" /> },
  UNDER_REVIEW: { label: "Under Review", color: "bg-amber-100 text-amber-700", icon: <SearchIcon className="w-3.5 h-3.5" /> },
  RESOLVED: { label: "Resolved", color: "bg-green-100 text-green-700", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  CLOSED: { label: "Closed", color: "bg-gray-100 text-gray-600", icon: <AlertCircle className="w-3.5 h-3.5" /> },
};

export default function CitizenComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/complaints/my")
      .then((res) => (res.ok ? res.json() : []))
      .then(setComplaints)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-bocra-navy">My Complaints</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Track the status of complaints you&apos;ve filed with BOCRA
          </p>
        </div>
        <Link
          href="/complaints"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-bocra-navy text-white rounded-lg text-sm font-medium hover:bg-bocra-navy/90 active:scale-[0.98] transition-all w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          File New Complaint
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-16 text-muted-foreground">Loading...</div>
      ) : complaints.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-border">
          <MessageSquareWarning className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium text-bocra-navy">No complaints yet</p>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            When you file a complaint, it will appear here for tracking.
          </p>
          <Link
            href="/complaints"
            className="inline-flex items-center gap-2 px-4 py-2 bg-bocra-blue text-white rounded-lg text-sm font-medium hover:bg-bocra-blue/90 transition-colors"
          >
            File a Complaint
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {complaints.map((c) => {
            const s = statusConfig[c.status] || statusConfig.OPEN;
            return (
              <div
                key={c.id}
                className="bg-white rounded-xl border border-border p-5 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs text-muted-foreground">
                        {c.trackingCode}
                      </span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${s.color}`}>
                        {s.icon}
                        {s.label}
                      </span>
                    </div>
                    <p className="font-medium text-bocra-navy text-sm">
                      {c.provider} — {c.category}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {c.description}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground shrink-0">
                    {new Date(c.createdAt).toLocaleDateString("en-BW", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
