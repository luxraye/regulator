import { CheckCircle2, XCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { isJwtSecretConfigured } from "@/lib/jwt-sign";

export const dynamic = "force-dynamic";

/** Read-only view of how this deployment is configured. */
export default async function SettingsPage() {
  const [users, templates, instances, files, complaints, audit] = await Promise.all([
    prisma.user.count(),
    prisma.template.count(),
    prisma.instance.count(),
    prisma.instanceFile.aggregate({ _count: true, _sum: { fileSize: true } }),
    prisma.complaint.count(),
    prisma.auditLog.count(),
  ]);

  const checks = [
    { label: "Receipt signing key (JWT_SECRET)", ok: isJwtSecretConfigured(), hint: "Set JWT_SECRET so receipts can't be forged with the dev key." },
    { label: "Session secret (AUTH_SECRET / NEXTAUTH_SECRET)", ok: !!(process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET), hint: "Required for sign-in in production." },
    { label: "Database direct URL (DIRECT_URL)", ok: !!process.env.DIRECT_URL, hint: "Needed for Prisma migrations on Supabase." },
  ];

  const stats = [
    ["Users", users],
    ["Templates", templates],
    ["Instances", instances],
    ["Files stored", `${files._count} (${((files._sum.fileSize ?? 0) / 1024 / 1024).toFixed(2)} MB)`],
    ["Complaints", complaints],
    ["Audit entries", audit],
  ];

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-bocra-navy">System status</h1>
        <p className="mt-1 text-muted-foreground">How this deployment is configured. Change these through environment variables.</p>
      </div>

      <div className="space-y-6">
        <section className="rounded-xl border border-border bg-white p-6">
          <h2 className="mb-4 font-semibold text-bocra-navy">Configuration</h2>
          <ul className="space-y-3">
            {checks.map((c) => (
              <li key={c.label} className="flex items-start gap-3 text-sm">
                {c.ok ? <CheckCircle2 size={18} className="text-bocra-green" /> : <XCircle size={18} className="text-red-500" />}
                <div>
                  <p className="font-medium">{c.label}</p>
                  {!c.ok && <p className="text-xs text-muted-foreground">{c.hint}</p>}
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border border-border bg-white p-6">
          <h2 className="mb-4 font-semibold text-bocra-navy">Security model</h2>
          <dl className="space-y-2 text-sm">
            <Row k="File integrity" v="SHA-256 in browser and on server; mismatches are refused" />
            <Row k="File storage" v="Inside PostgreSQL, re-hashed on every download" />
            <Row k="Submission receipts" v="HS256-signed JWT over data hash + file hashes" />
            <Row k="Locking" v="Submitted data can't be edited; only a reviewer can reopen it" />
            <Row k="Audit log" v="Provision, submit, review, download, role and complaint changes" />
          </dl>
        </section>

        <section className="rounded-xl border border-border bg-white p-6">
          <h2 className="mb-4 font-semibold text-bocra-navy">Data</h2>
          <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
            {stats.map(([k, v]) => (
              <div key={k} className="rounded-lg bg-bocra-light p-3">
                <dt className="text-xs text-muted-foreground">{k}</dt>
                <dd className="font-semibold text-bocra-navy">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 font-mono text-xs text-muted-foreground">
            Node {process.versions.node} · Next.js 14 · Prisma 5 · Auth.js 5
          </p>
        </section>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-border pb-2 last:border-0 sm:flex-row sm:justify-between">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="font-medium sm:text-right">{v}</dd>
    </div>
  );
}
