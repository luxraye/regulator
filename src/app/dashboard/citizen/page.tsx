"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  MessageSquareWarning,
  Bookmark,
  Star,
  ArrowRight,
  FileText,
  Bell,
  Shield,
} from "lucide-react";

interface DashboardStats {
  complaints: number;
  bookmarks: number;
  events: number;
}

export default function CitizenDashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats>({ complaints: 0, bookmarks: 0, events: 0 });

  useEffect(() => {
    async function load() {
      try {
        const [cRes, bRes, eRes] = await Promise.all([
          fetch("/api/complaints/my"),
          fetch("/api/bookmarks"),
          fetch("/api/starred-events"),
        ]);
        const complaints = cRes.ok ? await cRes.json() : [];
        const bookmarks = bRes.ok ? await bRes.json() : [];
        const events = eRes.ok ? await eRes.json() : [];
        setStats({
          complaints: complaints.length,
          bookmarks: bookmarks.length,
          events: events.length,
        });
      } catch {
        // silently fail
      }
    }
    load();
  }, []);

  const quickLinks = [
    {
      icon: <MessageSquareWarning className="w-5 h-5" />,
      title: "File a Complaint",
      desc: "Report an issue with a service provider",
      href: "/complaints",
      color: "bg-red-50 text-red-600 border-red-200",
    },
    {
      icon: <FileText className="w-5 h-5" />,
      title: "Browse Documents",
      desc: "Access publications, reports, and guidelines",
      href: "/legacy",
      color: "bg-blue-50 text-blue-600 border-blue-200",
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: "Licensing Info",
      desc: "Learn about licence types and requirements",
      href: "/licensing",
      color: "bg-green-50 text-green-600 border-green-200",
    },
  ];

  return (
    <div className="max-w-6xl">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-bocra-navy">
          Welcome back, {session?.user?.name?.split(" ")[0] || "Citizen"}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Your personal BOCRA dashboard — track complaints, save documents, and stay informed.
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6 sm:mb-8">
        <Link
          href="/dashboard/citizen/complaints"
          className="bg-white rounded-xl border border-border p-3 sm:p-5 hover:shadow-md transition-shadow group active:scale-[0.98]"
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center mb-2 sm:mb-3">
            <MessageSquareWarning className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-bocra-navy">{stats.complaints}</p>
          <p className="text-[11px] sm:text-sm text-muted-foreground">Complaints</p>
        </Link>

        <Link
          href="/dashboard/citizen/bookmarks"
          className="bg-white rounded-xl border border-border p-3 sm:p-5 hover:shadow-md transition-shadow group active:scale-[0.98]"
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-2 sm:mb-3">
            <Bookmark className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-bocra-navy">{stats.bookmarks}</p>
          <p className="text-[11px] sm:text-sm text-muted-foreground">Bookmarks</p>
        </Link>

        <Link
          href="/dashboard/citizen/events"
          className="bg-white rounded-xl border border-border p-3 sm:p-5 hover:shadow-md transition-shadow group active:scale-[0.98]"
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-2 sm:mb-3">
            <Star className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-bocra-navy">{stats.events}</p>
          <p className="text-[11px] sm:text-sm text-muted-foreground">Events</p>
        </Link>
      </div>

      {/* Quick actions */}
      <h2 className="text-base sm:text-lg font-bold text-bocra-navy mb-3 sm:mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 mb-6 sm:mb-8">
        {quickLinks.map((link) => (
          <Link
            key={link.title}
            href={link.href}
            className={`flex items-center gap-3 p-4 rounded-xl border ${link.color} hover:brightness-95 active:scale-[0.98] transition-all`}
          >
            {link.icon}
            <div>
              <p className="font-medium text-sm">{link.title}</p>
              <p className="text-xs opacity-70 mt-0.5 hidden sm:block">{link.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Info banner */}
      <div className="bg-bocra-light rounded-xl border border-border p-6">
        <div className="flex items-start gap-4">
          <Bell className="w-5 h-5 text-bocra-blue mt-0.5 shrink-0" />
          <div>
            <h3 className="font-semibold text-bocra-navy text-sm">Stay Connected</h3>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
              Bookmark important BOCRA documents from the{" "}
              <Link href="/legacy" className="text-bocra-blue hover:underline">
                Legacy Services
              </Link>{" "}
              page, star upcoming events you want to follow, and track all your
              complaints in one place.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
