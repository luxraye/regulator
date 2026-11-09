import Link from "next/link";
import type { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { roleLabels } from "@/lib/labels";
import { cn, formatDate } from "@/lib/utils";
import { RoleSelect } from "./role-select";
import { AddStaff } from "./add-staff";

export const dynamic = "force-dynamic";

const ROLES: Role[] = ["INNOVATOR", "EVALUATOR", "ADJUDICATOR", "ADMIN", "SUPERADMIN"];

export default async function UsersPage({ searchParams }: { searchParams: { role?: string } }) {
  const me = await getSessionUser();
  const role = ROLES.find((r) => r === searchParams.role);
  const [users, counts] = await Promise.all([
    prisma.user.findMany({
      where: role ? { role } : {},
      orderBy: [{ role: "desc" }, { name: "asc" }],
      select: { id: true, name: true, email: true, role: true, organizationName: true, expertise: true, district: true, createdAt: true },
    }),
    prisma.user.groupBy({ by: ["role"], _count: true }),
  ]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ceda-ink">People &amp; roles</h1>
          <p className="mt-1 text-muted-foreground">Innovators register themselves. Add evaluators, adjudicators and programme staff here.</p>
        </div>
        <AddStaff />
      </div>

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        <Link href="/dashboard/superadmin/users" className={cn("whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium", !role ? "border-ceda-ink bg-ceda-ink text-white" : "border-border bg-white")}>
          Everyone <span className="opacity-60">{counts.reduce((a, c) => a + c._count, 0)}</span>
        </Link>
        {ROLES.map((r) => (
          <Link key={r} href={`/dashboard/superadmin/users?role=${r}`} className={cn("whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium", role === r ? "border-ceda-ink bg-ceda-ink text-white" : "border-border bg-white hover:bg-ceda-sand")}>
            {roleLabels[r]} <span className="opacity-60">{counts.find((c) => c.role === r)?._count ?? 0}</span>
          </Link>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-white">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Role</th>
              <th className="px-5 py-3 font-medium">Company or expertise</th>
              <th className="px-5 py-3 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-ceda-sand/50">
                <td className="px-5 py-3">
                  <p className="font-medium">{u.name}</p>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                </td>
                <td className="px-5 py-3"><RoleSelect userId={u.id} role={u.role} disabled={u.id === me?.id} /></td>
                <td className="px-5 py-3 text-muted-foreground">
                  {u.role === "INNOVATOR" ? [u.organizationName, u.district].filter(Boolean).join(" · ") || "—" : u.expertise || "—"}
                </td>
                <td className="px-5 py-3 text-muted-foreground">{formatDate(u.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
