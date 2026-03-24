const STORAGE_KEY = "bocra-offline-complaints";

export interface OfflineComplaint {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  provider: string;
  category: string;
  subject: string;
  details: string;
  anonymous: boolean;
  savedAt: string;
}

export function saveOfflineComplaint(complaint: Omit<OfflineComplaint, "id" | "savedAt">): OfflineComplaint {
  const entry: OfflineComplaint = {
    ...complaint,
    id: crypto.randomUUID?.() ?? `offline-${Date.now()}`,
    savedAt: new Date().toISOString(),
  };
  const existing = getOfflineComplaints();
  existing.push(entry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  return entry;
}

export function getOfflineComplaints(): OfflineComplaint[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function removeOfflineComplaint(id: string) {
  const remaining = getOfflineComplaints().filter((c) => c.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));
}

export async function submitOfflineComplaint(complaint: OfflineComplaint): Promise<boolean> {
  try {
    const res = await fetch("/api/complaints", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: complaint.anonymous ? undefined : complaint.fullName,
        email: complaint.anonymous ? undefined : complaint.email,
        phone: complaint.anonymous ? undefined : complaint.phone,
        provider: complaint.provider,
        category: complaint.category,
        subject: complaint.subject,
        details: complaint.details,
        anonymous: complaint.anonymous,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function flushOfflineComplaints(): Promise<number> {
  const complaints = getOfflineComplaints();
  if (complaints.length === 0) return 0;

  let submitted = 0;
  for (const c of complaints) {
    const ok = await submitOfflineComplaint(c);
    if (ok) {
      removeOfflineComplaint(c.id);
      submitted++;
    }
  }
  return submitted;
}
