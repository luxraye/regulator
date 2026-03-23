"use client";

import { useEffect, useState } from "react";
import { Bookmark, Plus, Trash2, ExternalLink, FolderOpen } from "lucide-react";

interface BookmarkItem {
  id: string;
  title: string;
  url: string;
  category: string | null;
  createdAt: string;
}

export default function CitizenBookmarksPage() {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newBm, setNewBm] = useState({ title: "", url: "", category: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadBookmarks();
  }, []);

  async function loadBookmarks() {
    setLoading(true);
    const res = await fetch("/api/bookmarks");
    if (res.ok) setBookmarks(await res.json());
    setLoading(false);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/bookmarks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newBm),
    });
    setSaving(false);
    if (res.ok) {
      setNewBm({ title: "", url: "", category: "" });
      setShowAdd(false);
      loadBookmarks();
    }
  }

  async function handleDelete(id: string) {
    await fetch(`/api/bookmarks/${id}`, { method: "DELETE" });
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  }

  const grouped = bookmarks.reduce<Record<string, BookmarkItem[]>>((acc, bm) => {
    const cat = bm.category || "General";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(bm);
    return acc;
  }, {});

  return (
    <div className="p-6 lg:p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-bocra-navy">Bookmarks</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Save BOCRA documents, pages, and resources for quick access
          </p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-bocra-navy text-white rounded-lg text-sm font-medium hover:bg-bocra-navy/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Bookmark
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <form
          onSubmit={handleAdd}
          className="bg-white rounded-xl border border-border p-5 mb-6 space-y-3"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Title"
              value={newBm.title}
              onChange={(e) => setNewBm({ ...newBm, title: e.target.value })}
              className="px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-bocra-blue"
              required
            />
            <input
              type="url"
              placeholder="URL (https://...)"
              value={newBm.url}
              onChange={(e) => setNewBm({ ...newBm, url: e.target.value })}
              className="px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-bocra-blue"
              required
            />
            <input
              type="text"
              placeholder="Category (optional)"
              value={newBm.category}
              onChange={(e) => setNewBm({ ...newBm, category: e.target.value })}
              className="px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-bocra-blue"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-bocra-blue text-white rounded-lg text-sm font-medium hover:bg-bocra-blue/90 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Bookmark"}
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
      ) : bookmarks.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-border">
          <Bookmark className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium text-bocra-navy">No bookmarks yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Save BOCRA documents and resources here for quick access.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([cat, items]) => (
            <div key={cat}>
              <div className="flex items-center gap-2 mb-3">
                <FolderOpen className="w-4 h-4 text-bocra-blue" />
                <h2 className="text-sm font-semibold text-bocra-navy uppercase tracking-wider">
                  {cat}
                </h2>
                <span className="text-xs text-muted-foreground">({items.length})</span>
              </div>
              <div className="space-y-2">
                {items.map((bm) => (
                  <div
                    key={bm.id}
                    className="bg-white rounded-xl border border-border p-4 flex items-center justify-between gap-4 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex-1 min-w-0">
                      <a
                        href={bm.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-sm text-bocra-navy hover:text-bocra-blue transition-colors inline-flex items-center gap-1"
                      >
                        {bm.title}
                        <ExternalLink className="w-3 h-3 opacity-50" />
                      </a>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{bm.url}</p>
                    </div>
                    <button
                      onClick={() => handleDelete(bm.id)}
                      className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                      title="Remove bookmark"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
