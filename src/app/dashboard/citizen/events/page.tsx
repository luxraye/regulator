"use client";

import { useEffect, useState } from "react";
import { Star, Plus, Trash2, Calendar, ExternalLink } from "lucide-react";

interface StarredEventItem {
  id: string;
  title: string;
  date: string | null;
  url: string | null;
  notes: string | null;
  createdAt: string;
}

export default function CitizenEventsPage() {
  const [events, setEvents] = useState<StarredEventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: "", date: "", url: "", notes: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    setLoading(true);
    const res = await fetch("/api/starred-events");
    if (res.ok) setEvents(await res.json());
    setLoading(false);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/starred-events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        date: form.date || null,
        url: form.url || null,
        notes: form.notes || null,
      }),
    });
    setSaving(false);
    if (res.ok) {
      setForm({ title: "", date: "", url: "", notes: "" });
      setShowAdd(false);
      loadEvents();
    }
  }

  async function handleDelete(id: string) {
    await fetch(`/api/starred-events/${id}`, { method: "DELETE" });
    setEvents((prev) => prev.filter((e) => e.id !== id));
  }

  const upcoming = events
    .filter((e) => e.date && new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime());
  const past = events.filter((e) => !e.date || new Date(e.date) < new Date());

  return (
    <div className="max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-bocra-navy">Starred Events</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Keep track of BOCRA events, consultations, and deadlines
          </p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-bocra-navy text-white rounded-lg text-sm font-medium hover:bg-bocra-navy/90 active:scale-[0.98] transition-all w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          Star an Event
        </button>
      </div>

      {showAdd && (
        <form
          onSubmit={handleAdd}
          className="bg-white rounded-xl border border-border p-5 mb-6 space-y-3"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Event title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-bocra-blue"
              required
            />
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-bocra-blue"
            />
          </div>
          <input
            type="url"
            placeholder="Related URL (optional)"
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-bocra-blue"
          />
          <textarea
            placeholder="Notes (optional)"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-bocra-blue resize-none"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-bocra-blue text-white rounded-lg text-sm font-medium hover:bg-bocra-blue/90 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Event"}
            </button>
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              className="px-4 py-2 text-muted-foreground rounded-lg text-sm hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-16 text-muted-foreground">Loading...</div>
      ) : events.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-border">
          <Star className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium text-bocra-navy">No starred events</p>
          <p className="text-sm text-muted-foreground mt-1">
            Star BOCRA events and consultations to keep track of them here.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {upcoming.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-bocra-navy uppercase tracking-wider mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-bocra-blue" />
                Upcoming
              </h2>
              <div className="space-y-2">
                {upcoming.map((evt) => (
                  <EventCard key={evt.id} event={evt} onDelete={handleDelete} />
                ))}
              </div>
            </div>
          )}
          {past.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                {upcoming.length > 0 ? "Past / Undated" : "All Events"}
              </h2>
              <div className="space-y-2">
                {past.map((evt) => (
                  <EventCard key={evt.id} event={evt} onDelete={handleDelete} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function EventCard({
  event,
  onDelete,
}: {
  event: StarredEventItem;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="bg-white rounded-xl border border-border p-4 flex items-start justify-between gap-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <Star className="w-4 h-4 text-amber-500 mt-0.5 shrink-0 fill-amber-500" />
        <div className="min-w-0">
          <p className="font-medium text-sm text-bocra-navy">{event.title}</p>
          {event.date && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {new Date(event.date).toLocaleDateString("en-BW", {
                weekday: "short",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          )}
          {event.notes && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{event.notes}</p>
          )}
          {event.url && (
            <a
              href={event.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-bocra-blue hover:underline inline-flex items-center gap-1 mt-1"
            >
              View details <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
      <button
        onClick={() => onDelete(event.id)}
        className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
        title="Remove event"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
