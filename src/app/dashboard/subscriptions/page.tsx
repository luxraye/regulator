"use client";

import { useEffect, useState } from "react";
import { Bell, Mail, Smartphone, Trash2, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

interface SubscriptionItem {
  id: string;
  channel: "EMAIL" | "SMS" | "IN_APP";
  active: boolean;
  createdAt: string;
  instance?: { id: string; name: string; slug: string } | null;
  entry?: { id: string; title: string; referenceCode: string } | null;
}

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [unsubscribingId, setUnsubscribingId] = useState<string | null>(null);

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/subscriptions");
      if (res.ok) {
        const data = await res.json();
        setSubscriptions(data.subscriptions || []);
      }
    } catch (err) {
      console.error("Failed to load subscriptions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const handleUnsubscribe = async (id: string) => {
    setUnsubscribingId(id);
    try {
      const res = await fetch(`/api/subscriptions/${id}`, { method: "DELETE" });
      if (res.ok) {
        setSubscriptions((prev) => prev.filter((s) => s.id !== id));
      }
    } catch (err) {
      console.error("Failed to unsubscribe:", err);
    } finally {
      setUnsubscribingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="border-b border-border pb-5">
        <div className="flex items-center gap-2 text-xs text-ceda-slate">
          <span>Innovator Profile</span>
          <span>•</span>
          <span className="font-semibold text-ceda-copper">Notifications</span>
        </div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-ceda-ink sm:text-3xl">
          Free Alert Subscriptions
        </h1>
        <p className="mt-1 text-xs text-ceda-slate sm:text-sm">
          Receive real-time notifications for competition stage changes, clarification updates, upcoming submission deadlines, and dossier decisions.
        </p>
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 size={24} className="animate-spin text-ceda-orange" />
        </div>
      ) : subscriptions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-white p-12 text-center space-y-3">
          <Bell size={32} className="mx-auto text-ceda-slate" />
          <h3 className="font-bold text-ceda-ink">No active alert subscriptions</h3>
          <p className="text-xs text-ceda-slate max-w-md mx-auto">
            You can subscribe to deadline reminders directly from any competition page or proposal dossier.
          </p>
          <div className="pt-2">
            <Link
              href="/instances"
              className="inline-flex items-center gap-2 rounded-xl bg-ceda-ink px-4 py-2 text-xs font-bold text-white shadow hover:bg-black transition"
            >
              <span>Explore Competitions to Subscribe</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-ceda-slate border-b border-border">
                <tr>
                  <th className="px-5 py-3 font-semibold">Alert Subject</th>
                  <th className="px-5 py-3 font-semibold">Channel</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Subscribed Since</th>
                  <th className="px-5 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {subscriptions.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-5 py-3.5">
                      {s.instance && (
                        <div>
                          <span className="font-bold text-ceda-ink text-sm block">{s.instance.name}</span>
                          <span className="text-[11px] text-ceda-slate font-mono">Competition Reminders & Stage Gates</span>
                        </div>
                      )}
                      {s.entry && (
                        <div>
                          <span className="font-bold text-ceda-ink text-sm block">{s.entry.title}</span>
                          <span className="text-[11px] text-ceda-copper font-mono">Dossier: {s.entry.referenceCode}</span>
                        </div>
                      )}
                      {!s.instance && !s.entry && (
                        <span className="font-semibold text-ceda-ink">General Innovation Portal Announcements</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 font-semibold text-ceda-ink">
                        {s.channel === "EMAIL" ? (
                          <Mail size={12} className="text-blue-600" />
                        ) : s.channel === "SMS" ? (
                          <Smartphone size={12} className="text-emerald-600" />
                        ) : (
                          <Bell size={12} className="text-ceda-orange" />
                        )}
                        <span>{s.channel}</span>
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
                        <CheckCircle2 size={12} /> Active
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-ceda-slate">
                      {formatDate(s.createdAt)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => handleUnsubscribe(s.id)}
                        disabled={unsubscribingId === s.id}
                        className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50 transition disabled:opacity-50"
                      >
                        {unsubscribingId === s.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                        <span>Unsubscribe</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
