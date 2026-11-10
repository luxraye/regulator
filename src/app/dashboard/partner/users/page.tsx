"use client";

import { useEffect, useState } from "react";
import { Users, Plus, ShieldCheck, Mail, Phone, Briefcase, Loader2, X } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface TeamUser {
  id: string;
  email: string;
  name: string;
  role: string;
  expertise?: string | null;
  phone?: string | null;
  createdAt: string;
}

export default function PartnerUsersPage() {
  const [users, setUsers] = useState<TeamUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("EVALUATOR");
  const [expertise, setExpertise] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/partner/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (e) {
      console.error("Error loading partner team:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/partner/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, role, expertise, phone }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create team member");
      }

      setShowModal(false);
      setName("");
      setEmail("");
      setExpertise("");
      setPhone("");
      await fetchUsers();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-ceda-slate">
            <span>Partner Workspace</span>
            <span>•</span>
            <span className="font-semibold text-ceda-copper">Governance</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-ceda-ink sm:text-3xl">
            Team Members & Evaluator Panel
          </h1>
          <p className="mt-1 text-xs text-ceda-slate sm:text-sm">
            Manage your partner organization&apos;s administrators, adjudicators, and domain evaluators.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-ceda-ink px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-black transition"
        >
          <Plus size={16} />
          <span>Add Team Member</span>
        </button>
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="animate-spin text-ceda-orange" size={24} />
        </div>
      ) : users.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-white p-12 text-center">
          <Users size={32} className="mx-auto text-ceda-slate mb-3" />
          <h3 className="font-bold text-ceda-ink">No team members registered yet</h3>
          <p className="text-xs text-ceda-slate mt-1 max-w-md mx-auto">
            Invite domain evaluators and administrators to assign scorecards and oversee applications for your partner instances.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-ceda-slate border-b border-border">
                <tr>
                  <th className="px-5 py-3 font-semibold">Name & Contact</th>
                  <th className="px-5 py-3 font-semibold">Assigned Role</th>
                  <th className="px-5 py-3 font-semibold">Domain Expertise</th>
                  <th className="px-5 py-3 font-semibold">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-ceda-ink text-sm">{u.name}</div>
                      <div className="flex items-center gap-2 text-ceda-slate mt-0.5">
                        <span className="flex items-center gap-1 font-mono text-[11px]">
                          <Mail size={12} /> {u.email}
                        </span>
                        {u.phone && (
                          <span className="flex items-center gap-1 text-[11px]">
                            <Phone size={12} /> {u.phone}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1 rounded-full bg-ceda-sand px-2.5 py-0.5 font-bold text-ceda-copper text-[11px]">
                        <ShieldCheck size={12} />
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-ceda-slate">
                      {u.expertise ? (
                        <span className="flex items-center gap-1">
                          <Briefcase size={12} className="text-ceda-copper shrink-0" />
                          <span>{u.expertise}</span>
                        </span>
                      ) : (
                        <span className="text-muted-foreground italic">General</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-ceda-slate">
                      {formatDate(u.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fadeIn">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-ceda-ink text-base">Add Partner Team Member</h3>
              <button onClick={() => setShowModal(false)} className="text-ceda-slate hover:text-black">
                <X size={18} />
              </button>
            </div>

            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
                {error}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-ceda-ink mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Kagiso Moeti"
                  className="w-full rounded-xl border border-border px-3 py-2 text-ceda-ink focus:ring-2 focus:ring-ceda-orange focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-ceda-ink mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@partner.org.bw"
                  className="w-full rounded-xl border border-border px-3 py-2 text-ceda-ink focus:ring-2 focus:ring-ceda-orange focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-ceda-ink mb-1">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full rounded-xl border border-border px-3 py-2 text-ceda-ink focus:ring-2 focus:ring-ceda-orange focus:outline-none bg-white"
                >
                  <option value="EVALUATOR">Domain Evaluator (Scorecard Reviews)</option>
                  <option value="ADJUDICATOR">Adjudicator (Shortlisting & Decisions)</option>
                  <option value="PARTNER_ADMIN">Partner Admin (Space & Instance Oversight)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-ceda-ink mb-1">Domain Expertise (Optional)</label>
                <input
                  type="text"
                  value={expertise}
                  onChange={(e) => setExpertise(e.target.value)}
                  placeholder="e.g. Artificial Intelligence, 5G, Smart Agriculture"
                  className="w-full rounded-xl border border-border px-3 py-2 text-ceda-ink focus:ring-2 focus:ring-ceda-orange focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-ceda-ink mb-1">Phone Number (Optional)</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+267 71 234 567"
                  className="w-full rounded-xl border border-border px-3 py-2 text-ceda-ink focus:ring-2 focus:ring-ceda-orange focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-border px-4 py-2 font-semibold text-ceda-slate hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-ceda-ink px-4 py-2 font-bold text-white shadow hover:bg-black transition disabled:opacity-60"
                >
                  {submitting && <Loader2 size={14} className="animate-spin" />}
                  <span>Add Member</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
